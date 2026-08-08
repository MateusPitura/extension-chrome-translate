import { translate } from "./translate";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (
      request.method === "POST" &&
      new URL(request.url).pathname === "/translate"
    ) {
      return translate(request, env);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
