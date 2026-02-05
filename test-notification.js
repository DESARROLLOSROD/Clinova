
const https = require('https');

const data = JSON.stringify({
    type: 'whatsapp',
    phone: '+526182692461',
    message: 'Prueba Node.js'
});

const options = {
    hostname: 'clinova-production-561d.up.railway.app',
    path: '/api/test-notifications',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
