import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get("teacher_id");
    const id = searchParams.get("id");

    if (id) {
      const sessions = await sql`SELECT * FROM sessions WHERE id = ${id}`;
      return Response.json(sessions[0] || null);
    }

    if (teacher_id) {
      const sessions =
        await sql`SELECT * FROM sessions WHERE teacher_id = ${teacher_id} ORDER BY last_modified DESC`;
      return Response.json(sessions);
    }

    const sessions =
      await sql`SELECT * FROM sessions ORDER BY last_modified DESC`;
    return Response.json(sessions);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      teacher_id,
      title,
      area,
      grade,
      date,
      start_time,
      end_time,
      total_duration,
      purpose,
      evidence,
      materials,
      notes,
      moments,
    } = body;

    const [session] = await sql`
      INSERT INTO sessions (
        teacher_id, title, area, grade, date, start_time, end_time, 
        total_duration, purpose, evidence, materials, notes
      )
      VALUES (
        ${teacher_id}, ${title}, ${area}, ${grade}, ${date}, ${start_time}, ${end_time}, 
        ${total_duration}, ${purpose}, ${evidence}, ${materials}, ${notes}
      )
      RETURNING *
    `;

    // If moments are provided, seed them
    if (moments && Array.isArray(moments)) {
      for (let i = 0; i < moments.length; i++) {
        const m = moments[i];
        const [moment] = await sql`
          INSERT INTO moments (session_id, type, name, order_index)
          VALUES (${session.id}, ${m.type}, ${m.name}, ${i})
          RETURNING *
        `;

        if (m.submoments && Array.isArray(m.submoments)) {
          for (let j = 0; j < m.submoments.length; j++) {
            const sm = m.submoments[j];
            await sql`
              INSERT INTO submoments (moment_id, name, duration, description, teacher_note, order_index)
              VALUES (${moment.id}, ${sm.name}, ${sm.duration}, ${sm.description}, ${sm.teacher_note}, ${j})
            `;
          }
        }
      }
    }

    return Response.json(session);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create session" },
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
    if (keys.length === 0)
      return Response.json({ error: "No updates provided" }, { status: 400 });

    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
    const values = keys.map((key) => updates[key]);

    const [session] = await sql(
      `UPDATE sessions SET ${setClause}, last_modified = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    return Response.json(session);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update session" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    await sql`DELETE FROM sessions WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
