/* Ablauf: BIOS -> Start-Box -> 3D-Szene -> Zoom -> Desktop -> Shutdown */
(function () {
  var $ = function (s) { return document.getElementById(s); };
  var hasScene = false, state = "boot";

  document.title = CONFIG.name + " – " + CONFIG.role;
  $("start-title").textContent = CONFIG.name + " portfolio showcase";
  $("hud-name").textContent = CONFIG.name;
  $("hud-role").textContent = CONFIG.role;

  Desktop.init(shutdown);

  function enterDesk() {
    state = "zoom";
    $("hint").style.display = "none";
    $("hud").style.display = "block";
    Scene.setMode("zoom");
    setTimeout(function () { Scene.screenVisible(false); Desktop.open(); }, hasScene ? 1800 : 0);
  }

  async function shutdown() {
    state = "shutdown";
    Desktop.close();
    var sd = $("sd"); sd.style.display = "block"; sd.textContent = "";
    await Bios.type(sd, "Beginning Pre-Shutdown Sequence...\nAnalyzing data... Done.\nPacking transfer... Done.\n[" +
      new Date().toLocaleTimeString() + "] ...................\n", 18);
    await Bios.sleep(1200);
    sd.style.display = "none";
    Scene.screenVisible(true);
    $("hud").style.display = "none";
    Scene.setMode("idle");
    state = "idle";
    $("hint").style.display = hasScene ? "block" : "none";
    if (!hasScene) { state = "zoom"; Desktop.open(); }
  }

  $("go").addEventListener("click", function (e) {
    e.stopPropagation();
    $("start").style.display = "none";
    hasScene = Scene.init();
    if (!hasScene) { enterDesk(); return; }   // Fallback ohne WebGL
    Scene.setMode("idle"); state = "idle";
    $("hint").style.display = "block";
  });

  document.addEventListener("click", function () { if (state === "idle") enterDesk(); });

  Bios.run().then(function () { $("start").style.display = "grid"; $("go").focus(); });
})();
