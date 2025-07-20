const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

exports.handler = async (event) => {
  const token = event.headers?.authorization?.split(' ')[1];

  if (!token) {
    return {
      isAuthorized: false
    };
  }

  try {
    const decoded = jwt.verify(token, secret);
    return {
      isAuthorized: true,
      context: {
        userId: decoded.sub || decoded.id || '',
        email: decoded.email || '',
        name: decoded.name || ''
      }
    };
  } catch (err) {
    return {
      isAuthorized: false
    };
  }
};