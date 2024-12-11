import express from "express";
import { createOrganisation, createUser, fetchData, getOrganisations, joinOrganisation, loginWithEmail, searchOrganisation } from "../controllers/auth";
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

userRouter.post(
  "/createOrganisation/:id",
  upload.single("profilepic"),
  async (req, res) => {
    try {
      await createOrganisation(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  }
);

userRouter.get(
  "/getOrganisations",
  async (req, res) => {
    try {
      await getOrganisations(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  }
);

userRouter.get(
  "/searchOrganisation",
  async (req, res) => {
    try {
      await searchOrganisation(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  }
);

userRouter.post(
  "/joinOrganisation/:id/:orgId",
  async (req, res) => {
    try {
      await joinOrganisation(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  }
);


export default userRouter;
