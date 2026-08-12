export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getApiHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) {
    throw new Error(`API health check failed: ${res.status}`);
  }
  return res.json() as Promise<{ status: string }>;
}
