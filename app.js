import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { createPortal } from "https://esm.sh/react-dom@18.3.1";

let z;
try {
  ({ z } = await import("https://esm.sh/zod@3.23.8"));
} catch {
  z = createZodFallback();
}

const h = React.createElement;
const allowedDomains = ["physics", "mathematics", "engineering"];
const samplePrompt = "Show projectile motion for a basketball shot. Let students adjust launch speed, launch angle, and gravity, then visualize the path and range.";
const TRUSTED_RUNTIME_TEMPLATE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--canvas-bg:#f8fafc;--grid:#dce5ef;--axis:#64748b;--model:#0f766e;--vector:#2563eb;--focus:#d97706;--ink:#172033}*{box-sizing:border-box}body{margin:0;background:var(--canvas-bg);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,sans-serif}.runtime{display:grid;grid-template-rows:auto minmax(0,1fr);min-height:100vh;padding:clamp(10px,2vw,18px);gap:12px}.runtime-header{display:flex;justify-content:space-between;gap:12px;align-items:start}.runtime-header h1{margin:0;font-size:clamp(17px,2vw,20px)}.runtime-header p{margin:4px 0 0;color:#64748b;font-size:13px;line-height:1.45}.legend{display:flex;flex-wrap:wrap;gap:10px;color:#475569;font-size:12px}.legend span{display:flex;align-items:center;gap:5px}.legend i{display:block;width:9px;height:9px;border-radius:99px;background:var(--model)}.legend i.vector{background:var(--vector)}.legend i.focus{background:var(--focus)}canvas{width:100%;height:100%;min-height:clamp(300px,48vh,620px);display:block;border:0;border-radius:6px;background:#fff}@media(max-width:640px){.runtime{padding:10px;grid-template-rows:auto minmax(300px,1fr)}canvas{min-height:320px}.runtime-header{display:block}.legend{margin-top:8px}}</style></head><body><main class="runtime"><header class="runtime-header"><div><h1>__TITLE__</h1><p>Adjust the teacher controls to update the model.</p></div><div class="legend"><span><i></i>Model</span><span><i class="vector"></i>Vector or input</span><span><i class="focus"></i>Live value</span></div></header><canvas id="logicCanvasViewport" role="img" aria-label="Interactive LogicCanvas visualization"></canvas></main><script>window.simulationData=__DATA__;(()=>{const data=window.simulationData;const canvas=document.getElementById('logicCanvasViewport');const context=canvas.getContext('2d');const values=Object.fromEntries(data.variables.map(variable=>[variable.id,Number(variable.default)]));let width=0,height=0,ratio=1;const number=(id,fallback)=>Number.isFinite(values[id])?values[id]:fallback;const resize=()=>{const bounds=canvas.getBoundingClientRect();ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(320,Math.floor(bounds.width*ratio));canvas.height=Math.max(280,Math.floor(bounds.height*ratio));width=canvas.width/ratio;height=canvas.height/ratio;context.setTransform(ratio,0,0,ratio,0,0)};const grid=()=>{context.clearRect(0,0,width,height);context.fillStyle='#fff';context.fillRect(0,0,width,height);context.strokeStyle='#dce5ef';context.lineWidth=1;for(let x=40;x<width-20;x+=40){context.beginPath();context.moveTo(x,20);context.lineTo(x,height-35);context.stroke()}for(let y=20;y<height-35;y+=40){context.beginPath();context.moveTo(40,y);context.lineTo(width-20,y);context.stroke()}context.strokeStyle='#64748b';context.beginPath();context.moveTo(40,height-35);context.lineTo(width-20,height-35);context.moveTo(40,20);context.lineTo(40,height-35);context.stroke()};const line=(points,color,widthValue=3)=>{context.beginPath();points.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y));context.strokeStyle=color;context.lineWidth=widthValue;context.stroke()};const arrow=(x,y,dx,dy,color='#2563eb')=>{const endX=x+dx,endY=y+dy,angle=Math.atan2(dy,dx);context.strokeStyle=color;context.fillStyle=color;context.lineWidth=2;context.beginPath();context.moveTo(x,y);context.lineTo(endX,endY);context.stroke();context.beginPath();context.moveTo(endX,endY);context.lineTo(endX-6*Math.cos(angle-Math.PI/6),endY-6*Math.sin(angle-Math.PI/6));context.lineTo(endX-6*Math.cos(angle+Math.PI/6),endY-6*Math.sin(angle+Math.PI/6));context.closePath();context.fill()};const projectile=()=>{const speed=number('speed',22),angle=number('angle',45)*Math.PI/180,gravity=number('gravity',9.8),range=Math.max(.01,speed*speed*Math.sin(2*angle)/gravity),peak=Math.max(.01,speed*speed*Math.sin(angle)**2/(2*gravity)),ground=height-35,points=[];for(let index=0;index<=160;index+=1){const x=range*index/160,y=x*Math.tan(angle)-gravity*x*x/(2*speed*speed*Math.cos(angle)**2);points.push({x:40+x/range*(width-60),y:ground-Math.max(0,y)/peak*(height-70)})}line(points,'#0f766e');const live=points[Math.floor((Date.now()/24)%points.length)];context.fillStyle='#d97706';context.beginPath();context.arc(live.x,live.y,6,0,Math.PI*2);context.fill();arrow(40,ground,48*Math.cos(angle),-48*Math.sin(angle));context.fillStyle='#475569';context.fillText('Range '+range.toFixed(1)+' m',width-120,26);context.fillText('Peak '+peak.toFixed(1)+' m',48,26)};const graph=()=>{const amplitude=number('amplitude',1),frequency=number('frequency',number('period',2)),phase=number('phase',0),points=[];for(let index=0;index<=240;index+=1){const t=index/240,x=40+t*(width-60),y=height/2-amplitude*Math.sin(t*Math.PI*4*frequency+phase)/(Math.max(1,Math.abs(amplitude))*2.3)*(height-70);points.push({x,y})}line(points,'#0f766e')};const logic=()=>{const gates=['AND','OR','XOR','NOT'],gate=gates[Math.round(number('gate',2))]||'XOR',a=Boolean(number('input_a',1)),b=Boolean(number('input_b',0)),out=gate==='AND'?a&&b:gate==='OR'?a||b:gate==='XOR'?a!==b:!a,box={x:width*.34,y:height*.31,w:width*.32,h:height*.38};context.strokeStyle='#0f766e';context.lineWidth=3;context.strokeRect(box.x,box.y,box.w,box.h);context.fillStyle='#172033';context.font='700 26px system-ui';context.fillText(gate,box.x+box.w/2-context.measureText(gate).width/2,height/2+8);context.font='13px system-ui';context.strokeStyle='#64748b';context.beginPath();context.moveTo(40,box.y+box.h*.3);context.lineTo(box.x,box.y+box.h*.3);context.moveTo(40,box.y+box.h*.7);context.lineTo(box.x,box.y+box.h*.7);context.moveTo(box.x+box.w,height/2);context.lineTo(width-40,height/2);context.stroke();context.fillStyle=out?'#15803d':'#94a3b8';context.fillText('Output '+Number(out),width-110,height/2-10)};const circuit=()=>{const voltage=number('voltage',12),resistance=Math.max(1,number('resistance',120)),x1=width*.18,x2=width*.82,y1=height*.28,y2=height*.72;context.strokeStyle='#172033';context.lineWidth=2;context.beginPath();context.moveTo(x1,y1);context.lineTo(x2,y1);context.lineTo(x2,y2);context.lineTo(x1,y2);context.closePath();context.stroke();context.beginPath();context.moveTo(x1,y1);context.lineTo(x1,y2);context.moveTo(x1,y1+(y2-y1)/3);context.lineTo(x2,y1+(y2-y1)/3);context.moveTo(x1,y1+2*(y2-y1)/3);context.lineTo(x2,y1+2*(y2-y1)/3);context.stroke();context.fillStyle='#0f766e';context.fillText(voltage.toFixed(1)+' V source',x1,y1-16);context.fillText('Branch current '+(voltage/resistance*1000).toFixed(1)+' mA',x2-165,y2+22)};const optics=()=>{const incident=number('angle',42)*Math.PI/180,n1=number('index_one',1),n2=number('index_two',1.5),refracted=Math.asin(Math.min(.999,n1*Math.sin(incident)/n2)),midY=height/2,midX=width/2;context.strokeStyle='#64748b';context.beginPath();context.moveTo(40,midY);context.lineTo(width-20,midY);context.moveTo(midX,30);context.lineTo(midX,height-30);context.stroke();arrow(midX-150*Math.sin(incident),midY-150*Math.cos(incident),150*Math.sin(incident),150*Math.cos(incident),'#2563eb');arrow(midX,midY,150*Math.sin(refracted),150*Math.cos(refracted),'#0f766e');context.fillStyle='#475569';context.fillText('n1 = '+n1.toFixed(2),48,midY-14);context.fillText('n2 = '+n2.toFixed(2),48,midY+24)};const vector=()=>{const strength=number('strength',1.3),rotation=number('rotation',.6),scale=number('scale',1);for(let x=80;x<width-35;x+=55){for(let y=60;y<height-45;y+=55){const dx=x-width/2,dy=y-height/2,length=Math.max(35,Math.hypot(dx,dy)),vx=(-dy/length*Math.cos(rotation)-dy/length*Math.sin(rotation))*18*strength*scale,vy=(dx/length*Math.cos(rotation)-dy/length*Math.sin(rotation))*18*strength*scale;arrow(x,y,vx,vy)}}};const beam=()=>{const load=number('load',12),span=number('span',6),stiffness=Math.max(1,number('stiffness',260)),deflection=load*span**3/(48*stiffness),points=[];for(let index=0;index<=160;index+=1){const t=index/160;points.push({x:40+t*(width-60),y:height/2+4*t*(1-t)*deflection*70})}context.strokeStyle='#64748b';context.lineWidth=6;context.beginPath();context.moveTo(40,height/2);context.lineTo(width-20,height/2);context.stroke();line(points,'#0f766e')};const draw=()=>{grid();const type=data.renderer.type;if(type==='projectile')projectile();else if(type==='logic')logic();else if(type==='circuit')circuit();else if(type==='optics')optics();else if(type==='vector')vector();else if(type==='beam')beam();else graph();requestAnimationFrame(draw)};new ResizeObserver(resize).observe(canvas);resize();draw()})();</script></body></html>`;

const SimulationSpec = z.object({
  meta: z.object({
    title: z.string().min(4).max(80),
    domain: z.enum(allowedDomains),
    audience: z.enum(["teacher", "student"]),
    teacherNotes: z.string().max(700)
  }),
  variables: z.array(z.object({
    id: z.string().regex(/^[a-z][a-z0-9_]*$/),
    label: z.string().min(2).max(40),
    unit: z.string().max(12),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    default: z.number()
  })).min(1).max(6),
  formulas: z.array(z.object({
    id: z.string(),
    expression: z.string().min(3).max(140),
    description: z.string().min(8).max(160)
  })).min(1).max(5),
  boundaries: z.array(z.string().min(6).max(140)).min(1).max(6),
  renderer: z.object({
    type: z.enum(["projectile", "wave", "trig", "beam", "logic", "circuit", "optics", "vector", "newton", "pendulum", "pythagoras"]),
    xLabel: z.string().max(30),
    yLabel: z.string().max(30)
  }),
  educational: z.object({
    learningObjectives: z.array(z.string().min(3).max(220)).min(1).max(8),
    keyConcepts: z.array(z.string().min(3).max(180)).min(1).max(8),
    teachingNotes: z.string().min(3).max(900),
    misconceptions: z.array(z.string().min(3).max(220)).min(1).max(8),
    discussionQuestions: z.array(z.string().min(3).max(220)).min(1).max(8),
    assessmentQuestions: z.array(z.string().min(3).max(220)).min(1).max(8),
    guidedExperiments: z.array(z.string().min(3).max(260)).min(1).max(8),
    realWorldApplications: z.array(z.string().min(3).max(220)).min(1).max(8)
  }),
  educationalMetadata: z.object({
    studentsWillLearn: z.array(z.string().min(3).max(220)).min(1).max(6),
    learningOutcomes: z.array(z.string().min(3).max(220)).min(1).max(6),
    estimatedGradeLevel: z.string().min(3).max(60),
    prerequisites: z.string().min(3).max(180),
    difficulty: z.enum(["Introductory", "Guided", "Intermediate", "Advanced"]),
    estimatedTeachingTime: z.string().min(3).max(40)
  })
}).superRefine((spec, ctx) => {
  spec.variables.forEach((variable, index) => {
    if (variable.default < variable.min || variable.default > variable.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variables", index, "default"],
        message: "Default must stay inside min/max bounds."
      });
    }
  });
});

const ThemeContext = createContext(null);
const LayoutContext = createContext(null);

function createZodFallback() {
  const fail = (path, message) => {
    const at = path.length ? ` at ${path.join(".")}` : "";
    throw new Error(`Lesson setup failed${at}: ${message}`);
  };
  const chain = (parse) => ({
    parse,
    min(value) {
      return chain((input, path = []) => {
        const parsed = parse(input, path);
        if (parsed.length < value) fail(path, `Expected at least ${value} item(s).`);
        return parsed;
      });
    },
    max(value) {
      return chain((input, path = []) => {
        const parsed = parse(input, path);
        if (parsed.length > value) fail(path, `Expected at most ${value} item(s).`);
        return parsed;
      });
    },
    positive() {
      return chain((input, path = []) => {
        const parsed = parse(input, path);
        if (parsed <= 0) fail(path, "Expected a positive number.");
        return parsed;
      });
    },
    regex(pattern) {
      return chain((input, path = []) => {
        const parsed = parse(input, path);
        if (!pattern.test(parsed)) fail(path, "String did not match the required pattern.");
        return parsed;
      });
    },
    superRefine(refiner) {
      return chain((input, path = []) => {
        const issues = [];
        const parsed = parse(input, path);
        refiner(parsed, { addIssue: (issue) => issues.push(issue) });
        if (issues.length) fail(issues[0].path || path, issues[0].message || "Custom validation failed.");
        return parsed;
      });
    }
  });
  return {
    ZodIssueCode: { custom: "custom" },
    string: () => chain((input, path = []) => typeof input === "string" ? input : fail(path, "Expected string.")),
    number: () => chain((input, path = []) => typeof input === "number" && Number.isFinite(input) ? input : fail(path, "Expected finite number.")),
    enum: (values) => chain((input, path = []) => values.includes(input) ? input : fail(path, `Expected one of ${values.join(", ")}.`)),
    array: (schema) => chain((input, path = []) => Array.isArray(input) ? input.map((item, index) => schema.parse(item, [...path, index])) : fail(path, "Expected array.")),
    object: (shape) => chain((input, path = []) => {
      if (!input || typeof input !== "object" || Array.isArray(input)) fail(path, "Expected object.");
      return Object.fromEntries(Object.entries(shape).map(([key, schema]) => [key, schema.parse(input[key], [...path, key])]));
    })
  };
}

function useThemeState() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("logiccanvas-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  const toggleDarkMode = useCallback(() => setDarkMode((value) => !value), []);
  return useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);
}

function useLayoutState() {
  const [subject, setSubject] = useState("Physics");
  const [role, setRole] = useState("teacher");
  const [lessonTab, setLessonTab] = useState("notes");
  const [classroomMode, setClassroomMode] = useState(true);
  const [developerMode, setDeveloperMode] = useState(false);
  const [home, setHome] = useState(true);
  return useMemo(() => ({ subject, setSubject, role, setRole, lessonTab, setLessonTab, classroomMode, setClassroomMode, developerMode, setDeveloperMode, home, setHome }), [subject, role, lessonTab, classroomMode, developerMode, home]);
}

function useKeyboardShortcuts({ onAction, onToggleTheme }) {
  useEffect(() => {
    const isEditable = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    const focusPrompt = () => document.getElementById("conceptCommand")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "/" && !isEditable(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        focusPrompt();
        return;
      }
      if (!event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key === "1") {
        event.preventDefault();
        onAction("teacher");
      } else if (event.key === "2") {
        event.preventDefault();
        onAction("classroom");
      } else if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        onToggleTheme();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onAction, onToggleTheme]);
}

function useCompilationPipeline() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const [spec, setSpec] = useState(null);
  const [rawHtml, setRawHtml] = useState("");
  const [shieldedHtml, setShieldedHtml] = useState("");
  const [activeStep, setActiveStep] = useState(-1);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [controlValues, setControlValues] = useState({});
  const [promptHistory, setPromptHistory] = useState([]);
  const [iframeVersion, setIframeVersion] = useState(0);
  const [stage, setStage] = useState("Ready");
  const [generationMs, setGenerationMs] = useState(null);
  const startedAtRef = useRef(0);
  const loading = status === "Creating";

  useEffect(() => {
    if (!spec || status !== "Live") {
      return;
    }
    const adjustedSpec = {
      ...spec,
      variables: spec.variables.map((variable) => ({
        ...variable,
        default: controlValues[variable.id] ?? variable.default
      }))
    };
    const html = compileWithCodex(adjustedSpec);
    setRawHtml(html);
    setShieldedHtml(injectRuntimeShield(html));
  }, [controlValues, spec, status]);

  const runPipeline = useCallback(async (nextPrompt, audience, preparedSpec) => {
    setStatus("Creating");
    setStage("Thinking...");
    setGenerationMs(null);
    startedAtRef.current = performance.now();
    setError("");
    setActiveStep(0);
    setSpec(null);
    setRawHtml("");
    setShieldedHtml("");
    setControlValues({});
    try {
      await delay(120);
      setActiveStep(1);
      setStage("Planning...");
      const generatedSpec = preparedSpec || gpt56ReasoningEngine(nextPrompt, audience);
      const rawSpec = {
        ...generatedSpec,
        educational: generatedSpec.educational || createEducationalContent(generatedSpec),
        educationalMetadata: generatedSpec.educationalMetadata || createEducationalMetadata(generatedSpec)
      };
      assertEducationalAlignment(rawSpec);
      await delay(120);
      setActiveStep(2);
      const validatedSpec = SimulationSpec.parse(rawSpec);
      setSpec(validatedSpec);
      setControlValues(Object.fromEntries(validatedSpec.variables.map((variable) => [variable.id, variable.default])));
      await delay(120);
      setActiveStep(3);
      setStage("Generating Code...");
      const html = compileWithCodex(validatedSpec);
      setRawHtml(html);
      await delay(120);
      setActiveStep(4);
      const protectedHtml = injectRuntimeShield(html);
      await delay(120);
      setActiveStep(5);
      setStage("Launching Sandbox...");
      setShieldedHtml(protectedHtml);
      setStatus("Live");
      setPromptHistory((current) => [{ id: crypto.randomUUID(), prompt: nextPrompt, title: validatedSpec.meta.title, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...current.filter((item) => item.prompt !== nextPrompt)].slice(0, 6));
      setIframeVersion((version) => version + 1);
    } catch (caught) {
      setStatus("Needs review");
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  const compile = useCallback((audience) => runPipeline(prompt, audience), [prompt, runPipeline]);

  const selectVisualization = useCallback((item, audience) => {
    setPrompt(item.prompt);
    return runPipeline(item.prompt, audience);
  }, [runPipeline]);

  const reset = useCallback(async (audience) => {
    setPrompt(samplePrompt);
    return runPipeline(samplePrompt, audience);
  }, [runPipeline]);

  const refreshRuntime = useCallback(() => {
    setIframeVersion((version) => version + 1);
  }, []);

  const runDemo = useCallback((demo, audience) => {
    setPrompt(demo.prompt);
    return runPipeline(demo.prompt, audience, {
      ...demo.spec,
      educational: demo.spec.educational || createEducationalContent(demo.spec),
      educationalMetadata: demo.spec.educationalMetadata || createEducationalMetadata(demo.spec)
    });
  }, [runPipeline]);

  const markCanvasPaint = useCallback(() => {
    if (!startedAtRef.current) return;
    requestAnimationFrame(() => {
      setGenerationMs(performance.now() - startedAtRef.current);
      setStage("Live");
    });
  }, []);

  return {
    prompt,
    setPrompt,
    spec,
    rawHtml,
    shieldedHtml,
    activeStep,
    status,
    error,
    loading,
    stage,
    generationMs,
    promptHistory,
    iframeVersion,
    controlValues,
    setControlValues,
    compile,
    runDemo,
    markCanvasPaint,
    selectVisualization,
    refreshRuntime,
    reset
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fault: "" };
  }
  static getDerivedStateFromError(error) {
    return { fault: error instanceof Error ? error.message : "This lesson view could not load." };
  }
  render() {
    if (this.state.fault) {
      return h("section", { className: "flex min-h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200" },
        h("div", { className: "max-w-md" },
          h("h2", { className: "text-lg font-semibold" }, "Lesson view unavailable"),
          h("p", { className: "mt-2 text-sm" }, this.state.fault)
        )
      );
    }
    return this.props.children;
  }
}

const DEMO_SEQUENCE = [
  {
    title: "Parallel Circuit",
    subject: "Engineering",
    prompt: "Model a parallel circuit with adjustable source voltage, resistance, and capacitance.",
    spec: {
      meta: { title: "Parallel Circuit Lab", domain: "engineering", audience: "teacher", teacherNotes: "Students compare how branches in a parallel circuit share voltage while current divides across available paths." },
      variables: [{ id: "voltage", label: "Source voltage", unit: "V", min: 1, max: 24, step: 1, default: 12 }, { id: "resistance", label: "Branch resistance", unit: "ohm", min: 10, max: 500, step: 10, default: 120 }, { id: "capacitance", label: "Capacitance", unit: "F", min: 0.1, max: 5, step: 0.1, default: 1 }],
      formulas: [{ id: "ohm", expression: "I = V / R", description: "Current in each branch depends on its resistance and the shared source voltage." }],
      boundaries: ["Voltage remains positive.", "Resistance is never zero."], renderer: { type: "circuit", xLabel: "Circuit", yLabel: "Current" }
    }
  },
  {
    title: "Projectile Motion",
    subject: "Physics",
    prompt: "Show projectile motion with launch speed, launch angle, and gravity.",
    spec: {
      meta: { title: "Projectile Motion Lab", domain: "physics", audience: "teacher", teacherNotes: "Students investigate how launch speed, launch angle, and gravity determine flight time, peak height, and range." },
      variables: [{ id: "speed", label: "Launch speed", unit: "m/s", min: 5, max: 40, step: 1, default: 22 }, { id: "angle", label: "Launch angle", unit: "deg", min: 10, max: 80, step: 1, default: 45 }, { id: "gravity", label: "Gravity", unit: "m/s^2", min: 1.6, max: 14, step: 0.1, default: 9.8 }],
      formulas: [{ id: "range", expression: "R = v^2 sin(2theta) / g", description: "Horizontal range for equal launch and landing height." }],
      boundaries: ["Gravity remains positive.", "The path ends at ground level."], renderer: { type: "projectile", xLabel: "Distance", yLabel: "Height" }
    }
  },
  {
    title: "Snell's Law",
    subject: "Physics",
    prompt: "Visualize Snell's law with incident angle and refractive indices.",
    spec: {
      meta: { title: "Snell's Law Explorer", domain: "physics", audience: "teacher", teacherNotes: "Students compare the incoming and refracted light ray as it crosses a boundary between two optical media." },
      variables: [{ id: "angle", label: "Incident angle", unit: "deg", min: 5, max: 75, step: 1, default: 42 }, { id: "index_one", label: "First refractive index", unit: "n", min: 1, max: 2, step: 0.05, default: 1 }, { id: "index_two", label: "Second refractive index", unit: "n", min: 1, max: 2.5, step: 0.05, default: 1.5 }],
      formulas: [{ id: "snell", expression: "n1 sin(theta1) = n2 sin(theta2)", description: "The relationship between light angles and refractive indices." }],
      boundaries: ["Refractive indices are positive.", "The ray is measured from the normal."], renderer: { type: "optics", xLabel: "Boundary", yLabel: "Ray angle" }
    }
  },
  {
    title: "Vector Field",
    subject: "Mathematics",
    prompt: "Show a vector field with adjustable strength and rotation.",
    description: "Interactive 2D vector matrix showing directional force fields and magnitude gradients.",
    spec: {
      meta: { title: "Vector Field Explorer", domain: "mathematics", audience: "teacher", teacherNotes: "Students interpret direction and magnitude using a grid of arrows that changes with the field parameters." },
      variables: [{ id: "strength", label: "Field strength", unit: "u", min: 0.2, max: 3, step: 0.1, default: 1.3 }, { id: "rotation", label: "Rotation", unit: "rad", min: -3.14, max: 3.14, step: 0.1, default: 0.6 }, { id: "scale", label: "Vector scale", unit: "x", min: 0.5, max: 2.5, step: 0.1, default: 1 }],
      formulas: [{ id: "field", expression: "F(x,y) = (-y, x)", description: "A rotating vector field around the origin." }],
      boundaries: ["Vectors are scaled for visibility.", "The grid is centered on the origin."], renderer: { type: "vector", xLabel: "x", yLabel: "y" }
    }
  },
  {
    title: "Newton's Laws",
    subject: "Physics",
    prompt: "Explore Newton's laws by changing mass, applied force, friction, and initial velocity.",
    spec: {
      meta: { title: "Newton's Laws Lab", domain: "physics", audience: "teacher", teacherNotes: "Students connect net force, mass, acceleration, and motion while testing how friction changes the result." },
      variables: [{ id: "mass", label: "Object mass", unit: "kg", min: 1, max: 20, step: 1, default: 5 }, { id: "force", label: "Applied force", unit: "N", min: 0, max: 100, step: 1, default: 30 }, { id: "friction", label: "Friction force", unit: "N", min: 0, max: 30, step: 1, default: 5 }, { id: "initial_velocity", label: "Initial velocity", unit: "m/s", min: 0, max: 20, step: 1, default: 2 }],
      formulas: [{ id: "newton_second", expression: "a = (F - f) / m", description: "Net force determines acceleration: applied force minus friction, divided by mass." }, { id: "newton_first", expression: "F_net = 0 => v is constant", description: "When the net force is zero, motion stays at a constant velocity." }],
      boundaries: ["Mass remains positive.", "Net force may be zero but cannot accelerate backward in this model."], renderer: { type: "newton", xLabel: "Time", yLabel: "Motion" }
    }
  }
];

const CONCEPT_COVERAGE = [
  { ...DEMO_SEQUENCE[1], description: "Launch speed, angle, gravity, and a visible flight path." },
  { ...DEMO_SEQUENCE[4], description: "Net force, friction, mass, and acceleration on a moving cart." },
  { ...DEMO_SEQUENCE[2], description: "Refraction across two media using Snell's law." },
  { ...DEMO_SEQUENCE[3], description: "Direction and magnitude across a rotating vector field." },
  {
    title: "Simple Pendulum", subject: "Physics", prompt: "Explore a simple pendulum by changing string length, release angle, and gravity.", description: "Oscillation, period, and energy changes in a swinging pendulum.",
    spec: {
      meta: { title: "Simple Pendulum Lab", domain: "physics", audience: "teacher", teacherNotes: "Students connect pendulum length and gravity to the period of a repeating swing." },
      variables: [{ id: "length", label: "String length", unit: "m", min: 0.4, max: 3, step: 0.1, default: 1.2 }, { id: "angle", label: "Release angle", unit: "deg", min: 5, max: 50, step: 1, default: 25 }, { id: "gravity", label: "Gravity", unit: "m/s^2", min: 1.6, max: 14, step: 0.1, default: 9.8 }],
      formulas: [{ id: "period", expression: "T = 2pi sqrt(L / g)", description: "For small angles, period depends on length and gravity rather than mass." }],
      boundaries: ["String length remains positive.", "Release angle stays in a classroom-safe small-angle range."], renderer: { type: "pendulum", xLabel: "Time", yLabel: "Angle" }
    }
  },
  {
    title: "Ohm's Law", subject: "Physics", prompt: "Model Ohm's law with adjustable voltage and resistance.", description: "Voltage, resistance, and current in a simple circuit.",
    spec: {
      meta: { title: "Ohm's Law Lab", domain: "physics", audience: "teacher", teacherNotes: "Students observe how voltage drives current and resistance limits it." },
      variables: [{ id: "voltage", label: "Voltage", unit: "V", min: 1, max: 24, step: 1, default: 12 }, { id: "resistance", label: "Resistance", unit: "ohm", min: 10, max: 500, step: 10, default: 120 }, { id: "capacitance", label: "Circuit load", unit: "F", min: 0.1, max: 5, step: 0.1, default: 1 }],
      formulas: [{ id: "ohm", expression: "V = I R", description: "Current increases with voltage and decreases as resistance rises." }],
      boundaries: ["Voltage remains positive.", "Resistance never reaches zero."], renderer: { type: "circuit", xLabel: "Voltage", yLabel: "Current" }
    }
  },
  {
    title: "Wave Interference", subject: "Physics", prompt: "Visualize wave interference with amplitude, frequency, and phase offset.", description: "Superposition and changing wave patterns.",
    spec: {
      meta: { title: "Wave Interference Lab", domain: "physics", audience: "teacher", teacherNotes: "Students compare amplitude, frequency, and phase while observing wave patterns." },
      variables: [{ id: "amplitude", label: "Amplitude", unit: "m", min: 0.2, max: 3, step: 0.1, default: 1.2 }, { id: "frequency", label: "Frequency", unit: "Hz", min: 0.5, max: 6, step: 0.1, default: 2 }, { id: "phase", label: "Phase offset", unit: "rad", min: 0, max: 6.28, step: 0.01, default: 1.57 }],
      formulas: [{ id: "wave", expression: "y = A sin(2pi f t + phi)", description: "A wave's displacement is controlled by amplitude, frequency, and phase." }],
      boundaries: ["Amplitude stays positive.", "Phase remains within one full cycle."], renderer: { type: "wave", xLabel: "Position", yLabel: "Displacement" }
    }
  },
  {
    title: "Pythagorean Theorem", subject: "Mathematics", prompt: "Explore the Pythagorean theorem with adjustable right triangle side lengths.", description: "A right triangle that updates its hypotenuse and area evidence.",
    spec: {
      meta: { title: "Pythagorean Theorem Lab", domain: "mathematics", audience: "teacher", teacherNotes: "Students test how the two shorter sides determine the hypotenuse of a right triangle." },
      variables: [{ id: "side_a", label: "Side a", unit: "units", min: 2, max: 12, step: 1, default: 6 }, { id: "side_b", label: "Side b", unit: "units", min: 2, max: 12, step: 1, default: 8 }, { id: "scale", label: "Diagram scale", unit: "x", min: 0.7, max: 1.6, step: 0.1, default: 1 }],
      formulas: [{ id: "pythagoras", expression: "a^2 + b^2 = c^2", description: "The squared legs of a right triangle add to the squared hypotenuse." }],
      boundaries: ["Both legs remain positive.", "The triangle is always right-angled."], renderer: { type: "pythagoras", xLabel: "Side a", yLabel: "Side b" }
    }
  },
  {
    title: "Quadratic Functions", subject: "Mathematics", prompt: "Graph a quadratic function by adjusting vertical stretch, frequency, and phase.", description: "A responsive curve for exploring transformations and intercepts.",
    spec: {
      meta: { title: "Quadratic Function Explorer", domain: "mathematics", audience: "teacher", teacherNotes: "Students use parameter changes to identify how a function's visible shape responds." },
      variables: [{ id: "amplitude", label: "Vertical stretch", unit: "x", min: 0.2, max: 3, step: 0.1, default: 1.1 }, { id: "frequency", label: "Horizontal scale", unit: "x", min: 0.5, max: 4, step: 0.1, default: 1 }, { id: "phase", label: "Horizontal shift", unit: "rad", min: -3.14, max: 3.14, step: 0.1, default: 0 }],
      formulas: [{ id: "quadratic", expression: "y = a(x - h)^2 + k", description: "Parameters change the width, position, and direction of a quadratic curve." }],
      boundaries: ["The graph stays within the visible coordinate window.", "Scale values remain non-zero."], renderer: { type: "trig", xLabel: "x", yLabel: "y" }
    }
  },
  {
    title: "Trigonometric Functions", subject: "Mathematics", prompt: "Explore sine waves with adjustable amplitude, frequency, and phase.", description: "Amplitude, period, and phase on a live coordinate grid.",
    spec: {
      meta: { title: "Sine Function Explorer", domain: "mathematics", audience: "teacher", teacherNotes: "Students connect function parameters to visible repeating patterns on a graph." },
      variables: [{ id: "amplitude", label: "Amplitude", unit: "units", min: 0.2, max: 3, step: 0.1, default: 1 }, { id: "frequency", label: "Frequency", unit: "cycles", min: 0.5, max: 4, step: 0.1, default: 1 }, { id: "phase", label: "Phase shift", unit: "rad", min: -3.14, max: 3.14, step: 0.1, default: 0 }],
      formulas: [{ id: "sine", expression: "y = A sin(Bx + C)", description: "Amplitude, frequency, and phase determine the graph's shape and position." }],
      boundaries: ["Frequency remains positive.", "The graph is sampled at a stable resolution."], renderer: { type: "trig", xLabel: "x", yLabel: "y" }
    }
  },
  {
    title: "Coordinate Distance", subject: "Mathematics", prompt: "Use a right triangle to explore coordinate distance with adjustable horizontal and vertical change.", description: "Distance formula visualized through an adjustable right triangle.",
    spec: {
      meta: { title: "Coordinate Distance Lab", domain: "mathematics", audience: "teacher", teacherNotes: "Students connect horizontal and vertical differences to straight-line distance." },
      variables: [{ id: "side_a", label: "Horizontal change", unit: "units", min: 1, max: 12, step: 1, default: 5 }, { id: "side_b", label: "Vertical change", unit: "units", min: 1, max: 12, step: 1, default: 7 }, { id: "scale", label: "Diagram scale", unit: "x", min: 0.7, max: 1.6, step: 0.1, default: 1 }],
      formulas: [{ id: "distance", expression: "d = sqrt((x2-x1)^2 + (y2-y1)^2)", description: "Coordinate distance follows the Pythagorean relationship." }],
      boundaries: ["Coordinate differences remain positive for this model.", "The triangle stays within the graph window."], renderer: { type: "pythagoras", xLabel: "Horizontal", yLabel: "Vertical" }
    }
  },
  {
    title: "Beam Deflection", subject: "Physics", prompt: "Explore beam deflection by changing load, span, and stiffness.", description: "How engineering structures bend under changing loads.",
    spec: {
      meta: { title: "Beam Deflection Lab", domain: "physics", audience: "teacher", teacherNotes: "Students observe how load, span, and stiffness affect the bending of a supported beam." },
      variables: [{ id: "load", label: "Load", unit: "N", min: 1, max: 30, step: 1, default: 12 }, { id: "span", label: "Beam span", unit: "m", min: 2, max: 10, step: 0.5, default: 6 }, { id: "stiffness", label: "Stiffness", unit: "N/m", min: 80, max: 600, step: 10, default: 260 }],
      formulas: [{ id: "deflection", expression: "delta = PL^3 / (48EI)", description: "Deflection grows with load and span, while stiffness resists bending." }],
      boundaries: ["Load and stiffness remain positive.", "Deflection is scaled for visibility."], renderer: { type: "beam", xLabel: "Span", yLabel: "Deflection" }
    }
  }
];

function App() {
  const theme = useThemeState();
  const layout = useLayoutState();
  const pipeline = useCompilationPipeline();
  const launchHomeLesson = useCallback((lesson) => {
    layout.setSubject(lesson.subject);
    layout.setHome(false);
    pipeline.runDemo(lesson, layout.role);
  }, [layout, pipeline]);

  const handleWorkspaceAction = useCallback((action) => {
    if (action === "classroom") {
      layout.setClassroomMode((value) => {
        const next = !value;
        if (next) layout.setDeveloperMode(false);
        return next;
      });
      return;
    }
    if (action === "teacher") {
      layout.setClassroomMode(false);
      return;
    }
    if (action === "developer") {
      if (!layout.classroomMode) layout.setDeveloperMode((value) => !value);
      return;
    }
    if (action === "explain") {
      layout.setLessonTab("explain");
      return;
    }
    if (action === "regenerate") {
      pipeline.compile(layout.role);
      return;
    }
    if (action === "reset-runtime") {
      pipeline.refreshRuntime();
    }
  }, [layout, pipeline]);
  useKeyboardShortcuts({ onAction: handleWorkspaceAction, onToggleTheme: theme.toggleDarkMode });
  const workspaceGridClass = layout.classroomMode
    ? "grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(220px,270px)_minmax(0,1.45fr)_minmax(250px,285px)]"
    : "grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(250px,310px)_minmax(0,1fr)_minmax(250px,300px)]";
  const teacherPanel = h(ErrorBoundary, null, h(TeacherConsole, { pipeline }));
  const simulationPanel = h(ErrorBoundary, null, h(SimulationPanel, { pipeline }));
  const controlsPanel = h(ErrorBoundary, null, h(ControlsSidebar, { pipeline }));

  return h(ThemeContext.Provider, { value: theme },
    h(LayoutContext.Provider, { value: layout },
      layout.home ? h(HomePage, { pipeline, onLaunch: launchHomeLesson }) : h("main", { className: "min-h-screen bg-slate-900 text-slate-100", "aria-busy": pipeline.loading },
        h(Header, { pipeline, classroomMode: layout.classroomMode, onAction: handleWorkspaceAction, onHome: () => layout.setHome(true) }),
          h("section", { className: "mx-auto grid min-w-0 max-w-[1800px] gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:gap-5 lg:py-5 xl:gap-6 xl:py-6" },
          pipeline.error ? h(UnsupportedConceptNotice, { message: pipeline.error, onHome: () => layout.setHome(true) }) : h(React.Fragment, null,
            h(DemoHud, { lessonTitle: pipeline.spec?.meta.title || "Ready to visualize", stage: pipeline.stage, generationMs: pipeline.generationMs }),
            h("section", { className: workspaceGridClass },
              teacherPanel,
              simulationPanel,
              controlsPanel
            )
          )
      )
    )
    )
  );
}

function DemoHud({ lessonTitle, stage, generationMs }) {
  const stages = ["Thinking...", "Planning...", "Generating Code...", "Launching Sandbox..."];
  return h("section", { className: "lc-enter flex flex-wrap items-center gap-2 border-b border-white/10 pb-3", "aria-live": "polite" },
    h("span", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Current lesson"),
    h("h2", { className: "text-sm font-semibold text-white" }, lessonTitle),
    generationMs === null ? null : h("span", { className: "rounded-full border border-teal-300/30 bg-slate-950/50 px-2.5 py-1 font-mono text-xs font-semibold text-teal-200" }, `Generation Speed: ${(generationMs / 1000).toFixed(2)}s`),
    stage !== "Live" ? h("div", { className: "flex flex-wrap gap-2" },
      stages.map((item) => h("span", { key: item, className: item === stage ? "rounded-md bg-teal-300/20 px-2 py-1 text-xs font-semibold text-teal-100" : "rounded-md bg-white/[0.05] px-2 py-1 text-xs font-medium text-slate-500", "aria-current": item === stage ? "step" : undefined }, item))
    ) : null
  );
}

function UnsupportedConceptNotice({ message, onHome }) {
  const [visible, setVisible] = useState(Boolean(message));
  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const timeout = window.setTimeout(onHome, 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);
  if (!visible) return null;
  return h("section", { className: "lc-unsupported-notice rounded-lg border border-amber-300/30 bg-amber-300/[0.08] px-4 py-3", role: "alert" },
    h("p", { className: "lc-unsupported-title text-sm font-semibold text-amber-100" }, "We do not have a ready visual for that yet."),
    h("p", { className: "lc-unsupported-copy mt-1 text-xs leading-5 text-amber-100/80" }, "Try a ready lesson such as Vector Field, Projectile Motion, Snell's Law, Newton's Laws, Ohm's Law, Simple Pendulum, Wave Interference, the Pythagorean Theorem, or Beam Deflection."),
    h("button", { type: "button", onClick: onHome, className: "mt-3 rounded-md border border-amber-200/30 bg-amber-100/10 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-100/20" }, "Browse ready lessons")
  );
}

function HomePage({ pipeline, onLaunch }) {
  const { subject, setSubject } = useContext(LayoutContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [query, setQuery] = useState("");
  const subjects = ["All Subjects", "Physics", "Mathematics", "Engineering"];
  const readyLessons = useMemo(() => [...DEMO_SEQUENCE, ...CONCEPT_COVERAGE.filter((item) => !DEMO_SEQUENCE.some((demo) => demo.title === item.title))], []);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const candidates = normalizedQuery ? readyLessons : subject === "All Subjects" ? readyLessons : readyLessons.filter((lesson) => lesson.subject === subject);
    if (!normalizedQuery) return candidates;
    return candidates.filter((lesson) => [lesson.title, lesson.subject, lesson.prompt, lesson.description, ...lesson.spec.variables.map((variable) => variable.label)].join(" ").toLowerCase().includes(normalizedQuery));
  }, [query, readyLessons, subject]);
  const noResults = query.trim().length > 0 && results.length === 0;
  const lessonGlyphs = { projectile: "↗", optics: "◐", vector: "→", newton: "F", pendulum: "⌁", circuit: "⊕", wave: "∿", pythagoras: "△", beam: "▱", logic: "◇", trig: "∿" };
  const selectLesson = (lesson) => {
    pipeline.setPrompt(lesson.prompt);
    onLaunch(lesson);
  };

  return h("main", { className: "min-h-screen bg-slate-900 text-slate-100" },
    h("header", { className: "border-b border-white/10 bg-slate-900/95 px-4 py-4 sm:px-6" },
      h("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4" },
        h("div", { className: "flex items-center gap-3" },
          h("span", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400 text-sm font-semibold text-slate-950" }, "LC"),
          h("div", null,
            h("p", { className: "text-base font-semibold text-white" }, "LogicCanvas"),
            h("p", { className: "text-xs text-slate-400" }, "AI-Powered STEM Simulations for Teacher-Led Discovery")
          )
        ),
        h("button", { type: "button", onClick: toggleDarkMode, className: "rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10", "aria-pressed": darkMode }, darkMode ? "Light mode" : "Dark mode")
      )
    ),
    h("section", { className: "mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16" },
      h("div", { className: "grid max-w-3xl gap-3" },
        h("span", { className: "w-fit rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200" }, "⚡ Powered by OpenAI GPT-5.6 & Trusted Canvas Engine"),
        h("h1", { className: "text-3xl font-semibold leading-tight text-white sm:text-4xl" }, "Find a STEM concept to visualise"),
        h("p", { className: "max-w-2xl text-base leading-7 text-slate-300" }, "AI-Powered STEM Simulations for Teacher-Led Discovery")
      ),
      h("form", { className: "grid gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-black/20 sm:grid-cols-[minmax(0,1fr)_180px]", onSubmit: (event) => { event.preventDefault(); if (results.length === 1) selectLesson(results[0]); } },
        h("div", { className: "relative" },
          h("label", { className: "sr-only", htmlFor: "homeConceptSearch" }, "Search ready STEM concepts"),
          h("span", { className: "pointer-events-none absolute inset-y-0 left-0 grid w-12 place-items-center text-lg text-teal-200", "aria-hidden": "true" }, "⌕"),
          h("input", { id: "homeConceptSearch", value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Try vector field, Newton's laws, pendulum, or Pythagorean theorem", className: "h-14 w-full rounded-lg border border-white/10 bg-slate-950 pl-12 pr-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20" })
        ),
        h("select", { value: subject, onChange: (event) => setSubject(event.target.value), "aria-label": "Filter ready concepts by subject", className: "h-14 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm font-medium text-slate-100 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20" }, subjects.map((item) => h("option", { key: item, value: item }, item)))
      ),
      noResults ? h("section", { className: "rounded-xl border border-amber-300/30 bg-amber-300/[0.08] p-5", role: "status" },
        h("h2", { className: "text-base font-semibold text-amber-100" }, "No ready visualisation found"),
        h("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-amber-100/80" }, "Try a more specific Physics, Mathematics, or Engineering concept, or choose one of the ready concepts below.")
      ) : null,
      h("section", { className: "grid gap-4", "aria-labelledby": "readyConceptsTitle" },
        h("div", { className: "flex flex-wrap items-baseline justify-between gap-3" },
          h("h2", { id: "readyConceptsTitle", className: "text-lg font-semibold text-white" }, query.trim() ? "Matching ready concepts" : "Recently viewed concepts"),
          h("span", { className: "text-sm text-slate-400" }, `${results.length} available`)
        ),
        results.length ? h("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" },
          results.slice(0, 9).map((lesson) => h("button", { key: lesson.title, type: "button", onClick: () => selectLesson(lesson), className: "lc-home-card grid min-h-40 content-start gap-3 rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-left transition-all duration-200 hover:border-teal-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-teal-950/30 focus-visible:outline-teal-300" },
            h("span", { className: "flex items-center justify-between gap-3" },
              h("span", { className: "flex min-w-0 items-center gap-3" },
                h("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-teal-300/20 bg-teal-300/10 text-lg font-semibold text-teal-200", "aria-hidden": "true" }, lessonGlyphs[lesson.spec.renderer.type] || "•"),
                h("span", { className: "text-base font-semibold text-white" }, lesson.title)
              ),
              h("span", { className: "rounded-full bg-teal-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal-200" }, lesson.subject)
            ),
            h("span", { className: "text-sm leading-5 text-slate-400" }, lesson.description || lesson.spec.meta.teacherNotes)
          ))
        ) : null
      )
    )
  );
}

function Header({ pipeline, classroomMode, onAction, onHome }) {
  const { subject, setSubject, role } = useContext(LayoutContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const subjects = ["All Subjects", "Physics", "Mathematics", "Engineering"];
  const matchingDemos = useMemo(() => {
    const query = pipeline.prompt.trim().toLowerCase();
    const searchableLessons = [...DEMO_SEQUENCE, ...CONCEPT_COVERAGE.filter((item) => !DEMO_SEQUENCE.some((demo) => demo.title === item.title))];
    if (!query) return subject === "All Subjects" ? searchableLessons : searchableLessons.filter((demo) => demo.subject === subject);
    return searchableLessons.filter((demo) => [demo.title, demo.subject, demo.prompt, demo.spec.meta.teacherNotes, ...demo.spec.variables.map((variable) => variable.label)].join(" ").toLowerCase().includes(query));
  }, [pipeline.prompt, subject]);
  const launchDemo = useCallback((demo) => {
    pipeline.setPrompt(demo.prompt);
    setSubject(demo.subject);
    setSearchOpen(false);
    pipeline.runDemo(demo, role);
  }, [pipeline, role, setSubject]);
  const brand = h("button", { type: "button", onClick: onHome, className: "flex min-w-0 items-center gap-3 text-left", "aria-label": "Return to LogicCanvas home" },
    h("span", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400 text-sm font-semibold text-slate-950" }, "LC"),
    h("span", { className: "min-w-0" },
      h("span", { className: "block text-base font-semibold leading-tight text-white" }, "LogicCanvas"),
      h("span", { className: "block line-clamp-2 text-xs leading-4 text-slate-400" }, "AI-Powered STEM Simulations for Teacher-Led Discovery")
    )
  );
  const utilities = h("div", { className: "flex shrink-0 items-center gap-2" },
    h("button", { type: "button", onClick: () => onAction("classroom"), disabled: pipeline.loading, "aria-pressed": !classroomMode, "aria-label": classroomMode ? "Switch to teacher workspace" : "Switch to classroom mode", "aria-keyshortcuts": "Alt+1 Alt+2", className: "rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60" }, classroomMode ? "Teacher Workspace" : "Classroom Mode"),
    h("button", { type: "button", onClick: toggleDarkMode, className: "rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10", "aria-pressed": darkMode, "aria-label": "Toggle dark mode", "aria-keyshortcuts": "Alt+T" }, darkMode ? "Light mode" : "Dark mode")
  );
  return h("header", { className: "sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4", role: "banner" },
    h("div", { className: "mx-auto grid min-w-0 max-w-[1680px] gap-3 lg:grid-cols-[minmax(210px,260px)_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_auto]" },
      brand,
      h("form", {
        className: "grid min-w-0 gap-2 rounded-xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-black/20 sm:grid-cols-[minmax(0,1fr)_160px_auto] lg:grid-cols-[minmax(0,1fr)_150px_auto] xl:grid-cols-[minmax(0,1fr)_170px_auto]",
        onSubmit: (event) => {
          event.preventDefault();
          if (matchingDemos.length === 1) {
            launchDemo(matchingDemos[0]);
          } else {
            setSearchOpen(false);
            pipeline.compile(role);
          }
        }
      },
        h("div", { className: "relative min-w-0" },
          h("label", { className: "sr-only", htmlFor: "conceptCommand" }, "What STEM concept are we visualizing today?"),
          h("input", {
            id: "conceptCommand",
            value: pipeline.prompt,
            onChange: (event) => {
              pipeline.setPrompt(event.target.value);
              setSearchOpen(true);
            },
            onFocus: () => setSearchOpen(true),
            onBlur: () => setSearchOpen(false),
            onKeyDown: (event) => {
              if (event.key === "Escape") setSearchOpen(false);
            },
            disabled: pipeline.loading,
            placeholder: "Search a lab or describe a STEM concept",
            "aria-describedby": "conceptCommandHint",
            "aria-controls": "conceptSuggestions",
            "aria-expanded": searchOpen && matchingDemos.length > 0,
            "aria-keyshortcuts": "/",
            className: "h-12 w-full rounded-lg border border-transparent bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-wait disabled:opacity-70"
          }),
          searchOpen && matchingDemos.length > 0 ? h("div", { id: "conceptSuggestions", role: "listbox", className: "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 grid overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/40" },
            h("p", { className: "border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400" }, "Built-in lessons"),
            matchingDemos.slice(0, 4).map((demo) => h("button", {
              key: demo.title,
              type: "button",
              role: "option",
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => launchDemo(demo),
              className: "grid gap-1 border-b border-white/5 px-3 py-3 text-left last:border-b-0 hover:bg-white/[0.06] focus-visible:bg-white/[0.06]"
            },
              h("span", { className: "flex items-center justify-between gap-3" },
                h("span", { className: "text-sm font-semibold text-slate-100" }, demo.title),
                h("span", { className: "rounded-full bg-teal-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-200" }, demo.subject)
              ),
              h("span", { className: "line-clamp-1 text-xs text-slate-400" }, demo.spec.meta.teacherNotes)
            ))
          ) : null
        ),
        h("span", { id: "conceptCommandHint", className: "sr-only" }, "Press slash to focus this field. Press Enter to generate a visualization."),
        h("select", {
          value: subject,
          onChange: (event) => setSubject(event.target.value),
          disabled: pipeline.loading,
          "aria-label": "Subject module",
          className: "h-12 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm font-medium text-slate-100 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-wait disabled:opacity-70"
        }, subjects.map((item) => h("option", { key: item, value: item }, item))),
        h("button", {
          type: "submit",
          disabled: pipeline.loading,
          className: "h-12 rounded-lg bg-teal-300 px-5 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
        }, pipeline.loading ? "Creating" : "Visualize")
      ),
      h("div", { className: "flex min-w-0 flex-wrap items-center justify-start gap-2 lg:col-span-2 xl:col-span-1 xl:justify-end" }, utilities)
    )
  );
}

function TeacherConsole({ pipeline }) {
  const { classroomMode } = useContext(LayoutContext);
  return h("aside", { className: "grid min-w-0 content-start gap-4" },
    !classroomMode && pipeline.spec ? h(TeacherPack, { spec: pipeline.spec, values: pipeline.controlValues }) : null,
    h(ConceptSummary, { spec: pipeline.spec, values: pipeline.controlValues, loading: pipeline.loading }),
    pipeline.spec ? classroomMode
      ? h(WorkspaceAccordion, { title: "Explore this lab", subtitle: "A short pathway for investigating the model", open: true }, h(ClassroomInvestigation, { spec: pipeline.spec }))
      : h(WorkspaceAccordion, { title: "Lesson metadata", subtitle: "Grade, time, outcomes, and prerequisites", open: true }, h(LessonOverview, { spec: pipeline.spec }))
      : null
  );
}

function WorkspaceAccordion({ title, subtitle, open = false, children }) {
  return h("details", { open, className: "group rounded-xl border border-white/10 bg-slate-950/60" },
    h("summary", { className: "flex cursor-pointer list-none items-center justify-between gap-3 p-4" },
      h("span", null,
        h("span", { className: "block text-sm font-semibold text-white" }, title),
        h("span", { className: "mt-1 block text-xs leading-5 text-slate-400" }, subtitle)
      ),
      h("span", { className: "text-lg text-teal-200 group-open:rotate-45", "aria-hidden": "true" }, "+")
    ),
    h("div", { className: "grid gap-4 border-t border-white/10 p-4" }, children)
  );
}

function ConceptSummary({ spec, values, loading }) {
  const { classroomMode } = useContext(LayoutContext);
  return h("section", { className: "grid min-w-0 gap-4 rounded-xl border border-white/10 bg-slate-950/70 p-5" },
    h("div", null,
      h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, classroomMode ? "Classroom lesson" : "Teacher workspace"),
      h("h2", { className: "mt-1 text-xl font-semibold leading-tight text-white" }, spec?.meta.title || (loading ? "Preparing lesson" : "Choose a concept"))
    ),
    h("p", { className: "max-w-prose text-sm leading-6 text-slate-300" }, spec?.meta.teacherNotes || "Enter a STEM concept above to create an interactive classroom-ready visualization."),
    spec ? h("div", { className: "rounded-lg border-l-2 border-teal-300/70 bg-teal-300/[0.06] px-3 py-2" },
      h("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-teal-200" }, "In simpler terms"),
      h("p", { className: "mt-1 text-sm leading-5 text-slate-200" }, getConceptDefinition(spec))
    ) : null,
    spec ? h("div", { className: "flex flex-wrap gap-2" },
      h("span", { className: "rounded-full bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-200" }, spec.meta.domain),
      h("span", { className: "rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300" }, `${spec.variables.length} adjustable controls`),
      h("span", { className: "rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300" }, `${spec.formulas.length} key ${spec.formulas.length === 1 ? "equation" : "equations"}`)
    ) : null
  );
}

function getConceptDefinition(spec) {
  const title = spec.meta.title.toLowerCase();
  if (title.includes("newton")) return "Newton's second law says that a stronger net push creates more acceleration, while a heavier object needs more force to speed up.";
  if (title.includes("snell") || spec.renderer.type === "optics") return "Snell's law explains how light bends when it crosses from one material into another because its speed changes.";
  if (title.includes("pythag") || title.includes("distance")) return "The Pythagorean theorem says that, in a right triangle, the two shorter sides determine the length of the longest side.";
  if (title.includes("ohm") || title.includes("circuit")) return "Ohm's law explains that electrical current increases with voltage and decreases when resistance is higher.";
  if (title.includes("pendulum") || spec.renderer.type === "pendulum") return "A pendulum swings back and forth. Its length and gravity determine how long one complete swing takes.";
  if (title.includes("projectile")) return "Projectile motion combines forward movement with gravity pulling the object downward, creating a curved path.";
  if (title.includes("wave") || spec.renderer.type === "wave") return "Wave interference happens when waves overlap, making the combined pattern stronger in some places and weaker in others.";
  if (title.includes("vector") || spec.renderer.type === "vector") return "A vector shows both direction and size, so the arrows reveal where a quantity points and how strong it is.";
  if (title.includes("beam") || spec.renderer.type === "beam") return "Beam deflection describes how much a supported beam bends when a load is placed on it.";
  if (title.includes("trig") || title.includes("sine") || spec.renderer.type === "trig") return "A trigonometric function describes a repeating pattern, such as a wave, using its height, rhythm, and starting position.";
  return spec.formulas[0]?.description || "This model shows how the selected variables are connected by the main equation.";
}

function ClassroomInvestigation({ spec }) {
  const primary = spec.variables[0];
  const secondary = spec.variables[1];
  const formula = spec.formulas[0];
  return h("section", { className: "grid min-w-0 gap-3 rounded-lg border border-teal-300/20 bg-teal-300/[0.06] p-3", "aria-labelledby": "classroomInvestigationTitle" },
    h("div", null,
      h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Try this now"),
      h("h3", { id: "classroomInvestigationTitle", className: "mt-1 text-base font-semibold text-white" }, "Find evidence in the model")
    ),
    h("ol", { className: "grid gap-2" },
      [
        { title: "Observe the baseline", detail: `Read the starting pattern before moving ${primary.label.toLowerCase()}.` },
        { title: "Change one control", detail: `Adjust ${primary.label.toLowerCase()}${secondary ? `, then test ${secondary.label.toLowerCase()},` : ""} one at a time.` },
        { title: "Explain the evidence", detail: formula?.description || "Use the visible model and equation to support your explanation." }
      ].map((step, index) => h("li", { key: step.title, className: "grid grid-cols-[1.8rem_minmax(0,1fr)] gap-2 rounded-lg border border-teal-300/15 bg-slate-950/35 p-3" },
        h("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-teal-300/20 text-xs font-bold text-teal-100" }, index + 1),
        h("span", { className: "min-w-0" },
          h("strong", { className: "block text-sm font-semibold text-teal-50" }, step.title),
          h("span", { className: "mt-0.5 block text-sm leading-5 text-slate-300" }, step.detail)
        )
      ))
    ),
    h("p", { className: "rounded-md border-l-2 border-teal-300/70 bg-teal-300/[0.08] px-3 py-2 text-sm leading-5 text-teal-50" }, "Use one visible change in the diagram as evidence when you share your answer.")
  );
}

function LessonOverview({ spec }) {
  const overview = getLessonOverview(spec);
  return h("section", { className: "grid min-w-0 gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4", "aria-labelledby": "lessonOverviewTitle" },
    h("div", { className: "flex items-start justify-between gap-3" },
      h("div", null,
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Lesson at a glance"),
        h("h3", { id: "lessonOverviewTitle", className: "mt-1 text-base font-semibold text-white" }, "What students will take away")
      ),
      h("span", { className: "shrink-0 rounded-full bg-teal-300/10 px-2.5 py-1 text-[11px] font-semibold text-teal-200" }, "Auto-generated")
    ),
    h("div", { className: "grid min-w-0 gap-4" },
      h("section", { className: "grid min-w-0 gap-2", "aria-labelledby": "studentsLearnTitle" },
        h("div", { className: "flex items-center justify-between gap-3" },
          h("h4", { id: "studentsLearnTitle", className: "text-xs font-semibold uppercase tracking-wide text-slate-400" }, "Students will learn"),
          h("span", { className: "text-[11px] font-medium text-slate-500" }, `${overview.studentsWillLearn.length} focus areas`)
        ),
        h("ul", { className: "grid gap-2" },
          overview.studentsWillLearn.map((item, index) => h("li", { key: `${item}-${index}`, className: "grid min-w-0 grid-cols-[28px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-teal-300/10 bg-teal-300/[0.06] p-3" },
            h("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-teal-300/15 text-xs font-bold text-teal-200", "aria-hidden": "true" }, index + 1),
            h("span", { className: "min-w-0 text-sm leading-6 text-slate-200" }, item)
          ))
        )
      ),
      h("section", { className: "hidden", "aria-labelledby": "learningOutcomesTitle" },
        h("div", { className: "flex items-center justify-between gap-3" },
          h("h4", { id: "learningOutcomesTitle", className: "text-xs font-semibold uppercase tracking-wide text-slate-400" }, ""),
          h("span", { className: "text-[11px] font-medium text-slate-500" }, "")
        ),
        h("ul", { className: "grid gap-2" },
          overview.learningOutcomes.map((item, index) => h("li", { key: `${item}-${index}`, className: "grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-amber-300/10 bg-amber-300/[0.05] p-3" },
            h("span", { className: "mt-1 flex h-4 w-4 items-center justify-center rounded border border-amber-300/60 text-[10px] text-amber-300", "aria-hidden": "true" }, "✓"),
            h("span", { className: "min-w-0 text-sm leading-6 text-slate-200" }, item)
          ))
        )
      )
    ),
    h("dl", { className: "grid min-w-0 grid-cols-1 gap-2 rounded-lg bg-slate-950/60 p-3 sm:grid-cols-2" },
      overview.details.map((item) => h("div", { key: item.label, className: "min-w-0 border-b border-white/5 pb-2 last:border-0 last:pb-0 sm:border-b-0 sm:pb-0" },
        h("dt", { className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500" }, item.label),
        h("dd", { className: "mt-1 break-words text-sm font-medium leading-5 text-slate-100" }, item.value)
      ))
    )
  );
}

function DiagramExplanation({ spec, values }) {
  const { classroomMode } = useContext(LayoutContext);
  const [modifier, setModifier] = useState("simpler");
  const [activeModifier, setActiveModifier] = useState("simpler");
  const [open, setOpen] = useState(false);
  const explanation = getExplanationVariant(spec, values, activeModifier);
  const applications = spec.educational?.realWorldApplications?.slice(0, 2) || [];
  const modifierLabel = modifier === "analogy" ? "Real world analogy" : modifier === "detailed" ? "More detailed" : "Simpler";
  return h("section", { id: "explain-this", className: "grid min-w-0 gap-4 rounded-xl border border-teal-300/20 bg-teal-300/10 p-4 text-sm leading-6 text-teal-50 sm:p-5", "aria-labelledby": "explanationTitle" },
    h("button", {
      type: "button",
      onClick: () => setOpen((current) => !current),
      "aria-expanded": open,
      className: "flex w-full items-center justify-between gap-3 text-left"
    },
      h("span", null,
        h("span", { className: "block text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Explain this"),
        h("span", { className: "mt-1 block text-xs text-teal-100/80" }, "Understand what the diagram shows and how the controls affect it.")
      ),
      h("span", { className: "text-lg leading-none text-teal-200", "aria-hidden": "true" }, open ? "−" : "+")
    ),
    open ? h("div", { className: "grid min-w-0 gap-4 border-t border-teal-200/10 pt-4" },
      h("div", { className: "grid min-w-0 gap-3" },
        h("div", { className: "grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" },
          h("label", { className: "sr-only", htmlFor: "explanationModifier" }, "Explanation style"),
          h("select", {
            id: "explanationModifier",
            value: modifier,
            onChange: (event) => setModifier(event.target.value),
            className: "h-10 w-full min-w-0 rounded-md border border-teal-200/20 bg-slate-950/50 px-3 text-xs font-semibold text-teal-50 outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-200/20"
          },
            h("option", { value: "simpler" }, "Simpler"),
            h("option", { value: "detailed" }, "More Detailed"),
            h("option", { value: "analogy" }, "Real World Analogy")
          ),
          h("button", {
            type: "button",
            onClick: () => setActiveModifier(modifier),
            className: "h-10 w-full rounded-md bg-teal-300 px-4 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline-teal-100 sm:w-auto"
          }, "Explain Again")
        ),
        h("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-teal-200/80", "aria-live": "polite" }, `Showing: ${modifierLabel}`)
      ),
      h("div", { className: "min-w-0" },
        h("p", { id: "explanationTitle", className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "How to read this diagram"),
        h("p", { className: "mt-1 whitespace-normal break-words" }, explanation.depicts)
      ),
      !classroomMode ? h("div", { className: "min-w-0 border-t border-teal-200/10 pt-3" },
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Model relationships"),
        h("div", { className: "mt-2 grid gap-2" },
          spec.formulas.map((formula) => h("div", { key: formula.id, className: "rounded-md bg-slate-950/50 px-3 py-2" },
            h("code", { className: "block break-words font-mono text-sm font-semibold text-teal-200" }, formula.expression),
            h("p", { className: "mt-1 text-xs leading-5 text-teal-50/80" }, formula.description)
          ))
        )
      ) : null,
      !classroomMode && applications.length ? h("div", { className: "min-w-0 border-t border-teal-200/10 pt-3" },
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Where this is used"),
        h("ul", { className: "mt-2 grid gap-2" },
          applications.map((application) => h("li", { key: application, className: "rounded-md border border-teal-200/10 bg-slate-950/30 px-3 py-2 text-sm leading-5 text-teal-50" }, application))
        )
      ) : null,
      h("div", { className: "min-w-0 border-t border-teal-200/10 pt-3" },
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "What changes when you adjust it"),
        h("p", { className: "mt-1 whitespace-normal break-words" }, explanation.behavior)
      ),
      h("div", { className: "min-w-0 border-t border-teal-200/10 pt-3" },
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Try this"),
        h("p", { className: "mt-1 whitespace-normal break-words" }, explanation.tryIt)
      )
    ) : null
  );
}

function getExplanationVariant(spec, values, modifier) {
  const base = getDiagramExplanation(spec, values);
  if (modifier === "detailed") {
    return {
      depicts: `${base.depicts} The main visual is a model of ${spec.meta.title.toLowerCase()}, so students can connect the visible pattern to the lesson's scientific idea.`,
      behavior: `${base.behavior} The model stays within these classroom boundaries: ${spec.boundaries[0]}`,
      tryIt: `${base.tryIt} Then ask students to describe the change using the equation: ${spec.formulas[0].description.toLowerCase()}`
    };
  }
  if (modifier === "analogy") {
    const analogies = {
      projectile: "Think of it like watching a ball thrown across a field: it moves forward while gravity pulls it down.",
      wave: "Think of two ripples meeting in a pond: they can combine to make a taller ripple or flatten each other.",
      logic: "Think of the gate like a decision rule: it checks the inputs and switches the output on or off.",
      circuit: "Think of the circuit like traffic moving through several roads: voltage drives the flow while resistance limits it.",
      optics: "Think of the boundary like a change in road surface: the light changes direction as its speed changes.",
      vector: "Think of each arrow like a tiny instruction showing where to move and how strongly.",
      newton: "Think of pushing a shopping trolley: the same push creates more acceleration when the trolley is lighter.",
      beam: "Think of a shelf with a heavy book in the middle: the shape shows how the shelf bends under the load.",
      trig: "Think of a repeating swing: the graph shows its height, rhythm, and starting position over time."
    };
    return {
      depicts: `${analogies[spec.renderer.type] || analogies.trig} ${base.depicts}`,
      behavior: base.behavior,
      tryIt: base.tryIt
    };
  }
  if (modifier === "simpler") {
    return {
      depicts: `This diagram shows ${spec.meta.title.toLowerCase()} in motion. The colored line shows the main pattern, and the moving marker shows one live example.`,
      behavior: base.behavior,
      tryIt: "Change one slider, watch the picture, and describe what moved, grew, shrank, or changed direction."
    };
  }
  return base;
}

function TeacherPack({ spec, values }) {
  const challengeCards = useMemo(() => getChallengeCards(spec, values), [spec, values]);
  const [includedIds, setIncludedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAllChallenges, setShowAllChallenges] = useState(false);

  useEffect(() => {
    setIncludedIds(challengeCards.slice(0, 2).map((card) => card.id));
    setExpandedId(null);
    setShowAllChallenges(false);
  }, [spec.meta.title]);

  const includedCards = challengeCards.filter((card) => includedIds.includes(card.id));
  const visibleChallenges = showAllChallenges ? challengeCards : challengeCards.slice(0, 2);
  const toggleCard = (id) => {
    setIncludedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return h(React.Fragment, null,
    h("section", { className: "lc-teacher-pack grid gap-3 rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-4", "aria-labelledby": "teacherPackTitle" },
      h("div", { className: "flex flex-wrap items-start justify-between gap-3" },
        h("div", null,
          h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Teacher Pack"),
          h("h3", { id: "teacherPackTitle", className: "mt-1 text-base font-semibold text-white" }, "Student Challenge Mode"),
          h("p", { className: "mt-1 max-w-prose text-sm leading-5 text-slate-300" }, "Choose conceptual checks that students can answer by changing the live model and citing visual evidence.")
        ),
        h("button", {
          type: "button",
          onClick: () => window.print(),
          className: "inline-flex shrink-0 items-center justify-center rounded-lg bg-teal-300 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline-teal-100",
          "aria-label": "Print or save the current teacher pack as PDF"
        }, "Export Student Handout (PDF)")
      ),
      h("details", { className: "group rounded-lg border border-white/10 bg-slate-950/35" },
        h("summary", { className: "flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5" },
          h("span", { className: "text-xs font-semibold text-slate-100" }, "Interactive challenge cards"),
          h("span", { className: "text-sm text-teal-200 group-open:rotate-45", "aria-hidden": "true" }, "+")
        ),
        h("div", { className: "grid gap-2 border-t border-white/10 p-3" },
          visibleChallenges.map((card, index) => {
          const expanded = expandedId === card.id;
          const included = includedIds.includes(card.id);
          return h("article", { key: card.id, className: included ? "grid gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-3" : "grid gap-2 rounded-lg border border-white/5 bg-slate-950/30 p-3 opacity-65" },
            h("div", { className: "flex items-start gap-3" },
              h("input", {
                id: `challenge-${card.id}`,
                type: "checkbox",
                checked: included,
                onChange: () => toggleCard(card.id),
                className: "mt-1 h-4 w-4 shrink-0 accent-teal-300",
                "aria-label": `Include challenge ${index + 1} in worksheet`
              }),
              h("label", { htmlFor: `challenge-${card.id}`, className: "min-w-0 flex-1 cursor-pointer" },
                h("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-teal-200" }, `Challenge ${index + 1}`),
                h("span", { className: "mt-1 block text-sm leading-5 text-slate-200" }, card.question)
              )
            ),
            h("button", {
              type: "button",
              onClick: () => setExpandedId((current) => current === card.id ? null : card.id),
              "aria-expanded": expanded,
              className: "justify-self-start text-xs font-semibold text-teal-200 hover:text-teal-100"
            }, expanded ? "Hide answer and teacher cue" : "Show answer and teacher cue"),
            expanded ? h("div", { className: "rounded-md border-l-2 border-teal-300/60 bg-teal-300/[0.06] px-3 py-2 text-xs leading-5 text-teal-50" },
              h("span", { className: "font-semibold text-teal-200" }, "Look for: "),
              card.teacherCue,
              h("span", { className: "mt-2 block font-semibold text-teal-200" }, "Answer: "),
              h("span", null, card.answer)
            ) : null
          );
          }),
          !showAllChallenges && challengeCards.length > 2 ? h("button", { type: "button", onClick: () => setShowAllChallenges(true), className: "justify-self-start text-xs font-semibold text-teal-200 hover:text-teal-100" }, "Show another challenge") : null,
          h("p", { className: "text-xs leading-5 text-slate-400" }, `${includedCards.length} of ${challengeCards.length} checks will be included in the worksheet.`)
        )
      )
    ),
    createPortal(h(PrintWorksheet, { spec, values, challengeCards: includedCards }), document.body)
  );
}

function PrintWorksheet({ spec, values, challengeCards }) {
  const baseline = spec.variables.map((variable) => ({
    label: variable.label,
    value: Number(values[variable.id] ?? variable.default),
    unit: variable.unit
  }));
  const educational = spec.educational || createEducationalContent(spec);
  const printChallenges = challengeCards.slice(0, 3);
  return h("section", { className: "lc-print-sheet", "aria-hidden": "true" },
    h("article", { className: "lc-print-page" },
      h("header", { className: "lc-print-heading" },
        h("p", null, "LogicCanvas Student Investigation"),
        h("h1", null, spec.meta.title),
        h("span", null, `${spec.meta.domain} | Interactive simulation worksheet`)
      ),
      h("section", { className: "lc-print-summary" },
        h("h2", null, "Your investigation"),
        h("p", null, spec.meta.teacherNotes)
      ),
      h("div", { className: "lc-print-two-column" },
        h("section", null,
          h("h2", null, "Model relationship"),
          h("code", null, spec.formulas[0].expression),
          h("p", null, spec.formulas[0].description)
        ),
        h("section", null,
          h("h2", null, "Starting controls"),
          h("ul", null, baseline.map((item) => h("li", { key: item.label }, `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`)))
        )
      ),
      h("section", { className: "lc-print-challenges" },
        h("h2", null, "Student challenges"),
        printChallenges.map((card, index) => h("article", { key: card.id },
          h("h3", null, `${index + 1}. ${card.shortTitle}`),
          h("p", null, card.question),
          h("div", { className: "lc-print-response" }, "Evidence from the simulation:")
        )),
        !printChallenges.length ? h("p", null, "No challenges selected. Use the live controls to create and test one prediction.") : null
      ),
      h("footer", { className: "lc-print-footer" }, "Name: ________________________________    Class: __________________    Date: __________________")
    ),
    h("article", { className: "lc-print-page" },
      h("header", { className: "lc-print-heading" },
        h("p", null, "LogicCanvas Supporting Materials"),
        h("h1", null, "Build your explanation"),
        h("span", null, "Use these prompts while working with the simulation.")
      ),
      h("div", { className: "lc-print-support-grid" },
        h("section", null,
          h("h2", null, "Key concepts"),
          h("ul", null, educational.keyConcepts.slice(0, 3).map((item, index) => h("li", { key: `concept-${index}` }, item)))
        ),
        h("section", null,
          h("h2", null, "Guided experiment"),
          h("ol", null, educational.guidedExperiments.slice(0, 3).map((item, index) => h("li", { key: `experiment-${index}` }, item)))
        ),
        h("section", null,
          h("h2", null, "Discuss"),
          h("ul", null, educational.discussionQuestions.slice(0, 2).map((item, index) => h("li", { key: `discussion-${index}` }, item)))
        ),
        h("section", null,
          h("h2", null, "Watch out for"),
          h("ul", null, educational.misconceptions.slice(0, 2).map((item, index) => h("li", { key: `misconception-${index}` }, item)))
        )
      ),
      h("section", { className: "lc-print-exit-ticket" },
        h("h2", null, "Exit ticket"),
        h("p", null, "What control made the biggest difference, and what evidence from the diagram supports your claim?"),
        h("div", null),
        h("div", null)
      ),
      h("footer", { className: "lc-print-footer" }, "Name: ________________________________    Class: __________________    Date: __________________")
    )
  );
}

function EducationalContentPanels({ educational }) {
  if (!educational) return null;
  const sections = [
    { title: "Key Concepts", items: educational.keyConcepts, tone: "concept" },
    { title: "Teaching Notes", items: [educational.teachingNotes], tone: "notes" },
    { title: "Common Misconceptions", items: educational.misconceptions, tone: "warning" },
    { title: "Discussion Questions", items: educational.discussionQuestions, tone: "question" },
    { title: "Assessment Questions", items: educational.assessmentQuestions, tone: "assessment" },
    { title: "Guided Experiments", items: educational.guidedExperiments, tone: "experiment", ordered: true }
  ];
  return h("section", { className: "grid gap-3" },
    h("div", null,
      h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Teacher materials"),
      h("h3", { className: "mt-1 text-base font-semibold text-white" }, "Lesson Content"),
      h("p", { className: "mt-2 max-w-prose text-sm leading-6 text-slate-400" }, "Use these ready-to-teach prompts and activities to turn the visual into a guided lesson, check understanding, and address likely misconceptions.")
    ),
    h("div", { className: "grid gap-3" },
      sections.map((section) => h(EducationalPanel, { key: section.title, ...section }))
    )
  );
}

function EducationalPanel({ title, items, tone, ordered }) {
  const List = ordered ? "ol" : "ul";
  return h("section", { className: "grid content-start gap-3 rounded-lg border border-white/10 bg-slate-950/70 p-3" },
    h("h4", { className: "text-sm font-semibold text-slate-100" }, title),
    h(List, { className: ordered ? "grid gap-2 pl-5 text-sm leading-6 text-slate-300 marker:text-teal-300" : "grid gap-2 text-sm leading-6 text-slate-300" },
      items.map((item, index) => h("li", { key: `${title}-${index}`, className: ordered ? "pl-1" : "rounded-md bg-white/[0.04] px-2 py-1.5" },
        tone === "warning" ? h("span", { className: "mr-2 font-semibold text-amber-300" }, "Correct:") : null,
        item
      ))
    )
  );
}

function PromptHistory({ items, onSelect, loading }) {
  return h("section", { className: "grid gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-4" },
    h("div", { className: "flex items-center justify-between gap-3" },
      h("h3", { className: "text-sm font-semibold text-white" }, "Prompt History"),
      h("span", { className: "text-xs font-semibold text-slate-400" }, `${items.length} saved`)
    ),
    items.length ? h("div", { className: "grid gap-2" },
      items.map((item) => h("button", {
        key: item.id,
        type: "button",
        onClick: () => onSelect(item),
        disabled: loading,
        className: "rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
      },
        h("span", { className: "flex items-center justify-between gap-2" },
          h("span", { className: "text-sm font-semibold text-slate-100" }, item.title),
          h("span", { className: "text-xs text-slate-500" }, item.createdAt)
        ),
        h("span", { className: "mt-1 block line-clamp-2 text-xs leading-5 text-slate-400" }, item.prompt)
      ))
    ) : h("p", { className: "text-sm text-slate-400" }, "Generated lessons will appear here.")
  );
}

function TeacherNotesEditor({ value, onChange, disabled }) {
  return h("section", { className: "grid gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-4" },
    h("h3", { className: "text-sm font-semibold text-white" }, "Teacher Notes"),
    h("textarea", {
      value,
      onChange: (event) => onChange(event.target.value),
      disabled,
      "aria-label": "Teacher notes",
      className: "min-h-28 resize-y rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-wait disabled:opacity-60"
    })
  );
}

function SimulationPanel({ pipeline }) {
  const { classroomMode } = useContext(LayoutContext);
  return h("section", { className: classroomMode ? "grid min-w-0 content-start gap-4" : "grid min-w-0 content-start gap-3" },
    h(SandboxFrame, { pipeline }),
    classroomMode && pipeline.spec ? h(DiagramExplanation, { spec: pipeline.spec, values: pipeline.controlValues }) : null,
    !classroomMode && pipeline.spec ? h(TeacherLessonPlanTile, { spec: pipeline.spec }) : null
  );
}

function TeacherLessonPlanTile({ spec }) {
  const educational = spec.educational;
  const [teacherNotes, setTeacherNotes] = useState(spec.meta.teacherNotes || "");
  useEffect(() => {
    setTeacherNotes(spec.meta.teacherNotes || "");
  }, [spec]);
  return h("section", { className: "lc-teacher-surface grid gap-3 rounded-xl border border-white/10 bg-slate-800/80 p-4", "aria-labelledby": "teacherLessonPlanTitle" },
    h("div", { className: "flex flex-wrap items-start justify-between gap-3" },
      h("div", null,
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Teacher workspace"),
        h("h3", { id: "teacherLessonPlanTitle", className: "mt-1 text-base font-semibold text-white" }, "Lesson plan"),
        h("p", { className: "mt-1 text-xs leading-5 text-slate-400" }, "A compact teaching sequence for the active simulation.")
      ),
      h("span", { className: "rounded-full bg-teal-300 px-2 py-1 text-[11px] font-medium text-slate-950" }, "Teacher only")
    ),
    h("div", { className: "grid gap-3 md:grid-cols-3" },
      h("div", { className: "min-w-0" },
        h("h4", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Teaching intent"),
        h("p", { className: "mt-1 text-sm leading-5 text-slate-300" }, educational.teachingNotes)
      ),
      h("div", { className: "min-w-0" },
        h("h4", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Suggested activity"),
        h("p", { className: "mt-1 text-sm leading-5 text-slate-300" }, educational.guidedExperiments[0])
      ),
      h("div", { className: "min-w-0" },
        h("h4", { className: "text-xs font-semibold uppercase tracking-wide text-teal-200" }, "Check understanding"),
        h("p", { className: "mt-1 text-sm leading-5 text-slate-300" }, educational.discussionQuestions[0])
      )
    ),
    h(WorkspaceAccordion, { title: "Supporting materials", subtitle: "Teacher notes and additional prompts" },
      h(TeacherNotesEditor, { value: teacherNotes, onChange: setTeacherNotes, disabled: false }),
      h(EducationalContentPanels, { educational })
    )
  );
}

function ControlsSidebar({ pipeline }) {
  const { classroomMode } = useContext(LayoutContext);
  return h("aside", { className: "grid min-w-0 content-start gap-4" },
    h(ErrorBoundary, null, pipeline.spec ? h(DynamicControls, { spec: pipeline.spec, values: pipeline.controlValues, setValues: pipeline.setControlValues }) : h(ControlSkeleton, null)),
    pipeline.spec ? h(LiveControlObservation, { spec: pipeline.spec, values: pipeline.controlValues }) : null,
    pipeline.spec ? classroomMode ? h(ClassroomReferencePanels, { spec: pipeline.spec }) : h(DiagramExplanation, { spec: pipeline.spec, values: pipeline.controlValues }) : h(ControlSkeleton, null)
  );
}

function ClassroomReferencePanels({ spec }) {
  const applications = spec.educational?.realWorldApplications?.slice(0, 2) || [];
  return h("section", { className: "grid min-w-0 gap-4 rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-4", "aria-label": "Model reference" },
    h("section", { className: "grid gap-2", "aria-labelledby": "classroomRelationshipsTitle" },
      h("p", { id: "classroomRelationshipsTitle", className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Model relationships"),
      spec.formulas.map((formula) => h("div", { key: formula.id, className: "rounded-md border border-teal-300/15 bg-slate-950/35 px-3 py-2" },
        h("code", { className: "block break-words font-mono text-sm font-semibold text-teal-100" }, formula.expression),
        h("p", { className: "mt-1 text-xs leading-5 text-slate-300" }, formula.description)
      ))
    ),
    applications.length ? h("section", { className: "grid gap-2 border-t border-teal-300/20 pt-4", "aria-labelledby": "classroomApplicationsTitle" },
      h("p", { id: "classroomApplicationsTitle", className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Where this is used"),
      h("ul", { className: "grid gap-2" },
        applications.map((application) => h("li", { key: application, className: "rounded-md border border-teal-300/15 bg-slate-950/35 px-3 py-2 text-sm leading-5 text-slate-200" }, application))
      )
    ) : null
  );
}

function SandboxFrame({ pipeline }) {
  const darkCanvas = true;
  return h("section", { id: "logiccanvas-simulation", className: "grid min-w-0 min-h-[440px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-2xl shadow-black/20 sm:min-h-[520px] lg:min-h-[calc(100dvh-12.5rem)]" },
    h("div", { className: "flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3" },
      h("h2", { className: "text-lg font-semibold text-white" }, pipeline.spec?.meta.title || "Awaiting lesson"),
      pipeline.spec ? h("span", { className: "rounded-full bg-teal-300 px-2.5 py-1 text-[11px] font-medium text-slate-950" }, pipeline.spec.meta.domain) : null
    ),
    h("div", { className: darkCanvas ? "relative min-h-0 bg-slate-950" : "relative min-h-0 bg-slate-50" },
      pipeline.loading ? h(PreviewSkeleton, null) : null,
      !pipeline.loading && !pipeline.spec ? h(EmptyState, { unavailable: Boolean(pipeline.error) }) : null,
      h("iframe", {
        key: pipeline.iframeVersion,
        title: "Generated LogicCanvas lesson",
        sandbox: "allow-scripts",
        srcDoc: pipeline.shieldedHtml,
        onLoad: pipeline.markCanvasPaint,
        className: darkCanvas ? "h-full min-h-[360px] w-full border-0 bg-slate-950 sm:min-h-[430px] lg:min-h-[520px]" : "h-full min-h-[360px] w-full border-0 bg-slate-50 sm:min-h-[430px] lg:min-h-[520px]",
        loading: "eager"
      })
    )
  );
}

function EmptyState({ unavailable = false }) {
  return h("div", { className: "absolute inset-3 z-[1] grid place-items-center rounded-lg border border-dashed border-white/15 bg-slate-900/80 p-6 text-center", role: "status" },
    h("div", { className: "grid max-w-sm justify-items-center gap-3" },
      h("div", { className: "grid h-12 w-12 place-items-center rounded-2xl border border-teal-300/20 bg-teal-300/10 text-xl text-teal-200", "aria-hidden": "true" }, "∿"),
      h("h3", { className: "text-base font-semibold text-white" }, unavailable ? "No ready visualization found" : "Your visual lab is ready"),
      h("p", { className: "text-sm leading-6 text-slate-400" }, unavailable ? "Choose a ready lesson from the search suggestions or try a different Physics, Mathematics, or Engineering concept." : "Describe a physics, mathematics, or engineering idea above to bring the model to life.")
    )
  );
}

function DynamicControls({ spec, values, setValues }) {
  const { classroomMode } = useContext(LayoutContext);
  return h("section", { id: "interactive-controls", className: classroomMode ? "lc-classroom-controls grid content-start gap-4 rounded-xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20" : "grid content-start gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20" },
    h("div", { className: "flex items-center justify-between gap-3" },
      h("div", null,
        h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Dynamic Controls"),
        h("h3", { className: classroomMode ? "mt-1 text-lg font-semibold text-white" : "mt-1 text-base font-semibold text-white" }, "Interactive Adjustments")
      ),
      h("span", { className: "rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-slate-300" }, spec.meta.domain)
    ),
    spec.variables.map((variable) => {
      const value = values[variable.id] ?? variable.default;
      const binary = variable.min === 0 && variable.max === 1 && variable.step === 1;
      return h("label", { key: variable.id, className: binary ? classroomMode ? "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/70 p-4 text-base font-semibold text-slate-100" : "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm font-semibold text-slate-200" : classroomMode ? "grid gap-3 text-base font-semibold text-slate-100" : "grid gap-2 text-sm font-semibold text-slate-200" },
        binary ? h("span", { className: "grid gap-1" },
          h("span", null, variable.label),
          h("output", { className: "font-mono text-teal-300" }, `${value} ${variable.unit}`)
        ) : h("span", { className: "flex items-center justify-between gap-3" },
          h("span", null, variable.label),
          h("input", {
            type: "number",
            min: variable.min,
            max: variable.max,
            step: variable.step,
            value,
            onChange: (event) => setValues((current) => ({ ...current, [variable.id]: Number(event.target.value) })),
            className: classroomMode ? "h-10 w-28 rounded-md border border-white/15 bg-slate-950 px-2 text-right font-mono text-sm font-semibold text-teal-200 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20" : "h-8 w-24 rounded-md border border-white/15 bg-slate-950 px-2 text-right font-mono text-xs font-semibold text-teal-200 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20",
            "aria-label": `${variable.label} numeric value`
          })
        ),
        binary ? h("input", {
          type: "checkbox",
          checked: Boolean(value),
          onChange: (event) => setValues((current) => ({ ...current, [variable.id]: event.target.checked ? 1 : 0 })),
          className: classroomMode ? "h-6 w-6 accent-teal-300" : "h-5 w-5 accent-teal-300"
        }) : h("input", {
          type: "range",
          min: variable.min,
          max: variable.max,
          step: variable.step,
          value,
          onChange: (event) => setValues((current) => ({ ...current, [variable.id]: Number(event.target.value) })),
          className: classroomMode ? "lc-classroom-range w-full accent-teal-300" : "w-full accent-teal-300"
        })
      );
    })
  );
}

function LiveControlObservation({ spec, values }) {
  const observation = getLiveControlObservation(spec, values);
  return h("section", { className: "grid min-w-0 gap-3 rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-4", "aria-labelledby": "liveObservationTitle", "aria-live": "polite" },
    h("div", null,
      h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Live observation"),
      h("h3", { id: "liveObservationTitle", className: "mt-1 text-base font-semibold text-white" }, observation.title)
    ),
    h("p", { className: "text-sm leading-6 text-slate-200" }, observation.summary),
    h("p", { className: "rounded-md border-l-2 border-teal-300/70 bg-slate-950/35 px-3 py-2 text-sm leading-5 text-teal-50" }, observation.evidence)
  );
}

function getLiveControlObservation(spec, values) {
  const changed = spec.variables.filter((variable) => values[variable.id] !== undefined && Number(values[variable.id]) !== Number(variable.default));
  if (!changed.length) {
    return {
      title: "Start with the baseline",
      summary: "The model is using its starting values. Move one control and watch for one clear change before trying another.",
      evidence: `Begin with ${spec.variables[0].label.toLowerCase()}, then describe what changes in the diagram.`
    };
  }
  const valueText = (variable) => `${variable.label} is ${Number(values[variable.id]).toFixed(Number.isInteger(variable.step) ? 0 : 1)} ${variable.unit}`.trim();
  const changedText = changed.slice(0, 2).map(valueText).join(" and ");
  const rendererObservations = {
    projectile: ["The flight path is changing", `${changedText}. The curve responds by changing its height, distance, or steepness as the launch conditions change.`, "Look at the highest point and where the path returns to the ground. Use those two points as evidence."],
    optics: ["The light ray is bending differently", `${changedText}. The outgoing light ray changes direction because the light is crossing into a different material.`, "Compare the incoming ray with the outgoing ray and notice whether it moves closer to or farther from the normal line."],
    vector: ["The field pattern is changing", `${changedText}. The arrows update their direction or length to show the new field behaviour.`, "Choose one arrow near the centre and one near the edge. Compare their direction and size before and after the change."],
    circuit: ["The electrical flow is changing", `${changedText}. The circuit model updates current and voltage behaviour to match the new electrical conditions.`, "Use the displayed current or voltage value to explain how the change affects the circuit."],
    newton: ["The motion response is changing", `${changedText}. The balance between force, friction, and mass changes the object's acceleration.`, "Compare the net-force arrow and the motion path. A larger net force produces a stronger acceleration effect."],
    pendulum: ["The swing pattern is changing", `${changedText}. The pendulum's path and timing update with the new conditions.`, "Watch how far the bob travels and how quickly it returns through the centre point."],
    pythagoras: ["The triangle relationship is changing", `${changedText}. The diagram recalculates the side lengths so the right-triangle relationship remains visible.`, "Compare the two shorter sides with the hypotenuse and use the displayed equation to justify the result."]
  };
  const selected = rendererObservations[spec.renderer.type] || ["The mathematical pattern is changing", `${changedText}. The plotted pattern updates to show how the current values affect the relationship.`, "Compare one visible feature of the diagram, such as its height, position, direction, or slope, before and after the change."];
  return { title: selected[0], summary: selected[1], evidence: selected[2] };
}

function EngineerConsole({ spec, rawHtml, status }) {
  const rawSpec = spec ? JSON.stringify(spec, null, 2) : "";
  return h("section", { className: "grid content-start gap-4 rounded-xl border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20 xl:col-span-3 2xl:col-span-1" },
    h("div", null,
      h("p", { className: "text-xs font-semibold uppercase tracking-wide text-teal-300" }, "Engineer Console"),
      h("h3", { className: "mt-1 text-base font-semibold text-white" }, "Intermediate outputs"),
      h("p", { className: "mt-1 text-xs text-slate-400" }, status)
    ),
    h("section", { className: "grid gap-2" },
      h("h4", { className: "text-sm font-semibold text-slate-200" }, "Raw JSON Spec"),
      h("pre", { className: "max-h-80 overflow-auto rounded-lg border border-white/10 bg-slate-950 p-3 text-xs leading-5 text-slate-300" }, rawSpec)
    ),
    h("section", { className: "grid gap-2" },
      h("h4", { className: "text-sm font-semibold text-slate-200" }, "Compiled HTML"),
      h("pre", { className: "max-h-80 overflow-auto rounded-lg border border-white/10 bg-slate-950 p-3 text-xs leading-5 text-slate-300" }, rawHtml)
    )
  );
}

function getLessonTabContent(spec, activeTab) {
  if (!spec) {
    return ["Choose a concept to prepare lesson notes, outcomes, and guided exploration prompts."];
  }
  if (activeTab === "outcomes") {
    return [
      `Students identify how ${spec.variables.map((variable) => variable.label.toLowerCase()).join(", ")} influence the visualization.`,
      `Students connect visual changes to ${spec.formulas[0]?.description.toLowerCase() || "the underlying model"}.`,
      "Students explain cause-and-effect relationships using evidence from the interactive model."
    ];
  }
  if (activeTab === "experiments") {
    return [
      "Start with the default values and ask students to predict the first visible change.",
      "Adjust one variable at a time while students record observations in a two-column table.",
      "Challenge students to find a setting that maximizes or minimizes the main measured result."
    ];
  }
  return [
    spec.meta.teacherNotes,
    `The model is constrained by: ${spec.boundaries.join(" ")}`,
    "Use the sliders during discussion to make abstract relationships visible before students work independently."
  ];
}

function createEducationalContent(spec) {
  const labels = spec.variables.map((variable) => variable.label.toLowerCase());
  const primary = labels[0] || "the first control";
  const secondary = labels[1] || "the next control";
  const details = {
    projectile: {
      keyConcepts: ["A projectile has horizontal and vertical motion at the same time.", "Gravity changes vertical velocity throughout the flight.", "Range and maximum height describe different parts of the path."],
      misconceptions: ["A projectile keeps moving upward because it still has forward speed.", "A steeper launch always travels farther."],
      discussion: ["Why does the object land even though it keeps moving forward?", "Which launch angle gives the best balance of height and distance?"],
      assessment: ["Predict the path when gravity increases but launch speed stays fixed.", "Use the diagram to explain why two different angles can have the same range."],
      experiments: ["Hold launch speed constant and compare low, medium, and steep launch angles.", "Increase gravity one step at a time and record the change in peak height and range."],
      applications: ["Sports coaches use projectile motion to analyse shots and throws.", "Engineers use it to plan safe trajectories for launched objects."]
    },
    wave: {
      keyConcepts: ["Waves add together through superposition.", "Amplitude measures displacement from the middle line.", "Phase controls whether waves reinforce or cancel."],
      misconceptions: ["Two waves permanently merge after meeting.", "A larger frequency always means a taller wave."],
      discussion: ["Where on the graph do the waves reinforce each other?", "How does phase determine cancellation?"],
      assessment: ["Describe the result of changing only the phase offset.", "Explain why frequency changes spacing rather than height."],
      experiments: ["Keep amplitude fixed and sweep the phase through one full cycle.", "Compare two frequency settings while keeping phase unchanged."],
      applications: ["Noise-cancelling headphones use destructive interference.", "Musical instruments rely on interference patterns to create tone."]
    },
    logic: {
      keyConcepts: ["Logic gates transform binary inputs into a binary output.", "Each gate follows a different rule.", "Truth tables record every possible input combination."],
      misconceptions: ["All gates produce the same output for the same inputs.", "A 0 value means that a wire is missing."],
      discussion: ["Which input combinations turn this gate on?", "How is XOR different from OR?"],
      assessment: ["Complete a truth table for the selected gate.", "Predict the output before changing an input, then check the model."],
      experiments: ["Test all four input pairs with the current gate.", "Keep the inputs fixed and compare outputs across every gate option."],
      applications: ["Computers use logic gates to make decisions from binary signals.", "Digital alarm systems combine sensor signals through logic gates."]
    },
    beam: {
      keyConcepts: ["A load causes a beam to bend.", "Longer spans bend more under the same load.", "Stiffness resists deflection."],
      misconceptions: ["A thicker or stiffer beam bends more because it contains more material.", "A beam bends equally at every point."],
      discussion: ["Why is the centre of the beam the most useful point to inspect?", "Which change is more effective: reducing load or increasing stiffness?"],
      assessment: ["Predict the effect of doubling the span.", "Explain why stiffness changes the curve without changing the load."],
      experiments: ["Keep stiffness fixed and increase the central load in equal steps.", "Compare a short and long span using the same load and stiffness."],
      applications: ["Bridge designers calculate deflection before selecting structural members.", "Shelf and floor systems are designed to limit bending under load."]
    },
    circuit: {
      keyConcepts: ["Voltage provides the electrical push that drives current.", "Resistance limits the amount of current in a circuit.", "In a parallel circuit, each branch has the same voltage across it."],
      misconceptions: ["Current is used up as it travels around a circuit.", "Adding a parallel branch always reduces the voltage of the source."],
      discussion: ["What happens to current when resistance increases while voltage stays fixed?", "Why can two parallel branches have different currents?"],
      assessment: ["Predict the branch current after increasing the source voltage.", "Use Ohm's law to explain what changes when resistance is doubled."],
      experiments: ["Hold voltage fixed and increase resistance in equal steps.", "Compare two resistance values and record the resulting current."],
      applications: ["Electricians use circuit relationships to choose safe components.", "Electronic devices use parallel paths to power separate components."]
    },
    optics: {
      keyConcepts: ["Light changes direction when it crosses between materials with different refractive indices.", "The angle is measured from the normal line, not from the surface boundary.", "When light enters a medium with a larger refractive index, the ray bends closer to the normal."],
      misconceptions: ["Light bends because the boundary physically pushes it sideways.", "The incident and refracted angles are measured from the material boundary."],
      discussion: ["Why does the refracted ray move closer to the normal in this model?", "What stays the same when only the second refractive index changes?"],
      assessment: ["Predict the refracted angle when the second refractive index increases.", "Use Snell's law to explain why the ray bends at the boundary."],
      experiments: ["Keep both refractive indices fixed and change only the incident angle.", "Hold the incident angle fixed, then compare low and high second refractive indices."],
      applications: ["Lens designers use refraction to focus light in cameras and glasses.", "Fiber-optic systems guide light through a higher-index core surrounded by lower-index cladding, enabling total internal reflection."]
    },
    vector: {
      keyConcepts: ["A vector shows both a direction and a magnitude.", "Arrow length represents relative strength in the field.", "Changing rotation changes direction without necessarily changing strength."],
      misconceptions: ["All arrows in a vector field must point in the same direction.", "A longer arrow represents a larger physical object."],
      discussion: ["Where are the strongest arrows in the field?", "How does rotation change the direction pattern?"],
      assessment: ["Describe what changes when vector scale increases.", "Use two arrows to explain how direction and magnitude differ."],
      experiments: ["Increase field strength while keeping rotation fixed.", "Rotate the field in small steps and compare one centre arrow with one edge arrow."],
      applications: ["Meteorologists use vector fields to show wind direction and speed.", "Engineers use vector fields to model forces and fluid flow."]
    },
    newton: {
      keyConcepts: ["Net force causes acceleration according to F = ma.", "Greater mass needs more force to achieve the same acceleration.", "Friction opposes motion and reduces the net force."],
      misconceptions: ["A moving object needs a constant force to keep moving at constant speed.", "A larger force always produces the same acceleration regardless of mass."],
      discussion: ["How does friction change the net-force arrow?", "Why does the same applied force affect a lighter object more?"],
      assessment: ["Predict acceleration when force increases and mass stays fixed.", "Explain how increasing mass changes acceleration using F = ma."],
      experiments: ["Hold mass and friction fixed, then increase applied force.", "Compare two masses with the same net force and describe the acceleration change."],
      applications: ["Vehicle engineers use force and mass relationships when designing braking systems.", "Sports scientists use Newton's laws to analyse pushes, throws, and collisions."]
    },
    pendulum: {
      keyConcepts: ["A pendulum swings because gravity pulls it back toward its lowest point.", "For small angles, pendulum period depends mainly on length and gravity.", "A longer pendulum takes more time to complete one swing."],
      misconceptions: ["A heavier pendulum bob always swings faster.", "A larger starting angle always changes the period by the same amount."],
      discussion: ["What happens to the swing time when length increases?", "Which control changes the path without changing gravity?"],
      assessment: ["Predict the period after increasing pendulum length.", "Explain why mass is not needed in the small-angle period equation."],
      experiments: ["Keep gravity fixed and compare short and long pendulum lengths.", "Change the starting angle and observe how the visible path changes."],
      applications: ["Pendulums help explain the timing mechanisms in traditional clocks.", "Engineers study pendulum motion when designing sensors and vibration systems."]
    },
    pythagoras: {
      keyConcepts: ["In a right triangle, the two shorter sides determine the hypotenuse.", "The Pythagorean theorem applies only to right-angled triangles.", "Changing either shorter side changes the hypotenuse length."],
      misconceptions: ["The theorem works for every triangle.", "The hypotenuse is always the horizontal side of a triangle."],
      discussion: ["How can you identify the hypotenuse in the diagram?", "What happens to the hypotenuse when one shorter side increases?"],
      assessment: ["Calculate the hypotenuse after changing one side length.", "Use a squared-length relationship to verify the displayed triangle."],
      experiments: ["Change one side at a time and compare the hypotenuse value.", "Find two side lengths that create a whole-number hypotenuse."],
      applications: ["Builders use right-triangle relationships to check square corners.", "Navigation and mapping systems use the theorem to calculate straight-line distance."]
    },
    math: {
      keyConcepts: ["A graph maps each input to an output.", "Amplitude changes vertical scale.", "Period and phase change horizontal placement."],
      misconceptions: ["Changing amplitude moves the graph sideways.", "A phase shift changes the height of every point by the same amount."],
      discussion: ["Which control changes the distance between repeating peaks?", "What remains unchanged when the graph shifts sideways?"],
      assessment: ["Describe the graph after doubling the amplitude.", "Identify how to create a graph with the same shape but a different horizontal position."],
      experiments: ["Change one parameter at a time and sketch the new graph.", "Set two controls, predict the marker position, then verify it."],
      applications: ["Engineers model repeated signals with trigonometric functions.", "Graphs help scientists compare changing quantities over time."]
    }
  };
  const selected = details[spec.renderer.type === "trig" ? "math" : spec.renderer.type] || details.math;
  return {
    learningObjectives: [
      `Explain how ${primary} changes the visible model.`,
      `Use the diagram and equations to describe the effect of ${secondary}.`,
      "Make and test a prediction using evidence from the simulation."
    ],
    keyConcepts: selected.keyConcepts,
    teachingNotes: spec.meta.teacherNotes,
    misconceptions: selected.misconceptions,
    discussionQuestions: selected.discussion,
    assessmentQuestions: selected.assessment,
    guidedExperiments: selected.experiments,
    realWorldApplications: selected.applications
  };
}

function assertEducationalAlignment(spec) {
  const content = [
    ...spec.educational.keyConcepts,
    ...spec.educational.misconceptions,
    ...spec.educational.discussionQuestions,
    ...spec.educational.assessmentQuestions,
    ...spec.educational.guidedExperiments,
    ...spec.educational.realWorldApplications
  ].join(" ").toLowerCase();
  const prohibited = {
    optics: /\b(amplitude|phase shift|repeating peaks)\b/,
    projectile: /\b(refractive index|normal line|refracted ray)\b/,
    circuit: /\b(refracted ray|hypotenuse|phase shift)\b/,
    vector: /\b(refracted ray|hypotenuse|launch angle)\b/,
    newton: /\b(refracted ray|hypotenuse|phase shift)\b/,
    pendulum: /\b(refracted ray|hypotenuse|parallel branch)\b/,
    pythagoras: /\b(refracted ray|parallel branch|phase shift)\b/
  };
  const required = {
    projectile: /\b(projectile|gravity|launch)\b/,
    wave: /\b(wave|amplitude|phase)\b/,
    logic: /\b(logic gate|binary|truth table)\b/,
    beam: /\b(beam|deflection|stiffness)\b/,
    circuit: /\b(circuit|voltage|current|resistance)\b/,
    optics: /\b(light|refraction|refractive|normal)\b/,
    vector: /\b(vector|arrow|field)\b/,
    newton: /\b(force|acceleration|mass|friction)\b/,
    pendulum: /\b(pendulum|swing|period)\b/,
    pythagoras: /\b(right triangle|hypotenuse|pythagorean)\b/,
    math: /\b(graph|amplitude|period|phase)\b/,
    trig: /\b(graph|amplitude|period|phase)\b/
  };
  if (prohibited[spec.renderer.type]?.test(content) || (required[spec.renderer.type] && !required[spec.renderer.type].test(content))) {
    throw new Error("Educational content did not match the selected visualization. Please try the concept again.");
  }
}

function createEducationalMetadata(spec) {
  const renderer = spec.renderer.type;
  const labels = spec.variables.map((variable) => variable.label.toLowerCase());
  const profiles = {
    projectile: { grade: "Grades 7-10", prerequisites: "Basic algebra and graph reading", difficulty: "Guided", time: "35-45 min" },
    wave: { grade: "Grades 8-11", prerequisites: "Units, graphs, and simple ratios", difficulty: "Guided", time: "35-45 min" },
    logic: { grade: "Grades 6-9", prerequisites: "Binary numbers and if/then rules", difficulty: "Introductory", time: "25-35 min" },
    circuit: { grade: "Grades 8-11", prerequisites: "Voltage, current, and resistance", difficulty: "Intermediate", time: "40-50 min" },
    optics: { grade: "Grades 8-11", prerequisites: "Angles and basic ray diagrams", difficulty: "Intermediate", time: "35-45 min" },
    vector: { grade: "Grades 8-12", prerequisites: "Coordinates and direction", difficulty: "Intermediate", time: "35-45 min" },
    newton: { grade: "Grades 8-12", prerequisites: "Units, forces, and basic algebra", difficulty: "Intermediate", time: "40-50 min" },
    beam: { grade: "Grades 9-12", prerequisites: "Forces, measurement, and proportional reasoning", difficulty: "Advanced", time: "45-60 min" },
    trig: { grade: "Grades 9-12", prerequisites: "Angles and function notation", difficulty: "Intermediate", time: "35-45 min" }
  };
  const profile = profiles[renderer] || profiles.trig;
  const primary = labels[0] || "the main control";
  const secondary = labels[1] || "the next control";
  const educational = spec.educational || createEducationalContent(spec);
  return {
    studentsWillLearn: [
      `How ${primary} changes the visible model.`,
      `How to connect ${secondary} to the pattern shown in the diagram.`,
      "How to make, test, and explain a prediction using evidence."
    ],
    learningOutcomes: educational.learningObjectives.slice(0, 4),
    estimatedGradeLevel: profile.grade,
    prerequisites: profile.prerequisites,
    difficulty: profile.difficulty,
    estimatedTeachingTime: profile.time
  };
}

function getDiagramExplanation(spec, values) {
  const renderer = spec.renderer.type;
  const value = (id) => values?.[id] ?? spec.variables.find((variable) => variable.id === id)?.default;
  if (renderer === "projectile") {
    const speed = value("speed");
    const angle = value("angle");
    const gravity = value("gravity");
    return {
      depicts: "The curved teal line is the path of a launched object. The orange dot moves along that path, the blue arrow shows its starting velocity, and the labels report the maximum height and the horizontal distance travelled before it lands.",
      behavior: `At the current settings, the object starts at ${speed} m/s at ${angle} degrees while gravity is ${gravity} m/s^2. More speed makes the path larger; changing the angle reshapes the arc; more gravity pulls the path down sooner.`,
      tryIt: "Keep the speed fixed, then compare a low angle, 45 degrees, and a steep angle. Watch how the same launch speed can produce different height and distance results."
    };
  }
  if (renderer === "wave") {
    const amplitude = value("amplitude");
    const frequency = value("frequency");
    const phase = value("phase");
    return {
      depicts: "The teal curve shows the combined displacement of two waves at every position. Peaks above the middle line represent upward displacement; troughs below it represent downward displacement.",
      behavior: `Amplitude is currently ${amplitude} m, frequency is ${frequency} Hz, and the phase offset is ${phase} rad. Amplitude changes the curve height, frequency changes how tightly the waves repeat, and phase determines where the two waves line up or cancel.`,
      tryIt: "Set the phase close to zero, then move it toward half a cycle. Look for the transition from taller combined peaks to cancellation."
    };
  }
  if (renderer === "logic") {
    const gateNames = ["AND", "OR", "XOR", "NOT"];
    const inputA = value("input_a");
    const inputB = value("input_b");
    const gate = gateNames[Math.round(value("gate"))] || "XOR";
    return {
      depicts: "The central box is the selected logic gate. The two left-hand wires carry Input A and Input B into that gate, while the wire on the right shows the single binary result. A value of 1 means on or true; 0 means off or false.",
      behavior: `The selected gate is ${gate}, with Input A at ${inputA} and Input B at ${inputB}. Changing an input tests a new rule combination immediately, while the gate selector changes the rule used to decide the output.`,
      tryIt: "Choose XOR, then test 0 and 0, 0 and 1, 1 and 0, and 1 and 1. Identify the two input combinations that turn the output on."
    };
  }
  if (renderer === "beam") {
    const load = value("load");
    const span = value("span");
    const stiffness = value("stiffness");
    return {
      depicts: "The straight grey line is the unloaded beam. The teal curve is the same beam bending under a central load. The greatest vertical gap between them is the beam's maximum deflection.",
      behavior: `The current model applies ${load} kN across a ${span} m span with stiffness ${stiffness} EI. More load or a longer span increases the bend, while a stiffer beam reduces it.`,
      tryIt: "Increase the span while keeping the load unchanged. Compare the centre of the curve before and after to see why longer structures need more stiffness."
    };
  }
  if (renderer === "circuit") {
    const voltage = value("voltage");
    const resistance = value("resistance");
    return {
      depicts: "The lines form parallel branches connected to a voltage source. Each branch shares the same source voltage, while the displayed current reports the electrical flow through the modeled resistance.",
      behavior: `Voltage is currently ${voltage} V and resistance is ${resistance} ohms. Raising voltage increases current; raising resistance reduces current when the source stays the same.`,
      tryIt: "Hold resistance steady and increase voltage. Then restore the voltage and increase resistance. Compare the current reading after each change."
    };
  }
  if (renderer === "optics") {
    const angle = value("angle");
    const firstIndex = value("index_one");
    const secondIndex = value("index_two");
    return {
      depicts: "The cyan ray approaches the boundary between two materials. The teal ray shows its refracted direction after crossing that boundary; the vertical line is the normal used to measure both angles.",
      behavior: `The incident angle is ${angle} degrees, with the first refractive index at ${firstIndex} and the second at ${secondIndex}. Changing the angle rotates the incoming ray, while changing either refractive index changes how much the ray bends.`,
      tryIt: "Keep the incident angle fixed, then increase the second refractive index. Watch the refracted ray move closer to the normal."
    };
  }
  if (renderer === "vector") {
    const strength = value("strength");
    const rotation = value("rotation");
    const scale = value("scale");
    return {
      depicts: "Each neon cyan arrow represents the direction and relative size of the field at one grid location. Together, the arrows reveal a rotating pattern around the centre of the grid.",
      behavior: `Field strength is ${strength}, rotation is ${rotation} rad, and vector scale is ${scale}. Field strength changes the modeled magnitude, rotation turns every field direction, and vector scale changes the displayed arrow size without changing the field pattern.`,
      tryIt: "Keep field strength and vector scale fixed, then move rotation slowly from a negative to a positive value. Track how the entire arrow pattern turns together."
    };
  }
  if (renderer === "newton") {
    const mass = value("mass");
    const force = value("force");
    const friction = value("friction");
    const initialVelocity = value("initial_velocity");
    return {
      depicts: "The teal path tracks an object's changing position. The cyan arrow shows the direction and size of the resulting acceleration, which is determined by the net force acting on the object.",
      behavior: `Mass is ${mass} kg, applied force is ${force} N, friction is ${friction} N, and initial velocity is ${initialVelocity} m/s. A larger net force increases acceleration, while a larger mass reduces the acceleration produced by that same net force.`,
      tryIt: "Hold mass and friction fixed, then increase the applied force. Compare the acceleration arrow and the steepness of the path."
    };
  }
  const activeControls = spec.variables.map((variable) => `${variable.label} is ${value(variable.id)}${variable.unit ? ` ${variable.unit}` : ""}`).join(", ");
  return {
    depicts: "The teal line is the graph of the current function. The horizontal and vertical dark lines are the x- and y-axes, the pale grid makes values easier to estimate, and the orange dot marks the selected input value on the curve.",
    behavior: activeControls || "The active controls update the displayed function immediately.",
    tryIt: "Change one control at a time, then describe the precise part of the diagram that changed."
  };
}

function getChallengeCards(spec, values) {
  const formula = spec.formulas[0];
  const controls = spec.variables.slice(0, 3);
  return controls.map((variable, index) => {
    const baseline = Number(values[variable.id] ?? variable.default);
    const midpoint = variable.min + (variable.max - variable.min) / 2;
    const target = baseline <= midpoint ? variable.max : variable.min;
    const formattedBaseline = `${baseline}${variable.unit ? ` ${variable.unit}` : ""}`;
    const formattedTarget = `${Number(target.toFixed(4))}${variable.unit ? ` ${variable.unit}` : ""}`;
    const otherVariable = controls.find((item) => item.id !== variable.id);
    const otherLabel = otherVariable ? otherVariable.label.toLowerCase() : "the other controls";
    const prompts = [
      {
        shortTitle: `Predict ${variable.label}`,
        question: `Starting at ${formattedBaseline}, predict what visible feature will change when you move ${variable.label.toLowerCase()} toward ${formattedTarget}. Test your prediction in the simulation.`,
        teacherCue: `Ask students to name one observable feature before touching the control, then connect their evidence to ${formula.expression}.`,
        answer: `Changing ${variable.label.toLowerCase()} should change the part of the model described by ${formula.expression}. A strong answer names the direction of change and cites one visible feature.`
      },
      {
        shortTitle: `Isolate ${variable.label}`,
        question: `Keep ${otherLabel} fixed. Change only ${variable.label.toLowerCase()} from ${formattedBaseline} to ${formattedTarget}. What stays constant, and what changes in the model?`,
        teacherCue: `Students should make a before-and-after claim using the diagram, then explain why the change is consistent with ${formula.description.toLowerCase()}`,
        answer: `The other controls should stay fixed. The visible result should change because ${formula.description.toLowerCase()}`
      },
      {
        shortTitle: `Explain ${variable.label}`,
        question: `Choose two contrasting ${variable.label.toLowerCase()} values, including ${formattedBaseline}. Which setting best demonstrates the relationship in ${formula.expression}, and what visual evidence supports your choice?`,
        teacherCue: `Listen for a claim, a comparison, and a specific visual observation. Ask students to revise vague words such as “bigger” into a measurable description.`,
        answer: `Accept either setting when the explanation uses a comparison and evidence. The key relationship to surface is ${formula.expression}.`
      }
    ];
    return {
      id: `${spec.meta.title}-${variable.id}`,
      ...prompts[index % prompts.length]
    };
  });
}

function getLessonOverview(spec) {
  const metadata = spec.educationalMetadata || createEducationalMetadata(spec);
  const profiles = {
    projectile: { grade: "Grades 7-10", prerequisites: "Basic algebra and graph reading", difficulty: "Guided", time: "35-45 min" },
    wave: { grade: "Grades 8-11", prerequisites: "Units, graphs, and simple ratios", difficulty: "Guided", time: "35-45 min" },
    logic: { grade: "Grades 6-9", prerequisites: "Binary numbers and if/then rules", difficulty: "Introductory", time: "25-35 min" },
    circuit: { grade: "Grades 8-11", prerequisites: "Voltage, current, and resistance", difficulty: "Intermediate", time: "40-50 min" },
    optics: { grade: "Grades 8-11", prerequisites: "Angles and basic ray diagrams", difficulty: "Intermediate", time: "35-45 min" },
    vector: { grade: "Grades 8-12", prerequisites: "Coordinates and direction", difficulty: "Intermediate", time: "35-45 min" },
    newton: { grade: "Grades 8-12", prerequisites: "Units, forces, and basic algebra", difficulty: "Intermediate", time: "40-50 min" },
    beam: { grade: "Grades 9-12", prerequisites: "Forces, measurement, and proportional reasoning", difficulty: "Advanced", time: "45-60 min" },
    trig: { grade: "Grades 9-12", prerequisites: "Angles and function notation", difficulty: "Intermediate", time: "35-45 min" }
  };
  const profile = profiles[spec.renderer.type] || profiles.trig;
  return {
    studentsWillLearn: metadata.studentsWillLearn,
    learningOutcomes: metadata.learningOutcomes,
    details: [
      { label: "Estimated grade level", value: metadata.estimatedGradeLevel || profile.grade },
      { label: "Prerequisites", value: metadata.prerequisites || profile.prerequisites },
      { label: "Difficulty", value: metadata.difficulty || profile.difficulty },
      { label: "Estimated teaching time", value: metadata.estimatedTeachingTime || profile.time }
    ]
  };
}

function ControlSkeleton() {
  return h("div", { className: "lc-contained grid gap-4 rounded-xl border border-white/10 bg-slate-950/70 p-4", role: "status", "aria-label": "Loading interactive controls", "aria-busy": "true" },
    h("div", { className: "lc-skeleton h-4 w-40 rounded" }),
    [0, 1, 2].map((item) => h("div", { key: item, className: "grid gap-2" },
      h("div", { className: "lc-skeleton h-4 w-32 rounded" }),
      h("div", { className: "lc-skeleton h-2 w-full rounded" })
    ))
  );
}

function PreviewSkeleton() {
  return h("div", { className: "absolute inset-3 z-10 grid place-items-center rounded-lg bg-slate-950/85 backdrop-blur-sm", role: "status", "aria-live": "polite", "aria-label": "Loading simulation preview" },
    h("div", { className: "grid justify-items-center gap-3" },
      h("div", { className: "h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-teal-300" }),
      h("p", { className: "text-sm font-semibold text-slate-300" }, "Building lesson"),
      h("div", { className: "flex gap-1.5", "aria-hidden": "true" },
        [0, 1, 2].map((item) => h("span", { key: item, className: "lc-skeleton h-1.5 w-8 rounded-full" }))
      )
    )
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gpt56ReasoningEngine(prompt, audience) {
  const text = prompt.toLowerCase();
  if (/(biology|chemistry|commerce|economics|language|essay|poem)/.test(text)) {
    throw new Error("Scope guard blocked this prompt. LogicCanvas supports physics, mathematics, and core engineering only.");
  }
  if (!/(projectile|motion|pendulum|newton|force|friction|snell|refraction|optics|wave|sound|frequency|amplitude|logic|gate|binary|boolean|circuit|ohm|voltage|resistance|vector|field|beam|bridge|load|engineering|stress|deflection|trig|sine|cosine|unit circle|function|quadratic|parabola|pythag|triangle|hypotenuse|distance|slope|linear|equation|calculus)/.test(text)) {
    throw new Error("We could not find enough verified STEM data to generate this visualization yet.");
  }
  if (/(wave|sound|frequency|amplitude)/.test(text)) {
    return {
      meta: {
        title: "Wave Interference Lab",
        domain: "physics",
        audience,
        teacherNotes: "Students compare amplitude, frequency, and phase while observing constructive and destructive interference."
      },
      variables: [
        { id: "amplitude", label: "Amplitude", unit: "m", min: 0.2, max: 3, step: 0.1, default: 1.2 },
        { id: "frequency", label: "Frequency", unit: "Hz", min: 0.5, max: 6, step: 0.1, default: 2 },
        { id: "phase", label: "Phase offset", unit: "rad", min: 0, max: 6.28, step: 0.01, default: 1.57 }
      ],
      formulas: [
        { id: "y1", expression: "y1 = A sin(2*pi*f*t)", description: "First sinusoidal wave as a function of time." },
        { id: "y2", expression: "y2 = A sin(2*pi*f*t + phase)", description: "Second wave shifted by phase offset." },
        { id: "sum", expression: "y = y1 + y2", description: "Superposed displacement at each sample point." }
      ],
      boundaries: ["Amplitude is clamped above zero.", "Frequency is bounded to classroom-visible motion.", "Phase stays within one full cycle."],
      renderer: { type: "wave", xLabel: "Position", yLabel: "Displacement" }
    };
  }
  if (/\b(logic|gate|binary|boolean|circuit|xor|nand|nor)\b/.test(text)) {
    return {
      meta: {
        title: "Logic Gate Simulator",
        domain: "engineering",
        audience,
        teacherNotes: "Students toggle binary inputs and compare deterministic outputs across common digital logic gates."
      },
      variables: [
        { id: "input_a", label: "Input A", unit: "", min: 0, max: 1, step: 1, default: 1 },
        { id: "input_b", label: "Input B", unit: "", min: 0, max: 1, step: 1, default: 0 },
        { id: "gate", label: "Gate selector", unit: "", min: 0, max: 3, step: 1, default: 2 }
      ],
      formulas: [
        { id: "and", expression: "AND = A && B", description: "Output is true only when both inputs are true." },
        { id: "or", expression: "OR = A || B", description: "Output is true when at least one input is true." },
        { id: "xor", expression: "XOR = A !== B", description: "Output is true when inputs are different." },
        { id: "not", expression: "NOT = !A", description: "Output is the inverse of input A." }
      ],
      boundaries: ["Inputs are binary values.", "Gate selector maps to AND, OR, XOR, or NOT.", "Output is deterministic for each input state."],
      renderer: { type: "logic", xLabel: "Inputs", yLabel: "Output" }
    };
  }
  if (/(trig|sine|cosine|unit circle|function)/.test(text)) {
    return {
      meta: {
        title: "Trigonometry Function Explorer",
        domain: "mathematics",
        audience,
        teacherNotes: "Students connect amplitude, period, and phase changes to transformations of a sine function."
      },
      variables: [
        { id: "amplitude", label: "Amplitude", unit: "", min: 0.2, max: 4, step: 0.1, default: 1.5 },
        { id: "period", label: "Period", unit: "pi", min: 0.5, max: 4, step: 0.1, default: 2 },
        { id: "phase", label: "Phase shift", unit: "rad", min: -3.14, max: 3.14, step: 0.01, default: 0 }
      ],
      formulas: [
        { id: "sine", expression: "y = A sin((2 / period)x + phase)", description: "Transformed sine function plotted over multiple cycles." }
      ],
      boundaries: ["Period cannot be zero.", "Amplitude is positive.", "Displayed x values stay inside a fixed graphing window."],
      renderer: { type: "trig", xLabel: "x", yLabel: "y" }
    };
  }
  if (/(beam|bridge|load|engineering|stress|deflection)/.test(text)) {
    return {
      meta: {
        title: "Beam Deflection Simulator",
        domain: "engineering",
        audience,
        teacherNotes: "Students observe how load, span, and stiffness influence the deflection curve of a simply supported beam."
      },
      variables: [
        { id: "load", label: "Central load", unit: "kN", min: 1, max: 30, step: 1, default: 12 },
        { id: "span", label: "Span length", unit: "m", min: 2, max: 12, step: 0.5, default: 6 },
        { id: "stiffness", label: "Stiffness", unit: "EI", min: 80, max: 600, step: 10, default: 260 }
      ],
      formulas: [
        { id: "deflection", expression: "deltaMax = P * L^3 / 48EI", description: "Maximum deflection for a simply supported beam with central load." }
      ],
      boundaries: ["Load and span are positive.", "Stiffness cannot be zero.", "Deflection is scaled for visualization."],
      renderer: { type: "beam", xLabel: "Span", yLabel: "Deflection" }
    };
  }
  return {
    meta: {
      title: "Projectile Motion Lab",
      domain: "physics",
      audience,
      teacherNotes: "Students investigate how launch speed, launch angle, and gravity determine flight time, peak height, and range."
    },
    variables: [
      { id: "speed", label: "Launch speed", unit: "m/s", min: 5, max: 40, step: 1, default: 22 },
      { id: "angle", label: "Launch angle", unit: "deg", min: 10, max: 80, step: 1, default: 45 },
      { id: "gravity", label: "Gravity", unit: "m/s^2", min: 1.6, max: 14, step: 0.1, default: 9.8 }
    ],
    formulas: [
      { id: "x", expression: "x(t) = v cos(theta)t", description: "Horizontal displacement over time." },
      { id: "y", expression: "y(t) = v sin(theta)t - 0.5gt^2", description: "Vertical displacement under constant gravity." },
      { id: "range", expression: "R = v^2 sin(2theta) / g", description: "Horizontal range when launch and landing heights match." }
    ],
    boundaries: ["Gravity is always positive.", "Angle is constrained below vertical.", "The path stops when height returns to ground level."],
    renderer: { type: "projectile", xLabel: "Distance", yLabel: "Height" }
  };
}

function compileWithCodex(spec) {
  const darkCanvas = true;
  const canvasTheme = darkCanvas
    ? { background: "#111827", surface: "#111827", grid: "#334155", axis: "#94a3b8", muted: "#cbd5e1", ink: "#e2e8f0", vector: "#00f2fe" }
    : { background: "#f8fafc", surface: "#ffffff", grid: "#dce5ef", axis: "#64748b", muted: "#475569", ink: "#172033", vector: "#2563eb" };
  let runtimeTemplate = TRUSTED_RUNTIME_TEMPLATE.replace(
    "const draw=()=>{grid();const type=data.renderer.type;if(type==='projectile')projectile();else if(type==='logic')logic();else if(type==='circuit')circuit();else if(type==='optics')optics();else if(type==='vector')vector();else if(type==='beam')beam();else graph();requestAnimationFrame(draw)}",
    "const newton=()=>{const mass=Math.max(.01,number('mass',5)),force=number('force',30),friction=Math.max(0,number('friction',5)),initial=number('initial_velocity',2),acceleration=(force-friction)/mass,ground=height-55,points=[];for(let index=0;index<=160;index+=1){const t=index/160*5;const displacement=initial*t+.5*acceleration*t*t;points.push({x:40+index/160*(width-60),y:ground-displacement*3})}line(points,'#0f766e',4);arrow(70,ground-30,Math.max(-80,Math.min(120,acceleration*8)),0,'#2563eb');context.fillStyle='#475569';context.fillText('Net force '+(force-friction).toFixed(1)+' N',48,28);context.fillText('Acceleration '+acceleration.toFixed(2)+' m/s²',width-190,28);context.fillText('F = ma',width/2-18,ground-12)};const draw=()=>{grid();const type=data.renderer.type;if(type==='projectile')projectile();else if(type==='logic')logic();else if(type==='circuit')circuit();else if(type==='optics')optics();else if(type==='vector')vector();else if(type==='newton')newton();else if(type==='beam')beam();else graph();requestAnimationFrame(draw)}"
  );
  runtimeTemplate = runtimeTemplate
    .replace(".runtime-header{display:flex", ".runtime-header{display:none")
    .replace(/const newton=\(\)=>\{[\s\S]*?\};const draw=/, "const newton=()=>{const mass=Math.max(.01,number('mass',5)),force=number('force',30),friction=Math.max(0,number('friction',5)),initial=number('initial_velocity',2),acceleration=(force-friction)/mass,ground=height*.74,cart={x:width*.28,y:ground-56,w:112,h:42};context.strokeStyle='#64748b';context.lineWidth=3;context.beginPath();context.moveTo(40,ground);context.lineTo(width-35,ground);context.stroke();context.fillStyle='#0f766e';context.fillRect(cart.x,cart.y,cart.w,cart.h);context.fillStyle='#172033';context.beginPath();context.arc(cart.x+22,ground+6,9,0,Math.PI*2);context.arc(cart.x+cart.w-22,ground+6,9,0,Math.PI*2);context.fill();arrow(cart.x+cart.w/2,cart.y-20,Math.min(140,force*2.2),0,'#d97706');arrow(cart.x+cart.w/2,cart.y+cart.h+22,-Math.min(120,friction*3),0,'#64748b');arrow(cart.x+cart.w/2,cart.y-46,Math.max(-95,Math.min(120,acceleration*16)),0,'#2563eb');context.fillStyle='#475569';context.font='600 13px system-ui';context.fillText('Applied force: '+force.toFixed(1)+' N',cart.x,cart.y-32);context.fillText('Friction: '+friction.toFixed(1)+' N',cart.x,ground+34);context.fillText('Fnet = '+(force-friction).toFixed(1)+' N',width-160,38);context.fillText('a = '+acceleration.toFixed(2)+' m/s^2',width-160,60);context.font='700 20px system-ui';context.fillText('F = ma',width*.48,ground-92);context.font='13px system-ui';context.fillText('Mass: '+mass.toFixed(1)+' kg  |  Initial velocity: '+initial.toFixed(1)+' m/s',40,38)};const draw=")
    .replace("const draw=()=>", "const pendulum=()=>{const length=Math.max(.1,number('length',1.2)),angle=number('angle',25)*Math.PI/180,gravity=Math.max(.1,number('gravity',9.8)),pivot={x:width/2,y:65},radius=Math.min(width*.32,height*.55,length*125),swing=Math.sin(Date.now()/700*Math.sqrt(gravity/length))*angle,bob={x:pivot.x+radius*Math.sin(swing),y:pivot.y+radius*Math.cos(swing)};context.strokeStyle='#64748b';context.lineWidth=3;context.beginPath();context.moveTo(pivot.x-42,pivot.y);context.lineTo(pivot.x+42,pivot.y);context.stroke();line([pivot,bob],'#0f766e',3);context.fillStyle='#d97706';context.beginPath();context.arc(bob.x,bob.y,14,0,Math.PI*2);context.fill();context.fillStyle='#475569';context.fillText('Length '+length.toFixed(1)+' m',40,34);context.fillText('Period '+(2*Math.PI*Math.sqrt(length/gravity)).toFixed(2)+' s',width-145,34)};const pythagoras=()=>{const a=Math.max(.1,number('side_a',6)),b=Math.max(.1,number('side_b',8)),scale=number('scale',1),unit=Math.min(width*.055,height*.07)*scale,origin={x:width*.22,y:height*.78},p1={x:origin.x+a*unit,y:origin.y},p2={x:origin.x+a*unit,y:origin.y-b*unit},c=Math.hypot(a,b);context.strokeStyle='#0f766e';context.lineWidth=4;context.beginPath();context.moveTo(origin.x,origin.y);context.lineTo(p1.x,p1.y);context.lineTo(p2.x,p2.y);context.closePath();context.stroke();context.strokeStyle='#64748b';context.lineWidth=2;context.strokeRect(p1.x-18,p1.y-18,18,18);context.fillStyle='#475569';context.fillText('a = '+a.toFixed(1),origin.x+a*unit/2-16,origin.y+24);context.fillText('b = '+b.toFixed(1),p1.x+12,origin.y-b*unit/2);context.fillStyle='#d97706';context.fillText('c = '+c.toFixed(2),origin.x+a*unit*.42,origin.y-b*unit*.52);context.fillStyle='#475569';context.fillText('a^2 + b^2 = c^2',40,34)};const draw=()=>")
    .replace("else if(type==='newton')newton();else if(type==='beam')beam();else graph()", "else if(type==='newton')newton();else if(type==='pendulum')pendulum();else if(type==='pythagoras')pythagoras();else if(type==='beam')beam();else graph()")
    .replace("context.clearRect(0,0,width,height);", "context.clearRect(0,0,width,height);context.font='18px system-ui';")
    .replace("border:1px solid var(--grid);", "border:0;")
    .replace("width:100%;height:100%;min-height:clamp(300px,48vh,620px)", "width:100%;min-height:0")
    .replace("min-height:clamp(300px,48vh,620px)", "min-height:0")
    .replace("canvas{min-height:320px}", "canvas{min-height:0}")
    .replace("vx=(-dy/length*Math.cos(rotation)-dy/length*Math.sin(rotation))*18*strength*scale", "vx=(-dy/length*Math.cos(rotation)-dx/length*Math.sin(rotation))*18*strength*scale")
    .replace("const data=window.simulationData;const canvas", "const data=window.simulationData;if(data.renderer.type==='vector'){const legend=document.querySelector('.legend');legend.hidden=true;legend.setAttribute('aria-hidden','true')}const canvas")
    .replaceAll("#f8fafc", canvasTheme.background)
    .replaceAll("#fff", canvasTheme.surface)
    .replaceAll("#dce5ef", canvasTheme.grid)
    .replaceAll("#64748b", canvasTheme.axis)
    .replaceAll("#475569", canvasTheme.muted)
    .replaceAll("#172033", canvasTheme.ink)
    .replaceAll("#2563eb", canvasTheme.vector);
  return runtimeTemplate
    .replace("__TITLE__", escapeHtml(spec.meta.title))
    .replace("__DATA__", () => JSON.stringify(spec));
}

function injectRuntimeShield(html) {
  let counter = 0;
  const guardedLoop = (match) => {
    counter += 1;
    const id = `__lcLoop${counter}`;
    return `let ${id}=0;${match}
if(++${id}>10000){
  console.warn('LogicCanvas runtime shield stopped a long loop');
  break;
}`;
  };
  return html
    .replace(/for\s*\(([^)]*)\)\s*\{/g, guardedLoop)
    .replace(/while\s*\(([^)]*)\)\s*\{/g, guardedLoop)
    .replace(/do\s*\{/g, guardedLoop);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

createRoot(document.getElementById("root")).render(h(App));
