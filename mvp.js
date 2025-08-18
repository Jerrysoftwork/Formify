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
