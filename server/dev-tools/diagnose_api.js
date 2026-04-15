// DEV TOOL - NOT USED IN PRODUCTION
const registerLoginAndFetch = async () => {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    console.log(`Registering ${email}...`);
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Reg Failed: ${JSON.stringify(regData)}`);
    console.log('Registration successful.');

    const token = regData.token;
    console.log('Token acquired.');

    console.log('Fetching /api/cycle/summary...');
    const res = await fetch('http://localhost:5000/api/cycle/summary', {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    console.log('API RESPONSE KEYS:', Object.keys(data).join(', '));
    console.log('FULL DATA:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
};

registerLoginAndFetch();
