var clock = new THREE.Clock();

function main(){
    var scene = new THREE.Scene();
    var box = generateBox(1,1,1);
    box.name = "box1";
    box.position.z = -(box.geometry.parameters.height/2);

    var floor = generateFloor(10, 10);
    floor.name = "floor";
    floor.rotation.x = Math.PI/2;
    // floor.add(box);

    var pointLight = generatePointLight(0xffffff, 1);
    pointLight.position.y = 5;
    pointLight.position.z = -3;

    new THREE.GLTFLoader()
        .load( 'models/plant.gltf', function ( gltf ) {

            scene.add( gltf.scene );

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

        });

    // var objLoader = new THREE.OBJLoader();
    // var lamp = objLoader.load("/models/TischlampeRed.obj", function(object){
    //     object.scale.x = 1;
    //     object.scale.y = 1;
    //     object.scale.z = 1;
        
    //     scene.add(object);
    // });

    scene.add(floor);
    scene.add(pointLight);
    scene.add(generateMoon());
    scene.background = generateBackground();

    var camera = new THREE.PerspectiveCamera(
        45, //Field of View
        window.innerWidth/window.innerHeight, //Site Ratio
        1, //Near clipping plane
        1000 //Far clipping plane
    );
    camera.position.x = 1;
    camera.position.y = 5;
    camera.position.z = 5;
    camera.lookAt(new THREE.Vector3(0,0,-5));

    var renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(60,60,60)");
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById("webgl").appendChild(renderer.domElement);
    
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

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
    var sphere = new THREE.SphereGeometry(3,40,40);
    var loader = new THREE.TextureLoader();
    var moonTexture = loader.load("img/moon.jpg");
    var moonMat = new THREE.MeshBasicMaterial({map: moonTexture});
    var moon = new THREE.Mesh(sphere, moonMat);
    moon.position.x = -25;
    moon.position.y = 25;
    moon.position.z = 25;
    return moon;
}

function generateFloor(w, d){
    var geo = new THREE.PlaneGeometry(w, d);
    var loader = new THREE.TextureLoader();
    var floorTexture = loader.load("img/checkboard.jpg");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5,5);
    var floorMat = new THREE.MeshBasicMaterial({map: floorTexture, side: THREE.DoubleSide});
    var floor = new THREE.Mesh(geo, floorMat);
    floor.receiveShadow = true;
    return floor;
}

function generateBox(w, h, d){
    var geo = new THREE.BoxGeometry(w, h, d);
    var mat = new THREE.MeshPhongMaterial({
        color: "rgb(100,100,100)"
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
}

function generatePointLight(color, intensity){
    var light = new THREE.PointLight(color, intensity);
    light.castShadow = true;
    return light;
}

function update(renderer, scene, camera, controls){
    renderer.render(scene, camera);

    // var floor = scene.getObjectByName("floor");
    // scene.children[0].rotation.y += 0.002;
    // floor.rotation.z += 0.001;
    // scene.traverse(function(child){
    //     child.position.x += 0.001;
    // })

    var step = 50*clock.getDelta();

    controls.update();

    requestAnimationFrame(function(){
        update(renderer, scene, camera, controls);
    });
}

main();