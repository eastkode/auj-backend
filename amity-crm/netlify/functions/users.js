const { getPool } = require('./lib/db');
const { requireAuth } = require('./middleware/auth');

exports.handler = async (event, context) => {
  // Protect this function - only Admins and Super Admins can manage users
  const auth = requireAuth(event, [1, 2]);
  if (auth.error) {
    return auth.response;
  }

  const pool = getPool();
  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);
  const id = segments.length === 2 ? parseInt(segments[1], 10) : null;

  try {
    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          const result = await pool.query('SELECT id, role_id, name, email, phone, area_assigned, is_active FROM users WHERE id = $1', [id]);
          return result.rows.length > 0
            ? { statusCode: 200, body: JSON.stringify(result.rows[0]) }
            : { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
        } else {
          const result = await pool.query('SELECT id, role_id, name, email, phone, area_assigned, is_active FROM users ORDER BY id');
          return { statusCode: 200, body: JSON.stringify(result.rows) };
        }

      case 'POST':
        const { role_id, name, email, phone, area_assigned, is_active } = JSON.parse(event.body);
        // Note: This simplified POST does not handle passwords. User creation should go through the register flow.
        // This endpoint is for admins creating user shells.
        const postResult = await pool.query(
          'INSERT INTO users (role_id, name, email, phone, area_assigned, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [role_id, name, email, phone, area_assigned, is_active]
        );
        return { statusCode: 201, body: JSON.stringify(postResult.rows[0]) };

      case 'PUT':
        if (!id) return { statusCode: 400, body: 'User ID required' };
        const dataToUpdate = JSON.parse(event.body);
        // A real implementation should be more robust, dynamically building the query
        // based on fields provided to avoid updating everything.
        const putResult = await pool.query(
          'UPDATE users SET role_id = $1, name = $2, email = $3, phone = $4, area_assigned = $5, is_active = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
          [dataToUpdate.role_id, dataToUpdate.name, dataToUpdate.email, dataToUpdate.phone, dataToUpdate.area_assigned, dataToUpdate.is_active, id]
        );
        return { statusCode: 200, body: JSON.stringify(putResult.rows[0]) };

      case 'DELETE':
        if (!id) return { statusCode: 400, body: 'User ID required' };
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return { statusCode: 200, body: JSON.stringify({ message: 'User deleted successfully' }) };

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Database error in users function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
