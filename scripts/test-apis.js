async function testAPIs() {
  const tests = [
    {
      name: "Pollinations flux",
      url: "https://image.pollinations.ai/prompt/a%20red%20apple%20on%20white%20background?width=256&height=256&seed=1&model=flux&nologo=true&enhance=false",
    },
    {
      name: "Pollinations turbo",
      url: "https://image.pollinations.ai/prompt/a%20red%20apple%20on%20white%20background?width=256&height=256&seed=1&model=turbo&nologo=true",
    },
    {
      name: "Pollinations simple",
      url: "https://image.pollinations.ai/prompt/red%20apple?width=256&height=256&nologo=true",
    },
  ]

  for (const test of tests) {
    console.log(`\nTesting: ${test.name}`)
    console.log(`URL: ${test.url}`)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90000)
      const start = Date.now()
      const res = await fetch(test.url, {
        signal: controller.signal,
        redirect: "follow",
      })
      clearTimeout(timeout)
      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`Status: ${res.status} ${res.statusText}`)
      console.log(`Content-Type: ${res.headers.get("content-type")}`)
      console.log(`Content-Length: ${res.headers.get("content-length")}`)
      console.log(`Time: ${elapsed}s`)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        console.log(`Body size: ${buf.byteLength} bytes`)
        console.log("SUCCESS")
      } else {
        const text = await res.text()
        console.log(`Error body: ${text.slice(0, 300)}`)
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
    }
  }
}

testAPIs()
