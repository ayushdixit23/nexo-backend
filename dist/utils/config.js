import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT || "";
export const DATABASE = process.env.DATABASE || "";
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "";
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || "";
export const BUCKET_NAME = process.env.BUCKET_NAME || "";
export const BUCKET_REGION = process.env.BUCKET_REGION || "";
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const URL = process.env.URL || "";
export const RAZORPAY_ID = process.env.RAZORPAY_ID || "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
//# sourceMappingURL=config.js.map