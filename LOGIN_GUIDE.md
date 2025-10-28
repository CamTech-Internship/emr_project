# Login Guide

## How to Login as Patient

### Patient Account Credentials

```
Email:    patient@demo.local
Password: Password123!
```

### Steps to Login

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to login page**:
   - Open your browser to: `http://localhost:3000/login`

3. **Enter patient credentials**:
   - Email: `patient@demo.local`
   - Password: `Password123!`

4. **Click "Sign In"**

5. **You'll be redirected to**: `/patient` (Patient Dashboard)

## What You'll See

After logging in as a patient, you'll have access to:

### Overview Tab
- Welcome message with your name (Jane Patient)
- Quick stats showing:
  - 1 upcoming appointment
  - 2 active prescriptions
  - 1 unread message
- Quick action buttons
- Upcoming appointments list

### Profile Tab
- Personal information (name, DOB, contact info)
- Email address
- Statistics (total appointments, prescriptions, records)

### Appointments Tab
- Upcoming appointment scheduled for ~1 hour from seed time
- View all appointments with status
- Cancel future appointments
- Book new appointments (button available)

### Messages Tab
- 2 messages (conversation with doctor)
- 1 unread message from the doctor
- Send new messages

### Prescriptions Tab
- 2 active prescriptions:
  1. Lisinopril 10mg (blood pressure)
  2. Vitamin D3 1000 IU (supplement)
- Details include dosage and instructions

### Medical History Tab
- 2 EHR records:
  1. Visit Note (routine checkup)
  2. Lab Results (Complete Blood Count)

## All Demo Accounts

For testing different roles:

| Role       | Email                | Password      |
|------------|---------------------|---------------|
| Admin      | admin@demo.local    | Password123!  |
| Doctor     | doctor@demo.local   | Password123!  |
| Front Desk | front@demo.local    | Password123!  |
| **Patient**| **patient@demo.local** | **Password123!** |

## Testing Patient Features

### Try These Actions:

1. **Cancel an appointment**:
   - Go to Appointments tab
   - Click "Cancel" on the upcoming appointment
   - Confirm and see status change to "cancelled"

2. **View messages**:
   - Go to Messages tab
   - See the conversation with the doctor
   - Click "New Message" to send a message (placeholder UI)

3. **View prescriptions**:
   - Go to Prescriptions tab
   - See medication details and instructions

4. **View medical history**:
   - Go to Medical History tab
   - See visit notes and lab results

5. **Update profile**:
   - Go to Profile tab
   - Click "Edit Profile" (placeholder UI for now)

## Resetting Data

If you want to reset the demo data:

```bash
# Reset database and reseed
npm run db:migrate -- --create-only
npm run db:seed
```

Or to completely rebuild:

```bash
# Delete database and recreate
rm prisma/dev.db
npm run db:migrate
npm run db:seed
```

## Troubleshooting

### Can't Login?
- Make sure the dev server is running (`npm run dev`)
- Verify you're using the correct credentials
- Check browser console for errors

### No Data Showing?
- Run `npm run db:seed` to create sample data
- Check that the patient user is linked to a patient record

### TypeScript Errors?
- Run `npx prisma generate` to regenerate types
- Restart the dev server

## API Testing

You can also test the patient APIs directly using curl or Postman:

```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@demo.local","password":"Password123!"}'

# Then use the token in subsequent requests
# (Token is set in cookies automatically when using browser)
```
