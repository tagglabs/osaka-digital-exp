import { Router, Request, Response, NextFunction } from "express";
import { checkEmailExists } from "../controllers/adminController";

const router = Router();

const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body || typeof req.body.email !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid request body - email is required",
    });
    return;
  }
  next();
};

router.post("/auth", validateEmail, checkEmailExists);

export default router;
