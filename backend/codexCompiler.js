import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compilerDirectory = path.dirname(fileURLToPath(import.meta.url));
const runtimeSdkPath = path.resolve(compilerDirectory, "..", "runtime-sdk.js");
let runtimeSdkSourcePromise;

const rendererEngines = {
  projectile: "MechanicsRenderer",
  pendulum: "MechanicsRenderer",
  beam: "MechanicsRenderer",
  circuit: "CircuitRenderer",
  logic: "CircuitRenderer",
  optics: "OpticsRenderer",
  lens: "OpticsRenderer",
  mirror: "OpticsRenderer",
  wave: "MathRenderer",
  trig: "MathRenderer",
  graph: "MathRenderer"
};

const domainEngines = {
  physics: "MechanicsRenderer",
  engineering: "CircuitRenderer",
  mathematics: "MathRenderer"
};

export function selectRuntimeEngine(spec) {
  return rendererEngines[spec.renderer] || domainEngines[spec.domain] || "MathRenderer";
}

export async function compileVisualizationDocument(spec) {
  const config = createRuntimeConfig(spec);
  const runtimeSdkSource = await getRuntimeSdkSource();
  return injectRuntimeCircuitBreaker(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(spec.topic)} | LogicCanvas</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#172033;background:#f6f8fb}*{box-sizing:border-box}body{margin:0;background:#f6f8fb}.lesson{max-width:1440px;margin:0 auto;padding:20px}.lesson-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.eyebrow{margin:0 0 5px;color:#0f766e;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.lesson-header h1{margin:0;font-size:24px}.lesson-header p{max-width:720px;margin:7px 0 0;color:#526176;font-size:14px;line-height:1.5}.badge{padding:7px 10px;border:1px solid #cfe4e0;border-radius:999px;background:#eaf8f5;color:#0f6259;font-size:12px;font-weight:700;text-transform:capitalize}.grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px}.simulation{min-width:0}.content-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.panel{padding:14px;border:1px solid #dce4ee;border-radius:10px;background:#fff}.panel h2{margin:0 0 10px;font-size:14px}.panel p{margin:0;color:#526176;font-size:13px;line-height:1.5}.panel ul,.panel ol{display:grid;gap:9px;margin:0;padding-left:19px;color:#334155;font-size:13px;line-height:1.45}.panel li::marker{color:#0f766e;font-weight:700}.side-stack{display:grid;align-content:start;gap:12px}.history-item{display:grid;gap:2px}.history-item strong{font-size:13px}.history-item span{color:#64748b;font-size:12px}.misconception{border-left:3px solid #d97706;padding-left:10px}.guided-item{display:grid;gap:2px}.guided-item strong{font-size:12px;color:#0f766e}@media(max-width:980px){.grid{grid-template-columns:1fr}.content-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){.lesson{padding:12px}.lesson-header{display:block}.badge{display:inline-block;margin-top:12px}.content-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main class="lesson">
<header class="lesson-header">
<div><p class="eyebrow">LogicCanvas interactive lesson</p><h1>${escapeHtml(spec.topic)}</h1><p>${escapeHtml(`Explore ${spec.topic.toLowerCase()} by changing one parameter at a time and observing the visual model.`)}</p></div>
<span class="badge">${escapeHtml(spec.explanationLevel)} view</span>
</header>
<section class="grid">
<section class="simulation" id="runtime" aria-label="Interactive visualization"></section>
<aside class="side-stack">
<section class="panel"><h2>Lesson History</h2><div id="lesson-history"></div></section>
<section class="panel"><h2>Misconceptions to address</h2><div id="misconceptions"></div></section>
</aside>
</section>
<section class="content-grid">
<section class="panel"><h2>Learning Objectives</h2><div id="learning-objectives"></div></section>
<section class="panel"><h2>Key Concepts</h2><div id="key-concepts"></div></section>
<section class="panel"><h2>Teaching Notes</h2><div id="teaching-notes"></div></section>
<section class="panel"><h2>Discussion Questions</h2><div id="discussion-questions"></div></section>
<section class="panel"><h2>Assessment Questions</h2><div id="assessment-questions"></div></section>
<section class="panel"><h2>Guided Experiments</h2><div id="guided-experiments"></div></section>
<section class="panel"><h2>Classroom Activities</h2><div id="classroom-activities"></div></section>
<section class="panel"><h2>Real World Applications</h2><div id="real-world-applications"></div></section>
</section>
</main>
<script type="module">
${runtimeSdkSource}
const config=${JSON.stringify(config)};
const runtimeConstructors={MechanicsRenderer,CircuitRenderer,OpticsRenderer,MathRenderer};
const RuntimeRenderer=runtimeConstructors[config.runtimeEngine]||MathRenderer;
const runtime=new RuntimeRenderer(config,{onChange:()=>runtime.update(0)});
runtime.init(document.getElementById("runtime"));
const appendText=(container,text,className)=>{const item=document.createElement("div");if(className)item.className=className;item.textContent=text;container.append(item);};
const appendList=(container,items,ordered=false,format=item=>item)=>{const list=document.createElement(ordered?"ol":"ul");items.forEach(item=>{const row=document.createElement("li");row.textContent=format(item);list.append(row);});container.append(list);};
appendText(document.getElementById("lesson-history"),config.topic,"history-item");
appendText(document.getElementById("lesson-history"),"Generated for this session","history-item");
appendList(document.getElementById("misconceptions"),config.educational.misconceptions,false,item=>item);
appendList(document.getElementById("learning-objectives"),config.educational.learningObjectives,false,item=>item);
appendList(document.getElementById("key-concepts"),config.educational.keyConcepts,false,item=>item);
appendText(document.getElementById("teaching-notes"),config.educational.teachingNotes,"notes");
appendList(document.getElementById("discussion-questions"),config.educational.discussionQuestions,true,item=>item);
appendList(document.getElementById("assessment-questions"),config.educational.assessmentQuestions,true,item=>item);
appendList(document.getElementById("guided-experiments"),config.educational.guidedExperiments,true,item=>""+item.instruction+" Expected result: "+item.expectedResult);
appendList(document.getElementById("classroom-activities"),config.educational.classroomActivities,false,item=>""+item.title+": "+item.studentAction+" Observe: "+item.expectedObservation);
appendList(document.getElementById("real-world-applications"),config.educational.realWorldApplications,false,item=>item);
addEventListener("pagehide",()=>runtime.reset(),{once:true});
</script>
</body>
</html>`);
}

function createRuntimeConfig(spec) {
  return {
    runtimeEngine: selectRuntimeEngine(spec),
    domain: spec.domain,
    topic: spec.topic,
    renderer: { type: spec.renderer, xLabel: "Input", yLabel: "Output" },
    meta: { title: spec.topic, domain: spec.domain, audience: spec.explanationLevel },
    variables: spec.controls.map((control) => ({
      ...control,
      label: toLabel(control.id),
      step: control.type === "switch" ? 1 : control.type === "stepper" ? Math.max(1, Math.round((control.max - control.min) / 20)) : Math.max(0.01, Number(((control.max - control.min) / 100).toPrecision(4)))
    })),
    formulas: spec.equations.map((expression, index) => ({ id: `equation_${index + 1}`, expression, description: "Mathematical relationship used by this visualization." })),
    educational: {
      learningObjectives: spec.learningObjectives,
      keyConcepts: spec.keyConcepts,
      teachingNotes: spec.teachingNotes,
      misconceptions: spec.misconceptions,
      discussionQuestions: spec.discussionQuestions,
      assessmentQuestions: spec.assessmentQuestions,
      classroomActivities: spec.classroomActivities,
      guidedExperiments: spec.guidedExperiments,
      realWorldApplications: spec.realWorldApplications
    }
  };
}

async function getRuntimeSdkSource() {
  runtimeSdkSourcePromise ||= readFile(runtimeSdkPath, "utf8");
  return runtimeSdkSourcePromise;
}

function injectRuntimeCircuitBreaker(html) {
  let counter = 0;
  const guard = (match) => {
    counter += 1;
    const name = `__logicCanvasIteration${counter}`;
    return `let ${name}=0;${match}if(++${name}>10000){console.warn("LogicCanvas runtime shield stopped a long loop");break;}`;
  };
  return html
    .replace(/for\s*\([^)]*\)\s*\{/g, guard)
    .replace(/while\s*\([^)]*\)\s*\{/g, guard)
    .replace(/do\s*\{/g, guard);
}

function toLabel(id) {
  return id.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
