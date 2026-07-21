const MAX_PIXEL_RATIO = 2;

const palette = {
  background: "#111827",
  surface: "#111827",
  grid: "#334155",
  text: "#e2e8f0",
  muted: "#94a3b8",
  primary: "#2dd4bf",
  secondary: "#00f2fe",
  accent: "#fbbf24",
  positive: "#34d399",
  inactive: "#94a3b8"
};

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function controlEntries(config) {
  return Array.isArray(config?.variables) ? config.variables : Array.isArray(config?.controls) ? config.controls : [];
}

function controlId(control) {
  return control.id;
}

function controlDefault(control) {
  return number(control.default ?? control.defaultValue ?? control.value, 0);
}

function controlLabel(control) {
  return control.label || control.id.replace(/_/g, " ");
}

function controlUnit(control) {
  return control.unit || "";
}

function controlMinimum(control) {
  return number(control.min, 0);
}

function controlMaximum(control) {
  return number(control.max, 100);
}

function controlStep(control) {
  return number(control.step, 1);
}

function formatValue(value, control) {
  const step = controlStep(control);
  const digits = step > 0 && step < 1 ? Math.min(3, String(step).split(".")[1]?.length || 1) : 0;
  return `${number(value).toFixed(digits)}${controlUnit(control) ? ` ${controlUnit(control)}` : ""}`;
}

function resizeCanvas(canvas, context) {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const width = Math.max(320, Math.floor(bounds.width * ratio));
  const height = Math.max(280, Math.floor(bounds.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: width / ratio, height: height / ratio };
}

function drawLine(context, points, color, width = 2) {
  if (!points.length) return;
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function drawArrow(context, from, to, color, label) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.beginPath();
  context.moveTo(to.x, to.y);
  context.lineTo(to.x - 9 * Math.cos(angle - Math.PI / 6), to.y - 9 * Math.sin(angle - Math.PI / 6));
  context.lineTo(to.x - 9 * Math.cos(angle + Math.PI / 6), to.y - 9 * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
  if (label) {
    context.font = "12px system-ui";
    context.fillText(label, to.x + 6, to.y - 6);
  }
}

export class CanvasRenderer {
  constructor(config, options = {}) {
    this.config = config || {};
    this.options = options;
    this.state = Object.fromEntries(controlEntries(this.config).map((control) => [controlId(control), controlDefault(control)]));
    this.root = null;
    this.canvas = null;
    this.context = null;
    this.controlsElement = null;
    this.equationsElement = null;
    this.legendElement = null;
    this.frame = 0;
    this.lastTime = 0;
    this.resizeObserver = null;
    this.active = false;
  }

  init(parent) {
    this.reset();
    this.root = document.createElement("section");
    this.root.className = "logiccanvas-runtime";
    this.root.innerHTML = "<section class=\"runtime-stage\"><canvas class=\"runtime-canvas\" role=\"img\"></canvas></section><section class=\"runtime-meta\"><div><h2>Interactive adjustments</h2><div class=\"runtime-controls\"></div></div><div><h2>Equations</h2><div class=\"runtime-equations\"></div></div><div><h2>Legend</h2><div class=\"runtime-legend\"></div></div></section>";
    parent.replaceChildren(this.root);
    this.canvas = this.root.querySelector("canvas");
    this.canvas.setAttribute("aria-label", `${this.config?.meta?.title || this.config?.topic || "LogicCanvas"} visualization`);
    this.context = this.canvas.getContext("2d");
    this.controlsElement = this.root.querySelector(".runtime-controls");
    this.equationsElement = this.root.querySelector(".runtime-equations");
    this.legendElement = this.root.querySelector(".runtime-legend");
    this.renderControls();
    this.renderEquations();
    this.renderLegend();
    this.resizeObserver = new ResizeObserver(() => this.render());
    this.resizeObserver.observe(this.root.querySelector(".runtime-stage"));
    this.active = true;
    this.frame = requestAnimationFrame((time) => this.tick(time));
    return this;
  }

  tick(time) {
    if (!this.active) return;
    const delta = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;
    this.update(delta);
    this.render();
    this.frame = requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  update() {}

  render() {}

  reset() {
    this.active = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastTime = 0;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.root?.replaceChildren();
    this.root = null;
  }

  setParameter(id, value) {
    if (!(id in this.state)) return;
    this.state[id] = number(value, this.state[id]);
    this.update(0);
    this.render();
    this.options.onChange?.(this.state, id);
  }

  value(...ids) {
    for (const id of ids) {
      if (id in this.state) return number(this.state[id]);
    }
    return 0;
  }

  renderControls() {
    const fragment = document.createDocumentFragment();
    controlEntries(this.config).forEach((control) => {
      const minimum = controlMinimum(control);
      const maximum = controlMaximum(control);
      const step = controlStep(control);
      const isSwitch = control.type === "switch" || (minimum === 0 && maximum === 1 && step === 1);
      const label = document.createElement("label");
      label.className = isSwitch ? "runtime-switch" : "runtime-control";
      const title = document.createElement("span");
      title.textContent = controlLabel(control);
      const output = document.createElement("output");
      output.textContent = formatValue(this.state[controlId(control)], control);
      const input = document.createElement("input");
      input.type = isSwitch ? "checkbox" : "range";
      input.checked = Boolean(this.state[controlId(control)]);
      input.min = String(minimum);
      input.max = String(maximum);
      input.step = String(step);
      input.value = String(this.state[controlId(control)]);
      input.addEventListener("input", () => {
        const nextValue = isSwitch ? Number(input.checked) : number(input.value);
        this.setParameter(controlId(control), nextValue);
        output.textContent = formatValue(nextValue, control);
      });
      label.append(title, output, input);
      fragment.append(label);
    });
    this.controlsElement.replaceChildren(fragment);
  }

  renderEquations() {
    const equations = Array.isArray(this.config?.formulas) ? this.config.formulas : this.config?.equations || [];
    const fragment = document.createDocumentFragment();
    equations.forEach((equation) => {
      const item = document.createElement("article");
      const expression = typeof equation === "string" ? equation : equation.expression;
      const description = typeof equation === "string" ? "" : equation.description;
      item.innerHTML = `<code>${escapeText(expression || "")}</code>${description ? `<span>${escapeText(description)}</span>` : ""}`;
      fragment.append(item);
    });
    this.equationsElement.replaceChildren(fragment);
  }

  renderLegend() {
    const items = this.legendItems();
    this.legendElement.replaceChildren(...items.map((item) => {
      const entry = document.createElement("span");
      entry.innerHTML = `<i style=\"background:${item.color}\"></i>${escapeText(item.label)}`;
      return entry;
    }));
  }

  legendItems() {
    return [{ label: "Model", color: palette.primary }];
  }

  beginFrame() {
    const size = resizeCanvas(this.canvas, this.context);
    this.context.clearRect(0, 0, size.width, size.height);
    this.context.fillStyle = palette.background;
    this.context.fillRect(0, 0, size.width, size.height);
    this.context.font = "13px system-ui";
    return size;
  }
}

export class MechanicsRenderer extends CanvasRenderer {
  render() {
    const { width, height } = this.beginFrame();
    const type = this.config?.renderer?.type || this.config?.renderer || "projectile";
    if (type === "pendulum") return this.renderPendulum(width, height);
    this.renderProjectile(width, height);
  }

  renderProjectile(width, height) {
    const speed = this.value("speed", "launch_speed", "velocity") || 22;
    const angle = this.value("angle", "launch_angle") || 45;
    const gravity = this.value("gravity", "g") || 9.8;
    const radians = angle * Math.PI / 180;
    const range = Math.max(0.01, (speed ** 2 * Math.sin(2 * radians)) / gravity);
    const peak = Math.max(0.01, (speed ** 2 * Math.sin(radians) ** 2) / (2 * gravity));
    const margin = { left: 48, right: 28, top: 30, bottom: 42 };
    const ground = height - margin.bottom;
    this.context.strokeStyle = palette.grid;
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(margin.left, ground);
    this.context.lineTo(width - margin.right, ground);
    this.context.stroke();
    const points = [];
    for (let index = 0; index <= 180; index += 1) {
      const x = range * index / 180;
      const y = x * Math.tan(radians) - gravity * x ** 2 / (2 * speed ** 2 * Math.cos(radians) ** 2);
      points.push({ x: margin.left + x / range * (width - margin.left - margin.right), y: ground - Math.max(0, y) / peak * (height - margin.top - margin.bottom) });
    }
    drawLine(this.context, points, palette.primary, 3);
    const position = points[Math.floor((performance.now() / 18) % points.length)];
    this.context.fillStyle = palette.accent;
    this.context.beginPath();
    this.context.arc(position.x, position.y, 7, 0, Math.PI * 2);
    this.context.fill();
    drawArrow(this.context, { x: margin.left, y: ground }, { x: margin.left + 48 * Math.cos(radians), y: ground - 48 * Math.sin(radians) }, palette.secondary, "v");
    this.context.fillStyle = palette.muted;
    this.context.fillText(`Range ${range.toFixed(1)} m`, width - 126, ground - 12);
    this.context.fillText(`Peak ${peak.toFixed(1)} m`, margin.left, margin.top);
  }

  renderPendulum(width, height) {
    const length = this.value("length", "string_length") || 2;
    const angle = this.value("angle", "amplitude") || 24;
    const gravity = this.value("gravity", "g") || 9.8;
    const pivot = { x: width / 2, y: 44 };
    const radius = Math.min(width * 0.35, height * 0.62);
    const omega = Math.sqrt(gravity / Math.max(0.1, length));
    const currentAngle = angle * Math.PI / 180 * Math.cos(performance.now() / 1000 * omega);
    const bob = { x: pivot.x + radius * Math.sin(currentAngle), y: pivot.y + radius * Math.cos(currentAngle) };
    this.context.strokeStyle = palette.grid;
    this.context.beginPath();
    this.context.arc(pivot.x, pivot.y, radius, Math.PI / 2 - angle * Math.PI / 180, Math.PI / 2 + angle * Math.PI / 180);
    this.context.stroke();
    drawLine(this.context, [pivot, bob], palette.primary, 3);
    this.context.fillStyle = palette.accent;
    this.context.beginPath();
    this.context.arc(bob.x, bob.y, 16, 0, Math.PI * 2);
    this.context.fill();
    this.context.fillStyle = palette.muted;
    this.context.fillText(`Period ${(2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2)} s`, 22, height - 22);
  }

  legendItems() {
    return [{ label: "Kinematic path", color: palette.primary }, { label: "Live object", color: palette.accent }, { label: "Velocity vector", color: palette.secondary }];
  }
}

export class CircuitRenderer extends CanvasRenderer {
  render() {
    if ("input_a" in this.state || "input_b" in this.state || "gate" in this.state) {
      this.renderLogicGate();
      return;
    }
    const { width, height } = this.beginFrame();
    const voltage = this.value("voltage", "source_voltage") || 9;
    const resistance = Math.max(0.1, this.value("resistance", "resistor") || 100);
    const capacitance = Math.max(0.001, this.value("capacitance", "capacitor") || 1);
    const current = voltage / resistance;
    const x1 = width * 0.18;
    const x2 = width * 0.82;
    const y1 = height * 0.28;
    const y2 = height * 0.72;
    const centerY = (y1 + y2) / 2;
    this.context.strokeStyle = palette.text;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(x1, y1); this.context.lineTo(x2, y1); this.context.lineTo(x2, y2); this.context.lineTo(x1, y2); this.context.closePath();
    this.context.stroke();
    this.context.fillStyle = palette.surface;
    this.context.fillRect(x1 - 22, centerY - 38, 44, 76);
    this.context.strokeRect(x1 - 22, centerY - 38, 44, 76);
    this.context.fillStyle = palette.text;
    this.context.fillText("+", x1 - 4, centerY - 13);
    this.context.fillText("-", x1 - 4, centerY + 23);
    this.context.strokeStyle = palette.accent;
    this.context.lineWidth = 3;
    const resistorY = y1;
    this.context.beginPath();
    for (let index = 0; index <= 8; index += 1) {
      const x = width * 0.44 + index * 12;
      const y = resistorY + (index % 2 === 0 ? -12 : 12);
      if (index === 0) this.context.moveTo(x, resistorY);
      else this.context.lineTo(x, y);
    }
    this.context.stroke();
    this.context.strokeStyle = palette.secondary;
    this.context.beginPath();
    this.context.moveTo(width * 0.57, y2 - 18); this.context.lineTo(width * 0.57, y2 + 18);
    this.context.moveTo(width * 0.61, y2 - 18); this.context.lineTo(width * 0.61, y2 + 18);
    this.context.stroke();
    const travel = (performance.now() / 25) % 1;
    for (let index = 0; index < 8; index += 1) {
      const progress = (travel + index / 8) % 1;
      const perimeter = 2 * ((x2 - x1) + (y2 - y1));
      let distance = progress * perimeter;
      let point;
      if (distance < x2 - x1) point = { x: x1 + distance, y: y1 };
      else if ((distance -= x2 - x1) < y2 - y1) point = { x: x2, y: y1 + distance };
      else if ((distance -= y2 - y1) < x2 - x1) point = { x: x2 - distance, y: y2 };
      else point = { x: x1, y: y2 - (distance - (x2 - x1)) };
      this.context.fillStyle = palette.positive;
      this.context.beginPath(); this.context.arc(point.x, point.y, 4, 0, Math.PI * 2); this.context.fill();
    }
    this.context.fillStyle = palette.muted;
    this.context.fillText(`${voltage.toFixed(1)} V source`, x1 - 32, centerY + 58);
    this.context.fillText(`${resistance.toFixed(0)} ohm`, width * 0.42, y1 - 24);
    this.context.fillText(`${capacitance.toFixed(2)} F`, width * 0.53, y2 + 38);
    this.context.fillText(`Current ${(current * 1000).toFixed(1)} mA`, width - 152, height - 20);
  }

  renderLogicGate() {
    const { width, height } = this.beginFrame();
    const gates = ["AND", "OR", "XOR", "NOT"];
    const inputA = Boolean(this.value("input_a"));
    const inputB = Boolean(this.value("input_b"));
    const gate = gates[Math.round(this.value("gate"))] || "XOR";
    const output = gate === "AND" ? inputA && inputB : gate === "OR" ? inputA || inputB : gate === "XOR" ? inputA !== inputB : !inputA;
    const box = { x: width * 0.34, y: height * 0.3, width: width * 0.32, height: height * 0.4 };
    this.context.fillStyle = palette.surface;
    this.context.fillRect(box.x, box.y, box.width, box.height);
    this.context.strokeStyle = palette.primary;
    this.context.lineWidth = 3;
    this.context.strokeRect(box.x, box.y, box.width, box.height);
    this.context.strokeStyle = palette.text;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(28, box.y + box.height * 0.3); this.context.lineTo(box.x, box.y + box.height * 0.3);
    this.context.moveTo(28, box.y + box.height * 0.7); this.context.lineTo(box.x, box.y + box.height * 0.7);
    this.context.moveTo(box.x + box.width, height / 2); this.context.lineTo(width - 28, height / 2);
    this.context.stroke();
    this.context.fillStyle = palette.text;
    this.context.font = "700 28px system-ui";
    this.context.fillText(gate, box.x + box.width / 2 - this.context.measureText(gate).width / 2, height / 2 + 9);
    this.context.font = "13px system-ui";
    this.context.fillStyle = inputA ? palette.positive : palette.inactive;
    this.context.fillText(`A ${Number(inputA)}`, 28, box.y + box.height * 0.3 - 12);
    this.context.fillStyle = inputB ? palette.positive : palette.inactive;
    this.context.fillText(`B ${Number(inputB)}`, 28, box.y + box.height * 0.7 - 12);
    this.context.fillStyle = output ? palette.positive : palette.inactive;
    this.context.fillText(`Output ${Number(output)}`, width - 106, height / 2 - 12);
  }

  legendItems() {
    return [{ label: "Current flow", color: palette.positive }, { label: "Resistor", color: palette.accent }, { label: "Capacitor", color: palette.secondary }];
  }
}

export class OpticsRenderer extends CanvasRenderer {
  render() {
    const { width, height } = this.beginFrame();
    const focalLength = Math.max(10, this.value("focal_length", "focal", "focus") || 110);
    const objectDistance = Math.max(focalLength + 4, this.value("object_distance", "distance") || 230);
    const mirror = (this.config?.renderer?.type || this.config?.renderer) === "mirror";
    const axis = height / 2;
    const lensX = width * 0.58;
    const objectX = lensX - objectDistance;
    const imageDistance = focalLength * objectDistance / (objectDistance - focalLength);
    const imageX = lensX + (mirror ? -imageDistance : imageDistance);
    const objectHeight = Math.min(90, height * 0.24);
    const imageHeight = -objectHeight * imageDistance / objectDistance;
    this.context.strokeStyle = palette.grid;
    this.context.beginPath(); this.context.moveTo(22, axis); this.context.lineTo(width - 22, axis); this.context.stroke();
    this.context.strokeStyle = palette.primary;
    this.context.lineWidth = 3;
    if (mirror) {
      this.context.beginPath(); this.context.arc(lensX + 90, axis, 90, Math.PI / 2, Math.PI * 1.5); this.context.stroke();
    } else {
      this.context.beginPath(); this.context.ellipse(lensX, axis, 17, height * 0.34, 0, 0, Math.PI * 2); this.context.stroke();
    }
    [lensX - focalLength, lensX + focalLength].forEach((x) => {
      this.context.fillStyle = palette.muted;
      this.context.beginPath(); this.context.arc(x, axis, 4, 0, Math.PI * 2); this.context.fill();
      this.context.fillText("F", x - 3, axis + 20);
    });
    drawArrow(this.context, { x: objectX, y: axis }, { x: objectX, y: axis - objectHeight }, palette.accent, "Object");
    drawArrow(this.context, { x: imageX, y: axis }, { x: imageX, y: axis + imageHeight }, palette.secondary, "Image");
    const objectTop = { x: objectX, y: axis - objectHeight };
    const lensTop = { x: lensX, y: axis - objectHeight * (lensX - objectX) / objectDistance };
    const imageTop = { x: imageX, y: axis + imageHeight };
    drawLine(this.context, [objectTop, lensTop, imageTop], palette.accent, 1.5);
    drawLine(this.context, [objectTop, { x: lensX, y: axis }, imageTop], palette.secondary, 1.5);
    this.context.fillStyle = palette.muted;
    this.context.fillText(`f = ${focalLength.toFixed(0)} px`, 24, 28);
    this.context.fillText(`${mirror ? "Reflection" : "Refraction"} rays`, width - 132, 28);
  }

  legendItems() {
    return [{ label: "Optical axis", color: palette.grid }, { label: "Principal ray", color: palette.accent }, { label: "Image ray", color: palette.secondary }];
  }
}

export class MathRenderer extends CanvasRenderer {
  render() {
    const { width, height } = this.beginFrame();
    const amplitude = this.value("amplitude", "a") || 1;
    const period = Math.max(0.1, this.value("period", "frequency", "b") || 2);
    const phase = this.value("phase", "phase_shift", "c");
    const renderer = this.config?.renderer?.type || this.config?.renderer || "function";
    const padding = { left: 46, right: 24, top: 26, bottom: 34 };
    const origin = { x: (padding.left + width - padding.right) / 2, y: (padding.top + height - padding.bottom) / 2 };
    const xScale = (width - padding.left - padding.right) / (Math.PI * 4);
    const yScale = (height - padding.top - padding.bottom) / (Math.max(2.5, Math.abs(amplitude) * 2.4));
    this.context.strokeStyle = palette.grid;
    this.context.lineWidth = 1;
    for (let x = padding.left; x <= width - padding.right; x += xScale * Math.PI / 2) {
      this.context.beginPath(); this.context.moveTo(x, padding.top); this.context.lineTo(x, height - padding.bottom); this.context.stroke();
    }
    for (let y = padding.top; y <= height - padding.bottom; y += yScale) {
      this.context.beginPath(); this.context.moveTo(padding.left, y); this.context.lineTo(width - padding.right, y); this.context.stroke();
    }
    this.context.strokeStyle = palette.text;
    this.context.beginPath(); this.context.moveTo(padding.left, origin.y); this.context.lineTo(width - padding.right, origin.y); this.context.moveTo(origin.x, padding.top); this.context.lineTo(origin.x, height - padding.bottom); this.context.stroke();
    const points = [];
    for (let index = 0; index <= 400; index += 1) {
      const x = -Math.PI * 2 + index / 400 * Math.PI * 4;
      const y = renderer === "parabola" ? amplitude * (x - phase) ** 2 / Math.max(1, period) : amplitude * Math.sin(period * x + phase);
      points.push({ x: origin.x + x * xScale, y: origin.y - y * yScale });
    }
    drawLine(this.context, points, palette.primary, 3);
    const limitX = clamp(this.value("limit", "x_value") || 0, -6, 6);
    const limitY = renderer === "parabola" ? amplitude * (limitX - phase) ** 2 / Math.max(1, period) : amplitude * Math.sin(period * limitX + phase);
    const marker = { x: origin.x + limitX * xScale, y: origin.y - limitY * yScale };
    this.context.fillStyle = palette.accent;
    this.context.beginPath(); this.context.arc(marker.x, marker.y, 5, 0, Math.PI * 2); this.context.fill();
    this.context.fillStyle = palette.muted;
    this.context.fillText(`f(${limitX.toFixed(1)}) = ${limitY.toFixed(2)}`, width - 152, 24);
  }

  legendItems() {
    return [{ label: "Function", color: palette.primary }, { label: "Limit marker", color: palette.accent }];
  }
}

export function selectRenderer(config) {
  const type = String(config?.renderer?.type || config?.renderer || "").toLowerCase();
  const domain = String(config?.meta?.domain || config?.domain || "").toLowerCase();
  if (["projectile", "pendulum", "beam"].includes(type) || domain === "physics" && !["wave", "optics"].includes(type)) return MechanicsRenderer;
  if (["circuit", "logic", "gate"].includes(type) || domain === "engineering") return CircuitRenderer;
  if (["optics", "lens", "mirror"].includes(type)) return OpticsRenderer;
  return MathRenderer;
}

export function mountVisualizationRuntime(parent, config, options) {
  const Renderer = selectRenderer(config);
  const renderer = new Renderer(config, options);
  renderer.init(parent);
  return renderer;
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
