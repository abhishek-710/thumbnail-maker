// Test Pollinations.ai image generation API
const prompt = "a cute cat sitting on a table";
const encodedPrompt = encodeURIComponent(prompt);
const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=42&model=flux&nologo=true`;

console.log("[v0] Testing URL:", url);

try {
  const response = await fetch(url, { redirect: "follow" });
  console.log("[v0] Status:", response.status);
  console.log("[v0] Content-Type:", response.headers.get("content-type"));
  console.log("[v0] Content-Length:", response.headers.get("content-length"));

  const buffer = await response.arrayBuffer();
  console.log("[v0] Response size (bytes):", buffer.byteLength);

  // Check if the response is actually an image
  const bytes = new Uint8Array(buffer);
  // PNG starts with 137 80 78 71, JPEG with 255 216
  const isPNG = bytes[0] === 137 && bytes[1] === 80;
  const isJPEG = bytes[0] === 255 && bytes[1] === 216;
  console.log("[v0] Is PNG:", isPNG);
  console.log("[v0] Is JPEG:", isJPEG);
  console.log("[v0] First 10 bytes:", Array.from(bytes.slice(0, 10)));

  if (!isPNG && !isJPEG) {
    // Maybe it's text/HTML error
    const text = new TextDecoder().decode(buffer.slice(0, 500));
    console.log("[v0] Response text (first 500 chars):", text);
  }
} catch (err) {
  console.log("[v0] Error:", err.message);
}
