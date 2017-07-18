
    // global variables
    var renderer;
    var scene;
    var camera;
    var geom;
    var control;
    var avgVertexNormals = [];
    var avgVertexCount = [];
    var colors = [];
    var doExplode = false;
    var orbit;

    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();

        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // add light
        var light = new THREE.DirectionalLight();
        light.position.set(1200, 1200, 1200);
        scene.add(light);

        // position and point the camera to the center of the scene
        // 不知為何光不見了就看不到
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 1000;
        camera.lookAt(scene.position);

        // add the output of the renderer to the html element
        document.body.appendChild(renderer.domElement);

        orbit = new THREE.OrbitControls(camera);
        control = new function () {
            this.explode = function () {
                doExplode = true;
            }
            this.implode = function () {
                doExplode = false;
            }
            this.scale = 0.1;
        };
        addControls(control);

        createGeometryFromMap();


        
    }

    function createGeometryFromMap() {
        var depth = 512;
        var width = 512;

        var spacingX = 1;
        var spacingZ = 1;
        var heightOffset = 2;

        var canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        var ctx = canvas.getContext('2d');

        var img = new Image();
        img.src = "images/demo2.png";
        img.onload = function () {
            // draw on canvas
            ctx.drawImage(img, 0, 0);
            var pixel = ctx.getImageData(0, 0, width, depth);
            // console.log(pixel.data.length );//1048576
            //data長度為 128 取RGBA陣列中的A data長度為 512*512*4 其中的4代表每px的rgba
            var matColors = math.multiply(math.ones(512, 512), '');

            geom = new THREE.Geometry;

            var output = [];
            for (let x = 0; x < depth; x++) {

                for (let z = 0; z < width; z++) {
                    matColors._data[z][x] = 'rgb('+ ([
                        pixel.data[(x*4) + z * depth * 4],
                        pixel.data[(x*4)+1 + z * depth * 4],
                        pixel.data[(x*4)+2 + z * depth * 4]
                    ].join(','))+')';


                    // colors.push(new THREE.Color('rgba(255,255,255)'));
                    // get pixel
                    // since we're grayscale, we only need one element
                    //每張圖取出來的px資料，是代表rgba的256色陣列
                    //*4，跳四格取第4個a的透明度作為高度(y軸)參考
                    //* spacing 放大比例尺也許是比較好看？
                    var yValue = pixel.data[z * 4 + (depth * x * 4)] / heightOffset;
                    var vertex = new THREE.Vector3(x * spacingX, yValue , z * spacingZ);
                    geom.vertices.push(vertex);

                }
            }

            math.forEach(matColors, function(value) {
                colors.push(new THREE.Color(value));
            });
            geom.colors = colors;


            geom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            geom.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));



            //制作面
            // we create a rectangle between four vertices, and we do
            // that as two triangles.
            for (let z = 0; z < depth - 1; z++) {
                for (let x = 0; x < width - 1; x++) {
                    // we need to point to the position in the array
                    // a - - b
                    // |  x  |
                    // c - - d
                    var a = x + z * width;
                    var b = (x + 1) + (z * width);
                    var c = x + ((z + 1) * width);
                    var d = (x + 1) + ((z + 1) * width);

                    var face1 = new THREE.Face3(a, b, d);
                    var face2 = new THREE.Face3(d, c, a);

                    geom.faces.push(face1);
                    geom.faces.push(face2);
                }
            }

            geom.computeVertexNormals();
            geom.computeFaceNormals();
            geom.computeBoundingBox();

            createParticleSystemFromGeometry(geom);
        };

    }

    function getHighPoint(geometry, face) {
        //face中有原生的3個abc屬性
        var v1 = geometry.vertices[face.a].y;
        var v2 = geometry.vertices[face.b].y;
        var v3 = geometry.vertices[face.c].y;
        // console.log(face.a);
        return Math.max(v1, v2, v3);
    }

    function createParticleSystemFromGeometry(geom) {


        geom.vertices.forEach(function (v) {
            v.velocity = Math.random();
        });

        
        var loader = new THREE.TextureLoader();
        

        var psMat = new THREE.PointsMaterial();
        psMat.vertexColors = THREE.VertexColors;
        // psMat.blending = THREE.AdditiveBlending;
        // psMat.transparent = true;
        // psMat.alphaTest = 0.8;

        var ps = new THREE.Points(geom, psMat);
        ps.sortParticles = true;
        // ps.rotation.x = Math.PI / 2;

        ps.translateX(206);
        ps.translateY(206);
        scene.add(ps);

        for (let i = 0; i < geom.vertices.length; i++) {
            avgVertexNormals.push(new THREE.Vector3(0, 0, 0));
            avgVertexCount.push(0);
        }

        // first add all the normals 
        // 可以把每個 F 想成組合成3d物件的許多三角型
        geom.faces.forEach(function (f) {
            
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

        // call the render function
        render();

    }

    function explode(outwards) {


        var dir = outwards === true ? -1 : 1;

        var count = 0;
        geom.vertices.forEach(function (v) {
            v.x += (avgVertexNormals[count].x * v.velocity * control.scale) * dir;
            v.y += (avgVertexNormals[count].y * v.velocity * control.scale) * dir;
            v.z += (avgVertexNormals[count].z * v.velocity * control.scale) * dir;


            count++;
        });
        geom.verticesNeedUpdate = true;
    }


    function addControls(controlObject) {
        var gui = new dat.GUI();
        gui.add(controlObject, 'explode');
        gui.add(controlObject, 'implode');
        gui.add(controlObject, 'scale', 0, 2).step(0.01);
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