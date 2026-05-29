import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const teachers = await sql`SELECT * FROM teachers WHERE id = ${id}`;
      return Response.json(teachers[0] || null);
    }

    const teachers =
      await sql`SELECT * FROM teachers ORDER BY created_at DESC LIMIT 1`;
    return Response.json(teachers[0] || null);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch teacher" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      level,
      grade,
      area_principal,
      student_count,
      classroom_type,
      habitual_duration,
      preferences,
    } = body;

    const [teacher] = await sql`
      INSERT INTO teachers (name, level, grade, area_principal, student_count, classroom_type, habitual_duration, preferences)
      VALUES (${name}, ${level}, ${grade}, ${area_principal}, ${student_count}, ${classroom_type}, ${habitual_duration}, ${JSON.stringify(preferences || {})})
      RETURNING *
    `;

    return Response.json(teacher);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create teacher" },
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
    const values = keys.map((key) =>
      key === "preferences" ? JSON.stringify(updates[key]) : updates[key],
    );

    const [teacher] = await sql(
      `UPDATE teachers SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values],
    );

    return Response.json(teacher);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update teacher" },
      { status: 500 },
    );
  }
}
