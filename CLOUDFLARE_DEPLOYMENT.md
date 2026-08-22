# Guía de Despliegue en Cloudflare Pages

Esta aplicación (**FirmaEC Suite**) está 100% optimizada para desplegarse en **Cloudflare Pages** mediante la combinación de **React SPA (Vite)** para procesamiento criptográfico en el navegador y **Cloudflare Pages Functions** para la API serverless en el Edge (`/api/analyze-document`).

---

## 🚀 Método 1: Despliegue Automático con GitHub Integration (Recomendado)

1. Conecta tu repositorio de GitHub a tu cuenta de **Cloudflare Dashboard** (`Pages & Workers` > `Create Application` > `Pages` > `Connect to Git`).
2. Configura los parámetros del proyecto:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:cloudflare`
   - **Build Output Directory**: `dist`
3. Agrega la variable de entorno en **Settings > Environment Variables**:
   - `GEMINI_API_KEY`: Tu API key de Google Gemini.
4. Presiona **Save and Deploy**. ¡Listo!

---

## 🛠️ Método 2: Despliegue Manual desde la Terminal (CLI con Wrangler)

1. Inicia sesión en Cloudflare desde tu terminal:
   ```bash
   npx wrangler login
   ```

2. Compila la aplicación para producción:
   ```bash
   npm run build:cloudflare
   ```

3. Despliega el directorio `dist` a Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=firmaec-suite
   ```

4. Configura el secreto para la API Key de Gemini:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```

---

## ⚡ Pruebas Locales con Entorno Cloudflare

Para previsualizar cómo se ejecutará tu aplicación en la infraestructura de Cloudflare (simulando Cloudflare Pages Functions a nivel de red edge):

```bash
npm run build:cloudflare
npm run preview:cloudflare
```

---

## 🛡️ Arquitectura de Seguridad y Rendimiento

- **Criptografía Client-Side**: La generación de certificados PKCS#12 (.P12) y el estampado de PDFs con `pdf-lib` ocurren directamente en el navegador del usuario (RAM). Ninguna clave privada o documento sensible viaja a servidores intermedios.
- **Edge API Function (`/api/analyze-document`)**: Ejecutada mediante V8 isolates en Cloudflare Pages Functions en < 10ms de latencia global, protegiendo la clave `GEMINI_API_KEY` en el backend.
