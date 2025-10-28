# Healthcare DMS - Setup Guide

## Quick Start

Follow these steps to get your DMS up and running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update the values:

```bash
# Copy the example file
copy env.example .env.local

# Generate a secure JWT secret
# On Linux/Mac:
openssl rand -base64 48

# On Windows (PowerShell):
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Update `.env.local` with your generated JWT_SECRET.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Demo Credentials

After seeding, use these credentials to log in:

- **Admin**: admin@demo.local / Password123!
- **Doctor**: doctor@demo.local / Password123!
- **Front Desk**: front@demo.local / Password123!

## Database Management

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Re-seed database
npm run db:seed
```

## Project Structure

```
emr_project/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   │   ├── hospital/ # Hospital verification
│   │   │   ├── register/ # User registration
│   │   │   ├── login/    # Authentication
│   │   │   ├── doctor/   # Doctor endpoints
│   │   │   ├── patient/  # Patient endpoints
│   │   │   └── messages/ # Messaging
│   │   ├── admin/        # Admin dashboard
│   │   ├── doctor/       # Doctor dashboard
│   │   ├── front-desk/   # Front desk dashboard
│   │   └── patient/      # Patient portal
│   ├── lib/              # Utility libraries
│   │   ├── prisma.ts     # Prisma client
│   │   ├── auth.ts       # JWT authentication
│   │   └── rbac.ts       # Role-based access control
│   └── middleware.ts     # Route protection
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/hospital/verify` - Verify hospital code
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Doctor
- `GET /api/doctor/schedule` - Get appointments
- `GET /api/doctor/alerts` - Get alerts
- `GET /api/doctor/patients` - Get patients list
- `GET /api/doctor/tasks` - Get tasks
- `POST /api/doctor/tasks` - Create/update task

### Patient
- `GET /api/patient/appointments?patientId=xxx` - Get appointments
- `POST /api/patient/appointments` - Create appointment
- `POST /api/patient/triage` - Submit triage request

### Messages
- `GET /api/messages?userId=xxx` - Get messages
- `POST /api/messages` - Send message

### Health
- `GET /api/health` - Health check

## Next Steps

### For Development
1. Implement frontend forms for API endpoints
2. Add real-time notifications (Pusher, Socket.io)
3. Implement file uploads (patient documents, images)
4. Add comprehensive error handling
5. Write unit and integration tests

### For Production
1. **Switch to PostgreSQL**
   - Update DATABASE_URL in .env
   - Change provider in schema.prisma
   - Run migrations

2. **Add Security**
   - Implement rate limiting
   - Add CORS configuration
   - Enable HTTPS
   - Implement email verification
   - Add 2FA for sensitive roles

3. **Compliance (HIPAA)**
   - Encrypt PHI fields (use pgcrypto or app-level encryption)
   - Implement audit logging
   - Add row-level security (RLS)
   - Set up automated backups
   - Implement data retention policies
   - Add consent management

4. **Performance**
   - Add Redis caching
   - Implement database indexing
   - Set up CDN for static assets
   - Add request monitoring

5. **Deployment**
   - Set up CI/CD pipeline
   - Configure production environment
   - Set up monitoring (Sentry, Datadog)
   - Configure backups

## Troubleshooting

### Prisma Client Not Found
```bash
npx prisma generate
```

### Migration Issues
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Port Already in Use
```bash
# Change port in package.json or use:
PORT=3001 npm run dev
```

### JWT Secret Not Set
Make sure `.env.local` exists and contains JWT_SECRET.

## Security Warnings

⚠️ **This is an MVP scaffold. Before production:**

1. Never commit `.env.local` or real credentials
2. Use strong, unique JWT secrets (minimum 32 characters)
3. Enable HTTPS in production
4. Implement rate limiting on auth endpoints
5. Add email verification for new accounts
6. Encrypt all PHI (Protected Health Information)
7. Implement comprehensive audit logging
8. Add CSRF protection
9. Enable SQL injection protection (Prisma handles this)
10. Regular security audits and dependency updates

## Support

For issues or questions, please check:
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Project README.md
