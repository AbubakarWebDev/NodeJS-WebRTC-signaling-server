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

let initiator = null;

const users = {};
const socketToRoom = {};

io.on('connection', (socket) => {
    console.log(`A user with the socketId: ${socket.id} is connected`);

    socket.on("join_room", ({ roomID, init }) => {
        users[roomID] ? users[roomID].push(socket.id) : users[roomID] = [socket.id];

        socketToRoom[socket.id] = roomID;

        init ? initiator = socket.id : io.to(initiator).emit("peer_connected", socket.id);
    });

    socket.on("sending_sdp_offer", (payload) => {
        io.to(payload.userToSignal).emit("receive_sdp_offer", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("sending_sdp_answer", (payload) => {
        io.to(payload.userToSignal).emit("receive_sdp_answer", {
            signal: payload.signal,
            callerID: payload.callerID,
        });
    });

    socket.on("sending_file_MetaData", (payload) => {
        io.to(payload.userToSignal).emit("receive_file_MetaData", {
            metaData: payload.metaData,
            callerID: payload.callerID,
        });
    });

    socket.on("successfully_store_file_MetaData", (payload) => {
        io.to(payload.userToSignal).emit("peer_successfully_store_file_MetaData", {
            callerID: payload.callerID,
        });
    });

    socket.on('disconnect', () => {
        console.log(`A user with the socketId: ${socket.id} is disconnected`);

        const roomID = socketToRoom[socket.id];
        const socketsInRoom = users[roomID];

        if (socketsInRoom) {
            const updatedSocketsInRoom = socketsInRoom.filter((id) => id !== socket.id);

            users[roomID] = updatedSocketsInRoom;

            delete socketToRoom[socket.id];

            socket.broadcast.emit("user_left", socket.id);
        }
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});