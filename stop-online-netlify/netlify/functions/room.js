const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const store = getStore({ name: 'stop-rooms', consistency: 'strong' });

  if (event.httpMethod === 'GET') {
    const code = (event.queryStringParameters || {}).code;
    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing code' }) };
    }
    const data = await store.get(code, { type: 'json' });
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data || null)
    };
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: 'invalid json' }) };
    }
    if (!body.code || !body.room) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing code/room' }) };
    }
    await store.setJSON(body.code, body.room);
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
