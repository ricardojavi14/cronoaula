import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, type, name, order_index } = body;

    const [moment] = await sql`
      INSERT INTO moments (session_id, type, name, order_index)
      VALUES (${session_id}, ${type}, ${name}, ${order_index})
      RETURNING *
    `;

    return Response.json(moment);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create moment" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    const keys = Object.keys(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
    const values = keys.map((key) => updates[key]);

    const [moment] = await sql(
      `UPDATE moments SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    return Response.json(moment);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update moment" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await sql`DELETE FROM moments WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete moment" }, { status: 500 });
  }
}
