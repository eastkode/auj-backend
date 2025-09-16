// Mock leads data
let leads = [
  {
    id: 1,
    form_no: 'AMITY001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-1234',
    course_applied: 'B.Tech CSE',
    form_stage: 'form_submitted',
    assigned_to: 3,
    created_on: new Date().toISOString(),
  },
  {
    id: 2,
    form_no: 'AMITY002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '555-5678',
    course_applied: 'MBA',
    form_stage: 'selected',
    assigned_to: 3,
    created_on: new Date().toISOString(),
  },
];

let entranceCalls = [];

exports.handler = async (event, context) => {
  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(Boolean); // e.g., ['leads', '1', 'calls']

  try {
    switch (event.httpMethod) {
      case 'GET': // Get all leads or a single lead
        if (segments[0] === 'leads' && segments.length === 1) {
          return { statusCode: 200, body: JSON.stringify(leads) };
        }
        if (segments[0] === 'leads' && segments.length === 2) {
          const id = parseInt(segments[1], 10);
          const lead = leads.find(l => l.id === id);
          return lead ? { statusCode: 200, body: JSON.stringify(lead) } : { statusCode: 404, body: 'Lead not found' };
        }
        break;

      case 'POST':
        if (segments[0] === 'leads' && segments.length === 1) { // Create a new lead
          const data = JSON.parse(event.body);
          const newLead = { id: Math.max(0, ...leads.map(l => l.id)) + 1, ...data };
          leads.push(newLead);
          return { statusCode: 201, body: JSON.stringify(newLead) };
        }
        if (segments[0] === 'leads' && segments.length === 3 && segments[2] === 'calls') { // Log an entrance call
          const leadId = parseInt(segments[1], 10);
          const callData = JSON.parse(event.body);
          const newCall = { id: entranceCalls.length + 1, lead_id: leadId, ...callData };
          entranceCalls.push(newCall);
          console.log('New Entrance Call:', newCall);
          return { statusCode: 201, body: JSON.stringify(newCall) };
        }
        if (segments[0] === 'leads' && segments[1] === 'upload-results') { // Upload results
            // This is a complex feature (parsing CSV, etc.). For now, we'll just acknowledge.
            console.log('Received results upload:', event.body);
            return { statusCode: 200, body: JSON.stringify({ message: 'Results received for processing.' }) };
        }
        break;

      case 'PUT': // Update a lead
        if (segments[0] === 'leads' && segments.length === 2) {
          const id = parseInt(segments[1], 10);
          const updatedData = JSON.parse(event.body);
          const leadIndex = leads.findIndex(l => l.id === id);
          if (leadIndex !== -1) {
            leads[leadIndex] = { ...leads[leadIndex], ...updatedData };
            return { statusCode: 200, body: JSON.stringify(leads[leadIndex]) };
          } else {
            return { statusCode: 404, body: 'Lead not found' };
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
