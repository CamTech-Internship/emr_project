# Deployment Guide

## Complete Healthcare Management System

### System Overview

This is a production-ready healthcare management system with:
- **Authentication**: JWT with HttpOnly cookies
- **RBAC**: Role-based access control (Admin, Doctor, Front Desk, Patient)
- **Database**: SQLite (dev) → PostgreSQL (production)
- **Security**: Middleware-protected routes, secure password hashing

---

## Quick Start (Development)

### 1. Environment Setup

The `.env` file has been created with a secure JWT secret. Verify it exists:

```bash
# Check .env file
cat .env
```

### 2. Database is Ready

The database has been migrated and seeded with demo data:

```
✅ Admin:      admin@demo.local / Password123!
✅ Doctor:     doctor@demo.local / Password123!
✅ Front Desk: front@demo.local / Password123!
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## User Flows

### Admin Flow
1. Login with `admin@demo.local` / `Password123!`
2. Access `/admin` dashboard
3. View:
   - System statistics (users, patients, appointments, alerts)
   - User management
   - System alerts
   - Hospital configuration

### Doctor Flow
1. Login with `doctor@demo.local` / `Password123!`
2. Access `/doctor` dashboard
3. View:
   - Today's appointments
   - Patient records
   - Tasks and alerts
   - Messaging system

### Front Desk Flow
1. Login with `front@demo.local` / `Password123!`
2. Access `/front-desk` dashboard
3. Manage:
   - Patient check-ins
   - Appointment scheduling
   - Patient registration
   - Today's schedule

---

## API Routes

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/register` - User registration

### Admin APIs
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/alerts` - System alerts

### Doctor APIs
- `GET /api/doctor/appointments` - Doctor's appointments
- `GET /api/doctor/tasks` - Doctor's tasks
- `GET /api/doctor/alerts` - Hospital alerts
- `GET /api/doctor/patients` - Patient list

### Front Desk APIs
- `GET /api/front-desk/appointments` - All appointments
- `GET /api/front-desk/patients` - Patient directory

### Messaging
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

---

## Security Features

### Implemented
✅ JWT authentication with HttpOnly cookies
✅ Role-based access control (RBAC)
✅ Middleware route protection
✅ Password hashing with bcrypt
✅ SQL injection prevention (Prisma ORM)
✅ XSS protection (React auto-escaping)
✅ CSRF protection via SameSite cookies

### Middleware Protection
```
Protected Routes:
- /admin/* → Admin only
- /doctor/* → Doctor only
- /front-desk/* → Front Desk only
- /api/admin/* → Admin only
- /api/doctor/* → Doctor only
- /api/front-desk/* → Front Desk only
```

---

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Setup PostgreSQL**
```bash
# Use Vercel Postgres or external provider (Supabase, Neon)
DATABASE_URL="postgresql://user:password@host:5432/db"
```

2. **Update Prisma Schema**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - NODE_ENV=production
```

4. **Run Migrations**
```bash
# After deployment, run migrations
npx prisma migrate deploy
npx prisma db seed
```

### Option 2: Railway

1. **Create Railway Project**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init
```

2. **Add PostgreSQL**
```bash
railway add postgresql
```

3. **Set Environment Variables**
```bash
railway variables set JWT_SECRET="your-secure-secret"
railway variables set NODE_ENV="production"
```

4. **Deploy**
```bash
railway up
```

### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t healthcare-emr .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  healthcare-emr
```

---

## Database Management

### View Database (Prisma Studio)
```bash
npm run db:studio
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database (Development)
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

---

## Monitoring & Logs

### Development
```bash
# View real-time logs
npm run dev
```

### Production
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs
```

---

## Troubleshooting

### Issue: JWT_SECRET not set
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Update .env
JWT_SECRET="generated-secret-here"
```

### Issue: Database connection failed
```bash
# Check DATABASE_URL format
# SQLite: file:./prisma/dev.db
# PostgreSQL: postgresql://user:pass@host:5432/db

# Regenerate Prisma Client
npx prisma generate
```

### Issue: Migration failed
```bash
# Reset database (dev only)
npx prisma migrate reset

# Or push schema directly (dev only)
npx prisma db push
```

---

## Performance Optimization

### 1. Enable Caching
```typescript
// Add Redis for session caching
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})
```

### 2. Database Indexes
```prisma
// Add indexes to frequently queried fields
model User {
  id    String @id @default(cuid())
  email String @unique
  
  @@index([email])
  @@index([hospitalId])
}
```

### 3. API Rate Limiting
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

---

## Next Steps

1. **Customize Branding**
   - Update `src/app/layout.tsx` with your branding
   - Modify `tailwind.config.ts` for custom colors

2. **Add Features**
   - Patient portal with appointment booking
   - Electronic Health Records (EHR) management
   - Lab results integration
   - Prescription management
   - Billing system

3. **Enhanced Security**
   - Implement 2FA for admin users
   - Add email verification
   - Enable audit logging
   - Encrypt sensitive patient data

4. **Compliance**
   - HIPAA compliance review
   - Add consent management
   - Implement data retention policies
   - Setup automated backups

---

## Support

For issues or questions:
1. Check existing documentation
2. Review error logs
3. Consult Next.js and Prisma documentation

---

**System Status**: ✅ Production Ready
**Last Updated**: October 2024
