import ClientLayout from "./client-layout";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>CronoAula - Gestión de Tiempo Docente</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
