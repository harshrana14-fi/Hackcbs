import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/voters/VCDL000025OCBJLM5/history',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();