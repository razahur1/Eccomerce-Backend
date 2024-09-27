import nodemailer from "nodemailer";
//import emailValidator from "deep-email-validator";

// export const isEmailValid = (email) => {
//   return emailValidator.validate(email);
// };

export const sendMail = async (to, subject, html) => {
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
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with otp: "${otp}"`);
  } catch (error) {
    // Handle and log specific errors
    console.error("Error sending email: ", error.message || error);
  }
};
