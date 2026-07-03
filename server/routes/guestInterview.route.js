import express from "express";
import { generateGuestQuestion, submitGuestAnswer, finishGuestInterview } from "../controllers/guestInterview.controller.js";

const guestInterviewRouter = express.Router();

guestInterviewRouter.post("/generate-questions", generateGuestQuestion);
guestInterviewRouter.post("/submit-answer", submitGuestAnswer);
guestInterviewRouter.post("/finish", finishGuestInterview);

export default guestInterviewRouter;

