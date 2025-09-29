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
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT),
      secure: Number(process.env.NODEMAILER_PORT) === 465, // secure if using 465
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions: SendMailOptions = {
      from: `"Developer Khemsang" <${process.env.NODEMAILER_EMAIL}>`,
      to: receive,
      subject,
      html: body,
    };
    //  console.log("Verification email sent. Message ID:", info.messageId);

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
