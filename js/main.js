import { world } from "./world.js"
import { player } from "./player.js"
import { models } from "./models.js"
import { settings } from "./settings.js"
import { weapons } from "./weapons.js"


let camera, scene, renderer, controls, loadingManager;
let prevTime = performance.now();
let direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let mouseDown = false;
let RESOURCES_LOADED = false;
let velocity = new THREE.Vector3();
const USE_WIREFRAME = false;
let playerMesh;
let meshes = {}
let selectedWeapon = "spitfire"
let bulletsLeft = weapons.apexLegends[selectedWeapon].magazineSize.noExtension
//for collision
var collidableMeshList = [];
const recoilPattern = weapons.apexLegends[selectedWeapon].recoilPattern;
let bulletNumber = 0;
let countdownToShot = weapons.apexLegends[selectedWeapon].timeToFirstShot
let startGunRotationX;
let startGunRotationY;





      //calculate objects intersecting the picking ray
      
      

//overlay canvas for reticle
    const crosshairCanvas = document.getElementById("xhair")
    const crosshairCtx = crosshairCanvas.getContext('2d');
    crosshairCtx.strokeStyle = '#39ff14';
    crosshairCtx.fillStyle = '#39ff14';
    crosshairCtx.lineWidth = 2;

    crosshairCtx.clearRect(0, 0, 30, 30);
    crosshairCtx.fillRect(13, 13, 4, 4);
    

    var raycaster = new THREE.Raycaster();
    var rayDirection = new THREE.Vector3( 0, 0, -1 );
    var rayRotation = new THREE.Euler( 0, 0, 0, "YXZ" );

    
    init();
    animate();
    
    function init() {
        camera = new THREE.PerspectiveCamera( document.getElementById("fovValue").value, window.innerWidth / window.innerHeight, 1, 1000 ); //sets the type of camera, size of the camera and min/max viewdistance. This is my eyes
        controls = new THREE.PointerLockControls( camera );
        
        

        const blocker = document.getElementById( 'blocker' ); //defines up the blocker element from the document
        const instructions = document.getElementById( 'settingsPage' ); // defines up the instructions element from the document
        const instructionButton = document.getElementById( 'playButton' )

        //create the scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(world.colorOfWorld); //sets the scene backgroundcolor
        scene.fog = new THREE.Fog( 0xffffff, 0, 750 ); // sets fog for the scene
        
        //adds light to the scene
        const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 ); 
        light.position.set( 0.5, 1, 0.75 );
        scene.add( light );
        
        scene.add( controls.getObject() ); //adds the pointerlockcontrols to the scene
        
        loadingManager = new THREE.LoadingManager();

        loadingManager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        }
        loadingManager.onLoad = function() {
            console.log("loaded all resources");
            RESOURCES_LOADED = true;
            onResoucesLoaded();
        }
        
        //add eventlisteners to the instructions to make click lock controls and adds eventlisteners to the controls to lock/unlock pointerlock
        instructionButton.addEventListener( 'click', function () {
            controls.lock();
        }, false );
        //when the player locks the controls, aka clicks play and leaves the options screen
        controls.addEventListener( 'lock', function () {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
            selectWeapon(); //selects weapon
            changeFov(); //updates the fov
            changeMouseSensitivity() // updates mouse sens
            
            player.canShoot = true;
            bulletsLeft = weapons.apexLegends[selectedWeapon].magazineSize.noExtension
            
            console.log(selectedWeapon, bulletsLeft)
        } );
        controls.addEventListener( 'unlock', function () {
            blocker.style.display = 'block';
            instructions.style.display = '';
            player.canShoot = false;
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

        /* CREATE PLAYER */
        function createPlayer() {
            playerMesh = new THREE.Mesh(player.mesh.geomerty, player.mesh.material)
            scene.add(playerMesh) 
        }
        
        
        
        /* CREATE WORLD  */
        
        // floor
        const floor = new THREE.Mesh( //creates floor 
            new THREE.PlaneGeometry(250,250 ,20,20), // width, height, widthSegments, heightsegments
            new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
            

        );
        floor.rotation.x -= Math.PI / 2; //rotates the floor so it actually is on the floor
        floor.receiveShadow = true; //allows the floor to receive shadows
        scene.add(floor); //adds the floor to the scene
        
        
        //walls
        const wallheight = world.MAP_HEIGHT; //sets wall atributes from world.js
        const wallwidth = world.MAP_SIZE; //sets wall atributes from world.js
        const wallcolor = world.wallColor; //sets wall atributes from world.js
        var geometry = new THREE.PlaneGeometry( wallwidth, wallheight ); 
        var material = new THREE.MeshBasicMaterial( {color: wallcolor, side: THREE.DoubleSide} );
        var wallNorth = new THREE.Mesh( geometry, material );
        var wallSouth = new THREE.Mesh( geometry, material );
        var wallEast = new THREE.Mesh( geometry, material );
        var wallWest = new THREE.Mesh( geometry, material );
        scene.add( wallNorth, wallSouth, wallEast, wallWest); //Adds walls to scene
        collidableMeshList.push(wallNorth, wallSouth, wallEast, wallWest)
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

        renderer = new THREE.WebGLRenderer( { antialias: false } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        //
        window.addEventListener( 'resize', onWindowResize, false );
        
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
                    if ( player.canJump === true ) velocity.y += 300; //if canjump is true, jumps 
                    player.canJump = false; //sets canjump to false, to prevent double jumping
                    break;
                
                case 82: // r
                    reload();
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
        const onMouseDown = function() {
            /* startGunRotationX = controls.getObject().children[ 0 ].rotation.x
            startGunRotationY =  controls.getObject().rotation.y */
            mouseDown = true;
        }
        const onMouseUp = function() {
            mouseDown = false;
            bulletNumber = 0;
            /* controls.getObject().children[ 0 ].rotation.x = startGunRotationX
            controls.getObject().rotation.y =  startGunRotationY */
        };
        const reload = function() {
            bulletNumber = 0;
            bulletsLeft = weapons.apexLegends[selectedWeapon].magazineSize.noExtension;
            
            
        }
        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );
        window.addEventListener( "mousedown", onMouseDown, false);
        window.addEventListener( "mouseup", onMouseUp, false);

        createPlayer();
        
    } //end of init

    function selectWeapon() {
        selectedWeapon = weaponSelector.options[weaponSelector.selectedIndex].value; 
    }
    function changeFov() {
        camera.fov = document.getElementById("fovValue").value;
        camera.updateProjectionMatrix();
    }
    function changeMouseSensitivity() {
        settings.sens = document.getElementById("MouseSensNumber").value;
        camera.updateProjectionMatrix();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    //when all resources are loaded, call this function. Puts loaded resources in the map.
    function onResoucesLoaded() {
				
        meshes["gun"] = models.gun.mesh.clone();

        
        //positions the meshes
        meshes["gun"].position.set(1, -2, -2.5);
        meshes["gun"].rotation.y = -Math.PI;
        meshes["gun"].scale.set( 70, 70, 70 )
        
        controls.getPitch().add(meshes["gun"]);

    }   
    
    
        

    function animate() {
        requestAnimationFrame( animate );
        let timeToAnimate = performance.now(); //gives metric to measure the time from start of animation, to end. 
        let time = performance.now();
        let delta = ( time - prevTime ) / 1000;
        
       

        /* shooting, movement including jumping */
        if ( controls.isLocked === true ) {
            
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;
            velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
            direction.z = Number( moveForward ) - Number( moveBackward );
            direction.x = Number( moveLeft ) - Number( moveRight );
            direction.normalize(); // this ensures consistent movements in all directions

            //setting the playermesh' position to the controls object. Unelegant, but couldnt find a better way and didnt want to waste time on it.
            playerMesh.position.set(controls.getObject().position.x,controls.getObject().position.y,controls.getObject().position.z  ) 
            

            //checks for attempt to move
            if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
            
            
            /* movement and collision for player in all directions */
            if(controls.getObject().position.z > (world.MAP_SIZE / 2 - 2)) {
                velocity.z = 0;
                controls.getObject().position.z = (world.MAP_SIZE / 2 - 2);
            } else if (controls.getObject().position.z < -(world.MAP_SIZE / 2 - 2)) {
                velocity.z = 0;
                controls.getObject().position.z = - (world.MAP_SIZE / 2 - 2);
            } else if (controls.getObject().position.x > (world.MAP_SIZE / 2 - 2)) {
                velocity.z = 0;
                controls.getObject().position.x = (world.MAP_SIZE / 2 - 2);
            } else if (controls.getObject().position.x < -(world.MAP_SIZE / 2 - 2)) {
                velocity.z = 0;
                controls.getObject().position.x = -(world.MAP_SIZE / 2 - 2);
            } else {
                controls.getObject().translateX( velocity.x * delta );
                controls.getObject().translateY( velocity.y * delta );
                controls.getObject().translateZ( velocity.z * delta );
            }

            
            //can the player jump and sets the player on ground while not jumping.
            if ( controls.getObject().position.y < 10) { 
                velocity.y = 0;
                controls.getObject().position.y = 10;
                player.canJump = true;
            }

            /* shooting */
            if (mouseDown && countdownToShot <= 0 && bulletsLeft > 0) {
                let shotPosition = new THREE.Vector3()
                var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).normalize().clone();
                var rayCaster = new THREE.Raycaster();  
                
                //setting up for the hitpoint
                var hitGeometry = new THREE.CircleGeometry( 0.2, 16 );
                var hitMateral = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
                var circle = new THREE.Mesh( hitGeometry, hitMateral );
                circle.material.side = THREE.DoubleSide
                rayCaster.set( controls.getObject().position, cameraDirection );
                var intersects = rayCaster.intersectObjects( scene.children );
                

                for ( var intersectIndex = 0; intersectIndex < intersects.length; intersectIndex++ ) {
                    shotPosition = (intersects[intersectIndex].point)
                    
                }
                circle.alive = true;
                scene.add( circle );
                if(shotPosition.x >= world.MAP_SIZE / 2 - 1) {
                    circle.position.set(shotPosition.x - 0.1, shotPosition.y, shotPosition.z)
                    circle.rotation.y = -Math.PI / 2
                } else if(shotPosition.x <= -(world.MAP_SIZE / 2 - 1) ) {
                    circle.position.set(shotPosition.x + 0.1, shotPosition.y, shotPosition.z)
                    circle.rotation.y = -Math.PI / 2
                } else if(shotPosition.z >= world.MAP_SIZE / 2 - 1) {
                    circle.position.set(shotPosition.x , shotPosition.y, shotPosition.z - 0.1)
                    
                } else if(shotPosition.z <= -(world.MAP_SIZE / 2 - 1) ) {
                    circle.position.set(shotPosition.x , shotPosition.y, shotPosition.z + 0.1)
                   
                } else if( (shotPosition.y <= 6 && shotPosition.x <= world.MAP_SIZE / 2 - 1) || shotPosition.y <= 6 && shotPosition.x >= -(world.MAP_SIZE / 2 - 1) || (shotPosition.y <= 6 && shotPosition.z <= world.MAP_SIZE / 2 - 1) || shotPosition.y <= 6 && shotPosition.z >= -(world.MAP_SIZE / 2 - 1) ) {
                    circle.position.set(shotPosition.x , 0.1, shotPosition.z)
                    circle.rotation.x = -Math.PI / 2
                }   
                console.log(shotPosition)
                
                
                    countdownToShot = weapons.apexLegends[selectedWeapon].recoilPattern[bulletNumber].t
                    
                    //controlling recoil
                    
                    
                    controls.getObject().children[ 0 ].rotation.x = controls.getObject().children[ 0 ].rotation.x + (recoilPattern[bulletNumber].y * 0.0008)
                    controls.getObject().rotation.y = controls.getObject().rotation.y + (recoilPattern[bulletNumber].x * 0.0008) 
                    

                    bulletNumber++; 
                    
                    bulletsLeft --
                    
                
                }
                timeToAnimate = time - timeToAnimate
                if(countdownToShot > 0) countdownToShot -= (delta + timeToAnimate); ; //gives the most accurate countdown to shot. Takes into account time between frames and time during frames.
                
                
            prevTime = time;
            
            
        } //end of movement + jumping   

        
       
        

        renderer.render( scene, camera )
    } //end of animate


    