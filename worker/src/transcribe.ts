interface TranscriptionRequest {
  model: string;
  audioBase64: string;
  fileName: string;
}

interface TranscriptionResult {
  text: string;
}

export async function transcribe(
  request: Request,
  env: Env,
): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const body = payload as Partial<TranscriptionRequest>;

  if (typeof body.model !== "string" || !body.model.trim()) {
    return Response.json({ error: "model is required" }, { status: 400 });
  }

  if (typeof body.audioBase64 !== "string" || !body.audioBase64.trim()) {
    return Response.json({ error: "audioBase64 is required" }, { status: 400 });
  }

  if (typeof body.fileName !== "string" || !body.fileName.trim()) {
    return Response.json({ error: "fileName is required" }, { status: 400 });
  }

  const fileName = body.fileName.toLowerCase().split(/[?#]/, 1)[0];
  if (!fileName.endsWith(".oga") && !fileName.endsWith(".opus")) {
    return Response.json(
      { error: "Audio file must use the .oga or .opus extension" },
      { status: 400 },
    );
  }

  const audioBase64 = body.audioBase64.trim();
  if (
    audioBase64.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      audioBase64,
    )
  ) {
    return Response.json(
      { error: "audioBase64 must be a valid base64 string" },
      { status: 400 },
    );
  }

  const model = body.model.trim();

  try {
    const input = { audio: audioBase64 };
    const result = (await env.AI.run(
      model,
      input,
    )) as unknown as TranscriptionResult;

    if (!result.text?.trim()) {
      return Response.json(
        { error: "No transcription returned", model },
        { status: 502 },
      );
    }

    return Response.json({ transcription: result.text.trim(), model });
  } catch (error) {
    console.error("Transcription error:", error);

    return Response.json(
      {
        error: "Transcription failed",
        model,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
