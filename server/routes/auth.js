/* ================================================================
   PEKE-ARI — server/routes/auth.js
   Endpoints de inicio y cierre de sesión para proteger el panel
   de estadísticas. Las credenciales NO están en el código: viven
   en variables de entorno (.env -> ADMIN_USER / ADMIN_PASSWORD) y
   se comparan con tiempo constante para no filtrar información
   por diferencias de tiempo de respuesta (ataques de timing).
   ================================================================ */

import { Router } from "express";
import crypto from "node:crypto";
import { body, validationResult } from "express-validator";
import { limitadorLogin } from "../middleware/rateLimit.js";

const router = Router();

/**
 * Compara dos cadenas en tiempo constante (no corta la comparación
 * apenas encuentra la primera diferencia), para que un atacante no
 * pueda deducir la contraseña midiendo cuánto tarda cada intento.
 * Si las longitudes difieren, igual se hace una comparación
 * "de relleno" para no delatar la longitud correcta por la
 * diferencia de tiempo entre "falla rápido" y "falla lento".
 */
function compararSeguro(valorRecibido, valorEsperado) {
  const bufferRecibido = Buffer.from(String(valorRecibido));
  const bufferEsperado = Buffer.from(String(valorEsperado));

  if (bufferRecibido.length !== bufferEsperado.length) {
    // Comparación de relleno contra sí mismo, para tardar un
    // tiempo similar al de una comparación real.
    crypto.timingSafeEqual(bufferEsperado, bufferEsperado);
    return false;
  }

  return crypto.timingSafeEqual(bufferRecibido, bufferEsperado);
}

const reglasLogin = [
  body("usuario").trim().notEmpty().withMessage("Ingresa tu usuario.").isLength({ max: 60 }),
  body("contrasena").notEmpty().withMessage("Ingresa tu contraseña.").isLength({ max: 200 }),
];

/**
 * POST /api/login
 * Body: { usuario, contrasena }
 */
router.post("/login", limitadorLogin, reglasLogin, (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      error: "Ingresa tu usuario y contraseña.",
    });
  }

  const usuarioEsperado = process.env.ADMIN_USER;
  const passwordEsperado = process.env.ADMIN_PASSWORD;

  // Si el sitio aún no configuró sus credenciales en .env, se
  // bloquea el acceso por completo (falla "cerrado", nunca abierto).
  if (!usuarioEsperado || !passwordEsperado) {
    console.error("[Auth] ADMIN_USER / ADMIN_PASSWORD no están configurados en .env");
    return res.status(500).json({
      ok: false,
      error: "El panel aún no tiene credenciales configuradas. Contacta al administrador del sitio.",
    });
  }

  const { usuario, contrasena } = req.body;

  const usuarioValido = compararSeguro(usuario, usuarioEsperado);
  const passwordValido = compararSeguro(contrasena, passwordEsperado);

  if (!usuarioValido || !passwordValido) {
    return res.status(401).json({ ok: false, error: "Usuario o contraseña incorrectos." });
  }

  // Regenerar el ID de sesión al iniciar sesión evita "session
  // fixation" (que alguien reutilice un ID de sesión que ya tenía
  // preparado antes de que el usuario se autenticara).
  req.session.regenerate((error) => {
    if (error) {
      console.error("[Auth] Error regenerando sesión:", error);
      return res.status(500).json({ ok: false, error: "Error interno. Intenta de nuevo." });
    }

    req.session.autenticado = true;
    req.session.usuario = usuario;

    res.status(200).json({ ok: true, redirect: "/estadisticas.html" });
  });
});

/**
 * POST /api/logout
 * Destruye la sesión actual (botón "Cerrar sesión").
 */
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({ ok: true });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("[Auth] Error destruyendo sesión:", error);
      return res.status(500).json({ ok: false, error: "No se pudo cerrar la sesión." });
    }
    res.clearCookie("peke_ari_sid");
    res.status(200).json({ ok: true, redirect: "/login.html" });
  });
});

/**
 * GET /api/sesion
 * Consulta rápida para que el frontend sepa si ya hay una sesión
 * activa (útil, por ejemplo, para no mostrar el formulario de login
 * si el usuario ya inició sesión en otra pestaña).
 */
router.get("/sesion", (req, res) => {
  res.json({
    ok: true,
    autenticado: Boolean(req.session && req.session.autenticado),
    usuario: req.session?.usuario || null,
  });
});

export default router;
