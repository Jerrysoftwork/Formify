// Splash screen handler
document.getElementById("enterApp").onclick = () => {
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
};

const state = {
  schema: { title: "Untitled Form", fields: [] },
  activeId: null
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