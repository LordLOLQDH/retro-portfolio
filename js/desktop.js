/* Retro desktop: working mini-apps, persistent notes, robust contact form. */
window.Desktop=(function(){
 var $=function(s){return document.querySelector(s);},onShutdown=function(){},active="home",githubRefreshTimer=null,calc={stored:null,op:null,reset:false};
 var esc=function(s){var d=document.createElement("div");d.textContent=s==null?"":String(s);return d.innerHTML;};
 var safeUrl=function(u){return /^https?:\/\//i.test(u||"")?u:"#";};
 var apps=[{id:"home",name:"Meine Projekte",icon:"▣"},{id:"about",name:"Über mich",icon:"▤"},{id:"projects",name:"Projekte",icon:"▦"},{id:"contact",name:"Kontakt",icon:"✉"},{id:"github",name:"GitHub",icon:"GH"},{id:"notes",name:"Notizen",icon:"▧"},{id:"calculator",name:"Taschenrechner",icon:"＋"},{id:"terminal",name:"Terminal",icon:">_"}];
 function appName(id){return (apps.find(function(a){return a.id===id;})||{name:id}).name;}
 function addDesktopApps(){
  var tray=document.createElement("div");tray.id="desktop-apps";
  tray.innerHTML=apps.map(function(a){return '<button class="desktop-icon" type="button" data-app="'+a.id+'"><span>'+a.icon+'</span><small>'+a.name+'</small></button>';}).join("");
  $("#crt").appendChild(tray);
  tray.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);});
  $("#task").innerHTML='<button id="start-menu" type="button">▦ Start</button><span id="task-items"></span><span id="clk"></span>';
  $("#start-menu").addEventListener("click",function(){var m=$("#start-pop");if(m){m.remove();return;}m=document.createElement("div");m.id="start-pop";m.innerHTML='<b>Programme</b>'+apps.map(function(a){return '<button type="button" data-app="'+a.id+'">'+a.icon+' &nbsp;'+a.name+'</button>';}).join("")+'<hr><button type="button" data-power="1">⏻ PC herunterfahren</button>';$("#crt").appendChild(m);m.addEventListener("click",function(e){var b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app);if(e.target.closest("[data-power]"))onShutdown();m.remove();});});
 }
 function nav(){return '<nav class="app-nav">'+apps.slice(0,5).map(function(a){return '<button type="button" data-app="'+a.id+'">'+a.name+'</button>';}).join("")+'</nav>';}
 async function content(p){
  if(p==="home")return '<section class="hero"><div class="eyebrow">PERSÖNLICHES PORTFOLIO / 2026</div><h1>'+esc(CONFIG.name)+'</h1><h3>'+esc(CONFIG.role)+'</h3><p>'+esc(CONFIG.about)+'</p><div class="hero-actions"><button type="button" data-app="projects">Projekte ansehen ↗</button><button type="button" data-app="contact" class="secondary">Kontakt aufnehmen</button></div><div class="hero-foot">ICH ENTWICKLE DIGITALE PROJEKTE.</div></section>';
  if(p==="about")return '<h2>Über mich</h2><p>'+esc(CONFIG.about)+'</p><div class="info-grid"><div><b>SCHWERPUNKTE</b><p>Websites · Anwendungen · KI-Werkzeuge</p></div><div><b>ARBEITSWEISE</b><p>Neugier, Experimente und echte digitale Produkte.</p></div></div>';
  if(p==="projects"){var list=await Api.projects();return '<h2>Ausgewählte Projekte</h2><div class="project-grid">'+list.map(function(x,i){return '<article class="project-card"><div class="project-mark">PROJEKT / '+String(i+1).padStart(2,"0")+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><div class="project-bottom"><small>'+esc(x.tags||"DIGITAL")+'</small><a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener">ÖFFNEN ↗</a></div></article>';}).join("")+'</div>';}
  if(p==="contact")return '<h2>Lass uns etwas entwickeln.</h2><p>Du hast eine Idee oder möchtest Kontakt aufnehmen? Schreib mir eine Nachricht.</p><p><a href="mailto:'+esc(CONFIG.email)+'">'+esc(CONFIG.email)+'</a>　<a href="'+esc(safeUrl(CONFIG.github))+'" target="_blank" rel="noopener">GitHub ↗</a></p><form id="f" novalidate><div class="form-row"><div><label for="f-name">Dein Name</label><input id="f-name" name="name" required maxlength="100" autocomplete="name"></div><div><label for="f-email">Deine E-Mail-Adresse</label><input id="f-email" name="email" type="email" required maxlength="200" autocomplete="email"></div></div><label for="f-company">Unternehmen (optional)</label><input id="f-company" name="company" maxlength="100" autocomplete="organization"><label for="f-msg">Nachricht</label><textarea id="f-msg" name="message" rows="4" required maxlength="2000"></textarea><div class="hp"><input name="_honey" tabindex="-1" autocomplete="off"></div><button id="send-btn" type="submit">NACHRICHT SENDEN ↗</button> <span id="st" role="status" aria-live="polite"></span></form>';
  if(p==="github")return '<h2>GitHub</h2><p>Verbinde dein GitHub-Konto, folge Adam direkt über diesen PC und sieh dir die aktuellen Profilzahlen an.</p><div class="github-stats"><div><strong id="github-followers">…</strong><span>Follower</span></div><div><strong id="github-repos">…</strong><span>öffentliche Repositories</span></div></div><div class="github-account"><p id="github-state" role="status" aria-live="polite">GitHub-Daten werden geladen …</p><button id="github-login" type="button">Mit GitHub anmelden</button><button id="github-follow" type="button" hidden>Adam auf GitHub folgen</button><button id="github-logout" type="button" hidden>Abmelden</button><p><a href="https://github.com/LordLOLQDH" target="_blank" rel="noopener">GitHub-Profil öffnen ↗</a></p></div>';
  if(p==="notes")return '<h2>Notizen</h2><p>Deine Notizen werden automatisch auf diesem Gerät gespeichert.</p><textarea id="notes-area" class="notes-area" placeholder="Schreibe hier etwas ..."></textarea><div id="notes-status" class="small-status">Lokal auf diesem Gerät gespeichert.</div>';
  if(p==="calculator")return '<h2>Taschenrechner</h2><div class="calc"><input id="calc-display" value="0" readonly aria-label="Taschenrechneranzeige"><div class="calc-keys">'+["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","C","+","="].map(function(k){return '<button type="button" data-key="'+k+'">'+k+'</button>';}).join("")+'</div></div>';
  if(p==="terminal")return '<h2>Terminal</h2><div class="terminal"><p>ADAM OS [Version 2026.11]</p><p>Gib <b>help</b> ein, um die Befehle anzuzeigen.</p><div id="term-lines"></div><form id="term-form"><label for="term-input">gast@adam:~$</label><input id="term-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminalbefehl"></form></div>';
  return '<h2>'+esc(p)+'</h2>';
 }
 async function openApp(p){
  active=p;$("#win").style.display="grid";$("#tb-title").textContent=appName(p)+" — "+CONFIG.name;$("#status").textContent="BEREIT  |  "+appName(p);$("#page").innerHTML='<div class="loading">ANWENDUNG WIRD GEÖFFNET...</div>';
  var html=await content(p);if(active!==p)return;$("#page").innerHTML=nav()+html;$("#page").scrollTop=0;bind();if(githubRefreshTimer){clearInterval(githubRefreshTimer);githubRefreshTimer=null;}if(p==="github")bindGithub();
  $("#task-items").innerHTML='<button type="button" class="active" data-app="'+p+'">'+appName(p)+'</button>';
  document.querySelectorAll("#desktop-apps [data-app]").forEach(function(b){b.classList.toggle("selected",b.dataset.app===p);});
 }
 async function bindGithub(){
  var followers=$("#github-followers"),repos=$("#github-repos"),state=$("#github-state"),login=$("#github-login"),follow=$("#github-follow"),logout=$("#github-logout");
  async function loadStats(){
   try{
    var response=await fetch("https://api.github.com/users/"+CONFIG.githubUser,{headers:{"Accept":"application/vnd.github+json"}});
    if(!response.ok)throw new Error("GitHub-Profil konnte nicht geladen werden.");
    var profile=await response.json();followers.textContent=Number(profile.followers||0).toLocaleString("de-DE");repos.textContent=Number(profile.public_repos||0).toLocaleString("de-DE");
   }catch(e){followers.textContent="–";repos.textContent="–";}
  }
  async function loadSession(){
   var result=await Api.githubSession(),session=result.session;
   if(result.error&&!session){state.textContent="GitHub-Anmeldung ist noch nicht eingerichtet. In Supabase muss der GitHub-Anbieter aktiviert werden.";login.hidden=false;follow.hidden=true;logout.hidden=true;return null;}
   if(!session){state.textContent="Du bist nicht angemeldet.";login.hidden=false;follow.hidden=true;logout.hidden=true;return null;}
   var who=session.user&&((session.user.user_metadata&& (session.user.user_metadata.user_name||session.user.user_metadata.full_name))||session.user.email)||"GitHub-Konto";
   state.textContent="Angemeldet als "+who+".";login.hidden=true;logout.hidden=false;
   if(!session.provider_token){follow.hidden=true;state.textContent+=" Für das Folgen fehlt die GitHub-Berechtigung. Bitte erneut anmelden und user:follow erlauben.";return session;}
   try{
    var check=await fetch("https://api.github.com/user/following/"+CONFIG.githubUser,{headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer "+session.provider_token,"X-GitHub-Api-Version":"2022-11-28"}});
    if(check.status===204){follow.hidden=true;state.textContent+=" Du folgst Adam bereits.";}
    else if(check.status===404){follow.hidden=false;follow.textContent="Adam auf GitHub folgen";}
    else if(check.status===401||check.status===403){follow.hidden=true;state.textContent+=" GitHub hat die Berechtigung user:follow nicht bestätigt.";}
    else{follow.hidden=false;}
   }catch(e){follow.hidden=false;}
   return session;
  }
  login.addEventListener("click",async function(){login.disabled=true;state.textContent="Weiterleitung zu GitHub …";var r=await Api.githubSignIn();if(r.error){state.textContent="Anmeldung fehlgeschlagen: "+r.error.message;login.disabled=false;}});
  follow.addEventListener("click",async function(){
   follow.disabled=true;state.textContent="GitHub-Folge wird eingerichtet …";
   try{
    var r=await Api.githubSession(),token=r.session&&r.session.provider_token;if(!token)throw new Error("Bitte zuerst erneut mit GitHub anmelden.");
    var response=await fetch("https://api.github.com/user/following/"+CONFIG.githubUser,{method:"PUT",headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"}});
    if(response.status!==204)throw new Error(response.status===403?"GitHub verweigert die Berechtigung. Melde dich erneut mit user:follow an.":"GitHub konnte dem Follow nicht zustimmen (HTTP "+response.status+").");
    state.textContent="Du folgst Adam jetzt auf GitHub. Danke!";
    follow.hidden=true;loadStats();
   }catch(e){state.textContent=e.message||"Folgen hat nicht funktioniert.";}
   finally{follow.disabled=false;}
  });
  logout.addEventListener("click",async function(){var r=await Api.githubSignOut();if(r.error){state.textContent="Abmelden fehlgeschlagen: "+r.error.message;return;}await loadSession();});
  await loadStats();await loadSession();githubRefreshTimer=setInterval(loadStats,300000);
 }
 function bind(){
  $("#page").querySelectorAll("[data-app]").forEach(function(b){b.addEventListener("click",function(){openApp(b.dataset.app);});});
  var f=$("#f");if(f)f.addEventListener("submit",submit);
  var notes=$("#notes-area");if(notes){try{notes.value=localStorage.getItem("adamPortfolioNotes")||"";}catch(e){}notes.addEventListener("input",function(){try{localStorage.setItem("adamPortfolioNotes",notes.value);$("#notes-status").textContent="Saved automatically.";}catch(e){$("#notes-status").textContent="Could not save on this device.";}});}
  var tf=$("#term-form");if(tf)tf.addEventListener("submit",function(e){e.preventDefault();var input=$("#term-input"),cmd=input.value.trim().toLowerCase(),out=$("#term-lines");out.innerHTML+='<p>gast@adam:~$ '+esc(input.value.trim())+'</p>';var response=cmd==="help"?"Befehle: help, about, projects, contact, clear":cmd==="about"?"Entwickler & Gründer. Entwickelt Webprojekte.":cmd==="projects"?"Öffne die App „Projekte“ auf dem Desktop.":cmd==="contact"?"E-Mail: "+CONFIG.email:cmd==="clear"?"":"Befehl nicht gefunden: "+cmd;if(cmd!=="clear")out.innerHTML+='<p>'+esc(response)+'</p>';else out.innerHTML="";input.value="";});
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
  if(!name||!msg||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){st.textContent="Bitte gib deinen Namen, eine gültige E-Mail-Adresse und eine Nachricht ein.";return;}
  if(d.get("_honey")){st.textContent="Danke, deine Nachricht wurde angenommen.";f.reset();return;}
  btn.disabled=true;st.textContent="Wird gesendet ...";
  try{var payload=new FormData(f);payload.set("_subject","Neue Portfolio-Nachricht von "+name);payload.set("_template","table");payload.set("_captcha","false");var response=await fetch("https://formsubmit.co/ajax/"+encodeURIComponent(CONFIG.privateEmail),{method:"POST",body:payload,headers:{"Accept":"application/json"}});var result=await response.json();if(!response.ok||result.success===false){throw new Error(result.message||"E-Mail-Versand fehlgeschlagen");}if(Api.ready){try{await Api.sendMessage({name:name,email:email,company:(d.get("company")||"").trim()||null,message:msg});}catch(ignore){}}st.textContent="Nachricht wurde an Adam gesendet. Vielen Dank!";f.reset();}
  catch(err){st.textContent="Senden fehlgeschlagen. Bitte versuche es später erneut oder schreib an "+CONFIG.email+".";}
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