const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/profile', verifyToken, authController.getProfile);

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    const { role } = req.query;
    const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state
    })(req, res, next);
  }
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  authController.socialLoginCallback
);

// Facebook OAuth routes
router.get('/facebook',
  (req, res, next) => {
    const { role } = req.query;
    const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
    passport.authenticate('facebook', {
      scope: ['email', 'public_profile'],
      state
    })(req, res, next);
  }
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: false
  }),
  authController.socialLoginCallback
);

// Apple OAuth routes
router.get('/apple',
  (req, res, next) => {
    const { role } = req.query;
    const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
    passport.authenticate('apple', {
      scope: ['name', 'email'],
      state
    })(req, res, next);
  }
);

router.get('/apple/callback',
  passport.authenticate('apple', {
    failureRedirect: '/login',
    session: false
  }),
  authController.socialLoginCallback
);

module.exports = router;
