// App identity for this copy of the shared core (app.js / cloud.js / app.css).
// Momentum (goals) reuses the same core with its own config.js.
window.APP_CONFIG = {
  id: "cadence",                 // Firestore apps/{id}/users/{uid}/..., localStorage prefix
  name: "Cadence",
  mode: "tasks",                 // "tasks": finish things; unfinished one-offs carry over as overdue
  collections: { personal: "tasks", work: "workTasks" },
  legacyMove: true,              // move data from the pre-dashboard users/{uid}/... layout
};
