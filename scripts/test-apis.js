async function testAPIs() {
  const tests = [
    {
      name: "HF Spaces FLUX (Gradio API)",
      url: "https://black-forest-labs-flux-1-schnell.hf.space/api/predict",
      method: "POST",
      body: JSON.stringify({ data: ["a red apple on white background", 0, true, 256, 256, 4] }),
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "Segmind free API",
      url: "https://api.segmind.com/v1/sdxl1.0-txt2img",
      method: "POST",
      body: JSON.stringify({ prompt: "a red apple on white background" }),
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "Clipdrop (stability) free test",
      url: "https://clipdrop-api.co/text-to-image/v1",
      method: "POST",
      body: JSON.stringify({ prompt: "a red apple on white background" }),
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "Dezgo free API",
      url: "https://api.dezgo.com/text2image",
      method: "POST",
      body: new URLSearchParams({ prompt: "a red apple on white background", width: "256", height: "256" }).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  ]

  for (const test of tests) {
    console.log(`\n--- Testing: ${test.name} ---`)
    console.log(`URL: ${test.url}`)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      const start = Date.now()
      const opts = {
        method: test.method || "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: test.headers || {},
      }
      if (test.body) opts.body = test.body
      const res = await fetch(test.url, opts)
      clearTimeout(timeout)
      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`Status: ${res.status} ${res.statusText}`)
      const ct = res.headers.get("content-type") || ""
      console.log(`Content-Type: ${ct}`)
      console.log(`Time: ${elapsed}s`)
      if (res.ok && ct.includes("image")) {
        const buf = await res.arrayBuffer()
        console.log(`Image size: ${buf.byteLength} bytes`)
        console.log("SUCCESS - got image!")
      } else if (res.ok) {
        const text = await res.text()
        console.log(`OK response: ${text.slice(0, 500)}`)
      } else {
        const text = await res.text()
        console.log(`Error: ${text.slice(0, 500)}`)
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
    }
  }
}

testAPIs()
