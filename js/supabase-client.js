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
    githubSession: async function () {
      if (!client) return { session: null, error: { message: "Supabase Auth ist nicht konfiguriert." } };
      try {
        var r = await client.auth.getSession();
        return { session: r.data && r.data.session, error: r.error };
      } catch (e) { return { session: null, error: e }; }
    },
    githubSignIn: async function () {
      if (!client) return { error: { message: "Supabase Auth ist nicht konfiguriert." } };
      return await client.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: window.location.href, scopes: "read:user user:follow" }
      });
    },
    githubSignOut: async function () {
      if (!client) return { error: { message: "Supabase Auth ist nicht konfiguriert." } };
      return await client.auth.signOut();
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
