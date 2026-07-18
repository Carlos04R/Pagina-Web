/* ================================================================
   PEKE-ARI — server/index.js
   Servidor Express que:
     1. Sirve el sitio estático (carpeta /public) con cabeceras de
        seguridad y compresión.
     2. Expone la API de contacto (con validación, honeypot,
        rate limiting y reCAPTCHA v3).
     3. Expone la API de estadísticas de visitas (registro y
        consulta para el panel visual).

   Cómo correrlo:
     1. cp .env.example .env   (y completa tus valores)
     2. npm install
     3. npm start               (o "npm run dev" para autoreload)
   ================================================================ */

import express from "express";
import compression from "compression";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import { cabecerasSeguridad, permissionsPolicy } from "./middleware/security.js";
import { limitadorApiGeneral, limitadorContacto } from "./middleware/rateLimit.js";
import rutasContacto from "./routes/contacto.js";
import rutasEstadisticas from "./routes/estadisticas.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

const app = express();

// Necesario para que "req.ip" sea la IP real del visitante cuando
// el sitio corre detrás de un proxy/CDN (Cloudflare, Nginx, etc.)
app.set("trust proxy", 1);

/* ---------------------------------------------------------------
   Middlewares globales de seguridad y utilidad
--------------------------------------------------------------- */
app.use(cabecerasSeguridad(SITE_URL));
app.use(permissionsPolicy);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "20kb" })); // límite bajo: los formularios son cortos, evita payloads abusivos
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

/* ---------------------------------------------------------------
   Redirección a HTTPS en producción (cuando el sitio corre detrás
   de un proxy que informa el protocolo original vía X-Forwarded-Proto)
--------------------------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

/* ---------------------------------------------------------------
   API
--------------------------------------------------------------- */
app.use("/api", limitadorApiGeneral, rutasEstadisticas);
app.use("/api", limitadorContacto, rutasContacto);

/* ---------------------------------------------------------------
   Página principal
--------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

/* ---------------------------------------------------------------
   Archivos estáticos del sitio (frontend original, sin cambios de
   identidad visual — ver /public)
--------------------------------------------------------------- */
app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],
    maxAge: "7d", // cache de imágenes/CSS/JS; el HTML se sirve sin cache larga
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

/* ---------------------------------------------------------------
   404 para rutas no encontradas (después de estáticos y API)
--------------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

/* ---------------------------------------------------------------
   Manejador de errores centralizado (evita filtrar detalles
   internos/stack traces al cliente)
--------------------------------------------------------------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Error no controlado]", err);
  res.status(500).json({ ok: false, error: "Error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`✅ PEKE-ARI escuchando en http://localhost:${PORT}`);
});
