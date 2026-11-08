/* ============================================================
   HIER ANPASSEN – alle Inhalte und Supabase-Zugangsdaten
   ============================================================ */
window.CONFIG = {
  name: "Your Name",
  role: "Software Engineer",
  email: "you@example.com",
  year: 2026,
  github: "https://github.com/your-name",
  linkedin: "https://www.linkedin.com/in/your-name",

  about: "Write a few sentences about yourself here: what you build, what you enjoy, what you are looking for.",

  experience: [
    { company: "Company A", title: "Software Engineer, 2023 – today", text: "What you built and achieved there." },
    { company: "Company B", title: "Intern, 2022", text: "What you worked on." }
  ],

  // Wird angezeigt, solange Supabase nicht konfiguriert ist oder die Tabelle leer ist.
  fallbackProjects: [
    { title: "Project One", description: "Short description.", url: "#", tags: "JavaScript" },
    { title: "Project Two", description: "Short description.", url: "#", tags: "Node.js" }
  ],

  // Supabase: Project Settings -> API. Der anon/publishable key ist öffentlich und darf hier stehen.
  // NIEMALS den service_role / secret key eintragen.
  supabase: {
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR-ANON-KEY"
  }
};
