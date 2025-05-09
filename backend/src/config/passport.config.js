const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Configure Passport strategies
module.exports = () => {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (!user) {
        // Check if email already exists
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.profilePicture && profile.photos && profile.photos.length > 0) {
            user.profilePicture = profile.photos[0].value;
          }
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            role: req.query.role || 'patient'
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Facebook OAuth Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.API_URL}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ where: { facebookId: profile.id } });
      
      if (!user) {
        // Check if email already exists
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@facebook.com`;
        user = await User.findOne({ where: { email } });
        
        if (user) {
          // Link Facebook account to existing user
          user.facebookId = profile.id;
          if (!user.profilePicture && profile.photos && profile.photos.length > 0) {
            user.profilePicture = profile.photos[0].value;
          }
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            facebookId: profile.id,
            email,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            role: req.query.role || 'patient'
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Apple OAuth Strategy
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
    callbackURL: `${process.env.API_URL}/auth/apple/callback`,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      // Apple profile doesn't always provide email after the first login
      const email = profile.email || (idToken && idToken.email);
      
      if (!email) {
        return done(new Error('Email not provided by Apple'));
      }
      
      // Check if user already exists
      let user = await User.findOne({ where: { appleId: profile.id } });
      
      if (!user) {
        // Check if email already exists
        user = await User.findOne({ where: { email } });
        
        if (user) {
          // Link Apple account to existing user
          user.appleId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            appleId: profile.id,
            email,
            name: profile.name || email.split('@')[0],
            role: req.query.role || 'patient'
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
