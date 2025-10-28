# 🏥 Healthcare DMS (Digital Medical System)

A production-ready MVP scaffold for a healthcare Document Management System built with modern web technologies.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes (REST)
- **Database**: SQLite (via Prisma ORM) - easily migrates to PostgreSQL
- **Authentication**: JWT (HS256) with HttpOnly cookies
- **Validation**: Zod

## ✨ Features

### Core Functionality
- ✅ Role-based access control (Admin, Doctor, Front Desk, Patient)
- ✅ Hospital verification system
- ✅ User registration and authentication
- ✅ JWT-based session management with refresh tokens
- ✅ Secure HttpOnly cookie storage

### Doctor Features
- ✅ View appointments and schedules
- ✅ Manage tasks
- ✅ Access patient records
- ✅ Critical alerts and notifications

### Front Desk Features
- ✅ Patient registration
- ✅ Appointment scheduling
- ✅ Check-in management

### Patient Features
- ✅ View appointments
- ✅ Submit triage requests
- ✅ Access medical records

### Admin Features
- ✅ Hospital administration
- ✅ User management
- ✅ System oversight

### Messaging
- ✅ Inter-user messaging system
- ✅ Thread support

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
# Copy example environment file
copy env.example .env.local

# Generate a secure JWT secret (Windows PowerShell)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

# Update .env.local with the generated secret
```

3. **Initialize database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000 🎉

## 🔐 Demo Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.local | Password123! |
| Doctor | doctor@demo.local | Password123! |
| Front Desk | front@demo.local | Password123! |

Hospital Code: `HOS-123`

## 📚 Documentation

For detailed setup instructions, API documentation, and deployment guides, see [SETUP.md](./SETUP.md).

## 🗂️ Project Structure

```
emr_project/
├── src/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── hospital/     # Hospital verification
│   │   │   ├── register/     # User registration
│   │   │   ├── login/        # Authentication
│   │   │   ├── logout/       # Sign out
│   │   │   ├── doctor/       # Doctor endpoints
│   │   │   ├── patient/      # Patient endpoints
│   │   │   └── messages/     # Messaging system
│   │   ├── admin/            # Admin dashboard
│   │   ├── doctor/           # Doctor dashboard
│   │   ├── front-desk/       # Front desk dashboard
│   │   ├── patient/          # Patient portal
│   │   └── page.tsx          # Landing page
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # JWT utilities
│   │   └── rbac.ts           # Role-based access control
│   └── middleware.ts         # Route protection
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data script
└── package.json
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:push      # Push schema changes (dev only)
```

## 🔒 Security Considerations

⚠️ **This is an MVP. Before production deployment:**

### Critical Items
1. ✅ Switch to PostgreSQL with encrypted fields
2. ✅ Implement rate limiting (especially on auth routes)
3. ✅ Add email verification
4. ✅ Enable HTTPS only
5. ✅ Implement CSRF protection
6. ✅ Add audit logging for all data access
7. ✅ Encrypt PHI (Protected Health Information)
8. ✅ Set up automated backups
9. ✅ Implement Row-Level Security (RLS)
10. ✅ Add 2FA for privileged roles

### MVP Limitations
- JWT stored in cookies (improve with refresh token rotation)
- SQLite for development (use PostgreSQL in production)
- No field-level encryption (add for PHI)
- Basic error messages (don't leak sensitive info)
- No rate limiting (add before public access)

## 🚀 Migration to Production

### PostgreSQL Migration
```bash
# 1. Update .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/dms_db"

# 2. Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 3. Run migrations
npx prisma migrate dev
npx prisma db seed
```

### Recommended Stack for Production
- **Hosting**: Vercel, Railway, or Fly.io
- **Database**: Supabase, Neon, or managed PostgreSQL
- **Caching**: Redis (Upstash)
- **Storage**: AWS S3 or Cloudflare R2
- **Monitoring**: Sentry + Datadog
- **CDN**: Cloudflare or Vercel Edge

## 📋 Compliance (HIPAA)

For HIPAA compliance, implement:

1. **Technical Safeguards**
   - End-to-end encryption
   - Access controls (implemented)
   - Audit logs
   - Automatic logoff
   - Encryption at rest and in transit

2. **Administrative Safeguards**
   - Security training
   - Access management policies
   - Incident response plan
   - Business associate agreements

3. **Physical Safeguards**
   - Secure data center
   - Device controls
   - Workstation security

## 🤝 Contributing

This is a starter template. Customize for your specific healthcare needs.

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This software is provided as-is for development purposes. It is not certified for medical use or HIPAA compliance out of the box. Consult with healthcare IT and legal professionals before deploying in a production medical environment.

---

Built with ❤️ using Next.js, Prisma, and TypeScript
