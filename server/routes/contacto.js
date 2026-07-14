/* ================================================================
   PEKE-ARI — server/routes/contacto.js
   Procesa los envíos del formulario de contacto con múltiples
   capas de seguridad:
     1. Rate limiting (ver middleware/rateLimit.js)
     2. Honeypot invisible (campo "empresa_web" en el formulario)
     3. Validación de formato de cada campo
     4. Sanitización contra XSS
     5. Verificación de reCAPTCHA v3
   ================================================================ */

import { Router } from "express";
import { body, validationResult } from "express-validator";
import crypto from "node:crypto";
import { limpiarTexto, esHoneypotSospechoso } from "../middleware/security.js";
import { verificarRecaptcha } from "../utils/recaptcha.js";
import { getDB } from "../utils/db.js";

const router = Router();

function hashIp(ip) {
  const sal = process.env.IP_HASH_SALT || "sal-por-defecto";
  return crypto.createHash("sha256").update(`${ip}${sal}`).digest("hex").slice(0, 16);
}

const reglasValidacion = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio.")
    .isLength({ min: 2, max: 80 }).withMessage("El nombre debe tener entre 2 y 80 caracteres.")
    .matches(/^[\p{L}\s.'-]+$/u).withMessage("El nombre contiene caracteres no permitidos."),
  body("correo")
    .trim()
    .notEmpty().withMessage("El correo es obligatorio.")
    .isEmail().withMessage("Ingresa un correo válido.")
    .normalizeEmail(),
  body("telefono")
    .trim()
    .notEmpty().withMessage("El teléfono es obligatorio.")
    .matches(/^[0-9+\s-]{7,15}$/).withMessage("Ingresa un teléfono válido."),
  body("mensaje")
    .trim()
    .notEmpty().withMessage("El mensaje es obligatorio.")
    .isLength({ min: 5, max: 1000 }).withMessage("El mensaje debe tener entre 5 y 1000 caracteres."),
  // Honeypot: NO es "required". Un usuario real nunca lo llena porque
  // está oculto con CSS; solo los bots que rellenan todos los <input>
  // automáticamente caen en la trampa.
  body("empresa_web").optional({ checkFalsy: true }),
];

router.post("/contacto", reglasValidacion, async (req, res) => {
  try {
    // 1. Honeypot
    if (esHoneypotSospechoso(req.body.empresa_web)) {
      // Se responde éxito "falso" para no revelar al bot que fue
      // detectado (evita que ajuste su estrategia), pero no se
      // procesa ni almacena el mensaje.
      return res.status(200).json({ ok: true });
    }

    // 2. Validación de formato
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        error: "Revisa los datos del formulario.",
        detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
      });
    }

    // 3. Sanitización adicional contra XSS (defensa en profundidad,
    // además de la validación de formato de arriba).
    const datos = {
      nombre: limpiarTexto(req.body.nombre, 80),
      correo: limpiarTexto(req.body.correo, 120),
      telefono: limpiarTexto(req.body.telefono, 15),
      mensaje: limpiarTexto(req.body.mensaje, 1000),
    };

    // 4. reCAPTCHA v3
    const ip = req.ip;
    const recaptcha = await verificarRecaptcha(req.body.recaptchaToken, ip);
    if (!recaptcha.ok) {
      return res.status(400).json({
        ok: false,
        error: "No pudimos verificar que el envío es humano. Intenta nuevamente.",
      });
    }

    // 5. Registro (metadatos únicamente, sin guardar el mensaje
    // completo en el JSON de estadísticas por privacidad; el envío
    // real del correo se conecta con el proveedor SMTP que elija
    // el negocio — ver README-CAMBIOS.md).
    const db = await getDB();
    db.data.mensajesContacto.push({
      fecha: new Date().toISOString(),
      ipHash: hashIp(ip),
      recaptchaScore: recaptcha.score,
    });
    await db.write();

    // Aquí se debe conectar el envío real (ejemplo: Nodemailer,
    // Resend, SendGrid). Se deja el payload listo para usar:
    // await enviarCorreo(datos);
    console.log("[Contacto] Nuevo mensaje validado de:", datos.correo);

    return res.status(200).json({ ok: true, mensaje: "¡Gracias! Tu mensaje fue enviado." });
  } catch (error) {
    console.error("[Contacto] Error:", error);
    return res.status(500).json({ ok: false, error: "Ocurrió un error inesperado. Intenta más tarde." });
  }
});

export default router;
