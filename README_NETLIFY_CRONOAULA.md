# CronoAula - versión preparada para Netlify

Esta carpeta contiene una versión inicial preparada para funcionar como web estática/PWA básica en Netlify.

## Cambios aplicados

1. Se agregó configuración de Netlify:
   - `netlify.toml` en la raíz.
   - `apps/web/netlify.toml`.
2. Se agregó script de build en `apps/web/package.json`:
   - `npm run build` -> `react-router build`.
3. Se desactivó SSR en `apps/web/react-router.config.ts` para facilitar despliegue estático.
4. Se eliminó la dependencia práctica de base de datos para el flujo principal:
   - Las sesiones se guardan en `localStorage`.
   - Mis sesiones carga desde `localStorage`.
   - Modo clase carga desde `localStorage`.
   - Observaciones se guardan localmente.
5. Se agregó un parser local de texto:
   - `src/utils/sessionParser.js`.
   - Ya no depende de Gemini/IA para importar texto básico.
   - Reconoce encabezados como TITULO, AREA, GRADO, DURACION TOTAL, MOMENTO, NOMBRE, DURACION, ACTIVIDADES.
6. Se agregó almacenamiento local:
   - `src/utils/localStore.js`.
7. Se agregó carga de imagen de fondo por momento en la pantalla de crear/editar sesión.
8. En modo clase, si el momento tiene imagen de fondo, se muestra con una capa clara para no tapar la lectura.

## Cómo subir a Netlify

Opción recomendada:

1. Sube el proyecto a GitHub.
2. En Netlify, elige “Add new site” > “Import an existing project”.
3. Conecta el repositorio.
4. Usa esta configuración:
   - Base directory: `apps/web`
   - Build command: `npm install && npm run build`
   - Publish directory: `build/client`
5. Si Netlify detecta el `netlify.toml`, debería completar parte de esto automáticamente.

## Advertencia importante

Esta versión guarda datos en el navegador del usuario. Eso es bueno para empezar porque no requiere base de datos ni login, pero significa que:

- Si cambias de navegador o dispositivo, no verás las mismas sesiones.
- Si borras datos del navegador, podrías perder sesiones.

Más adelante se puede agregar Supabase, Firebase o Neon para guardar en la nube.

## Próximos pasos recomendados

1. Probar importación con texto mínimo.
2. Probar guardar una sesión.
3. Ver si aparece en “Mis sesiones”.
4. Abrirla en “Modo clase”.
5. Probar imagen de fondo por momento.
6. Recién después mejorar diseño, PWA, exportación y nube.
