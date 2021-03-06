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

UI = {};

UI.init = function(){

    //setup UI elements
    UI.Scoreboard.update();

    UI.PlayerList.reset();
    UI.PlayerList.init();
    vex.players.forEach(function(p){
        UI.PlayerList.addPlayer(p);
    });

    window.setInterval(UI.PlayerList.update,250);

}



//Called when the game is finished
function gameFinished(){

    UI.showFinishedScreen();
}

UI.showFinishedScreen = function(){
    var sorted = vex.players.sort(function(p,p2){return p2.score - p.score});
    document.getElementById("winning_player").textContent = sorted[0].name;

    var r = document.getElementById("results");
    var verhaal = "";
    sorted.forEach(function(p){
        verhaal += p.name+":         "+ p.score+"</br>";
    });
    r.innerHTML = verhaal;

    document.getElementById("resultcontainer").setAttribute("style", "");
}



UI.Scoreboard = {
    update : function(){
        UI.Scoreboard.keepUpdating = 1;
        var scoreboard = document.getElementById("scoreboard");
        for(var iplayer in vex.players){
            var player = vex.players[iplayer];
            if(!UI.Scoreboard.scores[iplayer] || UI.Scoreboard.scores[iplayer] != player.score){
                var elem = document.getElementById("player_"+player.id);
                if(elem){
                    elem.textContent = player.name+": "+player.score;
                }else{
                    var newElem = document.createElement("div");
                    newElem.setAttribute("id","player_"+player.id);
                    newElem.textContent = player.name+": "+player.score;
                    scoreboard.appendChild(newElem);
                }
                UI.Scoreboard.scores[iplayer] = player.score;
            }
        }
        if(UI.Scoreboard.keepUpdating == 1)
            setTimeout(UI.Scoreboard.update,100);
    },
    stopUpdate : function(){
        this.keepUpdating = 0;
    },
    scores : [],
    lastUpdate : 0,
    keepUpdating: 1
}

UI.PlayerList = {
    init : function(){
        this.holderElem = document.getElementById("player_list");
        this.protoElem = document.getElementById("proto_player_list_item");
    },
    addPlayer : function(player){
        var elem = this.protoElem.cloneNode(true);
        elem.setAttribute("id","list_player"+player.id);
        elem.children[0].textContent = player.name;
        this.playerElems[player.id] = elem;
        this.elemVals[player.id] = {};
        this.holderElem.appendChild(elem);
    },
    update : function(){
        for(var pId in UI.PlayerList.playerElems){
            var player = vex.players[pId];
            var elem = UI.PlayerList.playerElems[pId];
            var vals = UI.PlayerList.elemVals[pId];

            if(player.ship && vals.hp != player.ship.hp){
                elem.children[3].children[0].setAttribute("style","height: "+player.ship.hp+"%");
                vals.hp = player.ship.hp;
            }
            if(!player.ship && vals.hp != 0){
                elem.children[3].children[0].setAttribute("style","height: "+0+"%");
                vals.hp = 0;
            }
            if(vals.score != player.score){
                elem.children[2].textContent = player.score;
                vals.score = player.score;
            }

        }
    },
    stopUpdate : function(){
        this.keepUpdating = 0;
    },
    reset : function(){
        this.holderElem.innerHTML = "";
        this.holderElem = {};
        this.playerElems = [];
        this.elemVals = [];
    },
    keepUpdating : 1,
    holderElem : {},
    playerElems : [],
    elemVals : []
}