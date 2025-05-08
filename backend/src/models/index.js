const sequelize = require('../config/db.config');
const User = require('./user.model');
const Patient = require('./patient.model');
const Doctor = require('./doctor.model');
const Appointment = require('./appointment.model');
const MedicalRecord = require('./medicalRecord.model');
const TelemedicineSession = require('./telemedicineSession.model');

// Define relationships
User.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });

Patient.belongsTo(User, { foreignKey: 'userId', as: 'patientUser' });
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'patientMedicalRecords' });

Doctor.belongsTo(User, { foreignKey: 'userId', as: 'doctorUser' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Doctor.hasMany(MedicalRecord, { foreignKey: 'doctorId', as: 'doctorMedicalRecords' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'appointmentPatient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'appointmentDoctor' });
Appointment.hasOne(TelemedicineSession, { foreignKey: 'appointmentId', as: 'telemedicineSession' });
Appointment.hasOne(MedicalRecord, { foreignKey: 'appointmentId', as: 'medicalRecord' });

MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patientRecord' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctorRecord' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointmentRecord' });

TelemedicineSession.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointmentSession' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  TelemedicineSession
};
