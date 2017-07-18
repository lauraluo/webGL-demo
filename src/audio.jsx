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
var background = '#91dcad';
var surface = '#fffbbf';
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

var gridSizeX = 240;
var gridSizeY = 240;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 8000);

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
        color: '#ff6670',
        emissive: '#ff6670',
        wireframe: true,
        vertexColors: THREE.FaceColors,
        wireframeLinewidth: 2
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
    terrain.position.z = -580;
    terrain.position.x = 0;
    terrain.position.y = 100;
    terrain.rotation.y = -1.5 * Math.PI;
    terrain.rotation.x = -0.97 * Math.PI;
    terrain.rotation.z = -0.01 * Math.PI;
    scene.add(terrain);
    scene.fog = new THREE.FogExp2('#91dcad', 0.002);
    

    var directionalLight = new THREE.DirectionalLight(background);
    directionalLight.position.set(100, 1, -21000).normalize();
    scene.add(directionalLight);

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;

    camera.lookAt(scene.position);

    document.getElementById('audio').appendChild(renderer.domElement);

    renderView();
}

function updateTerrain(values) {
    var len = values.length;
    var inc = 0;
    var ratio = 4;

    for (var x = 0; x < gridSizeX; x++) {
        for (var y = gridSizeY; y > 0; y--) {
            if (y == 1) {
                data[x][y] = values[x];
            } else {
                data[x][y] = data[x][y - 1];
            }
            geometry.vertices[inc].y = data[x][y];
            inc++;
        }
    }
    geometry.verticesNeedUpdate = true;
}

function getval(x, y) {
    var val = 0;
    val = 1 * 25;
    val += Math.sin(x * 2 / gridSizeX) * 1;
    return val;
}

function renderView() {
    var waveValues = waveform.analyse();

    updateTerrain(waveValues);

    // controls.update()
    // camera.position.fromArray(controls.position)
    // camera.up.fromArray(controls.up)

    renderer.render(scene, camera);

    requestAnimationFrame(renderView);
}

init();
