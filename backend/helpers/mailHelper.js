import nodemailer from "nodemailer";
import emailValidator from "deep-email-validator";

export const isEmailValid = (email) => {
  return emailValidator.validate(email);
};

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with otp "${text}"`);
  } catch (error) {
    // Handle and log specific errors
    console.error("Error sending email: ", error.message || error);
  }
};
