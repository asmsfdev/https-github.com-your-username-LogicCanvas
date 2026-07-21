import { LogicCanvasSpecSchema, ValidationBoundaryError, assertJsonOnlyPayload } from "./logicCanvasContract.js";

export const GPT_JSON_ONLY_SYSTEM_CONTRACT = [
  "You are the LogicCanvas scientific reasoning stage.",
  "Return only a raw JSON object.",
  "Never return HTML, JavaScript, CSS, markdown, code fences, script tags, or frontend code.",
  "Do not include keys outside the LogicCanvas schema.",
  "The downstream code factory is the only stage allowed to create executable HTML."
].join(" ");

export function validateReasoningPayload(payload) {
  assertJsonOnlyPayload(payload);
  const result = LogicCanvasSpecSchema.safeParse(payload);
  if (!result.success) {
    throw new ValidationBoundaryError("LogicCanvas validation boundary rejected the reasoning payload.", result.error.issues);
  }
  return result.data;
}

export async function executeLogicCanvasOrchestration({ prompt, gptReasoningPayload, reasoningFactory, audience = "teacher", codexFactory }) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new ValidationBoundaryError("Teacher prompt is required.");
  }
  if (typeof codexFactory !== "function") {
    throw new ValidationBoundaryError("Downstream code factory is unavailable.");
  }
  const reasoningPayload = gptReasoningPayload || (typeof reasoningFactory === "function" ? await reasoningFactory(prompt, audience) : null);
  const validatedSpec = validateReasoningPayload(reasoningPayload);
  return { spec: validatedSpec, html: await codexFactory(validatedSpec) };
}

export async function handleOrchestrationRequest(request, response, codexFactory, reasoningFactory) {
  try {
    const body = await readJsonBody(request);
    const html = await executeLogicCanvasOrchestration({
      prompt: body.prompt,
      gptReasoningPayload: body.gptReasoningPayload,
      reasoningFactory,
      audience: body.audience,
      codexFactory
    });
    sendJson(response, 200, { ok: true, ...result });
  } catch (error) {
    if (error instanceof ValidationBoundaryError) {
      sendJson(response, error.statusCode, {
        ok: false,
        error: error.name,
        message: error.message,
        issues: error.issues
      });
      return;
    }
    sendJson(response, 500, {
      ok: false,
      error: "ExecutionBoundaryError",
      message: "The lesson could not be generated."
    });
  }
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    throw new ValidationBoundaryError("Request body is required.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new ValidationBoundaryError("Request body must be valid JSON.");
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
