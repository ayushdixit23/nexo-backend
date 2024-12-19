var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { DATABASE, PORT } from "./utils/config.js";
import connectDb from "./utils/db.js";
import userRouter from "./routes/auth.js";
import organisationRouter from "./routes/organisation.js";
import { register, requestCount, requestDuration } from "./utils/metrics.js";
import http from "http";
import { Server } from "socket.io";
import chatRouter from "./routes/conversation.js";
import { storeMessageToDB, storeMessageToDBForTeam, } from "./controllers/conversation.js";
import teamRouter from "./routes/team.js";
import tasksRouter from "./routes/tasks.js";
const app = express();
const server = http.createServer(app);
// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (you may want to restrict this in production)
        methods: ["GET", "POST"],
    },
});
// Middleware for logging
app.use(morgan("dev"));
app.use((req, res, next) => {
    const end = requestDuration.startTimer();
    res.on("finish", () => {
        var _a;
        const route = ((_a = req.route) === null || _a === void 0 ? void 0 : _a.path) || req.path;
        requestCount.labels(req.method, route, res.statusCode.toString()).inc();
        end({ method: req.method, route, status: res.statusCode.toString() });
    });
    next();
});
// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Enable CORS
app.use(cors());
// Routes
app.use("/api", userRouter);
app.use("/api", organisationRouter);
app.use("/api", chatRouter);
app.use("/api", teamRouter);
app.use("/api", tasksRouter);
app.get("/metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.set("Content-Type", register.contentType);
    res.send(yield register.metrics());
}));
// Example endpoint
app.get("/example", (req, res) => {
    res.send("Hello, Prometheus!");
});
app.get("/", (req, res) => {
    res
        .status(200)
        .json({ success: true, message: "Hello, Nexo server is running!" });
});
io.use((socket, next) => {
    try {
        const sessionID = socket.handshake.auth.id;
        if (sessionID) {
            socket.join(sessionID);
            console.log("Joined room", sessionID);
            return next();
        }
        return next(new Error("Authentication failed: Missing sessionID"));
    }
    catch (error) {
        console.error("Error in socket middleware:", error);
        return next(new Error("Internal server error"));
    }
});
io.on("connection", (socket) => {
    console.log(`A user connected with userId: ${socket.id}`);
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        console.log(`User with userId: ${socket.id} left room: ${roomId}`);
    });
    socket.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.type === "team") {
            socket.to(data.convId).emit("receive-message", data);
            yield storeMessageToDBForTeam(data);
        }
        else {
            socket.to(data.receiverid.id).emit("receive-message", data);
            yield storeMessageToDB(data);
        }
    }));
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});
// Server startup logic
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the database
        yield connectDb(DATABASE);
        // Start the server
        server.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    }
    catch (error) {
        console.error("Error starting the server:", error);
    }
});
startServer();
//# sourceMappingURL=index.js.map