var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import upload from "../middleware/multer.js";
import { addStorage, createOrderRazoryPay, createOrganisation, createTeam, deleteStorage, deleteStorageIndividual, downLoadFileFromStorage, fetchMembersAndTeams, fetchStorage, fetchStorageIndividual, generatePresignedUrl, getOrganisations, joinOrganisation, searchOrganisation, verifyPayment, } from "../controllers/organisation.js";
const organisationRouter = express.Router();
organisationRouter.post("/createOrganisation/:id", upload.single("profilepic"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createOrganisation(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/getOrganisations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield getOrganisations(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/searchOrganisation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield searchOrganisation(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/joinOrganisation/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joinOrganisation(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/createTeam/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createTeam(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/fetchMembersAndTeams/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchMembersAndTeams(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/generatePresignedUrl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield generatePresignedUrl(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/addStorage/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield addStorage(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.delete("/deleteStorage/:userId/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deleteStorage(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.delete("/deleteStorage/:userId/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deleteStorageIndividual(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/generate-download-url/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield downLoadFileFromStorage(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/fetchStorage/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchStorage(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.get("/fetchStorageIndividual/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchStorageIndividual(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/create-order/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createOrderRazoryPay(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
organisationRouter.post("/verify-signature", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield verifyPayment(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
export default organisationRouter;
//# sourceMappingURL=organisation.js.map