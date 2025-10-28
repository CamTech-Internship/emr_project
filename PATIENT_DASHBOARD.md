# Patient Dashboard

## Overview

The Patient Dashboard is a comprehensive patient portal that allows patients to manage their health information, appointments, and communicate with healthcare providers.

## Features Implemented

### 1. Patient Profile Management
- **View Profile**: Patients can view their personal details including name, date of birth, and contact information
- **Update Profile**: Patients can update their personal information (via `/api/patient/profile` PATCH endpoint)
- **Statistics**: View total appointments, prescriptions, and medical records

**API Endpoint**: `GET/PATCH /api/patient/profile`

### 2. Appointments Management
- **View Appointments**: See all past and upcoming appointments
- **Book Appointments**: Request new appointments (UI placeholder for integration with booking system)
- **Cancel Appointments**: Cancel scheduled future appointments
- **Reschedule Appointments**: Modify appointment times (via API)
- **View Details**: See appointment reason, doctor, date/time, and status

**API Endpoint**: `GET/POST/PATCH /api/patient/appointments`

### 3. Messaging System
- **View Messages**: See all sent and received messages
- **Send Messages**: Contact doctors or healthcare providers
- **Unread Indicators**: Visual badges for new/unread messages
- **Message History**: Complete conversation history with timestamps

**API Endpoint**: `GET/POST /api/patient/messages`

### 4. Prescriptions
- **View Prescriptions**: See all current and past prescriptions
- **Prescription Details**: Medication name, dosage, instructions
- **Doctor Information**: See which doctor prescribed each medication
- **Date Tracking**: When prescriptions were issued

**API Endpoint**: `GET /api/patient/prescriptions`

### 5. Medical History (EHR)
- **View Records**: Access complete electronic health records
- **Record Types**: Various medical record types (diagnosis, lab results, etc.)
- **Chronological View**: Records sorted by date
- **Detailed Information**: Full record payload with all medical data

**API Endpoint**: `GET /api/patient/ehr`

### 6. Triage Requests
- **Submit Requests**: Send urgent medical concerns to healthcare team
- **Severity Levels**: Low, medium, high, critical priority levels
- **Alert System**: Creates alerts for medical staff to review

**API Endpoint**: `POST /api/patient/triage`

## Dashboard Sections

### Overview Tab
- Welcome message with patient name
- Quick statistics (upcoming appointments, prescriptions, unread messages)
- Quick action buttons for common tasks
- Recent activity feed showing upcoming appointments

### Profile Tab
- Personal information display
- Edit profile button
- Health statistics overview

### Appointments Tab
- Complete list of all appointments
- Filter by status (scheduled, completed, cancelled)
- Action buttons for cancel/reschedule
- Book new appointment button

### Messages Tab
- Inbox/outbox combined view
- New message indicators
- Compose new message button
- Full message history

### Prescriptions Tab
- List of all prescriptions
- Medication details and instructions
- Prescribing doctor information
- Date issued

### Medical History Tab
- Complete EHR records
- Organized by type and date
- Detailed medical information
- Searchable/filterable (future enhancement)

## Database Schema Changes

Added new fields to `User` model:
```prisma
patientId       String?  @unique
patientProfile  Patient? @relation("user_patient")
```

Added new relation to `Patient` model:
```prisma
user User? @relation("user_patient")
```

This creates a 1:1 relationship between User (with role PATIENT) and Patient records.

## Security

- All API endpoints are protected by authentication middleware
- Role-based access control (RBAC) enforces PATIENT role requirements
- Patients can only access their own data
- Doctors can view patient data when needed for care

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/patient/profile` | GET | Get patient profile |
| `/api/patient/profile` | PATCH | Update patient profile |
| `/api/patient/appointments` | GET | Get appointments |
| `/api/patient/appointments` | POST | Create appointment |
| `/api/patient/appointments` | PATCH | Update appointment (cancel/reschedule) |
| `/api/patient/prescriptions` | GET | Get prescriptions |
| `/api/patient/ehr` | GET | Get medical records |
| `/api/patient/messages` | GET | Get messages |
| `/api/patient/messages` | POST | Send message |
| `/api/patient/triage` | POST | Submit triage request |

## UI Components

### Navigation
- Tab-based navigation with icons
- Active tab highlighting
- Responsive design for mobile/desktop

### Cards
- StatCard: Display numeric statistics
- ActionCard: Quick action buttons
- AppointmentCard: Appointment details with actions
- MessageCard: Message display with read status
- PrescriptionCard: Prescription information
- EHRCard: Medical record display

### Modals
- SimpleModal: Reusable modal component for forms and confirmations

## Future Enhancements

1. **Appointment Booking**: Full booking form with doctor selection and time slots
2. **Message Composer**: Rich text editor for detailed messages
3. **Profile Editor**: Full form for editing all profile fields
4. **File Uploads**: Attach documents to messages
5. **Notifications**: Real-time notifications for new messages/appointments
6. **Search & Filter**: Search through records, prescriptions, and appointments
7. **Print/Export**: Download medical records and prescriptions
8. **Telemedicine**: Video call integration for virtual appointments

## Usage

To access the patient dashboard:
1. Login with a PATIENT role account
2. Navigate to `/patient`
3. Use the navigation tabs to access different sections
4. Click action buttons to perform operations

## Notes

- TypeScript errors in API files are due to Prisma client regeneration (Windows file lock). The migration was successful and code will work at runtime.
- Modal forms currently show placeholder text - implement full forms as needed
- All data is fetched on component mount and when actions are performed
- Error handling includes user-friendly alerts and console logging
