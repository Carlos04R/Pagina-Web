/* ================================================================
   PEKE-ARI — HORARIO.JS
   Calcula si el local está abierto o cerrado en este momento,
   según el horario configurado, y actualiza el badge de
   "Estado del Local" automáticamente.
   ================================================================ */

/* ----------------------------------------------------------------
   CAMBIAR HORARIOS AQUÍ
   Un bloque por día de la semana (0 = Domingo ... 6 = Sábado).
   Usa formato 24 horas: "HH:MM".
   Para marcar un día como cerrado todo el día, deja abre y cierra
   en null, como está configurado para el Domingo.
---------------------------------------------------------------- */
const horarios = {
  0: { abre: null,    cierra: null    }, // Domingo (cerrado)
  1: { abre: "08:00", cierra: "19:00" }, // Lunes
  2: { abre: "08:00", cierra: "19:00" }, // Martes
  3: { abre: "08:00", cierra: "19:00" }, // Miércoles
  4: { abre: "08:00", cierra: "19:00" }, // Jueves
  5: { abre: "08:00", cierra: "19:00" }, // Viernes
  6: { abre: "09:00", cierra: "14:00" }  // Sábado
};

const NOMBRES_DIA = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

const estadoBadge   = document.getElementById("estadoBadge");
const estadoPunto   = document.getElementById("estadoPunto");
const estadoTexto   = document.getElementById("estadoTexto");
const estadoDetalle = document.getElementById("estadoDetalle");

/**
 * Convierte "HH:MM" a minutos desde medianoche, para comparar horas fácil.
 */
function horaAMinutos(hora){
  const [h, m] = hora.split(":").map(Number);
  return (h * 60) + m;
}

/**
 * Revisa el horario configurado contra la hora actual y actualiza
 * el badge (🟢 Abierto / 🔴 Cerrado) junto con el texto de detalle.
 */
function actualizarEstadoLocal(){

  if(!estadoBadge) return;

  const ahora        = new Date();
  const diaActual     = ahora.getDay();
  const minutosAhora  = (ahora.getHours() * 60) + ahora.getMinutes();
  const horarioHoy    = horarios[diaActual];

  const abiertoAhora = horarioHoy.abre !== null &&
    minutosAhora >= horaAMinutos(horarioHoy.abre) &&
    minutosAhora <  horaAMinutos(horarioHoy.cierra);

  estadoBadge.classList.toggle("abierto", abiertoAhora);
  estadoBadge.classList.toggle("cerrado", !abiertoAhora);

  if(abiertoAhora){
    estadoTexto.textContent = "🟢 Abierto ahora";
    estadoDetalle.textContent = `Cerramos hoy a las ${formatearHora(horarioHoy.cierra)}.`;
  } else {
    estadoTexto.textContent = "🔴 Cerrado ahora";
    estadoDetalle.textContent = obtenerTextoProximaApertura(diaActual, minutosAhora);
  }

  /* Resalta el día actual dentro de la lista de horarios visible */
  document.querySelectorAll(".estado-dia").forEach(fila => {
    const dias = fila.dataset.dia.split(",").map(Number);
    fila.classList.toggle("dia-actual", dias.includes(diaActual));
  });

}

/**
 * Convierte "HH:MM" (24h) a un formato más amigable, ej: "7:00 p. m."
 */
function formatearHora(hora24){
  const [h, m] = hora24.split(":").map(Number);
  const periodo = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

/**
 * Busca el próximo día con horario de atención (empezando por hoy)
 * y arma el texto "Abrimos el día X a las HH:MM".
 */
function obtenerTextoProximaApertura(diaActual, minutosAhora){

  for(let i = 0; i < 7; i++){

    const dia = (diaActual + i) % 7;
    const horario = horarios[dia];

    if(!horario.abre) continue;

    /* Si es hoy pero ya cerramos, buscamos el siguiente día disponible */
    if(i === 0 && minutosAhora >= horaAMinutos(horario.cierra)) continue;

    const cuando = i === 0 ? "Hoy" : (i === 1 ? "Mañana" : NOMBRES_DIA[dia]);
    return `${cuando} abrimos a las ${formatearHora(horario.abre)}.`;

  }

  return "Consulta nuestro horario de atención.";

}

if(estadoBadge){
  actualizarEstadoLocal();
  /* Vuelve a revisar cada minuto, por si el estado cambia mientras el usuario navega */
  setInterval(actualizarEstadoLocal, 60000);
}
