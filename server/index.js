var express = require("express");
var cors = require("cors");
var socketio = require("socket.io");
var http = require("http");
var routes = require("./routes");
var usersMethods = require("./users");
var port = process.env.PORT || 5000;
var app = express();
var server = http.createServer(app);
var io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET"],
    },
});
app.use(cors());
app.use(express.json());
app.use(routes);
io.on("connection", function (socket) {
    socket.on("Join room", function (_a, callback) {
        var username = _a.username, room = _a.room;
        var _b = usersMethods.addUser({
            id: socket.id,
            username: username,
            room: room,
        }), user = _b.user, error = _b.error;
        if (error)
            return callback(error);
        socket.join(user.room);
        socket.emit("User id", user.id);
        socket.emit("Render message", {
            username: "Chatbot",
            text: "Hello " + user.username + ", welcome to " + user.room,
        }, usersMethods.getUsersInRoom(user.room));
        socket.broadcast.to(user.room).emit("Render message", {
            username: "Chatbot",
            text: user.username + " has joined the room",
        }, usersMethods.getUsersInRoom(user.room));
        callback();
    });
    socket.on("Send message", function (message, callback) {
        var user = usersMethods.getUser(socket.id);
        io.to(user.room).emit("Render message", {
            id: user.id,
            username: user.username,
            text: message,
        }, usersMethods.getUsersInRoom(user.room));
        callback();
    });
    socket.on("Upload image", function (imageSrc, callback) {
        var user = usersMethods.getUser(socket.id);
        io.to(user.room).emit("Render image", {
            id: user.id,
            username: user.username,
            imageSrc: imageSrc,
        }, usersMethods.getUsersInRoom(user.room));
        callback();
    });
    socket.on("Upload video", function (videoSrc, callback) {
        var user = usersMethods.getUser(socket.id);
        io.to(user.room).emit("Render video", {
            id: user.id,
            username: user.username,
            videoSrc: videoSrc,
        }, usersMethods.getUsersInRoom(user.room));
        callback();
    });
    socket.on("disconnect", function () {
        var user = usersMethods.deleteUser(socket.id);
        if (user) {
            io.to(user.room).emit("Render message", {
                username: "Chatbot",
                text: user.username + " has left the room",
            }, usersMethods.getUsersInRoom(user.room));
        }
    });
});
server.listen(port, function () { return console.log("Server is running at " + port); });
