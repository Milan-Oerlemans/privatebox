export async function GET() {
  return new Response("window.BASE_PATH = '/n8n-proxy/';", {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}
