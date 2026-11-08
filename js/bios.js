/* BIOS-Boot-Animation */
window.Bios = (function () {
  var skip = false;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, skip ? 0 : ms); }); };
  async function type(el, txt, d) {
    for (var i = 0; i < txt.length; i++) { el.textContent += txt[i]; if (!skip) await sleep(d || 10); }
  }
  async function run() {
    var el = document.getElementById("bios");
    var skipper = function () { skip = true; };
    addEventListener("keydown", skipper); addEventListener("pointerdown", skipper);
    await type(el, CONFIG.name + ", Entwickler.\nBIOS (C)" + CONFIG.year + " " + CONFIG.name + "\n\nArbeitsspeicher prüfen : 14000 OK\n\nLADE RESSOURCEN (3/3).\n\n");
    var items = [["Desktop", 34], ["Monitor", 67], ["Büro", 100]];
    for (var i = 0; i < items.length; i++) {
      await type(el, "    Geladen: " + items[i][0] + " ".repeat(12 - items[i][0].length) + "... " + items[i][1] + "%\n", 6);
      await sleep(250);
    }
    await sleep(400);
    removeEventListener("keydown", skipper); removeEventListener("pointerdown", skipper);
    el.style.display = "none";
  }
  return { run: run, type: type, sleep: sleep };
})();
