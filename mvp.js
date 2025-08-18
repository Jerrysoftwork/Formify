// Splash screen handler
document.getElementById("enterApp").onclick = () => {
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
};

const state = {
  schema: {
    title: "Contact Form",
    fields: [
      { id: "f1", type: "text", label: "Full Name", name: "fullName", required: true, placeholder: "e.g. Ada Lovelace" },
      { id: "f2", type: "email", label: "Email", name: "email", required: true },
      { id: "f3", type: "select", label: "Topic", name: "topic", options: ["Support","Billing","General"], required: true },
      { id: "f4", type: "textarea", label: "Message", name: "message", minLength: 10 }
    ]
  },
  activeId: "f1"
};

const fieldDefaults = (type) => ({
  id: crypto.randomUUID(),
  type,
  label: type[0].toUpperCase() + type.slice(1),
  name: type + Date.now().toString().slice(-4),
  required: false
});

const $ = s => document.querySelector(s);
const fieldList = $("#fieldList");
const propForm = $("#propForm");
const liveForm = $("#liveForm");
const output = $("#output");

// Palette add
document.querySelectorAll(".palette button").forEach(btn => {
  btn.addEventListener("click", () => {
    const f = fieldDefaults(btn.dataset.type);
    if (f.type === "select") f.options = ["Option A","Option B"];
    state.schema.fields.push(f);
    state.activeId = f.id;
    render();
  });
});

// Save / Load / Export
$("#btnSave").onclick = () => {
  localStorage.setItem("formSchema", JSON.stringify(state.schema));
  alert("Saved to localStorage");
};
$("#btnLoad").onclick = () => {
  const raw = localStorage.getItem("formSchema");
  if (!raw) return alert("No saved schema");
  state.schema = JSON.parse(raw);
  state.activeId = state.schema.fields[0]?.id || null;
  render();
};
$("#btnExport").onclick = () => {
  const blob = new Blob([JSON.stringify(state.schema, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "form-schema.json"; a.click();
  URL.revokeObjectURL(url);
};

// Render list + props + preview
function render() {
  // Canvas list
  fieldList.innerHTML = "";
  state.schema.fields.forEach((f, idx) => {
    const li = document.createElement("li");
    li.className = "fieldItem" + (f.id === state.activeId ? " active" : "");
    li.innerHTML = `<span>${idx + 1}. ${f.label} <small>(${f.type})</small></span>
      <span>
        <button data-act="up">↑</button>
        <button data-act="down">↓</button>
        <button data-act="del">✕</button>
      </span>`;
    li.addEventListener("click", (e) => {
      if (e.target.dataset.act) return; // avoid toggling on action clicks
      state.activeId = f.id; render();
    });
    li.querySelector('[data-act="up"]').onclick = (e) => { e.stopPropagation(); move(f.id, -1); };
    li.querySelector('[data-act="down"]').onclick = (e) => { e.stopPropagation(); move(f.id, 1); };
    li.querySelector('[data-act="del"]').onclick = (e) => { e.stopPropagation(); del(f.id); };
    fieldList.appendChild(li);
  });

  // Properties panel
  const active = state.schema.fields.find(x => x.id === state.activeId);
  propForm.innerHTML = active ? propEditor(active) : `<em>Select a field</em>`;
  if (active) bindPropForm(active);

  // Live preview
  liveForm.innerHTML = "";
  state.schema.fields.forEach(f => {
    const wrap = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = f.label + (f.required ? " *" : "");
    wrap.appendChild(label);

    let input;
    switch (f.type) {
      case "textarea":
        input = document.createElement("textarea");
        if (f.minLength) input.minLength = f.minLength;
        break;
      case "select":
        input = document.createElement("select");
        (f.options || []).forEach(o => {
          const opt = document.createElement("option");
          opt.value = o; opt.textContent = o; input.appendChild(opt);
        });
        break;
      case "checkbox":
        input = document.createElement("input"); input.type = "checkbox";
        break;
      default:
        input = document.createElement("input"); input.type = f.type;
        if (f.placeholder) input.placeholder = f.placeholder;
        if (f.pattern) input.pattern = f.pattern;
        if (f.minLength) input.minLength = f.minLength;
    }
    input.name = f.name;
    input.required = !!f.required;

    wrap.appendChild(input);
    liveForm.appendChild(wrap);
  });
}
render();

function move(id, dir) {
  const i = state.schema.fields.findIndex(f => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= state.schema.fields.length) return;
  const arr = state.schema.fields;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  render();
}
function del(id) {
  state.schema.fields = state.schema.fields.filter(f => f.id !== id);
  if (state.activeId === id) state.activeId = state.schema.fields[0]?.id || null;
  render();
}

function propEditor(f) {
  return `
    <div><label>Label</label><input name="label" value="${f.label || ""}"></div>
    <div><label>Name</label><input name="name" value="${f.name || ""}"></div>
    <div><label>Placeholder</label><input name="placeholder" value="${f.placeholder || ""}"></div>
    <div><label>Required</label><input type="checkbox" name="required" ${f.required ? "checked":""}></div>
    ${f.type === "select" ? `<div><label>Options (comma)</label><input name="options" value="${(f.options||[]).join(",")}"></div>` : ""}
    ${["text","email","number","textarea"].includes(f.type) ? `
      <div><label>Min Length</label><input name="minLength" type="number" value="${f.minLength || ""}"></div>
      <div><label>Pattern (regex)</label><input name="pattern" value="${f.pattern || ""}"></div>
    ` : ""}
  `;
}

function bindPropForm(f) {
  propForm.oninput = (e) => {
    const t = e.target;
    if (!t.name) return;
    if (t.name === "required") f.required = t.checked;
    else if (t.name === "minLength") f.minLength = t.value ? Number(t.value) : undefined;
    else if (t.name === "options") f.options = t.value.split(",").map(s => s.trim()).filter(Boolean);
    else f[t.name] = t.value;
    render();
  };
}

document.querySelector("#btnSubmit").onclick = (e) => {
  e.preventDefault();
  const data = {};
  const formData = new FormData(liveForm);
  for (const [k, v] of formData.entries()) data[k] = v;
  // include checkboxes not ticked
  state.schema.fields.filter(f => f.type === "checkbox").forEach(f => {
    if (!(f.name in data)) data[f.name] = false;
  });
  output.textContent = JSON.stringify(data, null, 2);
};
