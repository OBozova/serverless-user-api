const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports.authorizer = async (event) => {
  const token = event.headers.Authorization?.split(' ')[1];
  if (!token) return { statusCode: 401 };

  try {
    const decoded = jwt.verify(token, secret);
    return {
      principalId: decoded.sub,
      context: decoded,
    };
  } catch (err) {
    return { statusCode: 401 };
  }
};
