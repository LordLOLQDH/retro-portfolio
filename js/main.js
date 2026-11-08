/* Boot sequence -> safe desktop fallback -> optional 3D room. */
(function(){
 var $=function(s){return document.getElementById(s);},hasScene=false,state="boot";
 var touchLayout=window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
 document.title=CONFIG.name+" – "+CONFIG.role;
 $("start-title").textContent=CONFIG.name+" / DIGITAL WORKSPACE";
 $("hud-name").textContent=CONFIG.name;$("hud-role").textContent=CONFIG.role;
 Desktop.init(shutdown);
 function enterDesk(){
  if(!hasScene){$("screen").style.display="grid";Desktop.open();state="desktop";return;}
  state="zoom";$("hint").style.display="none";$("hud").style.display="block";
  Scene.setMode("zoom");setTimeout(function(){Desktop.open();},900);
 }
 async function shutdown(){
  state="shutdown";Desktop.close();
  if(!hasScene){$("start").style.display="grid";state="boot";return;}
  var sd=$("sd");sd.style.display="block";sd.textContent="";
  await Bios.type(sd,"Shutting down the virtual workstation...\nSaving session... Done.\nPowering off display...\n",18);
  await Bios.sleep(700);sd.style.display="none";Scene.screenVisible(true);
  $("hud").style.display="none";Scene.setMode("idle");state="idle";$("hint").style.display="block";
 }
 $("go").addEventListener("click",function(e){
  e.stopPropagation();$("start").style.display="none";
  // Touch devices skip WebGL entirely: Safari/iOS gets the usable desktop directly.
  if(!touchLayout){
   try{hasScene=Scene.init();}catch(error){hasScene=false;}
  }
  if(!hasScene){$("screen").style.display="grid";Desktop.open();state="desktop";return;}
  Scene.setMode("idle");state="idle";$("hint").style.display="block";
 });
 document.addEventListener("click",function(e){
  if(state==="idle"&&(e.target===$("hint")||e.target===document.body||e.target.tagName==="CANVAS"))enterDesk();
 });
 Bios.run().then(function(){$("start").style.display="grid";$("go").focus();}).catch(function(){
  $("bios").style.display="none";$("start").style.display="grid";
 });
})();