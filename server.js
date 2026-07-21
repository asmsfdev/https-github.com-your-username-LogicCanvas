import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { handleOrchestrationRequest } from "./backend/orchestrationHandler.js";
import { compileVisualizationDocument } from "./backend/codexCompiler.js";
import { generateLogicCanvasSpec, getOpenAIStatus } from "./backend/openaiReasoning.js";

const root = process.cwd();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

async function codexFactory(validatedSpec) {
  return compileVisualizationDocument(validatedSpec);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");

  if (request.method === "POST" && url.pathname === "/api/orchestrate") {
    await handleOrchestrationRequest(request, response, codexFactory, generateLogicCanvasSpec);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true, openai: getOpenAIStatus() }));
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  const requestedPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const filePath = path.resolve(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": types[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" || extension === ".js" ? "no-store" : "public, max-age=3600",
      ...(extension === ".js" ? { "Access-Control-Allow-Origin": "*" } : {})
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(5173, "127.0.0.1", () => {
  console.log("LogicCanvas running at http://127.0.0.1:5173");
});
