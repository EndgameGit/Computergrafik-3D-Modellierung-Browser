import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Water } from 'three/examples/jsm/objects/Water'

const clock = new THREE.Clock()

function main(){

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
        1,                                      // Near clipping plane
        1000                                    // Far clipping plane
    )

    // Camera is by default set to (0,0,0) -> Change position and view
    camera.position.x = 1
    camera.position.y = 5
    camera.position.z = 5
    // Changes the view of the camera
    camera.lookAt(new THREE.Vector3(0,0,-5))

    // Add an orbitcontrol class instance
    var controls = new OrbitControls(camera, renderer.domElement)

    // Add an ambient light
    var ambientLight = generateAmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add a point light
    var pointLight = generatePointLight(0xffffff, 1)
    pointLight.position.y = 5
    pointLight.position.z = -3
    scene.add(pointLight)

    // Add a background to the scene
    scene.background = generateBackground()

    // Add a moon to the scene
    scene.add(generatePlanet("moon.jpg", -25,6,25))

    // Add water
    var water = generateWater();
    water.name = "water";
    water.rotation.x = - Math.PI / 2;
    water.position.y = 2;
	scene.add(water);


    // Add a floor to the the scene
    var floor = generateFloor(20, 20)
    floor.name = "floor"
    scene.add(floor)
    floor.rotation.x = Math.PI/2

    // Load a tablelamp modell imported from blender
    var tableLamp = loadGLTFModell("TischlampeRed.glb", 0.1)
    scene.add( tableLamp )
    tableLamp.position.set(0,2,0)
    // Load the table modell from blender
    var table = loadGLTFModell("Tisch.gltf", 0.3)
    scene.add(table)

    //animate the scene
    update(renderer, scene, camera, controls)
}

function update(renderer, scene, camera, controls){
    renderer.render(scene, camera)

    // var floor = scene.getObjectByName("floor")
    // scene.children[0].rotation.y += 0.002
    // floor.rotation.z += 0.001
    // scene.traverse(function(child){
    //     child.position.x += 0.001
    // })

    var step = 50*clock.getDelta()

    var water = scene.getObjectByName("water")
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0

    controls.update()

    requestAnimationFrame(function(){
        update(renderer, scene, camera, controls)
    })
}


function generateAmbientLight(color, intensity){
    // Generates an all shining light source
    var ambientLight = new THREE.AmbientLight(color, intensity)

    return ambientLight
}


function generatePointLight(color, intensity){
    // Generates a point light as a light source
    var pointLight = new THREE.PointLight(color, intensity)
    pointLight.castShadow = true

    return pointLight
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


function loadGLTFModell(filename, scale){
    var loader = new GLTFLoader()
    var modell = new THREE.Object3D()
    loader.load( 'models/'+filename, function ( gltf ) {
        gltf.scene.scale.set(scale *gltf.scene.scale.x, scale *gltf.scene.scale.y, scale *gltf.scene.scale.z)
        modell.add( gltf.scene )
    })
    return modell
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
    return water;
}

main()
