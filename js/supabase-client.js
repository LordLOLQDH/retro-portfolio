/* Dünne Schicht um Supabase. Ohne Konfiguration läuft die Seite mit Fallback-Daten. */
(function () {
  var c = CONFIG.supabase;
  var configured = c.url && c.anonKey && c.url.indexOf("YOUR-PROJECT") === -1 && c.anonKey.indexOf("YOUR-ANON") === -1;
  var client = null;
  try { if (configured && window.supabase) client = window.supabase.createClient(c.url, c.anonKey); } catch (e) { client = null; }

  window.Api = {
    ready: !!client,
    projects: async function () {
      if (!client) return CONFIG.fallbackProjects;
      try {
        var r = await client.from("projects").select("title,description,url,tags").order("sort", { ascending: true });
        if (r.error || !r.data || !r.data.length) return CONFIG.fallbackProjects;
        return r.data;
      } catch (e) { return CONFIG.fallbackProjects; }
    },
    sendMessage: async function (m) {
      if (!client) return { error: { message: "Supabase is not configured." } };
      try {
        var r = await client.from("messages").insert(m);
        return { error: r.error };
      } catch (e) { return { error: e }; }
    }
  };
})();
