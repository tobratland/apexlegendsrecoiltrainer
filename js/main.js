import { world }  from "./world.js";


let camera, scene, renderer, controls;
			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;
			let prevTime = performance.now();
			let velocity = new THREE.Vector3();
			let direction = new THREE.Vector3();
            let floor;
            let USE_WIREFRAME = false;
			let mouseDown = false;
			var vector = new THREE.Vector3();
			const player = {
				canShoot: 0
			}
			let gunPosition = new THREE.Vector3();
			let gunRotation = new THREE.Vector3();
			let ray = new THREE.ReusableRay();
			const loadingScreen = {
				scene : new THREE.Scene(),
				camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 ),
				box : new THREE.Mesh(
					new THREE.BoxGeometry(0.5, 0.5, 0.5),
					new THREE.MeshBasicMaterial({ color: 0x4444ff })
				)
			};
			let loadingManager = null;
			let RESOURCES_LOADED = false;

			const models = {
				gun: {
					obj: "models/weapons/basicmachinegun.obj",
					mtl: "models/weapons/basicmachinegun.mtl",
					mesh: null
				}
			}
			//index for the meshes 
			const meshes = {};
			const bullets = [];
            init();
			animate();
			function init() {
				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				scene = new THREE.Scene();

				loadingScreen.box.position.set(0,0,5);
				loadingScreen.camera.lookAt(loadingScreen.box.position);
				loadingScreen.scene.add(loadingScreen.box);

				loadingManager = new THREE.LoadingManager();

				loadingManager.onProgress = function (item, loaded, total) {
					console.log(item, loaded, total);
				}
				loadingManager.onLoad = function() {
					console.log("loaded all resources");
					RESOURCES_LOADED = true;
					onResoucesLoaded();
				}

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

		

				//for loading models
				for( var _key in models ){
					(function(key){
						
						var mtlLoader = new THREE.MTLLoader(loadingManager);
						mtlLoader.load(models[key].mtl, function(materials){
							materials.preload();
							
							var objLoader = new THREE.OBJLoader(loadingManager);
							
							objLoader.setMaterials(materials);
							objLoader.load(models[key].obj, function(mesh){
								
								mesh.traverse(function(node){
									if( node instanceof THREE.Mesh ){
										node.castShadow = true;
										node.receiveShadow = true;
									}
								});
								models[key].mesh = mesh;
								
							});
						});
						
					})(_key);
				}


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
                const onMouseDown = function(event) {
					if(event) {mouseDown = true;
					}
				}
				const onMouseUp = function() {
					mouseDown = false;
				}
				document.addEventListener( 'keydown', onKeyDown, false );
				document.addEventListener( 'keyup', onKeyUp, false );
				window.addEventListener( "mousedown", onMouseDown, false);
                window.addEventListener( "mouseup", onMouseUp, false);
                // floor
                floor = new THREE.Mesh( //creates floor 
                    new THREE.PlaneGeometry(250,250 ,20,20), // width, height, widthSegments, heightsegments
                    new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
                    

                );
                floor.rotation.x -= Math.PI / 2; //rotates the floor so it actually is on the floor
                floor.receiveShadow = true; //allows the floor to receive shadows
                scene.add(floor); //adds the floor to the scene
                

                //Creating walls
                const wallheight = world.wall.height; //sets wall atributes from world.js
				const wallwidth = world.wall.width; //sets wall atributes from world.js
				const wallcolor = world.wall.color; //sets wall atributes from world.js
                var geometry = new THREE.PlaneGeometry( wallwidth, wallheight ); 
                var material = new THREE.MeshBasicMaterial( {color: wallcolor, side: THREE.DoubleSide} );
				var wallNorth = new THREE.Mesh( geometry, material );
				var wallSouth = new THREE.Mesh( geometry, material );
				var wallEast = new THREE.Mesh( geometry, material );
				var wallWest = new THREE.Mesh( geometry, material );
				scene.add( wallNorth, wallSouth, wallEast, wallWest); //Adds walls to scene
					
				//positoning North wall
                wallNorth.position.z -= 125;
				wallNorth.position.y += wallheight/2;
				
				//positoning south wall
                wallSouth.position.z += 125;
				wallSouth.position.y += wallheight/2;
				
				//positoning east wall
                wallEast.position.x -= 125;
				wallEast.position.y += wallheight/2;
				wallEast.rotation.y -= Math.PI / 2;
				//positoning west wall
                wallWest.position.x += 125;
                wallWest.position.y += wallheight/2;
				wallWest.rotation.y += Math.PI / 2;
					
				
				
				
				

				

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
			//runs when all resources are loaded.
			function onResoucesLoaded() {
				
				meshes["gun"] = models.gun.mesh.clone();

				
				//positions the meshes
				meshes["gun"].position.set(1, -2, -3);
				meshes["gun"].rotation.y = -Math.PI;
				meshes["gun"].scale.set( 70, 70, 70 )
				controls.getPitch().add(meshes["gun"]);

			}

			const bulletStartingPoint = new THREE.Mesh(
				new THREE.SphereGeometry(1,1,1),
				new THREE.MeshBasicMaterial({color:0xffffff})
			)
				bulletStartingPoint.position.set(1, -2, -7);
				bulletStartingPoint.rotation.y = -Math.PI;
				bulletStartingPoint.visible = false;
				controls.getPitch().add(bulletStartingPoint);
			function animate() {
				
				
				

				if(!RESOURCES_LOADED) {
					requestAnimationFrame( animate );
					loadingScreen.box.position.x-=0.0005;
					if(loadingScreen.box.position.x < - 10 ) loadingScreen.box.position.x = 10;
					loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
					renderer.render(loadingScreen.scene, loadingScreen.camera);
					return;
				}
				requestAnimationFrame( animate );
				
				//loop through bullets array
				for(var index=0; index<bullets.length; index+=1){
					if( bullets[index] === undefined ) continue;
					if( bullets[index].alive == false ){
						bullets.splice(index,1);
						continue;
					}
					
					bullets[index].position.add(bullets[index].velocity);
				}
				if (mouseDown && player.canShoot < 1	) {
					
					
					
					
						// creates a bullet as a Mesh object
						var bullet = new THREE.Mesh(
							new THREE.SphereGeometry(0.2,0.2,0.2),
							new THREE.MeshBasicMaterial({color:0xB80005}),

						);
						
						const gunDirection = new THREE.Vector3();
						bulletStartingPoint.getWorldDirection(gunDirection)

						bulletStartingPoint.getWorldPosition(gunPosition)
						
						// position the bullet to come from the player's weapon
						bullet.position.set(
							gunPosition.x ,
							gunPosition.y ,
							gunPosition.z ,
						);
						bullet.rotation.set(
							gunDirection.x ,
							gunDirection.y ,
							gunDirection.z ,
						);
						
						
						
						controls.getObject().children[ 0 ].rotation.x = controls.getObject().children[ 0 ].rotation.x + 0.02
						
						// set the velocity of the bullet
						const bulletDirection = new THREE.Vector3();
						bulletStartingPoint.getWorldDirection(bulletDirection)

						bullet.velocity = new THREE.Vector3(
							bulletDirection.x *3,
							bulletDirection.y *3,
							bulletDirection.z *3,
						);
						
						// after 1000ms, set alive to false and remove from scene
						// setting alive to false flags our update code to remove
						// the bullet from the bullets array
						bullet.alive = true;
						setTimeout(function(){
							bullet.alive = false;
							scene.remove(bullet);
						}, 1000);
						
						// add to scene, array, and set the delay to 10 frames
						bullets.push(bullet);
						scene.add(bullet);
						player.canShoot = 10;

					}
					if(player.canShoot > 0) player.canShoot -= 1;
					
					
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

