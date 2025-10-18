import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

  const formatFeatures = (features) =>
    features && features.length
      ? `<li>${features.join("</li><li>")}</li>`
      : "<li>N/A</li>";

  try {
    // 1️⃣ Email to Developer (you)
    await resend.emails.send({
      from: process.env.EMAIL_USER, // your verified Gmail in Resend
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <html>
        <head>
          <style>
            body { font-family:'Helvetica Now', Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
            .container { max-width:600px; margin:40px auto; background:#fff; border-radius:4px; padding:20px; box-shadow:0 0 15px rgba(0,0,0,0.05); }
            h2 { color:#1a1a1a; border-bottom:2px solid #1a1a1a; padding-bottom:5px; }
            p, li { color:#555; line-height:1.6; }
            ul { padding-left:20px; }
            .footer { margin-top:20px; color:#888; font-size:12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Client Arrived!</h2>
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
          </div>
        </body>
        </html>
      `,
    });

    // 2️⃣ Email to Client
    await resend.emails.send({
      from: process.env.EMAIL_USER, // same verified Gmail
      to: email,
      subject: "Thanks for contacting me!",
      html: `
        <html>
        <head>
          <style>
            body { font-family:'Helvetica Now', Arial, sans-serif; background:#f5f5f5; margin:0; padding:0; }
            .container { max-width:600px; margin:40px auto; background:#fff; border-radius:4px; padding:30px; box-shadow:0 5px 25px rgba(0,0,0,0.1); }
            h2 { color:#1a1a1a; margin-bottom:10px; }
            p, li { color:#555; line-height:1.6; }
            ul { padding-left:20px; }
            a.button { display:inline-block; padding:12px 25px; background-color:#1a1a1a; color:#fff; text-decoration:none; border-radius:6px; margin-top:20px; font-weight:bold; }
            .footer { margin-top:30px; color:#999; font-size:12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hello ${name},</h2>
            <p>Thanks for reaching out! We've successfully received your project details.</p>
            <h3>Project Summary:</h3>
            <ul>
              <li><strong>Subject:</strong> ${subject}</li>
              <li><strong>Website Type:</strong> ${websiteType}</li>
              <li><strong>Selected Features:</strong> ${features.join(", ") || "N/A"}</li>
              <li><strong>Timeline:</strong> ${timeline}</li>
              ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ""}
              ${message ? `<li><strong>Additional Notes:</strong> ${message}</li>` : ""}
            </ul>
            <p>I will review your specifications and contact you in 1–2 business days.</p>
            <a href="https://nagaruthwik.vercel.app/" class="button">Visit My Website</a>
            <p class="footer">— Professional Studio Team</p>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({ success: true, message: `Emails sent successfully via Resend!  ${name}` });
  } catch (error) {
    console.error("Resend Email error:", error);
    res.status(500).json({ error: "Failed to send emails", details: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
