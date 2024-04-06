import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";

dotenv.config();
const APPLICATION_PORT = process.env.APPLICATION_PORT ?? 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json({ extended: true }));

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/send-email", (req, res) => {
  const { to, subject, text, secretKey } = req.body;

  if (!secretKey || secretKey.toString() !== process.env.SECRET_KEY) {
    return res.status(401).json({ message: "Invalid secret key" });
  }

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Email data
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to.toString(),
    subject: subject.toString(),
    text: text.toString(),
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(400).json({ message: "Failed to send e-mail.", error });
    } else {
      console.log("Email sent:", info.response);
      return res
        .status(200)
        .json({ message: "E-mail sent successfully!.", info });
    }
  });
});

app.listen(APPLICATION_PORT, () => {
  console.log(`App started on port ${APPLICATION_PORT}.`);
});
