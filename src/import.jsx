// global variables
var renderer;
var scene;
var camera;
var geom;
var mesh;
var control;
var doExplode = false;
var orbit;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var light = new THREE.DirectionalLight();
    light.position.set(1200, 1200, 1200);
    scene.add(light);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 10;

    control = new function() {
        this.rx = 0;
        this.ry = 0;
    }();

    addControls(control);

    document.body.appendChild(renderer.domElement);

    loadModel();
}

function render() {
    renderer.render(scene, camera);

    orbit.update();

    mesh.rotation.x = control.rx * Math.PI;
    mesh.rotation.y = control.ry * Math.PI;
    requestAnimationFrame(render);
}

function loadModel() {
    var loader = new THREE.JSONLoader();
    loader.load('assets/pen.js', function(model, material) {
        var penMaterial = new THREE.MeshPhongMaterial({
            color: 0xdddddd,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.FlatShading
        });
        //var penMaterial = new THREE.MeshLambertMaterial({wireframe:false});
        // var penMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        mesh = new THREE.Mesh(model, penMaterial);

        mesh.position.set(0, 0, 0);
        scene.add(mesh);
        camera.lookAt(mesh.position);
        orbit = new THREE.OrbitControls(camera);

        render();
    });
}

function addControls(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'rx', -1, 1).step(0.01);
    gui.add(controlObject, 'ry', -1, 1).step(0.01);
}

window.onload = init;
