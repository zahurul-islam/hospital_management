# Hospital Management System with Video Call Appointments

A comprehensive hospital management system that enables patients and doctors to log in, access relevant information, book appointments (including video call appointments), conduct virtual consultations, and store all data securely.

## Features

- **User Authentication**: Secure login with role-based access for patients, doctors, and admins.
- **Patient Portal**:
  - Register and log in
  - View health records
  - Book appointments (in-person or video call)
  - Join video call consultations
- **Doctor Portal**:
  - View patient lists and medical records
  - Manage appointments
  - Conduct virtual consultations
- **Admin Portal**:
  - Manage user accounts
  - Monitor system data
  - Generate reports
- **Telemedicine**:
  - Secure video conferencing for virtual consultations
  - Features for scheduling, joining, and documenting video call appointments

## Tech Stack

- **Frontend**: React with Material UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

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

3. Configure the database:
   - Create a PostgreSQL database named `hospital_management`
   - Update the `.env` file with your database credentials

4. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
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