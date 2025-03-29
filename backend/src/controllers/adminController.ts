import { Request, Response } from "express";
import Admin from "../models/Admin";

interface EmailRequest extends Request {
  body: {
    email: string;
  };
}

export const checkEmailExists = async (
  req: EmailRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (admin) {
      res.status(200).json({
        success: true,
        email: admin.email,
      });
      return;
    }

    res.status(200).json({
      success: false,
      message: "Email not found",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
