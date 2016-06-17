//偵測webgl
if (!Detector.webgl) Detector.addGetWebGLMessage();

    // global variables
    var renderer;
    var scene;
    var camera;
    var sphere;

    var orbit;
    var control;

    var avgVertexNormals = [];
    var avgVertexCount = [];

    var doExplode = true;

    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // position and point the camera to the center of the scene
        camera.position.x = 15;
        camera.position.y = 16;
        camera.position.z = 13;
        camera.lookAt(scene.position);

        orbit = new THREE.OrbitControls(camera);

        control = new function () {
            this.explode = function () {
                doExplode = true;
            }
            this.implode = function () {
                doExplode = false;
            }
            this.scale = 0.02;
        };
        addControls(control);
        // add the output of the renderer to the html element
        document.body.appendChild(renderer.domElement);

        sphere = new THREE.BoxGeometry(4, 6, 4, 20, 20, 20);
        sphere.vertices.forEach(function (v) {
            v.velocity = Math.random();
        });
        createParticleSystemFromGeometry(sphere);

        // call the render function
        render();
    }

    function explode(outwards) {


        var dir = outwards === true ? 1 : -1;

        var count = 0;
        sphere.vertices.forEach(function (v) {
            v.x += (avgVertexNormals[count].x * v.velocity * control.scale) * dir;
            v.y += (avgVertexNormals[count].y * v.velocity * control.scale) * dir;
            v.z += (avgVertexNormals[count].z * v.velocity * control.scale) * dir;


            count++;
        });
        sphere.verticesNeedUpdate = true;
    }

    function createParticleSystemFromGeometry(geom) {
        var psMat = new THREE.PointsMaterial();
        psMat.map = THREE.ImageUtils.loadTexture("../assets/textures/ps_ball.png");
        psMat.blending = THREE.AdditiveBlending;
        psMat.transparent = true;
        psMat.alphaTest = 0.3;
        var ps = new THREE.PointCloud(geom, psMat);
        ps.sortParticles = true;

        scene.add(ps);


        for (var i = 0; i < sphere.vertices.length; i++) {
            avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
            avgVertexCount.push(0);
        }

        // first add all the normals 
        // 可以把每個 F 想成組合成3d物件的許多三角型
        sphere.faces.forEach(function (f) {
            
            //取得三個頂點的法向量
            var vA = f.vertexNormals[0];
            var vB = f.vertexNormals[1];
            var vC = f.vertexNormals[2];

            // update the count
            // 將index計數 例如 avgVertexCount[128] +=1  先把所有出現過的座標計數
            // 要注意f.a f.b f.c 是 index 
            // 其目的是用來減少頂點的座標存取的資訊，所以會有重複的座標
            avgVertexCount[f.a] += 1; 
            avgVertexCount[f.b] += 1;
            avgVertexCount[f.c] += 1;

            // 將對應index的方向量值給加進去 作向量的加總
            avgVertexNormals[f.a].add(vA);
            avgVertexNormals[f.b].add(vB);
            avgVertexNormals[f.c].add(vC);

        });

        // 算出每個向量的平均值
        // then calculate the average
        for (var i = 0; i < avgVertexNormals.length; i++) {
            avgVertexNormals[i].divideScalar(avgVertexCount[i]);
        }
    }

    function addControls(controlObject) {
        var gui = new dat.GUI();
        gui.add(controlObject, 'explode');
        gui.add(controlObject, 'implode');
        gui.add(controlObject, 'scale', 0, 1).step(0.01);
    }

    function render() {
        renderer.render(scene, camera);
        orbit.update();
        if (doExplode) {
            explode(true);
        } else {
            explode(false);
        }

        requestAnimationFrame(render);
    }

    // calls the init function when the window is done loading.
    window.onload = init;
