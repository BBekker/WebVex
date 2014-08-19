/**
 * Created by Bernard on 3/16/14.
 */

var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8080});

var Channel = {id: 0 , clients: [] , lastMessage:""};

var clients = [];
var channels =[];


var ids = 0;
wss.on('connection', function (ws) {
    var uid = ids++;
    clients[uid] = ws;
    ws.uid = uid;
    ws.on('message', receive);
    ws.on('close', function(code,message){
        console.log("connection closed id:"+this.uid);
        channels[this.channel].clients.splice(channels[this.channel].clients.lastIndexOf(this),1);
        broadcastUsers(this.channel);
    });

});


function receive(json){
    //this = websocket connection
    var msg = JSON.parse(json);

    if(msg.type == "cmd"){
        if(msg.cmd == "gmsg")
            sendMsg(this,channels[this.channel].lastMessage);
        if(msg.cmd == "channel"){
            changeChannel(this,msg.data);
        }
    }

    if(msg.type == "msg"){
        console.log("broadcasting to channel "+this.channel);
        broadcastMsg(this.channel,msg.msg);
        channels[this.channel].lastMessage = msg.msg;
    }

    console.log('received: %s from %d', msg.type, this.uid);
}

function changeChannel(ws,channel){
    if(!channels[channel]){
        channels[channel] = Object(Channel);
        channels[channel].id = channel;
    }
    ws.channel = channel;
    channels[channel].clients[ws.uid]=ws;
    sendMsg(ws,channels[channel].lastMessage);
    broadcastUsers(channel);

}

function sendMsg(ws, msg){
    var obj = {
        type: "msg",
        msg: msg
    };
    var json = JSON.stringify(obj);
    try{
        ws.send(json);
    }catch(e){
        console.log("user: "+ws.uid+" error: "+e);
    }
}

function sendResponse(ws, cmd, data){
    var obj = {
        type: "response",
        cmd: cmd,
        data: data
    }
    var json = JSON.stringify(obj);
    try{
        ws.send(json);
    }catch(e){
        console.log("user: "+ws.uid+" error: "+e)
    }
}

function broadcastUsers(channel){
    var cids = [];
    channels[channel].clients.forEach(function(ws){cids.push(ws.uid)});
    broadcastResponse(channel, "users", cids);
}

function broadcastMsg(channel, msg){
    var ch = channels[channel];
    ch.clients.forEach(function(ws){sendMsg(ws,msg)});
}

function broadcastResponse(channel, cmd, data){
    var ch = channels[channel];
    ch.clients.forEach(function(ws){sendResponse(ws,cmd,data)});
}

