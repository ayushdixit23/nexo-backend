import express from "express";
import {
  createUser,
  fetchData,
  loginWithEmail,
  updateProfile,
} from "../controllers/auth";
import upload from "../middleware/multer";
import { verifyTokenMiddleware } from "../middleware/token";
const userRouter = express.Router();

userRouter.post("/register", upload.single("profilepic"), async (req, res) => {
  await createUser(req, res); // Make sure the controller doesn't return a response, just handles it
});

userRouter.post("/signin", async (req, res) => {
  await loginWithEmail(req, res); // Make sure the controller doesn't return a response, just handles it
});

userRouter.get(
  "/auth/verifytoken",
  async (req, res, next) => {
    try {
      verifyTokenMiddleware(req, res, next); // Call the controller to handle the response
    } catch (error) {
      console.log(error); // Pass any error to the global error handler
    }
  },
  async (req, res) => {
    try {
      await fetchData(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  }
);

userRouter.post("/updateProfile/:id",upload.single("profilepic"), async (req, res) => {
  await updateProfile(req, res); // Make sure the controller doesn't return a response, just handles it
});

export default userRouter;
