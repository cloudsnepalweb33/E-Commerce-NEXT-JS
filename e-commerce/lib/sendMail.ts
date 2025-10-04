import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

interface SendMailResponse {
  success: boolean;
  message?: string;
}

export const sendMail = async (
  subject: string,
  receive: string,
  body: string
): Promise<SendMailResponse> => {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465, // SSL पोर्ट 465 भए secure
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions: SendMailOptions = {
      from: `"Developer Khemsang" <${process.env.FROM_EMAIL}>`,
      to: receive,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent. Message ID:", info.messageId);

    return { success: true };
  } catch (error) {
    console.error("❌ Mail error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
