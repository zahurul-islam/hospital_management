# Green University Hospital Management System

A comprehensive hospital management system that enables patients and doctors to log in, access relevant information, book appointments (including video call appointments), conduct virtual consultations, and store all data securely.

## Features

- **User Authentication**:
  - Secure login with role-based access for patients, doctors, and admins
  - Social login with Google, Facebook, and Apple accounts
  - JWT-based authentication

- **Patient Portal**:
  - Register and log in
  - View and manage personal health records
  - Book appointments (in-person or video call)
  - Join video call consultations
  - View appointment history
  - Receive notifications for upcoming appointments

- **Doctor Portal**:
  - Complete doctor profile with specialty, qualifications, and license information
  - View patient lists and medical records
  - Manage appointments and schedules
  - Conduct virtual consultations
  - Track patient history
  - Manage availability for appointments

- **Admin Portal**:
  - Manage user accounts (patients, doctors, staff)
  - Monitor system data and usage
  - Generate reports and analytics
  - Configure system settings

- **Telemedicine**:
  - Secure video conferencing for virtual consultations
  - Features for scheduling, joining, and documenting video call appointments
  - Screen sharing and chat functionality
  - Recording options for consultations (with consent)

## Tech Stack

- **Frontend**:
  - React 18 with Material UI 5
  - Vite for fast development and building
  - React Router for navigation
  - Context API for state management

- **Backend**:
  - Node.js with Express
  - RESTful API architecture
  - JWT for authentication
  - Passport.js for social authentication

- **Database**:
  - SQLite (development)
  - PostgreSQL (production) with Sequelize ORM

- **Video Calling**:
  - WebRTC for peer-to-peer video communication
  - Socket.IO for signaling

## Getting Started

For detailed setup instructions, please refer to:
- [Windows Installation Guide](docs/WINDOWS_INSTALLATION.md)
- [Linux/Mac Setup Guide](docs/UNIX_SETUP.md)
- [Social Authentication Setup](docs/OAUTH_SETUP.md)

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

### Quick Installation

1. Clone the repository:
   ```
   git clone https://github.com/zahurul-islam/hospital_management.git
   cd hospital_management
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```
   cd ../frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Patients
- `GET /api/patients` - Get all patients (for doctors and admins)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/:id/appointments` - Get patient's appointments
- `GET /api/patients/:id/medical-records` - Get patient's medical records

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor
- `GET /api/doctors/:id/appointments` - Get doctor's appointments
- `GET /api/doctors/:id/patients` - Get doctor's patients

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment (admin only)

### Medical Records
- `GET /api/medical-records` - Get all medical records (admin only)
- `GET /api/medical-records/:id` - Get medical record by ID
- `POST /api/medical-records` - Create medical record (doctors only)
- `PUT /api/medical-records/:id` - Update medical record (doctors only)
- `DELETE /api/medical-records/:id` - Delete medical record (admin only)

### Telemedicine
- `GET /api/telemedicine` - Get all telemedicine sessions (admin only)
- `GET /api/telemedicine/:id` - Get telemedicine session by ID
- `POST /api/telemedicine` - Create or update telemedicine session
- `POST /api/telemedicine/:id/start` - Start telemedicine session
- `POST /api/telemedicine/:id/end` - End telemedicine session

## License

This project is licensed under the MIT License.