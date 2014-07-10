

var network = {};

/**
 * Connect to server
 */
network.connect = function(){
    websocket = new WebSocket("ws://vps.bernardbekker.nl:8080");

    websocket.onopen = function(){
        console.log("con opened");
        websocket.send(JSON.stringify({type:"cmd", cmd:"channel", data: channel}));
        websocket.send(JSON.stringify({type: "cmd", cmd:"gmsg"}));
    }

    websocket.onmessage = function(msg){
        network.receive(msg.data);
    }
}


/**
 * Send player information to server
 * @param player
 */
network.send = function(player){
    var packet = {type:"update", cmd:""}
}

network.receive = function(){

}