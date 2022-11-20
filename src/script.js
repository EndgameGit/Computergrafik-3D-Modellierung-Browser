import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Water } from 'three/examples/jsm/objects/Water'
import { GUI } from 'dat.gui'

const clock = new THREE.Clock()
const keyboard = new THREEx.KeyboardState()
var activeCamera, mixer

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
    camera.position.set(7, 7, 2)


    // Add an orbitcontrol class instance
    var controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI * 0.495
    controls.target.set(0, 2, 0)
    controls.minDistance = 3.5
    controls.maxDistance = 18.0

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
    var [table, tableBox] = await loadGLTFModell("TischAnimation/NewestTisch.gltf", 0.7)
    scene.add(table)
    var tableCollisionGeometry = new THREE.BoxGeometry(0.29, 0.27, 0.27)
    var tableCollisionMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})

    var tableCollision1 = new THREE.Mesh(tableCollisionGeometry, tableCollisionMaterial)
    var tableCollision2 = new THREE.Mesh(tableCollisionGeometry, tableCollisionMaterial)
    var tableCollision3 = new THREE.Mesh(tableCollisionGeometry, tableCollisionMaterial)
    var tableCollision4 = new THREE.Mesh(tableCollisionGeometry, tableCollisionMaterial)

    tableCollision1.name = "tableCollision1"
    tableCollision2.name = "tableCollision2"
    tableCollision3.name = "tableCollision3"
    tableCollision4.name = "tableCollision4"

    tableCollision1.visible = false
    tableCollision2.visible = false
    tableCollision3.visible = false
    tableCollision4.visible = false

    scene.add(tableCollision1)
    scene.add(tableCollision2)
    scene.add(tableCollision3)
    scene.add(tableCollision4)

    tableCollision1.position.set(1.21, 0, 2.27)
    tableCollision2.position.set(-1.21, 0, 2.27)
    tableCollision3.position.set(-1.21, 0, -2.27)
    tableCollision4.position.set(1.21, 0, -2.27)


    // Load a tablelamp modell imported from blender
    var deskLamp = await generateDeskLamp(2, 8*Math.PI/10, -tableBox.max.x + 0.4, 2.34, 2.4)
    scene.add(deskLamp)
    
    var [bookshelf, bookshelfBox] = await loadGLTFModell("Old_Dusty_Bookshelf.glb", 3)
    scene.add(bookshelf)
    bookshelf.position.set(-10,0,-12)
    bookshelf.rotation.y = 5*Math.PI/4
    var bookshelf2 = bookshelf.clone()
    scene.add(bookshelf2)
    bookshelf2.position.set(-12,0,-10.4)

    var [leatherchair,leatherchairBox] = await loadGLTFModell("black_leather_chair.gltf", 3)
    scene.add(leatherchair)
    leatherchair.position.set(3.5,0,-1)
    leatherchair.rotation.y = 11*Math.PI/8

    //add drive car
    var [car, carBox] = await loadGLTFModell("sportcar.017.glb", 0.002)
    car.name= "car"
    scene.add(car)
    //place the car on the table
    car.position.set(0,0,0)
    

    // Add ball
    var ball = generateBall(0.25, 0, 0.25, 2)
    ball.name = "ball"
    scene.add(ball)
    // var objLoader = new OBJLoader();
    
    // objLoader.load("models/3002242.obj", function(object)
    // {    
    //     var armchair = object;
    //     armchair.scale.set(0.03,0.03,0.03)
    //     armchair.position.set(10,0,-8)
    //     scene.add( armchair );
    // });

    // var mtlLoader = new MTLLoader()
    // mtlLoader.load("models/armchair/Armchair_Monti_156__corona.mtl", function(materials)
    // {
    //     materials.preload();
    //     var objLoader = new OBJLoader();
    //     objLoader.setMaterials(materials);
    //     objLoader.load("models/armchair/Armchair_Monti_156__corona.obj", function(object)
    //     {    
    //         var armchair = object;
    //         armchair.scale.set(0.03,0.03,0.03)
    //         armchair.position.set(10,0,-8)
    //         scene.add( armchair );
    //     });
    // });
    //place the car
    car.position.set(0,0,0)
    var plant = await loadOBJModell("10461_Yucca_Plant_v1_max2010_it2", 0.02)
    var geo = new THREE.CylinderGeometry(0.35, 0.25, 1.5, 10, 10)
    var mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial())
    scene.add(plant)
    scene.add(mesh)
    plant.position.set(10,0,-8)
    mesh.position.set(10,0,-8)
    mesh.name = "plant1"
    mesh.visible = false
    

    plant.rotation.x = - Math.PI / 2
    var plant2 = plant.clone()
    var mesh2 = mesh.clone()
    scene.add(plant2)
    scene.add(mesh2)
    plant2.position.set(10,0,8)
    mesh2.position.set(10,0,8)
    mesh2.name = "plant2"

    var plant3 = plant.clone()
    var mesh3 = mesh.clone()
    scene.add(plant3)
    scene.add(mesh3)
    plant3.position.set(-11,0,-6)
    mesh3.position.set(-11,0,-6)
    mesh3.name = "plant3"

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
let speed = 0;
let rotationValue = 0.4
let maxTurning = 0.03

function update(renderer, scene, controls){

    var step = clock.getDelta()
    renderer.render(scene, activeCamera)
    controls.update()
    if (mixer != null) {
        mixer.update(step);
    };
    
    var car = scene.getObjectByName("car")
    var ball = scene.getObjectByName("ball")
    
    if(car.position.x < 14.8 && car.position.x > -14.8 && car.position.z< 14.8 && car.position.z > -14.8){
        
        if(keyboard.pressed("W")){
            if(speed < 12) speed += 0.15
        }else if(keyboard.pressed("S")){
            if(speed > -6) speed -= 0.15
        } else{
            if(-0.1 < speed && speed < 0.1) speed = 0
        }
        if(keyboard.pressed("A")){
            if(speed > 0.1) car.rotation.y += rotationValue/speed > maxTurning ? maxTurning : rotationValue/speed;
            if(speed < -0.1) car.rotation.y -= rotationValue/-speed > maxTurning ? maxTurning : rotationValue/-speed;
        }
        if(keyboard.pressed("D")){
            if(speed > 0.1) car.rotation.y -= rotationValue/speed > maxTurning ? maxTurning : rotationValue/speed;
            if(speed < -0.1) car.rotation.y += rotationValue/-speed > maxTurning ? maxTurning : rotationValue/-speed;
        }
    }else{
        car.translateZ(-speed*2*step)
        speed = 0;
    }
    if(speed > 0) speed -= 0.1
    if(speed < 0) speed += 0.1
    car.translateZ(speed*step)
    

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
            console.log(dir)
            if (dir.x <= 0) {
                console.log(dir.x)
                ball.rotation.z += 0.1
            }
            if (dir.x >= 0) {
                console.log(dir.x)
                ball.rotation.z -= 0.1
            }
            if (dir.z >= 0) {
                console.log(dir.z)
                ball.rotation.x += 0.1
            }
            if (dir.z <= 0) {
                console.log(dir.z)
                ball.rotation.x -= 0.1
            }
            
          }
        })
    })

    var leg1 = scene.getObjectByName("tableCollision1")
    var leg2 = scene.getObjectByName("tableCollision2")
    var leg3 = scene.getObjectByName("tableCollision3")
    var leg4 = scene.getObjectByName("tableCollision4")
    var plant1 = scene.getObjectByName("plant1")
    var plant2 = scene.getObjectByName("plant2")
    var plant3 = scene.getObjectByName("plant3")

    var leg1BB = generateBB(leg1)
    var leg2BB = generateBB(leg2)
    var leg3BB = generateBB(leg3)
    var leg4BB = generateBB(leg4)
    var plant1BB = generateBB(plant1)
    var plant2BB = generateBB(plant2)
    var plant3BB = generateBB(plant3)

    var tableBBs = [carBB, leg1BB, leg2BB, leg3BB, leg4BB, plant1BB, plant2BB, plant3BB]

    tableBBs.forEach(bb => {
        // Filter out this bb from BBs
        const otherBBs = tableBBs.filter(other => other !== bb)
      
        // Check if any of the other BBs intersects with this bb
        otherBBs.forEach(other => {
          if (bb.intersectsBox(other)) {
            // Collision ! Do something
            console.log('collision')
            if(keyboard.pressed("W")){
                car.translateZ(-speed*2*step)
                speed = 0;
            }
            if(keyboard.pressed("S")){
                car.translateZ(-speed*2*step)
                speed = 0;
            }
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


function generateBall(r, x, y, z) {
    var geometry = new THREE.SphereGeometry(r, 32, 16)
    var material = new THREE.MeshStandardMaterial({ 
        map: new THREE.TextureLoader().load(
            'img/ball.jpeg'
        ) 
    })
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
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( "libextern/draco/" );
    loader.setDRACOLoader( dracoLoader );
    var gltf = await loader.loadAsync( 'models/'+filename)
    gltf.scene.scale.set(scale *gltf.scene.scale.x, scale *gltf.scene.scale.y, scale *gltf.scene.scale.z)
    modell.add( gltf.scene )
    modell.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
        node.castShadow = true;
        node.receiveShadow = true;
    } } )
    bbox.setFromObject(modell)
    if(gltf.animations[0]){
        mixer = new THREE.AnimationMixer( gltf.scene );
        console.log(gltf.animations)
        
        mixer.clipAction( gltf.animations[0] ).play();
        mixer.clipAction( gltf.animations[1] ).play();
        mixer.clipAction( gltf.animations[2] ).play();
        mixer.clipAction( gltf.animations[3] ).play();

    }    
    return [modell, bbox]
}

async function loadOBJModell(filename, scale){
    var mtlLoader = new MTLLoader()
    var materials = await mtlLoader.loadAsync("models/"+filename+".mtl")
    
    // materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    var object = await objLoader.loadAsync("models/"+filename+".obj")
    object.scale.set(scale,scale,scale)
    return object;

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
