/* ================================================================
   PEKE-ARI — server/middleware/auth.js
   Middleware reutilizable que exige una sesión iniciada (login)
   para poder continuar. Se usa para proteger tanto páginas HTML
   (redirige a /login.html) como endpoints de la API (responde 401
   en JSON, ya que ahí no tiene sentido redirigir).

   Este middleware NO valida usuario/contraseña — eso ocurre una
   sola vez en server/routes/auth.js al iniciar sesión. Aquí solo
   se revisa si la sesión ya existente está marcada como
   autenticada (req.session.autenticado === true).
   ================================================================ */

export function requiereSesion(req, res, next) {
  if (req.session && req.session.autenticado === true) {
    return next();
  }

  // Las peticiones a la API esperan una respuesta JSON, no una
  // redirección HTML (el fetch() del panel no puede "seguir" un
  // redirect y mostrar login.html dentro del JSON esperado).
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({
      ok: false,
      error: "Sesión no iniciada o expirada. Vuelve a iniciar sesión.",
    });
  }

  // Navegación normal del navegador (ej. abrir /estadisticas.html
  // directamente en la barra de direcciones): se redirige al login.
  return res.redirect("/login.html");
}
