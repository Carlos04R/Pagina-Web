/* ================================================================
   PEKE-ARI — ESTADISTICAS.JS
   Consulta GET /api/estadisticas (server/routes/estadisticas.js) y
   dibuja los contadores animados, el gráfico simple de barras (14
   días) y los desgloses de navegador/sistema operativo.
   ================================================================ */

const PREFIERE_MENOS_MOVIMIENTO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Anima un contador numérico desde 0 hasta "meta" (mismo estilo
 * visual que los contadores animados de la página principal).
 */
function animarContador(elemento, meta) {
  const DURACION_MS = 1400;
  const inicio = performance.now();

  if (PREFIERE_MENOS_MOVIMIENTO) {
    elemento.textContent = meta.toLocaleString("es-EC");
    return;
  }

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / DURACION_MS, 1);
    const progresoSuave = 1 - Math.pow(1 - progreso, 3);
    elemento.textContent = Math.floor(progresoSuave * meta).toLocaleString("es-EC");
    if (progreso < 1) requestAnimationFrame(paso);
    else elemento.textContent = meta.toLocaleString("es-EC");
  }

  requestAnimationFrame(paso);
}

/**
 * Dibuja el gráfico simple de barras (CSS puro, sin librerías) con
 * la serie de los últimos 14 días.
 */
function dibujarGrafico(serieDias) {
  const contenedor = document.getElementById("estGrafico");
  if (!contenedor) return;

  const maximo = Math.max(1, ...serieDias.map((d) => d.visitas));

  contenedor.innerHTML = serieDias
    .map((dia) => {
      const alturaPorcentaje = Math.round((dia.visitas / maximo) * 100);
      const etiquetaDia = new Date(`${dia.fecha}T00:00:00Z`)
        .toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit" });
      return `
        <div class="grafico-barra-item">
          <div class="grafico-barra-pista">
            <div class="grafico-barra" style="height:${Math.max(alturaPorcentaje, 3)}%" title="${dia.visitas} visitas"></div>
          </div>
          <span class="grafico-barra-valor">${dia.visitas}</span>
          <span class="grafico-barra-fecha">${etiquetaDia}</span>
        </div>
      `;
    })
    .join("");
}

/**
 * Dibuja una lista de desglose (navegador o sistema operativo)
 * ordenada de mayor a menor cantidad de visitas.
 */
function dibujarDesglose(contenedorId, datos) {
  const lista = document.getElementById(contenedorId);
  if (!lista) return;

  const entradas = Object.entries(datos).sort((a, b) => b[1] - a[1]);
  const total = entradas.reduce((suma, [, cantidad]) => suma + cantidad, 0) || 1;

  if (entradas.length === 0) {
    lista.innerHTML = "<li>Aún no hay datos suficientes.</li>";
    return;
  }

  lista.innerHTML = entradas
    .map(([nombre, cantidad]) => {
      const porcentaje = Math.round((cantidad / total) * 100);
      return `
        <li>
          <span class="estadistica-lista-nombre">${nombre}</span>
          <span class="estadistica-lista-barra"><span style="width:${porcentaje}%"></span></span>
          <span class="estadistica-lista-valor">${cantidad} (${porcentaje}%)</span>
        </li>
      `;
    })
    .join("");
}

async function cargarEstadisticas() {
  const mensajeError = document.getElementById("estMensajeError");

  try {
    const respuesta = await fetch("/api/estadisticas");
    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.ok) {
      throw new Error("Respuesta inválida del servidor");
    }

    animarContador(document.getElementById("estHoy"), datos.hoy);
    animarContador(document.getElementById("estSemana"), datos.semana);
    animarContador(document.getElementById("estMes"), datos.mes);
    animarContador(document.getElementById("estTotal"), datos.total);

    dibujarGrafico(datos.serieDias);
    dibujarDesglose("estNavegadores", datos.porNavegador);
    dibujarDesglose("estSistemas", datos.porSistema);

  } catch (error) {
    if (mensajeError) {
      mensajeError.textContent =
        "No se pudieron cargar las estadísticas. Verifica que el servidor backend (npm start) esté activo.";
      mensajeError.classList.add("visible");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarEstadisticas();

  const footerAnio = document.getElementById("footerAnio");
  if (footerAnio) footerAnio.textContent = new Date().getFullYear();
});
