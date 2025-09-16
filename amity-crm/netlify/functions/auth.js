const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');

// Mock SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your_default_sendgrid_key');
sgMail.send = async (msg) => {
  console.log('Mock email sent:');
  console.log(msg);
  return Promise.resolve([{}, null]);
};

// Mock database user for testing
// Password is "admin123"
const mockUser = {
  id: 1,
  role_id: 1,
  name: 'Super Admin',
  email: 'admin@amity.com',
  phone: '1234567890',
  // bcrypt hash for "admin123"
  password_hash: '$2b$10$K.pZ5pL9k/bp.DWc6h1.2uJ4Lz8C4e.y/AqO.3a.mC3y.c5.j2.J2',
  area_assigned: 'HQ',
  is_active: true,
};

// Mock database pool
const pool = {
  query: async (text, params) => {
    if (text.includes('SELECT * FROM users WHERE email = $1')) {
      if (params[0] === mockUser.email) {
        return { rows: [mockUser] };
      }
      return { rows: [] };
    }
    return { rows: [] };
  },
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { action } = body;

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Email and password are required' }) };
      }

      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];

      if (!user) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const token = jwt.sign(
        { userId: user.id, roleId: user.role_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ token }),
      };
    } else if (action === 'register') {
      const { role_id, name, email, phone, password, area_assigned } = body;
      if (!role_id || !name || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Missing required fields for registration' }) };
      }

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const newUser = {
        role_id,
        name,
        email,
        phone,
        password_hash,
        area_assigned,
        is_active: true, // Or based on verification logic
      };

      // In a real app, you would insert this into the database.
      // For now, we'll just log it.
      console.log('Registering new user:', newUser);

      // Mocking the DB insert
      // pool.query('INSERT INTO users(...) VALUES (...)', [...]);


      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'User registered successfully. Please check email for verification.' }),
      };
    }

    } else if (action === 'forgotPassword') {
      const { email } = body;
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = rows[0];

      if (user) {
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const msg = {
          to: user.email,
          from: process.env.FROM_EMAIL || 'noreply@amity.com',
          subject: 'Password Reset Request',
          text: `Please use the following link to reset your password: ${resetLink}`,
          html: `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
        };
        await sgMail.send(msg);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'If a user with that email exists, a password reset link has been sent.' }),
      };

    } else if (action === 'resetPassword') {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Token and new password are required.' }) };
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);

        // In a real app, update the user's password in the DB
        console.log(`Updating password for user ${decoded.userId} with new hash: ${password_hash}`);
        // pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, decoded.userId]);

        return { statusCode: 200, body: JSON.stringify({ message: 'Password has been reset successfully.' }) };

      } catch (err) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Invalid or expired token.' }) };
      }
    }

    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid action' }) };

  } catch (error) {
    console.error('Error in auth function:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
