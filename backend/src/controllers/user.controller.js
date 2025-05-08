const { User, Patient, Doctor } = require('../models');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Error getting users', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profile = null;
    
    if (user.role === 'patient') {
      profile = await Patient.findOne({ where: { userId: id } });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ where: { userId: id } });
    }
    
    return res.status(200).json({
      user,
      profile
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ message: 'Error getting user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, ...profileData } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is authorized to update
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Update user
    await user.update({
      name,
      email,
      phone,
      address
    });
    
    // Update profile if profile data is provided
    if (Object.keys(profileData).length > 0) {
      if (user.role === 'patient') {
        const patient = await Patient.findOne({ where: { userId } });
        if (patient) {
          await patient.update(profileData);
        }
      } else if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId } });
        if (doctor) {
          await doctor.update(profileData);
        }
      }
    }
    
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await user.destroy();
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
