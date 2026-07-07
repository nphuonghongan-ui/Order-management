import express from "express";

const router = express.Router();

router.post("/login", signIn);

export default router;