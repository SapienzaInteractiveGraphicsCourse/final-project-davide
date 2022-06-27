import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/libs/tween.module.min';

var character, surfBox;
var running = false;
var replay = false;
var surf, surfGroup;
var isJumping = false;
var interval1,interval2;
var color = 0x000000;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
const renderer = new THREE.WebGLRenderer();
const texloader = new THREE.TextureLoader();
const lanes_tex = texloader.load('images/silver_texture.jpg');
var speed = 0.04;
const charParent = new THREE.Group();
scene.add(charParent);
const objectsParent = new THREE.Group();
scene.add(objectsParent);
const lanes = [-4.25,4.25,0];
var lane = 1;
const points_frequency = 17;
const obstacles_frequency = 8;
const visible_planets = [];
const pending_planets = [];
const objectsBoxes = [];
const trajectories = [
  {point_x : 10, point_y : 2, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -10.3, point_y : 2, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 12, point_y : 1, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -12, point_y : 4, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : -13, point_y : 8, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 13, point_y : 16, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : 13, point_y : -3, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -15.1, point_y : -4, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : -15, point_y : 22, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 10, point_y : 25, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -10.1, point_y : 18, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 15.1, point_y : -4, point_z : -100, x_speed : 0.01, z_speed : 0.3}
] 
var total_score_div = document.getElementById('total_score');
var distance_div = document.getElementById('distance');
var points_div = document.getElementById('points');

var gameOver_div = document.getElementById('game_over');
var tscoreGameOver_div = document.getElementById('game_over_tscore');
var distanceGameOver_div= document.getElementById('game_over_distance');
var pointsGameOver_div = document.getElementById('game_over_points');

var points = 0;
var distance = 0;
var idleRotation = 1;
var idleCont = 0;
var listener = new THREE.AudioListener();
var sound = new THREE.Audio( listener );
var vol_on = true;
var loaded = 0;


setButtons();
window.onload  = createScene;

function createScene(){
  renderer.setClearColor(color);
  camera.position.z = 6;
  camera.position.x = 0;
  camera.position.y = 6;
  camera.rotation.x += Math.PI*-0.1;
  camera.rotation.y += 0;
  camera.rotation.z += 0;

  camera.add( listener );
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'sounds/the_blue_danube.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop(true);
    sound.setVolume(0.75);
    loaded++;
  },
              function ( x ) {},
              function ( err ) {
                  console.log( 'Error' );
              }

  );

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  const ambientLight = new THREE.AmbientLight();
  scene.add(ambientLight);
  ObjectCreator.createLight(0xffffff, 0.95, [-3,7,5]);
  ObjectCreator.createLight(0xffffff, 0.2, [-5,7,5]);
  
  const background_loader = new THREE.TextureLoader();
  background_loader.load('images/space_tex.jpg' , function(texture)
            {
             scene.background = texture;  
             loaded++;
            });


  lanes_tex.wrapS = THREE.RepeatWrapping;
  lanes_tex.wrapT = THREE.RepeatWrapping;
  lanes_tex.repeat.set(30, 1);
  lanes_tex.rotation = Math.PI/2;
  ObjectCreator.createLane(-4.25);
  ObjectCreator.createLane(0);
  ObjectCreator.createLane(4.25);
  surf = ObjectCreator.createSurf();
  visible_planets.push([imageLoader("images/planet4.png",10,2,-20,[4,4,4]),[0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet2.png",-13,2,-15,[4,4,4]),[-0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet5.png",-15.1,-4,-90,[4,4,4]),[-0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet3.png",12,20,-90,[4,4,4]),[0.01,0.3]]);

  pending_planets.push(imageLoader("images/planet1.png",0,0,10,[4,4,4]));
  pending_planets.push(imageLoader("images/planet6.png",0,0,10,[4,4,4]));
  pending_planets.push(imageLoader("images/planet7.png",0,0,10,[4,4,4]));
  pending_planets.push(imageLoader("images/space_station.png",0,0,10,[4,4,4]));

  for (let i = 0; i < points_frequency; i++) ObjectCreator.createPoint();
  for (let i = 0; i < obstacles_frequency; i++) ObjectCreator.createObstacle(i);
  
  const character_loader = new GLTFLoader();

  character_loader.load( 'models/robot/scene.gltf', function ( gltf ) {
    character = gltf.scene;
    character.scale.set(0.0055,0.0055,0.0055);
    character.add(surfGroup);
    scene.add(character);
    surfGroup.scale.set(350,350,350);
    character.rotation.y += Math.PI;
    character.rotation.y += Math.PI/2;
    character.getObjectByName("L_leg_01").rotation.x += Math.PI/25;
    character.getObjectByName("spine_013").rotation.z += Math.PI/4;
    character.position.x += 0.102;
    character.position.y += 1;
    surfBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(surf);
    document.addEventListener("keydown", onKeyDown, false);
    loaded++;
    animate();
}, undefined, function ( error ) {
  console.error( error );
} );
}

function imageLoader(path,x,y,z,scale){
  var map = new THREE.TextureLoader().load(path);
  var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
  var image = new THREE.Sprite( material );
  scene.add( image );
  image.position.set(x,y,z);
  image.scale.set(scale[0],scale[1],scale[2]);
  return image;
}

function addRandom(array,elem){
  var rand = Math.floor(Math.random() * (array.length - 0)) + 1;
  array.splice(rand, 0, elem);
}


class ObjectCreator {
  constructor() {}

  static createSurf(){
    const surf_color = 0xffd000;
    const surf_geometry = new RoundedBoxGeometry( 1, 0.15, 0.6, 6, 2 );
    const surf_material1 = new THREE.MeshBasicMaterial({
      color: 0xa6a6a6,
      map: texloader.load('images/surf_tex2.jpg'),
    });
    const surf_material2 = new THREE.MeshBasicMaterial({
      color: 0xa6a6a6,
      map: texloader.load('images/surf_tex4.jpg'),
    });
    const surf_materials = [ surf_material2,surf_material2,surf_material1,surf_material1, surf_material2,surf_material2];
    const surf = new THREE.Mesh( surf_geometry, surf_materials);
    const reactor_geometry = new THREE.CylinderBufferGeometry(0.065, 0.065, 0.1, 16);
    const reactor_material = new THREE.MeshBasicMaterial({ 
      color: 0xa6a6a6, 
      map: texloader.load('images/surf_tex4.jpg'),
    });
    const reactor1 = new THREE.Mesh(reactor_geometry, reactor_material);
    const reactor2 = new THREE.Mesh(reactor_geometry, reactor_material);
    surfGroup = new THREE.Group();
    surfGroup.position.y -= 5;

    reactor1.rotation.x += Math.PI/2;
    reactor1.rotation.z += Math.PI/2;
    reactor1.position.z += 0.04+0.15;
    reactor1.position.x += 0.54;
    reactor1.position.y -= 0.03;

    reactor2.rotation.x += Math.PI/2;
    reactor2.rotation.z += Math.PI/2;
    reactor2.position.z += 0.04-0.15;
    reactor2.position.x += 0.54;
    reactor2.position.y -= 0.03;

    var fireVideo = document.createElement("video");
    fireVideo.src = 'images/fire.mp4';
    fireVideo.loop = true;
    fireVideo.play();

    var fireTexture = new THREE.VideoTexture(fireVideo);
    fireTexture.format = THREE.RGBAFormat;
    fireTexture.minFilter = THREE.NearestFilter;
    fireTexture.maxFilter = THREE.NearestFilter;
    fireTexture.generateMipmaps = false;
    
    const reactor_light_material = new THREE.MeshPhongMaterial({ 
      color: 0x11ffEee, 
      map: fireTexture,//texloader.load('images/fire.gif'),
    });
    const reactor_light_geometry = new THREE.CylinderBufferGeometry(0.04, 0.05, 0.015, 16);
    const reactorLight1 = new THREE.Mesh(reactor_light_geometry, reactor_light_material);
    const reactorLight2 = new THREE.Mesh(reactor_light_geometry, reactor_light_material);

    reactorLight1.rotation.x += Math.PI/2;
    reactorLight1.rotation.z += Math.PI/2;
    reactorLight1.position.z += 0.04+0.15;
    reactorLight1.position.x += 0.584;
    reactorLight1.position.y -= 0.03;

    reactorLight2.rotation.x += Math.PI/2;
    reactorLight2.rotation.z += Math.PI/2;
    reactorLight2.position.z += 0.04-0.15;
    reactorLight2.position.x += 0.584;
    reactorLight2.position.y -= 0.03;

    surfGroup.add(surf);
    surfGroup.add(reactor1);
    surfGroup.add(reactor2);
    surfGroup.add(reactorLight1);
    surfGroup.add(reactorLight2);
    scene.add( surfGroup );
    surf.position.y -= 0.04;
    surfGroup.position.x -= 50;
    surf.position.z += 0.04;
    loaded++;
    return surf;
  }


  static createLane(x){
    const geometry = new THREE.BoxBufferGeometry( 2, 0.1, 120 );
    var tras = 0.4;
    if(x == 0) tras = 0.6;
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: lanes_tex,
      transparent : true,
      opacity: tras,
    });
    const lane = new THREE.Mesh( geometry, material );
    scene.add( lane );
    lane.position.y -= 0.6;
    lane.position.x -= x;
    lane.position.z -= 40;
  }
  
  static createPoint(){
    const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    const material = new THREE.MeshPhongMaterial({
      color: 0xffd700,
    });
    const point = new THREE.Mesh( geometry, material );
    objectsParent.add(point);
    point.position.y += 0.8;
    point.position.x -= lanes[Math.floor(Math.random() * 3)];
    point.position.z = -85-Math.floor(Math.random() * 150);
    const pointBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(point);
    pointBox.userData = { type: 'p' };
    objectsBoxes.push(pointBox);
    loaded++;
  }
  
  static createObstacle(i){
    var h;
    var tex;
    if(i%2 == 0) {
      h = 2;
      tex = texloader.load('images/metal_tex2.jpg');
    }else {
      h = 5;
      tex = texloader.load('images/metal_tex.jpg');
    }
    const geometry = new THREE.BoxBufferGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: tex,
    });
    const point = new THREE.Mesh( geometry, material );
    objectsParent.add(point);
    point.scale.set(2, h, 0.5);
    point.position.y += h*0.38;
    point.position.x -= lanes[Math.floor(Math.random() * 3)];
    point.position.z = -85-Math.floor(Math.random() * 150);
    const obstacleBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(point);
    obstacleBox.userData = { type: 'o' };
    objectsBoxes.push(obstacleBox);
    loaded++;
  }

  static createLight(color, intensity, position){
    const light = new THREE.DirectionalLight( color, intensity );
    light.castShadow = true;
    scene.add( light );
    light.position.set( position[0], position[1], position[2] );
  }
}

class Animator {
  constructor() {}

  static jumpUp(object, rotate){
    var rArm = character.getObjectByName("R_arm_035").rotation;
    var lArm = character.getObjectByName("L_arm_019").rotation;
    isJumping = true;
    var rot_x = object.rotation.x;
    var rotUp = new TWEEN.Tween(object.rotation).to({ x: rot_x+Math.PI*0.13 }, 470/speed/25);
    var rotDown = new TWEEN.Tween(object.rotation).to({ x: rot_x }, 470/speed/25);
    rotUp.chain(rotDown);
    rotUp.easing(TWEEN.Easing.Cubic.Out);
    rotUp.start();
    if(rotate){
      var rot_y = object.rotation.y;
      var roll = new TWEEN.Tween(object.rotation).to({ y: rot_y+Math.PI*2  }, 750/speed/25);
      roll.start();
    }else{
      rot_x = rArm.x;
      var rotrArmUp = new TWEEN.Tween(rArm).to({ x: rot_x-Math.PI*0.3 }, 460/speed/25);
      var rotrArmDown = new TWEEN.Tween(rArm).to({ x: rot_x}, 460/speed/25);
      rotrArmUp.chain(rotrArmDown);
      rotrArmUp.easing(TWEEN.Easing.Cubic.Out);
      rotrArmUp.start();
      rot_x = lArm.x;
      var rotlArmUp = new TWEEN.Tween(lArm).to({ x: rot_x+Math.PI*0.3 }, 460/speed/25);
      var rotlArmDown = new TWEEN.Tween(lArm).to({ x: rot_x}, 460/speed/25);
      rotlArmUp.chain(rotlArmDown);
      rotlArmUp.easing(TWEEN.Easing.Cubic.Out);
      rotlArmUp.start();
    }
    var mod_y = object.position.y; 
    var jumpUp = new TWEEN.Tween(object.position).to({y : mod_y+2.8}, 470/speed/25);
    var jumpDown = new TWEEN.Tween(object.position).to({y : mod_y}, 470/speed/25).onComplete(function () {
      isJumping = false;
    });
    jumpUp.chain(jumpDown);
    jumpUp.easing(TWEEN.Easing.Cubic.Out);
    jumpUp.start();

  }

  static jumpLeft(object, rotate){
    isJumping = true;
    var mod_y = object.position.y; 
    var jumpLeftYUp = new TWEEN.Tween(object.position).to({y: mod_y+1.5}, 420/speed/25);
    jumpLeftYUp.easing(TWEEN.Easing.Quadratic.Out);
    var jumpLeftYDown = new TWEEN.Tween(object.position).to({y: mod_y}, 420/speed/25);
    jumpLeftYDown.easing(TWEEN.Easing.Quadratic.In);
    jumpLeftYUp.chain(jumpLeftYDown);
    jumpLeftYUp.start();
    if(rotate){
      var rot_y = object.rotation.y;
      var roll = new TWEEN.Tween(object.rotation).to({ y: rot_y+Math.PI*2  }, 560/speed/25);
      roll.start();
    }
    var mod_x = object.position.x; 
    var jumpLeftXUp = new TWEEN.Tween(object.position).to({x: mod_x-3.8}, 840/speed/25).onComplete(function () {
      isJumping = false;
    });
    jumpLeftXUp.start();
  }

  static jumpRight(object, rotate){
    isJumping = true;
    var mod_y = object.position.y; 
    var jumpRightYUp = new TWEEN.Tween(object.position).to({y: mod_y+1.5}, 420/speed/25);
    jumpRightYUp.easing(TWEEN.Easing.Quadratic.Out);
    var jumpRightYDown = new TWEEN.Tween(object.position).to({y: mod_y}, 420/speed/25);
    jumpRightYDown.easing(TWEEN.Easing.Quadratic.In);
    jumpRightYUp.chain(jumpRightYDown);
    jumpRightYUp.start();

    if(rotate){
      var rot_y = object.rotation.y;
      var roll = new TWEEN.Tween(object.rotation).to({ y: rot_y-Math.PI*2  }, 560/speed/25);
      roll.start();
    }
    var mod_x = object.position.x; 
    var jumpLeftXUp = new TWEEN.Tween(object.position).to({x: mod_x+3.8}, 840/speed/25).onComplete(function () {
      isJumping = false;
    });
    jumpLeftXUp.start();
  }

  static idleAnimation(){
    idleCont += idleRotation;
    if(idleCont == 100 || idleCont == -1) idleRotation = -idleRotation;
    character.getObjectByName("spine_013").rotation.z += 0.004*idleRotation;
    character.getObjectByName("Joint_1_016").rotation.x -= 0.003*idleRotation;
    character.getObjectByName("R_shoulder_031").rotation.x -= 0.004*idleRotation;
  }

  static legRotation(){
    var rot = character.getObjectByName("L_ankle1_03").rotation;
    var rot_z = rot.z;

    var rotFoot1= new TWEEN.Tween(rot).to({z: rot_z+Math.PI*0.15}, 2*470);
    var rotFoot2 = new TWEEN.Tween(rot).to({z: rot_z}, 2*470);
 
    rotFoot1.delay(9000);
    rotFoot2.delay(9000);
    rotFoot1.chain(rotFoot2);
    rotFoot2.chain(rotFoot1);
    rotFoot1.start();
  }

  static elbowRotation(val,time){  
    var rot = character.getObjectByName("R_elbow_036").rotation;
    var rot_y = rot.y;
    
    var rotArmUp = new TWEEN.Tween(rot).to({y: rot_y+val*Math.PI*0.21}, 2*520);
    var rotArmDown = new TWEEN.Tween(rot).to({y: rot_y}, 2*500);
 
    rotArmUp.delay(11000);
    rotArmDown.delay(150);
    rotArmUp.chain(rotArmDown);
    rotArmDown.chain(rotArmUp);
    rotArmUp.start();
  }

}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} 

function resetGame() {
  lanes_tex.offset.x = 0;
  speed = 0.04;
  lane = 1;
  distance = 0;
  points = 0;
  replay = true;
  character.position.set(0.102, 1, 0);
  clearInterval(interval1);
  clearInterval(interval2);
  for( var i = 0; i < objectsParent.children.length; i++){
    var child = objectsParent.children[i];
    child.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 160);
    objectsBoxes[i].setFromObject(child);
  }

  var l = visible_planets.length;
  for( var i = 0; i < l; i++){
    var planet = visible_planets.pop();
    planet[0].position.set(0,0,10);
    pending_planets.push(planet[0]);
  }
  var arr = [[10,2,-20],[-13,2,-15],[12,20,-90],[-15.1,-4,-90]];
  for( var i = 0; i < 4; i++){
    var planet = pending_planets.pop();
    planet.position.set(arr[i][0],arr[i][1],arr[i][2]);
    planet.scale.set(4,4,4);
    if(i%2 == 0) visible_planets.push([planet, [-0.01,0.3]]);
    else visible_planets.push([planet, [0.01,0.3]]);
  }
}

function setButtons(){
  document.getElementById('vol_btn').onclick = () => {
    if( vol_on){
      if(sound.isPlaying){
        sound.stop();
      }
      vol_on = false;
      document.getElementById('vol_btn').innerHTML = '<i class="material-icons" style="color:#000000;font-size: 2.6rem;">volume_off</i>';
    }else{
      vol_on = true;
      document.getElementById('vol_btn').innerHTML = '<i class="material-icons" style="color:#000000;font-size: 2.6rem;">volume_up</i>';
    }
  };
  
  document.getElementById('replay_btn').onclick = () => {
    gameOver_div.style.display = 'none';
    spawnPlanets();
    resetGame();
    running = true;
  };  

  document.getElementById('start_btn').onclick = () => {
    if(!replay){
      document.getElementById('loading').style.display = 'grid';
    }else{
      spawnPlanets();
    }
    document.getElementById('menu').style.display = 'none';
    running = true;
  };
  
  document.getElementById('menu_btn').onclick = () => {
    resetGame();
    document.getElementById('game_over').style.display = 'none';
    document.getElementById('menu').style.display = 'grid';
  };

  document.getElementById('htp_btn').onclick = () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('htp').style.display = 'grid';
  };

  document.getElementById('htp_menu_btn').onclick = () => {
    document.getElementById('htp').style.display = 'none';
    document.getElementById('menu').style.display = 'grid';
  };

}

function spawnPlanets(){
  interval1 = setInterval(function () {speed += 0.001}, 11000);
  interval2 = setInterval(function () {
    var planet = pending_planets.pop();
    if( planet != undefined){
      var tr = trajectories[Math.floor(Math.random() * trajectories.length)]
      planet.position.set(tr.point_x,tr.point_y,tr.point_z);
      visible_planets.push([planet, [tr.x_speed,tr.z_speed]]);
    }
  }, 25000*speed*25);  
}


function onKeyDown(event){
  var code = event.keyCode;
  switch(code){
    case 38:
    case 32: //space
      if(!isJumping){
        var rotate = false;
        if(Math.floor(Math.random() * 4) == 1) rotate = true; 
        Animator.jumpUp(character,rotate);
      }
      break;
    case 37:
    case 65: // a
      if(!isJumping && lane != 0){
        lane--;
        var rotate = false;
        if(Math.floor(Math.random() * 3) == 1) rotate = true;
        Animator.jumpLeft(character,rotate);
      }
      break;
    case 39:
    case 68: //d
      if(!isJumping && lane != 2){
        lane++;
        var rotate = false;
        if(Math.floor(Math.random() * 3) == 1) rotate = true;
        Animator.jumpRight(character,rotate);
      }
      break;
  }
}


function animate() {
  requestAnimationFrame( animate );
  TWEEN.update();
  if(running){
    render();
  }
}

function checkCollisions() {
  var i = 0;
  for( var i = 0; i< objectsBoxes.length; i++){
    var box = objectsBoxes[i];
    if (surfBox.intersectsBox(box)) {
      if( box.userData.type == "p"){
        var obj = objectsParent.children[i];
        obj.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 150);
        obj.position.x = lanes[Math.floor(Math.random() * 3)];
        objectsBoxes[i].setFromObject(obj);
        points++;
        points_div.innerText = "Points: " + points;
      }else{
        gameOver();
      }
    }
  }
}

function gameOver(){
  running = false;
  tscoreGameOver_div.innerHTML = "Total Score: " + (parseInt(distance) + points*10);
  distanceGameOver_div.innerHTML = "Distance: " + parseInt(distance);
  pointsGameOver_div.innerHTML = "Points: " + points;
  setTimeout(() => {      
    gameOver_div.style.display = 'grid';
  }, 1000);
}

function updateObjectsPosition(){
  var i = 0;
  objectsParent.traverse((child) => {
    if (child.type == "Mesh") {
      objectsBoxes[i].setFromObject(child);
      i++;
      const z_pos = child.position.z + objectsParent.position.z;
      if(z_pos > 10){
        child.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 160);
        child.position.x = lanes[Math.floor(Math.random() * 3)];
      }
  }
  });
}

function updatePlanets(){
  for(var i = 0; i < visible_planets.length; i++){
    var planet = visible_planets[i][0];
    var x_s = visible_planets[i][1][0]; 
    var z_s = visible_planets[i][1][1];

    planet.position.x += x_s*speed;
    planet.position.z += z_s*speed;
    planet.scale.x += (speed/24);
    planet.scale.y += (speed/24);
    planet.scale.z += (speed/24);
    if(planet.position.z > 5){
      planet.scale.set(4,4,4);
      visible_planets.splice(i, 1);
      addRandom(pending_planets,planet);
    }
  }
}

function updateScore(){
  distance += speed*2.5;
  distance_div.innerHTML = "Distance: " + parseInt(distance);
  total_score_div.innerHTML = "Total Score: " + (parseInt(distance) + points*10);
}




function render() {
  if(replay || loaded == 4+obstacles_frequency+points_frequency){
    if(vol_on && !sound.isPlaying) {
      sound.play();
    }
    replay = false;
  }
  if(loaded == 4+obstacles_frequency+points_frequency) {
    spawnPlanets();
    document.getElementById('loading').style.display = 'none';
    Animator.elbowRotation(1,11000);
    Animator.legRotation();
    loaded = 0;
  }
  checkCollisions();
  Animator.idleAnimation();
  objectsParent.position.z += speed*10;
  updatePlanets();
  surfBox.setFromObject(surf);
  updateObjectsPosition();
  updateScore();
  
  lanes_tex.offset.x = (lanes_tex.offset.x+speed*2.5)%4 - 2;
  renderer.render(scene, camera);
}

