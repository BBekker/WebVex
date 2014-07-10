
menu = {};

menu.playerBoxes = [];

function showMenu(){
    var menuContainer = document.getElementById("menucontainer");
    var playerListContainer  = findInnerElem(menuContainer, "menu_players");

    var protoPlayerBox = document.getElementById("proto_intro_player");

    //css hackery
    document.getElementById("vex-canv").style.height = document.getElementById("vex-canv").clientHeight-125+"px";



    //Setup player menu boxes.
    for(var i =1; i<6; i++){
        var playerbox = protoPlayerBox.cloneNode(true);
        playerbox.id = "player_"+i+"_box";
        playerbox.getElementsByClassName("intro_name")[0].textContent = "player "+i;
        playerbox.inactive = true;
        playerbox.classList.add("inactive");
        playerbox.onclick = function(){
            if(this.inactive){
            this.inactive = false;
            this.classList.remove("inactive");
            return true;
            }
            return false;
        }
        menu.playerBoxes[i] = playerbox;
        playerListContainer.appendChild(menu.playerBoxes[i]);
    }
    console.log(menu.playerBoxes.length);
}

function startGame(){

    var playernames = [];
    for(var i =1; i<menu.playerBoxes.length; i++){
        playernames[i] = findInnerElem(menu.playerBoxes[i],"player_name").value;
    }

    //set visible
    document.getElementById("gamecontainer").setAttribute("style","visibility:visible");
    document.getElementById("resultcontainer").setAttribute("style","visibility:hidden");
    document.getElementById("menucontainer").setAttribute("hidden","true");


    //prepare game
    vex.init();

    //add players
    var player = new Player(playernames[1],new Ship(1,[-100.0,-100.0,0.0],1.5),null,colors[0]);
    var player2 = new Player(playernames[2],new Ship(1,[100.0,100.0,0.0],5), [87,83,65,68,16],colors[1]);

    //Initialize UI elements.
    UI.init();

    //start game!
    vex.start();
}


function findInnerElem(elem, id){
    for(var e in elem.children){
        if(elem.children[e].id == id){
            return elem.children[e];
        }
    }
    return undefined;
}