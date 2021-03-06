module.exports = function(opts) {
  opts = opts || {};
  if (opts.THREE) opts = {game:opts};
  var game = opts.game;
  var createPortal = require('voxel-portal')(game);
  var portals = [];

  function addBorder(mesh) {
    var black = new game.THREE.MeshBasicMaterial({color:0x000000});
    black.wireframe = true;
    mesh.material = new game.THREE.MeshFaceMaterial([
      black, black, black, black, mesh.material, black
    ]);
    mesh.needsUpdate = true;
  }

  function where() {
    var start = game.controls.yawObject.position.clone();
    var direction = game.camera.matrixWorld.multiplyVector3(new game.THREE.Vector3(0, 0, -1));
    var pos = game.intersectAllMeshes(start, direction);
    if (pos == false) {
      // this next part took me a valve length of time to figure out
      var r = 1000;
      var cam = game.cameraRotation();
      var phi = cam.x - (Math.PI/2);
      var theta = cam.y;
      pos = new game.THREE.Vector3(
        (r * Math.sin(phi) * Math.sin(theta)) + start.x,
        (r * Math.cos(phi)) + start.y,
        (r * Math.sin(phi) * Math.cos(theta)) + start.z
      );
    }
    return pos.addSelf(new game.THREE.Vector3(0, game.cubeSize, 0));
  }

  return function() {
    if (portals.length > 1) game.scene.remove(portals.shift().monitor);

    var w = where();

    var portal = createPortal({
      x: w.x, y: w.y, z: w.z,
      width: 70, height: 70 * 1.77
    });
    portals.push(portal);

    addBorder(portal.monitor);

    if (portals.length > 1) {
      portals[0].show(portal, { x: 0, y: 0, z: 1 });
      portal.show(portals[0], { x: 0, y: 0, z: -1 });
    }

    portal.monitor.lookAt(game.controls.yawObject.position);

    portal.on('enter', function() {
      var self = this;
      portals.forEach(function(p) {
        if (p != self) game.moveToPosition(p.position);
      });
    });
  }
}