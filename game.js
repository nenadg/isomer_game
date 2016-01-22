/*global Isomer*/
'use strict';

var score = 0;
var iso = new Isomer(document.getElementById("art"));
var Shape = Isomer.Shape;
var Point = Isomer.Point;
var Color = Isomer.Color;
var Path = Isomer.Path;

var color1 = new Color(84, 162, 144);
var color2 = new Color(97, 136, 137);
var color3 = new Color(172, 120, 119);
var color4 = new Color(230, 89, 102);
var color5 = new Color(243, 132, 89);

function randomColor() {
    return new Color(
        parseInt(Math.random() * 256),
        parseInt(Math.random() * 256),
        parseInt(Math.random() * 256)
    );
}

/**
 * Draws an octohedron contained in a 1x1 cube location at origin
 */
function Octohedron(origin) {
  /* Declare the center of the shape to make rotations easy */
    var center = origin.translate(0.5, 0.5, 0.5);
    var faces = [];

  /* Draw the upper triangle /\ and rotate it */
    var upperTriangle = new Path([
        origin.translate(0, 0, 0.5),
        origin.translate(0.5, 0.5, 1),
        origin.translate(0, 1, 0.5)
    ]);

    var lowerTriangle = new Path([
        origin.translate(0, 0, 0.5),
        origin.translate(0, 1, 0.5),
        origin.translate(0.5, 0.5, 0)
    ]);

  for (var i = 0; i < 4; i++) {
    faces.push(upperTriangle.rotateZ(center, i * Math.PI / 2));
    faces.push(lowerTriangle.rotateZ(center, i * Math.PI / 2));
  }

  /* We need to scale the shape along the x & y directions to make the
   * sides equilateral triangles */
  return new Shape(faces).scale(center, Math.sqrt(2)/2, Math.sqrt(2)/2, 1);
}


var playerX, playerY;



// Rotation angle for our centerpiece
var angle = 0;
/*function scene() {



  iso.add(Octohedron(new Point(3, 2, 3.2))
   .rotateZ(new Point(3.5, 2.5, 0), angle)
   , new Color(0, 180, 180));

  angle += 2 * Math.PI / 60;
}*/


//setInterval(scene, 1000 / 30);

var prefix, moved = true;
var prefixMatch = function(p) {

  var i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
};

var getRandomPosition = function(mazeArray){
    var position = [0, 0],
      value = 0;

    while(value == 0){
      var position = [(Math.random()* mazeArray.length - 1) | 0, (Math.random()* mazeArray[0].length - 1) | 0];
      value = mazeArray[position[0]][position[1]]; 
    }

    return position;
};

var newMaze, position, collection, collected, playerX, playerY, reset = false;

var game = function(){
  newMaze = maze(12, 12);
  position = getRandomPosition(newMaze);
  collected = []; 
  collection = [];
  playerX = position[1];
  playerY = position[0];
  reset = false;
  animate();
};

var animate = function() {

    requestAnimFrame(animate);

    // Base path (inverse)
    if(moved){

      iso.canvas.clear();

      var vertmap = [];
      for(var y in newMaze){
        // inverting array order
        y = (newMaze.length -1) -parseInt(y);
      
        var r = newMaze[y];

        for(var x in r){
          x = (r.length -1) - parseInt(x);

          var histo = r[x];

          if(histo >= 1){
            vertmap.push([x,y]);
            iso.add(Shape.Prism(new Point(x, y, -0.5), 1, 1, 0.3), new Color(200 -histo, 100 - histo, 100 - histo));

            if(histo % 2 == 0){
              var visited = collected.filter(function(pos){ return pos[0] == x && pos[1] == y })[0];
              
              if(!visited){
                var crystal = collection.filter(function(pos){ return pos[0] == x && pos[1] == y })[0];

                if(!crystal){
                  collection.push([x, y]);
                } 
                iso.add(Octohedron(new Point(x, y , -0.1)), new Color(0, 180, 180));
              } 
            }
          } else {
            iso.add(Shape.Prism(new Point(x, y, -0.5), 1, 1, 0.1), new Color(22,22,22));
          }
        }
      }
      
      iso.add(Shape.Prism(new Point(playerX+ 0.5, playerY + 0.5, -0.6), 0.7, 0.7, 0.6), new Color(255,255,255));
      moved = false;

      var test = vertmap.filter(function(f){ return f[0] == (playerX) && f[1] == (playerY) });
      
      if(test.length == 0){

        playerX = position[0];
        playerY = position[1];

        position = test[0];
        moved = true;
        
        animate();
      } else {
        position = test[0];

        if(collection.length == 0){
          // new game
          reset = true;
          moved = true;
          game();
        }

        document.getElementById('score').innerText = 'Score: ' + score;
      }
    }
};

window.addEventListener('load', function(){

  prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

  window.requestAnimFrame = (function(){

    var lastTime = 0, _prefix = prefix.replace(/-/g, '');

    var requestAnimationFrame = window[_prefix+'RequestAnimationFrame'];
    var cancelAnimationFrame =  window[_prefix+'CancelAnimationFrame'] || window[_prefix+'CancelRequestAnimationFrame'];

    // 'moz' is for slow linux renderer for mozilla
    if(!requestAnimationFrame || _prefix.indexOf('moz')){
      return window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime(),
          timeToCall = Math.max(0, 1 - (currTime - lastTime)),
          id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

        lastTime = currTime + timeToCall;
        return id;
      };
    } else {
      return window.requestAnimationFrame;
    }

    if(!cancelAnimationFrame){
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }else {
      return window.cancelAnimationFrame;
    }
  })();

  document.body.addEventListener('keydown', function(e) {
    // 37 = < (left)
    // 38 = ^ (up)
    // 39 = > (right)
    // 40 = v (down)
    if(!reset){
      if(e.keyCode == 37){
        playerX -= 1;
        moved = true;
      }

      if(e.keyCode == 38){
        playerY += 1;
        moved = true;
      }

      if(e.keyCode == 39){
        playerX += 1;
        moved = true;
      }

      if(e.keyCode == 40){
        playerY -= 1;
        moved = true;
      }

      var crystal = collection.filter(function(pos){ return pos[0] == playerX && pos[1] == playerY })[0];

      if(crystal){
        var index = collection.indexOf(crystal);
        collection.splice(index, 1);
        score++;
        collected.push([playerX, playerY]);
      }
    }

  });

  game();

});