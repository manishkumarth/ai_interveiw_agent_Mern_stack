import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import GuestUsage from "../models/guestUsage.model.js";

const getClientIp = (req) => {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim().length) {
    // can be a list: "client, proxy1, proxy2"
    return xf.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

const FREE_GUEST_INTERVIEWS = 2;
const LOGGED_IN_INTERVIEW_COST = 25;

const ensureGuestUsage = async (ip) => {
  const doc = await GuestUsage.findOneAndUpdate(
    { ip },
    { $setOnInsert: { ip }, $inc: { count: 0 } },
    { upsert: true, new: true }
  );
  return doc;
};

export const generateGuestQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." });
    }

    const guestIp = getClientIp(req);
    const usage = await ensureGuestUsage(guestIp);

    if ((usage.count ?? 0) >= FREE_GUEST_INTERVIEWS) {
      return res.status(403).json({
        message: "Guest limit reached. Please upgrade to continue.",
        blocked: true,
      });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `\n    Role:${role}\n    Experience:${experience}\n    InterviewMode:${mode}\n    Projects:${projectText}\n    Skills:${skillsText},\n    Resume:${safeResume}\n    `;

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`,
      },
      { role: "user", content: userPrompt },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    // consume 1 guest interview
    await GuestUsage.findOneAndUpdate({ ip: guestIp }, { $inc: { count: 1 } }, { upsert: true });

    const interview = await Interview.create({
      userId: undefined,
      isGuest: true,
      guestIp,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: null,
      userName: "Guest",
      questions: interview.questions,
      isGuest: true,
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to create guest interview ${error}` });
  }
};

export const submitGuestAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // enforce guest only updates for guest interviews
    if (!interview.isGuest) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const guestIp = getClientIp(req);
    if (interview.guestIp && interview.guestIp !== guestIp) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const question = interview.questions[questionIndex];

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      { role: "user", content: `Question: ${question.question}\nAnswer: ${answer}\n` },
    ];

    const aiResponse = await askAi(messages);
    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await interview.save();
    return res.status(200).json({ feedback: parsed.feedback });
  } catch (error) {
    return res.status(500).json({ message: `failed to submit guest answer ${error}` });
  }
};

export const finishGuestInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" });
    }

    if (!interview.isGuest) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const guestIp = getClientIp(req);
    if (interview.guestIp && interview.guestIp !== guestIp) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
      isGuest: true,
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Guest Interview ${error}` });
  }
};

