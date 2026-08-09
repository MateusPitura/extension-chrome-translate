interface TranslationMessage {
  sender: string;
  text: string;
}

interface TranslationRequest {
  model: string;
  isTranslationModel: boolean;
  inputLanguage: string;
  outputLanguage: string;
  messages: TranslationMessage[];
}

interface AIResponse {
  choices: {
    message: {
      content: string;
      reasoning: string;
      reasoning_content: string;
    };
  }[];
}

export async function translate(request: Request, env: Env): Promise<Response> {
  let body: TranslationRequest;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.model ||
    !body.inputLanguage ||
    !body.outputLanguage ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0
  ) {
    return Response.json(
      {
        error: "model, inputLanguage, outputLanguage and messages are required",
      },
      { status: 400 },
    );
  }

  const messages = body.messages.slice(-10);
  const lastMessage = messages[messages.length - 1];

  const conversation = messages
    .map((message) => `${message.sender}: ${message.text}`)
    .join("\n");

  const prompt = `
Translate the LAST message in the conversation.

Source language: ${body.inputLanguage}
Target language: ${body.outputLanguage}

Conversation context:
${conversation}

Instructions:
- Translate only the LAST message.
- Return the COMPLETE translation of the LAST message. Never truncate, shorten, summarize, or omit any part of it.
- Use the previous messages only as context to understand the LAST message.
- Translate messages even when they contain errors, typos, or grammatical mistakes.
- Preserve the original meaning, tone, and level of detail.
- Keep slang and informal language natural.
- Do not translate people's names.
- Do not add explanations, comments, or quotation marks.
- Return only the translated text.
`.trim();

  try {
    const result = (await env.AI.run(body.model, {
      messages: [
        {
          role: "system",
          content: "You are a precise conversational translator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })) as unknown as AIResponse;

    console.log("result: ", JSON.stringify(result));

    return Response.json({
      translation: result.choices[0].message.content,
      original: lastMessage.text,
      model: body.model,
    });
  } catch (error) {
    console.error("Translation error:", error);

    return Response.json(
      {
        error: "Translation failed",
        model: body.model,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
