/* Boot sequence -> room view -> animated monitor -> interactive desktop. */
(function(){
 var $=function(s){return document.getElementById(s);},hasScene=false,state="boot";
 document.title=CONFIG.name+" – "+CONFIG.role;
 $("start-title").textContent=CONFIG.name+" / DIGITAL WORKSPACE";
 $("hud-name").textContent=CONFIG.name;$("hud-role").textContent=CONFIG.role;
 Desktop.init(shutdown);
 function enterDesk(){state="zoom";$("hint").style.display="none";$("hud").style.display="block";Scene.setMode("zoom");setTimeout(function(){Desktop.open();},1500);}
 async function shutdown(){state="shutdown";Desktop.close();var sd=$("sd");sd.style.display="block";sd.textContent="";await Bios.type(sd,"Shutting down the virtual workstation...\nSaving session... Done.\nPowering off display...\n",18);await Bios.sleep(900);sd.style.display="none";Scene.screenVisible(true);$("hud").style.display="none";Scene.setMode("idle");state="idle";$("hint").style.display="block";}
 $("go").addEventListener("click",function(e){e.stopPropagation();$("start").style.display="none";hasScene=Scene.init();if(!hasScene){$("screen").style.display="grid";Desktop.open();return;}Scene.setMode("idle");state="idle";$("hint").style.display="block";});
 document.addEventListener("click",function(e){if(state==="idle"&&(e.target===$("hint")||e.target===document.body||e.target.tagName==="CANVAS"))enterDesk();});
 Bios.run().then(function(){$("start").style.display="grid";$("go").focus();});
})();