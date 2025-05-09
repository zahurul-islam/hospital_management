const { sequelize } = require('../models');

// Function to update the database schema
const updateDatabase = async () => {
  try {
    console.log('Starting database schema update...');
    
    // Alter the database to add new columns
    await sequelize.sync({ alter: true });
    
    console.log('Database schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
};

// Run the update
updateDatabase();
