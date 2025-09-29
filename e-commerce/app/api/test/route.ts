import connectDB from "../../../lib/databaseConnection";

export async function GET(req) {
  try {
    await connectDB();
    return new Response(
      JSON.stringify({ message: "Database connected successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Database connection failed",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
