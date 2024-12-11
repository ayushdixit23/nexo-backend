import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/helper";

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can define the type of user here if needed
    }
  }
}

export const verifyTokenMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void|Response> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decodedToken;

    next();
  } catch (error: Error | any) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
        error: "Token expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      console.log("Invalid token");
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please provide a valid token.",
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Token verification failed. Please try again later.",
      error: error.message,
    });
  }
};
