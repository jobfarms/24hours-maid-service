import crypto from 'crypto';

/**
 * OTP Security - SHA-256 hashing with salt
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashOTP(otp: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(otp + salt)
    .digest('hex');
}

export function verifyOTP(otp: string, salt: string, hash: string): boolean {
  const computedHash = hashOTP(otp, salt);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}

/**
 * AES-256 Encryption for sensitive data
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export function encryptData(data: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptData(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * JWT Token Management
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Password/Sensitive Field Hashing
 */
export function hashSensitiveField(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data + process.env.JWT_SECRET)
    .digest('hex');
}

/**
 * Rate Limiting Helper
 */
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // milliseconds
}

export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: RateLimitConfig) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count < this.config.maxAttempts) {
      record.count++;
      return true;
    }

    return false;
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxAttempts;
    }
    return Math.max(0, this.config.maxAttempts - record.count);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Validation Helpers
 */
export function isValidPhone(phone: string): boolean {
  // Indian phone number validation (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidBookingCode(code: string): boolean {
  // Format: BK-YYYYMMDD-XXXXX
  const codeRegex = /^BK-\d{8}-[A-Z0-9]{5}$/;
  return codeRegex.test(code);
}

export function generateBookingCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `BK-${dateStr}-${random}`;
}

/**
 * Price Calculation with Commission
 */
export interface PriceCalculation {
  basePrice: number;
  commission: number;
  platformFee: number;
  gst: number;
  totalAmount: number;
  maidAmount: number;
}

export function calculatePrice(
  basePrice: number,
  commissionPercentage: number,
  platformFeePercentage: number = 0,
  gstPercentage: number = 18
): PriceCalculation {
  const commission = (basePrice * commissionPercentage) / 100;
  const platformFee = (basePrice * platformFeePercentage) / 100;
  const subtotal = basePrice + commission + platformFee;
  const gst = (subtotal * gstPercentage) / 100;
  const totalAmount = subtotal + gst;
  const maidAmount = basePrice - commission;

  return {
    basePrice,
    commission,
    platformFee,
    gst,
    totalAmount,
    maidAmount,
  };
}

/**
 * Time Helpers
 */
export function getOTPExpirationTime(minutes = 10): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
}

export function isWithinBusinessHours(startTime: string, endTime: string): boolean {
  // Format: "HH:MM"
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Distance Calculation
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
