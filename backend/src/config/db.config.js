const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Use SQLite for simplicity in development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../hospital_management.sqlite'),
  logging: process.env.NODE_ENV !== 'production' ? console.log : false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;
