import OpenAI from "openai";

const model = process.env.OPENAI_REASONING_MODEL || "gpt-5.6-terra";
const supportedModels = new Set(["gpt-5.6", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"]);

const stringArray = {
  type: "array",
  minItems: 1,
  maxItems: 8,
  items: { type: "string", minLength: 1, maxLength: 240 }
};

export const logicCanvasResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["domain", "topic", "renderer", "controls", "equations", "explanationLevel", "learningObjectives", "keyConcepts", "teachingNotes", "misconceptions", "discussionQuestions", "assessmentQuestions", "classroomActivities", "guidedExperiments", "realWorldApplications"],
  properties: {
    domain: { type: "string", enum: ["physics", "mathematics", "engineering"] },
    topic: { type: "string", minLength: 1, maxLength: 100 },
    renderer: { type: "string", enum: ["projectile", "wave", "trig", "beam", "logic", "pendulum", "circuit", "graph", "optics", "lens", "mirror"] },
    controls: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "min", "max", "unit", "default"],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_]*$", maxLength: 40 },
          type: { type: "string", enum: ["range", "switch", "stepper", "select"] },
          min: { type: "number" },
          max: { type: "number" },
          unit: { type: "string", maxLength: 24 },
          default: { type: "number" }
        }
      }
    },
    equations: stringArray,
    explanationLevel: { type: "string", enum: ["student", "educator"] },
    learningObjectives: stringArray,
    keyConcepts: stringArray,
    teachingNotes: { type: "string", minLength: 1, maxLength: 900 },
    misconceptions: stringArray,
    discussionQuestions: stringArray,
    assessmentQuestions: stringArray,
    classroomActivities: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "purpose", "studentAction", "expectedObservation"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 80 },
          purpose: { type: "string", minLength: 1, maxLength: 220 },
          studentAction: { type: "string", minLength: 1, maxLength: 220 },
          expectedObservation: { type: "string", minLength: 1, maxLength: 220 }
        }
      }
    },
    guidedExperiments: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["step", "instruction", "expectedResult"],
        properties: {
          step: { type: "integer", minimum: 1, maximum: 20 },
          instruction: { type: "string", minLength: 1, maxLength: 240 },
          variableId: { type: ["string", "null"], pattern: "^[a-z][a-z0-9_]*$", maxLength: 40 },
          expectedResult: { type: "string", minLength: 1, maxLength: 240 }
        }
      }
    },
    realWorldApplications: stringArray
  }
};

const systemPrompt = [
  "You are LogicCanvas's scientific reasoning stage.",
  "Return only the JSON object that matches the supplied schema.",
  "Never return HTML, JavaScript, CSS, markdown, code fences, script tags, or frontend code.",
  "Stay within physics, mathematics, and core engineering.",
  "Use a pre-built renderer and produce bounded, classroom-safe controls.",
  "Every equation, activity, and explanation must be scientifically consistent with the requested concept."
].join(" ");

export function getOpenAIStatus() {
  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    model,
    supportedModel: supportedModels.has(model),
    mode: process.env.OPENAI_API_KEY ? "live" : "demo"
  };
}

export async function generateLogicCanvasSpec(prompt, audience = "teacher") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  if (!supportedModels.has(model)) {
    throw new Error(`Unsupported OPENAI_REASONING_MODEL: ${model}`);
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: `Audience: ${audience}. Teacher request: ${prompt}` }] }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "logiccanvas_visualization_spec",
        strict: true,
        schema: logicCanvasResponseSchema
      }
    }
  });
  if (!response.output_text) {
    throw new Error("The reasoning model returned no structured output.");
  }
  return JSON.parse(response.output_text);
}
