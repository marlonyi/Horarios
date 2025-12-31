# Configuración de Deploy Automático en Vercel

## Paso a Paso para Configurar Deploy Automático

### 1. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. **IMPORTANTE:** En la configuración del proyecto, DESACTIVA el auto-deploy automático de Vercel (lo haremos con GitHub Actions)

### 2. Obtener los Tokens de Vercel

#### VERCEL_TOKEN:

1. Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Haz clic en "Create Token"
3. Nombre: "GitHub Actions Deploy"
4. Copia el token generado (solo se muestra una vez)

#### VERCEL_ORG_ID:

1. Ve a tu dashboard de Vercel
2. Ve a Settings → General
3. Copia el "Organization ID"

#### VERCEL_PROJECT_ID:

1. Ve a tu proyecto en Vercel
2. Ve a Settings → General
3. Copia el "Project ID"

### 3. Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **"New repository secret"** y agrega:

```
VERCEL_TOKEN = [tu_token_de_vercel]
VERCEL_ORG_ID = [tu_org_id]
VERCEL_PROJECT_ID = [tu_project_id]
```

### 4. Probar el Deploy

1. Haz commit y push de los cambios:

```bash
git add .
git commit -m "Configurar deploy automático"
git push origin main
```

2. Ve a la pestaña **Actions** en tu repositorio de GitHub
3. Deberías ver que se ejecuta el workflow "Deploy to Vercel"
4. Una vez completado, tu app estará desplegada automáticamente

### 5. Verificar el Deploy

- Ve a tu proyecto en Vercel
- Deberías ver un nuevo deployment
- La URL de producción se mantendrá la misma
- Los clientes no necesitarán reinstalar la PWA

## Solución de Problemas

### Si el workflow falla:

1. **Revisa los logs** en GitHub Actions
2. **Verifica los secrets** - asegúrate de que estén configurados correctamente
3. **Verifica los IDs** - asegúrate de que los IDs de Vercel sean correctos

### Si el deploy no se activa:

1. Asegúrate de que el push sea a la rama `main`
2. Verifica que el archivo `.github/workflows/deploy.yml` esté en el repositorio

## Beneficios

- 🚀 **Deploy automático** en cada commit
- 📱 **Sin reinstalación** para usuarios móviles
- 🔄 **Historial completo** de versiones
- 🛡️ **Rollback fácil** si algo sale mal
- ⚡ **Previews automáticos** para pull requests
