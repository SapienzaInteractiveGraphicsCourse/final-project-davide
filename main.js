import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

var model;
var isJumping = false;
var color = 0xE50914;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 110 );
const renderer = new THREE.WebGLRenderer();
const texloader = new THREE.TextureLoader();
const lanes_tex = texloader.load('images/film.jpg');
var speed = 0.04;
const objectsParent = new THREE.Group();
scene.add(objectsParent);
const lanes = [-4.25,4.25,0];
var lane = 1;
const points_frequency = 15;
const obstacles_frequency = 10;
//createjs.Ticker.timingMode = createjs.Ticker.RAF;
//createjs.Ticker.addEventListener("tick", animate);

window.onload  = createScene;

function createScene(){
  renderer.setClearColor(color);
  camera.position.z = 6;
  camera.position.x = 0;
  camera.position.y = 6;
  camera.rotation.x += Math.PI*-0.2;
  camera.rotation.y += 0;
  camera.rotation.z += 0;

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const light = new THREE.DirectionalLight( 0xffffff, 0.85 );
  light.castShadow = true;
  scene.add( light );
  light.position.set( 0, 3, 1.5 );
  
  
  lanes_tex.wrapS = THREE.RepeatWrapping;
  lanes_tex.wrapT = THREE.RepeatWrapping;
  lanes_tex.repeat.set(30, 1);
  lanes_tex.rotation = Math.PI/2;
  createLane(-4.25);
  createLane(0);
  createLane(4.25);

  for (let i = 0; i < points_frequency; i++) createPoint();
  for (let i = 0; i < obstacles_frequency; i++) createObstacle();
  
  const loader = new GLTFLoader();
  loader.load( 'models/nevid_skate/scene.gltf', function ( gltf ) {
    model = gltf.scene;
    scene.add( model );
    model.scale.set(0.3,0.3,0.3);
    model.rotation.y += Math.PI/2;
    model.position.x += 0.1;
    var skate = model.getObjectByName("Object_11");
    //skate.position.y += 6;
    //skate.rotation.y += Math.PI/2;
    //console.log(skate);
    //console.log(model);
    animate();
    setInterval(function () {speed += 0.001}, 10000);      
  }, undefined, function ( error ) {
    console.error( error );
  } );
}

function createLane(x){
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

function createPoint(){
  const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial({
    color: 0x80ff80,
  });
  const point = new THREE.Mesh( geometry, material );
  objectsParent.add(point);
  point.position.y += 0.8;
  point.position.x -= lanes[Math.floor(Math.random() * 3)];
  point.position.z = -85-Math.floor(Math.random() * 150);
}

function createObstacle(){
  var tmp = Math.floor(Math.random() * 2);
  if(tmp == 0){
    tmp = 2;
  }else{
    tmp = 5
  }
  const geometry = new THREE.BoxBufferGeometry( 2, tmp, 0.5 );
  const material = new THREE.MeshBasicMaterial({
    color: 0x858583,
  });
  const point = new THREE.Mesh( geometry, material );
  objectsParent.add(point);
  point.position.y += tmp*0.38;
  point.position.x -= lanes[Math.floor(Math.random() * 3)];
  point.position.z = -85-Math.floor(Math.random() * 150);
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
        isJumping = true;
        var rot_x = model.rotation.x;
        createjs.Tween.get(model.rotation, { loop: false }).to({ x: rot_x+Math.PI*0.1 }, 500, createjs.Ease.getPowInOut(3)).to({ x: rot_x }, 500, createjs.Ease.getPowInOut(3));
        if((Math.floor(Math.random() * 4) == 1)){
          var rot_y = model.rotation.y;
          createjs.Tween.get(model.rotation, { loop: false }).to({ y: rot_y+Math.PI*2 }, 1000, createjs.Ease.getPowInOut(3));
        }
        var mod_y = model.position.y; 
        createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+2.5 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3)).call(function() {
          isJumping = false;
        });
      }
      break;
    case 65: // a
      if(!isJumping && lane != 0){
          lane--;
          isJumping = true;
          var mod_y = model.position.y; 
          createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+1.5 }, 500, createjs.Ease.getPowInOut(3)).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3));
          if((Math.floor(Math.random() * 2) == 1)){
            var rot = model.rotation.y;
            createjs.Tween.get(model.rotation, { loop: false }).to({ y: rot+Math.PI*2 }, 1000, createjs.Ease.getPowInOut(3));
          }
          var mod_x = model.position.x; 
          createjs.Tween.get(model.position, { loop: false }).to({ x: mod_x-2 }, 500, createjs.Ease.getPowInOut(3)).to({ x: mod_x-4 }, 500, createjs.Ease.getPowInOut(3)).call(function() {
            isJumping = false;
          });
      }
      break;
    case 68: //d
      if(!isJumping && lane != 2){
        lane++;
        isJumping = true;
        var mod_y = model.position.y; 
        createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+1.5 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3));
        if((Math.floor(Math.random() * 2) == 1)){
          var rot = model.rotation.y;
          createjs.Tween.get(model.rotation, { loop: false }).to({ y: rot-Math.PI*2 }, 1000, createjs.Ease.getPowInOut(3));
        }
        var mod_x = model.position.x; 
        createjs.Tween.get(model.position, { loop: false }).to({ x: mod_x+2 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ x: mod_x+4 }, 500, createjs.Ease.getPowInOut(3)).call(function() {
          isJumping = false;
        });
      }
      break;
  }
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  objectsParent.position.z += speed*10;
  objectsParent.traverse((child) => {
    if (child.type == "Mesh") {
      const z_pos = child.position.z + objectsParent.position.z;
      if(z_pos > 10){
        child.position.z = -objectsParent.position.z-85-Math.floor(Math.random() * 150);
        child.position.x = lanes[Math.floor(Math.random() * 3)];
      }
  }
  });
  lanes_tex.offset.x = (lanes_tex.offset.x+speed)%4 - 2;
  renderer.render(scene, camera);
}

