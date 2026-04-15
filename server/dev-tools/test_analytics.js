// DEV TOOL - NOT USED IN PRODUCTION
const axios = require('axios');

const testAnalytics = async () => {
  try {
    console.log('Logging in as Pro User...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'pro_discipline@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Token acquired.');

    console.log('Fetching /api/analytics/monthly...');
    const res = await axios.get('http://localhost:5000/api/analytics/monthly', {
      headers: { 'x-auth-token': token }
    });
    
    console.log('API RESPONSE Status:', res.status);
    console.log('API RESPONSE Body:', JSON.stringify(res.data, null, 2));

    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    } else {
      console.error('Error Message:', err.message);
    }
    process.exit(1);
  }
};

testAnalytics();
