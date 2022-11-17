import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Water } from 'three/examples/jsm/objects/Water'
import { GUI } from 'dat.gui'

const clock = new THREE.Clock()
const keyboard = new THREEx.KeyboardState()
var activeCamera

async function main(){

    // Create an instance of the WebGL Renderer as a tool that three.js uses to alocate space on the webpage
    var renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('canvas.webgl')
    })
    renderer.shadowMap.enabled = true
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor("rgb(60,60,60)")
    renderer.outputEncoding = THREE.sRGBEncoding

    // Create a scene and camera
    var scene = new THREE.Scene()

    var camera = new THREE.PerspectiveCamera(
        45,                                     // Field of View (normally between 40 and 80)
        window.innerWidth/window.innerHeight,   // Site Ratio (aspect)
        0.1,                                      // Near clipping plane
        1000                                    // Far clipping plane
    )
    camera.position.set(7, 7, 0)


    // Add an orbitcontrol class instance
    var controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI * 0.495
    controls.target.set(0, 2, 0)
    controls.minDistance = 4.0
    controls.maxDistance = 10.0

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    // Add an ambient light
    var ambientLight = generateAmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    // Add a background to the scene
    scene.background = generateBackground()

    // Add some planets to the scene
    scene.add(generatePlanet("moon.jpg", -25,6,45))
    scene.add(generatePlanet("earth.jpg", -20,6,15))
    scene.add(generatePlanet("mars.jpg", 25,6,-25))
    scene.add(generatePlanet("venus.jpg", -15,6,-25))

    // Add water
    var water = generateWater(2,2)
    water.name = "water"
    water.rotation.x = - Math.PI / 2
    water.position.set(0,2.25,0)
	scene.add(water)


    // Add a floor to the the scene
    var floor = generateFloor(30, 30)
    floor.name = "floor"
    scene.add(floor)
    floor.rotation.x = Math.PI/2
    

    // Load the table modell from blender
    var [table, tableBox] = await loadGLTFModell("Tisch/NewestTisch.gltf", 0.7)
    scene.add(table)

    // Load a tablelamp modell imported from blender
    var deskLamp = await generateDeskLamp(2, 8*Math.PI/10, -tableBox.max.x + 0.4, tableBox.max.y-0.4, 2.4)
    scene.add(deskLamp)
    

    //add a test car
    var [car, carBox] = await loadGLTFModell("sportcar.017.glb", 0.002)
    car.name= "car"
    scene.add(car)
    //place the car on the table
    car.position.set(0,0,0)
    

    // Add ball
    var ball = generateBall(0.25, 0xff00ff, 0, 0.25, 2)
    ball.name = "ball"
    scene.add(ball)

    var firstPersonCamera = new THREE.PerspectiveCamera(
        45,                                     // Field of View (normally between 40 and 80)
        window.innerWidth/window.innerHeight,   // Site Ratio (aspect)
        0.1,                                      // Near clipping plane
        1000                                    // Far clipping plane
    )
    firstPersonCamera.position.set(0, carBox.max.y, 0)

    // Camera is by default set to (0,0,0) -> Change position and view
    // firstPersonCamera.position.set(0,tableBox.max.y+0.2,-0.2)
    // firstPersonCamera.rotation.x = Math.PI
    firstPersonCamera.rotation.y = Math.PI
    car.attach(firstPersonCamera)

    // Changes the view of the firstPersonCamera
    // firstPersonCamera.lookAt(new THREE.Vector3(0,1,0))

    var cameraViews = ["orbitcontrol", "first-person"]

    var settings = {
        camera: cameraViews[0]
    }

    activeCamera = camera

    var gui = new GUI()
    gui.add(settings, "camera", cameraViews).onChange( function() {
        if (settings.camera == "orbitcontrol") {
            console.log("orbitcontrol")
            activeCamera = camera
        }
        if (settings.camera == "first-person") {
            console.log("first-person")
            activeCamera = firstPersonCamera
        }
    }); 

    //animate the scene
    update(renderer, scene, controls)
}

function update(renderer, scene, controls){

    renderer.render(scene, activeCamera)
    controls.update()

    // var floor = scene.getObjectByName("floor")
    // scene.children[0].rotation.y += 0.002
    // floor.rotation.z += 0.001
    // scene.traverse(function(child){
    //     child.position.x += 0.001
    // })

    var step = 5*clock.getDelta()
    var car = scene.getObjectByName("car")
    var ball = scene.getObjectByName("ball")
    // camera.position.set(car.position)
    if(keyboard.pressed("W")){
        car.translateZ(step)
    }
    if(keyboard.pressed("S")){
        car.translateZ(-step)
    }
    if(keyboard.pressed("W+A")){
        car.rotation.y += 0.1;
    }
    if(keyboard.pressed("W+D")){
        car.rotation.y -= 0.1;
    }
    if(keyboard.pressed("S+D")){
        car.rotation.y += 0.1;
    }
    if(keyboard.pressed("S+A")){
        car.rotation.y -= 0.1;
    }

    var water = scene.getObjectByName("water")
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0

    var carBB = generateBB(car)
    var ballBB = generateBB(ball)
    
    var BBs = [carBB, ballBB]

    var dir = new THREE.Vector3() // direction vector

    BBs.forEach(bb => {
        // Filter out this bb from BBs
        const otherBBs = BBs.filter(other => other !== bb)
      
        // Check if any of the other BBs intersects with this bb
        otherBBs.forEach(other => {
          if (bb.intersectsBox(other)) {
            // Collision ! Do something
            console.log('collision')
            dir.subVectors(ball.position, car.position).normalize()
            ball.position.set(
                ball.position.x + dir.x / 20,
                0.25,
                ball.position.z + dir.z / 20
            )
          }
        })
    })

    requestAnimationFrame(function(){
        update(renderer, scene, controls)
    })
}


function generateAmbientLight(color, intensity){
    // Generates an all shining light source
    var ambientLight = new THREE.AmbientLight(color, intensity)

    return ambientLight
}


function generateBackground(){
    // Generates a cube around the scene with universe images as background
    var filenames = ["px", "nx", "py", "ny", "pz", "nz"]
    var reflectionCube = new THREE.CubeTextureLoader().load(filenames.map(
        function(filename) {
            return "img/MilkyWay/" + filename + ".jpg"
        }
    ))
    return reflectionCube
}


function generatePlanet(imgFilename, x,y,z){
    // Defining the planet geometry
    var planetGeometry = new THREE.SphereGeometry(3,40,40)

    // Defining the sphere texture
    var loader = new THREE.TextureLoader()
    var planetTexture = loader.load("img/"+imgFilename)

    // Defining the sphare material
    var planetMaterial = new THREE.MeshBasicMaterial({map: planetTexture})

    // Creates the planet object, changes position and returns it
    var planet = new THREE.Mesh(planetGeometry, planetMaterial)
    planet.position.set(x,y,z)
    
    return planet
}


function generateFloor(w, d){
    // Defining the floor geometry
    var floorGeometry = new THREE.PlaneGeometry(w, d)
    
    // Defining the floor texture
    var textureLoader = new THREE.TextureLoader()
    var floorTexture = textureLoader.load("img/checkboard.jpg")
    floorTexture.wrapS = THREE.RepeatWrapping
    floorTexture.wrapT = THREE.RepeatWrapping
    floorTexture.repeat.set(5,5)

    // Defining the floor material
    var floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture, side: THREE.DoubleSide})

    // Creates the floor object and returns it
    var floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.receiveShadow = true

    return floor
}


function generateBall(r, color, x, y, z) {
    var geometry = new THREE.SphereGeometry(r, 32, 16)
    var material = new THREE.MeshStandardMaterial({ color: color })
    var ball = new THREE.Mesh(geometry, material)

    ball.position.set(x, y, z)
    ball.castShadow = true
    ball.receiveShadow = true

    return ball
}

function generateBB(object) {
    
    var object_bb = new THREE.Box3().setFromObject(object, true)

    return object_bb
}



async function loadGLTFModell(filename, scale){
    var loader = new GLTFLoader()
    var modell = new THREE.Object3D()
    var bbox = new THREE.Box3()
    var gltf = await loader.loadAsync( 'models/'+filename)
    gltf.scene.scale.set(scale *gltf.scene.scale.x, scale *gltf.scene.scale.y, scale *gltf.scene.scale.z)
    modell.add( gltf.scene )
    modell.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
        node.castShadow = true;
        node.receiveShadow = true;
    } } )
    bbox.setFromObject(modell)
    
    return [modell, bbox]
}


function generateWater(width, length){
    const waterGeometry = new THREE.PlaneGeometry( width, length );

    var water = new Water(
        waterGeometry,
        {
            textureWidth: 500,
            textureHeight: 500,
            waterNormals: new THREE.TextureLoader().load( 'img/waterNormal.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            waterColor: 0x001e0f,
            distortionScale: 1.7
        }
    );
    return water
}


async function generateDeskLamp(scale, rotationY, x, y, z) {
    // Load a tablelamp modell imported from blender
    var [tableLamp, tableLampBox] = await loadGLTFModell("TischlampeRed.glb", 0.1)

    var sphereGeometry = new THREE.SphereGeometry(0.08, 32, 16)
    var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffbb } )
    var lightbulb = new THREE.Mesh( sphereGeometry, sphereMaterial )
    lightbulb.position.set(0, 0.71, 0.35)

    // Add point light to lamp
    var spotlight = new THREE.SpotLight( 
        0xffffbb, // color
        1, // intensity
        20, // distance
        Math.PI/4, // angle (upper bound is Math.PI/2)
        0.1, // penumbra
        1, // decay = dims alogn the distance
    )
    spotlight.position.set(0, 0.71, 0.35)
    spotlight.castShadow = true

    var targetObject = new THREE.Object3D()
    targetObject.position.set(0, 0, 1)
    spotlight.target = targetObject
    
    var group = new THREE.Group()
    group.add(tableLamp)
    group.add(lightbulb)
    group.add(spotlight)
    group.add(targetObject)

    group.scale.set(scale, scale, scale)
    group.position.set(x, y, z)
    group.rotation.y = rotationY

    return group
}

main()
