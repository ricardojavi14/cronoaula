import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const sessions = await sql`SELECT * FROM sessions WHERE id = ${id}`;
    if (sessions.length === 0)
      return Response.json({ error: "Session not found" }, { status: 404 });

    const session = sessions[0];

    const moments = await sql`
      SELECT * FROM moments 
      WHERE session_id = ${id} 
      ORDER BY order_index ASC
    `;

    for (let moment of moments) {
      const submoments = await sql`
        SELECT * FROM submoments 
        WHERE moment_id = ${moment.id} 
        ORDER BY order_index ASC
      `;
      moment.submoments = submoments;
    }

    session.moments = moments;

    const observations = await sql`
      SELECT * FROM observations 
      WHERE session_id = ${id} 
      ORDER BY timestamp DESC
    `;
    session.observations = observations;

    return Response.json(session);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch full session" },
      { status: 500 },
    );
  }
}
