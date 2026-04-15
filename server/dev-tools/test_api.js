// DEV TOOL - NOT USED IN PRODUCTION
const axios = require('axios');
require('dotenv').config();

const testApi = async () => {
  try {
    // We need a token. Let's use the login endpoint.
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Token acquired.');

    console.log('Fetching /api/cycle/summary...');
    const res = await axios.get('http://localhost:5000/api/cycle/summary', {
      headers: { 'x-auth-token': token }
    });
    
    console.log('API RESPONSE:');
    console.log(JSON.stringify(res.data, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

testApi();
