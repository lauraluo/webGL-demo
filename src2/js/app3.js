            var container, stats;

            var mesh, camera, scene, renderer;
            var helper;

            var mouseX = 0,
                mouseY = 0;

            var windowHalfX = window.innerWidth / 2;
            var windowHalfY = window.innerHeight / 2;

            var clock = new THREE.Clock();

            init();
            animate();

            function init() {

                container = document.createElement('div');
                document.body.appendChild(container);

                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
                camera.position.z = 25;

                // scene

                scene = new THREE.Scene();

                var ambient = new THREE.AmbientLight(0xffffff);
                scene.add(ambient);

                var directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(-1, 1, 100).normalize();
                scene.add(directionalLight);


                var light = new THREE.DirectionalLight();
                light.position.set(100, 100, 1);
                scene.add(light);

                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(new THREE.Color(0xffffff));
                container.appendChild(renderer.domElement);

                // model

                var onProgress = function(xhr) {
                    if (xhr.lengthComputable) {
                        var percentComplete = xhr.loaded / xhr.total * 100;
                        console.log(Math.round(percentComplete, 2) + '% downloaded');
                    }
                };

                var onError = function(xhr) {};

                // var modelFile = 'models/mmd/miku/miku_v2.pmd';
                var modelFile = 'models/mmd/yt/yt.pmx';
                var vmdFiles = ['models/mmd/vmd/wavefile_v2.vmd'];

                helper = new THREE.MMDHelper(renderer);

                var loader = new THREE.MMDLoader();
                loader.setDefaultTexturePath('./models/mmd/yt/');

                loader.load(modelFile, vmdFiles, function(object) {


                    mesh = object;
                    mesh.position.y = -10;
                    helper.add(mesh);
                    helper.setAnimation(mesh);

                    /*
                     * Note: You must set Physics
                     *       before you add mesh to scene or any other 3D object.
                     * Note: Physics calculation is pretty heavy.
                     *       It may not be acceptable for most mobile devices yet.
                     */
                    if (!isMobileDevice()) {

                        helper.setPhysics(mesh);

                    }

                    helper.unifyAnimationDuration({ afterglow: 2.0 });

                    scene.add(mesh);

                }, onProgress, onError);

                document.addEventListener('mousemove', onDocumentMouseMove, false);

                //

                window.addEventListener('resize', onWindowResize, false);

            }

            function onWindowResize() {

                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize(window.innerWidth, window.innerHeight);

            }

            function onDocumentMouseMove(event) {

                mouseX = (event.clientX - windowHalfX) / 2;
                mouseY = (event.clientY - windowHalfY) / 2;

            }

            //

            function animate() {

                requestAnimationFrame(animate);
                render();

            }

            function render() {

                camera.position.x += (-mouseX - camera.position.x) * .05;
                camera.position.y += (-mouseY - camera.position.y) * .05;

                camera.lookAt(scene.position);

                if (mesh) {

                    helper.animate(clock.getDelta());
                    helper.render(scene, camera);

                } else {

                    renderer.clear();
                    renderer.render(scene, camera);

                }

            }

            // easy mobile device detection
            function isMobileDevice() {

                if (navigator === undefined || navigator.userAgent === undefined) {

                    return true;

                }

                var s = navigator.userAgent;

                if (s.match(/iPhone/i)
                    //                   || s.match( /iPad/i )
                    || s.match(/iPod/i) || s.match(/webOS/i) || s.match(/BlackBerry/i) || (s.match(/Windows/i) && s.match(/Phone/i)) || (s.match(/Android/i) && s.match(/Mobile/i))) {

                    return true;

                }

                return false;

            }
