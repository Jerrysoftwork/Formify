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