const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

// This is a simplified middleware pattern for Netlify functions.
// It returns a decoded token if valid, or an error response object if not.
const requireAuth = (event, requiredRoles = []) => {
  const authHeader = event.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: true,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authorization header missing or invalid.' }),
      },
    };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check for required roles (e.g., [1] for Super Admin, [1, 2] for Admin or Super Admin)
    if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.roleId)) {
      return {
        error: true,
        response: {
          statusCode: 403,
          body: JSON.stringify({ message: 'Forbidden: Insufficient permissions.' }),
        },
      };
    }

    return { error: false, decoded };

  } catch (err) {
    return {
      error: true,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid or expired token.' }),
      },
    };
  }
};

module.exports = { requireAuth };
