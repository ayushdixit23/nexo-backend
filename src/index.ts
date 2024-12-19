import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { DATABASE, PORT } from "./utils/config.js";
import connectDb from "./utils/db";
import userRouter from "./routes/auth";
import organisationRouter from "./routes/organisation";
import { register, requestCount, requestDuration } from "./utils/metrics";
import http from "http";
import { Server, Socket } from "socket.io";
import chatRouter from "./routes/conversation";
import {
  storeMessageToDB,
  storeMessageToDBForTeam,
} from "./controllers/conversation";
import teamRouter from "./routes/team";
import tasksRouter from "./routes/tasks";

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

app.use((req: Request, res: Response, next: NextFunction) => {
  const end = requestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.path;
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

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// Example endpoint
app.get("/example", (req: Request, res: Response) => {
  res.send("Hello, Prometheus!");
});

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: "Hello, Nexo server is running!" });
});

io.use((socket: Socket, next:any) => {
  try {
    const sessionID = socket.handshake.auth.id;

    if (sessionID) {
      socket.join(sessionID);
      console.log("Joined room", sessionID);
      return next();
    }

    return next(new Error("Authentication failed: Missing sessionID"));
  } catch (error) {
    console.error("Error in socket middleware:", error);
    return next(new Error("Internal server error"));
  }
});

io.on("connection", (socket: Socket) => {
  console.log(`A user connected with userId: ${socket.id}`);

  socket.on("join-room", (roomId:string) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("leave-room", (roomId:string) => {
    socket.leave(roomId);
    console.log(`User with userId: ${socket.id} left room: ${roomId}`);
  });

  socket.on("message", async (data: any) => {
    if (data.type === "team") {
      socket.to(data.convId).emit("receive-message", data);
      await storeMessageToDBForTeam(data);
    } else {
      socket.to(data.receiverid.id).emit("receive-message", data);
      await storeMessageToDB(data);
    }
  });
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Server startup logic
const startServer = async () => {
  try {
    // Connect to the database
    await connectDb(DATABASE);

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();
