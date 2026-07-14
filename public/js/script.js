/* ================================================================
   PEKE-ARI — SCRIPT.JS (archivo principal)
   Aquí se inicializa AOS, el loader, la navbar, el botón volver
   arriba, el menú hamburguesa, el cursor personalizado, el
   parallax del hero y los contadores animados.
   ================================================================ */

/* ================================================================
   0.a SEGURIDAD — Carga reCAPTCHA v3 solo si el sitio tiene una
   clave pública configurada (data-recaptcha-sitekey en #formContacto).
   Si se deja vacío, el sitio sigue funcionando: el formulario queda
   protegido igual por honeypot + validación + rate limiting.
   ================================================================ */
(function cargarRecaptchaSiCorresponde() {
  const form = document.getElementById("formContacto");
  const siteKey = form?.dataset.recaptchaSitekey;
  if (!siteKey) return;

  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
})();

/* ================================================================
   0. UTILIDAD — Respeta si el usuario prefiere menos animaciones
   ================================================================ */
const PREFIERE_MENOS_MOVIMIENTO = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ================================================================
   1. AOS — Animate On Scroll
   CAMBIAR AQUÍ la duración/velocidad de las animaciones al hacer scroll
   ================================================================ */
if (window.AOS) {
  AOS.init({
    duration: 700,        // duración de cada animación (ms)
    easing: "ease-out-cubic",
    once: true,            // la animación ocurre una sola vez
    offset: 60,             // px antes de entrar en pantalla
    disable: PREFIERE_MENOS_MOVIMIENTO
  });
}

/* ================================================================
   2. LOADER
   Se oculta cuando toda la página (imágenes, video, etc.) terminó
   de cargar. Si tarda demasiado, se fuerza el cierre a los 4s para
   no dejar al usuario esperando.
   ================================================================ */
(function inicializarLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  let ocultado = false;

  function ocultarLoader() {
    if (ocultado) return;
    ocultado = true;
    loader.classList.add("oculto");
    // Bloquea el scroll mientras carga y lo libera al ocultar
    document.body.style.overflow = "";
    // Se quita del flujo tras la transición para que no estorbe al foco/tab
    loader.addEventListener("transitionend", () => loader.remove(), { once: true });
    setTimeout(() => loader.remove(), 1200); // respaldo por si no dispara transitionend
  }

  document.body.style.overflow = "hidden";
  window.addEventListener("load", ocultarLoader);
  setTimeout(ocultarLoader, 4000); // respaldo de seguridad
})();

/* ================================================================
   3. NAVBAR — Sticky, transparente al inicio, sólida al hacer scroll
   Además resalta el link de la sección visible en pantalla.
   CAMBIAR AQUÍ el valor de UMBRAL_SCROLL si quieres que la navbar
   cambie de color antes o después.
   ================================================================ */
(function inicializarNavbar() {
  const navBar = document.getElementById("navBar");
  if (!navBar) return;

  const UMBRAL_SCROLL = 60;

  function actualizarNavbar() {
    navBar.classList.toggle("activo", window.scrollY > UMBRAL_SCROLL);
  }
  actualizarNavbar();
  window.addEventListener("scroll", actualizarNavbar, { passive: true });

  /* --- Resaltar link activo según la sección visible --- */
  const enlaces = Array.from(document.querySelectorAll(".nav-links a"));
  const secciones = enlaces
    .map((enlace) => document.querySelector(enlace.getAttribute("href")))
    .filter(Boolean);

  if (secciones.length && "IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const id = `#${entrada.target.id}`;
          enlaces.forEach((enlace) => {
            enlace.classList.toggle("activo", enlace.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    secciones.forEach((seccion) => observador.observe(seccion));
  }
})();

/* ================================================================
   4. MENÚ HAMBURGUESA (versión móvil)
   Nota: la animación/visibilidad del menú desplegado en móvil se
   completa en css/responsive.css (siguiente parte pendiente).
   ================================================================ */
(function inicializarHamburguesa() {
  const btnHamburguesa = document.getElementById("btnHamburguesa");
  const navLinks = document.getElementById("navLinks");
  if (!btnHamburguesa || !navLinks) return;

  function alternarMenu(forzarCierre = false) {
    const abierto = forzarCierre ? false : !navLinks.classList.contains("abierto");
    navLinks.classList.toggle("abierto", abierto);
    btnHamburguesa.classList.toggle("abierto", abierto);
    btnHamburguesa.setAttribute("aria-expanded", String(abierto));
    document.body.classList.toggle("menu-abierto", abierto);
  }

  btnHamburguesa.addEventListener("click", () => alternarMenu());

  // Cierra el menú al tocar un enlace (útil en móvil)
  navLinks.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => alternarMenu(true));
  });

  // Cierra el menú si se hace clic fuera de él
  document.addEventListener("click", (evento) => {
    const dentroDelMenu = navLinks.contains(evento.target) || btnHamburguesa.contains(evento.target);
    if (!dentroDelMenu) alternarMenu(true);
  });

  // Cierra el menú con la tecla Escape
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") alternarMenu(true);
  });
})();

/* ================================================================
   5. BOTÓN VOLVER ARRIBA
   ================================================================ */
(function inicializarBotonArriba() {
  const btnArriba = document.getElementById("btnArriba");
  if (!btnArriba) return;

  const UMBRAL_SCROLL = 400;

  function actualizarVisibilidad() {
    btnArriba.classList.toggle("visible", window.scrollY > UMBRAL_SCROLL);
  }
  actualizarVisibilidad();
  window.addEventListener("scroll", actualizarVisibilidad, { passive: true });

  btnArriba.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: PREFIERE_MENOS_MOVIMIENTO ? "auto" : "smooth"
    });
  });
})();

/* ================================================================
   6. CURSOR PERSONALIZADO (decorativo — se oculta en móvil vía CSS)
   ================================================================ */
(function inicializarCursor() {
  if (PREFIERE_MENOS_MOVIMIENTO) return;

  const cursorPunto = document.querySelector(".cursor-punto");
  const cursorAnillo = document.querySelector(".cursor-anillo");
  if (!cursorPunto || !cursorAnillo || window.matchMedia("(pointer: coarse)").matches) return;

  let mouseX = 0, mouseY = 0;
  let anilloX = 0, anilloY = 0;

  window.addEventListener("mousemove", (evento) => {
    mouseX = evento.clientX;
    mouseY = evento.clientY;
    cursorPunto.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // El anillo sigue al puntero con un pequeño retraso ("lerp") para efecto suave
  function animarAnillo() {
    anilloX += (mouseX - anilloX) * 0.15;
    anilloY += (mouseY - anilloY) * 0.15;
    cursorAnillo.style.transform = `translate(${anilloX}px, ${anilloY}px)`;
    requestAnimationFrame(animarAnillo);
  }
  requestAnimationFrame(animarAnillo);

  // Efecto hover sobre elementos interactivos
  document.querySelectorAll("a, button, input, textarea, select, .servicio-tarjeta, .producto-tarjeta")
    .forEach((elemento) => {
      elemento.addEventListener("mouseenter", () => cursorAnillo.classList.add("cursor-hover"));
      elemento.addEventListener("mouseleave", () => cursorAnillo.classList.remove("cursor-hover"));
    });

  // Oculta el cursor personalizado si el puntero sale de la ventana
  document.addEventListener("mouseleave", () => {
    cursorPunto.style.opacity = "0";
    cursorAnillo.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursorPunto.style.opacity = "1";
    cursorAnillo.style.opacity = "1";
  });
})();

/* ================================================================
   7. PARALLAX DEL HERO
   Mueve los elementos con [data-parallax] según el scroll, usando
   la intensidad indicada en el propio atributo (0 a 1).
   ================================================================ */
(function inicializarParallax() {
  if (PREFIERE_MENOS_MOVIMIENTO) return;

  const elementosParallax = document.querySelectorAll("[data-parallax]");
  if (!elementosParallax.length) return;

  let ticking = false;

  function actualizarParallax() {
    const scrollY = window.scrollY;
    elementosParallax.forEach((elemento) => {
      const intensidad = parseFloat(elemento.dataset.parallax) || 0.2;
      elemento.style.transform = `translateY(${scrollY * intensidad}px)`;
    });
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(actualizarParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ================================================================
   8. CONTADORES ANIMADOS
   Cuenta desde 0 hasta el valor de [data-contador] cuando la
   sección entra en pantalla. Se ejecuta una sola vez por contador.
   CAMBIAR AQUÍ la duración si quieres un conteo más rápido/lento.
   ================================================================ */
(function inicializarContadores() {
  const contadores = document.querySelectorAll(".contador-numero");
  if (!contadores.length) return;

  const DURACION_MS = 1600;

  function animarContador(elemento) {
    const meta = parseInt(elemento.dataset.contador, 10) || 0;
    const inicio = performance.now();

    function paso(ahora) {
      const progreso = Math.min((ahora - inicio) / DURACION_MS, 1);
      // easing suave de salida (ease-out)
      const progresoSuave = 1 - Math.pow(1 - progreso, 3);
      elemento.textContent = Math.floor(progresoSuave * meta).toLocaleString("es-EC");
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        elemento.textContent = meta.toLocaleString("es-EC");
      }
    }

    if (PREFIERE_MENOS_MOVIMIENTO) {
      elemento.textContent = meta.toLocaleString("es-EC");
    } else {
      requestAnimationFrame(paso);
    }
  }

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            animarContador(entrada.target);
            obs.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    contadores.forEach((contador) => observador.observe(contador));
  } else {
    contadores.forEach(animarContador); // respaldo sin IntersectionObserver
  }
})();

/* ================================================================
   PRODUCTOS DESTACADOS
   Toma los productos con etiqueta (nuevo, oferta o vendido) desde
   el arreglo "productos" de js/catalogo.js y los muestra con una
   insignia con emoji.
   ================================================================ */

const INSIGNIAS_DESTACADO = {
  nuevo:   "🔥 Nuevo",
  oferta:  "💲 Oferta",
  vendido: "⭐ Más vendido"
};

function mostrarDestacados(){

  const grid = document.getElementById("destacadosGrid");
  if(!grid || typeof productos === "undefined") return;

  // Los productos "agotados" no se muestran aquí: esta sección es
  // para invitar a comprar, no tendría sentido destacar algo sin stock.
  const destacados = productos.filter(p => p.etiqueta && p.etiqueta !== "agotado");

  grid.innerHTML = "";

  destacados.forEach(producto => {

    grid.innerHTML += `
      <div class="destacado-tarjeta" data-aos="zoom-in">
        <span class="insignia-destacado">${INSIGNIAS_DESTACADO[producto.etiqueta]}</span>
        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        <h3>${producto.nombre}</h3>
        <span class="destacado-precio">$${producto.precio.toFixed(2)}</span>
      </div>
    `;

  });

}

mostrarDestacados();

/* ================================================================
   GALERÍA + LIGHTBOX
   Dibuja las miniaturas, filtra por categoría y controla el
   visor de imagen ampliada (lightbox) con teclado y flechas.
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR IMÁGENES DE LA GALERÍA AQUÍ
   Copia un bloque { ... } para agregar una foto nueva.
   Campos:
     titulo    -> texto que aparece al pasar el mouse y en el lightbox
     categoria -> debe coincidir EXACTO con un botón de filtro:
                  "Local", "Productos", "Trabajos", "Eventos"
     imagen    -> ruta de la imagen (CAMBIAR IMAGEN AQUÍ)
---------------------------------------------------------------- */
const imagenesGaleria = [
  { titulo: "Nuestro local",            categoria: "Local",     imagen: "img/galeria/local.png" },
  { titulo: "Zona de atención",         categoria: "Local",     imagen: "img/galeria/zonaatt.jpg" },
  { titulo: "Área de impresiones",      categoria: "Local",     imagen: "img/galeria/zonaIM.jpg" },
  { titulo: "Estantería de papelería",  categoria: "Productos", imagen: "img/galeria/estan.jpg" },
  { titulo: "Útiles escolares",         categoria: "Productos", imagen: "img/galeria/utiles.jpg" },
  { titulo: "Snacks y bebidas",         categoria: "Productos", imagen: "img/galeria/snack.jpg" },
  { titulo: "Tesis anillada",           categoria: "Trabajos",  imagen: "img/galeria/anillado.jpg" },
  { titulo: "Proyecto plastificado",    categoria: "Trabajos",  imagen: "img/galeria/plastificado.jpg" },
  { titulo: "Material didáctico",       categoria: "Trabajos",  imagen: "img/galeria/didactico.jpg" },
  { titulo: "Feria escolar",            categoria: "Eventos",   imagen: "img/galeria/feria.jpg" },
  { titulo: "Promoción de temporada",   categoria: "Eventos",   imagen: "img/galeria/descuento.jpg" },
  { titulo: "Entrega de pedidos",       categoria: "Eventos",   imagen: "img/galeria/pedidos.jpg" }
];

const galeriaGrid    = document.getElementById("galeriaGrid");
const galeriaFiltros = document.getElementById("galeriaFiltros");

const lightbox          = document.getElementById("lightbox");
const lightboxImagen     = document.getElementById("lightboxImagen");
const lightboxTitulo     = document.getElementById("lightboxTitulo");
const lightboxContador   = document.getElementById("lightboxContador");
const lightboxCerrar     = document.getElementById("lightboxCerrar");
const lightboxPrev       = document.getElementById("lightboxPrev");
const lightboxNext       = document.getElementById("lightboxNext");

let galeriaFiltrada = imagenesGaleria;
let indiceLightbox  = 0;

/**
 * Dibuja las miniaturas de la galería según la lista recibida.
 * @param {Array} lista - fotos a mostrar
 */
function mostrarGaleria(lista){

  if(!galeriaGrid) return;

  galeriaFiltrada = lista;
  galeriaGrid.innerHTML = "";

  lista.forEach((foto, indice) => {
    galeriaGrid.innerHTML += `
      <div class="galeria-item" data-aos="zoom-in" data-indice="${indice}">
        <img src="${foto.imagen}" alt="${foto.titulo}" loading="lazy">
        <div class="galeria-overlay">
          <i class="fa-solid fa-magnifying-glass-plus"></i>
          <span>${foto.titulo}</span>
        </div>
      </div>
    `;
  });

  /* Cada miniatura abre el lightbox en su propia posición */
  document.querySelectorAll(".galeria-item").forEach(item => {
    item.addEventListener("click", () => {
      abrirLightbox(parseInt(item.dataset.indice));
    });
  });

}

/* Filtro de categorías (mismo comportamiento que el catálogo) */
if(galeriaFiltros){
  galeriaFiltros.addEventListener("click", (evento) => {

    const boton = evento.target.closest(".filtro-btn");
    if(!boton) return;

    galeriaFiltros.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");

    const categoria = boton.dataset.categoria;

    mostrarGaleria(
      categoria === "todos"
        ? imagenesGaleria
        : imagenesGaleria.filter(foto => foto.categoria === categoria)
    );

  });
}

/**
 * Abre el lightbox mostrando la foto en la posición indicada
 * (posición dentro de la lista actualmente filtrada).
 * @param {number} indice
 */
function abrirLightbox(indice){

  indiceLightbox = indice;
  actualizarLightbox();

  lightbox.classList.add("activo");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

}

function actualizarLightbox(){

  const foto = galeriaFiltrada[indiceLightbox];
  if(!foto) return;

  lightboxImagen.src = foto.imagen;
  lightboxImagen.alt = foto.titulo;
  lightboxTitulo.textContent = foto.titulo;
  lightboxContador.textContent = `${indiceLightbox + 1} / ${galeriaFiltrada.length}`;

}

function cerrarLightbox(){
  lightbox.classList.remove("activo");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function lightboxAnterior(){
  indiceLightbox = (indiceLightbox - 1 + galeriaFiltrada.length) % galeriaFiltrada.length;
  actualizarLightbox();
}

function lightboxSiguiente(){
  indiceLightbox = (indiceLightbox + 1) % galeriaFiltrada.length;
  actualizarLightbox();
}

if(lightbox){

  lightboxCerrar.addEventListener("click", cerrarLightbox);
  lightboxPrev.addEventListener("click", lightboxAnterior);
  lightboxNext.addEventListener("click", lightboxSiguiente);

  /* Cerrar al hacer clic fuera de la imagen */
  lightbox.addEventListener("click", (evento) => {
    if(evento.target === lightbox) cerrarLightbox();
  });

  /* Navegación por teclado: Escape, flecha izquierda/derecha */
  document.addEventListener("keydown", (evento) => {
    if(!lightbox.classList.contains("activo")) return;
    if(evento.key === "Escape") cerrarLightbox();
    if(evento.key === "ArrowLeft") lightboxAnterior();
    if(evento.key === "ArrowRight") lightboxSiguiente();
  });

  mostrarGaleria(imagenesGaleria);

}

/* ================================================================
   TESTIMONIOS
   Carrusel automático de tarjetas con calificación en estrellas.
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR TESTIMONIOS AQUÍ
   Copia un bloque { ... } para agregar un testimonio nuevo.
   Campos:
     nombre    -> nombre del cliente
     rol       -> ej. "Estudiante universitario", "Cliente frecuente"
     texto     -> comentario del cliente (sin comillas, se agregan solas)
     estrellas -> número del 1 al 5
     foto      -> ruta de la foto del cliente (CAMBIAR IMAGEN AQUÍ)
---------------------------------------------------------------- */
const testimonios = [
  {
    nombre: "María Fernanda Torres",
    rol: "Estudiante universitaria",
    texto: "Siempre encuentro todo lo que necesito para mis trabajos. La atención es rápida y el precio justo.",
    estrellas: 5,
    foto: "assets/testimonios/maria.jpg"
  },
  {
    nombre: "Carlos Andrés Salazar",
    rol: "Cliente frecuente",
    texto: "Imprimí mi tesis completa aquí, con anillado incluido. Excelente calidad y me la entregaron el mismo día.",
    estrellas: 5,
    foto: "assets/testimonios/carlos.jpg"
  },
  {
    nombre: "Gabriela Núñez",
    rol: "Docente",
    texto: "Compro material didáctico para mis clases cada mes. Siempre tienen variedad y buen precio.",
    estrellas: 4,
    foto: "assets/testimonios/gabriela.jpg"
  },
  {
    nombre: "Jonathan Pérez",
    rol: "Estudiante de colegio",
    texto: "Subí mi archivo desde la página y me confirmaron el total por WhatsApp en minutos. Muy fácil.",
    estrellas: 5,
    foto: "assets/testimonios/jonathan.jpg"
  }
];

const testimoniosPista  = document.getElementById("testimoniosPista");
const testimoniosPuntos = document.getElementById("testimoniosPuntos");

let testimonioActual   = 0;
let intervaloTestimonio = null;

function construirTestimonios(){

  if(!testimoniosPista) return;

  testimoniosPista.innerHTML = testimonios.map(t => `
    <div class="testimonio-tarjeta">
      <div class="testimonio-estrellas">
        ${"<i class=\"fa-solid fa-star\"></i>".repeat(t.estrellas)}${"<i class=\"fa-regular fa-star\"></i>".repeat(5 - t.estrellas)}
      </div>
      <p class="testimonio-texto">${t.texto}</p>
      <div class="testimonio-autor">
        <img src="${t.foto}" alt="${t.nombre}" loading="lazy">
        <div>
          <h4>${t.nombre}</h4>
          <span>${t.rol}</span>
        </div>
      </div>
    </div>
  `).join("");

  testimoniosPuntos.innerHTML = testimonios.map((_, i) =>
    `<button class="punto ${i === 0 ? "activo" : ""}" data-slide="${i}" aria-label="Ver testimonio ${i + 1}"></button>`
  ).join("");

  testimoniosPuntos.querySelectorAll(".punto").forEach(punto => {
    punto.addEventListener("click", () => {
      irATestimonio(parseInt(punto.dataset.slide));
      reiniciarAutoplayTestimonios();
    });
  });

}

function irATestimonio(indice){

  testimonioActual = (indice + testimonios.length) % testimonios.length;
  testimoniosPista.style.transform = `translateX(-${testimonioActual * 100}%)`;

  testimoniosPuntos.querySelectorAll(".punto").forEach((punto, i) => {
    punto.classList.toggle("activo", i === testimonioActual);
  });

}

function siguienteTestimonio(){ irATestimonio(testimonioActual + 1); }

function iniciarAutoplayTestimonios(){
  intervaloTestimonio = setInterval(siguienteTestimonio, 6000);
}

function reiniciarAutoplayTestimonios(){
  clearInterval(intervaloTestimonio);
  iniciarAutoplayTestimonios();
}

if(testimoniosPista){

  construirTestimonios();
  iniciarAutoplayTestimonios();

  const carrusel = document.getElementById("testimoniosCarrusel");
  carrusel.addEventListener("mouseenter", () => clearInterval(intervaloTestimonio));
  carrusel.addEventListener("mouseleave", iniciarAutoplayTestimonios);

}

/* ================================================================
   PREGUNTAS FRECUENTES (acordeón)
   Abre/cierra cada pregunta. Solo una pregunta permanece abierta
   a la vez para mantener la lista ordenada y fácil de leer.
   ================================================================ */
document.querySelectorAll(".faq-item").forEach(item => {

  const pregunta  = item.querySelector(".faq-pregunta");
  const respuesta = item.querySelector(".faq-respuesta");

  pregunta.addEventListener("click", () => {

    const estabaActivo = item.classList.contains("activo");

    /* Cierra todas las preguntas abiertas */
    document.querySelectorAll(".faq-item.activo").forEach(otro => {
      otro.classList.remove("activo");
      otro.querySelector(".faq-pregunta").setAttribute("aria-expanded", "false");
      otro.querySelector(".faq-respuesta").style.maxHeight = null;
    });

    /* Abre la seleccionada, salvo que ya estuviera abierta (toggle) */
    if(!estabaActivo){
      item.classList.add("activo");
      pregunta.setAttribute("aria-expanded", "true");
      respuesta.style.maxHeight = respuesta.scrollHeight + "px";
    }

  });

});

/* ================================================================
   CONTACTO
   Valida el formulario en el navegador (primera barrera, UX rápida)
   y lo envía al backend (/api/contacto), que vuelve a validar,
   sanitiza contra XSS, revisa el honeypot, aplica rate limiting y
   verifica reCAPTCHA v3 — ver server/routes/contacto.js.
   Al confirmarse el envío, se abre también WhatsApp con el mensaje
   ya redactado, igual que antes, para no perder ese flujo.
   ================================================================ */

/* CAMBIAR NÚMERO DE WHATSAPP AQUÍ (usado por el formulario de contacto) */
const CONTACTO_WHATSAPP_NUMERO = "593967245131";

const formContacto          = document.getElementById("formContacto");
const contactoMensajeEstado = document.getElementById("contactoMensajeEstado");

/**
 * Obtiene un token de reCAPTCHA v3 si la librería está cargada
 * (depende de que el sitio tenga configurada su clave pública en
 * el <form data-recaptcha-sitekey="..."> — ver README-CAMBIOS.md).
 * Si no está disponible, se continúa sin token: el backend igual
 * protege el envío con honeypot, rate limiting y validación.
 */
function obtenerTokenRecaptcha(accion) {
  const siteKey = formContacto?.dataset.recaptchaSitekey;
  if (!siteKey || typeof window.grecaptcha === "undefined") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action: accion })
        .then(resolve)
        .catch(() => resolve(null));
    });
  });
}

if (formContacto) {

  formContacto.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const nombre   = document.getElementById("contactoNombre");
    const correo   = document.getElementById("contactoCorreo");
    const telefono = document.getElementById("contactoTelefono");
    const mensaje  = document.getElementById("contactoMensaje");
    const honeypot = document.getElementById("contactoEmpresaWeb");
    const botonEnviar = formContacto.querySelector("button[type='submit']");

    const campos = [nombre, correo, telefono, mensaje];
    let formularioValido = true;

    /* Limpia errores previos y valida que cada campo tenga contenido */
    campos.forEach((campo) => {
      campo.closest(".campo-contacto").classList.remove("campo-error");
      if (!campo.value.trim()) {
        campo.closest(".campo-contacto").classList.add("campo-error");
        formularioValido = false;
      }
    });

    /* Validación simple de formato de correo */
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim());
    if (!correoValido) {
      correo.closest(".campo-contacto").classList.add("campo-error");
      formularioValido = false;
    }

    if (!formularioValido) {
      contactoMensajeEstado.textContent = "Por favor completa todos los campos correctamente.";
      contactoMensajeEstado.style.color = "#E6448A";
      return;
    }

    if (botonEnviar) botonEnviar.disabled = true;
    contactoMensajeEstado.textContent = "Enviando tu mensaje...";
    contactoMensajeEstado.style.color = "";

    try {
      const recaptchaToken = await obtenerTokenRecaptcha("contacto");

      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          correo: correo.value.trim(),
          telefono: telefono.value.trim(),
          mensaje: mensaje.value.trim(),
          empresa_web: honeypot ? honeypot.value : "", // honeypot invisible
          recaptchaToken,
        }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok || !datos.ok) {
        contactoMensajeEstado.textContent =
          datos.error || "No pudimos enviar tu mensaje. Inténtalo de nuevo.";
        contactoMensajeEstado.style.color = "#E6448A";
        return;
      }

      /* Arma el mensaje de WhatsApp con los datos del formulario */
      const textoWhatsapp = encodeURIComponent(
        `Hola PEKE-ARI, mi nombre es ${nombre.value.trim()}.\n` +
        `Correo: ${correo.value.trim()}\n` +
        `Teléfono: ${telefono.value.trim()}\n` +
        `Mensaje: ${mensaje.value.trim()}`
      );

      contactoMensajeEstado.textContent = "¡Listo! Tu mensaje fue enviado. Te llevamos a WhatsApp para confirmar.";
      contactoMensajeEstado.style.color = "#0C8C7D";

      window.open(`https://wa.me/${CONTACTO_WHATSAPP_NUMERO}?text=${textoWhatsapp}`, "_blank");

      formContacto.reset();

    } catch (error) {
      contactoMensajeEstado.textContent = "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
      contactoMensajeEstado.style.color = "#E6448A";
    } finally {
      if (botonEnviar) botonEnviar.disabled = false;
    }

  });

}

/* ================================================================
   FOOTER — Año automático
   Actualiza el año de "Todos los derechos reservados" solo, para
   no tener que cambiarlo a mano cada año.
   ================================================================ */
const footerAnio = document.getElementById("footerAnio");
if(footerAnio){
  footerAnio.textContent = new Date().getFullYear();
}

/* ================================================================
   CONTADOR DE VISITAS
   Registra una visita real en el backend (fecha, hora, navegador,
   sistema operativo e IP anonimizada) cada vez que alguien carga
   el sitio. No bloquea nada si falla (por ejemplo, sin conexión):
   el sitio sigue funcionando con normalidad.
   Ver server/routes/estadisticas.js y estadisticas.html (panel).
   ================================================================ */
fetch("/api/visita", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pagina: window.location.pathname }),
}).catch(() => { /* silencioso: no debe afectar la experiencia del usuario */ });
