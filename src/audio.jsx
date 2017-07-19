import Tone from 'Tone';

var scene;
var camera;
var renderer;
var size = 128 * 2;
var terrain, geometry, data, material;
var worldWidth, worldHeight, gridSize;
var myCanvas_W;
var myCanvas_H;
var controls;
var background = '#000';
var surface = '#363636';
worldWidth = window.innerWidth;

var waveform = new Tone.Analyser('waveform', size);
var fft = new Tone.Analyser('fft', size);
fft.smoothing = 0;

var player = new Tone.Player({
    url: 'assets/audio/chrono.mp3',
    loop: true,
    autostart: true
})
    .fan(fft, waveform)
    .toMaster();

var gridSizeX = 200;
var gridSizeY = 200;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 12000);

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setClearColor(background, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    geometry = new THREE.PlaneGeometry(
        window.innerWidth / 2,
        window.innerHeight / 2,
        gridSizeX - 1,
        gridSizeY - 1
    );
    material = new THREE.MeshLambertMaterial({
        emissive: '#fff',
        wireframe: true,
        vertexColors: THREE.FaceColors,
        wireframeLinewidth: 1
    });
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    var inc = 0;
    data = [];
    var highestPoint = 0;

    for (var x = 0; x < gridSizeX; x++) {
        data.push([]);
        for (var y = 0; y < gridSizeY; y++) {
            data[x].push(getval(x, y));
            geometry.vertices[inc].y = data[x][y];
            if (data[x][y] > highestPoint) highestPoint = data[x][y];
            inc++;
        }
    }

    

    terrain = new THREE.Mesh(geometry, material);
    terrain.position.z = 0
    terrain.position.x = 0;
    terrain.position.y = 0;
    terrain.rotation.y = -1.5 * Math.PI;
    terrain.rotation.x = -1 * Math.PI;
    terrain.rotation.z = 0.07 * Math.PI;
    scene.add(terrain);
    scene.fog = new THREE.FogExp2(background, 0.0019);


    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = -100* window.innerWidth / window.innerHeight;
    camera.position.z = 400 * window.innerWidth / window.innerHeight;

    
    
    var directionalLight = new THREE.DirectionalLight('#fff');

    directionalLight.position.set(400, 60, 0);
    scene.add(directionalLight);

    document.getElementById('audio').appendChild(renderer.domElement);

    renderView();
}

function updateTerrain(values) {
    var inc = 0;

    for (var x = 0; x < gridSizeX; x++) {
        for (var y = gridSizeY; y > 0; y--) {
            if (y == 1) {
                data[x][y] = values[x];
            } else {
                data[x][y] = data[x][y - 1];
            }
            geometry.vertices[inc].y = data[x][y]*0.8;
            inc++;
        }
    }
    geometry.verticesNeedUpdate = true;
}

function getval(x, y) {
    var val = 0;
    val = 1 * 128;
    val += Math.sin(x * 2 / gridSizeX) * 1;
    return val;
}

function renderView() {
    var waveValues = waveform.analyse();

    updateTerrain(waveValues);
    renderer.render(scene, camera);
    requestAnimationFrame(renderView);
}

init();
