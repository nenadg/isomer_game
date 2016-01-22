
function clone (src) {
    return JSON.parse(JSON.stringify(src));
}

var maze = function(width, height){

    var field = [];

    // create field matrix of size: (size)*(size)
    // filled with 0's (empty space)
    for(var i = 0; i < width; i++){
        field.push([]);

        for(var j = 0; j < height; j++){
            field[i].push(0);
        }
    }

    var minimum = width*height / 3 | 0;
    var current = 0;
    var lastCurrent = 0;

    var alter = clone(field);
    var start = [(Math.random()*width - 1) | 0, (Math.random()*height - 1) | 0];
    var v = 0;

    function genmaze(pos){

        var adjacent = [
           [pos[0]-1, pos[1]],
           [pos[0]+1, pos[1]],
           [pos[0], pos[1]+1],
           [pos[0], pos[1]-1]
        ];

        var diags = [
           [pos[0]-1, pos[1]-1],
           [pos[0]-1, pos[1]+1],
           [pos[0]+1, pos[1]-1],
           [pos[0]+1, pos[1]+1]];

        var neighbors = [];

        for (var l = 0; l < 4; l++) {
            if (adjacent[l][0] > -1 && adjacent[l][0] < width && adjacent[l][1] > -1 && adjacent[l][1] < height) { 
                neighbors.push(adjacent[l]); 
            }
        }
  
        // Choose one of the neighbors at random
        var rndn = Math.floor(Math.random()*neighbors.length);
        var next = neighbors[rndn];

        // already visited
        if(alter[pos[0]][pos[1]] == v){
            v = 0;
        }

        field[pos[0]][pos[1]] = v;
        alter[pos[0]][pos[1]] = v;
        
        if(field[next[0]-1] && field[next[0]+1]){

            // non-diagonal neighboring positions should not form a square
            var isSquare = ((field[next[0]-1][next[1]]) > 1) +
                           (field[next[0]+1][next[1]] > 1) +
                           (field[next[0]][next[1]+1] > 1) +
                           (field[next[0]][next[1]-1] > 1);
            
            if (isSquare === 1){
                start = next;
                genmaze(start);
            }

            current++;
            v++;
        } else {
            current--;
        }
    };

    while (current < minimum) {
        genmaze(start);
    }
    
    
    return field;
}