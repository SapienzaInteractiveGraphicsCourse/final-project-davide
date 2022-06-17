import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

//var surf, surfBox;
//var planet1,planet2;
var character, characterBox;
var isJumping = false;
var color = 0x000000;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
const renderer = new THREE.WebGLRenderer();
const texloader = new THREE.TextureLoader();
const lanes_tex = texloader.load('images/silver_texture.jpg');
var speed = 0.04;
const objectsParent = new THREE.Group();
scene.add(objectsParent);
const lanes = [-4.25,4.25,0];
var lane = 1;
//var collision_distance = 0.2;
const points_frequency = 15;
const obstacles_frequency = 8;
const visible_planets = [];
const pending_planets = [];
const objectsBoxes = [];
const objects = [];
const trajectories = [
  {point_x : 10, point_y : 2, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -10, point_y : 2, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 12, point_y : 1, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -12, point_y : 4, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : -13, point_y : 8, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 13, point_y : 16, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : 13, point_y : -3, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -15.1, point_y : -4, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : -15, point_y : 22, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 10, point_y : 25, point_z : -100, x_speed : 0.01, z_speed : 0.3},
  {point_x : -10, point_y : 18, point_z : -100, x_speed : -0.01, z_speed : 0.3},
  {point_x : 15.1, point_y : -4, point_z : -100, x_speed : 0.01, z_speed : 0.3}
] 
var last_collision;
var total_score_div = document.getElementById('total_score');
var distance_div = document.getElementById('distance');
var points_div = document.getElementById('points');
var points = 0;
var distance = 0;

window.onload  = createScene;

function createScene(){
  renderer.setClearColor(color);
  camera.position.z = 6;
  camera.position.x = 0;
  camera.position.y = 6;
  camera.rotation.x += Math.PI*-0.1;
  camera.rotation.y += 0;
  camera.rotation.z += 0;



  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const light = new THREE.DirectionalLight( 0xffffff, 0.60 );
  light.castShadow = true;
  scene.add( light );
  light.position.set( 0, 3, 1.5 );


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
  //addRandom(planets,elem);
  visible_planets.push([imageLoader("images/planet1.png",10,2,-20,4),[0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet1.png",-13,2,-15,4),[-0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet1.png",-15.1,-4,-90,4),[-0.01,0.3]]);
  visible_planets.push([imageLoader("images/planet1.png",12,20,-90,4),[0.01,0.3]]);

  pending_planets.push(imageLoader("images/planet1.png",0,0,10,4));
  pending_planets.push(imageLoader("images/planet1.png",0,0,10,4));
  pending_planets.push(imageLoader("images/planet1.png",0,0,10,4));
  pending_planets.push(imageLoader("images/planet1.png",0,0,10,4));

  for (let i = 0; i < points_frequency; i++) ObjectCreator.createPoint();
  for (let i = 0; i < obstacles_frequency; i++) ObjectCreator.createObstacle();
  
  const character_loader = new GLTFLoader();

  
          /*
  const surf_loader = new GLTFLoader();
  surf_loader.load( 'models/surf/scene.gltf', function ( gltf ) {
    surf = gltf.scene;
    scene.add( surf );
    surf.scale.set(0.025,0.025,0.025);
    surf.position.x += 0.1;
    surf.position.y += 0.2;
  surfBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(surf);*/
  character_loader.load( 'models/space_racer/scene.gltf', function ( gltf ) {
    character = gltf.scene;
    scene.add(character);
    character.scale.set(0.05,0.05,0.05);
    character.rotation.y += Math.PI;
    //character.rotation.y += Math.PI*0.7;
    
    /*
    character.getObjectByName("ORG-shoulder_R_047").rotation.x += Math.PI*0.35;
    character.getObjectByName("ORG-shoulder_R_047").rotation.y += Math.PI*0.2;
    character.getObjectByName("ORG-shoulder_R_047").rotation.z -= Math.PI*0.15;
    character.getObjectByName("DEF-upper_arm_R_002_051").rotation.y -= Math.PI*0.15; */

    /*
    character.getObjectByName("ORG-shoulder_L_026").rotation.x += Math.PI*0.35;
    character.getObjectByName("ORG-shoulder_L_026").rotation.y += Math.PI*0.2;
    character.getObjectByName("ORG-shoulder_L_026").rotation.z -= Math.PI*0.15;*/
    //character.getObjectByName("DEF-upper_arm_L_001_08").rotation.y -= Math.PI*0.15;
    //DEF-upper_arm_L_001_08
    //DEF-upper_arm_L_002_09
    character.position.x += 0.102;
    character.position.y += 0.6;
    character.position.z += 0.5;
    characterBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(character);
    animate();
    setInterval(function () {speed += 0.001}, 10000);
    setInterval(function () {
      var planet = pending_planets.pop();
      if( planet != undefined){
        var tr = trajectories[Math.floor(Math.random() * trajectories.length)]
        //planet.position.set(5,2,-10);
        planet.position.set(tr.point_x,tr.point_y,tr.point_z);
        visible_planets.push([planet, [tr.x_speed,tr.z_speed]]);
      }
    }, 25000);  
}, undefined, function ( error ) {
  console.error( error );
} );
  /*
    //surf.rotation.y += Math.PI/2;
    //surf.rotation.y += Math.PI;
  }, undefined, function ( error ) {
    console.error( error );
  } );*/
}

function imageLoader(path,x,y,z,scale){
  var map = new THREE.TextureLoader().load(path);
  var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
  var image = new THREE.Sprite( material );
  scene.add( image );
  image.position.set(x,y,z);
  image.scale.set(scale,scale,scale);
  return image;
}

function addRandom(array,elem){
  var rand = Math.floor(Math.random() * (array.length - 0)) + 1;
  array.splice(rand, 0, elem);
}


class ObjectCreator {
  constructor() {}

  static createLane(x){
    const geometry = new THREE.BoxGeometry( 2, 0.1, 120 );
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: lanes_tex,
    });
    const lane = new THREE.Mesh( geometry, material );
    scene.add( lane );
    lane.position.y -= 0.6;
    lane.position.x -= x;
    lane.position.z -= 40;
  }
  
  static createPoint(){
    const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial({
      color: 0x80ff80,
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
  
  static createObstacle(){
    var tmp = Math.floor(Math.random() * 2);
    if(tmp == 0){
      tmp = 2;
    }else{
      tmp = 5
    }
    const geometry = new THREE.BoxBufferGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x858583,
    });
    const point = new THREE.Mesh( geometry, material );
    objectsParent.add(point);
    point.scale.set(2, tmp, 0.5);
    point.position.y += tmp*0.38;
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
    isJumping = true;
    var rot_x = object.rotation.x;
        createjs.Tween.get(object.rotation, { loop: false }).to({ x: rot_x+Math.PI*0.1 }, 450/speed/25, createjs.Ease.getPowInOut(3)).to({ x: rot_x }, 450/speed/25, createjs.Ease.getPowInOut(3));
        if(rotate){
          var rot_y = object.rotation.y;
          createjs.Tween.get(object.rotation, { loop: false }).to({ y: rot_y+Math.PI*2 }, 900/speed/25, createjs.Ease.getPowInOut(3));
        }
        var mod_y = object.position.y; 
        createjs.Tween.get(object.position, { loop: false }).to({ y: mod_y+2.5 }, 450/speed/25, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 450/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
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
    createjs.Tween.get(object.position, { loop: false }).to({ x: mod_x-2 }, 450/speed/25, createjs.Ease.getPowInOut(3)).to({ x: mod_x-4 }, 450/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
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
    createjs.Tween.get(object.position, { loop: false }).to({ x: mod_x+2 }, 450/speed/25, createjs.Ease.getPowInOut(3)).wait(0).to({ x: mod_x+4 }, 450/speed/25, createjs.Ease.getPowInOut(3)).call(function() {
      isJumping = false;
    });
  }
}




window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}  

document.addEventListener("keydown", onKeyDown, false);
function onKeyDown(event){
  var code = event.keyCode;
  switch(code){
    case 32: //space
      if(!isJumping){
        var rotate = false;
        if(Math.floor(Math.random() * 4) == 1) rotate = true; 
        //Animator.jumpUp(surf,rotate);
        Animator.jumpUp(character,rotate);
      }
      break;
    case 65: // a
      if(!isJumping && lane != 0){
        lane--;
        var rotate = false;
        if(Math.floor(Math.random() * 2) == 1) rotate = true;
        //Animator.jumpLeft(surf,rotate);
        Animator.jumpLeft(character,rotate);
      }
      break;
    case 68: //d
      if(!isJumping && lane != 2){
        lane++;
        var rotate = false;
        if(Math.floor(Math.random() * 2) == 1) rotate = true;
        //Animator.jumpRight(surf,rotate);
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
    if (characterBox.intersectsBox(box) && box != last_collision) {
      last_collision = box;
      if( box.userData.type == "p"){
        //console.log("point");
        var obj = objectsParent.children[i];
        obj.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 150);
        obj.position.x = lanes[Math.floor(Math.random() * 3)];
        objectsBoxes[i].setFromObject(obj);
        points++;
        points_div.innerText = "Points: " + points;
      }else{
        console.log("obstacle");
      }
    }
  }
}



/*
DEF-upper_arm_L_002_09 : braccio sinistro

DEF-thigh_R_097 : gamba destra

DEF-shin_L_092 : ginocchio sinistro
DEF-shin_L_001_095 : ginocchio sinistro
DEF-shin_R_099 : ginocchio destro
DEF-shin_R_001_0101 : ginocchio destro

DEF-f_index_03_L_030 : falange indice sinistro
*/

function render() {

  checkCollisions();

  objectsParent.position.z += speed*10;
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
  //character.getObjectByName("PRT-forearmItem_025").rotation.y += 0.02;
  //character.rotation.y += 0.01;
  //surf.rotation.y += 0.01;
  characterBox.setFromObject(character);
  var i = 0;
  objectsParent.traverse((child) => {
    if (child.type == "Mesh") {
      objectsBoxes[i].setFromObject(child);//update boundingbox
      i++;
      const z_pos = child.position.z + objectsParent.position.z;
      if(z_pos > 10){
        child.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 150);
        child.position.x = lanes[Math.floor(Math.random() * 3)];
      }
  }
  });
  distance += speed*2.5;
  distance_div.innerHTML = "Distance: " + parseInt(distance);
  total_score_div.innerHTML = "Total Score: " + (parseInt(distance) + points*10);
  lanes_tex.offset.x = (lanes_tex.offset.x+speed*2.5)%4 - 2;
  renderer.render(scene, camera);
}

