/* ================================================================
   PEKE-ARI — SLIDER.JS
   Slider automático de promociones. Cambia de slide solo, con
   flechas y puntos de navegación manual.
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR PROMOCIONES AQUÍ
   Copia un bloque { ... } para agregar una promoción nueva.
---------------------------------------------------------------- */
const promociones = [

  {
    titulo: "20% de descuento en anillados",
    descripcion: "Válido de lunes a viernes, presentando tu carnet estudiantil.",
    imagen: "assets/promociones/promo-anillados.jpg"
  },
  {
    titulo: "Combo Escolar",
    descripcion: "Cuaderno + estuche de colores + mochila, con precio especial.",
    imagen: "assets/promociones/promo-escolar.jpg"
  },
  {
    titulo: "2x1 en copias los lunes",
    descripcion: "Lleva el doble de copias al mismo precio, todos los lunes.",
    imagen: "assets/promociones/promo-copias.jpg"
  },
  {
    titulo: "Snack + bebida a $1.50",
    descripcion: "El combo perfecto para tu descanso entre clases.",
    imagen: "assets/promociones/promo-snacks.jpg"
  }

];

const sliderPista   = document.getElementById("sliderPista");
const sliderPuntos  = document.getElementById("sliderPuntos");
const sliderPrev    = document.getElementById("sliderPrev");
const sliderNext    = document.getElementById("sliderNext");
const sliderEl      = document.getElementById("slider");

let slideActual = 0;
let intervaloSlider = null;

function construirSlider(){

  if(!sliderPista) return;

  sliderPista.innerHTML = promociones.map(promo => `
    <div class="slide">
      <img src="${promo.imagen}" alt="${promo.titulo}" loading="lazy">
      <div class="slide-texto">
        <h3>${promo.titulo}</h3>
        <p>${promo.descripcion}</p>
      </div>
    </div>
  `).join("");

  sliderPuntos.innerHTML = promociones.map((_, i) =>
    `<button class="punto ${i === 0 ? "activo" : ""}" data-slide="${i}" aria-label="Ir a promoción ${i + 1}"></button>`
  ).join("");

  document.querySelectorAll(".punto").forEach(punto => {
    punto.addEventListener("click", () => {
      irASlide(parseInt(punto.dataset.slide));
      reiniciarAutoplay();
    });
  });

}

function irASlide(indice){

  slideActual = (indice + promociones.length) % promociones.length;

  sliderPista.style.transform = `translateX(-${slideActual * 100}%)`;

  document.querySelectorAll(".punto").forEach((punto, i) => {
    punto.classList.toggle("activo", i === slideActual);
  });

}

function siguienteSlide(){ irASlide(slideActual + 1); }
function anteriorSlide(){ irASlide(slideActual - 1); }

function iniciarAutoplay(){
  intervaloSlider = setInterval(siguienteSlide, 5000);
}

function reiniciarAutoplay(){
  clearInterval(intervaloSlider);
  iniciarAutoplay();
}

if(sliderPista){

  construirSlider();
  iniciarAutoplay();

  sliderNext.addEventListener("click", () => { siguienteSlide(); reiniciarAutoplay(); });
  sliderPrev.addEventListener("click", () => { anteriorSlide(); reiniciarAutoplay(); });

  /* Pausa el autoplay mientras el mouse está sobre el slider */
  sliderEl.addEventListener("mouseenter", () => clearInterval(intervaloSlider));
  sliderEl.addEventListener("mouseleave", iniciarAutoplay);

}
