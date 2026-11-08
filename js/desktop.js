/* Retro desktop with independent apps. Closing a window never powers off the PC. */
window.Desktop = (function () {
  var $ = function (s) { return document.querySelector(s); };
  var onShutdown = function () {};
  var active = "home";
  var esc = function (s) { var d=document.createElement("div"); d.textContent=s==null?"":String(s); return d.innerHTML; };
  var safeUrl = function (u) { return /^https?:\/\//i.test(u||"") ? u : "#"; };
  var apps = [
    {id:"home",name:"My Showcase",icon:"▣"},
    {id:"about",name:"About Me",icon:"▤"},
    {id:"projects",name:"Projects",icon:"▦"},
    {id:"contact",name:"Contact",icon:"✉"},
    {id:"notes",name:"Notepad",icon:"▧"},
    {id:"calculator",name:"Calculator",icon:"＋"},
    {id:"terminal",name:"Terminal",icon:">_"}
  ];
  function addDesktopApps() {
    var tray=document.createElement("div"); tray.id="desktop-apps";
    tray.innerHTML=apps.map(function(a){return '<button class="desktop-icon" data-app="'+a.id+'"><span>'+a.icon+'</span><small>'+a.name+'</small></button>';}).join("");
    $("#crt").appendChild(tray);
    tray.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);});
    $("#task").innerHTML='<button id="start-menu" type="button">▦ Start</button><span id="task-items"></span><span id="clk"></span>';
    $("#start-menu").addEventListener("click",function(){var m=$("#start-pop");if(m){m.remove();return;}m=document.createElement("div");m.id="start-pop";m.innerHTML='<b>Programs</b>'+apps.map(function(a){return '<button data-app="'+a.id+'">'+a.icon+' &nbsp;'+a.name+'</button>';}).join("")+'<hr><button data-power="1">⏻ Shut down</button>';$("#crt").appendChild(m);m.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);if(e.target.closest("[data-power]"))onShutdown();m.remove();});});
  }
  function nav(){return '<nav class="app-nav">'+apps.slice(0,4).map(function(a){return '<button data-app="'+a.id+'">'+a.name+'</button>';}).join("")+'</nav>';}
  async function content(p) {
    if(p==="home") return '<section class="hero"><div class="eyebrow">PERSONAL PORTFOLIO / 2026</div><h1>'+esc(CONFIG.name)+'</h1><h3>'+esc(CONFIG.role)+'</h3><p>'+esc(CONFIG.about)+'</p><div class="hero-actions"><button data-app="projects">Explore projects ↗</button><button data-app="contact" class="secondary">Get in touch</button></div><div class="hero-foot">BUILDING DIGITAL THINGS THAT WORK.</div></section>';
    if(p==="about") return '<h2>About me</h2><p>'+esc(CONFIG.about)+'</p><div class="info-grid"><div><b>FOCUS</b><p>Websites · Applications · AI tools</p></div><div><b>BASED ON</b><p>Curiosity, experiments and coffee.</p></div></div>';
    if(p==="experience") return '<h2>Experience</h2><p>Independent developer, learning by building real projects.</p>';
    if(p==="projects") { var list=await Api.projects();return '<h2>Selected projects</h2><div class="project-grid">'+list.map(function(x){return '<article class="project-card"><div class="project-mark">PROJECT / 0'+(list.indexOf(x)+1)+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><div class="project-bottom"><small>'+esc(x.tags||"DIGITAL")+'</small><a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener">OPEN ↗</a></div></article>';}).join("")+'</div>'; }
    if(p==="contact") return '<h2>Let’s build something.</h2><p>Have an idea or want to get in touch? Send a message.</p><p><a href="mailto:'+esc(CONFIG.email)+'">'+esc(CONFIG.email)+'</a>　<a href="'+esc(safeUrl(CONFIG.github))+'" target="_blank" rel="noopener">GitHub ↗</a></p><form id="f" novalidate><div class="form-row"><div><label for="f-name">Name</label><input id="f-name" name="name" required maxlength="100"></div><div><label for="f-email">Email</label><input id="f-email" name="email" type="email" required maxlength="200"></div></div><label for="f-company">Company (optional)</label><input id="f-company" name="company" maxlength="100"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" required maxlength="2000"></textarea><div class="hp"><input name="website" tabindex="-1" autocomplete="off"></div><button type="submit">SEND MESSAGE ↗</button> <span id="st" role="status"></span></form>';
    if(p==="notes") return '<h2>Notepad</h2><p>A little space for thoughts.</p><textarea class="notes-area" placeholder="Write something..."></textarea><small>Notes stay in this browser tab.</small>';
    if(p==="calculator") return '<h2>Calculator</h2><div class="calc"><input id="calc-display" value="0" readonly><div class="calc-keys">'+["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","C","+","="].map(function(k){return '<button data-key="'+k+'">'+k+'</button>';}).join("")+'</div></div>';
    if(p==="terminal") return '<h2>Terminal</h2><div class="terminal"><p>ADAM OS [Version 2026.11]</p><p>Type <b>help</b> to see available commands.</p><div id="term-lines"></div><form id="term-form"><span>guest@adam:~$</span><input id="term-input" autocomplete="off" aria-label="Terminal command"></form></div>';
    return '<h2>'+esc(p)+'</h2>';
  }
  async function openApp(p) {
    active=p;
    $("#win").style.display="grid";
    $("#tb-title").textContent=(apps.find(function(a){return a.id===p;})||{name:p}).name+" — "+CONFIG.name;
    $("#status").textContent="READY  |  "+(apps.find(function(a){return a.id===p;})||{name:p}).name;
    $("#page").innerHTML='<div class="loading">OPENING APPLICATION...</div>';
    var html=await content(p);$("#page").innerHTML=nav()+html;$("#page").scrollTop=0;bind();
    document.querySelectorAll("#task-items button").forEach(function(b){b.classList.toggle("active",b.dataset.app===p);});
  }
  function bind(){
    $("#page").querySelectorAll("[data-app]").forEach(function(b){b.addEventListener("click",function(){openApp(b.dataset.app);});});
    var f=$("#f");if(f)f.addEventListener("submit",submit);
    var tf=$("#term-form");if(tf)tf.addEventListener("submit",function(e){e.preventDefault();var input=$("#term-input"),cmd=input.value.trim();var out=$("#term-lines");out.innerHTML+='<p>guest@adam:~$ '+esc(cmd)+'</p>';var response=cmd==="help"?"Commands: help, about, projects, contact, clear":cmd==="about"?"Developer & Founder. Building web projects.":cmd==="projects"?"Open the Projects app from the desktop.":cmd==="contact"?"Email: "+CONFIG.email:cmd==="clear"?"": "Command not found: "+cmd;if(cmd!=="clear")out.innerHTML+='<p>'+esc(response)+'</p>';else out.innerHTML="";input.value="";});
    var keys=$("#page").querySelectorAll("[data-key]");keys.forEach(function(b){b.addEventListener("click",function(){var d=$("#calc-display"),k=b.dataset.key;if(k==="C")d.value="0";else if(k==="="){try{var expr=d.value.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-");if(!/^[0-9+*/.() -]+$/.test(expr))throw 0;d.value=String(Function('"use strict";return ('+expr+')')());}catch(e){d.value="Error";}}else d.value=d.value==="0"?k:d.value+k;});});
  }
  async function submit(e){
    e.preventDefault();var f=e.target,st=$("#st"),d=new FormData(f),name=(d.get("name")||"").trim(),email=(d.get("email")||"").trim(),msg=(d.get("message")||"").trim();
    if(!name||!msg||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){st.textContent="Please enter your name, a valid email and a message.";return;}
    if(d.get("website")){st.textContent="Thanks, message received.";f.reset();return;}
    st.textContent="Sending...";
    var r=await Api.sendMessage({name:name,email:email,company:(d.get("company")||"").trim()||null,message:msg});
    if(r.error){st.textContent="Sending failed. Please try again later.";return;}
    st.textContent="Message sent. Thank you!";f.reset();
  }
  function init(shutdownCb){
    onShutdown=shutdownCb;addDesktopApps();
    $("#x").addEventListener("click",function(){ $("#win").style.display="none"; $("#status").textContent="DESKTOP READY";});
    $("#tb").querySelectorAll(".b")[0].addEventListener("click",function(){$("#win").style.display="none";});
    var tick=function(){$("#clk").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});};tick();setInterval(tick,1000);
  }
  return {init:init,open:function(){ $("#screen").style.display="grid";openApp("home");},close:function(){ $("#screen").style.display="none";}};
})();