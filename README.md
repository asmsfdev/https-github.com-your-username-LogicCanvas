# LogicCanvas Edu

LogicCanvas is a static MVP for generating interactive STEM simulation widgets from teacher prompts.

## Architecture

The app enforces the requested chain of custody:

1. Teacher Prompt
2. GPT-5.6 Engine
3. Zod Validation
4. Codex Engine
5. Runtime Shield
6. Sandboxed iframe
7. Teacher Dashboard

The MVP intentionally excludes authentication, databases, persistence, uploads, LMS integration, payments, analytics, voice controls, multi-user sync, and non-STEM subject areas.

## Run

Serve the folder with the included Node static server.

```powershell
node server.js
```
