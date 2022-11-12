var clock = new THREE.Clock();

function main(){

    // Create an instance of the WebGL Renderer as a tool that three.js uses to alocate space on the webpage
    var renderer = new THREE.WebGLRenderer();

    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(60,60,60)");
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Inject the canvas element into the page
    document.getElementById("webgl").appendChild(renderer.domElement);

    // Create a scene and camera
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
        45,                                     // Field of View (normally between 40 and 80)
        window.innerWidth/window.innerHeight,   // Site Ratio (aspect)
        1,                                      // Near clipping plane
        1000                                    // Far clipping plane
    );

    // Add an orbitcontrol class instance
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Camera is by default set to (0,0,0) -> Change position and view
    camera.position.x = 1;
    camera.position.y = 5;
    camera.position.z = 5;
    // Changes the view of the camera
    camera.lookAt(new THREE.Vector3(0,0,-5));

    // Add an ambient light
    var ambientLight = generateAmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add a point light
    var pointLight = generatePointLight(0xffffff, 1);
    pointLight.position.y = 5;
    pointLight.position.z = -3;
    scene.add(pointLight);

    // Add a background to the scene
    scene.background = generateBackground();

    // Add a moon to the scene
    scene.add(generateMoon());

    // Add a floor to the the scene
    var floor = generateFloor(20, 20);
    floor.name = "floor";
    scene.add(floor);
    floor.rotation.x = Math.PI/2;

    

    new THREE.GLTFLoader()
        .load( 'models/TischlampeRed.glb', function ( gltf ) {
            gltf.scene.scale.set(.1*gltf.scene.scale.x, .1*gltf.scene.scale.y, .1 * gltf.scene.scale.z)
            gltf.scene.position.set(0,2,0);
            scene.add( gltf.scene );


        });
    new THREE.GLTFLoader()
        .load( 'models/Tisch.gltf', function ( gltf ) {
            gltf.scene.scale.set(.3*gltf.scene.scale.x, .3*gltf.scene.scale.y, .3* gltf.scene.scale.z);
            scene.add( gltf.scene );

        });

    update(renderer, scene, camera, controls);
}

function generateBackground(){
    var filenames = ["px", "nx", "py", "ny", "pz", "nz"];
    var reflectionCube = new THREE.CubeTextureLoader().load(filenames.map(
        function(filename) {
            return "img/MilkyWay/" + filename + ".jpg";
        }
    ));
    return reflectionCube;
}

function generateLamp(){
    var objLoader = new THREE.OBJLoader();
    var lamp = objLoader.load("/models/TischlampeRed.obj", function(object){
        object.scale.x = 4;
        object.scale.y = 4;
        object.scale.z = 4;
        
        return object;
    });
    return lamp;
}

function generateMoon(){
    // Defining the moon geometry
    var moonGeometry = new THREE.SphereGeometry(3,40,40);

    // Defining the sphere texture
    var loader = new THREE.TextureLoader();
    var moonTexture = loader.load("img/moon.jpg");

    // Defining the sphare material
    var moonMaterial = new THREE.MeshBasicMaterial({map: moonTexture});

    // Creates the moon object, changes position and returns it
    var moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = -25;
    moon.position.y = 25;
    moon.position.z = 25;
    
    return moon;
}


function generateFloor(w, d){
    // Defining the floor geometry
    var floorGeometry = new THREE.PlaneGeometry(w, d);
    
    // Defining the floor texture
    var textureLoader = new THREE.TextureLoader();
    var floorTexture = textureLoader.load("img/checkboard.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5,5);

    // Defining the floor material
    var floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture, side: THREE.DoubleSide});

    // Creates the floor object and returns it
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;

    return floor;
}


function generateBox(w, h, d){
    // Defining the box geometry
    var boxGeometry = new THREE.BoxGeometry(w, h, d);

    // Defining the box material
    var boxMaterial = new THREE.MeshPhongMaterial({
        color: "rgb(100,100,100)"
    });

    // Creates the box object and returns it
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;

    return box;
}


function generatePointLight(color, intensity){
    // Generates a point light as a light source
    var pointLight = new THREE.PointLight(color, intensity);
    pointLight.castShadow = true;

    return pointLight;
}

function generateAmbientLight(color, intensity){
    // Generates an all shining light source
    var ambientLight = new THREE.AmbientLight(color, intensity);

    return ambientLight;
}

function update(renderer, scene, camera, controls){
    renderer.render(scene, camera);

    // var floor = scene.getObjectByName("floor");
    // scene.children[0].rotation.y += 0.002;
    // floor.rotation.z += 0.001;
    // scene.traverse(function(child){
    //     child.position.x += 0.001;
    // })

    // Whats that? lol

    var step = 50*clock.getDelta();

    controls.update();

    requestAnimationFrame(function(){
        update(renderer, scene, camera, controls);
    });
}

main();