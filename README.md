# LogicCanvas

**AI-Powered STEM Simulations for Teacher-Led Discovery**

LogicCanvas turns Physics, Mathematics, and Core Engineering concepts into interactive, classroom-ready visual models. Teachers choose a lesson or enter a concept, students adjust meaningful variables, and the app connects each visible change to an explanation, equation, and guided activity.
Demo video: https://youtu.be/hi8RtXghowE

## Why LogicCanvas

Abstract STEM ideas are difficult to teach when students cannot see cause and effect. LogicCanvas gives teachers a reusable digital lab that combines a live HTML5 Canvas model with lesson materials, checks for understanding, and printable student handouts.

## Classroom Impact

**For teachers:** LogicCanvas shortens lesson preparation by bringing the model, explanatory prompts, challenge questions, and printable handout into one workspace. A teacher can explore a concept before class, choose the questions that fit the lesson, and use live controls to make cause and effect visible during instruction.

**For students:** Changing a control produces an immediate visual response and a matching explanation. This helps students move from memorising an equation to observing a relationship, making a prediction, testing it, and supporting an explanation with evidence from the model.

The current MVP is designed around the teacher persona and uses curated mock lesson data for a reliable, no-setup demo. A production version can ground GPT-5.6 reasoning with a retrieval layer over vetted STEM databases and digital textbooks. That workflow would supply sourced instructional context to the model, which would produce a validated specification for a trusted renderer, dynamic controls, and contextual explanations. The goal is to give teachers more time to teach while making complex STEM concepts more engaging and easier to investigate.

## Judge Demo

1. Run the app and open `Vector Field` or `Newton's law`.
2. Move a slider and observe the live canvas model update.
3. Read `Live Observation` and `Explain This` to connect the change to the science.
4. Open Teacher Workspace to inspect challenge answers, lesson materials, and PDF export.
5. Switch to Classroom Mode for the student-facing learning flow.

## Highlights

- Interactive models: projectile motion, Snell's law, Newton's laws, circuits, pendulums, waves, vectors, Pythagorean theorem, beam deflection, and logic gates.
- Teacher workflow: lesson metadata, challenges, answer cues, teaching notes, misconceptions, assessment prompts, guided experiments, and print/PDF export.
- Classroom workflow: student pathway, controls, live observation, simplified explanation, equations, and real-world applications.
- Responsive, keyboard-accessible interface for desktop, tablet, and mobile.

## Trusted Architecture

```text
Teacher prompt
  -> Structured reasoning payload
  -> JSON-only and Zod validation
  -> Trusted renderer selection
  -> Runtime loop shield
  -> Sandboxed iframe canvas
  -> Teacher or classroom workspace
```

- The reasoning contract accepts structured JSON only and blocks code, markdown, scripts, and unknown fields.
- Pre-built canvas renderers prevent arbitrary rendering engines from being generated at runtime.
- Loop guards and a sandboxed iframe protect the browser runtime.
- Renderer-specific educational profiles and alignment checks prevent cross-topic teaching content.

## Run Locally

**Requirements:** Node.js 18+

```bash
npm install
npm run serve
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

Verify syntax:

```bash
npm run check
```

## Optional OpenAI Reasoning Endpoint

`backend/openaiReasoning.js` contains the JSON-schema constrained OpenAI reasoning stage. The default visual demo runs from curated local lesson fixtures, so no API key is needed for evaluation.

To enable the server-side endpoint:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_REASONING_MODEL="gpt-5.6-terra"
npm run serve
```

## Project Structure

```text
app.js                 React application and classroom experience
runtime-sdk.js         Reusable HTML5 Canvas rendering SDK
index.html             Shell, themes, and print styles
server.js              Local server and orchestration endpoint
backend/               OpenAI reasoning, Zod contracts, compiler, orchestration
```

## Scope

LogicCanvas intentionally focuses on Physics, Mathematics, and Core Engineering. It excludes accounts, databases, uploads, LMS integrations, payments, analytics, and multi-user collaboration to keep the MVP focused and easy to evaluate.

