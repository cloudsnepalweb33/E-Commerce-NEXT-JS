import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import { response, catchError } from "@/lib/helpherfunction";

export async function POST(request: Request) {
  try {
    await connectDB();

    // Parse body
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return response(false, 400, "Invalid request body");
    }

    console.log("📩 Body received:", body);

    const rawEmail = body?.email;
    const email = rawEmail ? rawEmail.trim().toLowerCase() : null;
    const password = body?.password?.trim();

    if (!email) return response(false, 400, "Email required");
    if (!password) return response(false, 400, "Password required");

    // Find user
    const user = await UserModel.findOne({ email });
    console.log("👤 User found in DB:", user ? user.email : null);

    if (!user) return response(false, 404, "यो ईमेल हाम्रो system मा छैन");

    // Debug old password hash
    console.log("🔑 Old hashed password:", user.password);

    // Update password
    user.password = password;
    await user.save();

    console.log("✅ Password updated successfully for:", user.email);

    return response(true, 200, "Password reset successfully!");
  } catch (err) {
    console.error("🔥 Set new password API error:", err);
    return catchError(err, "Reset Password request failed");
  }
}
