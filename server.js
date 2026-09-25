const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 10000;

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ===============================
// Check environment variables
// ===============================

console.log("GMAIL_USER:", process.env.GMAIL_USER ? "Loaded" : "Missing");

console.log(
  "GMAIL_APP_PASSWORD:",
  process.env.GMAIL_APP_PASSWORD ? "Loaded" : "Missing"
);

// ===============================
// Gmail Transporter
// ===============================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ===============================
// Test Gmail connection
// ===============================

transporter.verify((error, success) => {
  if (error) {
    console.error("Gmail connection error:");
    console.error(error);
  } else {
    console.log("Gmail SMTP connection successful");
  }
});

// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio backend is running",
  });
});

// ===============================
// Contact API
// ===============================

app.post("/api/contact", async (req, res) => {
  try {
    console.log("Contact request received");

    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    console.log("Form data received:", {
      name,
      email,
      subject,
    });

    // Validate fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Email configuration
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,

      to: process.env.GMAIL_USER,

      replyTo: email,

      subject: `Portfolio Contact: ${subject}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
        ">

          <div style="
            background: #0d6efd;
            color: white;
            padding: 25px;
          ">

            <h2 style="margin: 0;">
              New Portfolio Contact
            </h2>

            <p style="margin-bottom: 0;">
              Someone contacted you through your portfolio.
            </p>

          </div>

          <div style="padding: 25px;">

            <p>
              <strong>Name:</strong>
              ${name}
            </p>

            <p>
              <strong>Email:</strong>
              ${email}
            </p>

            <p>
              <strong>Subject:</strong>
              ${subject}
            </p>

            <hr>

            <h3>Message</h3>

            <p style="
              line-height: 1.7;
              white-space: pre-line;
            ">
              ${message}
            </p>

          </div>

        </div>
      `,
    };

    console.log("Sending email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });

  } catch (error) {

    console.error("=================================");
    console.error("EMAIL ERROR");
    console.error("=================================");

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send email.",
      error: error.message,
    });
  }
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});