function initWallPaper(userConfig) {
var scene, camera, renderer;
var backgroundScene, backgroundCamera;
var geometry, material, mesh, skeletonMesh;
var assetManager;
var canvas;
var lastFrameTime = Date.now() / 1000;
var animateID = null;

var baseUrl = "assets/statics/";
// var skeletonFile = "kiana_6ren.json";
var atlasFile = userConfig.skeletonFile.replace(".json", ".atlas");
// var animation = "idle";

function init() {
  // create the THREE.JS camera, scene and renderer (WebGL)
  var width = window.innerWidth,
    height = window.innerHeight;
  /*
   * PerspectiveCamera(field_of_view, aspect_ratio,
   *                   near_clipping_plane, far_clipping_plane)
   */
  camera = new THREE.PerspectiveCamera(100, 16 / 9, 10, 3000);
  backgroundCamera = new THREE.Camera();
  camera.position.x = userConfig.position.x ;
  camera.position.y = userConfig.position.y ;
  camera.position.z = userConfig.position.z ;
  scene = new THREE.Scene();
  backgroundScene = new THREE.Scene();
  // scene.background = new THREE.Color();

  var light = new THREE.PointLight(0xEEEEEE);
  light.position.set(20, 0, 20);
  scene.add(light);

  var lightAmb = new THREE.AmbientLight(0x777777);
  scene.add(lightAmb);

  renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true
  });
  // renderer.autoClear = false;
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000 , 0);
  document.body.appendChild(renderer.domElement);
  canvas = renderer.domElement;

  // load the assets required to display the Raptor model
  assetManager = new spine.threejs.AssetManager(baseUrl);
  assetManager.loadText(userConfig.skeletonFile);
  assetManager.loadTextureAtlas(atlasFile);
  assetManager.loadTexture('001.png');

  requestAnimationFrame(load);
}

function load() {
  if (assetManager.isLoadingComplete()) {
    // Add a box to the scene to which we attach the skeleton mesh
    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      ambient: 0x121212,
      emissive: 0x121212
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // add Background Image
    loadBackground();

    // Load the texture atlas using name.atlas and name.png from the AssetManager.
    // The function passed to TextureAtlas is used to resolve relative paths.
    atlas = assetManager.get(atlasFile);

    // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
    atlasLoader = new spine.AtlasAttachmentLoader(atlas);

    // Create a SkeletonJson instance for parsing the .json file.
    var skeletonJson = new spine.SkeletonJson(atlasLoader);

    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
    skeletonJson.scale = userConfig.scale;
    var skeletonData = skeletonJson.readSkeletonData(assetManager.get(userConfig.skeletonFile));

    // Create a SkeletonMesh from the data and attach it to the scene
    skeletonMesh = new spine.threejs.SkeletonMesh(skeletonData);
    skeletonMesh.state.setAnimation(0, userConfig.animation, true);
    mesh.add(skeletonMesh);

    animateID = requestAnimationFrame(render);
  } else animateID = requestAnimationFrame(load);
}

function loadBackground () {
  // if (!userConfig.background) return;
  let texture = assetManager.get('001.png');
  const backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({
        map: texture
    })
  );
  backgroundMesh.material.depthTest = false;
  backgroundMesh.material.depthWrite = false;

  backgroundScene.add(backgroundCamera);
  backgroundScene.add(backgroundMesh);
}

function render() {
  // calculate delta time for animation purposes
  var now = Date.now() / 1000;
  var delta = now - lastFrameTime;
  lastFrameTime = now;

  // resize canvas to use full page, adjust camera/renderer
  resize();

  // update the animation
  skeletonMesh.update(delta);

  // render the scene
  // renderer.render(backgroundScene, backgroundCamera);
  renderer.render(scene, camera);

  animateID = requestAnimationFrame(render);
}

function resize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (canvas.width != w || canvas.height != h) {
    canvas.width = w;
    canvas.height = h;
  }

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
}

(function () {
  init();
}());

return function cancel () {
  window.cancelAnimationFrame(animateID);
  renderer.clear();
  return true;
}
}