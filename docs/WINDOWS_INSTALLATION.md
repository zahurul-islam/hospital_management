# Green University Hospital Management System - Windows Installation Guide

This comprehensive guide will walk you through the process of installing and setting up the Green University Hospital Management System on a Windows environment.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Setting Up the Project](#setting-up-the-project)
4. [Database Configuration](#database-configuration)
5. [Running the Application](#running-the-application)
6. [Accessing the Application](#accessing-the-application)
7. [User Account Setup](#user-account-setup)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance and Updates](#maintenance-and-updates)

## System Requirements

- **Operating System**: Windows 10 or Windows 11
- **Processor**: 2 GHz dual-core processor or better
- **Memory**: 4 GB RAM minimum (8 GB recommended)
- **Disk Space**: 2 GB of free disk space
- **Internet Connection**: Required for installation and updates

## Installing Prerequisites

### 1. Install Node.js and npm

Node.js is the runtime environment for the application, and npm is the package manager.

1. Download the Node.js installer for Windows from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version (v16.x or higher)
   
2. Run the installer:
   - Double-click the downloaded file (e.g., `node-v16.x.x-x64.msi`)
   - Follow the installation wizard
   - Make sure to check the option to install npm
   - Select the option to "Add to PATH" during installation

3. Verify the installation:
   - Open Command Prompt (Press Win+R, type `cmd`, and press Enter)
   - Run the following commands:
     ```
     node --version
     npm --version
     ```
   - You should see version numbers displayed for both

### 2. Install Git

Git is used for version control and downloading the project.

1. Download Git for Windows from [git-scm.com](https://git-scm.com/download/win)

2. Run the installer:
   - Double-click the downloaded file
   - Follow the installation wizard with these recommended settings:
     - When asked about adjusting your PATH environment, select "Git from the command line and also from 3rd-party software"
     - For line ending conversions, select "Checkout Windows-style, commit Unix-style line endings"
     - For the terminal emulator, select "Use Windows' default console window"
     - For extra options, ensure "Enable file system caching" and "Enable Git Credential Manager" are selected

3. Verify the installation:
   - Open Command Prompt
   - Run: `git --version`
   - You should see the Git version number

## Setting Up the Project

### 1. Clone the Repository

1. Create a folder where you want to store the project (e.g., `C:\Projects`)

2. Open Command Prompt as Administrator:
   - Press Win+X and select "Windows Terminal (Admin)" or "Command Prompt (Admin)"

3. Navigate to your projects folder:
   ```
   cd C:\Projects
   ```

4. Clone the repository:
   ```
   git clone https://github.com/zahurul-islam/hospital_management.git
   ```

5. Navigate to the project folder:
   ```
   cd hospital_management
   ```

### 2. Set Up the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   This may take a few minutes as it downloads and installs all required packages.

3. Create environment configuration:
   - Copy the example environment file:
     ```
     copy .env.example .env
     ```
   - If the example file doesn't exist, create a new `.env` file with the following content:
     ```
     PORT=5000
     JWT_SECRET=your_secure_jwt_secret
     NODE_ENV=development
     DB_DIALECT=sqlite
     DB_STORAGE=./hospital_management.sqlite
     ```

### 3. Set Up the Frontend

1. Navigate to the frontend directory:
   ```
   cd ..\frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   This may take a few minutes.

3. Create environment configuration:
   - Copy the example environment file:
     ```
     copy .env.example .env
     ```
   - If the example file doesn't exist, create a new `.env` file with the following content:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

## Database Configuration

The application uses SQLite by default for development, which requires no additional setup. The database file will be created automatically when you first run the application.

If you want to use a different database like PostgreSQL:

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)

2. During installation:
   - Set a password for the postgres user
   - Keep the default port (5432)
   - Select your locale

3. After installation, create a new database:
   - Open pgAdmin (installed with PostgreSQL)
   - Connect to the server
   - Right-click on "Databases" and select "Create" > "Database"
   - Name it `hospital_management`

4. Update your backend `.env` file:
   ```
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hospital_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

## Running the Application

### 1. Start the Backend Server

1. Open Command Prompt
2. Navigate to the backend directory:
   ```
   cd C:\Projects\hospital_management\backend
   ```
3. Start the server:
   ```
   npm start
   ```
   
   You should see output similar to:
   ```
   > backend@1.0.0 start
   > node src/server.js
   
   Database connection has been established successfully.
   Server is running on port 5000
   ```

### 2. Start the Frontend Development Server

1. Open another Command Prompt window
2. Navigate to the frontend directory:
   ```
   cd C:\Projects\hospital_management\frontend
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   
   You should see output similar to:
   ```
   > frontend@0.0.0 dev
   > vite
   
   VITE v6.x.x ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

## Accessing the Application

1. Open your web browser (Chrome, Firefox, or Edge recommended)
2. Navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## User Account Setup

### Creating an Admin Account

The first user you register can be set up as an admin. To do this:

1. Register a new user through the application interface
2. Manually update the user role in the database:
   - For SQLite:
     - Install a SQLite browser like [DB Browser for SQLite](https://sqlitebrowser.org/dl/)
     - Open the database file (`backend/hospital_management.sqlite`)
     - Navigate to the "Users" table
     - Find your user and change the "role" field to "admin"
     - Save changes

### Creating Doctor and Patient Accounts

1. Register new users through the application interface
2. Select the appropriate role (doctor or patient) during registration
3. For doctors, complete the doctor profile with specialty, qualification, and license information

## Troubleshooting

### Common Issues and Solutions

#### "npm command not found"
- Make sure Node.js is properly installed and added to your PATH
- Try restarting your Command Prompt or computer

#### "Port already in use" error
- Another application is using the same port
- Change the port in the `.env` file or close the other application
- For backend: `PORT=5001` in the `.env` file
- For frontend: Add `VITE_PORT=3000` to the `.env` file

#### Database connection issues
- Verify your database credentials in the `.env` file
- Make sure the database server is running
- For SQLite: Check if the database file has proper permissions

#### "Module not found" errors
- Run `npm install` again in the affected directory
- Delete the `node_modules` folder and run `npm install` again

#### CORS errors in the browser console
- Make sure both frontend and backend servers are running
- Check that the API URL in the frontend `.env` file is correct

## Maintenance and Updates

### Updating the Application

To update the application to the latest version:

1. Navigate to the project directory:
   ```
   cd C:\Projects\hospital_management
   ```

2. Pull the latest changes:
   ```
   git pull
   ```

3. Update dependencies:
   ```
   cd backend
   npm install
   
   cd ..\frontend
   npm install
   ```

4. Restart both servers

### Backing Up the Database

For SQLite:
1. Stop the backend server
2. Copy the database file (`backend/hospital_management.sqlite`) to a safe location
3. Restart the backend server

For PostgreSQL:
1. Use pgAdmin to create a backup
2. Right-click on the database
3. Select "Backup..."
4. Choose a location and format for the backup

### Setting Up as a Windows Service (Optional)

To run the application as a Windows service:

1. Install PM2:
   ```
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. Set up PM2:
   ```
   pm2-startup install
   ```

3. Start the application with PM2:
   ```
   cd C:\Projects\hospital_management\backend
   pm2 start npm --name "hospital-backend" -- start
   
   cd ..\frontend
   pm2 start npm --name "hospital-frontend" -- run preview
   ```

4. Save the PM2 configuration:
   ```
   pm2 save
   ```

This will ensure the application starts automatically when Windows boots.
