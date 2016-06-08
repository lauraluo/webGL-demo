$(document).ready(function() {
    var cameraControl;
    var scene;
    var camera;
    var renderer;
    var size= 128*2;
    var terrain, geometry, data, material;
    var worldWidth, worldHeight, gridSize;
    var myCanvas_W;
    var myCanvas_H;

    var background = '#91dcad';
    var surface = '#fffbbf';
    worldWidth  = window.innerWidth;

    var waveform = new Tone.Analyser(size, "waveform");
    var fft = new Tone.Analyser(size, "fft");
    // fft.smoothing = 0.5;



    var player = new Tone.Player({
        "url": "assets/audio/chrono.mp3",
        "loop": true,
        "autostart":true
    }).fan(fft, waveform).toMaster();

    // setTimeout(function(){
    //     player.start();
    //     init();
    // },4000);

    // once everything is loaded, we run our Three.js stuff.
    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1 , 8000);
        
        renderer = new THREE.WebGLRenderer({
            alpha: true    
        });
        renderer.setClearColor(background, 1);
        // renderer.setClearColor(new THREE.Color(0xEEEEEE));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // show axes in the screen
        var axes = new THREE.AxisHelper(10000);
        // scene.add(axes);



        // create the ground plane
        //grid size -1 創告一個 64 * 64的mirtix
        gridSizeX = 128;
        gridSizeY = 100;

        geometry = new THREE.PlaneGeometry(window.innerWidth/2,window.innerHeight/2,gridSizeX-1,gridSizeY-1);
        // material = new THREE.MeshBasicMaterial({color: surface,wireframe:false,wireframeLinewidth:1});
        material = new THREE.MeshLambertMaterial({
            color: surface,
            emissive: '#fff',
            wireframe:false,
            vertexColors:THREE.FaceColors,
            wireframeLinewidth:2
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
        // terrain.add(new THREE.AxisHelper(100));
        // terrain.rotation.x = 0;
         // plane.rotation.x = -0.5 * Math.PI;
        terrain.position.x = -window.innerWidth/16;
        terrain.position.y = -50;
        terrain.position.z = 0;
        // terrain.castShadow = true;
        // terrain.receiveShadow = true;
        terrain.rotation.y = -0.8 * Math.PI;
        terrain.rotation.x = -0.15 * Math.PI;
        scene.add(terrain);
        scene.fog = new THREE.FogExp2('#fc9494', .0015);
        

        var directionalLight = new THREE.DirectionalLight(background);
        directionalLight.position.set(100, 10, -100).normalize();
        scene.add(directionalLight);
        
        // position and point the camera to the center of the scene
        camera.position.x = 100;
        camera.position.y = 0;
        camera.position.z = -900;
        camera.lookAt(scene.position);
        //cameraControl = new THREE.OrbitControls(camera)
        // add the output of the renderer to the html element
        document.getElementById("audio").appendChild(renderer.domElement);



        // render the scene
        render();
    }

    function updateTerrain(values) {

        var len = values.length;
        var inc = 0;




        for (var x = 0; x < gridSizeX; x++) {
            for (var y = gridSizeY; y > 0; y--) {
                if (y == 1) {
                    data[x][y] = values[x];
                    // data[x][y] = getval(x, y);

                } else {
                    data[x][y] = data[x][y - 1];
                }
                geometry.vertices[inc].y = data[x][y];
                inc++;
            }
        }
        geometry.verticesNeedUpdate = true;


    };


    function getval(x, y) {
        var val = 0;
        val =  1 * 25;
        val += (Math.sin((x * 2) / gridSizeX) * 1);
        return val;
    }


    function render() {

        // update the camera
        // cameraControl.update();
        

        var fftValues = fft.analyse();
        var waveValues = waveform.analyse();

        updateTerrain(fftValues);
        // console.log(fftValues.length);


        // and render the scene
        renderer.render(scene, camera);

        // render using requestAnimationFrame
        requestAnimationFrame(render);

    }

    init();
});
