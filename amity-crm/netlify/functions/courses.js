const { getPool } = require('./lib/db');
const { requireAuth } = require('./middleware/auth');

exports.handler = async (event, context) => {
  // Protect this function - only Admins and Super Admins can manage courses
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
        const result = id
          ? await pool.query('SELECT * FROM courses WHERE id = $1', [id])
          : await pool.query('SELECT * FROM courses ORDER BY name');
        return { statusCode: 200, body: JSON.stringify(result.rows) };

      case 'POST':
        const { name, fee } = JSON.parse(event.body);
        const postResult = await pool.query(
          'INSERT INTO courses (name, fee) VALUES ($1, $2) RETURNING *',
          [name, fee]
        );
        return { statusCode: 201, body: JSON.stringify(postResult.rows[0]) };

      case 'PUT':
        if (!id) return { statusCode: 400, body: 'Course ID required' };
        const { name: putName, fee: putFee } = JSON.parse(event.body);
        const putResult = await pool.query(
          'UPDATE courses SET name = $1, fee = $2 WHERE id = $3 RETURNING *',
          [putName, putFee, id]
        );
        return { statusCode: 200, body: JSON.stringify(putResult.rows[0]) };

      case 'DELETE':
        if (!id) return { statusCode: 400, body: 'Course ID required' };
        await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return { statusCode: 204, body: '' }; // No content

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Database error in courses function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
