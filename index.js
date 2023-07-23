const http = require("http");
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const socketIO = require("socket.io");
require('dotenv').config();

const homeRouter = require('./routes/web/home');
const usersRouter = require('./routes/api/users');
const errorHandler = require('./middlewares/errorHandler');
const error404Handler = require('./middlewares/error404Handler');

const app = express();

/*************************************
    Application Configuration 
**************************************/

// Setting EJS as a templete engine
app.set('view engine', 'ejs');


/*************************************
    MongoDB Database Connection 
**************************************/

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log('Connected to mongodb...'))
    .catch(err => console.log("Could not connect to mongodb...", err));


/*******************************************
    Applying Middlewares in our application
********************************************/

// for secure express app by setting various HTTP headers.
// https://www.securecoding.com/blog/using-helmetjs/
app.use(helmet());


// for serve static files such as images, CSS files, and JavaScript files in a directory named 'public'
app.use(express.static('public'));


/*
 * for parse application/json
 * basically parse incoming Request Object as a JSON Object 
*/
app.use(express.json());


/*
 * for parse application/x-www-form-urlencoded
 * we can parse incoming Request Object if strings or arrays (when extended is false)
 * we can also parse (when extended is true) incoming Request Object 
 * if object, with nested objects, or generally any type
*/
app.use(express.urlencoded({ extended: true }));


// for enabling cors requests from clients for a specific set of origins
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))


// For HTTP request logging in development environment
if (app.get('env') === 'development') {
    app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms'));
}


/*************************************
    Bind Routes in our application
**************************************/

app.use('/', homeRouter);
app.use('/api/v1/users', usersRouter);
app.use(error404Handler);
app.use(errorHandler);


/*************************************
    Http Server Starting Logic
**************************************/

const server = http.createServer(app);

const io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.FRONTEND_BASE_URL]
    },
});

const room1Namespace = io.of("/room1");
const room2Namespace = io.of("/room2");

const r1users = {};
const r1socketToRoom = {};

room1Namespace.on('connection', (socket) => {
    console.log(`A user with the socketId: ${socket.id} is connected`);

    socket.on("join_room", (roomID) => {
        if (r1users[roomID]) {
            const length = r1users[roomID].length;

            if (length === 2) {
                socket.emit("room full");
                return;
            }

            r1users[roomID].push(socket.id);
        }
        else {
            r1users[roomID] = [socket.id];
        }

        r1socketToRoom[socket.id] = roomID;

        const usersInThisRoom = r1users[roomID].filter((id) => id !== socket.id);

        console.log("users: ", r1users);
        console.log("socketToRoom: ", r1socketToRoom);
        console.log("usersInThisRoom: ", usersInThisRoom);

        socket.emit("all_peers", usersInThisRoom);
    });

    socket.on("sending_sdp_offer", (payload) => {
        room1Namespace.to(payload.userToSignal).emit("receive_sdp_offer", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("sending_sdp_answer", (payload) => {
        room1Namespace.to(payload.callerID).emit("receive_sdp_answer", {
            signal: payload.signal,
            id: socket.id,
        });
    });

    socket.on('disconnect', () => {
        console.log(`A user with the socketId: ${socket.id} is disconnected`);

        const roomID = r1socketToRoom[socket.id];
        const socketsInRoom = r1users[roomID];

        if (socketsInRoom) {
            const updatedSocketsInRoom = socketsInRoom.filter((id) => id !== socket.id);

            r1users[roomID] = updatedSocketsInRoom;

            delete r1socketToRoom[socket.id];

            socket.broadcast.emit("user left", socket.id);
        }
    });
});


let initiator = null;
const r2users = {};
const r2socketToRoom = {};

room2Namespace.on('connection', (socket) => {
    console.log(`A user with the socketId: ${socket.id} is connected`);

    socket.on("join_room", ({ roomID, init }) => {
        r2users[roomID] ? r2users[roomID].push(socket.id) : r2users[roomID] = [socket.id];

        r2socketToRoom[socket.id] = roomID;

        if (init) {
            initiator = socket.id;
        }
        else {
            room2Namespace.to(initiator).emit("peer_connected", socket.id);
        }

        console.log("users: ", r2users);
        console.log("initiator: ", initiator);
        console.log("socketToRoom: ", r2socketToRoom);
    });

    socket.on("sending_sdp_offer", (payload) => {
        room2Namespace.to(payload.userToSignal).emit("receive_sdp_offer", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("sending_sdp_answer", (payload) => {
        room2Namespace.to(payload.callerID).emit("receive_sdp_answer", {
            signal: payload.signal,
            id: socket.id,
        });
    });

    socket.on('disconnect', () => {
        console.log(`A user with the socketId: ${socket.id} is disconnected`);

        const roomID = r2socketToRoom[socket.id];
        const socketsInRoom = r2users[roomID];

        if (socketsInRoom) {
            const updatedSocketsInRoom = socketsInRoom.filter((id) => id !== socket.id);

            r2users[roomID] = updatedSocketsInRoom;

            delete r2socketToRoom[socket.id];

            socket.broadcast.emit("user left", socket.id);
        }
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});