const https = require('https');

const apiKey = process.env.INFIP_API_KEY;
if (!apiKey) {
  console.log('ERROR: INFIP_API_KEY not set');
  process.exit(1);
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('Testing Infip API...');
  
  // Submit request
  console.log('\n1. Submitting image generation request...');
  const submit = await makeRequest(
    'https://api.infip.pro/v1/images/generations',
    'POST',
    {
      model: 'z-image-turbo',
      prompt: 'A beautiful sunset over mountains',
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    }
  );

  console.log('Response Status:', submit.status);
  console.log('Response Data:', JSON.stringify(submit.data, null, 2));

  if (!submit.data.task_id) {
    console.log('ERROR: No task_id in response');
    return;
  }

  console.log('\n2. Task ID:', submit.data.task_id);
  console.log('Poll URL:', submit.data.poll_url);

  // Poll with short timeout
  console.log('\n3. Starting to poll for completion (max 10 attempts)...');
  for (let i = 0; i < 10; i++) {
    console.log(`\nAttempt ${i + 1}: Waiting 3 seconds...`);
    await new Promise(r => setTimeout(r, 3000));

    const poll = await makeRequest(submit.data.poll_url, 'GET', null);
    console.log('Poll Status:', poll.status);
    console.log('Task Status:', poll.data.status);

    if (poll.data.status === 'completed') {
      console.log('\n✓ COMPLETED! Got images:');
      if (poll.data.data && Array.isArray(poll.data.data)) {
        poll.data.data.forEach((img, idx) => {
          console.log(`  Image ${idx + 1}: ${img.url}`);
        });
      }
      return;
    }

    if (poll.data.status === 'failed' || poll.data.status === 'error') {
      console.log('\n✗ FAILED:', poll.data.error);
      return;
    }

    console.log('Still processing...');
  }

  console.log('\nPolling timed out');
}

test().catch(console.error);
