const jwt = require('jsonwebtoken');

const getSecret = () => {
  return process.env.JWT_SECRET || process.env.SUPABASE_ANON_KEY || 'default_secret_for_testing';
};

const generateDeleteOTP = (userId) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionToken = jwt.sign(
    { sub: userId, otp, type: 'account_deletion' },
    getSecret(),
    { expiresIn: '15m' }
  );
  return { otp, sessionToken };
};

const verifyDeleteOTP = (sessionToken, inputtedOtp) => {
  return verifyGenericOTP(sessionToken, inputtedOtp, 'account_deletion');
};

const generateAuthOTP = (email, type) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionToken = jwt.sign(
    { email, otp, type },
    getSecret(),
    { expiresIn: '15m' }
  );
  return { otp, sessionToken };
};

const verifyGenericOTP = (sessionToken, inputtedOtp, expectedType) => {
  try {
    const decoded = jwt.verify(sessionToken, getSecret());
    if (decoded.type !== expectedType) {
      throw new Error('Invalid token type');
    }
    if (decoded.otp !== inputtedOtp) {
      throw new Error('Invalid OTP');
    }
    return decoded;
  } catch (error) {
    if (error.message === 'Invalid OTP') throw error;
    throw new Error('Invalid or expired session token');
  }
};

const verifyAuthOTP = (sessionToken, inputtedOtp, expectedType) => {
  return verifyGenericOTP(sessionToken, inputtedOtp, expectedType);
};

module.exports = {
  generateDeleteOTP,
  verifyDeleteOTP,
  generateAuthOTP,
  verifyAuthOTP
};
