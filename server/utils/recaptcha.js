/* ================================================================
   PEKE-ARI — server/utils/recaptcha.js
   Verifica en el servidor el token de Google reCAPTCHA v3 enviado
   desde el frontend. reCAPTCHA v3 no muestra ningún desafío visual
   al usuario (no rompe el diseño ni la UX); en vez de eso, entrega
   un puntaje de 0.0 (probable bot) a 1.0 (probable humano).
   ================================================================ */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * @param {string} token - token generado en el frontend por grecaptcha.execute()
 * @param {string} ip - IP del solicitante (opcional, mejora la precisión)
 * @returns {Promise<{ok: boolean, score: number|null, motivo?: string}>}
 */
export async function verificarRecaptcha(token, ip) {
  const secreto = process.env.RECAPTCHA_SECRET_KEY;
  const puntajeMinimo = Number(process.env.RECAPTCHA_MIN_SCORE) || 0.5;

  // Si el sitio aún no configuró sus claves (por ejemplo, en
  // desarrollo local), no se bloquea el formulario, pero se marca
  // como "no verificado" para que quede registrado igualmente.
  if (!secreto) {
    return { ok: true, score: null, motivo: "recaptcha_no_configurado" };
  }

  if (!token) {
    return { ok: false, score: 0, motivo: "token_faltante" };
  }

  try {
    const params = new URLSearchParams({ secret: secreto, response: token });
    if (ip) params.append("remoteip", ip);

    const respuesta = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const datos = await respuesta.json();

    if (!datos.success) {
      return { ok: false, score: 0, motivo: "token_invalido" };
    }

    if (typeof datos.score === "number" && datos.score < puntajeMinimo) {
      return { ok: false, score: datos.score, motivo: "puntaje_bajo" };
    }

    return { ok: true, score: datos.score ?? null };
  } catch (error) {
    // Si Google no responde, se falla "abierto" para no dejar el
    // formulario inutilizable por un problema externo, pero el
    // resto de protecciones (honeypot, rate limit, validación)
    // se mantienen activas igualmente.
    return { ok: true, score: null, motivo: "error_verificacion" };
  }
}
