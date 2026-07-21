# LogicCanvas

**AI-Powered STEM Simulations for Teacher-Led Discovery**

**Source:** [GitHub repository](https://github.com/asmsfdev/https-github.com-your-username-LogicCanvas)

LogicCanvas helps teachers turn an abstract Physics, Mathematics, or Core Engineering concept into an interactive, classroom-ready visual model. Students adjust meaningful variables, observe the model respond, and use guided prompts to explain the evidence they see.

The project is built for a practical classroom constraint: teachers need a clear way to make difficult concepts visible without relying on expensive physical lab equipment or switching between multiple disconnected tools.

## Why It Matters

Interactive simulations are most useful when they support a teacher's lesson rather than replace it. LogicCanvas pairs a reusable, deterministic canvas runtime with teaching context:

- A concept prompt and ready lesson library for fast lesson selection.
- Live controls that change the active simulation immediately.
- Student-facing explanations, guided experiments, and real-world connections.
- Teacher-only lesson materials, answer cues, challenges, and a printable handout.
- A classroom layout that keeps the model, controls, and conceptual support visible together.

## Demo Flow

1. Search a ready lesson such as `Projectile Motion`, `Snell's Law`, `Newton's Laws`, `Ohm's Law`, `Pendulum`, `Vector Field`, or `Pythagorean Theorem`.
2. Open the visual model and adjust the controls.
3. Use `Live Observation` and `Explain This` to connect changes in the diagram to the relevant relationship.
4. Switch to Teacher Workspace for lesson planning, challenge cards, answer cues, supporting materials, and PDF handout export.
5. Switch to Classroom Mode for a student-facing exploration workflow.

## Features

### Interactive STEM Models

- Projectile motion with launch speed, angle, and gravity.
- Snell's law with incident angle and refractive indices.
- Newton's second law with mass, force, friction, and motion.
- Parallel circuits and Ohm's law relationships.
- Simple pendulum motion.
- Wave interference and trigonometric graphs.
- Vector fields.
- Pythagorean theorem and right-triangle relationships.
- Beam deflection.
- Logic gates.

Each model uses a pre-built HTML5 Canvas renderer rather than generating arbitrary renderer code at runtime. Controls are bounded and mapped directly to the active model.

### Teacher Workflow

- Prompt history and ready lesson search.
- Auto-generated lesson metadata: student takeaways, grade range, prerequisites, difficulty, and estimated teaching time.
- Student Challenge Mode with inline teacher answers and cues.
- Teaching notes, misconceptions, discussion questions, assessment prompts, and guided experiments.
- Two-page print/PDF handout with the model summary, starting controls, student challenges, and supporting materials.

### Classroom Workflow

- Clear lesson overview and an accessible "In simpler terms" explanation.
- Step-by-step student investigation prompts.
- Dynamic controls, live observations, formulas, real-world applications, and explanations tied to the active model.
- Responsive desktop, tablet, and mobile layouts with keyboard-accessible controls.

## Trust and Safety Architecture

LogicCanvas separates scientific reasoning from runtime rendering:

```text
Teacher prompt
  -> Structured reasoning payload
  -> JSON-only and Zod validation boundary
  -> Trusted renderer selection
  -> Runtime loop shield
  -> Sandboxed iframe canvas
  -> Teacher or classroom workspace
```

- **Structured reasoning:** The server-side reasoning contract requests JSON only and rejects HTML, scripts, markdown, and unknown fields.
- **Zod validation:** The validation boundary checks domains, controls, equations, educational material, and allowed renderer types.
- **Trusted rendering:** The canvas SDK provides reusable renderers instead of accepting arbitrary generated rendering engines.
- **Runtime shield:** Loop checks are injected into compiled payloads to stop unbounded iterations.
- **Sandboxing:** Visualizations run in a restricted iframe using `sandbox="allow-scripts"`.
- **Educational alignment:** Renderer-specific content profiles and alignment checks prevent cross-topic teaching material from appearing in the wrong lesson.

## Run Locally

### Requirements

- Node.js 18 or later

### Install and start

```bash
npm install
npm run serve
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Verify the project

```bash
npm run check
```

## OpenAI Reasoning Contract

The repository includes a server-side OpenAI reasoning module in `backend/openaiReasoning.js`. It uses structured JSON-schema output and supports the configured GPT-5.6 model variants:

- `gpt-5.6`
- `gpt-5.6-sol`
- `gpt-5.6-terra`
- `gpt-5.6-luna`

To enable the server-side reasoning endpoint, set the following environment variables before starting the server:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_REASONING_MODEL="gpt-5.6-terra"
npm run serve
```

The default visual demo remains runnable without an API key through curated local lesson fixtures. This provides a reliable judge-ready experience while the repository also exposes the validated OpenAI orchestration contract for live integrations.

## Project Structure

```text
app.js                         React application and classroom experience
runtime-sdk.js                 Reusable HTML5 Canvas rendering SDK
index.html                     Tailwind-powered shell, themes, and print styles
server.js                      Static server and orchestration endpoint
backend/
  openaiReasoning.js           JSON-schema constrained OpenAI reasoning stage
  logicCanvasContract.js       Zod schemas and validation boundary
  codexCompiler.js             Trusted visualization document compiler
  orchestrationHandler.js      Prompt-to-spec-to-runtime orchestration handler
```

## Scope

LogicCanvas intentionally focuses on Physics, Mathematics, and Core Engineering. It does not include accounts, databases, analytics, payments, document uploads, LMS integration, or multi-user collaboration. This keeps the MVP fast to run, easy to evaluate, and centered on teacher-led exploration.

## Built With

- React 18
- Tailwind CSS CDN
- Native HTML5 Canvas
- Zod
- OpenAI JavaScript SDK
- Sandboxed browser iframe runtime

## Judge Checklist

1. Run the app locally with `npm run serve`.
2. Select `Snell's Law Explorer` or `Projectile Motion Lab` from the ready lesson library.
3. Change one slider and observe the canvas and explanatory material update.
4. Open Teacher Workspace and inspect a challenge answer.
5. Export a Student Handout as a PDF using the browser print dialog.
6. Switch to Classroom Mode and follow the guided exploration.
