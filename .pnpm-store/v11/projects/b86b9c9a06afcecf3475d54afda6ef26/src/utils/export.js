export const exportToText = (session) => {
  let text = `SESIÓN DE APRENDIZAJE: ${session.title}\n`;
  text += `==========================================\n`;
  text += `Área: ${session.area} | Grado: ${session.grade}\n`;
  text += `Propósito: ${session.purpose}\n`;
  text += `Materiales: ${session.materials}\n\n`;
  text += `AGENDA PEDAGÓGICA\n`;
  text += `------------------------------------------\n`;

  session.moments?.forEach((moment, mIdx) => {
    text += `${mIdx + 1}. ${moment.name.toUpperCase()}\n`;
    moment.submoments?.forEach((sm) => {
      text += `   - [${sm.duration} min] ${sm.name}: ${sm.description}\n`;
      if (sm.teacher_note) text += `     Nota: ${sm.teacher_note}\n`;
    });
    text += `\n`;
  });

  if (session.observations?.length > 0) {
    text += `OBSERVACIONES REGISTRADAS\n`;
    text += `------------------------------------------\n`;
    session.observations.forEach((obs) => {
      text += `- ${new Date(obs.timestamp).toLocaleTimeString()}: ${obs.text}\n`;
    });
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CronoAula_${session.title.replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
