import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { DATABASE, PORT } from "./utils/config";
import connectDb from "./utils/db";
import userRouter from "./routes/auth";
import organisationRouter from "./routes/organisation";
import { register, requestCount, requestDuration } from "./utils/metrics";

const app = express();
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

// Server startup logic
const startServer = async () => {
  try {
    // Connect to the database
    await connectDb(DATABASE);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();
