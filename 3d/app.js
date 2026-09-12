import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {buildSpeaker, buildRoom, contactShadow, dispose} from './models.js';
import {roomGeometry} from './acoustics.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const APPLE='https://www.apple.com/homepod-2nd-generation/specs/';
const APPLE_ROOM='https://www.apple.com/newsroom/2023/01/apple-introduces-the-new-homepod-with-breakthrough-sound-and-intelligence/';
const BOSE='https://www.bose.com/pressroom/bose-lifestyle-collection';
const BOSE_PRODUCT='https://www.bose.com/p/sale/bose-lifestyle-ultra-speaker/LSULT-SPEAKERWIRELESS.html';
const TEARDOWN='https://www.ifixit.com/News/71957/the-homepod-2-teardown-small-changes-make-a-big-difference';
const data={
  homepod:{name:'APPLE / HOMEPOD 2',chapters:{
    design:['01 / AROUND THE CABINET','A ring of sound.','A rounded fabric shell hides a vertical acoustic stack. Inspect the woven surface and recessed touch panel, then open the cabinet to see how the parts fit together.'],
    inside:['02 / THE ACOUSTIC STACK','One woofer. Five tweeters.','Apple’s cutaway and teardown evidence place the woofer above the lower electronics and tweeter ring. Separate the components to inspect the large motor and angled lower assemblies.'],
    bass:['03 / LOW FREQUENCIES','Move air. Measure. Adjust.','The woofer diaphragm displaces air while an internal microphone supports bass correction. Play or scrub one slowed cycle to inspect the moving cone; only the diaphragm moves, not the motor.'],
    room:['04 / SOUND IN SPACE','The room becomes an input.','HomePod senses nearby reflections and adapts playback. The green line is a direct route; the amber route illustrates ambient sound reflecting from a side wall. These rays do not reproduce its beam patterns.']},
    components:{
      enclosure:['Cabinet','Fabric & touch surface','The 168 mm height and 142 mm diameter are published dimensions. The curvature, woven texture and top recess are reconstructed from Apple’s photographs.',APPLE,'Dimensions + photograph reference'],
      woofer:['Woofer','High-excursion woofer','A 4-inch woofer sits high in the cabinet, above its large motor. Cone, basket and motor proportions follow the official cutaway; fine construction details remain approximate.',APPLE_ROOM,'Official cutaway reference'],
      tweeters:['5 tweeters','Angled tweeter ring','Five assemblies sit close to the base. The drivers and horn paths are angled toward the supporting surface; the 3D model simplifies the horn interiors.',APPLE_ROOM,'Official cutaway reference'],
      sensing:['Bass microphone','Listen to the bass','An internal low-frequency microphone supports automatic bass correction. Its gold marker identifies a function; its precise position and packaging are not established here.',APPLE,'Documented function · position illustrative'],
      processing:['Electronics','Processing & amplification','The upper logic board and lower amplifier/power region follow teardown evidence. Board outlines, heat-sink fins and components are visual approximations, not circuit diagrams.',TEARDOWN,'Teardown reference · simplified geometry']
    }
  },
  bose:{name:'BOSE / LIFESTYLE ULTRA',chapters:{
    design:['01 / THE CABINET','A front. And an up.','The capsule-shaped body combines a fabric front with a moulded rear shell. Its top separates the circular touch control from a perforated grille for the upward radiator.'],
    inside:['02 / THE ACOUSTIC STACK','Three distinct radiators.','The official cutaway shows a forward woofer beneath a smaller tweeter, an upward radiator near the front of the top, and a curved duct behind them. Select a part to inspect its role.'],
    bass:['03 / CLEANBASS','A driver and a port.','CleanBass combines the woofer, QuietPort and digital processing. The cone provides active displacement; the air in the duct also participates in bass radiation. The visual cycle shows cone motion only.'],
    room:['04 / TRUESPATIAL','Give height a clear path.','The upward radiator sends energy toward the ceiling. Change the ceiling height or add a shelf to see the geometric path change. A visible ray does not guarantee a perceived height effect.']},
    components:{
      enclosure:['Cabinet','Fabric, shell & controls','Front, top and rear manufacturer photographs guide the capsule outline, grille boundary, control recess, rectangular rear port and lower connectors.',BOSE_PRODUCT,'Manufacturer photographs'],
      woofer:['Woofer','Forward bass driver','The larger front radiator occupies the lower half of the official cutaway. Its basket and substantial rear motor are reconstructed from that image.',BOSE_PRODUCT,'Official cutaway reference'],
      tweeters:['Front tweeter','Direct high frequencies','A smaller forward driver sits above the woofer. It provides a physically distinct forward path alongside the upper radiator.',BOSE,'Documented layout'],
      height:['Upward driver','The height radiator','This third radiator sits under the top grille. TrueSpatial uses the upward design to add spatial depth; the proprietary filters are not represented.',BOSE,'Documented layout and function'],
      port:['QuietPort','The curved rear duct','A curved duct occupies the rear of Bose’s cutaway and terminates in a rectangular rear opening. Its reconstructed route is approximate; bore dimensions and tuning are not published.',BOSE_PRODUCT,'Official cutaway · duct dimensions unknown']
    }
  }
};
const chapters=['design','inside','bass','room'];
const params=new URLSearchParams(location.search);
const state={product:params.get('speaker')==='bose'?'bose':'homepod',chapter:chapters.includes(params.get('chapter'))?params.get('chapter'):'design',finish:params.get('speaker')==='bose'?'dark':'light',component:'enclosure',explode:0,phase:0,playing:false,placement:'open',ceiling:2.7,camera:'hero'};
if(state.chapter!=='design')state.component='woofer';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,controls,speaker,room,shadow,environmentTarget,roomKey='',currentProduct='',raf=0,lastTime=0,transition=null,visible=true,disposed=false,frameCount=0;
let labels=[];

function populate(){
  const config=data[state.product],lesson=config.chapters[state.chapter];
  $('#scene-kicker').textContent=config.name;
  $('#scene-mode').textContent=({design:'Exterior',inside:state.explode?'Exploded inspection':'Cutaway',bass:'Bass mechanism',room:'Room paths'})[state.chapter];
  ['kicker','title','copy'].forEach((id,i)=>$('#lesson-'+id).textContent=lesson[i]);
  $$('[data-product]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.product===state.product));
  $$('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.chapter===state.chapter));
  $$('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.finish===state.finish));
  $$('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.camera===state.camera));
  $('#design-controls').hidden=state.chapter!=='design';$('#inside-controls').hidden=state.chapter!=='inside';$('#room-controls').hidden=state.chapter!=='room';$('#bass-diagram').hidden=state.chapter!=='bass';
  $('#component-area').hidden=state.chapter==='room';$('#transport').hidden=!['bass','room'].includes(state.chapter);
  $('#explode').value=state.explode;$('#explode-value').textContent=state.explode+'%';
  $('#phase').value=Math.round(state.phase*100);$('#phase-value').textContent=Math.round(state.phase*100)+'%';
  $('#play').textContent=state.playing?'Pause motion':'Play motion';$('#play').setAttribute('aria-pressed',state.playing);
  $('#ceiling').value=state.ceiling;$('#ceiling-value').textContent=state.ceiling.toFixed(1)+' m';$('#placement').value=state.placement;
  const componentKeys=Object.keys(config.components);
  if(!componentKeys.includes(state.component))state.component='enclosure';
  const list=$('#components');
  if(list.dataset.product!==state.product){list.replaceChildren(...Object.entries(config.components).map(([key,c])=>{const b=document.createElement('button');b.textContent=c[0];b.dataset.component=key;b.addEventListener('click',()=>{state.component=key;if(state.chapter==='design'&&key!=='enclosure')setChapter('inside',false);else update();});return b;}));list.dataset.product=state.product;}
  $$('[data-component]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.component===state.component));
  const c=config.components[state.component];$('#component-title').textContent=c[1];$('#component-copy').textContent=c[2];$('#component-source').href=c[3];$('#component-evidence').textContent=c[4];
  const apple=state.product==='homepod';
  $('#bass-title').textContent=apple?'A correction loop':'Two acoustic contributors';
  $('#signal-flow').replaceChildren(...(apple?['Drive','→','Woofer','→','Microphone','↺','Correction']:['Processing','→','Woofer','+','Port air']).map((t,i)=>{const el=document.createElement(['→','↺','+'].includes(t)?'span':'b');el.textContent=t;return el;}));
  $('#bass-note').textContent=apple?'Functional diagram. Actual control law, gain and latency are not specified. Motion is enlarged and slowed.':'Duct shape follows the marketing cutaway approximately. Port airflow phase and level are not simulated; motion is enlarged and slowed.';
  const i=chapters.indexOf(state.chapter);$('#next').textContent=i===3?'Return to the cabinet →':`Next: ${['look inside','explore bass','follow the room paths'][i]} →`;$('#step-count').textContent=`${i+1} / 4`;
  $('#scale-tag').textContent=state.chapter==='room'?'Geometric illustration · metres':apple?'Envelope · 168 × 142 mm':'Envelope · ≈184 × 121 × 167 mm';
  $('#view-hint').textContent=state.chapter==='room'?'Drag to orbit · ray paths are illustrative':'Drag to rotate · + / − to zoom';
  const url=new URL(location.href);url.searchParams.set('speaker',state.product);url.searchParams.set('chapter',state.chapter);history.replaceState(null,'',url);
  document.body.dataset.speaker=state.product;document.body.dataset.chapter=state.chapter;
  if(state.chapter==='room')updateRoomReadout(roomGeometry(state.product,state.placement,state.ceiling));
}

function updateRoomReadout(g){
  $('#path-label').textContent=g.blocked?'Ceiling route':'Extra reflected travel';
  $('#path-value').textContent=g.blocked?'Blocked':g.excess.toFixed(2)+' m';
  $('#delay-value').textContent=g.blocked?'The drawn ray meets the shelf before the ceiling.':`About ${g.delayMs.toFixed(1)} ms after the direct path · c = 343 m/s`;
  $('#placement-note').textContent=state.product==='bose'?(state.placement==='shelf'?'Bose advises against placing the speaker in or under a shelf. This view illustrates the obstruction.':state.placement==='wall'?'Bose recommends at least 2 in (5 cm) of wall clearance. The model leaves roughly 10 cm behind the cabinet.':'A flat ceiling gives this simple specular path. Real scattering, absorption and driver directivity will change the received sound.'):(state.placement==='shelf'?'Room sensing does not remove physical obstructions. The side-wall ray remains illustrative; no shelf-response correction is simulated.':state.placement==='wall'?'Apple documents wall/free-space adaptation. This scene moves the speaker; it does not estimate the resulting EQ or beamforming filters.':'The side-wall route illustrates ambient energy. Its geometry is independent of the ceiling-height control.');
  $('#stage').dataset.extraTravel=g.excess.toFixed(8);$('#stage').dataset.delayMs=g.delayMs.toFixed(8);$('#stage').dataset.blocked=String(g.blocked);
}
function rebuildScene(){
  if(!renderer)return;
  if(currentProduct!==state.product){if(speaker)speaker.dispose();speaker=buildSpeaker(state.product);scene.add(speaker.root);currentProduct=state.product;}
  speaker.update(state);
  const inRoom=state.chapter==='room';
  speaker.root.scale.setScalar(inRoom?.1:1);speaker.root.position.set(0,inRoom?.8:0,inRoom?(state.placement==='open'?0:-.91):0);shadow.visible=!inRoom;
  if(inRoom){
    const key=[state.product,state.placement,state.ceiling].join(':');
    if(key!==roomKey){if(room)room.dispose();const g=roomGeometry(state.product,state.placement,state.ceiling);room=buildRoom(g,state.placement,state.ceiling,state.product);scene.add(room.root);roomKey=key;updateRoomReadout(g);}
    room.root.visible=true;room.update(state.phase);setLabels(room.labels);
  }else{
    if(room)room.root.visible=false;
    const h=speaker.height,inside=state.chapter==='inside'||state.chapter==='bass',s=state.explode/100;
    const descriptions={homepod:{woofer:['Woofer & motor',[.05,1.43+s*.15,.12]],tweeters:['Five angled tweeters',[.15,.48,.73+s*.2]],sensing:['Bass calibration · position illustrative',[.46,.89,.35]],processing:['Logic board · amplifier below',[.05,1.66,-.12]]},bose:{woofer:['Forward woofer',[0,.88+s*.15,.86+s*.28]],tweeters:['Forward tweeter',[0,1.50+s*.45,.77+s*.28]],height:['Upward radiator',[.1,1.82+s*.45,.2]],port:['Curved QuietPort · approximate route',[.42,1.31,-.44]]}};
    const entry=descriptions[state.product][state.component];setLabels(inside&&entry?[{text:entry[0],point:new T.Vector3(...entry[1])}]:[]);
  }
  invalidate();
}
function setLabels(items){
  labels=items.map(item=>{const el=document.createElement('div');el.className='scene-label';el.textContent=item.text;return {...item,el};});$('#scene-labels').replaceChildren(...labels.map(x=>x.el));
}
function update(){populate();rebuildScene();}
function setChapter(chapter,selectDefault=true){state.chapter=chapter;state.playing=false;state.phase=0;state.explode=0;state.camera='hero';if(selectDefault)state.component=chapter==='design'?'enclosure':'woofer';update();preset('hero');}
function selectProduct(product){state.product=product;state.finish=product==='homepod'?'light':'dark';state.component=state.chapter==='design'?'enclosure':'woofer';state.explode=0;state.phase=0;state.playing=false;roomKey='';update();preset('hero');}

function preset(which,instant=false){
  state.camera=which;$$('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.camera===which));
  if(!camera)return;
  const isRoom=state.chapter==='room',exploded=state.chapter==='inside'?state.explode/100:0;
  const target=new T.Vector3(0,isRoom?1.35:.85+exploded*.37,isRoom?.85:0);
  const p=isRoom?{hero:[5.8,4.5,6.8],front:[.01,2.3,8.7],rear:[.01,3.8,-7.3],top:[0,9,.86]}:{hero:[2.4,2.65,3.6],front:[.001,1.05,4.4],rear:[.001,1.12,-4.4],top:[0,5.3,.001]};
  const end=new T.Vector3(...p[which]);if(!isRoom)end.sub(target).multiplyScalar(1+exploded*.42).add(target);else end.sub(target).multiplyScalar(Math.max(1,1.1/camera.aspect)).add(target);
  controls.minDistance=isRoom?3:2.45;controls.maxDistance=isRoom?14:8;controls.maxPolarAngle=Math.PI*.88;
  if(instant||reduced.matches){camera.position.copy(end);controls.target.copy(target);controls.update();transition=null;}else transition={start:performance.now(),from:camera.position.clone(),to:end,oldTarget:controls.target.clone(),target};
  speaker?.update(state);invalidate();
}
function invalidate(){if(renderer&&document.body.dataset.renderer!=='unavailable'&&!raf&&!disposed&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
function render(now){
  raf=0;if(disposed||document.hidden||!visible)return;
  const dt=Math.min((now-(lastTime||now))/1000,.05);lastTime=now;
  if(transition){const t=Math.min((now-transition.start)/450,1),ease=1-Math.pow(1-t,3);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.oldTarget,transition.target,ease);controls.update();if(t>=1)transition=null;}
  if(state.playing){state.phase=(state.phase+dt/3.8)%1;speaker.update(state);if(room&&state.chapter==='room')room.update(state.phase);$('#phase').value=Math.round(state.phase*100);$('#phase-value').textContent=Math.round(state.phase*100)+'%';}
  renderer.render(scene,camera);frameCount++;
  $('#stage').dataset.frames=frameCount;$('#stage').dataset.drawCalls=renderer.info.render.calls;$('#stage').dataset.triangles=renderer.info.render.triangles;$('#stage').dataset.geometries=renderer.info.memory.geometries;$('#stage').dataset.textures=renderer.info.memory.textures;
  const w=$('#stage').clientWidth,h=$('#stage').clientHeight;
  for(const label of labels){const p=label.point.clone().project(camera);const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;label.el.style.left=`${Math.max(100,Math.min(w-100,x))}px`;label.el.style.top=`${Math.max(65,Math.min(h-55,y))}px`;label.el.hidden=p.z>1||p.z< -1;}
  if(state.playing||transition)invalidate();
}

function init(){
  const unavailable=()=>{document.body.dataset.renderer='unavailable';$('#loading').hidden=true;$('#fallback').hidden=false;$$('[data-camera], [data-finish], #play, #phase, #explode, #zoom-in, #zoom-out').forEach(el=>el.disabled=true);};
  try{renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,alpha:true,powerPreference:'low-power'});}catch(error){unavailable();console.warn('WebGL unavailable; text and component controls remain usable.',error);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  scene=new T.Scene();camera=new T.PerspectiveCamera(32,1,.01,80);
  const environment=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);environmentTarget=pmrem.fromScene(environment,.04);scene.environment=environmentTarget.texture;scene.environmentIntensity=.65;environment.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfffcf6,0xb5b3ad,1.1));
  const key=new T.DirectionalLight(0xfffcf7,2.2);key.position.set(-3,5,4);scene.add(key);
  const fill=new T.DirectionalLight(0xe9eff4,1.3);fill.position.set(4,2,-2);scene.add(fill);
  const rim=new T.DirectionalLight(0xffffff,1.3);rim.position.set(-2,3,-4);scene.add(rim);
  const studio=new T.Group();scene.add(studio);shadow=contactShadow(studio);
  controls=new OrbitControls(camera,$('#scene'));controls.enableDamping=false;controls.enablePan=false;controls.enableZoom=false;controls.rotateSpeed=.6;controls.touches.ONE=T.TOUCH.ROTATE;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;
  // Wheel scrolling belongs to the page; zoom uses the keyboard or buttons.
  controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>{transition=null;state.camera='custom';$$('[data-camera]').forEach(b=>b.setAttribute('aria-pressed','false'));});
  const resize=()=>{const w=$('#stage').clientWidth,h=$('#stage').clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();};
  const observer=new ResizeObserver(resize);observer.observe($('#stage'));
  const visibilityObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){lastTime=0;invalidate();}else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'80px'});visibilityObserver.observe($('#stage'));
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)invalidate();else if(raf){cancelAnimationFrame(raf);raf=0;}});
  $('#scene').addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];if(!keys.includes(e.key))return;e.preventDefault();transition=null;const offset=camera.position.clone().sub(controls.target),sph=new T.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')sph.theta-=.13;if(e.key==='ArrowRight')sph.theta+=.13;if(e.key==='ArrowUp')sph.phi=Math.max(.08,sph.phi-.13);if(e.key==='ArrowDown')sph.phi=Math.min(Math.PI*.88,sph.phi+.13);if(['+','=','-'].includes(e.key))sph.radius=T.MathUtils.clamp(sph.radius*(e.key==='-'?1.12:.89),controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(sph));controls.update();state.camera='custom';$$('[data-camera]').forEach(b=>b.setAttribute('aria-pressed','false'));invalidate();});
  let down;
  $('#scene').addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
  $('#scene').addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5||!['inside','bass'].includes(state.chapter))return;const rect=$('#scene').getBoundingClientRect();const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObject(speaker.root,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return !!data[state.product].components[h.object.userData.component];});if(hit){state.component=hit.object.userData.component;update();}});
  $('#scene').addEventListener('webglcontextlost',e=>{e.preventDefault();state.playing=false;unavailable();if(raf)cancelAnimationFrame(raf);raf=0;});
  $('#scene').addEventListener('webglcontextrestored',()=>{location.reload();});
  window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();visibilityObserver.disconnect();controls.dispose();speaker?.dispose();room?.dispose();dispose(studio);environmentTarget?.dispose();renderer.dispose();});
  resize();rebuildScene();preset('hero',true);$('#loading').hidden=true;
}

$$('[data-product]').forEach(b=>b.addEventListener('click',()=>selectProduct(b.dataset.product)));
$$('[data-chapter]').forEach(b=>b.addEventListener('click',()=>setChapter(b.dataset.chapter)));
$$('[data-camera]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.camera)));
$$('[data-finish]').forEach(b=>b.addEventListener('click',()=>{state.finish=b.dataset.finish;update();}));
$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>{state.product=b.dataset.jump;setChapter('room');selectProduct(b.dataset.jump);$('.lab').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}));
$('#explode').addEventListener('input',e=>{state.explode=+e.target.value;update();preset(['hero','front','rear','top'].includes(state.camera)?state.camera:'hero',true);});
$('#phase').addEventListener('input',e=>{state.playing=false;state.phase=+e.target.value/100;update();});
$('#play').addEventListener('click',()=>{state.playing=!state.playing;lastTime=0;populate();invalidate();});
$('#ceiling').addEventListener('input',e=>{state.ceiling=+e.target.value;update();});
$('#placement').addEventListener('change',e=>{state.placement=e.target.value;update();});
$('#next').addEventListener('click',()=>setChapter(chapters[(chapters.indexOf(state.chapter)+1)%4]));
function zoom(factor){if(!camera)return;transition=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(T.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();invalidate();}
$('#zoom-in').addEventListener('click',()=>zoom(.84));$('#zoom-out').addEventListener('click',()=>zoom(1.19));
$('#reset').addEventListener('click',()=>{state.finish=state.product==='homepod'?'light':'dark';state.placement='open';state.ceiling=2.7;setChapter('design');});
reduced.addEventListener('change',()=>{if(reduced.matches){state.playing=false;transition=null;populate();invalidate();}});
populate();init();
