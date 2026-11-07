import { translate } from "./translate";
import { transcribe } from "./transcribe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Worker-Api-Key",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (
      (url.pathname === "/translate" || url.pathname === "/transcribe") &&
      (!env.WORKER_API_KEY || request.headers.get("X-Worker-Api-Key") !== env.WORKER_API_KEY)
    ) {
      return withCors(Response.json({ error: "Unauthorized" }, { status: 401 }));
    }

    if (request.method === "POST" && url.pathname === "/translate") {
      return withCors(await translate(request, env));
    }

    if (request.method === "POST" && url.pathname === "/transcribe") {
      return withCors(await transcribe(request, env));
    }

    return withCors(
      Response.json({ error: "Not found" }, { status: 404 }),
    );
  },
} satisfies ExportedHandler<Env>;
