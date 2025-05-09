# Windows Setup Guide for Green University Hospital Management System

This guide provides detailed instructions for setting up the Green University Hospital Management System on a Windows environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Additional Configuration](#additional-configuration)

## Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:

### 1. Node.js and npm

1. Download the Node.js installer for Windows from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version (v16.x or higher)
   
2. Run the installer and follow the installation wizard
   - Make sure to check the option to install npm (Node Package Manager)
   - Select the option to "Add to PATH" during installation

3. Verify the installation by opening Command Prompt and running:
   ```
   node --version
   npm --version
   ```

### 2. Git

1. Download Git for Windows from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer and follow the installation wizard
   - Use the default options unless you have specific preferences
   - Select "Use Git from the Windows Command Prompt" during installation

3. Verify the installation by opening Command Prompt and running:
   ```
   git --version
   ```

### 3. Visual Studio Code (Recommended IDE)

1. Download Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com/)
2. Run the installer and follow the installation wizard
3. Recommended extensions for this project:
   - ESLint
   - Prettier
   - JavaScript (ES6) code snippets
   - React snippets

## Installation Steps

### 1. Clone the Repository

1. Open Command Prompt
2. Navigate to the directory where you want to store the project
3. Clone the repository:
   ```
   git clone https://github.com/zahurul-islam/hospital_management.git
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

3. Create a `.env` file in the backend directory:
   ```
   copy .env.example .env
   ```
   
4. Open the `.env` file in a text editor and update the configuration as needed:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

### 3. Set Up the Frontend

1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   copy .env.example .env
   ```
   
4. Open the `.env` file in a text editor and update the configuration as needed:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Configuration

### Database Configuration

By default, the application uses SQLite for development, which doesn't require additional setup. However, if you want to use PostgreSQL:

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, set a password for the postgres user
3. Create a new database named `hospital_management`
4. Update the `.env` file in the backend directory:
   ```
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hospital_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### Social Authentication (Optional)

For setting up social authentication with Google, Facebook, and Apple, refer to the [Social Authentication Setup Guide](OAUTH_SETUP.md).

## Running the Application

### 1. Start the Backend Server

1. Open Command Prompt
2. Navigate to the backend directory:
   ```
   cd path\to\hospital_management\backend
   ```
3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

4. The backend server should start and display:
   ```
   Server is running on port 5000
   Database connection has been established successfully.
   ```

### 2. Start the Frontend Development Server

1. Open another Command Prompt window
2. Navigate to the frontend directory:
   ```
   cd path\to\hospital_management\frontend
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The frontend development server should start and display:
   ```
   VITE v6.x.x ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### 3. Access the Application

1. Open your web browser (Chrome, Firefox, or Edge recommended)
2. Navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

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

## Additional Configuration

### Setting Up for Production

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Configure the backend for production:
   - Update the `.env` file:
     ```
     NODE_ENV=production
     ```
   - Set up a proper database (PostgreSQL recommended)
   - Configure proper security measures (HTTPS, secure headers, etc.)

### Windows Services (Optional)

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
   cd backend
   pm2 start npm --name "hospital-backend" -- start
   cd ../frontend
   pm2 start npm --name "hospital-frontend" -- run preview
   ```

4. Save the PM2 configuration:
   ```
   pm2 save
   ```

## Next Steps

- [API Documentation](../API.md)
- [User Guide](USER_GUIDE.md)
- [Social Authentication Setup](OAUTH_SETUP.md)
