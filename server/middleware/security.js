/* ================================================================
   PEKE-ARI — server/middleware/security.js
   Configura todas las cabeceras HTTP de seguridad recomendadas
   (usando Helmet) y expone utilidades reutilizables de saneamiento
   de entradas para los formularios.
   ================================================================ */

import helmet from "helmet";
import sanitizeHtml from "sanitize-html";

/**
 * Middleware principal de cabeceras de seguridad.
 * - Content-Security-Policy: solo permite cargar recursos desde el
 *   propio sitio y de los CDNs que el proyecto ya usaba
 *   (Google Fonts, Font Awesome, AOS, Google Maps, WhatsApp,
 *   reCAPTCHA). Nada más puede ejecutarse ni incrustarse.
 * - X-Frame-Options / frameguard: evita que el sitio se incruste en
 *   un <iframe> ajeno (clickjacking), salvo Google Maps que el
 *   propio sitio incrusta (permitido vía frame-src, no afecta a
 *   X-Frame-Options porque esa cabecera solo protege ESTE sitio).
 * - X-Content-Type-Options: evita que el navegador "adivine" tipos
 *   MIME (mitiga ataques de sniffing).
 * - Referrer-Policy: no filtra la URL completa a sitios externos.
 * - Permissions-Policy: desactiva APIs sensibles no usadas
 *   (cámara, micrófono, geolocalización, USB, etc.)
 */
export function cabecerasSeguridad(siteUrl) {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        // AOS y algunos estilos inline del proyecto original usan
        // atributos style="" puntuales; se permite 'unsafe-inline'
        // SOLO en estilos (no en scripts) para no romper el diseño.
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'", "https://www.google.com"],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com/maps/",
        ],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // evita romper el iframe de Google Maps
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Fuerza HTTPS en navegadores durante 1 año una vez el sitio
    // se sirva por HTTPS (no tiene efecto en http local).
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

/**
 * Permissions-Policy no está cubierta por defecto en todas las
 * versiones de Helmet con la sintaxis deseada, así que se agrega
 * manualmente aquí como middleware adicional.
 */
export function permissionsPolicy(req, res, next) {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), usb=(), payment=()"
  );
  // Cabecera extra recomendada para reforzar X-Content-Type-Options
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
}

/**
 * Limpia una cadena de texto de entrada de usuario:
 * - Elimina cualquier etiqueta HTML/JS (protección XSS).
 * - Recorta espacios sobrantes.
 * - Limita la longitud máxima para evitar payloads gigantes.
 */
export function limpiarTexto(valor, maxLength = 1000) {
  if (typeof valor !== "string") return "";
  const sinHtml = sanitizeHtml(valor, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return sinHtml.trim().slice(0, maxLength);
}

/**
 * Verifica el "honeypot": un campo oculto que solo un bot rellenaría.
 * Si viene con contenido, la petición se considera spam.
 */
export function esHoneypotSospechoso(valorHoneypot) {
  return typeof valorHoneypot === "string" && valorHoneypot.trim().length > 0;
}
