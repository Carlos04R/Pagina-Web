/* ================================================================
   PEKE-ARI — CALCULADORA.JS
   Calcula un precio referencial de impresión según hojas, color,
   tamaño, tipo de impresión y tipo de papel.
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR PRECIOS AQUÍ
---------------------------------------------------------------- */

/* Precio base por hoja según color e impresión (simple/doble cara) */
const PRECIO_BASE = {
  byn:   { simple: 0.03, doble: 0.05 },
  color: { simple: 0.15, doble: 0.25 }
};

/* Multiplicador de precio según el tamaño del papel */
const MULTIPLICADOR_TAMANO = {
  A4: 1,
  Carta: 1,
  Oficio: 1.1
};

/* Costo extra por hoja según el tipo de papel */
const EXTRA_PAPEL = {
  normal: 0,
  bond: 0.01,
  couche: 0.05,
  cartulina: 0.08
};

/* ----------------------------------------------------------------
   Lógica de cálculo (no es necesario modificar desde aquí)
---------------------------------------------------------------- */
const calcHojas  = document.getElementById("calcHojas");
const calcColor  = document.getElementById("calcColor");
const calcTamano = document.getElementById("calcTamano");
const calcLados  = document.getElementById("calcLados");
const calcPapel  = document.getElementById("calcPapel");
const calcTotal  = document.getElementById("calcTotal");
const calcWhatsapp = document.getElementById("calcWhatsapp");

function calcularTotal(){

  if(!calcHojas) return;

  const hojas = Math.max(1, parseInt(calcHojas.value) || 1);
  const color = calcColor.value;
  const tamano = calcTamano.value;
  const lados = calcLados.value;
  const papel = calcPapel.value;

  const precioHoja = PRECIO_BASE[color][lados] + EXTRA_PAPEL[papel];
  const total = hojas * precioHoja * MULTIPLICADOR_TAMANO[tamano];

  calcTotal.textContent = total.toFixed(2);

  /* Actualiza el botón de WhatsApp con el detalle del pedido */
  if(calcWhatsapp){
    const detalle = `Hola PEKE-ARI, quiero cotizar una impresión: ${hojas} hojas, ${color === "byn" ? "blanco y negro" : "a color"}, tamaño ${tamano}, ${lados === "simple" ? "simple" : "doble"} cara, papel ${papel}. Total estimado: $${total.toFixed(2)}`;
    calcWhatsapp.href = `https://wa.me/593999999999?text=${encodeURIComponent(detalle)}`;
    /* CAMBIAR NÚMERO DE WHATSAPP AQUÍ también en el href de arriba */
  }

}

[calcHojas, calcColor, calcTamano, calcLados, calcPapel].forEach(campo => {
  if(campo) campo.addEventListener("input", calcularTotal);
});

calcularTotal();
