/* 3D-Schreibtisch-Szene (Three.js, nur einfache Geometrie – keine externen Modelle nötig) */
window.Scene = (function () {
  var renderer, scene, camera, screenMesh;
  var mode = "hidden", t = 0;
  var idlePos = new THREE.Vector3(4.2, 3.1, 5.2);
  var lookAtHome = new THREE.Vector3(0, 1.2, 0);
  var zoomPos = new THREE.Vector3(0, 1.82, 1.45);
  var zoomLook = new THREE.Vector3(0, 1.82, 0);
  var curLook = lookAtHome.clone();
  var targetPos = idlePos.clone();

  function mat(c, r) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? 0.8 : r }); }
  function box(w, h, d, x, y, z, m, parent) {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true;
    (parent || scene).add(mesh); return mesh;
  }
  function cyl(rt, rb, h, seg, m, x, y, z, parent) {
    var mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    mesh.position.set(x, y, z); mesh.castShadow = true; (parent || scene).add(mesh); return mesh;
  }

  function build() {
    scene.background = new THREE.Color(0xb9b9c2);
    scene.fog = new THREE.Fog(0xb9b9c2, 9, 22);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9aa6, 1.0));
    var sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(3, 6, 4); sun.castShadow = true; scene.add(sun);

    var floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat(0xcfcfd6, 1));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    var grey = mat(0x8c8c90), dark = mat(0x3a3634), cream = mat(0xd8d8d4, 0.6), brown = mat(0x9c6a35);

    // Schreibtisch
    box(3.4, 0.1, 1.4, 0, 1, 0, dark);
    [[-1.6, -0.6], [-1.6, 0.6], [1.6, -0.6], [1.6, 0.6]].forEach(function (p) { box(0.1, 1, 0.1, p[0], 0.5, p[1], grey); });
    box(0.9, 0.6, 1.2, -1.1, 0.65, 0, grey);
    box(0.9, 0.04, 0.02, -1.1, 0.75, 0.61, mat(0x555555));
    box(0.9, 0.04, 0.02, -1.1, 0.55, 0.61, mat(0x555555));

    // Rechner, Röhrenmonitor, Tastatur, Maus
    box(1, 0.25, 0.8, 0, 1.175, 0, cream);
    box(0.95, 0.8, 0.8, 0, 1.78, 0, cream);
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.54), new THREE.MeshBasicMaterial({ color: 0x1f3236 }));
    screenMesh.position.set(0, 1.82, 0.401); scene.add(screenMesh);
    box(0.6, 0.03, 0.22, 0, 1.065, 0.55, cream);
    box(0.12, 0.03, 0.18, 0.6, 1.065, 0.55, cream);

    // Papier und Ordner
    box(0.5, 0.06, 0.4, -1.3, 1.08, 0.1, mat(0xe6e6e0));
    box(0.45, 0.12, 0.35, -1.3, 1.17, 0.1, mat(0xefefea));
    box(0.2, 0.55, 0.4, 0.95, 1.33, -0.4, mat(0x4a3a35));
    box(0.2, 0.5, 0.4, 1.15, 1.31, -0.4, mat(0x5a463f));

    // Stuhl
    var chair = new THREE.Group(); scene.add(chair);
    box(0.7, 0.12, 0.7, 0, 0, 0, brown, chair);
    box(0.1, 0.7, 0.5, 0.4, 0.4, 0, brown, chair);
    cyl(0.04, 0.04, 0.55, 8, mat(0x333333), 0, -0.28, 0, chair);
    cyl(0.4, 0.4, 0.04, 5, mat(0x222222), 0, -0.55, 0, chair);
    chair.position.set(0.5, 0.85, 1.5); chair.rotation.y = -0.5;

    // Pflanze
    var plant = new THREE.Group(); scene.add(plant);
    cyl(0.18, 0.14, 0.3, 12, mat(0xeeeeee), 0, 0.15, 0, plant);
    for (var i = 0; i < 6; i++) {
      var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat(0x6fb27a));
      leaf.scale.set(0.3, 1, 0.12);
      leaf.position.set(Math.cos(i) * 0.2, 0.8, Math.sin(i) * 0.2);
      leaf.rotation.set(Math.sin(i) * 0.5, i, Math.cos(i) * 0.5);
      plant.add(leaf);
    }
    plant.position.set(1.7, 0, -0.3);
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    // Auf Hochkant-Displays weiter weg, damit der Schreibtisch ins Bild passt
    idlePos.z = camera.aspect < 1 ? 8.5 : 5.2;
    camera.updateProjectionMatrix();
  }

  function loop() {
    requestAnimationFrame(loop);
    var dest, k;
    if (mode === "zoom") { dest = zoomPos; k = 0.045; }
    else {
      if (mode === "idle") { t += 0.004; targetPos.set(4.2 + Math.sin(t) * 0.5, 3.1, idlePos.z + Math.cos(t) * 0.3); }
      else targetPos.copy(idlePos);
      dest = targetPos; k = 0.03;
    }
    camera.position.lerp(dest, k);
    curLook.lerp(mode === "zoom" ? zoomLook : lookAtHome, k);
    camera.lookAt(curLook);
    renderer.render(scene, camera);
  }

  function init() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    document.body.prepend(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    build(); resize();
    addEventListener("resize", resize);
    camera.position.copy(idlePos);
    loop();
    return true;
  }

  return {
    init: init,
    setMode: function (m) { mode = m; },
    screenVisible: function (v) { if (screenMesh) screenMesh.visible = v; }
  };
})();
