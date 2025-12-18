# Sistema de Asignación de Horarios

Una aplicación web profesional para gestionar horarios de empleados con funcionalidades CRUD completas y persistencia avanzada.

## Características

- ✅ Crear nuevos horarios de empleados
- 📝 Leer y visualizar todos los horarios
- ✏️ Actualizar horarios existentes
- 🗑️ Eliminar horarios
- 🕐 Formato de 12 horas (AM/PM) con conversión automática
- 📅 Ordenamiento por fecha y hora de entrada
- 💾 Persistencia de datos en IndexedDB (sin pérdida de datos)
- Filtrado por fecha para vistas diarias
- 📱 Vista agrupada por fecha con secciones expandibles (desktop y móvil)
- 📊 Indicador del día filtrado con contador de horarios
- 🎨 Diseño profesional con gradientes y sombras
- 🔄 Interfaz moderna y responsiva
- ⚡ Validación completa de formularios
- 📊 Cálculo automático de duración de turnos

## Tecnologías

- React 18 con TypeScript
- Vite (build tool rápido)
- Tailwind CSS (estilos modernos)
- Lucide React (iconos profesionales)
- IndexedDB (base de datos del navegador)

## Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. Abre http://localhost:5174 en tu navegador

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta ESLint

## Uso

1. **Agregar Horario**: Haz clic en "Agregar Horario" para crear un nuevo horario
2. **Completar Formulario**: Ingresa nombre, fecha, hora de entrada y salida (con conversión automática a 12h)
3. **Visualizar**: La aplicación se abre filtrada por la fecha actual mostrando "Horarios del [fecha actual]"
4. **Vista Agrupada**: En "Ver Todos", los horarios se agrupan por fecha con secciones expandibles
5. **Filtrar por Fecha**: Selecciona una fecha específica para ver solo los horarios de ese día con indicador del día
6. **Editar/Eliminar**: Usa los iconos de editar y eliminar para modificar o borrar horarios

Los datos se guardan automáticamente en IndexedDB y persisten entre sesiones sin pérdida de información.
