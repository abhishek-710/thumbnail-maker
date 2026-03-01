const https = require('https');
const querystring = require('querystring');

const INFIP_API_KEY = process.env.INFIP_API_KEY;

if (!INFIP_API_KEY) {
  console.log('[TEST] ERROR: INFIP_API_KEY environment variable not set!');
  console.log('[TEST] Please set INFIP_API_KEY before running this test');
  process.exit(1);
}

console.log('[TEST] Starting Infip API test...');
console.log('[TEST] API Key (first 10 chars):', INFIP_API_KEY.substring(0, 10) + '...');

function httpsRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testInfipAPI() {
  try {
    console.log('\n[TEST] Step 1: Submitting image generation request to Infip API');
    console.log('[TEST] Prompt: "A beautiful sunset over mountains with vibrant colors"');
    console.log('[TEST] Size: 1024x1024');
    console.log('[TEST] Model: z-image-turbo');

    const submissionData = {
      model: 'z-image-turbo',
      prompt: 'A beautiful sunset over mountains with vibrant orange and purple colors, cinematic lighting',
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    };

    const submissionResult = await httpsRequest('https://api.infip.pro/v1/images/generations', {
      hostname: 'api.infip.pro',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INFIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(submissionData)),
      },
    }, submissionData);

    console.log('\n[TEST] Submission Response Status:', submissionResult.status);
    console.log('[TEST] Submission Response:', JSON.stringify(submissionResult.body, null, 2));

    if (submissionResult.status < 200 || submissionResult.status > 202) {
      console.log('[TEST] ERROR: Expected 200-202 status, got:', submissionResult.status);
      return;
    }

    const responseData = submissionResult.body;

    // Check for immediate result
    if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
      console.log('\n[TEST] SUCCESS: Got immediate result with', responseData.data.length, 'images');
      responseData.data.forEach((img, i) => {
        console.log(`[TEST] Image ${i + 1} URL:`, img.url);
      });
      return;
    }

    // Check for async processing
    if (!responseData.task_id) {
      console.log('[TEST] ERROR: No task_id in response and no immediate data');
      console.log('[TEST] Response structure:', Object.keys(responseData));
      return;
    }

    console.log('\n[TEST] Step 2: Got task_id, starting async polling');
    console.log('[TEST] Task ID:', responseData.task_id);
    console.log('[TEST] Poll URL:', responseData.poll_url);

    if (!responseData.poll_url) {
      console.log('[TEST] ERROR: No poll_url provided');
      return;
    }

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!completed && attempts < maxAttempts) {
      attempts++;
      const delayMs = Math.min(2000 + attempts * 500, 5000);
      
      console.log(`\n[TEST] Polling attempt ${attempts}/${maxAttempts}... waiting ${delayMs}ms before checking`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      const pollUrl = new URL(responseData.poll_url);
      const pollResult = await httpsRequest(responseData.poll_url, {
        hostname: pollUrl.hostname,
        path: pollUrl.pathname + pollUrl.search,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INFIP_API_KEY}`,
        },
      });

      console.log(`[TEST] Poll response status: ${pollResult.status}`);

      if (pollResult.status !== 200) {
        console.log('[TEST] ERROR: Poll returned', pollResult.status);
        console.log('[TEST] Response:', JSON.stringify(pollResult.body, null, 2));
        break;
      }

      const pollData = pollResult.body;
      console.log(`[TEST] Status: "${pollData.status}"`);

      if (pollData.status === 'completed') {
        completed = true;
        console.log('\n[TEST] SUCCESS: Generation completed!');
        
        if (pollData.data && Array.isArray(pollData.data)) {
          console.log('[TEST] Got', pollData.data.length, 'images');
          pollData.data.forEach((img, i) => {
            console.log(`[TEST] Image ${i + 1}:`, img.url);
          });
        } else {
          console.log('[TEST] No images in completed response');
          console.log('[TEST] Full response:', JSON.stringify(pollData, null, 2));
        }
      } else if (pollData.status === 'failed' || pollData.status === 'error') {
        console.log('\n[TEST] ERROR: Task failed');
        console.log('[TEST] Error:', pollData.error || pollData);
        break;
      }
    }

    if (!completed) {
      console.log(`\n[TEST] ERROR: Polling timed out after ${attempts} attempts (${attempts * 2}+ seconds)`);
    }

  } catch (err) {
    console.log('[TEST] EXCEPTION:', err.message);
    console.log('[TEST] Stack:', err.stack);
  }
}

testInfipAPI();
