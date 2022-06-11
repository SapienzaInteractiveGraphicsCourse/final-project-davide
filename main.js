import * as THREE from 'https://cdn.skypack.dev/three@0.134.0/build/three.module.js';
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';


var model;
var isJumping = false;
var color = 0xE50914;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const texloader = new THREE.TextureLoader();
const rainbow_tex = texloader.load('images/film.jpg');;
const speed = 0.0015;
const objectsParent = new THREE.Group();
scene.add(objectsParent);
const floors = [8.5,4.2,0];
createjs.Ticker.timingMode = createjs.Ticker.RAF;
createjs.Ticker.addEventListener("tick", animate);

window.onload  = createScene;

function createScene(){
  renderer.setClearColor(color);
  camera.position.z = 6;
  camera.position.x = -3;
  camera.position.y = 6;
  camera.rotation.x += Math.PI*-0.2;
  camera.rotation.y += 0;
  camera.rotation.z += 0;

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
  directionalLight.castShadow = true;
  scene.add( directionalLight );
  directionalLight.position.set( 0, 2, 1.5 );
  
  
  rainbow_tex.wrapS = THREE.RepeatWrapping;
  rainbow_tex.wrapT = THREE.RepeatWrapping;
  rainbow_tex.repeat.set(30, 1);
  rainbow_tex.rotation = Math.PI/2;
  createFloor(8.5);
  createFloor(4.2);
  createFloor(0);

  for (let i = 0; i < 10; i++) createPoints();
  
  const loader = new GLTFLoader();
  loader.load( 'models/skater_boy/scene.gltf', function ( gltf ) {

    model = gltf.scene;
    scene.add( model );
    //model.scale.set(0.4,0.4,0.4);
    model.rotation.y += Math.PI;
    model.scale.set(1,1,1);

    var c = model.children[0];
    console.log(c);
    while(c != undefined){
        c = c.children;
        if( c == undefined) break;
        c = c[0];
        if( c == undefined) break;
        console.log(c.name);
        if(c.name=="RootNode") console.log(c);
    }
    //var skate = model.getObjectByName("Skate");
    animate();
    //createjs.Tween.get(model.rotation, { loop: true }).wait(500).to({ y: Math.PI*2 }, 1500, createjs.Ease.getPowInOut(3)).wait(500);
      
  }, undefined, function ( error ) {

    console.error( error );

  } );
}

function createFloor(x){
  const geometry1 = new THREE.BoxGeometry( 2, 0.1, 100 );
  const material1 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: rainbow_tex,
  });
  const floor1 = new THREE.Mesh( geometry1, material1 );
  scene.add( floor1 );
  floor1.position.y -= 0.6;
  floor1.position.x -= x;
}

function createPoints(){
  const geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial({
    color: 0x80ff80,
  });
  const point = new THREE.Mesh( geometry, material );
  objectsParent.add(point);
  point.position.x -= floors[Math.floor(Math.random() * 3)];
  point.position.z = -40;
  
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
        var mod_y = model.position.y; 
        createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+2 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3)).call(function() {
          isJumping = false;
        });
      }
      break;
    case 65: // a
      if(!isJumping){
          isJumping = true;
          var mod_y = model.position.y; 
          createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+1.5 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3));
          var mod_x = model.position.x; 
          createjs.Tween.get(model.position, { loop: false }).to({ x: mod_x-2 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ x: mod_x-4 }, 500, createjs.Ease.getPowInOut(3)).call(function() {
            isJumping = false;
          });
      }
      break;
    case 68: //d
      if(!isJumping){
        isJumping = true;
        var mod_y = model.position.y; 
        createjs.Tween.get(model.position, { loop: false }).to({ y: mod_y+1.5 }, 500, createjs.Ease.getPowInOut(3)).wait(0).to({ y: mod_y }, 500, createjs.Ease.getPowInOut(3));
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
  rainbow_tex.offset.x = (rainbow_tex.offset.x+speed)%4 - 2;
  renderer.render(scene, camera);
}

