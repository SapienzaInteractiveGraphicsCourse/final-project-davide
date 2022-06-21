import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/geometries/RoundedBoxGeometry.js';


var character, surfBox;
var surf, surfGroup;
var isJumping = false;
var color = 0x000000;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
const renderer = new THREE.WebGLRenderer();
const texloader = new THREE.TextureLoader();
const lanes_tex = texloader.load('images/silver_texture.jpg');
var lightColor = 0x11ffEee
const material3 = new THREE.MeshPhongMaterial({ 
  color: lightColor, 
});
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
const objects = [];
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
var last_collision;
var total_score_div = document.getElementById('total_score');
var distance_div = document.getElementById('distance');
var points_div = document.getElementById('points');
var points = 0;
var distance = 0;
var idleRotation = 1;

window.onload  = createScene;

function createScene(){
  renderer.setClearColor(color);
  camera.position.z = 6;
  camera.position.x = 0;
  camera.position.y = 6;
  camera.rotation.x += Math.PI*-0.1;
  camera.rotation.y += 0;
  camera.rotation.z += 0;

  var listener = new THREE.AudioListener();
  camera.add( listener );
  var sound = new THREE.Audio( listener );
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'sounds/the_blue_danube.mp3', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
  },
              function ( x ) {},
              function ( err ) {
                  console.log( 'Error' );
              }

  );

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const light = new THREE.DirectionalLight( 0xffffff, 0.95 );
  light.castShadow = true;
  scene.add( light );
  light.position.set( -3, 6, 5 );
              
  const light2 = new THREE.DirectionalLight( 0xffffff, 0.2 );
  light2.castShadow = true;
  console.log(light2);
  scene.add( light2 );
  light2.position.set( -5, 6, 5 );



  const ambientLight = new THREE.AmbientLight();
  scene.add(ambientLight);
  
  
  const background_loader = new THREE.TextureLoader();
  background_loader.load('images/space_tex.jpg' , function(texture)
            {
             scene.background = texture;  
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

  pending_planets.push(imageLoader("images/planet6.png",0,0,10,[4,4,4]));
  pending_planets.push(imageLoader("images/planet7.png",0,0,10,[4,4,4]));
  pending_planets.push(imageLoader("images/space_station.png",0,0,10,[4,4,4]));

  for (let i = 0; i < points_frequency; i++) ObjectCreator.createPoint();
  for (let i = 0; i < obstacles_frequency; i++) ObjectCreator.createObstacle(i);
  
  const character_loader = new GLTFLoader();


  character_loader.load( 'models/robot/scene.gltf', function ( gltf ) {
    character = gltf.scene;
    character.scale.set(0.007,0.007,0.007);
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
    animate();
    setInterval(function () {speed += 0.001}, 11000);
    setInterval(function () {
      var planet = pending_planets.pop();
      if( planet != undefined){
        var tr = trajectories[Math.floor(Math.random() * trajectories.length)]
        planet.position.set(tr.point_x,tr.point_y,tr.point_z);
        visible_planets.push([planet, [tr.x_speed,tr.z_speed]]);
      }
    }, 25000*speed*25);  
    setInterval(function () {idleRotation = -idleRotation}, 1500);
    Animator.legRotation();
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
    const geometry1 = new RoundedBoxGeometry( 1, 0.22, 0.6, 6, 2 );
    const material1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texloader.load('images/surf_tex.jpg'),
    });
    const surf = new THREE.Mesh( geometry1, material1 );
    const geometry2 = new THREE.CylinderBufferGeometry(0.08, 0.08, 0.16, 16);
    const material2 = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
    });
    const reactor1 = new THREE.Mesh(geometry2, material2);
    const reactor2 = new THREE.Mesh(geometry2, material2);
    surfGroup = new THREE.Group();
    surfGroup.position.y -= 25;

    reactor1.rotation.x += Math.PI/2;
    reactor1.rotation.z += Math.PI/2;
    reactor1.position.z += 0.04+0.15;
    reactor1.position.x += 0.5;
    reactor1.position.y -= 0.01;

    reactor2.rotation.x += Math.PI/2;
    reactor2.rotation.z += Math.PI/2;
    reactor2.position.z += 0.04-0.15;
    reactor2.position.x += 0.5;
    reactor2.position.y -= 0.01;
    
    const geometry3 = new THREE.CylinderBufferGeometry(0.04, 0.05, 0.015, 16);

    const reactorLight1 = new THREE.Mesh(geometry3, material3);
    const reactorLight2 = new THREE.Mesh(geometry3, material3);

    reactorLight1.rotation.x += Math.PI/2;
    reactorLight1.rotation.z += Math.PI/2;
    reactorLight1.position.z += 0.04+0.15;
    reactorLight1.position.x += 0.58;
    reactorLight1.position.y -= 0.01;

    reactorLight2.rotation.x += Math.PI/2;
    reactorLight2.rotation.z += Math.PI/2;
    reactorLight2.position.z += 0.04-0.15;
    reactorLight2.position.x += 0.58;
    reactorLight2.position.y -= 0.01;

    surfGroup.add(surf);
    surfGroup.add(reactor1);
    surfGroup.add(reactor2);
    surfGroup.add(reactorLight1);
    surfGroup.add(reactorLight2);
    scene.add( surfGroup );
    surf.position.y -= 0.04;
    surfGroup.position.x -= 10;
    surf.position.z += 0.04;
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
      color: 0xffff31,
    });
    const point = new THREE.Mesh( geometry, material );
    objectsParent.add(point);
    point.position.y += 0.8;
    point.position.x -= lanes[Math.floor(Math.random() * 3)];
    point.position.z = -85-Math.floor(Math.random() * 150);
    const pointBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(point);
    pointBox.userData = { type: 'p' };
    objectsBoxes.push(pointBox);
  }
  
  static createObstacle(i){
    var h;
    if(i%2 == 0) h = 2;
    else h = 5;
    const geometry = new THREE.BoxBufferGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x858583,
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
  }
}

class Animator {
  constructor() {}

  static jumpUp(object, rotate){
    var rArm = character.getObjectByName("R_arm_035").rotation;
    var lArm = character.getObjectByName("L_arm_019").rotation;
    isJumping = true;
    var rot_x = object.rotation.x;
    createjs.Tween.get(object.rotation, { loop: false }).to({ x: rot_x+Math.PI*0.13 }, 470/speed/25, createjs.Ease.getPowInOut(3)).to({ x: rot_x }, 470/speed/25, createjs.Ease.getPowInOut(3));
    if(rotate){
      var rot_y = object.rotation.y;
      createjs.Tween.get(object.rotation, { loop: false }).to({ y: rot_y+Math.PI*2 }, 940/speed/25, createjs.Ease.getPowInOut(3));
    }else{
      rot_x = rArm.x;
      createjs.Tween.get(rArm, { loop: false }).to({ x: rot_x-Math.PI*0.3 }, 460/speed/25, createjs.Ease.getPowInOut(3)).to({ x: rot_x }, 460/speed/25, createjs.Ease.getPowInOut(3));
      rot_x = lArm.x;
      createjs.Tween.get(lArm, { loop: false }).to({ x: rot_x+Math.PI*0.3 }, 460/speed/25, createjs.Ease.getPowInOut(3)).to({ x: rot_x }, 460/speed/25, createjs.Ease.getPowInOut(3));
    }
    var mod_y = object.position.y; 
    createjs.Tween.get(object.position, { loop: false }).to({ y: mod_y+2.8 }, 470/speed/25, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 470/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
      isJumping = false;
    });
  }

  static jumpLeft(object, rotate){
    isJumping = true;
    var mod_y = object.position.y; 
    createjs.Tween.get(object.position, { loop: false }).to({ y: mod_y+1.5 }, 450/speed/25, createjs.Ease.getPowInOut(3)).to({ y: mod_y }, 450/speed/25, createjs.Ease.getPowInOut(3));
    if(rotate){
      var rot = object.rotation.y;
      createjs.Tween.get(object.rotation, { loop: false }).to({ y: rot+Math.PI*2 }, 900/speed/25, createjs.Ease.getPowInOut(3));
    }
    var mod_x = object.position.x; 
    createjs.Tween.get(object.position, { loop: false }).to({ x: mod_x-1.9 }, 450/speed/25, createjs.Ease.getPowInOut(3)).to({ x: mod_x-3.8 }, 450/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
      isJumping = false;
    });
  }

  static jumpRight(object, rotate){
    isJumping = true;
    var mod_y = object.position.y; 
    createjs.Tween.get(object.position, { loop: false }).to({ y: mod_y+1.5 }, 450/speed/25, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 450/speed/25, createjs.Ease.getPowInOut(3));
    if(rotate){
      var rot = object.rotation.y;
      createjs.Tween.get(object.rotation, { loop: false }).to({ y: rot-Math.PI*2 }, 900/speed/25, createjs.Ease.getPowInOut(3));
    }
    var mod_x = object.position.x; 
    createjs.Tween.get(object.position, { loop: false }).to({ x: mod_x+1.9 }, 450/speed/25, createjs.Ease.getPowInOut(3)).wait(0).to({ x: mod_x+3.8 }, 450/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
      isJumping = false;
    });
  }

  static idleAnimation(){
    character.getObjectByName("spine_013").rotation.z += 0.004*idleRotation;
    character.getObjectByName("Joint_1_016").rotation.x -= 0.003*idleRotation;
    character.getObjectByName("R_shoulder_031").rotation.x -= 0.004*idleRotation;
  }

  static legRotation(){
    var rot = character.getObjectByName("L_ankle1_03").rotation
    var rot_x = rot.z;
    createjs.Tween.get(rot, { loop: true }).wait(2000).to({ z: rot_x+Math.PI*0.15 }, 2*470, createjs.Ease.getPowInOut(3)).wait(10000).to({ z: rot_x }, 2*470, createjs.Ease.getPowInOut(3)).wait(10000);
  }

}




window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}  

function onKeyDown(event){
  var code = event.keyCode;
  switch(code){
    case 32: //space
      if(!isJumping){
        var rotate = false;
        if(Math.floor(Math.random() * 4) == 1) rotate = true; 
        Animator.jumpUp(character,rotate);
      }
      break;
    case 65: // a
      if(!isJumping && lane != 0){
        lane--;
        var rotate = false;
        if(Math.floor(Math.random() * 2) == 1) rotate = true;
        Animator.jumpLeft(character,rotate);
      }
      break;
    case 68: //d
      if(!isJumping && lane != 2){
        lane++;
        var rotate = false;
        if(Math.floor(Math.random() * 2) == 1) rotate = true;
        Animator.jumpRight(character,rotate);
      }
      break;
  }
}



function animate() {
  requestAnimationFrame( animate );
  render();
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
        console.log("obstacle");
        //alert("Game Over");
      }
    }
  }
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


/*
Joint_2_2_033 : braccio destro
R_arm_035 : braccio destro
L_arm_019 : braccio sinistro
Joint_3_018 : braccio sinistro
Joint_2_017 : braccio sinistro ma angolo diverso
Joint_1_016 : braccio sinistro un pò più giù
spine_013 : vita
R_ankle1_09 : ginocchio basso destro
R_knee_08 : ginocchio alto
R_leg_07 : gamba destra
L_leg_01 : gamba sinistra
R_ankle_010 : caviglia destra
hips_00
R_shoulder_031 : spalla destra



*/

function render() {
  checkCollisions();
  Animator.idleAnimation();
  //character.rotation.y += 0.003; 
  //character.getObjectByName("L_leg_01").rotation.x += 0.002*idleRotation;
  objectsParent.position.z += speed*10;
  updatePlanets();
  surfBox.setFromObject(surf);
  updateObjectsPosition();
  distance += speed*2.5;
  distance_div.innerHTML = "Distance: " + parseInt(distance);
  total_score_div.innerHTML = "Total Score: " + (parseInt(distance) + points*10);
  lanes_tex.offset.x = (lanes_tex.offset.x+speed*2.5)%4 - 2;
  renderer.render(scene, camera);
}

