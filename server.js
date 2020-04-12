var app = require('express')();
var http = require('http').createServer(app);

app.get('/', function(req, res){
	console.log("Someone requested the main page");
	res.sendFile(__dirname + '/index.html');
});

app.get("/main.js", function(req, res){
	console.log("Someone requested javascript");
	res.sendFile(__dirname + "/main.js");
});




var io = require("socket.io")(http);
io.origins("*:*");


let connection_id = 0;
let data = {
	people:{
		"-1":{
			"name": "A realtime random boy","size":10,"id":"-1","x":5,"y":5
		},
	}
};
io.on("connection",(socket) => {
	console.log(socket.handshake.address);
	let id = connection_id ++;
	let newPerson = {"name":"Gimme a moment","id":id,x:Math.random()*100,y:Math.random()*100,size:10};
	data.people[id] = newPerson;
	data.people["-1"].x = 5;
	data.people["-1"].y = 5;
	socket.emit("setup",{data:data,new_user_id:id});
	console.log("Connected ",newPerson);
	data.people["-2"] = {"name":"A boy who will break your world","size":30,"id":"breaker0","x":10,"y":10};
	data.people["-3"] = {"name":"Mc Destroyer","size":50,"id":"breaker0","x":70,"y":100};
	
	socket.on('disconnect',() => {
		delete data.people[id];
	});
	
	socket.on("update",(updatedPerson) => {
		console.log("Update from: -",updatedPerson.id);
		data.people[updatedPerson.id] = updatedPerson;
	});
	console.log(data.people);
});
setInterval(() => {
	console.log("Updating data")
	data.people["-1"].x += Math.random()*2-1;
	data.people["-1"].y += Math.random()*2-1;
	io.sockets.emit('update', data);
}, 50);

http.listen(2100, () => {
	console.log('Listening on port 2100!')
});