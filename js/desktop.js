/* Retro desktop: working mini-apps, persistent notes, robust contact form. */
window.Desktop=(function(){
 var $=function(s){return document.querySelector(s);},onShutdown=function(){},active="home",calc={stored:null,op:null,reset:false};
 var esc=function(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML;};
 var safeUrl=function(u){return /^https?:\/\//i.test(u||"")?u:"#";};
 var apps=[{id:"home",name:"My Showcase",icon:"▣"},{id:"about",name:"About Me",icon:"▤"},{id:"projects",name:"Projects",icon:"▦"},{id:"contact",name:"Contact",icon:"✉"},{id:"notes",name:"Notepad",icon:"▧"},{id:"calculator",name:"Calculator",icon:"＋"},{id:"terminal",name:"Terminal",icon:">_"}];
 function appName(id){return (apps.find(function(a){return a.id===id;})||{name:id}).name;}
 function addDesktopApps(){
  var tray=document.createElement("div");tray.id="desktop-apps";
  tray.innerHTML=apps.map(function(a){return '<button class="desktop-icon" type="button" data-app="'+a.id+'"><span>'+a.icon+'</span><small>'+a.name+'</small></button>';}).join("");
  $("#crt").appendChild(tray);
  tray.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);});
  $("#task").innerHTML='<button id="start-menu" type="button">▦ Start</button><span id="task-items"></span><span id="clk"></span>';
  $("#start-menu").addEventListener("click",function(){var m=$("#start-pop");if(m){m.remove();return;}m=document.createElement("div");m.id="start-pop";m.innerHTML='<b>Programs</b>'+apps.map(function(a){return '<button type="button" data-app="'+a.id+'">'+a.icon+' &nbsp;'+a.name+'</button>';}).join("")+'<hr><button type="button" data-power="1">⏻ Shut down</button>';$("#crt").appendChild(m);m.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);if(e.target.closest("[data-power]"))onShutdown();m.remove();});});
 }
 function nav(){return '<nav class="app-nav">'+apps.slice(0,4).map(function(a){return '<button type="button" data-app="'+a.id+'">'+a.name+'</button>';}).join("")+'</nav>';}
 async function content(p){
  if(p==="home")return '<section class="hero"><div class="eyebrow">PERSONAL PORTFOLIO / 2026</div><h1>'+esc(CONFIG.name)+'</h1><h3>'+esc(CONFIG.role)+'</h3><p>'+esc(CONFIG.about)+'</p><div class="hero-actions"><button type="button" data-app="projects">Explore projects ↗</button><button type="button" data-app="contact" class="secondary">Get in touch</button></div><div class="hero-foot">BUILDING DIGITAL THINGS THAT WORK.</div></section>';
  if(p==="about")return '<h2>About me</h2><p>'+esc(CONFIG.about)+'</p><div class="info-grid"><div><b>FOCUS</b><p>Websites · Applications · AI tools</p></div><div><b>APPROACH</b><p>Curiosity, experiments and building real products.</p></div></div>';
  if(p==="projects"){var list=await Api.projects();return '<h2>Selected projects</h2><div class="project-grid">'+list.map(function(x,i){return '<article class="project-card"><div class="project-mark">PROJECT / '+String(i+1).padStart(2,"0")+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><div class="project-bottom"><small>'+esc(x.tags||"DIGITAL")+'</small><a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener">OPEN ↗</a></div></article>';}).join("")+'</div>';}
  if(p==="contact")return '<h2>Let’s build something.</h2><p>Have an idea or want to get in touch? Send a message.</p><p><a href="mailto:'+esc(CONFIG.email)+'">'+esc(CONFIG.email)+'</a>　<a href="'+esc(safeUrl(CONFIG.github))+'" target="_blank" rel="noopener">GitHub ↗</a></p><form id="f" novalidate><div class="form-row"><div><label for="f-name">Name</label><input id="f-name" name="name" required maxlength="100" autocomplete="name"></div><div><label for="f-email">Email</label><input id="f-email" name="email" type="email" required maxlength="200" autocomplete="email"></div></div><label for="f-company">Company (optional)</label><input id="f-company" name="company" maxlength="100" autocomplete="organization"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" required maxlength="2000"></textarea><div class="hp"><input name="website" tabindex="-1" autocomplete="off"></div><button id="send-btn" type="submit">SEND MESSAGE ↗</button> <span id="st" role="status" aria-live="polite"></span></form>';
  if(p==="notes")return '<h2>Notepad</h2><p>Your notes are saved automatically on this device.</p><textarea id="notes-area" class="notes-area" placeholder="Write something..."></textarea><div id="notes-status" class="small-status">Saved locally on this device.</div>';
  if(p==="calculator")return '<h2>Calculator</h2><div class="calc"><input id="calc-display" value="0" readonly aria-label="Calculator display"><div class="calc-keys">'+["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","C","+","="].map(function(k){return '<button type="button" data-key="'+k+'">'+k+'</button>';}).join("")+'</div></div>';
  if(p==="terminal")return '<h2>Terminal</h2><div class="terminal"><p>ADAM OS [Version 2026.11]</p><p>Type <b>help</b> to see available commands.</p><div id="term-lines"></div><form id="term-form"><label for="term-input">guest@adam:~$</label><input id="term-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></form></div>';
  return '<h2>'+esc(p)+'</h2>';
 }
 async function openApp(p){
  active=p;$("#win").style.display="grid";$("#tb-title").textContent=appName(p)+" — "+CONFIG.name;$("#status").textContent="READY  |  "+appName(p);$("#page").innerHTML='<div class="loading">OPENING APPLICATION...</div>';
  var html=await content(p);if(active!==p)return;$("#page").innerHTML=nav()+html;$("#page").scrollTop=0;bind();
  $("#task-items").innerHTML='<button type="button" class="active" data-app="'+p+'">'+appName(p)+'</button>';
  document.querySelectorAll("#desktop-apps [data-app]").forEach(function(b){b.classList.toggle("selected",b.dataset.app===p);});
 }
 function bind(){
  $("#page").querySelectorAll("[data-app]").forEach(function(b){b.addEventListener("click",function(){openApp(b.dataset.app);});});
  var f=$("#f");if(f)f.addEventListener("submit",submit);
  var notes=$("#notes-area");if(notes){try{notes.value=localStorage.getItem("adamPortfolioNotes")||"";}catch(e){}notes.addEventListener("input",function(){try{localStorage.setItem("adamPortfolioNotes",notes.value);$("#notes-status").textContent="Saved automatically.";}catch(e){$("#notes-status").textContent="Could not save on this device.";}});}
  var tf=$("#term-form");if(tf)tf.addEventListener("submit",function(e){e.preventDefault();var input=$("#term-input"),cmd=input.value.trim().toLowerCase(),out=$("#term-lines");out.innerHTML+='<p>guest@adam:~$ '+esc(input.value.trim())+'</p>';var response=cmd==="help"?"Commands: help, about, projects, contact, clear":cmd==="about"?"Developer & Founder. Building web projects.":cmd==="projects"?"Open the Projects app from the desktop.":cmd==="contact"?"Email: "+CONFIG.email:cmd==="clear"?"":"Command not found: "+cmd;if(cmd!=="clear")out.innerHTML+='<p>'+esc(response)+'</p>';else out.innerHTML="";input.value="";});
  $("#page").querySelectorAll("[data-key]").forEach(function(b){b.addEventListener("click",function(){calcKey(b.dataset.key);});});
 }
 function calcKey(k){
  var d=$("#calc-display");if(!d)return;var v=d.value;
  if(k==="C"){calc={stored:null,op:null,reset:false};d.value="0";return;}
  if(k==="="){if(calc.op&&calc.stored!==null){var a=calc.stored,b=Number(v),r=calc.op==="+"?a+b:calc.op==="−"?a-b:calc.op==="×"?a*b:b===0?NaN:a/b;d.value=Number.isFinite(r)?String(Number(r.toPrecision(10))):"Error";calc.stored=null;calc.op=null;calc.reset=true;}return;}
  if(["+","−","×","÷"].indexOf(k)>=0){if(v==="Error")return;if(calc.op&&calc.stored!==null){calcKey("=");v=d.value;}calc.stored=Number(v);calc.op=k;calc.reset=true;return;}
  if(k==="."){if(calc.reset){d.value="0.";calc.reset=false;}else if(v.indexOf(".")<0)d.value=v+".";return;}
  if(calc.reset||v==="0"||v==="Error"){d.value=k;calc.reset=false;}else if(v.length<14)d.value=v+k;
 }
 async function submit(e){
  e.preventDefault();var f=e.target,st=$("#st"),btn=$("#send-btn"),d=new FormData(f),name=(d.get("name")||"").trim(),email=(d.get("email")||"").trim(),msg=(d.get("message")||"").trim();
  if(!name||!msg||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){st.textContent="Please enter your name, a valid email and a message.";return;}
  if(d.get("website")){st.textContent="Thanks, message received.";f.reset();return;}
  if(!Api.ready){st.textContent="The contact service is temporarily unavailable. Please email "+CONFIG.email+".";return;}
  btn.disabled=true;st.textContent="Sending...";
  try{var r=await Api.sendMessage({name:name,email:email,company:(d.get("company")||"").trim()||null,message:msg});if(r.error){st.textContent="Sending failed. Please email "+CONFIG.email+".";return;}st.textContent="Message sent. Thank you!";f.reset();}
  catch(err){st.textContent="Network error. Please try again or email "+CONFIG.email+".";}
  finally{btn.disabled=false;}
 }
 function init(shutdownCb){
  onShutdown=shutdownCb;addDesktopApps();
  $("#x").addEventListener("click",function(){$("#win").style.display="none";$("#status").textContent="DESKTOP READY";});
  var controls=$("#tb").querySelectorAll(".b");if(controls[0])controls[0].addEventListener("click",function(){$("#win").style.display="none";});
  if(controls[1])controls[1].addEventListener("click",function(){$("#win").classList.toggle("maximized");});
  var tick=function(){$("#clk").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});};tick();setInterval(tick,1000);
 }
 return {init:init,open:function(){$("#screen").style.display="grid";openApp("home");},close:function(){$("#screen").style.display="none";}};
})();