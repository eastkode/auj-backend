const { requireAuth } = require('./middleware/auth');

// Mock user data
let users = [
  {
    id: 1,
    role_id: 1,
    name: 'Super Admin',
    email: 'admin@amity.com',
    phone: '1234567890',
    area_assigned: 'HQ',
    is_active: true,
  },
  {
    id: 2,
    role_id: 2,
    name: 'Admin User',
    email: 'testadmin@amity.com',
    phone: '0987654321',
    area_assigned: 'Ranchi',
    is_active: true,
  },
  {
    id: 3,
    role_id: 3,
    name: 'Counsellor User',
    email: 'counsellor@amity.com',
    phone: '1122334455',
    area_assigned: 'Patna',
    is_active: false,
  },
];

exports.handler = async (event, context) => {
  // Protect this function
  const auth = requireAuth(event, [1, 2]); // Require Super Admin or Admin role
  if (auth.error) {
    return auth.response;
  }

  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (event.httpMethod) {
      case 'GET':
        // GET /api/users or GET /api/users/:id
        if (segments.length === 1) { // /users
          return { statusCode: 200, body: JSON.stringify(users) };
        }
        if (segments.length === 2) { // /users/:id
          const id = parseInt(segments[1], 10);
          const user = users.find(u => u.id === id);
          if (user) {
            return { statusCode: 200, body: JSON.stringify(user) };
          } else {
            return { statusCode: 404, body: 'User not found' };
          }
        }
        break;
      case 'POST':
        // POST /api/users
        const data = JSON.parse(event.body);
        const newUser = {
          id: Math.max(...users.map(u => u.id)) + 1,
          ...data,
        };
        users.push(newUser);
        return { statusCode: 201, body: JSON.stringify(newUser) };
      case 'PUT':
        // PUT /api/users/:id
        if (segments.length === 2) {
          const id = parseInt(segments[1], 10);
          const updatedData = JSON.parse(event.body);
          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            return { statusCode: 200, body: JSON.stringify(users[userIndex]) };
          } else {
            return { statusCode: 404, body: 'User not found' };
          }
        }
        break;
      case 'DELETE':
        // DELETE /api/users/:id
        if (segments.length === 2) {
          const id = parseInt(segments[1], 10);
          const userIndex = users.findIndex(u => u.id === id);
          if (userIndex !== -1) {
            users = users.filter(u => u.id !== id);
            return { statusCode: 200, body: JSON.stringify({ message: 'User deleted' }) };
          } else {
            return { statusCode: 404, body: 'User not found' };
          }
        }
        break;
      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return { statusCode: 400, body: 'Bad Request' };
};
