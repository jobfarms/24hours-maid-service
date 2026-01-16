# 24Hours Maid Services - Deployment Guide

## Project Overview

**24Hours Maid Services** is a production-ready hybrid mobile application built with:
- **Frontend**: React 19 + Tailwind CSS 4 + Framer Motion
- **Backend**: Express.js + tRPC + JWT Authentication
- **Database**: MySQL/TiDB with Drizzle ORM
- **Mobile**: CapacitorJS (Android APK + PWA)
- **UI/UX**: Dark mode futuristic design with glassmorphism effects

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MySQL/TiDB database
- Android SDK (for APK builds)
- Git for version control

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Architecture

### Database Schema (16 Tables)
- **users**: Multi-role user system (customer, maid, admin, super_admin)
- **maids**: Maid profiles with verification and availability
- **bookings**: Service bookings with pricing and status tracking
- **payments**: Payment records for Razorpay and Stripe
- **wallets**: Maid earnings and balance management
- **otpSessions**: OTP authentication tracking
- **ratings**: Customer feedback and maid ratings
- **adminLogs**: Audit trail for admin actions
- **systemConfig**: Super admin configuration controls
- **pushTokens**: Mobile push notification tokens
- **withdrawalRequests**: Maid payout management
- **commissionRules**: Dynamic pricing and commission configuration
- **services**: Available service types and pricing
- **userSessions**: JWT session management
- **notifications**: Real-time notification system
- **auditLogs**: System-wide audit trail

### API Routes

**Authentication**
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and login
- `POST /api/auth/logout` - Logout

**Bookings**
- `GET /api/bookings/services` - List available services
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/history` - Get booking history
- `POST /api/bookings/accept` - Accept booking (maid)
- `POST /api/bookings/complete` - Mark booking complete

**Payments**
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

**Maid Management**
- `GET /api/maid/profile` - Get maid profile
- `POST /api/maid/availability` - Toggle availability
- `GET /api/maid/earnings` - Get earnings summary
- `POST /api/maid/withdraw` - Request withdrawal

**Admin**
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - User management
- `POST /api/admin/config` - System configuration

## Deployment Strategies

### Strategy 1: Manus Platform (Recommended)
The project is optimized for Manus hosting:
1. Click "Publish" in the Management UI
2. Configure custom domain in Settings → Domains
3. Enable SSL/HTTPS automatically
4. Database and backend are managed

### Strategy 2: Self-Hosted (VPS/Render)

#### Backend Deployment
```bash
# Build production bundle
pnpm build

# Deploy to VPS/Render
# Set environment variables:
# - DATABASE_URL: MySQL connection string
# - JWT_SECRET: Secure random string
# - NODE_ENV: production

# Start server
NODE_ENV=production node dist/index.js
```

#### Frontend Deployment (Vercel/Netlify)
```bash
# Build static files
pnpm build

# Deploy dist/ folder to Vercel/Netlify
# Configure environment variables for API endpoint
```

### Strategy 3: Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Mobile Deployment

### Android APK Build

```bash
# Build APK (debug)
bash scripts/build-android.sh

# Build APK (release)
cd android
./gradlew assembleRelease
cd ..

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS Build
```bash
npx cap open ios
# Build in Xcode
```

### PWA Deployment
The app includes PWA support:
- Installable on home screen
- Offline support with Service Worker
- Push notifications enabled
- Works on all modern browsers

## Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-secret-key-here
NODE_ENV=production
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=24Hours Maid Services
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE maid_services;"

# Run migrations
pnpm db:push

# Seed initial data (optional)
node scripts/seed-db.mjs
```

## Security Considerations

✅ **Implemented**
- JWT token-based authentication
- OTP verification for login
- Role-based access control (RBAC)
- Password hashing with bcrypt
- HTTPS/SSL encryption
- CORS protection
- Rate limiting on API endpoints
- Audit logging for admin actions
- Secure payment processing

⚠️ **Additional Recommendations**
- Enable 2FA for admin accounts
- Regular security audits
- Keep dependencies updated
- Monitor API logs for suspicious activity
- Implement DDoS protection
- Use environment-specific secrets

## Performance Optimization

- **Frontend**: Code splitting, lazy loading, image optimization
- **Backend**: Database indexing, query optimization, caching
- **Mobile**: Offline-first architecture, minimal bundle size
- **CDN**: Static assets served from CDN for faster delivery

## Monitoring & Analytics

### Key Metrics
- Active users and bookings
- Revenue and commission tracking
- API response times
- Error rates and logs
- User engagement metrics

### Tools
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Analytics dashboard (built-in admin panel)
- Log aggregation (ELK stack)

## Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: connect ECONNREFUSED
Solution: Check DATABASE_URL and ensure MySQL is running
```

**Port Already in Use**
```
Error: listen EADDRINUSE :::3000
Solution: Kill process on port 3000 or change PORT env var
```

**Build Failures**
```
Error: TypeScript compilation failed
Solution: Run pnpm tsc --noEmit to identify issues
```

**APK Build Error**
```
Error: Gradle build failed
Solution: Ensure Android SDK is installed and ANDROID_HOME is set
```

## Support & Maintenance

### Regular Maintenance Tasks
- Weekly: Monitor error logs and performance metrics
- Monthly: Update dependencies and security patches
- Quarterly: Database optimization and cleanup
- Annually: Security audit and compliance review

### Backup Strategy
- Daily: Database backups
- Weekly: Full application backups
- Monthly: Archive to cold storage

## Scaling Considerations

For high-traffic scenarios:
1. Implement database replication
2. Use Redis for caching
3. Deploy multiple backend instances
4. Use load balancer (nginx/HAProxy)
5. Implement message queue (RabbitMQ/Kafka)
6. CDN for static assets
7. Microservices architecture for payments/notifications

## License & Support

For issues, feature requests, or support:
- GitHub Issues: [project-repo]
- Email: support@24hoursmaid.com
- Documentation: [docs-url]

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready
