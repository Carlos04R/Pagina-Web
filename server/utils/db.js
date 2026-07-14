/* ================================================================
   PEKE-ARI — server/utils/db.js
   Pequeña capa de persistencia basada en un archivo JSON (lowdb).
   No requiere instalar ni administrar un servidor de base de datos
   aparte, lo cual encaja con el espíritu "sin frameworks pesados"
   del proyecto original, pero ahora con datos reales y persistentes
   entre reinicios del servidor.

   Si el proyecto crece mucho (miles de visitas/día), esto se puede
   reemplazar por SQLite/Postgres sin tocar el resto del backend:
   solo hay que reescribir las funciones de este archivo.
   ================================================================ */

import { JSONFilePreset } from "lowdb/node";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "estadisticas.json");

const DEFAULT_DATA = {
  visitas: [], // { fecha: "2026-07-13", hora: "14:32:10", ipHash, navegador, sistemaOperativo, dispositivo, pagina, esNueva }
  mensajesContacto: [], // metadatos de envíos (sin datos sensibles) para detectar abuso
  totalHistorico: 0, // contador acumulado que NUNCA se borra, aunque se limpien visitas viejas
};

let dbInstance = null;

/**
 * Devuelve una instancia única (singleton) de la base de datos,
 * creando el archivo con los valores por defecto si no existe.
 */
export async function getDB() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset(DB_PATH, DEFAULT_DATA);
  }
  return dbInstance;
}

/**
 * Elimina visitas con más de `dias` días de antigüedad para que el
 * archivo no crezca indefinidamente. Se conserva igualmente el
 * contador histórico total (ver estadisticas.js), así que esta
 * limpieza no afecta el "Total histórico".
 */
export async function limpiarVisitasAntiguas(dias = 400) {
  const db = await getDB();
  const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
  db.data.visitas = db.data.visitas.filter(
    (v) => new Date(`${v.fecha}T${v.hora}`).getTime() >= limite
  );
  await db.write();
}
