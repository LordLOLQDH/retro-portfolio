/* 3D-Büro mit sicherem 2D-Fallback für Browser ohne WebGL. */
(function(){
 var $=function(s){return document.getElementById(s);};
 var touchLayout=window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
 var hasScene=false,state="boot",joyActive=false;
 document.title=CONFIG.name+" – "+CONFIG.role;
 $("start-title").textContent=CONFIG.name+" / DIGITALE ARBEITSWELT";
 $("hud-name").textContent=CONFIG.name;$("hud-role").textContent=CONFIG.role;
 Desktop.init(shutdown);
 function initRoom(){
  if(hasScene)return true;
  try{
   if(!window.THREE||!window.Scene)return false;
   hasScene=Scene.init()===true;
   if(hasScene){Scene.onMonitor(enterMonitor);Scene.setMode("room");}
  }catch(error){hasScene=false;}
  return hasScene;
 }
 function showRoom(){
  if(!initRoom()){ $("room-toggle").textContent="3D nicht verfügbar";return false; }
  $("screen").style.display="none";$("room-toggle").style.display="none";
  $("hud").style.display="block";$("hint").style.display="block";
  $("hint").textContent="PC antippen zum Starten · Joystick zum Bewegen";
  if(touchLayout)$("joystick").style.display="block";
  state="walk";Scene.setMode("walk");return true;
 }
 function enterMonitor(){
  if(state!=="room")return;
  state="zoom";$("hint").style.display="none";$("hud").style.display="none";
  $("joystick").style.display="none";$("leave-monitor").style.display="block";
  Scene.setMode("zoom");setTimeout(function(){if(state==="zoom")Desktop.open();},700);
 }
 function leaveMonitor(){
  if(state!=="zoom")return;
  state="room";Desktop.close();$("leave-monitor").style.display="none";
  $("hud").style.display="block";$("hint").style.display="block";
  if(touchLayout)$("joystick").style.display="block";
  Scene.setMode("walk");
 }
 async function shutdown(){
  Desktop.close();
  if(hasScene){state="room";$("leave-monitor").style.display="none";$("hud").style.display="block";$("hint").style.display="block";if(touchLayout)$("joystick").style.display="block";Scene.setMode("walk");}
  else{$("screen").style.display="grid";$("start").style.display="grid";state="boot";}
 }
 $("leave-monitor").addEventListener("click",leaveMonitor);
 $("go").addEventListener("click",function(e){
  e.stopPropagation();$("start").style.display="none";
  if(showRoom())return;
  $("screen").style.display="grid";Desktop.open();state="desktop";
 });
 $("room-toggle").addEventListener("click",function(e){
  e.stopPropagation();
  if(showRoom())return;
  $("screen").style.display="grid";$("room-toggle").style.display="block";
 });
 // Joystick is an optional touch control. Keyboard movement remains available on desktop.
 var pad=$("joystick"),knob=$("joy-knob");
 function update(e){
  var r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),max=r.width*.32,len=Math.hypot(dx,dy);
  if(len>max){dx=dx/len*max;dy=dy/len*max;}
  knob.style.transform="translate("+dx+"px,"+dy+"px)";Scene.setMove(dx/max,-dy/max);
 }
 pad.addEventListener("pointerdown",function(e){if(!hasScene)return;joyActive=true;pad.setPointerCapture(e.pointerId);update(e);});
 pad.addEventListener("pointermove",function(e){if(joyActive)update(e);});
 function stopJoy(){joyActive=false;knob.style.transform="translate(0,0)";if(hasScene)Scene.setMove(0,0);}
 pad.addEventListener("pointerup",stopJoy);pad.addEventListener("pointercancel",stopJoy);pad.addEventListener("lostpointercapture",stopJoy);
 Bios.run().then(function(){$("start").style.display="grid";$("go").focus();}).catch(function(){
  $("bios").style.display="none";$("start").style.display="grid";
 });
})();