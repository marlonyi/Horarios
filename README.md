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
- 📸 **Generar resumen diario en imagen** - Crear y descargar imagen con horarios del día para compartir
- 📊 **Reportes Avanzados** - Generar reportes de trabajo por períodos (diario, semanal, quincenal, mensual) con estadísticas completas de empleados, horas trabajadas, horas extras y exportación a CSV

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

### Opción 1: Deploy Automático con GitHub Actions (Recomendado)

Esta opción configura el despliegue automático cada vez que haces push a la rama `main`.

#### Configuración Inicial:

1. **Conecta tu repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - **Importante:** Configura el proyecto pero NO actives el auto-deploy de Vercel (desactívalo)

2. **Obtén los tokens de Vercel:**
   - Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Crea un nuevo token con nombre "GitHub Actions"
   - Copia el token generado

3. **Configura los Secrets en GitHub:**
   - Ve a tu repositorio en GitHub
   - Ve a Settings → Secrets and variables → Actions
   - Agrega estos secrets:
     - `VERCEL_TOKEN`: El token que copiaste de Vercel
     - `VERCEL_ORG_ID`: Tu Organization ID de Vercel (lo encuentras en Settings → General)
     - `VERCEL_PROJECT_ID`: El Project ID de tu proyecto en Vercel

4. **Deploy Automático:**
   - Cada push a la rama `main` activará automáticamente un deploy
   - Los PRs también activarán previews automáticos
   - No necesitas borrar y recrear proyectos nunca más

#### Ventajas:
- ✅ Deploy automático en cada commit
- ✅ Previews automáticos para PRs
- ✅ No más instalación manual para clientes
- ✅ Historial completo de deploys
- ✅ Rollback fácil si algo sale mal

### Opción 2: Deploy Manual

Si prefieres hacer deploys manuales:

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
7. **📸 Generar Resumen Diario**: Cuando estés viendo los horarios de un día específico, haz clic en "Generar Resumen" para crear una imagen profesional con todos los horarios del día. La imagen se descarga automáticamente y se intenta compartir por WhatsApp (o se abre WhatsApp para compartir manualmente).
8. **📊 Generar Reportes**: Haz clic en "Generar Reportes" para acceder al sistema de reportes avanzados. Selecciona el tipo de reporte (diario, semanal, quincenal, mensual), elige una fecha base y visualiza estadísticas completas de empleados incluyendo días trabajados, horas totales, horas efectivas, horas extras y promedio diario. Exporta los datos a CSV para análisis adicionales.

Los datos se guardan automáticamente en IndexedDB y persisten entre sesiones sin pérdida de información.

## 📊 Sistema de Reportes Avanzados

La aplicación incluye un sistema completo de reportes para análisis de productividad y gestión de personal:

### Tipos de Reportes Disponibles:

- **📅 Diario**: Estadísticas de un día específico
- **📆 Semanal**: Reporte de la semana que contiene la fecha base, limitado al mes actual para períodos de pago
- **🗓️ Quincenal**: Reporte de quincena (1-15 o 16-fin del mes) según la fecha base seleccionada
- **📊 Mensual**: Reporte del mes completo (día 1 al 30/31) de la fecha base seleccionada

### Características de Períodos de Pago:

- **Basado en Mes**: Todos los reportes se calculan dentro del mes de la fecha base seleccionada
- **Períodos de Pago**: Los reportes reflejan los períodos reales de pago a empleados (del 1 al 30/31 del mes)
- **Cálculo Individual**: Cada empleado se calcula por separado basado únicamente en sus días trabajados registrados en el período

### Estadísticas Incluidas:

- **Empleados Totales**: Número de empleados con horarios en el período
- **Días Trabajados**: Total de días trabajados por todos los empleados (solo días con horarios registrados)
- **Horas Efectivas**: Horas efectivas después de deducir tiempo de almuerzo
- **Horas Extras**: Horas trabajadas más allá de las 8 horas diarias estándar
- **Promedio Diario**: Promedio de horas trabajadas por día por empleado
- **Detalle por Día**: Horas de entrada, salida y cálculos detallados para cada día trabajado

### Funcionalidades:

- **Vista Previa en Tiempo Real**: Los reportes se generan instantáneamente al cambiar configuración
- **Exportación a CSV Detallada**: Descarga datos en formato CSV con resumen general, estadísticas por empleado y detalle por día con horas de entrada/salida
- **Interfaz Intuitiva**: Selección fácil de tipo de reporte y fecha base
- **Vista Expandible**: Cada empleado puede expandirse para ver detalle completo de cada día trabajado
- **Cálculos Individuales**: Cada empleado se calcula por separado basado únicamente en sus días trabajados registrados

### Cómo Usar los Reportes:

1. Haz clic en "📊 Generar Reportes"
2. Selecciona el tipo de reporte deseado (diario, semanal, quincenal, mensual)
3. Elige la fecha base para el cálculo del período
4. Revisa las estadísticas generales en el resumen
5. Explora la tabla de empleados - haz clic en el nombre de cualquier empleado para ver el detalle completo de cada día trabajado, incluyendo horas de entrada y salida
6. Haz clic en "📥 Exportar CSV" para descargar un archivo detallado con:
   - Resumen general del período
   - Estadísticas resumidas por empleado
   - Detalle completo por día con horas de entrada, salida y cálculos de horas trabajadas
