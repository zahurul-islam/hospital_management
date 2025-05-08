const jwt = require('jsonwebtoken');
const { User, Patient, Doctor } = require('../models');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone, address, ...additionalData } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'patient',
      phone,
      address
    });
    
    // Create patient or doctor profile based on role
    if (user.role === 'patient') {
      const { dateOfBirth, gender, bloodGroup, emergencyContact, medicalHistory } = additionalData;
      
      await Patient.create({
        userId: user.id,
        dateOfBirth,
        gender,
        bloodGroup,
        emergencyContact,
        medicalHistory
      });
    } else if (user.role === 'doctor') {
      const { specialty, qualification, experience, licenseNumber, consultationFee, bio } = additionalData;
      
      await Doctor.create({
        userId: user.id,
        specialty,
        qualification,
        experience,
        licenseNumber,
        consultationFee,
        bio
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Return user data and token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if password is correct
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Return user data and token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profile = null;
    
    if (user.role === 'patient') {
      profile = await Patient.findOne({ where: { userId } });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ where: { userId } });
    }
    
    return res.status(200).json({
      user,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Error getting profile', error: error.message });
  }
};
