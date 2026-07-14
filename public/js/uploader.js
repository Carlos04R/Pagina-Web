/* ================================================================
   PEKE-ARI — UPLOADER.JS
   Interfaz de subida de archivos. NO envía nada a ningún servidor;
   solo muestra en pantalla los archivos seleccionados.
   ================================================================ */

const inputArchivos = document.getElementById("inputArchivos");
const listaArchivos = document.getElementById("listaArchivos");
const formSubida    = document.getElementById("formSubida");
const subidaMensaje = document.getElementById("subidaMensaje");
const subidaZona    = document.getElementById("subidaZona");

const ICONOS_ARCHIVO = {
  pdf: "fa-file-pdf",
  doc: "fa-file-word",
  docx: "fa-file-word",
  xls: "fa-file-excel",
  xlsx: "fa-file-excel",
  ppt: "fa-file-powerpoint",
  pptx: "fa-file-powerpoint",
  jpg: "fa-file-image",
  jpeg: "fa-file-image",
  png: "fa-file-image"
};

function icono(nombreArchivo){
  const extension = nombreArchivo.split(".").pop().toLowerCase();
  return ICONOS_ARCHIVO[extension] || "fa-file";
}

function mostrarArchivos(archivos){

  listaArchivos.innerHTML = "";

  Array.from(archivos).forEach(archivo => {
    listaArchivos.innerHTML += `
      <li>
        <i class="fa-solid ${icono(archivo.name)}"></i>
        <span>${archivo.name}</span>
        <small>${(archivo.size / 1024).toFixed(0)} KB</small>
      </li>
    `;
  });

}

if(inputArchivos){
  inputArchivos.addEventListener("change", (e) => {
    mostrarArchivos(e.target.files);
  });
}

/* Arrastrar y soltar archivos sobre la zona de subida */
if(subidaZona){

  ["dragover", "dragleave", "drop"].forEach(evento => {
    subidaZona.addEventListener(evento, (e) => e.preventDefault());
  });

  subidaZona.addEventListener("dragover", () => {
    subidaZona.classList.add("arrastrando");
  });

  subidaZona.addEventListener("dragleave", () => {
    subidaZona.classList.remove("arrastrando");
  });

  subidaZona.addEventListener("drop", (e) => {
    subidaZona.classList.remove("arrastrando");
    inputArchivos.files = e.dataTransfer.files;
    mostrarArchivos(e.dataTransfer.files);
  });

}

/* Envío del formulario (solo interfaz, sin backend) */
if(formSubida){

  formSubida.addEventListener("submit", (e) => {

    e.preventDefault();

    if(!inputArchivos.files.length){
      subidaMensaje.textContent = "Selecciona al menos un archivo antes de enviar.";
      subidaMensaje.classList.add("visible", "error");
      return;
    }

    /* ============================================================
       CONECTAR SERVIDOR AQUÍ
       Este proyecto no incluye backend. Para procesar los archivos
       de verdad, reemplaza este bloque por una petición real, por
       ejemplo:

       const datos = new FormData(formSubida);
       fetch("https://tu-servidor.com/subir", {
         method: "POST",
         body: datos
       })
       .then(respuesta => respuesta.json())
       .then(resultado => { ... })
       .catch(error => { ... });
    ============================================================ */

    subidaMensaje.textContent = "¡Listo! Tus archivos quedaron seleccionados. Te contactaremos por WhatsApp para confirmar la impresión.";
    subidaMensaje.classList.remove("error");
    subidaMensaje.classList.add("visible");

  });

}
