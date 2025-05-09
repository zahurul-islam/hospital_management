const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  availableDays: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('availableDays');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('availableDays', JSON.stringify(value));
    }
  },
  availableTimeStart: {
    type: DataTypes.TIME,
    allowNull: true
  },
  availableTimeEnd: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isAvailableForVideoCall: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

// Establish relationship
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Doctor;
