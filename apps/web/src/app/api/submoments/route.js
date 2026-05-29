import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      moment_id,
      name,
      duration,
      description,
      teacher_note,
      order_index,
    } = body;

    const [submoment] = await sql`
      INSERT INTO submoments (moment_id, name, duration, description, teacher_note, order_index)
      VALUES (${moment_id}, ${name}, ${duration}, ${description}, ${teacher_note}, ${order_index})
      RETURNING *
    `;

    return Response.json(submoment);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create submoment" },
      { status: 500 },
    );
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

    const [submoment] = await sql(
      `UPDATE submoments SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    return Response.json(submoment);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update submoment" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await sql`DELETE FROM submoments WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete submoment" },
      { status: 500 },
    );
  }
}
