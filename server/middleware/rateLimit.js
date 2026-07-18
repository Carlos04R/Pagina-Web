/* ================================================================
   PEKE-ARI — server/middleware/rateLimit.js
   Limita cuántas peticiones puede hacer una misma IP en un periodo
   de tiempo, para evitar envíos masivos/automatizados (spam,
   fuerza bruta, scraping agresivo del formulario de contacto).
   ================================================================ */

import rateLimit from "express-rate-limit";

const minutos = (n) => n * 60 * 1000;

/**
 * Límite estricto para el formulario de contacto:
 * por defecto 5 envíos cada 10 minutos por IP.
 */
export const limitadorContacto = rateLimit({
  windowMs: minutos(Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MIN) || 10),
  max: Number(process.env.CONTACT_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error:
      "Has enviado demasiados mensajes en poco tiempo. Espera unos minutos e inténtalo de nuevo.",
  },
});

/**
 * Límite general y más permisivo para el resto de la API pública
 * (registro de visitas, lectura de estadísticas), suficiente para
 * frenar bots agresivos sin afectar el uso normal del sitio.
 */
export const limitadorApiGeneral = rateLimit({
  windowMs: minutos(1),
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Demasiadas peticiones. Intenta de nuevo en un momento." },
});

export const limitadorLogin = rateLimit({
  windowMs: minutos(15),
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Demasiados intentos de inicio de sesión. Espera unos minutos."
  },
});