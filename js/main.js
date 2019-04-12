let camera, scene, renderer, controls;
			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;
			let prevTime = performance.now();
			let velocity = new THREE.Vector3();
			let direction = new THREE.Vector3();
            let meshFloor;
            let USE_WIREFRAME = false;
let player = {
	
}
            init();
			animate();
			function init() {
				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xffffff );
				scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
				let light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );
				controls = new THREE.PointerLockControls( camera );
				let blocker = document.getElementById( 'blocker' );
				let instructions = document.getElementById( 'instructions' );
				instructions.addEventListener( 'click', function () {
					controls.lock();
				}, false );
				controls.addEventListener( 'lock', function () {
					instructions.style.display = 'none';
					blocker.style.display = 'none';
				} );
				controls.addEventListener( 'unlock', function () {
					blocker.style.display = 'block';
					instructions.style.display = '';
				} );
				scene.add( controls.getObject() );
				let onKeyDown = function ( event ) {
					switch ( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = true;
							break;
						case 37: // left
						case 65: // a
							moveLeft = true;
							break;
						case 40: // down
						case 83: // s
							moveBackward = true;
							break;
						case 39: // right
						case 68: // d
							moveRight = true;
							break;
						case 32: // space
							if ( canJump === true ) velocity.y += 300; //if canjump is true, jumps 
							canJump = false; //sets canjump to false, to prevent double jumping
							break;
					}
				};
				let onKeyUp = function ( event ) {
					switch ( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = false;
							break;
						case 37: // left
						case 65: // a
							moveLeft = false;
							break;
						case 40: // down
						case 83: // s
							moveBackward = false;
							break;
						case 39: // right
						case 68: // d
							moveRight = false;
							break;
					}
                };
                
				document.addEventListener( 'keydown', onKeyDown, false );
                document.addEventListener( 'keyup', onKeyUp, false );
                
                
                // floor
                meshFloor = new THREE.Mesh( //creates floor 
                    new THREE.PlaneGeometry(250,250 ,20,20), // width, height, widthSegments, heightsegments
                    new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
                );
                meshFloor.rotation.x -= Math.PI / 2; //rotates the floor so it actually is on the floor
                meshFloor.receiveShadow = true; //allows the floor to receive shadows
                scene.add(meshFloor); //adds the floor to the scene
                
				//
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				//
				window.addEventListener( 'resize', onWindowResize, false );
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function animate() {
				requestAnimationFrame( animate );
				if ( controls.isLocked === true ) {
                    let time = performance.now();
                    let delta = ( time - prevTime ) / 1000;
					velocity.x -= velocity.x * 10.0 * delta;
					velocity.z -= velocity.z * 10.0 * delta;
					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
					direction.z = Number( moveForward ) - Number( moveBackward );
					direction.x = Number( moveLeft ) - Number( moveRight );
					direction.normalize(); // this ensures consistent movements in all directions
					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

					controls.getObject().translateX( velocity.x * delta );
					controls.getObject().translateY( velocity.y * delta );
					controls.getObject().translateZ( velocity.z * delta );
					if ( controls.getObject().position.y < 10 ) { 
						velocity.y = 0;
						controls.getObject().position.y = 10;
						canJump = true;
					}
					prevTime = time;
				}
				renderer.render( scene, camera );
			}