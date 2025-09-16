const { getPool } = require('./lib/db');
const { requireAuth } = require('./middleware/auth');

exports.handler = async (event, context) => {
  const auth = requireAuth(event, [1, 2, 3]);
  if (auth.error) {
    return auth.response;
  }

  const pool = getPool();
  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean);
  const id = segments.length >= 2 && segments[0] === 'leads' ? parseInt(segments[1], 10) : null;

  try {
    // Handle specific sub-routes first
    if (id && segments[2] === 'calls') {
      if (event.httpMethod === 'GET') {
        const result = await pool.query('SELECT * FROM entrance_calls WHERE lead_id = $1 ORDER BY call_time DESC', [id]);
        return { statusCode: 200, body: JSON.stringify(result.rows) };
      }
      if (event.httpMethod === 'POST') {
        // called_by should come from the JWT (auth.decoded.userId)
        const { note, status } = JSON.parse(event.body);
        const result = await pool.query(
          'INSERT INTO entrance_calls (lead_id, called_by, note, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [id, auth.decoded.userId, note, status]
        );
        return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
      }
    }

    if (event.httpMethod === 'POST' && segments[1] === 'bulk-update') {
      const { updates } = JSON.parse(event.body); // updates = [{ form_no, result }]
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const update of updates) {
          await client.query('UPDATE leads SET form_stage = $1, modified_on = NOW() WHERE form_no = $2', [update.result, update.form_no]);
        }
        await client.query('COMMIT');
        return { statusCode: 200, body: JSON.stringify({ message: `Bulk update complete. ${updates.length} leads processed.` }) };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Handle generic CRUD on /leads
    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
          return result.rows.length > 0
            ? { statusCode: 200, body: JSON.stringify(result.rows[0]) }
            : { statusCode: 404, body: JSON.stringify({ message: 'Lead not found' }) };
        } else {
          const result = await pool.query('SELECT * FROM leads ORDER BY created_on DESC');
          return { statusCode: 200, body: JSON.stringify(result.rows) };
        }

      case 'POST':
        const { first_name, last_name, email, phone, course_applied } = JSON.parse(event.body);
        const result = await pool.query(
          'INSERT INTO leads (first_name, last_name, email, phone, course_applied) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [first_name, last_name, email, phone, course_applied]
        );
        return { statusCode: 201, body: JSON.stringify(result.rows[0]) };

      case 'PUT':
        if (!id) return { statusCode: 400, body: 'Lead ID required' };
        const data = JSON.parse(event.body);
        // Build a dynamic query to only update provided fields
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        const query = `UPDATE leads SET ${setClause}, modified_on = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
        const putResult = await pool.query(query, [...values, id]);
        return { statusCode: 200, body: JSON.stringify(putResult.rows[0]) };

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Database error in leads function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
