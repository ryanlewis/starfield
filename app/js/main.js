require({
        baseUrl: 'js',
    // three.js should have UMD support soon, but it currently does not
    shim: { 'vendor/three': { exports: 'THREE' } }
}, [
    'vendor/three'
], function(THREE) {

var camera, scene, renderer;
var backgroundScene, backgroundCamera, tiles;
var starGeometry, material, mesh, starSprite;
var mouseX = 0, mouseY = 0, wheelDelta = 0, zVel = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    // camera.position.z = 1000;
    camera.position.z = 0;

    scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

    starGeometry = new THREE.Geometry();

    // set the material for each star
    starSprite = THREE.ImageUtils.loadTexture( "img/sprites/star.png" );
	material = new THREE.ParticleSystemMaterial( { color: 0xffffff, size: 20, sizeAttenuation: true, map: starSprite, blending: THREE.AdditiveBlending, depthTest: true, transparent: true } );

    createBackground();

    // create all our star vertices from the API
    createStarVertices();

    // create the particle system, that will use our star vertices
    particles = new THREE.ParticleSystem( starGeometry, material );
    particles.sortParticles = true;
    scene.add( particles );

    // lets create a renderer that takes up the whole screen
    renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
    renderer.setSize(window.innerWidth, window.innerHeight);

    // add to the dom
    document.body.appendChild(renderer.domElement);

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	// document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	// document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function createBackground() {
    var ROWS = 20;
    var COLUMNS = 25;

    // grab all the textures
    var tiles = [];

    for (var i = ROWS; i >= 1; i-- ) {

        for (var j = 1; j <= COLUMNS; j++) {

            var tilePath = 'img/tiles/final-creation-canvas_r' + i + '_c' + j + '.jpg';

            var texture = THREE.ImageUtils.loadTexture( tilePath );
            var material = new THREE.MeshBasicMaterial({ map: texture });
            material.depthTest = false;
            material.depthWrite = false;
            tiles.push(material);
        }
    }

    // create our background plane, with as many segments as we need
    var backgroundGeometry = new THREE.PlaneGeometry(10000,10000, COLUMNS, ROWS);

    // reset UVs - we'll recreate new ones so that our tile textures render correctly
    backgroundGeometry.faceVertexUvs[0] = [];

    // assign each triangle to the correct material (2 triangles at once)
    for (var i = 0; i < backgroundGeometry.faces.length/2; i++) {
        var j = 2 * i;

        backgroundGeometry.faces[ j ].materialIndex = i;
        backgroundGeometry.faces[ j + 1 ].materialIndex = i;

        // set the UV for the face so that the material renders correctly
        backgroundGeometry.faceVertexUvs[0].push([
            new THREE.Vector2( 0, 0 ),
            new THREE.Vector2( 0, 1 ),
            new THREE.Vector2( 1, 0 ),
        ]);

        backgroundGeometry.faceVertexUvs[0].push([
            new THREE.Vector2( 0, 1 ),
            new THREE.Vector2( 1, 1 ),
            new THREE.Vector2( 1, 0 ),
        ]);
    }

    // create background mesh from geometry and materials
    var backgroundMesh = new THREE.Mesh(backgroundGeometry, new THREE.MeshFaceMaterial(tiles));

    // move it backwards
    backgroundMesh.position.z = -1000;

    // Create background scene
    backgroundScene = new THREE.Scene();
    backgroundCamera = new THREE.Camera();
    //backgroundScene.add(backgroundCamera);
    // backgroundScene.add(backgroundMesh);
    scene.add(backgroundMesh);
}

function createStarVertices() {

    for ( i = 0; i < 10000; i ++ ) {
    	var vertex = new THREE.Vector3();
    	vertex.x = 2000 * Math.random() - 1000;
    	vertex.y = 2000 * Math.random() - 1000;
    	vertex.z = 2000 * Math.random() - 1000;

    	starGeometry.vertices.push( vertex );
    }
}

function moveCamera() {

    var MAXSPEED = 0.5;

    var vx = mouseX/500;
    var vy = mouseY/500;

    // if in a 100x100 deadzone in the middle of the screen, set velocity to 0
    if (Math.abs(mouseX) < 50 && Math.abs(mouseY) < 50) {
        vx = 0; vy = 0;
    }

    // make sure we don't go too fast
    camera.position.x += clamp(vx, MAXSPEED);
    camera.position.y -= clamp(vy, MAXSPEED);

    // bit of mousewheel action
    camera.position.z += wheelDelta * 0.05;
}

function clamp (v, d) {
    if (v > 0) {
        return Math.min(v, d);
    } else {
        return Math.max(v, d * -1);
    }
}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    moveCamera();
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);

}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
}

function onDocumentMouseWheel( event ) {
    wheelDelta = event.wheelDelta || event.detail;

    // macbook touchpad just seems to keep going at 3 or -3
    if (Math.abs(wheelDelta) < 5) wheelDelta = 0;
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

});
