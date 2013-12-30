/***
 * Vex webgl port
 * Autor: Bernard Bekker
 * Year: 2013
 *
 * This code is shared under the:
 * Creative Commons Attribution-NonCommercial 4.0 International Public License
 *
 * http://creativecommons.org/licenses/by-nc/4.0/deed.en_US
 *
 */

var renderer = {}; // renderer

var gl; // webgl context
var program; //shader program
var loop=0;


renderer.init = function init(){

    //get canvas
    canvas = document.getElementById("vex-canv");
    //get gl context
    gl = canvas.getContext("experimental-webgl");
    //view port
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.aspect = canvas.width / canvas.height;

    gl.aspectTransform = mat4.identity(mat4.create());
    mat4.scale(gl.aspectTransform, vec3.create([2.0/canvas.width,2.0/canvas.height,1]));

    //init shaders
    renderer.initShaders();

    //get shader variables
    program.uColor = gl.getUniformLocation(program, "uColor");
    program.uTransformation = gl.getUniformLocation(program, "uTransformation");
    program.uAspectTransformation = gl.getUniformLocation(program, "uAspectTransformation");

    //Set shaders to use
    gl.useProgram(program);

    //set clear color
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.lineWidth(4.0);

    //clear screen using color buffer.
    gl.clear(gl.COLOR_BUFFER_BIT);

    //load ships into memory
    renderer.loadShips();
    renderer.loadBullets();

}


renderer.shipObject = {};

renderer.loadShips = function(){
    //Objects to draw
    renderer.shipObject.vertices = new Float32Array([
        0, 25.0,
        15.0,-15.0,
        0, 25.0,
        -15.0,-15.0,
        15.0, -15.0,
        -15.0,-15.0// Triangle 2
    ]);

    //Bookkeeping
    renderer.shipObject.itemSize = 2;
    renderer.shipObject.numItems = renderer.shipObject.vertices.length / renderer.shipObject.itemSize;

    //Store data in GFX memory
    renderer.shipObject.vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.shipObject.vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, renderer.shipObject.vertices, gl.STATIC_DRAW);

}

renderer.bulletObject = {};

renderer.loadBullets = function(){
    //Objects to draw
    renderer.bulletObject.vertices = new Float32Array([
       -2.0, 0.0,
        0.0, 6.0,
        0.0, 6.0,
        2.0, 0.0,
       -2.0, 0.0,
        2.0, 0.0
    ]);

    //Bookkeeping
    renderer.bulletObject.itemSize = 2;
    renderer.bulletObject.numItems = renderer.bulletObject.vertices.length / renderer.bulletObject.itemSize;

    //Store data in GFX memory
    renderer.bulletObject.vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.bulletObject.vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, renderer.bulletObject.vertices, gl.STATIC_DRAW);

}

renderer.drawStuff = function drawStuff(){
    //set aspect matrix
    gl.uniformMatrix4fv(program.uAspectTransformation, false, gl.aspectTransform);

    //clear the screen before rendering
    gl.clear(gl.COLOR_BUFFER_BIT);


    renderer.drawShips();
    renderer.drawBullets();
}

renderer.drawShips = function(){
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.shipObject.vbuffer);
    for(var iship in vex.ships){
        var ship = vex.ships[iship];

        //generate transformation matrix
        var transformation = mat4.create();
        mat4.identity(transformation);
        mat4.rotateZ(mat4.translate(transformation,ship.location),-ship.rotation);

        gl.uniform4fv(program.uColor, ship.color);
        gl.uniformMatrix4fv(program.uTransformation, false, transformation);

        //Link shader variable to buffer data
        program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(program.aVertexPosition, renderer.shipObject.itemSize, gl.FLOAT, false, 0, 0);

        //draw!
        gl.drawArrays(gl.LINES, 0, renderer.shipObject.numItems);
    }
}

renderer.drawBullets = function(){

    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.bulletObject.vbuffer);
    for(var ibullet in vex.bullets){
        var bullet = vex.bullets[ibullet];

        //generate transformation matrix
        var transformation = mat4.create();
        mat4.identity(transformation);
        mat4.rotateZ(mat4.translate(transformation,bullet.location),vec3.rotation(bullet.vel));

        gl.uniform4fv(program.uColor, [1.0,1.0,1.0,1.0]);
        gl.uniformMatrix4fv(program.uTransformation, false, transformation);

        //Link shader variable to buffer data
        program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(program.aVertexPosition, renderer.bulletObject.itemSize, gl.FLOAT, false, 0, 0);

        //draw!
        gl.drawArrays(gl.LINES, 0, renderer.bulletObject.numItems);
    }

}

renderer.initShaders = function initShaders(){
    var v = document.getElementById("vertex").firstChild.nodeValue;
    var f = document.getElementById("fragment").firstChild.nodeValue;

    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, v);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, f);
    gl.compileShader(fs);

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
        console.log(gl.getShaderInfoLog(vs));

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
        console.log(gl.getShaderInfoLog(fs));

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.log(gl.getProgramInfoLog(program));
}
