import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// User services
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Patient services
export const patientService = {
  getAllPatients: () => api.get('/patients'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  getPatientAppointments: (id) => api.get(`/patients/${id}/appointments`),
  getPatientMedicalRecords: (id) => api.get(`/patients/${id}/medical-records`),
};

// Doctor services
export const doctorService = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  getDoctorAppointments: (id) => api.get(`/doctors/${id}/appointments`),
  getDoctorPatients: (id) => api.get(`/doctors/${id}/patients`),
};

// Appointment services
export const appointmentService = {
  getAllAppointments: () => api.get('/appointments'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

// Medical record services
export const medicalRecordService = {
  getAllMedicalRecords: () => api.get('/medical-records'),
  getMedicalRecordById: (id) => api.get(`/medical-records/${id}`),
  createMedicalRecord: (medicalRecordData) => api.post('/medical-records', medicalRecordData),
  updateMedicalRecord: (id, medicalRecordData) => api.put(`/medical-records/${id}`, medicalRecordData),
  deleteMedicalRecord: (id) => api.delete(`/medical-records/${id}`),
};

// Telemedicine services
export const telemedicineService = {
  getAllTelemedicineSessions: () => api.get('/telemedicine'),
  getTelemedicineSessionById: (id) => api.get(`/telemedicine/${id}`),
  createOrUpdateTelemedicineSession: (sessionData) => api.post('/telemedicine', sessionData),
  startTelemedicineSession: (id) => api.post(`/telemedicine/${id}/start`),
  endTelemedicineSession: (id, sessionData) => api.post(`/telemedicine/${id}/end`, sessionData),
};

export default api;
