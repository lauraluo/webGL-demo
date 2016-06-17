// add this to the THREE vars
THREE.noVideoTextureSupport = true;

// // replace the videoTexture function
// THREE.VideoTexture = function ( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {
//     if (THREE.noVideoTextureSupport)
//     {
//         this.video = video;
//         this.ctx2d = document.createElement('canvas').getContext('2d');
//         var canvas = this.ctx2d.canvas;
//         canvas.width = video.width;
//         canvas.height = video.height;
//         this.ctx2d.drawImage(this.video, 0, 0, this.width, this.height);
//         THREE.Texture.call( this, this.canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );
//     } else {
//         THREE.Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );
//     }
//     this.generateMipmaps = false;
//     var scope = this;
//     if (THREE.noVideoTextureSupport) {
//         function update() {
//             requestAnimationFrame( update );
//             if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
//                 scope.ctx2d.drawImage(scope.video, 0, 0, scope.video.width, scope.video.height);
//                 scope.needsUpdate = true;
//             }
//         }
//     } else {
//         function update() {
//             requestAnimationFrame( update );
//             if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
//                 scope.needsUpdate = true;
//             }
//         }
//     }
//     update();
// };

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VideoTexture = function ( video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

    if (THREE.noVideoTextureSupport) {

        this.width = 1024;
        this.height = 1024;


        this.video = video;
        this.canvasEle = document.createElement('canvas');
        this.ctx2d = this.canvasEle.getContext('2d');
        var canvas = this.ctx2d.canvas;
        canvas.width = this.width;
        canvas.height = this.height;
        this.ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);    

        $('body').append(this.canvasEle)

        THREE.Texture.call( this, canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

        this.generateMipmaps = false;
        var scope = this;
        //console.log(scope);
        function update() {
            requestAnimationFrame( update );

            if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
                console.log(scope.width);
                scope.ctx2d.drawImage(scope.video, 0, 0, scope.width, scope.height);
                scope.needsUpdate = true;
            }
        }
    }
    else {
        THREE.Texture.call( this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

        this.generateMipmaps = false;

        var scope = this;

        function update() {

            requestAnimationFrame( update );

            if ( video.readyState >= video.HAVE_CURRENT_DATA ) {

                scope.needsUpdate = true;

            }

        }

    }

    update();

};

THREE.VideoTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.VideoTexture.prototype.constructor = THREE.VideoTexture;