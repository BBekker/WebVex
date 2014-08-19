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


//Vex game logic

var vex = new Object();
vex.players = [];
vex.ships = [];
vex.bullets = [];
vex.powerups = [];
vex.bOffset = 0;
vex.multiplayer = true;
prevtime = 0;
rotationspeed = 150;

colors = [[0.9 , 0.1, 0.1, 1.0],[0.1,0.9,0.1,1.0],[0.1,0.1,0.9,1.0]]

vex.init = function(){

    //Reset variables
    vex.players = [];
    vex.ships = [];
    vex.bullets = [];
    vex.powerups = [];
    vex.bOffset = 0;
    prevtime = 0;

    //capture keys
    document.onkeydown = captureKeyDown;
    document.onkeyup = captureKeyUp;

    //Load graphics/shaders
    renderer.init();

    //test
    new Powerup(vec3.create([0,0,0]));
}

vex.start = function(){
    //start game loop
    window.requestAnimationFrame(vex.gameloop);
}

vex.gameloop = function(time){
    if(prevtime == 0)
        prevtime = time-1;
    var dt = (time - prevtime);
    prevtime = time;
    //console.log(dt);

    if(vex.ships.length < 2){
        //game finished!
        gameFinished();
        return;
    }

    vex.physics(dt,time);
    vex.collision();
    renderer.drawStuff();

    //document.getElementById("fps").innerHTML = Math.round(1/(dt/1000)) + " fps";

    //next frame
    window.requestAnimationFrame(vex.gameloop);
}

vex.physics = function(dt,time){
    for(var iship in vex.ships){
        var ship = vex.ships[iship];

        if(ship.hp <= 0){
            ship.remove();
            continue;
        }

        if(ship.player){
            var player = ship.player;


            ship.rotation += dt/rotationspeed * player.rotation;
            if(ship.rotation < 0) ship.rotation += 2*Math.PI;
            if(ship.rotation > 2*Math.PI) ship.rotation -= 2*Math.PI;

            //create a new acceleration vector
            var accvec = new vec3.create([dt * player.acceleration*ship.acceleration*Math.cos(ship.rotation),dt * player.acceleration*ship.acceleration*Math.sin(ship.rotation),0]);
            //add it
            ship.movement = vec3.add(ship.movement,accvec);

            if(player.fire){
                ship.fire(time);
            }

        }

        //calculate new location
        ship.location = vec3.add(ship.location,vec3.scale(ship.movement,dt,vec3.create()));

        //magic drag
        vec3.scale(ship.movement, 1-0.05*dt/100);

        //magic warp
        if(ship.location[0] > canvas.width/2){
            ship.location[0] -= canvas.width;
        } else if(ship.location[0] < -canvas.width/2){
            ship.location[0] += canvas.width;
        }

        if(ship.location[1] > canvas.height/2){
            ship.location[1] -= canvas.height;
        }else if(ship.location[1] < -canvas.height/2){
            ship.location[1] += canvas.height;
        }
    }

    for(var i = 0; i< vex.bullets.length; i++){
        var bullet = vex.bullets[i];
        if(bullet.tick(dt)){
            vex.bOffset =i+1;
            continue;
        }
        vec3.add(bullet.location,vec3.scale(bullet.vel,dt/4,vec3.create()));
        if(Math.abs(bullet.location[0]) > canvas.width/2){
            bullet.location[0] *= -1.0;
        }
        if(Math.abs(bullet.location[1]) > canvas.height/2){
            bullet.location[1] *= -1.0;
        }
    }
    vex.bullets.splice(0,vex.bOffset);
    vex.bOffset = 0;
}

vex.touching = [];
vex.collision = function(){
    //bullets/ships
    vex.ships.forEach(function(ship){
        vex.bullets.forEach(function(bullet){
            var s = ship.location;
            var b = bullet.location;
            if(ship.player !== bullet.owner && Math.sqrt((s[0]-b[0])*(s[0]-b[0]) + (s[1]-b[1])*(s[1]-b[1])) < 20){
                vex.bullets.splice(vex.bullets.indexOf(bullet),1); // hyper inefficient remove
                ship.hp -= bullet.damage;
                bullet.owner.score += bullet.damage;

                //bonus for a clean kill
                if(ship.hp < 0){
                    bullet.owner.score += 100;
                }
            }
        })
    });

    for(var i =0; i<vex.ships.length; i++)for (var j = i + 1; j < vex.ships.length; j++) {
        var s1 = vex.ships[i];
        var s2 = vex.ships[j];
        if (!s1 || !s2)
            continue;
        if (s1 == s2)
            continue;


        if (vec3.length(vec3.subtract(s1.location, s2.location,[])) < 35) {
            var rel = vec3.subtract(s1.movement, s2.movement, []);
            vec3.add(s1.movement, vec3.negate(rel));
            vec3.add(s2.movement, vec3.negate(rel));

            var len = vec3.length(rel);

            if (vex.touching[s1.id] == s2.id)
                continue; //skip the rest, they are pushing

            s1.hp -= len * 10;
            s2.hp -= len * 10;

            if (s1.hp < 0)
                s2.player.score += 100;
            if (s2.hp < 0)
                s1.player.score += 100;

            vex.touching[s1.id] = s2.id;
        } else if (vex.touching[s1.id] == s2.id) {
            vex.touching.splice(s1.id, 1);
        }
    }
}

function captureKeyDown(e) {
    e = e || window.event;
    var res = true;
    for( var playerId in vex.players){
        var player = vex.players[playerId];
        switch (e.keyCode) {
            case player.keys[0]:
                player.acceleration = 1.0;
                res = false;
                break;
            case player.keys[1]:
                player.acceleration = -0.5;
                res = false;
                break;
            case player.keys[2]:
                player.rotation = 1.0;
                res= false;
                break;
            case player.keys[3]:
                player.rotation = -1.0;
                res = false;
                break;
            case player.keys[4]:
                player.fire = 1;
                res = false;
                break;
        }
    }
    //alert(e.keyCode);
    return res;
}

function captureKeyUp(e) {
    e = e || window.event;
    var res = true;
    for( var playerId in vex.players){
        var player = vex.players[playerId];
        switch (e.keyCode) {
            case player.keys[0]:
                player.acceleration = 0.0;
                res = false;
                break;
            case player.keys[1]:
                player.acceleration = 0.0;
                res = false;
                break;
            case player.keys[2]:
                player.rotation = 0.0;
                res = false;
                break;
            case player.keys[3]:
                player.rotation = 0.0;
                res = false;
                break;
            case player.keys[4]:
                player.fire = 0;
                res = false;
                break;
        }
    }
    //alert(e.keyCode);
    return res;
}


//Player object
function Player(name, ship, keys, color){
    this.id = vex.players.length;
    this.name = name;
    if(keys)
        this.keys = keys;
    if(color)
        this.color = color;
    if(ship)
        this.connectShip(ship);
    vex.players[this.id] = this;
    this.ref = this;
    this.score = 0;
    return this;
}

Player.prototype = {
    remove : function() {
                vex.players.splice(this.id,1);
                this.ship.player = null;
             },
    connectShip : function(ship){
        this.ship = ship;
        ship.connectPlayer(this);
    },
    keys : [38,40,37,39,32], //up, down, left, right, fire
    name : "",
    shipType : 1,
    acceleration: 0, // 1: forwards, -1 backwards.
    rotation : 0,
    fire : 0
}

//Ship object
function Ship(type,location,rotation,color){
    this.id = vex.ships.length;
    this.type = type || 1;
    vex.ships[this.id] = this;

    this.location = location || new vec3.create([0,0,0]);
    this.movement = new vec3.create([0,0,0]);
    this.rotation = rotation || 0;

    this.color = color || [0.9 , 0.1, 0.1, 1.0];
    this.hp = 100;
    this.lastFire = 0;
    this.firedBullets = [];
    return this;
}

Ship.prototype = {
    hp : 100,
    type : 1,
    connectPlayer : function(player){
        this.player = player;
        this.color = player.color || this.color;
    },
    remove : function() {
        vex.ships.splice(this.id,1);
        if(this.player)
            delete this.player.ship;
    },
    fire : function(time){
        if(time > this.lastFire + 1/(this.rpm/60/1000)){
            var bul = new Bullet( this.player,
                        this.location,
                        vec3.add(new vec3.create([Math.cos(this.rotation)*this.muzzleVel,Math.sin(this.rotation)*this.muzzleVel,0]), this.movement));
            if(vex.multiplayer)
                this.firedBullets.push(bul.getNetworkData());
            this.lastFire = time;
        }
    },
    getNetworkData : function(){
        var shipInfo = {location: this.location,
                        movement: this.movement,
                        rotation: this.rotation,
                        newBullets: this.firedBullets}
        this.firedNullets = []; //clear fired bulets
    },
    rpm : 400, //rounds per minute
    acceleration : 0.001, // pixels per milisecond^2
    muzzleVel : 1.2,
    powerup: null
}

//Bullet object
function Bullet(owner,location,vel){
    vex.bullets.push(this);
    this.owner = owner;
    this.location = vec3.create(location);
    this.vel = vec3.create(vel);
    this.timeSpend = 0.0;
    return this;
}

Bullet.prototype = {
    tick : function(time){
        this.timeSpend += time;
        return (this.timeSpend > this.lifeTime)
    },
    getNetworkData : function(){
        return {
            owner : this.owner.name,
            location: this.location,
            vel: this.vel,
            time: new Date().getTime()
        }
    },
    damage : 5,
    timeSpend : 0,
    lifeTime : 4000, //ms
    speed : 10.0
}

function Powerup(loc) {
    vex.powerups.push(this);
    this.location = loc || vec3.create(0.5 * canvas.width, 0.5 * canvas.height, 0.0);
    this.ship = null;
    return this;
}

Powerup.prototype = {
    activate : function(shipp){
        this.ship = shipp;
        this.ship.muzzleVel *= 1.5;
    }
}