/* Der „Windows 95“-Desktop auf dem Monitor: Seiten, Projekte, Kontaktformular */
window.Desktop = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var onShutdown = function () {};

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : "#"; }

  function nav() {
    return '<nav>' + ["home", "about", "experience", "projects", "contact"].map(function (p) {
      return '<a href="#" data-p="' + p + '">' + p + '</a>';
    }).join("") + '</nav>';
  }

  async function show(p) {
    var h;
    if (p === "home") {
      h = '<div class="c"><h1>' + esc(CONFIG.name) + '</h1><b>' + esc(CONFIG.role) + '</b><br><br>' + nav() + '</div>';
    } else {
      h = nav() + "<hr>";
      if (p === "about") h += "<h2>About</h2><p>" + esc(CONFIG.about) + "</p>";
      if (p === "experience") {
        h += "<h2>Experience</h2>" + CONFIG.experience.map(function (e) {
          return "<p><b>" + esc(e.company) + "</b><br><i>" + esc(e.title) + "</i><br>" + esc(e.text) + "</p>";
        }).join("");
      }
      if (p === "projects") {
        $("#page").innerHTML = nav() + "<hr><p>Loading...</p>"; bindNav();
        var list = await Api.projects();
        h = nav() + "<hr><h2>Projects</h2>" + list.map(function (x) {
          return "<p><b>" + esc(x.title) + "</b>" + (x.tags ? " <small>(" + esc(x.tags) + ")</small>" : "") + "<br>" +
            esc(x.description) + '<br><a href="' + esc(safeUrl(x.url)) + '" target="_blank" rel="noopener">View</a></p>';
        }).join("");
      }
      if (p === "contact") {
        h += '<h2>Contact</h2><p class="links">Email: <a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + "</a><br>" +
          '<a href="' + esc(safeUrl(CONFIG.github)) + '" target="_blank" rel="noopener">GitHub</a>' +
          '<a href="' + esc(safeUrl(CONFIG.linkedin)) + '" target="_blank" rel="noopener">LinkedIn</a></p>' +
          '<form id="f" novalidate>' +
          '<label for="f-name">Your name:</label><input id="f-name" name="name" required maxlength="100">' +
          '<label for="f-email">Email:</label><input id="f-email" name="email" type="email" required maxlength="200">' +
          '<label for="f-company">Company (optional):</label><input id="f-company" name="company" maxlength="100">' +
          '<label for="f-msg">Message:</label><textarea id="f-msg" name="message" rows="4" required maxlength="2000"></textarea>' +
          '<div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>' +
          '<button type="submit">Send Message</button> <span id="st" role="status"></span></form>';
      }
    }
    $("#page").innerHTML = h;
    $("#page").scrollTop = 0;
    bindNav();
    var f = $("#f"); if (f) f.addEventListener("submit", submit);
  }

  function bindNav() {
    document.querySelectorAll("#page [data-p]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); show(a.getAttribute("data-p")); });
    });
  }

  async function submit(e) {
    e.preventDefault();
    var f = e.target, st = $("#st"), d = new FormData(f);
    var name = (d.get("name") || "").trim(), email = (d.get("email") || "").trim(), msg = (d.get("message") || "").trim();
    if (!name || !msg || !/^\S+@\S+\.\S+$/.test(email)) { st.textContent = "Please fill in name, a valid email and a message."; return; }
    if (d.get("website")) { st.textContent = "Thanks, message received."; f.reset(); return; } // Honeypot: Bots
    try { var last = +localStorage.getItem("lastMsg") || 0; if (Date.now() - last < 60000) { st.textContent = "Please wait a minute before sending another message."; return; } } catch (x) {}
    st.textContent = "Sending...";
    var r = await Api.sendMessage({ name: name, email: email, company: (d.get("company") || "").trim() || null, message: msg });
    if (r.error) { st.textContent = Api.ready ? "Sending failed. Please try again later." : "Contact form is not configured yet."; return; }
    try { localStorage.setItem("lastMsg", String(Date.now())); } catch (x) {}
    st.textContent = "Thanks, message received."; f.reset();
  }

  function init(shutdownCb) {
    onShutdown = shutdownCb;
    $("#tb-title").textContent = CONFIG.name + " " + CONFIG.year;
    $("#status").textContent = "© Copyright " + CONFIG.year + " " + CONFIG.name;
    $("#x").addEventListener("click", function () { onShutdown(); });
    var tick = function () { $("#clk").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
    tick(); setInterval(tick, 1000);
  }

  return {
    init: init,
    open: function () { $("#screen").style.display = "grid"; show("home"); },
    close: function () { $("#screen").style.display = "none"; }
  };
})();
