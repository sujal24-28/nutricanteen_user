const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(`Problem with request: ${e.message}`));

req.write(JSON.stringify({ email: 'staff@nutricanteen.com', password: 'staff123' }));
req.end();
