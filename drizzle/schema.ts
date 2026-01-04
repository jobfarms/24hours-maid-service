import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  bigint,
  index,
  unique
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table with role-based access control
 * Supports customer, maid, admin, and super admin roles
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  role: mysqlEnum("role", ["customer", "maid", "admin", "super_admin"]).default("customer").notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }), // "otp", "google"
  profileImageUrl: text("profileImageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  phoneIdx: index("phone_idx").on(table.phone),
  roleIdx: index("role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OTP sessions for mobile authentication
 * Stores hashed OTP with expiration
 */
export const otpSessions = mysqlTable("otpSessions", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  otpHash: varchar("otpHash", { length: 255 }).notNull(), // SHA-256 hashed
  salt: varchar("salt", { length: 255 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(5).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index("phone_idx").on(table.phone),
  expiresAtIdx: index("expiresAt_idx").on(table.expiresAt),
}));

export type OtpSession = typeof otpSessions.$inferSelect;
export type InsertOtpSession = typeof otpSessions.$inferInsert;

/**
 * Maid profiles with availability and service information
 */
export const maids = mysqlTable("maids", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  bio: text("bio"),
  experience: int("experience"), // years of experience
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalJobs: int("totalJobs").default(0),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  availabilityStartTime: varchar("availabilityStartTime", { length: 5 }), // HH:MM format
  availabilityEndTime: varchar("availabilityEndTime", { length: 5 }), // HH:MM format
  serviceTypes: json("serviceTypes").$type<string[]>(), // ["maid", "babysitter", "caretaker"]
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending"),
  backgroundCheckStatus: mysqlEnum("backgroundCheckStatus", ["pending", "passed", "failed"]).default("pending"),
  documents: json("documents").$type<{url: string; type: string}[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  availabilityIdx: index("isAvailable_idx").on(table.isAvailable),
}));

export type Maid = typeof maids.$inferSelect;
export type InsertMaid = typeof maids.$inferInsert;

/**
 * Service types offered on the platform
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(), // "maid", "babysitter", "caretaker"
  description: text("description"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("20.00"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Bookings table - core transaction record
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingCode: varchar("bookingCode", { length: 20 }).notNull().unique(), // Unique booking reference
  customerId: int("customerId").notNull(),
  maidId: int("maidId"),
  serviceId: int("serviceId").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  scheduledEndDate: timestamp("scheduledEndDate"),
  duration: int("duration"), // in minutes
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  specialRequests: text("specialRequests"),
  status: mysqlEnum("status", [
    "pending",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
    "no_show"
  ]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded"
  ]).default("pending").notNull(),
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("finalPrice", { precision: 10, scale: 2 }),
  notes: text("notes"),
  cancelledBy: mysqlEnum("cancelledBy", ["customer", "maid", "admin"]),
  cancellationReason: text("cancellationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerIdIdx: index("customerId_idx").on(table.customerId),
  maidIdIdx: index("maidId_idx").on(table.maidId),
  statusIdx: index("status_idx").on(table.status),
  scheduledDateIdx: index("scheduledDate_idx").on(table.scheduledDate),
  bookingCodeIdx: index("bookingCode_idx").on(table.bookingCode),
}));

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Payment records for all transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  customerId: int("customerId").notNull(),
  maidId: int("maidId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  paymentMethod: mysqlEnum("paymentMethod", ["razorpay", "stripe", "wallet"]).notNull(),
  paymentGatewayId: varchar("paymentGatewayId", { length: 100 }), // Razorpay/Stripe payment ID
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 100 }).unique(),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }),
  refundReason: text("refundReason"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  bookingIdIdx: index("bookingId_idx").on(table.bookingId),
  customerIdIdx: index("customerId_idx").on(table.customerId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Wallet system for maids and customers
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0.00"),
  totalWithdrawn: decimal("totalWithdrawn", { precision: 10, scale: 2 }).default("0.00"),
  totalRefunded: decimal("totalRefunded", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Wallet transactions for audit trail
 */
export const walletTransactions = mysqlTable("walletTransactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["credit", "debit", "refund", "withdrawal", "commission_deduction"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  bookingId: int("bookingId"),
  paymentId: int("paymentId"),
  balanceBefore: decimal("balanceBefore", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  walletIdIdx: index("walletId_idx").on(table.walletId),
  userIdIdx: index("userId_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
}));

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Ratings and reviews for maids
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull().unique(),
  maidId: int("maidId").notNull(),
  customerId: int("customerId").notNull(),
  rating: int("rating").notNull(), // 1-5
  review: text("review"),
  isAnonymous: boolean("isAnonymous").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  maidIdIdx: index("maidId_idx").on(table.maidId),
  customerIdIdx: index("customerId_idx").on(table.customerId),
}));

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Admin logs for audit trail
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // "user_created", "booking_cancelled", etc.
  entityType: varchar("entityType", { length: 50 }).notNull(), // "user", "booking", "payment"
  entityId: int("entityId"),
  changes: json("changes").$type<Record<string, any>>(),
  reason: text("reason"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  adminIdIdx: index("adminId_idx").on(table.adminId),
  actionIdx: index("action_idx").on(table.action),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * System audit logs for security
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 100 }).notNull(), // "login", "payment_processed", "role_changed"
  eventData: json("eventData").$type<Record<string, any>>(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  isImmutable: boolean("isImmutable").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  eventTypeIdx: index("eventType_idx").on(table.eventType),
  severityIdx: index("severity_idx").on(table.severity),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * System configuration for super admin
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyIdx: index("key_idx").on(table.key),
}));

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * Commission and pricing rules
 */
export const commissionRules = mysqlTable("commissionRules", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  platformFeePercentage: decimal("platformFeePercentage", { precision: 5, scale: 2 }).default("0.00"),
  gstPercentage: decimal("gstPercentage", { precision: 5, scale: 2 }).default("18.00"),
  minAmount: decimal("minAmount", { precision: 10, scale: 2 }).default("0.00"),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  effectiveFrom: timestamp("effectiveFrom").notNull(),
  effectiveTo: timestamp("effectiveTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serviceIdIdx: index("serviceId_idx").on(table.serviceId),
}));

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = typeof commissionRules.$inferInsert;

/**
 * Notifications for all user types
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "booking_confirmed",
    "booking_cancelled",
    "job_alert",
    "job_accepted",
    "job_completed",
    "payment_received",
    "payment_failed",
    "rating_received",
    "system_alert",
    "admin_notification"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: json("data").$type<Record<string, any>>(),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.type),
  isReadIdx: index("isRead_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Push notification tokens for mobile
 */
export const pushTokens = mysqlTable("pushTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  platform: mysqlEnum("platform", ["ios", "android", "web"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  tokenIdx: index("token_idx").on(table.token),
}));

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

/**
 * Withdrawal requests from maids
 */
export const withdrawalRequests = mysqlTable("withdrawalRequests", {
  id: int("id").autoincrement().primaryKey(),
  maidId: int("maidId").notNull(),
  walletId: int("walletId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankAccountNumber: varchar("bankAccountNumber", { length: 20 }),
  bankIFSC: varchar("bankIFSC", { length: 11 }),
  bankName: varchar("bankName", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "processing", "completed", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  rejectionReason: text("rejectionReason"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  maidIdIdx: index("maidId_idx").on(table.maidId),
  statusIdx: index("status_idx").on(table.status),
}));

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

/**
 * Relations for type safety
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  maidProfile: one(maids, {
    fields: [users.id],
    references: [maids.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  bookingsAsCustomer: many(bookings, {
    relationName: "customerBookings",
  }),
  bookingsAsMaid: many(bookings, {
    relationName: "maidBookings",
  }),
  payments: many(payments),
  ratings: many(ratings),
  notifications: many(notifications),
  adminLogs: many(adminLogs),
  auditLogs: many(auditLogs),
}));

export const maidsRelations = relations(maids, ({ one, many }) => ({
  user: one(users, {
    fields: [maids.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  ratings: many(ratings),
  withdrawalRequests: many(withdrawalRequests),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: "customerBookings",
  }),
  maid: one(maids, {
    fields: [bookings.maidId],
    references: [maids.id],
    relationName: "maidBookings",
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  payments: many(payments),
  ratings: many(ratings),
  walletTransactions: many(walletTransactions),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [payments.customerId],
    references: [users.id],
  }),
  maid: one(maids, {
    fields: [payments.maidId],
    references: [maids.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
  withdrawalRequests: many(withdrawalRequests),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  booking: one(bookings, {
    fields: [ratings.bookingId],
    references: [bookings.id],
  }),
  maid: one(maids, {
    fields: [ratings.maidId],
    references: [maids.id],
  }),
  customer: one(users, {
    fields: [ratings.customerId],
    references: [users.id],
  }),
}));
