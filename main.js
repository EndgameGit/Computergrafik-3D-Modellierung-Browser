function main(){
    var scene = new THREE.Scene();
    var box = generateBox(1,1,1);
    box.translateZ(-5);
    scene.add(box);

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("webgl").appendChild(renderer.domElement);
    renderer.render(scene, camera);
}

function generateBox(w, h, d){
    var geo = new THREE.BoxGeometry(w, h, d);
    var mat = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    var mesh = new THREE.Mesh(geo, mat);
    return mesh;
}

main();