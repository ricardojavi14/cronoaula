import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { session_id, text } = await request.json();
    if (!session_id || !text) {
      return Response.json(
        { error: "session_id and text are required" },
        { status: 400 },
      );
    }
    const [obs] = await sql`
      INSERT INTO observations (session_id, text)
      VALUES (${session_id}, ${text})
      RETURNING *
    `;
    return Response.json(obs);
  } catch (error) {
    console.error("observations POST error:", error);
    return Response.json(
      { error: "Failed to save observation" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get("session_id");
    if (!session_id) {
      return Response.json(
        { error: "session_id is required" },
        { status: 400 },
      );
    }
    const obs = await sql`
      SELECT * FROM observations
      WHERE session_id = ${session_id}
      ORDER BY timestamp ASC
    `;
    return Response.json(obs);
  } catch (error) {
    console.error("observations GET error:", error);
    return Response.json(
      { error: "Failed to fetch observations" },
      { status: 500 },
    );
  }
}
