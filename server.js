import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend if needed
app.use(express.static(path.join(__dirname, "public")));

// POST route
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

    if (!name || !email || !message)
        return res.status(400).json({ error: "All fields are required" });

    try {
        // 1️⃣ Transporter using your Gmail app password
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // your Gmail
                pass: process.env.EMAIL_PASS, // app password
            },
        });

        const formatFeatures = (features) =>
            features && features.length
                ? `<li>${features.join("</li><li>")}</li>`
                : "<li>N/A</li>";

        // 2️⃣ Email to Developer (yourself)
        const devMailOptions = {
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New message from ${name}`,
            html: `
      <html>
      <head>
        <style>
          body { font-family:'HelveticaNowBold', Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
          .container { max-width:600px; margin:40px auto; background:#fff; border-radius:1px; padding:20px; box-shadow:0 0 15px rgba(0,0,0,0.05); }
          h2 { color:#1a1a1a; border-bottom:2px solid #1a1a1a; padding-bottom:5px; }
          p, li { color:#555; line-height:1.6; }
          ul { padding-left:20px; }
          .footer { margin-top:20px; color:#888; font-size:12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Client Arrived, Hurry Up!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>Project Subject:</strong> ${subject}</p>
          <p><strong>Website Type:</strong> ${websiteType}</p>
          <p><strong>Selected Features:</strong></p>
          <ul>${formatFeatures(features)}</ul>
          <p><strong>Timeline:</strong> ${timeline}</p>
          <p><strong>Budget:</strong> ${budget || "N/A"}</p>
          <p><strong>Additional Notes:</strong> ${message || "N/A"}</p>
          <p class="footer">— Studio Notification</p>
          <p class="footer">Nagaruthwik©</p>
        </div>
      </body>
      </html>
    `,
        };

        // 3️⃣ Email to Client
        const clientMailOptions = {
            from: `"Naga Ruthwik" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Thanks for contacting me!",
            html: `
      <html>
      <head>
        <style>
          body { font-family:'HelveticaNowBold', Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
          .container { max-width:600px; margin:40px auto; background:#fff; border-radius:1px; padding:30px; box-shadow:0 5px 25px rgba(0,0,0,0.1); }
          h2 { color:#1a1a1a; margin-bottom:10px; }
          h3 { color:#333; margin-top:20px; }
          p, li { color:#555; line-height:1.6; }
          ul { padding-left:20px; }
          a.button { display:inline-block; padding:12px 25px; background-color:#1a1a1a; color:#fff; text-decoration:none; border-radius:6px; margin-top:20px; font-weight:bold; }
          .footer { margin-top:30px; color:#999; font-size:12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hello ${name},</h2>
          <p>Thank you for reaching out to my studio! We've successfully received your project details.</p>
          <h3>Your Project Summary:</h3>
          <ul>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Website Type:</strong> ${websiteType}</li>
            <li><strong>Selected Features:</strong> ${features.join(", ") || "N/A"}</li>
            <li><strong>Timeline:</strong> ${timeline}</li>
            ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ""}
            ${message ? `<li><strong>Additional Notes:</strong> ${message}</li>` : ""}
          </ul>
          <p>I will review your specifications carefully and contact you within 1–2 business days.</p>
          <a href="https://nagaruthwik.vercel.app/" class="button">Visit My Website</a>
          <p class="footer">— Professional Studio Team</p>
          <p class="footer">Nagaruthwik©</p>
        </div>
      </body>
      </html>
    `,
        };

        // Send both emails
        await transporter.sendMail(devMailOptions);
        await transporter.sendMail(clientMailOptions);

        res.status(200).json({ success: true, message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: "Failed to send emails", details: error.message });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
