
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});


var clients = [];
var channels = [];


var ids = 0;
wss.on('connection', function (ws) {
    var uid = ids++;
    var client = new Client(uid, ws);
    clients[uid]=client;

    ws.on('message', function(msg){client.receive.bind(client)(msg)});

});




function Client(id, ws){
    this.id = id;
    this.ws = ws;
    this.channel = null;
    this.changeChannel(0);

    return this;
}

Client.prototype = {
    /**
     * Client.send
     * @param msg
     */
    send: function(msg){ this.ws.send(msg)} ,

    /**
     * Client.receive
     * Parse message
     * @param msg
     */
    receive: function(json){
        //console.dir(this);
        msg = JSON.parse(json);

        if(msg.type == "cmd"){
            if(msg.cmd == "gmsg")
                this.send(channels[this.channel].lastmessage);
            if(msg.cmd == "channel")
                this.changeChannel(msg.data == "" ? 0 : msg.data);
        }

        if(msg.type == "msg"){
            console.log("broadcasting to channel "+this.channel);
            console.dir(channels[this.channel].clients);
            channels[this.channel].broadcast(msg.msg);
            channels[this.channel].lastmessage = msg.msg;
        }

        console.log('received: %s from %s', msg.type, typeof this);
    },

    /**
     * changeChannel
     */
    changeChannel : function(channelid){
       if(this.channel) channels[this.channel].removeClient.bind(channels[this.channel])(this);
       this.channel = channelid;
       if(channels[channelid] == undefined)
            channels[channelid] = new Channel(channelid);

       //console.dir(channels[channelid]);
       channels[channelid].addClient(this);
    }
}



function Channel(id){
    this.id = id;
    this.clients = [];
    this.lastmessage= "";
    return this;
}

Channel.prototype = {
    addClient : function(client){
        this.clients[client.id] = client;
    },
    removeClient : function(client){
        this.clients.splice(client.id,1);
        if(clients.length == 0) ; //probs should remove this

    },
    broadcast : function(msg){
        this.clients.forEach(function(client){client.send(msg)});
    }
}