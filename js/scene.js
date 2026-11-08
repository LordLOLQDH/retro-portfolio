/* 3D desk scene with a continuously animated CRT display texture. */
window.Scene=(function(){
 var renderer,scene,camera,screenMesh,screenCanvas,screenCtx,screenTexture,screenPowered=false,mode="room",t=0,player=new THREE.Vector3(0,0,4.2),move={x:0,y:0},keys={},onMonitor=function(){};
 var idlePos=new THREE.Vector3(4.2,3.1,5.2),lookAtHome=new THREE.Vector3(0,1.2,0),zoomPos=new THREE.Vector3(0,1.82,1.45),zoomLook=new THREE.Vector3(0,1.82,0),curLook=lookAtHome.clone(),targetPos=idlePos.clone();
 function mat(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r});}
 function box(w,h,d,x,y,z,m,parent){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(parent||scene).add(o);return o;}
 function cyl(rt,rb,h,seg,m,x,y,z,parent){var o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);o.position.set(x,y,z);o.castShadow=true;(parent||scene).add(o);return o;}
 function drawScreen(now){
   if(!screenCtx)return;var c=screenCtx,w=c.canvas.width,h=c.canvas.height;
   if(!screenPowered){c.fillStyle="#050607";c.fillRect(0,0,w,h);screenTexture.needsUpdate=true;return;}
   c.fillStyle="#f7f8fa";c.fillRect(0,0,w,h);
   c.fillStyle="#183c73";c.fillRect(0,0,w,34);
   c.fillStyle="#fff";c.font="bold 11px Arial";c.fillText("ADAM KRAUS  /  DIGITALE ARBEITSWELT",16,22);
   c.fillStyle="#a16c2c";c.font="bold 9px Arial";c.fillText("PERSÖNLICHES PORTFOLIO / "+String(CONFIG.year||2026),18,62);
   c.fillStyle="#11151b";c.font="bold 34px Arial";c.fillText(CONFIG.name||"Adam Kraus",18,112);
   c.fillStyle="#68717d";c.font="16px Arial";c.fillText(CONFIG.role||"Developer & Founder",18,139);
   c.fillStyle="#596575";c.font="11px Arial";
   var words=(CONFIG.about||"I build websites, web applications and digital tools.").split(" "),line="",y=168;
   words.forEach(function(word){var test=line?line+" "+word:word;if(c.measureText(test).width>430){c.fillText(line,18,y);line=word;y+=17;}else line=test;});
   if(line)c.fillText(line,18,y);
   c.fillStyle="#183c73";c.fillRect(18,228,106,27);c.fillStyle="#fff";c.font="bold 9px Arial";c.fillText("PROJEKTE ANSEHEN",25,245);
   c.fillStyle="#e4e8ed";c.fillRect(132,228,96,27);c.fillStyle="#25364a";c.fillText("KONTAKT",143,245);
   c.fillStyle="#d9dee5";c.fillRect(18,274,w-36,1);
   c.fillStyle="#9aa2ac";c.font="bold 8px Arial";c.fillText("ICH ENTWICKLE DIGITALE PROJEKTE.",18,296);
   c.fillStyle="#183c73";c.fillRect(18,h-30,Math.max(30,(now/45)%110),3);
   c.fillStyle="#68717d";c.font="9px Arial";c.fillText("PC ANTIPPEN, UM IHN ZU STARTEN",18,h-12);
   screenTexture.needsUpdate=true;
 }
 function build(){
   scene.background=new THREE.Color(0x171d25);scene.fog=new THREE.Fog(0x171d25,10,24);
   scene.add(new THREE.HemisphereLight(0xe5e9f0,0x45404a,1.1));
   var key=new THREE.DirectionalLight(0xffe5c2,2);key.position.set(-3,6,4);key.castShadow=true;scene.add(key);
   var fill=new THREE.PointLight(0x6f9bc8,12,8);fill.position.set(2,3,2);scene.add(fill);
   
   // Small, enclosed developer office: three walls, window, shelving, door and plants.
   var wall=mat(0x59616a,.95),trim=mat(0x252c34,.7),glass=new THREE.MeshStandardMaterial({color:0x79a9c7,roughness:.22,metalness:.08}),wood=mat(0x624735,.75),leaf=mat(0x426b4c,.9),pot=mat(0x9b7250,.85);
   var floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),mat(0x343b43,1));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
   box(12,5,.18,0,2.5,-6,wall);box(.18,5,12,-6,2.5,0,wall);box(.18,5,12,6,2.5,0,wall);
   box(12,.16,.22,0,.12,-5.86,trim);box(.22,.16,12,-5.86,.12,0,trim);box(.22,.16,12,5.86,.12,0,trim);
   // Wide window and its frame on the back wall.
   box(3.25,2.25,.12,-2.25,3.05,-5.84,trim);box(3.02,2.02,.06,-2.25,3.05,-5.75,glass);
   box(.07,2.08,.08,-2.25,3.05,-5.68,trim);box(3.08,.07,.08,-2.25,3.05,-5.68,trim);
   box(3.5,.12,.3,-2.25,1.88,-5.62,wood);
   // Door on the right wall with a handle.
   box(.12,2.35,1.25,5.82,1.2,3.7,wood);box(.04,.12,.12,5.73,1.15,3.25,mat(0xd3b16f,.35));
   // Bookshelf and a few colorful book spines.
   box(.62,2.5,2.1,5.45,1.3,-2.5,wood);
   for(var shelf=0;shelf<4;shelf++){box(.68,.07,2.12,5.38,.35+shelf*.62,-2.5,trim);}
   var bookMats=[mat(0x9b5849),mat(0x3e6680),mat(0xb18a50),mat(0x687b5b),mat(0x6f5b7d)];
   for(var row=0;row<3;row++)for(var book=0;book<7;book++){var bh=.34+(book%3)*.06;box(.12,bh,.16,5.25,.57+row*.62+bh/2,-3.28+book*.25,bookMats[(book+row)%bookMats.length]);}
   // Framed print on the left wall.
   box(.08,1.15,1.65,-5.82,3.05,-1.7,trim);box(.035,.98,1.48,-5.76,3.05,-1.7,mat(0x243d55));
   box(.025,.58,1.08,-5.72,3.05,-1.7,mat(0xc08d4d));
   // Potted plant in the front-left corner.
   cyl(.27,.2,.42,16,pot,-4.75,.22,2.7);
   for(var leafIndex=0;leafIndex<6;leafIndex++){var angle=leafIndex*Math.PI/3;var plantLeaf=cyl(.045,.12,.85,7,leaf,-4.75+Math.cos(angle)*.2,.78,2.7+Math.sin(angle)*.2);plantLeaf.rotation.z=Math.cos(angle)*.35;plantLeaf.rotation.x=Math.sin(angle)*.35;}

   var desk=mat(0x392d27,.55),edge=mat(0x211b19),plastic=mat(0xaaa9a0,.42),dark=mat(0x26292d,.35);
   box(3.6,.13,1.6,0,1,0,desk);box(3.65,.035,1.64,0,.91,0,edge);
   [[-1.6,-.65],[-1.6,.65],[1.6,-.65],[1.6,.65]].forEach(function(p){box(.09,1,.09,p[0],.45,p[1],edge);});
   // CRT casing and curved-looking inset screen
   box(1.12,.94,.92,0,1.78,0,plastic);
   box(1.02,.84,.06,0,1.8,.48,dark);
   screenCanvas=document.createElement("canvas");screenCanvas.width=480;screenCanvas.height=360;screenCtx=screenCanvas.getContext("2d");
   screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;
   var screenMat=new THREE.MeshBasicMaterial({map:screenTexture});
   screenMesh=new THREE.Mesh(new THREE.PlaneGeometry(.86,.64),screenMat);screenMesh.position.set(0,1.81,.516);scene.add(screenMesh);
   box(.16,.16,.08,0,1.3,.06,plastic);box(.66,.06,.46,0,1.08,.1,plastic);
   cyl(.025,.025,.28,12,dark,0,1.0,.1);
   // keyboard and mouse
   box(.78,.045,.28,-.1,1.08,.65,plastic);for(var i=0;i<4;i++)box(.68,.008,.035,-.1,1.107,.55+i*.055,mat(0x777a7b));
   box(.16,.07,.23,.65,1.1,.65,plastic);
   // speakers and accessories
   box(.22,.48,.28,-.83,1.27,.03,dark);box(.22,.48,.28,.83,1.27,.03,dark);
   cyl(.075,.075,.025,16,mat(0x555a60),-.83,1.32,.18);cyl(.075,.075,.025,16,mat(0x555a60),.83,1.32,.18);
   // paper stack
   box(.5,.035,.38,-1.3,1.09,.2,mat(0xe4e0d4));box(.48,.03,.36,-1.3,1.13,.2,mat(0xf3f0e8));
   // small desk lamp
   cyl(.16,.16,.06,16,dark,1.35,1.08,-.35);cyl(.035,.035,.48,10,plastic,1.35,1.32,-.35);cyl(.22,.12,.18,16,mat(0xc69b59),1.35,1.57,-.35);
   var chair=new THREE.Group();scene.add(chair);box(.72,.12,.72,.0,0,0,mat(0x282e35),chair);box(.1,.72,.58,.34,.4,0,mat(0x282e35),chair);cyl(.04,.04,.55,8,dark,0,-.3,0,chair);chair.position.set(.55,.83,1.65);chair.rotation.y=-.5;
 }
 function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;idlePos.z=camera.aspect<1?8.5:5.2;camera.updateProjectionMatrix();}
 function loop(now){requestAnimationFrame(loop);drawScreen(now||0);var dest,k;
   if(mode==="zoom"){dest=zoomPos;k=.07;camera.position.lerp(dest,k);curLook.lerp(zoomLook,k);}
   else {var dx=move.x, dz=move.y;
     if(keys.ArrowLeft||keys.a)dx-=1;if(keys.ArrowRight||keys.d)dx+=1;
     if(keys.ArrowUp||keys.w)dz-=1;if(keys.ArrowDown||keys.s)dz+=1;
     var len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;
     var nx=THREE.MathUtils.clamp(player.x+dx*.055,-4.4,4.4),nz=THREE.MathUtils.clamp(player.z+dz*.055,-4.2,5.2);
     // Keep the player out of the desk itself.
     if(!(Math.abs(nx)<2.05&&nz>-.95&&nz<1.15)){player.x=nx;player.z=nz;}
     if(mode==="room"){dest.set(player.x+2.4,player.y+2.8,player.z+3.0);camera.position.lerp(dest,.075);var look=new THREE.Vector3(player.x,player.y+1.15,player.z-.8);curLook.lerp(look,.09);}
     else{dest.set(player.x,player.y+1.65,player.z+0.02);camera.position.lerp(dest,.16);var look=new THREE.Vector3(player.x,player.y+1.45,player.z-3.5);curLook.lerp(look,.16);}
   }
   camera.lookAt(curLook);renderer.render(scene,camera);
 }
 function init(){try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(e){return false;}
   var touch=matchMedia("(pointer:coarse)").matches;renderer.setPixelRatio(Math.min(devicePixelRatio||1,touch?1.5:2));renderer.shadowMap.enabled=!touch;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   renderer.domElement.id="room-canvas";document.body.prepend(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,1,.1,60);
   build();resize();addEventListener("resize",resize);camera.position.set(2.4,2.8,7.2);curLook.set(0,1.15,3.4);
   addEventListener("keydown",function(e){keys[e.key]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();});
   addEventListener("keyup",function(e){keys[e.key]=false;});
   renderer.domElement.addEventListener("click",function(e){if(mode!=="zoom"){var rect=renderer.domElement.getBoundingClientRect(),pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);if(ray.intersectObject(screenMesh).length)onMonitor();}});
   loop(0);return true;}
 return {init:init,setMode:function(m){mode=m;},setPower:function(v){screenPowered=!!v;},screenVisible:function(v){if(screenMesh)screenMesh.visible=v;},
   setMove:function(x,y){move.x=x;move.y=y;},onMonitor:function(fn){onMonitor=fn;}};
})();