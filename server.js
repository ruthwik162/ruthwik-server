const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/contact", async (req, res) => {
  const {
    name,
    email,
    mobile,
    subject,
    websiteType,
    features,
    timeline,
    budget,
    message,
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All required fields must be filled." });
  }

  // 🕒 Timestamp (IST)
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 🧩 Email HTML generator (Resend-style)
  const createEmailTemplate = (isAdmin) => {
    const formatFeatures = (features) =>
      features && features.length
        ? `<li>${features.join("</li><li>")}</li>`
        : "<li>N/A</li>";

    return `
      <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Now', Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #fff;
            border-radius: 2px;
            padding: 30px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
          }
          h2, h3 { color: #1a1a1a; }
          p, li { color: #555; line-height: 1.6; }
          ul { padding-left: 20px; }
          .footer { margin-top: 30px; color: #999; font-size: 12px; }
          a.button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #1a1a1a;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${
            isAdmin
              ? `
              <h2>New Client Inquiry Received</h2>
              <p><strong>Timestamp:</strong> ${timestamp}</p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mobile:</strong> ${mobile || "N/A"}</p>
              <p><strong>Subject:</strong> ${subject || "N/A"}</p>
              <p><strong>Website Type:</strong> ${websiteType || "N/A"}</p>
              <p><strong>Selected Features:</strong></p>
              <ul>${formatFeatures(features)}</ul>
              <p><strong>Timeline:</strong> ${timeline || "N/A"}</p>
              <p><strong>Budget:</strong> ${budget || "N/A"}</p>
              <p><strong>Message:</strong> ${message || "No message provided."}</p>
              <p class="footer">— Portfolio Inquiry Notification</p>
            `
              : `
              <h1>Hello ${name},</h1>
              <p>Thanks for reaching out! I’ve received your project details on </br> <b>${timestamp}</b>.</p>
              <h3>Project Summary:</h3>
              <ul>
                <li><strong>Subject:</strong> ${subject || "N/A"}</li>
                <li><strong>Website Type:</strong> ${websiteType || "N/A"}</li>
                <li><strong>Selected Features:</strong> ${
                  features && features.length ? features.join(", ") : "N/A"
                }</li>
                <li><strong>Timeline:</strong> ${timeline || "N/A"}</li>
                ${
                  budget
                    ? `<li><strong>Budget:</strong> ${budget}</li>`
                    : ""
                }
                ${
                  message
                    ? `<li><strong>Message:</strong> ${message}</li>`
                    : ""
                }
              </ul>
              <p>I will review your details and get back to you soon.</p>
              <a href="https://nagaruthwik.vercel.app/" class="button">Visit My Website</a>
              <p class="footer">— Nagaruthwik©</p>
            `
          }
        </div>
      </body>
      </html>
    `;
  };

  // ✉️ Admin Mail
  const adminMailOptions = {
    from: `"Nagaruthwik©" <${process.env.EMAIL_USER}>`,
    to: ["nagaruthwikmerugu162@gmail.com"],
    subject: `Hurry Up!! We got new client Inquiry from ${name}`,
    html: createEmailTemplate(true),
  };

  // ✉️ Client Mail
  const userMailOptions = {
    from: `"Nagaruthwik©" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for contacting me, ${name}!`,
    html: createEmailTemplate(false),
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return res.status(200).json({
      success: true,
      message: "Client inquiry sent successfully!",
      timestamp,
    });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({
      error: "Failed to send email. Please try again later.",
      details: err.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
