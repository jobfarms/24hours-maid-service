import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { bookings, maids, users } from "../drizzle/schema";
import { z } from "zod";
import * as db from "./db";
import * as security from "./security";

/**
 * Auth Router
 */
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

/**
 * User Router - Profile and account management
 */
const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    
    const wallet = await db.getWalletByUserId(ctx.user.id);
    
    return {
      ...user,
      wallet: wallet ? { balance: wallet.balance } : null,
    };
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      profileImageUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update user profile
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");
      
      await dbInstance.update(users)
        .set({
          name: input.name,
          profileImageUrl: input.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});

/**
 * OTP Router - Authentication
 */
const otpRouter = router({
  requestOTP: publicProcedure
    .input(z.object({
      phone: z.string().min(10).max(15),
    }))
    .mutation(async ({ input }) => {
      if (!security.isValidPhone(input.phone)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid phone number",
        });
      }

      const otp = security.generateOTP();
      const salt = security.generateSalt();
      const otpHash = security.hashOTP(otp, salt);
      const expiresAt = security.getOTPExpirationTime(10);

      await db.createOtpSession(input.phone, otpHash, salt, expiresAt);

      // TODO: Send OTP via SMS using Twilio or similar service
      console.log(`[DEV] OTP for ${input.phone}: ${otp}`);

      return {
        success: true,
        message: "OTP sent to your phone",
        expiresIn: 600, // 10 minutes in seconds
      };
    }),

  verifyOTP: publicProcedure
    .input(z.object({
      phone: z.string(),
      otp: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      const session = await db.getOtpSession(input.phone);
      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OTP session not found or expired",
        });
      }

      if (session.attempts >= session.maxAttempts) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many failed attempts. Please request a new OTP.",
        });
      }

      try {
        const isValid = security.verifyOTP(input.otp, session.salt, session.otpHash);
        if (!isValid) {
          await db.incrementOtpAttempts(session.id);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid OTP",
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OTP verification failed",
        });
      }

      // Get or create user
      let user = await db.getUserByPhone(input.phone);
      if (!user) {
        await db.upsertUser({
          openId: `phone_${input.phone}`,
          phone: input.phone,
          role: "customer",
          loginMethod: "otp",
        });
        user = await db.getUserByPhone(input.phone);
        
        // Create wallet for new user
        if (user) {
          await db.createWallet(user.id);
        }
      }

      return {
        success: true,
        user,
      };
    }),
});

/**
 * Booking Router
 */
const bookingRouter = router({
  getServices: publicProcedure.query(async () => {
    return await db.getAllServices();
  }),

  createBooking: protectedProcedure
    .input(z.object({
      serviceId: z.number(),
      scheduledDate: z.date(),
      duration: z.number().min(30).max(480), // 30 mins to 8 hours
      location: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      specialRequests: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "customer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only customers can create bookings",
        });
      }

      const service = await db.getServiceById(input.serviceId);
      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      const commissionRule = await db.getActiveCommissionRule(input.serviceId);
      const priceCalc = security.calculatePrice(
        parseFloat(service.basePrice.toString()),
        commissionRule ? parseFloat(commissionRule.commissionPercentage.toString()) : 20,
        commissionRule ? parseFloat((commissionRule.platformFeePercentage || 0).toString()) : 0,
        commissionRule ? parseFloat((commissionRule.gstPercentage || 18).toString()) : 18
      );

      const bookingCode = security.generateBookingCode();

      const result = await db.createBooking({
        bookingCode,
        customerId: ctx.user.id,
        serviceId: input.serviceId,
        scheduledDate: input.scheduledDate,
        duration: input.duration,
        location: input.location,
        latitude: input.latitude?.toString(),
        longitude: input.longitude?.toString(),
        specialRequests: input.specialRequests,
        quotedPrice: priceCalc.totalAmount.toString(),
        status: "pending",
        paymentStatus: "pending",
      });

      // Create notification
      await db.createNotification({
        userId: ctx.user.id,
        type: "booking_confirmed",
        title: "Booking Created",
        message: `Your booking ${bookingCode} has been created and is awaiting confirmation.`,
        data: { bookingCode },
      });

      return {
        bookingCode,
        quotedPrice: priceCalc.totalAmount,
        priceBreakdown: priceCalc,
      };
    }),

  getBookingHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "customer") {
        return await db.getCustomerBookings(ctx.user.id, input.limit, input.offset);
      } else if (ctx.user.role === "maid") {
        const maid = await db.getMaidByUserId(ctx.user.id);
        if (!maid) throw new TRPCError({ code: "NOT_FOUND" });
        return await db.getMaidBookings(maid.id, input.limit, input.offset);
      }
      throw new TRPCError({ code: "FORBIDDEN" });
    }),

  getBookingDetails: protectedProcedure
    .input(z.object({
      bookingCode: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const booking = await db.getBookingByCode(input.bookingCode);
      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Authorization check
      const isCustomer = ctx.user.role === "customer" && booking.customerId === ctx.user.id;
      const isMaid = ctx.user.role === "maid" && booking.maidId === ctx.user.id;
      const isAdmin = ctx.user.role === "admin" || ctx.user.role === "super_admin";

      if (!isCustomer && !isMaid && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return booking;
    }),

  acceptBooking: protectedProcedure
    .input(z.object({
      bookingCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "maid") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only maids can accept bookings",
        });
      }

      const booking = await db.getBookingByCode(input.bookingCode);
      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const maid = await db.getMaidByUserId(ctx.user.id);
      if (!maid) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Maid profile not found" });
      }

      await db.updateBookingStatus(booking.id, "accepted");

      // Update maid assignment
      const dbInstance = await db.getDb();
      if (dbInstance) {
        await dbInstance.update(bookings)
          .set({ maidId: maid.id, updatedAt: new Date() })
          .where(eq(bookings.id, booking.id));
      }

      // Create notifications
      await db.createNotification({
        userId: booking.customerId,
        type: "job_accepted",
        title: "Booking Accepted",
        message: `A maid has accepted your booking ${input.bookingCode}`,
        data: { bookingCode: input.bookingCode },
      });

      return { success: true };
    }),
});

/**
 * Maid Router
 */
const maidRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "maid") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const maid = await db.getMaidByUserId(ctx.user.id);
    if (!maid) throw new TRPCError({ code: "NOT_FOUND" });

    const wallet = await db.getWalletByUserId(ctx.user.id);
    const ratings = await db.getMaidRatings(maid.id);

    return {
      ...maid,
      wallet,
      averageRating: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0,
      totalRatings: ratings.length,
    };
  }),

  updateAvailability: protectedProcedure
    .input(z.object({
      isAvailable: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "maid") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const maid = await db.getMaidByUserId(ctx.user.id);
      if (!maid) throw new TRPCError({ code: "NOT_FOUND" });

      const dbInstance = await db.getDb();
      if (dbInstance) {
        await dbInstance.update(maids)
          .set({
            isAvailable: input.isAvailable,
            availabilityStartTime: input.startTime,
            availabilityEndTime: input.endTime,
            updatedAt: new Date(),
          })
          .where(eq(maids.id, maid.id));
      }

      return { success: true };
    }),

  getEarnings: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "maid") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const wallet = await db.getWalletByUserId(ctx.user.id);
      if (!wallet) throw new TRPCError({ code: "NOT_FOUND" });

      const transactions = await db.getWalletTransactions(wallet.id, input.limit, input.offset);

      return {
        wallet,
        transactions,
      };
    }),
});

/**
 * Payment Router
 */
const paymentRouter = router({
  initiatePayment: protectedProcedure
    .input(z.object({
      bookingCode: z.string(),
      paymentMethod: z.enum(["razorpay", "stripe"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const booking = await db.getBookingByCode(input.bookingCode);
      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (booking.customerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // TODO: Integrate with Razorpay/Stripe
      // For now, create a pending payment
      await db.createPayment({
        bookingId: booking.id,
        customerId: ctx.user.id,
        amount: booking.quotedPrice!,
        paymentMethod: input.paymentMethod as any,
        status: "processing",
      });

      return {
        bookingCode: booking.bookingCode,
        amount: booking.quotedPrice,
        paymentMethod: input.paymentMethod,
      };
    }),

  confirmPayment: protectedProcedure
    .input(z.object({
      paymentId: z.number(),
      gatewayTransactionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await db.getPaymentById(input.paymentId);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (payment.customerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updatePaymentStatus(input.paymentId, "completed");

      // Update booking payment status
      const dbInstance = await db.getDb();
      if (dbInstance && payment.bookingId) {
        await dbInstance.update(bookings)
          .set({ paymentStatus: "completed", updatedAt: new Date() })
          .where(eq(bookings.id, payment.bookingId));
      }

      return { success: true };
    }),
});

/**
 * Notification Router
 */
const notificationRouter = router({
  getNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      return await db.getUserNotifications(ctx.user.id, input.limit, input.offset);
    }),

  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),
});

/**
 * Main App Router
 */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
  otp: otpRouter,
  booking: bookingRouter,
  maid: maidRouter,
  payment: paymentRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
