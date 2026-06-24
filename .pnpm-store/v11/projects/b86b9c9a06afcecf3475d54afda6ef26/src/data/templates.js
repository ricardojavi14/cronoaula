export const MOMENT_TEMPLATES = {
  Comunicación: [
    {
      type: "Actividad permanente",
      name: "Actividades permanentes",
      submoments: [
        {
          name: "Saludo y asistencia",
          duration: 5,
          description: "Recibir a los estudiantes y registrar asistencia.",
          teacher_note: "",
        },
        {
          name: "Acuerdos de convivencia",
          duration: 5,
          description: "Recordar las normas del aula.",
          teacher_note: "",
        },
      ],
    },
    {
      type: "Inicio",
      name: "Inicio",
      submoments: [
        {
          name: "Motivación",
          duration: 10,
          description: "Activar el interés.",
          teacher_note: "",
        },
        {
          name: "Saberes previos",
          duration: 5,
          description: "Recoger conocimientos anteriores.",
          teacher_note: "",
        },
        {
          name: "Propósito y organización",
          duration: 5,
          description: "Explicar qué se aprenderá.",
          teacher_note: "",
        },
      ],
    },
    {
      type: "Desarrollo",
      name: "Desarrollo",
      submoments: [
        {
          name: "Antes de la lectura",
          duration: 15,
          description: "Hipótesis sobre el texto.",
          teacher_note: "",
        },
        {
          name: "Durante la lectura",
          duration: 20,
          description: "Lectura individual y grupal.",
          teacher_note: "",
        },
        {
          name: "Después de la lectura",
          duration: 20,
          description: "Comprensión y análisis.",
          teacher_note: "",
        },
      ],
    },
    {
      type: "Cierre",
      name: "Cierre",
      submoments: [
        {
          name: "Metacognición",
          duration: 10,
          description: "¿Qué aprendimos hoy?",
          teacher_note: "",
        },
        {
          name: "Retroalimentación",
          duration: 10,
          description: "Reforzar aprendizajes.",
          teacher_note: "",
        },
      ],
    },
  ],
  Matemática: [
    {
      type: "Actividad permanente",
      name: "Actividades permanentes",
      submoments: [
        { name: "Saludo", duration: 5, description: "", teacher_note: "" },
      ],
    },
    {
      type: "Inicio",
      name: "Inicio",
      submoments: [
        {
          name: "Problematización",
          duration: 15,
          description: "Presentar el reto matemático.",
          teacher_note: "",
        },
      ],
    },
    {
      type: "Desarrollo",
      name: "Desarrollo",
      submoments: [
        {
          name: "Búsqueda de estrategias",
          duration: 20,
          description: "Los alumnos proponen cómo resolver.",
          teacher_note: "",
        },
        {
          name: "Representación",
          duration: 20,
          description: "Vivencial, concreto, pictórico, gráfico.",
          teacher_note: "",
        },
        {
          name: "Formalización",
          duration: 15,
          description: "Conceptualizar el aprendizaje.",
          teacher_note: "",
        },
      ],
    },
    {
      type: "Cierre",
      name: "Cierre",
      submoments: [
        { name: "Reflexión", duration: 10, description: "", teacher_note: "" },
      ],
    },
  ],
  // Add more as needed...
};

export const BASE_MOMENTS = [
  "Actividad permanente",
  "Inicio",
  "Desarrollo",
  "Pausa activa",
  "Cierre",
  "Metacognición",
  "Retroalimentación",
  "Transferencia",
];

export const ACTIVE_PAUSES_LIBRARY = [
  {
    name: "La momia despierta",
    category: "Movimiento",
    description: "Estiramientos lentos.",
  },
  {
    name: "El monstruo congelado",
    category: "Atención",
    description: "Moverse y parar.",
  },
  {
    name: "La respiración del dragón",
    category: "Respiración",
    description: "Exhalación fuerte.",
  },
  {
    name: "El chupacabras silencioso",
    category: "Silencio",
    description: "Caminar sin ruido.",
  },
  {
    name: "La estatua encantada",
    category: "Relajación",
    description: "Tensión y relajación.",
  },
];
