# PEKE-ARI — Registro de cambios (evolución del sitio)

Este documento explica **qué se cambió, dónde y por qué**, para que puedas
revisar cada mejora con criterio. La identidad visual (colores, tipografía,
animaciones, logotipo) **no se tocó**: todo lo nuevo reutiliza las mismas
variables CSS (`--color-turquesa`, `--color-rosa`, etc.) y los mismos
patrones de diseño que ya existían.

## 0. Qué cambió en la estructura del proyecto

```
PEKE-ARI/
├── public/              ← el sitio (antes era la raíz del proyecto)
│   ├── index.html
│   ├── estadisticas.html   (NUEVO — panel de estadísticas)
│   ├── robots.txt           (NUEVO)
│   ├── sitemap.xml          (NUEVO)
│   ├── css/
│   │   ├── style.css        (sin cambios de diseño)
│   │   ├── mejoras.css      (NUEVO — estilos añadidos)
│   │   └── estadisticas.css (NUEVO — estilos del panel)
│   └── js/
│       ├── catalogo.js      (reescrito: categorías nuevas + etiquetas + paginación)
│       ├── buscador.js      (reescrito: + selector de orden)
│       ├── script.js        (formulario conectado al backend + honeypot + contador de visitas)
│       └── estadisticas.js  (NUEVO)
├── server/               ← NUEVO: backend Node.js/Express
│   ├── index.js
│   ├── routes/           (contacto.js, estadisticas.js)
│   ├── middleware/        (security.js, rateLimit.js)
│   ├── utils/              (db.js, recaptcha.js)
│   └── data/               (estadisticas.json — se crea solo, no se sube a git)
├── package.json
├── .env.example           (copia a ".env" y completa tus claves)
└── .gitignore
```

**Por qué un backend:** varios requisitos (rate limiting real, cabeceras
HTTP, reCAPTCHA v3 verificado en servidor, estadísticas de visitas
persistentes) **no se pueden hacer solo con HTML/CSS/JS estático** — un
sitio 100% estático no puede leer la IP de un visitante, aplicar límites de
envío por IP, ni guardar datos entre visitas de forma confiable. El backend
es deliberadamente pequeño (Express + un archivo JSON), sin base de datos
externa que administrar, para mantener la misma filosofía "simple" del
proyecto original.

**Cómo correrlo:**
```bash
cp .env.example .env      # completa tus claves (opcional en desarrollo)
npm install
npm start                  # sirve el sitio completo en http://localhost:3000
```
El comando `npm start` sirve TODO (frontend + API) desde el mismo servidor
y puerto — no hay que configurar CORS ni levantar dos procesos distintos.

---

## 1. Sistema de seguridad

| Requisito | Dónde | Cómo funciona |
|---|---|---|
| Protección XSS | `server/middleware/security.js` (`limpiarTexto`) + `express-validator` en `routes/contacto.js` | Toda entrada de texto pasa por `sanitize-html` (elimina cualquier etiqueta/JS) antes de procesarse. Además, el navegador ya escapa el HTML mostrado dinámicamente en `catalogo.js`/`script.js` al insertarse como texto interpolado, no como HTML de fuente externa. |
| Validación Frontend + Backend | `js/script.js` (validación inmediata) y `server/routes/contacto.js` (`express-validator`) | El frontend valida para dar respuesta instantánea; el backend **vuelve a validar todo**, porque la validación del navegador se puede saltar fácilmente (DevTools, `curl`, bots). |
| Anti-spam (reCAPTCHA v3) | `server/utils/recaptcha.js`, `js/script.js` | reCAPTCHA v3 no interrumpe al usuario (no hay que hacer clic en semáforos). Se agrega tu clave pública en `<form data-recaptcha-sitekey="...">` (index.html) y la clave secreta en `.env`. Si no configuras claves, el formulario sigue funcionando protegido por honeypot + rate limit (modo degradado, ideal para desarrollo). |
| Rate limiting | `server/middleware/rateLimit.js` | Máx. 5 envíos de contacto cada 10 minutos por IP (configurable en `.env`), y un límite general de 60 peticiones/minuto para el resto de la API. |
| Honeypot invisible | `index.html` (`#contactoEmpresaWeb`, clase `.campo-trampa`) + `routes/contacto.js` | Campo oculto con CSS (no con `display:none`, que algunos bots detectan) que un humano nunca llena. Si llega con contenido, se responde éxito falso sin procesar nada (no delata al bot). |
| Sanitización de entradas | `server/middleware/security.js` | Toda cadena de texto se limpia y se recorta a una longitud máxima antes de usarse. |
| Cabeceras HTTP de seguridad | `server/middleware/security.js` (Helmet) | CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security`, todas configuradas para permitir exactamente los recursos que el sitio ya usaba (Google Fonts, Font Awesome, AOS, Google Maps, WhatsApp) y bloquear todo lo demás. |
| Preparado para HTTPS | `server/index.js` | En producción (`NODE_ENV=production`), redirige automáticamente a HTTPS si detecta que la petición llegó por HTTP (vía `X-Forwarded-Proto`, típico detrás de un proxy/CDN), y `Strict-Transport-Security` fuerza HTTPS en el navegador durante 1 año. |

**Nada de lo anterior elimina funcionalidad existente**: el formulario
sigue abriendo WhatsApp con el mensaje redactado, tal como antes, solo que
ahora primero pasa por todas estas validaciones.

---

## 2. Contador de visitas inteligente

- `server/routes/estadisticas.js` registra cada visita real: fecha, hora,
  navegador y sistema operativo (vía `ua-parser-js`), y una IP
  **anonimizada** (hash SHA-256 con sal — nunca se guarda la IP real).
- `GET /api/estadisticas` devuelve: visitas de **hoy**, de la **semana**
  (lunes a hoy), del **mes** y el **total histórico** (que nunca se borra,
  aunque se limpien visitas antiguas del detalle diario).
- **Panel visual:** `public/estadisticas.html` (enlace discreto en el pie
  de página: "Panel interno"). Muestra los 4 contadores con la misma
  animación de conteo que ya usaba la página principal, un gráfico simple
  de barras (CSS puro, sin librerías externas) de los últimos 14 días, y
  el desglose por navegador y sistema operativo.
- La página tiene `<meta name="robots" content="noindex, nofollow">` y
  está bloqueada en `robots.txt` para que no aparezca en buscadores.

> Nota de privacidad/seguridad: si vas a exponer este panel a más personas
> además de ti, te recomendamos agregarle una contraseña simple (por
> ejemplo, autenticación básica HTTP a nivel de servidor/proxy) — quedó
> fuera de este alcance porque no se pidió un sistema de usuarios, pero es
> la siguiente mejora natural si el panel deja de ser de uso exclusivo tuyo.

---

## 3. Reestructuración del catálogo

- **Categorías nuevas** (`js/catalogo.js`): Útiles escolares, Papelería,
  Copias e Impresiones, Juguetes, Manualidades, Snacks, Otros — cada
  producto pertenece a una sola categoría, y los botones de filtro en
  `index.html` se actualizaron para coincidir exactamente.
- **Filtros dinámicos:** al hacer clic en una categoría, `js/buscador.js`
  vuelve a dibujar el catálogo sin recargar la página (igual que antes,
  ahora con más categorías).
- **Buscador instantáneo:** ya existía; se mejoró para ignorar tildes
  (buscar "papeleria" encuentra "Papelería") y para responder con el
  evento `input` en vez de `keyup` (reacciona también al pegar texto o
  usar el teclado en pantalla de un celular).
- **Ordenar por nombre / precio / destacados:** nuevo selector
  `#catalogoOrden` en la sección de catálogo, resuelto en
  `ordenarProductos()` (`js/buscador.js`).
- **Etiquetas:** Nuevo, Oferta, Más vendido (ya existían) + **Agotado**
  (nueva): un producto agotado se muestra atenuado, con la imagen en
  escala de grises y el botón "Consultar" reemplazado por "No disponible"
  (no se puede hacer clic), en vez de ocultarse — así el cliente sabe que
  existe pero no está disponible por ahora.
- **Paginación / carga progresiva:** el catálogo muestra 8 productos y un
  botón "Cargar más" agrega 8 más cada vez, sin recargar la página
  (`PRODUCTOS_POR_PAGINA` en `catalogo.js`, ajustable).

Para agregar/editar productos, categorías o etiquetas, las instrucciones
del `README.txt` original siguen aplicando — solo cambiaron los nombres
válidos de categoría y se agregó el campo `destacado: true/false`.

---

## 4. Optimización

- **Rendimiento:** `compression` en el backend comprime automáticamente
  HTML/CSS/JS/JSON (gzip) en cada respuesta; cache de 7 días para
  imágenes/CSS/JS estáticos (el HTML no se cachea, para que los cambios
  de catálogo se vean de inmediato).
- **Lazy loading:** se completó en todas las imágenes que no son
  "above the fold" (banner de académicos, logo del footer, slider de
  promociones) — el catálogo, la galería, destacados y testimonios ya
  lo tenían.
- **SEO básico:** se agregó `robots.txt`, `sitemap.xml`, datos
  estructurados `JSON-LD` (tipo `Store`, con horario y dirección) para que
  Google pueda mostrar información enriquecida, y `meta name="referrer"`.
- **Accesibilidad:** utilidad `.visualmente-oculto` para etiquetas
  accesibles pero visualmente ocultas (ej. el `<label>` del selector de
  orden), `aria-hidden` correcto en el honeypot, estados de foco visibles
  (`:focus-visible`) en los nuevos controles del catálogo.
- **Responsive:** los controles nuevos (buscador + orden) se apilan en
  columna en pantallas angostas (`css/mejoras.css`, media query existente).

---

## 5. Calidad del código

- Backend organizado en capas: `routes/` (endpoints), `middleware/`
  (seguridad y límites), `utils/` (base de datos, reCAPTCHA) — cada
  archivo tiene una sola responsabilidad.
- Los estilos nuevos se separaron en `css/mejoras.css` y
  `css/estadisticas.css`, en vez de mezclarlos dentro de `style.css`, para
  que sea evidente qué es original y qué se agregó.
- Se eliminó la lógica duplicada de "abrir WhatsApp desde el formulario":
  ahora vive en un solo lugar (`js/script.js`), reutilizada tanto en el
  camino de éxito como (antes) en el fallback que ya no es necesario.
- Todo el backend usa **ES Modules** (`import`/`export`), igual que el
  frontend, para mantener un solo estilo de código en todo el proyecto.

---

## 6. Lo que se dejó intacto a propósito

- Colores, tipografía, logotipo, animaciones (AOS, loader, cursor
  personalizado, parallax, contadores) — sin cambios.
- `js/uploader.js` (subida de archivos) se dejó como interfaz visual
  únicamente, igual que en el proyecto original, ya que no formaba parte
  del alcance solicitado (formulario de **contacto**). Si más adelante
  quieres conectarlo a un backend real (para recibir archivos), se puede
  extender `server/` con un endpoint de subida usando `multer` y las
  mismas protecciones (validación de tipo/tamaño, rate limiting).
- La calculadora de impresión, el horario dinámico, el slider de
  promociones y la galería con lightbox funcionan exactamente igual que
  antes.

---

## 7. Antes de publicar en producción

1. Completa `.env` con tus claves reales (reCAPTCHA, sal para IPs,
   correo de destino).
2. Cambia `IP_HASH_SALT` por un valor propio y secreto.
3. Sirve el sitio detrás de HTTPS (Let's Encrypt, Cloudflare, o el
   certificado de tu hosting) — el backend ya está preparado para
   redirigir y forzar HTTPS.
4. Conecta el envío real de correo en `server/routes/contacto.js` (hay un
   comentario exacto donde agregarlo) con el proveedor que prefieras
   (Nodemailer + SMTP, Resend, SendGrid, etc.).
5. Si vas a compartir el panel de estadísticas con más personas, agrégale
   autenticación (ver nota en la sección 2).

---

## 8. Autenticación del panel de estadísticas (actualización)

Se agregó un login para que solo tú (u otras personas autorizadas) puedan
ver `estadisticas.html` y `GET /api/estadisticas`. **No se tocó ningún
diseño, funcionalidad ni lógica existente** — solo se agregó una capa de
protección alrededor de lo que ya había.

### Archivos NUEVOS

| Archivo | Para qué sirve |
|---|---|
| `server/middleware/auth.js` | Middleware reutilizable `requiereSesion`: si no hay sesión iniciada, redirige a `/login.html` (páginas) o responde 401 en JSON (API). |
| `server/routes/auth.js` | Endpoints `POST /api/login`, `POST /api/logout` y `GET /api/sesion`. Compara usuario/contraseña con `crypto.timingSafeEqual` (tiempo constante, evita ataques de timing) contra los valores de `.env`. |
| `public/login.html` | Página de inicio de sesión, con la misma identidad visual del sitio (mismos colores, tipografía, header). |
| `public/js/login.js` | Envía el formulario a `/api/login`, muestra errores sin usar `alert()`, botón de mostrar/ocultar contraseña. |
| `public/css/login.css` | Estilos exclusivos del login (tarjeta, animación de entrada, compatible con modo oscuro automáticamente vía las variables `--color-*`). |

### Archivos MODIFICADOS (y por qué)

| Archivo | Qué cambió |
|---|---|
| `server/index.js` | Se agregó `express-session` (cookie httpOnly, `secure` en producción), se montó `rutasAuth`, y se agregó una ruta explícita `GET /estadisticas.html` protegida con `requiereSesion` **antes** de `express.static` (para poder interceptarla). |
| `server/routes/estadisticas.js` | Se agregó `requiereSesion` **solo** al `GET /estadisticas`. `POST /visita` se dejó exactamente igual y sigue siendo público a propósito: cualquier visitante debe poder "contar" como visita; solo la **consulta** del panel está restringida. |
| `server/middleware/rateLimit.js` | Se agregó `limitadorLogin` (máx. 8 intentos/15 min por IP) para evitar fuerza bruta contra la contraseña. |
| `public/estadisticas.html` | Se agregó el botón "Cerrar sesión" junto al de "Volver al sitio" (mismo estilo `.btn.btn-secundario` que ya existía). |
| `public/js/estadisticas.js` | Se agregó el manejador del botón "Cerrar sesión" (llama a `POST /api/logout`) y una redirección a `/login.html` si `GET /api/estadisticas` responde 401 (sesión expirada mientras el panel estaba abierto). |
| `.env.example` | Se agregaron `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET`. |
| `public/robots.txt` | Se agregó `Disallow: /login.html` (igual que ya existía para `estadisticas.html`). |
| `package.json` | Nueva dependencia: `express-session`. |

### Dependencia nueva a instalar

```bash
npm install express-session
```

Es la única dependencia nueva. **No se usó `bcrypt`** a propósito: como pediste,
las credenciales viven directamente en `.env` (no hay una base de datos de
usuarios con contraseñas que haya que hashear); en su lugar, la comparación
usa `crypto.timingSafeEqual` (parte de Node.js, sin instalar nada extra)
para que un atacante no pueda deducir la contraseña midiendo cuánto tarda
cada intento fallido.

### Cómo probarlo

1. Agrega a tu `.env`: `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET`
   (usa una contraseña y un secreto propios, no los de ejemplo).
2. `npm install && npm start`.
3. Entra a `http://localhost:3000/estadisticas.html` directamente → te debe
   redirigir a `/login.html` (todavía no iniciaste sesión).
4. Inicia sesión con tus credenciales → te lleva al panel.
5. Prueba "Cerrar sesión" → te regresa al login, y si intentas volver a
   `/estadisticas.html` te vuelve a pedir credenciales.

### Nota sobre `MemoryStore` (sesiones)

Por simplicidad se usa el almacén de sesiones por defecto de
`express-session` (en memoria del propio proceso). Es perfecto para este
caso (un solo administrador, un solo proceso de servidor). Si en el futuro
el sitio corre en varias instancias a la vez (por ejemplo, balanceo de
carga con más de un proceso Node), habría que cambiar a un almacén
compartido como `connect-redis` para que la sesión sea válida en todas —
no es necesario para el tamaño actual del proyecto.
