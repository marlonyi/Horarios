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

## 📱 Instalación en Dispositivos Móviles (PWA)

Esta aplicación es una **Progressive Web App (PWA)** que se puede instalar en tu dispositivo móvil como una aplicación nativa.

### Cómo Instalar:

#### 📱 **Android / Chrome Mobile:**
1. Abre la aplicación en Chrome móvil
2. Toca el menú (tres puntos) ⋮
3. Selecciona "Agregar a pantalla de inicio" o "Instalar aplicación"
4. Confirma la instalación

#### 🍎 **iOS / Safari:**
1. Abre la aplicación en Safari
2. Toca el botón compartir (cuadrado con flecha hacia arriba)
3. Selecciona "Agregar a pantalla de inicio"
4. Toca "Agregar" en la esquina superior derecha

#### 🖥️ **Desktop / Chrome:**
1. Abre la aplicación en Chrome
2. Haz clic en el botón de instalar (⊕) en la barra de direcciones
3. O ve a Menú → Más herramientas → Crear acceso directo

### Características PWA:
- ✅ **Instalación sin App Store** - Se instala directamente desde el navegador
- 🔄 **Actualizaciones automáticas** - Se actualiza sola cuando hay nuevas versiones
- 📱 **Experiencia nativa** - Se comporta como una app móvil real
- ⚡ **Rápida y offline** - Funciona sin conexión a internet
- 🔔 **Notificaciones** - Puede enviar notificaciones (futuro)
- 🎨 **Icono en pantalla de inicio** - Aparece como cualquier otra app

### Requisitos:
- Navegador moderno con soporte PWA (Chrome, Safari, Edge, Firefox)
- Conexión a internet para la instalación inicial
- Espacio de almacenamiento disponible

### Solución de Problemas:
- Si no ves la opción de instalar, refresca la página
- Asegúrate de que el navegador esté actualizado
- En iOS, Safari es el único navegador que soporta instalación PWA

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

## 🚀 Deploy en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Conecta tu repositorio a Vercel:**

   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub/GitLab

2. **Configuración automática:**

   - Vercel detectará automáticamente que es un proyecto de Vite
   - El build command será: `npm run build`
   - El output directory será: `dist`

3. **Deploy:**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación automáticamente

### Opción 2: Deploy Manual con Vercel CLI

1. **Instala Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy desde terminal:**

   ```bash
   vercel
   ```

3. **Sigue las instrucciones:**
   - Selecciona el directorio del proyecto
   - Vercel detectará la configuración automáticamente

### Configuración de Vercel

El proyecto incluye:

- `vercel.json` - Configuración específica para Vercel
- `.vercelignore` - Archivos excluidos del deploy

### URL de Producción

Después del deploy, Vercel te proporcionará una URL como:
`https://horarios-[tu-nombre].vercel.app`

### Características en Producción

- ✅ Build optimizado para producción
- ✅ IndexedDB funciona en el navegador
- ✅ PWA-ready (si decides agregarlo)
- ✅ HTTPS automático
- ✅ CDN global de Vercel

## Uso

1. **Agregar Horario**: Haz clic en "Agregar Horario" para crear un nuevo horario
2. **Completar Formulario**: Ingresa nombre, fecha, hora de entrada y salida (con conversión automática a 12h)
3. **Visualizar**: La aplicación se abre filtrada por la fecha actual mostrando "Horarios del [fecha actual]"
4. **Vista Agrupada**: En "Ver Todos", los horarios se agrupan por fecha con secciones expandibles
5. **Filtrar por Fecha**: Selecciona una fecha específica para ver solo los horarios de ese día con indicador del día
6. **Editar/Eliminar**: Usa los iconos de editar y eliminar para modificar o borrar horarios

Los datos se guardan automáticamente en IndexedDB y persisten entre sesiones sin pérdida de información.
