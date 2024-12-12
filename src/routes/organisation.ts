import express from "express";
import upload from "../middleware/multer";
import {
    addStorage,
  createOrganisation,
  createTeam,
  fetchMembersAndTeams,
  fetchStorage,
  generatePresignedUrl,
  getOrganisations,
  joinOrganisation,
  searchOrganisation,
} from "../controllers/organisation";

const organisationRouter = express.Router();

organisationRouter.post(
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

organisationRouter.get("/getOrganisations", async (req, res) => {
  try {
    await getOrganisations(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.get("/searchOrganisation", async (req, res) => {
  try {
    await searchOrganisation(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.post("/joinOrganisation/:id/:orgId", async (req, res) => {
  try {
    await joinOrganisation(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.post("/createTeam/:id/:orgId", async (req, res) => {
  try {
    await createTeam(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.get("/fetchMembersAndTeams/:orgId", async (req, res) => {
  try {
    await fetchMembersAndTeams(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.post("/generatePresignedUrl", async (req, res) => {
  try {
    await generatePresignedUrl(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

organisationRouter.post("/addStorage/:id/:orgId", async (req, res) => {
  try {
    await addStorage(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});


organisationRouter.get("/fetchStorage/:orgId", async (req, res) => {
    try {
      await fetchStorage(req, res); // Call the controller to handle the response
    } catch (error) {
      console.log(error);
    }
  });
export default organisationRouter;
