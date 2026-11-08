/* 3D desk scene with a continuously animated CRT display texture. */
window.Scene=(function(){
 var renderer,scene,camera,screenMesh,screenCanvas,screenCtx,screenTexture,mode="hidden",t=0;
 var idlePos=new THREE.Vector3(4.2,3.1,5.2),lookAtHome=new THREE.Vector3(0,1.2,0),zoomPos=new THREE.Vector3(0,1.82,1.45),zoomLook=new THREE.Vector3(0,1.82,0),curLook=lookAtHome.clone(),targetPos=idlePos.clone();
 function mat(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r});}
 function box(w,h,d,x,y,z,m,parent){var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;(parent||scene).add(o);return o;}
 function cyl(rt,rb,h,seg,m,x,y,z,parent){var o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);o.position.set(x,y,z);o.castShadow=true;(parent||scene).add(o);return o;}
 function drawScreen(now){
   if(!screenCtx)return;var c=screenCtx,w=c.canvas.width,h=c.canvas.height;
   c.fillStyle="#142c49";c.fillRect(0,0,w,h);
   var g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,"#203e63");g.addColorStop(1,"#0c1727");c.fillStyle=g;c.fillRect(0,0,w,h);
   c.fillStyle="#e4b76c";c.fillRect(18,18,7,7);c.fillStyle="#f2f5f8";c.font="bold 17px Arial";c.fillText("ADAM KRAUS",36,27);
   c.fillStyle="#b7c6d6";c.font="10px Arial";c.fillText("DEVELOPER  /  DIGITAL BUILDER",18,48);
   c.fillStyle="#f5f7fa";c.font="bold 34px Arial";c.fillText("Ideas into",18,111);c.fillText("working things.",18,150);
   c.fillStyle="#aebfd1";c.font="11px Arial";c.fillText("Websites · Applications · Experiments",18,176);
   c.fillStyle="#e4b76c";c.fillRect(18,198,86,24);c.fillStyle="#142c49";c.font="bold 9px Arial";c.fillText("VIEW WORK",31,214);
   c.fillStyle="#ffffff20";c.fillRect(18,244,w-36,1);
   var labels=["KDS AI","PHASEONE","CODECORE"];labels.forEach(function(v,i){var x=18+i*112;c.fillStyle="#294563";c.fillRect(x,264,100,78);c.fillStyle="#dce7f2";c.font="bold 11px Arial";c.fillText(v,x+8,287);c.fillStyle="#aabbd0";c.font="9px Arial";c.fillText("PROJECT / 0"+(i+1),x+8,312);});
   c.fillStyle="#d7e2ee";c.font="9px Arial";c.fillText("SYSTEM ONLINE",18,h-16);
   c.fillStyle="#e4b76c";c.fillRect(w-35,h-25,8,8+Math.sin(now/350)*3);
   // moving cursor and blinking caret keep the display alive before interaction
   var px=45+(now/18%(w-90));c.fillStyle="#fff";c.fillRect(px,229,7,10);
   c.fillStyle="#ffffff12";for(var y=0;y<h;y+=4)c.fillRect(0,y,w,1);
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
 function loop(now){requestAnimationFrame(loop);drawScreen(now||0);var dest,k;if(mode==="zoom"){dest=zoomPos;k=.045;}else{if(mode==="idle"){t+=.004;targetPos.set(4.2+Math.sin(t)*.5,3.1,idlePos.z+Math.cos(t)*.3);}else targetPos.copy(idlePos);dest=targetPos;k=.03;}camera.position.lerp(dest,k);curLook.lerp(mode==="zoom"?zoomLook:lookAtHome,k);camera.lookAt(curLook);renderer.render(scene,camera);}
 function init(){try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(e){return false;}renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.1,60);build();resize();addEventListener("resize",resize);camera.position.copy(idlePos);loop(0);return true;}
 return {init:init,setMode:function(m){mode=m;},screenVisible:function(v){if(screenMesh)screenMesh.visible=v;}};
})();