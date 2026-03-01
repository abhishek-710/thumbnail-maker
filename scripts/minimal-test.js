const http = require('http');
const https = require('https');

const testApiKey = 'test-key'; // Using test key to see what error we get
const prompt = 'A beautiful sunset over mountains';

console.log('[TEST] Starting Infip API test...');
console.log('[TEST] API Key:', testApiKey ? 'SET' : 'MISSING');
console.log('[TEST] Prompt:', prompt);

const requestBody = JSON.stringify({
  model: 'z-image-turbo',
  prompt: prompt,
  n: 1,
  size: '1024x1024',
  response_format: 'url'
});

const options = {
  hostname: 'api.infip.pro',
  port: 443,
  path: '/v1/images/generations',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + testApiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody)
  }
};

console.log('[TEST] Sending request to:', options.hostname + options.path);

const req = https.request(options, (res) => {
  console.log('[TEST] Response Status:', res.statusCode);
  console.log('[TEST] Response Headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('[TEST] Response Body:', data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('[TEST] Parsed Response:', JSON.stringify(parsed, null, 2));
      
      if (parsed.task_id && parsed.poll_url) {
        console.log('[TEST] SUCCESS - Got task_id:', parsed.task_id);
        console.log('[TEST] Poll URL:', parsed.poll_url);
      } else if (parsed.data && Array.isArray(parsed.data)) {
        console.log('[TEST] SUCCESS - Got immediate results:', parsed.data.length, 'images');
      } else {
        console.log('[TEST] Response format not recognized');
      }
    } catch (e) {
      console.log('[TEST] Could not parse as JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('[TEST] Request error:', e.message);
});

req.write(requestBody);
req.end();

console.log('[TEST] Request sent, waiting for response...');
