import { Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, URL } from "./config";

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10); // Ensure saltRounds is 10 or appropriate
    return bcrypt.hash(password, salt);
  };

  const verifyPassword = async (
    inputPassword: string,
    dbPass: string
  ): Promise<boolean> => {
    return bcrypt.compare(inputPassword, dbPass);
  };

const errorResponse = (res: Response, message: string, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message });
};

const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15d" });
};

const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET || "");
    // Check if the decoded value is of type JwtPayload
    if (typeof decoded === "object" && decoded !== null) {
      return decoded as JwtPayload;
    }
    return null; // If it's a string or invalid, return null
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const addProfilePicURL = (profilepic: string): string => `${URL}${profilepic}`;


function convertSize(sizeInBytes: number) {
  // (KB)
  const sizeInKB = sizeInBytes / 1000;

  // (MB)
  const sizeInMB = sizeInKB / 1000;

  // (GB)
  const sizeInGB = sizeInMB / 1000;

  return {
    kb: sizeInKB.toFixed(2),
    mb: sizeInMB.toFixed(2),
    gb: sizeInGB.toFixed(2),
  };
}

export {
  errorResponse,
  addProfilePicURL,
  hashPassword,
  verifyPassword,
  convertSize,
  generateToken,
  verifyToken,
};
