CREATE TABLE `adminLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`changes` json,
	`reason` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`eventData` json,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`ipAddress` varchar(45),
	`userAgent` text,
	`isImmutable` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingCode` varchar(20) NOT NULL,
	`customerId` int NOT NULL,
	`maidId` int,
	`serviceId` int NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`scheduledEndDate` timestamp,
	`duration` int,
	`location` text NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`specialRequests` text,
	`status` enum('pending','accepted','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`quotedPrice` decimal(10,2) NOT NULL,
	`finalPrice` decimal(10,2),
	`notes` text,
	`cancelledBy` enum('customer','maid','admin'),
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingCode_unique` UNIQUE(`bookingCode`)
);
--> statement-breakpoint
CREATE TABLE `commissionRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`commissionPercentage` decimal(5,2) NOT NULL,
	`platformFeePercentage` decimal(5,2) DEFAULT '0.00',
	`gstPercentage` decimal(5,2) DEFAULT '18.00',
	`minAmount` decimal(10,2) DEFAULT '0.00',
	`maxAmount` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`effectiveFrom` timestamp NOT NULL,
	`effectiveTo` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bio` text,
	`experience` int,
	`rating` decimal(3,2) DEFAULT '0.00',
	`totalJobs` int DEFAULT 0,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`availabilityStartTime` varchar(5),
	`availabilityEndTime` varchar(5),
	`serviceTypes` json,
	`verificationStatus` enum('pending','verified','rejected') DEFAULT 'pending',
	`backgroundCheckStatus` enum('pending','passed','failed') DEFAULT 'pending',
	`documents` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maids_id` PRIMARY KEY(`id`),
	CONSTRAINT `maids_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('booking_confirmed','booking_cancelled','job_alert','job_accepted','job_completed','payment_received','payment_failed','rating_received','system_alert','admin_notification') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` json,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otpSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`otpHash` varchar(255) NOT NULL,
	`salt` varchar(255) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 5,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`customerId` int NOT NULL,
	`maidId` int,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'INR',
	`paymentMethod` enum('razorpay','stripe','wallet') NOT NULL,
	`paymentGatewayId` varchar(100),
	`status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(100),
	`refundAmount` decimal(10,2),
	`refundReason` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `pushTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(500) NOT NULL,
	`platform` enum('ios','android','web') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`maidId` int NOT NULL,
	`customerId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`isAnonymous` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratings_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`basePrice` decimal(10,2) NOT NULL,
	`commissionPercentage` decimal(5,2) DEFAULT '20.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`type` enum('string','number','boolean','json') DEFAULT 'string',
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `walletTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('credit','debit','refund','withdrawal','commission_deduction') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`bookingId` int,
	`paymentId` int,
	`balanceBefore` decimal(10,2) NOT NULL,
	`balanceAfter` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalEarnings` decimal(10,2) DEFAULT '0.00',
	`totalWithdrawn` decimal(10,2) DEFAULT '0.00',
	`totalRefunded` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `withdrawalRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maidId` int NOT NULL,
	`walletId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`bankAccountNumber` varchar(20),
	`bankIFSC` varchar(11),
	`bankName` varchar(100),
	`status` enum('pending','approved','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`rejectionReason` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawalRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('customer','maid','admin','super_admin') NOT NULL DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImageUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);--> statement-breakpoint
CREATE INDEX `adminId_idx` ON `adminLogs` (`adminId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `adminLogs` (`action`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `adminLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `auditLogs` (`eventType`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `auditLogs` (`severity`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `customerId_idx` ON `bookings` (`customerId`);--> statement-breakpoint
CREATE INDEX `maidId_idx` ON `bookings` (`maidId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `scheduledDate_idx` ON `bookings` (`scheduledDate`);--> statement-breakpoint
CREATE INDEX `bookingCode_idx` ON `bookings` (`bookingCode`);--> statement-breakpoint
CREATE INDEX `serviceId_idx` ON `commissionRules` (`serviceId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `maids` (`userId`);--> statement-breakpoint
CREATE INDEX `isAvailable_idx` ON `maids` (`isAvailable`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `otpSessions` (`phone`);--> statement-breakpoint
CREATE INDEX `expiresAt_idx` ON `otpSessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `bookingId_idx` ON `payments` (`bookingId`);--> statement-breakpoint
CREATE INDEX `customerId_idx` ON `payments` (`customerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `pushTokens` (`userId`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `pushTokens` (`token`);--> statement-breakpoint
CREATE INDEX `maidId_idx` ON `ratings` (`maidId`);--> statement-breakpoint
CREATE INDEX `customerId_idx` ON `ratings` (`customerId`);--> statement-breakpoint
CREATE INDEX `key_idx` ON `systemConfig` (`key`);--> statement-breakpoint
CREATE INDEX `walletId_idx` ON `walletTransactions` (`walletId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `walletTransactions` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `walletTransactions` (`type`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `wallets` (`userId`);--> statement-breakpoint
CREATE INDEX `maidId_idx` ON `withdrawalRequests` (`maidId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `withdrawalRequests` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);