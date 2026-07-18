/* ================================================================
   PEKE-ARI — LOGIN.JS
   Envía el formulario de login a /api/login (server/routes/auth.js)
   y redirige al panel de estadísticas si las credenciales son
   correctas. Muestra mensajes de error elegantes sin interrumpir
   con un alert() nativo del navegador.
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const formLogin        = document.getElementById("formLogin");
  const mensajeError     = document.getElementById("loginMensajeError");
  const inputUsuario     = document.getElementById("loginUsuario");
  const inputContrasena  = document.getElementById("loginContrasena");
  const btnMostrarPassword = document.getElementById("btnMostrarPassword");

  /* --- Si ya hay una sesión activa, no tiene sentido mostrar el
     login: se manda directo al panel. --- */
  fetch("/api/sesion")
    .then((r) => r.json())
    .then((datos) => {
      if (datos.ok && datos.autenticado) {
        window.location.href = "/estadisticas.html";
      }
    })
    .catch(() => { /* si falla, simplemente se queda en el login */ });

  /* --- Mostrar / ocultar contraseña --- */
  if (btnMostrarPassword && inputContrasena) {
    btnMostrarPassword.addEventListener("click", () => {
      const esPassword = inputContrasena.type === "password";
      inputContrasena.type = esPassword ? "text" : "password";
      btnMostrarPassword.querySelector("i").classList.toggle("fa-eye", !esPassword);
      btnMostrarPassword.querySelector("i").classList.toggle("fa-eye-slash", esPassword);
      btnMostrarPassword.setAttribute(
        "aria-label",
        esPassword ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  }

  function mostrarError(texto) {
    if (!mensajeError) return;
    mensajeError.textContent = texto;
    mensajeError.classList.add("visible");
  }

  function ocultarError() {
    if (!mensajeError) return;
    mensajeError.classList.remove("visible");
    mensajeError.textContent = "";
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      ocultarError();

      const usuario = inputUsuario.value.trim();
      const contrasena = inputContrasena.value;

      if (!usuario || !contrasena) {
        mostrarError("Ingresa tu usuario y contraseña.");
        return;
      }

      const botonEnviar = formLogin.querySelector(".login-btn-ingresar");
      const textoBoton = botonEnviar.querySelector(".login-btn-texto");
      const iconoCargando = botonEnviar.querySelector(".login-btn-cargando");

      botonEnviar.disabled = true;
      if (textoBoton) textoBoton.textContent = "Ingresando...";
      if (iconoCargando) iconoCargando.hidden = false;

      try {
        const respuesta = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, contrasena }),
        });

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok || !datos.ok) {
          mostrarError(datos.error || "Usuario o contraseña incorrectos.");
          return;
        }

        window.location.href = datos.redirect || "/estadisticas.html";

      } catch (error) {
        mostrarError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
      } finally {
        botonEnviar.disabled = false;
        if (textoBoton) textoBoton.textContent = "Ingresar";
        if (iconoCargando) iconoCargando.hidden = true;
      }

    });
  }

});
