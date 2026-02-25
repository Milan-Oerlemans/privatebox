import N8NPage from "@/refresh-pages/N8NPage";

export default function Page() {
  // Use the proxied path defined in next.config.js
  const n8nUrl = "/n8n-proxy/";

  return <N8NPage n8nUrl={n8nUrl} />;
}
