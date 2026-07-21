import { z } from "zod";

const codePatterns = [
  /```/,
  /<\/?[a-z][\s\S]*>/i,
  /<script[\s\S]*?>/i,
  /\b(function|const|let|var|class|import|export)\b/,
  /\b(document|window|HTMLElement|canvas|getElementById|querySelector)\b/,
  /\bon\w+\s*=/i
];

const stemDomains = ["physics", "mathematics", "engineering", "chemistry", "biology"];
const controlTypes = ["range", "switch", "stepper", "select"];
const explanationLevels = ["student", "educator"];
const renderers = ["projectile", "wave", "trig", "beam", "logic", "pendulum", "circuit", "graph", "optics", "lens", "mirror"];

const cleanString = (max = 280) => z.string().trim().min(1).max(max).superRefine((value, ctx) => {
  if (codePatterns.some((pattern) => pattern.test(value))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Structured data must not contain HTML, scripts, markdown code fences, or frontend code."
    });
  }
});

export const LogicControlSchema = z.object({
  id: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(40),
  type: z.enum(controlTypes),
  min: z.number().finite(),
  max: z.number().finite(),
  unit: z.string().trim().max(24),
  default: z.number().finite()
}).strict().superRefine((control, ctx) => {
  if (control.min >= control.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["min"],
      message: "Control min must be lower than max."
    });
  }
  if (control.default < control.min || control.default > control.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["default"],
      message: "Control default must be inside min/max bounds."
    });
  }
  if (control.type === "switch" && (control.min !== 0 || control.max !== 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["type"],
      message: "Switch controls must use binary 0..1 bounds."
    });
  }
});

export const ClassroomActivitySchema = z.object({
  title: cleanString(80),
  purpose: cleanString(220),
  studentAction: cleanString(220),
  expectedObservation: cleanString(220)
}).strict();

export const GuidedExperimentSchema = z.object({
  step: z.number().int().positive().max(20),
  instruction: cleanString(240),
  variableId: z.string().trim().regex(/^[a-z][a-z0-9_]*$/).max(40).optional(),
  expectedResult: cleanString(240)
}).strict();

export const LogicCanvasSpecSchema = z.object({
  domain: z.enum(stemDomains),
  topic: cleanString(100),
  renderer: z.enum(renderers),
  controls: z.array(LogicControlSchema).min(1).max(8),
  equations: z.array(cleanString(160)).min(1).max(8),
  explanationLevel: z.enum(explanationLevels),
  learningObjectives: z.array(cleanString(180)).min(1).max(8),
  keyConcepts: z.array(cleanString(180)).min(1).max(8).optional().default([]),
  teachingNotes: cleanString(900).optional().default(""),
  misconceptions: z.array(cleanString(200)).min(1).max(8),
  discussionQuestions: z.array(cleanString(220)).min(1).max(8).optional().default([]),
  assessmentQuestions: z.array(cleanString(220)).min(1).max(8).optional().default([]),
  classroomActivities: z.array(ClassroomActivitySchema).min(1).max(6),
  guidedExperiments: z.array(GuidedExperimentSchema).min(1).max(10),
  realWorldApplications: z.array(cleanString(220)).min(1).max(8).optional().default([])
}).strict().superRefine((spec, ctx) => {
  const ids = new Set();
  for (const [index, control] of spec.controls.entries()) {
    if (ids.has(control.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["controls", index, "id"],
        message: "Control IDs must be unique."
      });
    }
    ids.add(control.id);
  }
  for (const [index, experiment] of spec.guidedExperiments.entries()) {
    if (experiment.variableId && !ids.has(experiment.variableId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guidedExperiments", index, "variableId"],
        message: "Experiment variableId must reference an existing control."
      });
    }
  }
});

export function assertJsonOnlyPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationBoundaryError("GPT payload must be a single JSON object.");
  }
  const serialized = JSON.stringify(value);
  if (codePatterns.some((pattern) => pattern.test(serialized))) {
    throw new ValidationBoundaryError("GPT payload contains blocked code or markup.");
  }
}

export class ValidationBoundaryError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "ValidationBoundaryError";
    this.issues = issues;
    this.statusCode = 422;
  }
}
