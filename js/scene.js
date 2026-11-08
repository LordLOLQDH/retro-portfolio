/* 3D desk scene with a continuously animated CRT display texture. */
window.Scene=(function(){
 var renderer,scene,camera,screenMesh,screenCanvas,screenCtx,screenTexture,mode="walk",t=0,player=new THREE.Vector3(0,0,4.2),move={x:0,y:0},keys={},onMonitor=function(){};
 var idlePos=new THREE.Vector3(4.2,3.1,5.2),lookAtHome=new THREE.Vector3(0,1.2,0),zoomPos=new THREE.Vector3(0,1.82,1.45),zoomLook=new THREE.Vector3(0,1.82,0),curLook=lookAtHome.clone(),targetPos=idlePos.clone();
 function mat(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r});}
 function box(w,h,d,x,y,z,m,parent){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(parent||scene).add(o);return o;}
 function cyl(rt,rb,h,seg,m,x,y,z,parent){var o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);o.position.set(x,y,z);o.castShadow=true;(parent||scene).add(o);return o;}
 function drawScreen(now){
   if(!screenCtx)return;var c=screenCtx,w=c.canvas.width,h=c.canvas.height;
   c.fillStyle="#f7f8fa";c.fillRect(0,0,w,h);
   c.fillStyle="#183c73";c.fillRect(0,0,w,34);
   c.fillStyle="#fff";c.font="bold 11px Arial";c.fillText("ADAM KRAUS  /  DIGITAL WORKSPACE",16,22);
   c.fillStyle="#a16c2c";c.font="bold 9px Arial";c.fillText("PERSONAL PORTFOLIO / "+String(CONFIG.year||2026),18,62);
   c.fillStyle="#11151b";c.font="bold 34px Arial";c.fillText(CONFIG.name||"Adam Kraus",18,112);
   c.fillStyle="#68717d";c.font="16px Arial";c.fillText(CONFIG.role||"Developer & Founder",18,139);
   c.fillStyle="#596575";c.font="11px Arial";
   var words=(CONFIG.about||"I build websites, web applications and digital tools.").split(" "),line="",y=168;
   words.forEach(function(word){var test=line?line+" "+word:word;if(c.measureText(test).width>430){c.fillText(line,18,y);line=word;y+=17;}else line=test;});
   if(line)c.fillText(line,18,y);
   c.fillStyle="#183c73";c.fillRect(18,228,106,27);c.fillStyle="#fff";c.font="bold 9px Arial";c.fillText("EXPLORE PROJECTS",25,245);
   c.fillStyle="#e4e8ed";c.fillRect(132,228,96,27);c.fillStyle="#25364a";c.fillText("GET IN TOUCH",143,245);
   c.fillStyle="#d9dee5";c.fillRect(18,274,w-36,1);
   c.fillStyle="#9aa2ac";c.font="bold 8px Arial";c.fillText("BUILDING DIGITAL THINGS THAT WORK.",18,296);
   c.fillStyle="#183c73";c.fillRect(18,h-30,Math.max(30,(now/45)%110),3);
   c.fillStyle="#68717d";c.font="9px Arial";c.fillText("CLICK MONITOR TO OPEN DESKTOP",18,h-12);
   screenTexture.needsUpdate=true;
 }
 function build(){
   scene.background=new THREE.Color(0x171d25);scene.fog=new THREE.Fog(0x171d25,10,24);
   scene.add(new THREE.HemisphereLight(0xe5e9f0,0x45404a,1.1));
   var key=new THREE.DirectionalLight(0xffe5c2,2);key.position.set(-3,6,4);key.castShadow=true;scene.add(key);
   var fill=new THREE.PointLight(0x6f9bc8,12,8);fill.position.set(2,3,2);scene.add(fill);
   var floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),mat(0x343b43,1));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
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
     dest.set(player.x,player.y+1.65,player.z+0.02);camera.position.lerp(dest,.16);
     var look=new THREE.Vector3(player.x,player.y+1.45,player.z-3.5);curLook.lerp(look,.16);
   }
   camera.lookAt(curLook);renderer.render(scene,camera);
 }
 function init(){try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(e){return false;}
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   renderer.domElement.id="room-canvas";document.body.prepend(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,1,.1,60);
   build();resize();addEventListener("resize",resize);camera.position.set(0,1.7,4.22);curLook.set(0,1.45,.7);
   addEventListener("keydown",function(e){keys[e.key]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();});
   addEventListener("keyup",function(e){keys[e.key]=false;});
   renderer.domElement.addEventListener("click",function(e){if(mode!=="zoom"){var rect=renderer.domElement.getBoundingClientRect(),pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);if(ray.intersectObject(screenMesh).length)onMonitor();}});
   loop(0);return true;}
 return {init:init,setMode:function(m){mode=m;},screenVisible:function(v){if(screenMesh)screenMesh.visible=v;},
   setMove:function(x,y){move.x=x;move.y=y;},onMonitor:function(fn){onMonitor=fn;}};
})();