import fetch from 'node-fetch';

const INFIP_API_KEY = process.env.INFIP_API_KEY;

if (!INFIP_API_KEY) {
  console.error('[TEST] INFIP_API_KEY environment variable not set!');
  process.exit(1);
}

console.log('[TEST] Starting Infip API test...');
console.log('[TEST] API Key:', INFIP_API_KEY.substring(0, 10) + '...');

async function testInfipAPI() {
  try {
    console.log('[TEST] Submitting image generation request...');
    
    const submissionResponse = await fetch('https://api.infip.pro/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INFIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'z-image-turbo',
        prompt: 'A beautiful sunset over mountains with vibrant orange and purple colors',
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    });

    console.log('[TEST] Submission Response Status:', submissionResponse.status);
    
    if (!submissionResponse.ok) {
      const errorData = await submissionResponse.json();
      console.error('[TEST] Submission failed:', errorData);
      return;
    }

    const submissionData = await submissionResponse.json();
    console.log('[TEST] Submission Response:', JSON.stringify(submissionData, null, 2));

    // Check if we got immediate result
    if (submissionData.data && Array.isArray(submissionData.data)) {
      console.log('[TEST] Got immediate result with', submissionData.data.length, 'images');
      submissionData.data.forEach((img, i) => {
        console.log(`[TEST] Image ${i + 1} URL:`, img.url);
      });
      return;
    }

    // Check if we got task_id for async processing
    if (!submissionData.task_id || !submissionData.poll_url) {
      console.error('[TEST] No task_id or poll_url in response');
      return;
    }

    console.log('[TEST] Got task_id:', submissionData.task_id);
    console.log('[TEST] Poll URL:', submissionData.poll_url);

    // Poll for completion
    console.log('[TEST] Starting to poll for completion...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!completed && attempts < maxAttempts) {
      attempts++;
      const delayMs = Math.min(1000 + attempts * 500, 5000);
      
      console.log(`[TEST] Polling attempt ${attempts}/${maxAttempts}... waiting ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      const pollResponse = await fetch(submissionData.poll_url, {
        headers: {
          'Authorization': `Bearer ${INFIP_API_KEY}`,
        },
      });

      console.log(`[TEST] Poll response status: ${pollResponse.status}`);

      if (!pollResponse.ok) {
        const errorData = await pollResponse.json();
        console.error('[TEST] Poll failed:', errorData);
        break;
      }

      const pollData = await pollResponse.json();
      console.log(`[TEST] Poll status: ${pollData.status}`);

      if (pollData.status === 'completed') {
        completed = true;
        console.log('[TEST] Generation completed!');
        
        if (pollData.data && Array.isArray(pollData.data)) {
          console.log('[TEST] Got', pollData.data.length, 'images');
          pollData.data.forEach((img, i) => {
            console.log(`[TEST] Image ${i + 1} URL:`, img.url);
          });
        } else {
          console.log('[TEST] No images in completed response');
          console.log('[TEST] Full response:', JSON.stringify(pollData, null, 2));
        }
      } else if (pollData.status === 'failed' || pollData.status === 'error') {
        console.error('[TEST] Task failed:', pollData.error?.message || pollData);
        break;
      }
    }

    if (!completed) {
      console.error('[TEST] Polling timed out after', attempts, 'attempts');
    }
  } catch (err) {
    console.error('[TEST] Error:', err);
  }
}

testInfipAPI();
