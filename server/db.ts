import { eq, and, or, gte, lte, desc, asc, inArray, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  maids, 
  bookings, 
  payments, 
  wallets, 
  walletTransactions,
  otpSessions,
  notifications,
  adminLogs,
  auditLogs,
  ratings,
  services,
  commissionRules,
  withdrawalRequests,
  pushTokens,
  systemConfig
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * User Management
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod", "profileImageUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * OTP Management
 */
export async function createOtpSession(phone: string, otpHash: string, salt: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(otpSessions).values({
    phone,
    otpHash,
    salt,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
  });
}

export async function getOtpSession(phone: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(otpSessions)
    .where(and(
      eq(otpSessions.phone, phone),
      gte(otpSessions.expiresAt, new Date())
    ))
    .orderBy(desc(otpSessions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function incrementOtpAttempts(otpId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const session = await db.select().from(otpSessions).where(eq(otpSessions.id, otpId)).limit(1);
  if (session.length === 0) return;

  await db.update(otpSessions)
    .set({ attempts: session[0].attempts + 1 })
    .where(eq(otpSessions.id, otpId));
}

/**
 * Maid Management
 */
export async function createMaidProfile(userId: number, bio?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(maids).values({
    userId,
    bio,
    serviceTypes: [],
  });
}

export async function getMaidByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(maids).where(eq(maids.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableMaids(serviceType?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(maids).where(eq(maids.isAvailable, true));

  if (serviceType) {
    // This would require JSON_CONTAINS in MySQL
    // For now, return all available maids
  }

  return await query;
}

/**
 * Booking Management
 */
export async function createBooking(booking: typeof bookings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookings).where(eq(bookings.bookingCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerBookings(customerId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookings)
    .where(eq(bookings.customerId, customerId))
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getMaidBookings(maidId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookings)
    .where(eq(bookings.maidId, maidId))
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
}

/**
 * Payment Management
 */
export async function createPayment(payment: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByGatewayId(gatewayId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments)
    .where(eq(payments.paymentGatewayId, gatewayId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(paymentId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(payments.id, paymentId));
}

/**
 * Wallet Management
 */
export async function createWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(wallets).values({
    userId,
    balance: "0.00",
  });
}

export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWalletBalance(walletId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(wallets)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(eq(wallets.id, walletId));
}

export async function addWalletTransaction(transaction: typeof walletTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(walletTransactions).values(transaction);
}

export async function getWalletTransactions(walletId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(walletTransactions)
    .where(eq(walletTransactions.walletId, walletId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Notification Management
 */
export async function createNotification(notification: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Push Token Management
 */
export async function savePushToken(userId: number, token: string, platform: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pushTokens).values({
    userId,
    token,
    platform: platform as any,
  });
}

export async function getUserPushTokens(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pushTokens)
    .where(and(
      eq(pushTokens.userId, userId),
      eq(pushTokens.isActive, true)
    ));
}

/**
 * Admin Logs
 */
export async function createAdminLog(log: typeof adminLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(adminLogs).values(log);
}

export async function getAdminLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(adminLogs)
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Audit Logs
 */
export async function createAuditLog(log: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Ratings
 */
export async function createRating(rating: typeof ratings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(ratings).values(rating);
}

export async function getMaidRatings(maidId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ratings).where(eq(ratings.maidId, maidId));
}

/**
 * Services
 */
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(services).where(eq(services.isActive, true));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Commission Rules
 */
export async function getActiveCommissionRule(serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(commissionRules)
    .where(and(
      eq(commissionRules.serviceId, serviceId),
      eq(commissionRules.isActive, true),
      lte(commissionRules.effectiveFrom, new Date()),
      or(
        isNull(commissionRules.effectiveTo),
        gte(commissionRules.effectiveTo, new Date())
      )
    ))
    .orderBy(desc(commissionRules.effectiveFrom))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * System Configuration
 */
export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(key: string, value: string, type = "string", description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSystemConfig(key);
  
  if (existing) {
    await db.update(systemConfig)
      .set({ value, type: type as any, updatedAt: new Date() })
      .where(eq(systemConfig.key, key));
  } else {
    await db.insert(systemConfig).values({
      key,
      value,
      type: type as any,
      description,
    });
  }
}

/**
 * Withdrawal Requests
 */
export async function createWithdrawalRequest(request: typeof withdrawalRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(withdrawalRequests).values(request);
}

export async function getPendingWithdrawalRequests() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(withdrawalRequests)
    .where(eq(withdrawalRequests.status, "pending"))
    .orderBy(asc(withdrawalRequests.createdAt));
}

export async function updateWithdrawalStatus(requestId: number, status: string, approvedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(withdrawalRequests)
    .set({ 
      status: status as any, 
      approvedBy,
      processedAt: new Date(),
      updatedAt: new Date() 
    })
    .where(eq(withdrawalRequests.id, requestId));
}

/**
 * Analytics Helpers
 */
export async function getBookingStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(bookings)
    .where(and(
      gte(bookings.createdAt, startDate),
      lte(bookings.createdAt, endDate)
    ));

  return {
    total: result.length,
    completed: result.filter(b => b.status === "completed").length,
    cancelled: result.filter(b => b.status === "cancelled").length,
    pending: result.filter(b => b.status === "pending").length,
  };
}

export async function getRevenueStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(payments)
    .where(and(
      gte(payments.createdAt, startDate),
      lte(payments.createdAt, endDate),
      eq(payments.status, "completed")
    ));

  const totalAmount = result.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  return {
    totalTransactions: result.length,
    totalRevenue: totalAmount,
    averageTransaction: result.length > 0 ? totalAmount / result.length : 0,
  };
}
