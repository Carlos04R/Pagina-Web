/* ================================================================
   PEKE-ARI — CATALOGO.JS
   Contiene los productos del catálogo, organizados por categoría,
   y la función que dibuja las tarjetas en pantalla con soporte de
   paginación ("cargar más").
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR CATEGORÍAS AQUÍ
   El texto debe coincidir EXACTO (mayúsculas y tildes incluidas)
   con el "data-categoria" de los botones de filtro en index.html.
---------------------------------------------------------------- */
const CATEGORIAS = [
  "Útiles escolares",
  "Papelería",
  "Copias e Impresiones",
  "Juguetes",
  "Snacks",
  "Manualidades",
  "Otros",
];

/* ----------------------------------------------------------------
   CAMBIAR PRODUCTOS AQUÍ
   Copia un bloque { ... } para agregar un producto nuevo.
   Campos:
     nombre      -> nombre del producto
     descripcion -> texto corto (1 línea aprox.)
     precio      -> número, sin símbolo de $
     categoria   -> debe ser EXACTAMENTE una de CATEGORIAS (arriba)
     imagen      -> ruta de la imagen dentro de img/
     etiqueta    -> "nuevo" | "oferta" | "vendido" | "agotado" | null
     destacado   -> true/false — se usa en el orden "Destacados" y
                    en la sección de Productos Destacados del index
---------------------------------------------------------------- */
const productos = [

  {
    nombre: "Cuaderno Universitario 100 hojas",
    descripcion: "Cuadriculado, pasta dura, ideal para clases y apuntes.",
    precio: 2.50,
    categoria: "Útiles escolares",
    imagen: "img/productos/cuaderno.jpg",
    etiqueta: "nuevo",
    destacado: true,
  },
  {
    nombre: "Mochila Escolar Reforzada",
    descripcion: "Resistente al agua, con compartimento para laptop.",
    precio: 18.00,
    categoria: "Útiles escolares",
    imagen: "img/productos/mochila.jpg",
    etiqueta: "vendido",
    destacado: true,
  },
  {
    nombre: "Estuche de Colores Escolares (24u)",
    descripcion: "Colores intensos, ideales para tareas y proyectos.",
    precio: 4.50,
    categoria: "Útiles escolares",
    imagen: "img/productos/colores.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Calculadora Científica",
    descripcion: "240 funciones, ideal para secundaria y universidad.",
    precio: 15.00,
    categoria: "Útiles escolares",
    imagen: "img/productos/calculadora.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Set de Marcadores Punta Fina (12u)",
    descripcion: "Colores vibrantes, perfectos para apuntes y manualidades.",
    precio: 6.00,
    categoria: "Papelería",
    imagen: "img/productos/marcadores.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Memoria USB 32GB",
    descripcion: "Almacena y transporta tus trabajos e impresiones.",
    precio: 8.00,
    categoria: "Papelería",
    imagen: "img/productos/usb.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Resma de Papel Bond A4",
    descripcion: "500 hojas, 75g, perfecta para impresiones y copias.",
    precio: 4.00,
    categoria: "Copias e Impresiones",
    imagen: "img/productos/resma.jpg",
    etiqueta: "oferta",
    destacado: true,
  },
  {
    nombre: "Anillado de Documentos",
    descripcion: "Anillado plástico resistente para tesis, informes y proyectos.",
    precio: 1.50,
    categoria: "Copias e Impresiones",
    imagen: "img/galeria/anillado.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Plastificado de Documentos",
    descripcion: "Protege tus documentos importantes con acabado brillante.",
    precio: 1.00,
    categoria: "Copias e Impresiones",
    imagen: "img/galeria/plastificado.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Set de Figuras Didácticas",
    descripcion: "Material didáctico y de juego para aprender jugando.",
    precio: 5.00,
    categoria: "Juguetes",
    imagen: "img/galeria/didactico.jpg",
    etiqueta: "nuevo",
    destacado: false,
  },
  {
    nombre: "Kit de Foamy y Silicona",
    descripcion: "10 láminas de foamy + pistola de silicona fría.",
    precio: 5.50,
    categoria: "Manualidades",
    imagen: "img/productos/foamy.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Set de Pinturas Acrílicas",
    descripcion: "12 colores, ideal para manualidades y proyectos de arte.",
    precio: 7.00,
    categoria: "Manualidades",
    imagen: "img/productos/pinturas.jpg",
    etiqueta: "nuevo",
    destacado: true,
  },
  {
    nombre: "Agua Embotellada 500ml",
    descripcion: "Agua natural, fresca y a la mano mientras estudias.",
    precio: 0.75,
    categoria: "Snacks",
    imagen: "img/productos/agua.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Jugo Natural 300ml",
    descripcion: "Variedad de sabores, sin conservantes artificiales.",
    precio: 1.25,
    categoria: "Snacks",
    imagen: "img/productos/jugo.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Papas Fritas Individual",
    descripcion: "El snack perfecto para un descanso entre tareas.",
    precio: 1.00,
    categoria: "Snacks",
    imagen: "img/productos/papas.jpg",
    etiqueta: null,
    destacado: false,
  },
  {
    nombre: "Barra de Cereal",
    descripcion: "Energía rápida y saludable para seguir estudiando.",
    precio: 0.90,
    categoria: "Snacks",
    imagen: "img/productos/cereal.jpg",
    etiqueta: "vendido",
    destacado: true,
  },
  {
    nombre: "Audífonos con Micrófono",
    descripcion: "Ideales para clases virtuales y videollamadas.",
    precio: 9.50,
    categoria: "Otros",
    imagen: "img/productos/audifonos.jpg",
    etiqueta: "oferta",
    destacado: false,
  },

];

/* Texto e icono de cada etiqueta */
const ETIQUETAS = {
  nuevo:   { texto: "Nuevo",       clase: "etiqueta-nuevo"   },
  oferta:  { texto: "Oferta",      clase: "etiqueta-oferta"  },
  vendido: { texto: "Más vendido", clase: "etiqueta-vendido" },
  agotado: { texto: "Agotado",     clase: "etiqueta-agotado" },
};

/* CAMBIAR NÚMERO DE WHATSAPP AQUÍ (usado en el botón "Consultar") */
const WHATSAPP_NUMERO = "593967245131";

/* Cuántos productos se muestran por "página" antes de pulsar
   "Cargar más" (carga progresiva, sin recargar la página). */
const PRODUCTOS_POR_PAGINA = 8;
let productosVisibles = PRODUCTOS_POR_PAGINA;

/**
 * Genera el HTML de una tarjeta de producto individual.
 */
function tarjetaProducto(producto) {
  const etiquetaHTML = producto.etiqueta && ETIQUETAS[producto.etiqueta]
    ? `<span class="etiqueta-producto ${ETIQUETAS[producto.etiqueta].clase}">${ETIQUETAS[producto.etiqueta].texto}</span>`
    : "";

  const agotado = producto.etiqueta === "agotado";
  const mensajeWhatsapp = encodeURIComponent(`Hola PEKE-ARI, quisiera consultar por: ${producto.nombre}`);

  const botonHTML = agotado
    ? `<span class="producto-btn producto-btn-agotado" aria-disabled="true">No disponible</span>`
    : `<a href="https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsapp}"
         target="_blank" rel="noopener" class="producto-btn">
         Consultar
       </a>`;

  return `
    <div class="producto-tarjeta ${agotado ? "producto-agotado" : ""}" data-aos="fade-up">
      ${etiquetaHTML}
      <div class="producto-imagen">
        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" width="400" height="180">
      </div>
      <div class="producto-info">
        <span class="producto-categoria">${producto.categoria}</span>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <div class="producto-footer">
          <span class="producto-precio">$${producto.precio.toFixed(2)}</span>
          ${botonHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Dibuja una lista de productos dentro de #catalogoGrid, respetando
 * la paginación progresiva y mostrando/ocultando el botón "Cargar más".
 * @param {Array} lista - productos ya filtrados/ordenados a mostrar
 * @param {boolean} reiniciarPaginacion - si es true, vuelve a la
 *   primera "página" (se usa cada vez que cambia un filtro/orden)
 */
function mostrarCatalogo(lista, reiniciarPaginacion = true) {

  const grid = document.getElementById("catalogoGrid");
  const vacio = document.getElementById("catalogoVacio");
  const botonCargarMas = document.getElementById("catalogoCargarMas");

  if (reiniciarPaginacion) {
    productosVisibles = PRODUCTOS_POR_PAGINA;
  }

  grid.innerHTML = "";

  if (lista.length === 0) {
    vacio.classList.add("visible");
    if (botonCargarMas) botonCargarMas.style.display = "none";
    return;
  }

  vacio.classList.remove("visible");

  const paginaActual = lista.slice(0, productosVisibles);
  grid.innerHTML = paginaActual.map(tarjetaProducto).join("");

  if (botonCargarMas) {
    botonCargarMas.style.display = productosVisibles < lista.length ? "inline-flex" : "none";
  }

  // Refresca las animaciones AOS de las tarjetas recién insertadas
  if (window.AOS) window.AOS.refreshHard();
}

/* Botón "Cargar más" — carga progresiva sin recargar la página */
document.addEventListener("DOMContentLoaded", () => {
  const botonCargarMas = document.getElementById("catalogoCargarMas");
  if (botonCargarMas) {
    botonCargarMas.addEventListener("click", () => {
      productosVisibles += PRODUCTOS_POR_PAGINA;
      // aplicarFiltros() (definido en buscador.js) vuelve a dibujar
      // la lista ya filtrada/ordenada, sin reiniciar la paginación.
      if (typeof aplicarFiltros === "function") {
        aplicarFiltros(false);
      }
    });
  }

  // Dibuja el catálogo completo al cargar la página
  mostrarCatalogo(productos);
});
