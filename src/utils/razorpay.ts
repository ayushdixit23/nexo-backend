import Razorpay from "razorpay";
import { RAZORPAY_ID, RAZORPAY_KEY_SECRET } from "./config";

export const razorpay = new Razorpay({
  key_id: RAZORPAY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
