/**
 * Health check endpoint
 * Used for monitoring and uptime checks
 */
export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
