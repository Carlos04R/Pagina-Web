/* ================================================================
   PEKE-ARI — DARKMODE.JS
   Controla el cambio entre modo claro y modo oscuro.
   - Recuerda la preferencia del usuario en localStorage.
   - Si el usuario nunca lo ha elegido, respeta la preferencia del
     sistema operativo (prefers-color-scheme).
   - Cambia el ícono del botón (luna ⇄ sol).
   ================================================================ */

(function inicializarModoOscuro() {
  const CLAVE_LOCALSTORAGE = "peke-ari-tema"; // CAMBIAR AQUÍ si quieres otra clave
  const btnModoOscuro = document.getElementById("btnModoOscuro");
  const icono = btnModoOscuro ? btnModoOscuro.querySelector("i") : null;
  const raiz = document.documentElement; // <html>

  function obtenerTemaGuardado() {
    try {
      return localStorage.getItem(CLAVE_LOCALSTORAGE);
    } catch (error) {
      // Si el navegador bloquea localStorage (modo privado, etc.)
      return null;
    }
  }

  function guardarTema(tema) {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, tema);
    } catch (error) {
      // Falla silenciosa: el tema seguirá aplicado en esta sesión igual
    }
  }

  function actualizarIcono(tema) {
    if (!icono) return;
    icono.classList.toggle("fa-moon", tema === "claro");
    icono.classList.toggle("fa-sun", tema === "oscuro");
  }

  function aplicarTema(tema) {
    if (tema === "oscuro") {
      raiz.setAttribute("data-tema", "oscuro");
    } else {
      raiz.removeAttribute("data-tema");
    }
    actualizarIcono(tema);
    if (btnModoOscuro) {
      btnModoOscuro.setAttribute(
        "aria-label",
        tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      );
    }
  }

  /* --- Tema inicial: guardado > preferencia del sistema > claro --- */
  const prefiereOscuroElSistema = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const temaInicial = obtenerTemaGuardado() || (prefiereOscuroElSistema ? "oscuro" : "claro");
  aplicarTema(temaInicial);

  /* --- Click en el botón: alterna y guarda la preferencia --- */
  if (btnModoOscuro) {
    btnModoOscuro.addEventListener("click", () => {
      const temaActual = raiz.getAttribute("data-tema") === "oscuro" ? "oscuro" : "claro";
      const temaNuevo = temaActual === "oscuro" ? "claro" : "oscuro";
      aplicarTema(temaNuevo);
      guardarTema(temaNuevo);
    });
  }

  /* --- Si el usuario nunca eligió manualmente, sigue el cambio del sistema --- */
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (evento) => {
    if (obtenerTemaGuardado()) return; // ya eligió manualmente, no lo pisamos
    aplicarTema(evento.matches ? "oscuro" : "claro");
  });
})();
