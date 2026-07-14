/* ================================================================
   PEKE-ARI — BUSCADOR.JS
   Controla el filtro por categoría, la búsqueda instantánea por
   nombre y el ordenamiento (nombre, precio, destacados) dentro del
   catálogo de productos (usa datos de catalogo.js).
   ================================================================ */

let categoriaActiva = "todos";
let textoBusqueda = "";
let ordenActivo = "relevancia";

/**
 * Quita tildes y pasa a minúsculas para que la búsqueda encuentre
 * resultados aunque el usuario no escriba tildes (ej. "papeleria").
 */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Ordena una copia de la lista de productos según el criterio activo.
 * No modifica el arreglo original "productos" de catalogo.js.
 */
function ordenarProductos(lista, criterio) {
  const copia = [...lista];

  switch (criterio) {
    case "nombre-asc":
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    case "nombre-desc":
      return copia.sort((a, b) => b.nombre.localeCompare(a.nombre, "es"));
    case "precio-asc":
      return copia.sort((a, b) => a.precio - b.precio);
    case "precio-desc":
      return copia.sort((a, b) => b.precio - a.precio);
    case "destacados":
      return copia.sort((a, b) => (b.destacado === true) - (a.destacado === true));
    default:
      return copia; // "relevancia": orden original del catálogo
  }
}

/**
 * Aplica el filtro de categoría + el texto de búsqueda + el orden
 * activo y vuelve a dibujar el catálogo.
 * @param {boolean} reiniciarPaginacion - false cuando se llama desde
 *   el botón "Cargar más" (mantiene la cantidad de productos visibles)
 */
function aplicarFiltros(reiniciarPaginacion = true) {

  let resultado = productos;

  if (categoriaActiva !== "todos") {
    resultado = resultado.filter((p) => p.categoria === categoriaActiva);
  }

  if (textoBusqueda.trim() !== "") {
    const busqueda = normalizar(textoBusqueda);
    resultado = resultado.filter((p) => normalizar(p.nombre).includes(busqueda));
  }

  resultado = ordenarProductos(resultado, ordenActivo);

  mostrarCatalogo(resultado, reiniciarPaginacion);
}

/* --- Botones de categoría --- */
document.querySelectorAll(".filtro-btn").forEach((boton) => {

  boton.addEventListener("click", () => {

    document.querySelectorAll(".filtro-btn")
      .forEach((b) => b.classList.remove("activo"));

    boton.classList.add("activo");

    categoriaActiva = boton.dataset.categoria;
    aplicarFiltros();

  });

});

/* --- Buscador dentro del catálogo --- */
const inputCatalogo = document.getElementById("catalogoBuscar");

if (inputCatalogo) {
  inputCatalogo.addEventListener("input", (e) => {
    textoBusqueda = e.target.value;
    aplicarFiltros();
  });
}

/* --- Selector de orden --- */
const selectorOrden = document.getElementById("catalogoOrden");

if (selectorOrden) {
  selectorOrden.addEventListener("change", (e) => {
    ordenActivo = e.target.value;
    aplicarFiltros();
  });
}

/* --- Buscador de la barra de navegación ---
   Escribe el mismo texto en el buscador del catálogo, baja hasta
   la sección y aplica el filtro, para que el usuario pueda
   buscar un producto desde cualquier parte del sitio. */
const inputNav = document.getElementById("navBuscar");

if (inputNav) {
  inputNav.addEventListener("keyup", (e) => {

    textoBusqueda = e.target.value;

    if (inputCatalogo) { inputCatalogo.value = textoBusqueda; }

    aplicarFiltros();

    if (e.key === "Enter" && textoBusqueda.trim() !== "") {
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    }

  });
}
