/* ================================================================
   PEKE-ARI — server/routes/estadisticas.js
   Registra cada visita real (día, hora, IP anonimizada, navegador
   y sistema operativo) y expone endpoints para el panel visual de
   estadísticas (contadores de día / semana / mes / total).
   ================================================================ */

import { Router } from "express";
import crypto from "node:crypto";
import { UAParser } from "ua-parser-js";
import { getDB, limpiarVisitasAntiguas } from "../utils/db.js";

const router = Router();

function hashIp(ip) {
  const sal = process.env.IP_HASH_SALT || "sal-por-defecto";
  // sha256 truncado: no es reversible a la IP original (anonimización),
  // pero permite distinguir visitantes únicos aproximados por día.
  return crypto.createHash("sha256").update(`${ip}${sal}`).digest("hex").slice(0, 16);
}

function partesFechaLocal(fecha = new Date()) {
  const iso = fecha.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 19) };
}

function inicioDeSemana(d) {
  const fecha = new Date(d);
  const dia = fecha.getUTCDay(); // 0=domingo
  const diff = (dia === 0 ? -6 : 1) - dia; // lunes como inicio
  fecha.setUTCDate(fecha.getUTCDate() + diff);
  fecha.setUTCHours(0, 0, 0, 0);
  return fecha;
}

/**
 * POST /api/visita
 * El frontend llama a este endpoint una vez por carga de página.
 * Body: { pagina: "/" }
 */
router.post("/visita", async (req, res) => {
  try {
    const ip = req.ip;
    const ua = new UAParser(req.headers["user-agent"] || "");
    const navegador = ua.getBrowser().name || "Desconocido";
    const sistemaOperativo = ua.getOS().name || "Desconocido";
    const dispositivo = ua.getDevice().type || "escritorio";
    const { fecha, hora } = partesFechaLocal();

    const db = await getDB();

    const ipHash = hashIp(ip);
    const yaVisitoHoy = db.data.visitas.some(
      (v) => v.fecha === fecha && v.ipHash === ipHash
    );

    db.data.visitas.push({
      fecha,
      hora,
      ipHash,
      navegador,
      sistemaOperativo,
      dispositivo,
      pagina: typeof req.body?.pagina === "string" ? req.body.pagina.slice(0, 120) : "/",
      esNueva: !yaVisitoHoy,
    });
    db.data.totalHistorico += 1;

    await db.write();

    // Limpieza ocasional (1 de cada ~50 peticiones) para no penalizar
    // el rendimiento de cada visita con una limpieza completa.
    if (Math.random() < 0.02) {
      await limpiarVisitasAntiguas();
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("[Estadísticas] Error registrando visita:", error);
    res.status(500).json({ ok: false });
  }
});

/**
 * GET /api/estadisticas
 * Devuelve los contadores agregados para el panel visual:
 * hoy, semana, mes y total histórico, además de un desglose por
 * navegador/sistema operativo y una serie de los últimos 14 días
 * (para el gráfico simple de barras).
 */
router.get("/estadisticas", async (req, res) => {
  try {
    const db = await getDB();
    const visitas = db.data.visitas;

    const ahora = new Date();
    const hoyStr = ahora.toISOString().slice(0, 10);
    const inicioSemana = inicioDeSemana(ahora);
    const inicioMes = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1));

    let hoy = 0, semana = 0, mes = 0;
    const porNavegador = {};
    const porSistema = {};
    const porDia = {};

    for (const v of visitas) {
      const fechaVisita = new Date(`${v.fecha}T${v.hora}Z`);

      if (v.fecha === hoyStr) hoy++;
      if (fechaVisita >= inicioSemana) semana++;
      if (fechaVisita >= inicioMes) mes++;

      porNavegador[v.navegador] = (porNavegador[v.navegador] || 0) + 1;
      porSistema[v.sistemaOperativo] = (porSistema[v.sistemaOperativo] || 0) + 1;
      porDia[v.fecha] = (porDia[v.fecha] || 0) + 1;
    }

    // Serie de los últimos 14 días (incluyendo hoy), rellenando con
    // 0 los días sin visitas para que el gráfico se vea completo.
    const serieDias = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(ahora);
      d.setUTCDate(d.getUTCDate() - i);
      const clave = d.toISOString().slice(0, 10);
      serieDias.push({ fecha: clave, visitas: porDia[clave] || 0 });
    }

    res.json({
      ok: true,
      hoy,
      semana,
      mes,
      total: db.data.totalHistorico,
      porNavegador,
      porSistema,
      serieDias,
    });
  } catch (error) {
    console.error("[Estadísticas] Error consultando estadísticas:", error);
    res.status(500).json({ ok: false });
  }
});

export default router;
