const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Appointment = require('./appointment.model');

const TelemedicineSession = sequelize.define('TelemedicineSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Appointment,
      key: 'id'
    }
  },
  meetingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingPassword: {
    type: DataTypes.STRING,
    allowNull: true
  },
  joinUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hostUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  recordingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Establish relationship
TelemedicineSession.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

module.exports = TelemedicineSession;
