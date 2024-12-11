import dotenv from "dotenv";

dotenv.config();

export const PORT: string | number = process.env.PORT || "";
export const DATABASE: string = process.env.DATABASE || "";
export const AWS_ACCESS_KEY: string = process.env.AWS_ACCESS_KEY || "";
export const AWS_SECRET_KEY: string = process.env.AWS_SECRET_KEY || "";
export const BUCKET_NAME: string = process.env.BUCKET_NAME || "";
export const BUCKET_REGION: string = process.env.BUCKET_REGION || "";
export const JWT_SECRET: string = process.env.JWT_SECRET || "";
export const URL: string = process.env.URL || "";
