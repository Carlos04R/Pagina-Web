================================================================
 PEKE-ARI — README
 Guía paso a paso para editar el sitio (sin saber programar)
================================================================

El FRONTEND (lo que ves en el navegador) sigue siendo HTML, CSS y
JavaScript puro, editable con Sublime Text o cualquier editor de
texto, tal como antes — está dentro de la carpeta "public/".

Ahora el proyecto también incluye un pequeño BACKEND (server/) que
se encarga de la seguridad del formulario de contacto y de las
estadísticas de visitas reales. No necesitas tocar el backend para
editar textos, productos, imágenes o colores: esa parte sigue
siendo tan simple como abrir un archivo y cambiar texto. El
backend solo hace falta ejecutarlo (con "npm start") para que el
formulario y el contador de visitas funcionen — ver
README-CAMBIOS.md para el detalle completo.

Estructura de carpetas esperada:

  PEKE-ARI/
  ├── public/
  │   ├── index.html
  │   ├── css/
  │   │   ├── style.css
  │   ├── responsive.css
  │   ├── darkmode.css
  │   └── animations.css      (opcional, ver nota al final)
  ├── js/
  │   ├── script.js
  │   ├── catalogo.js
  │   ├── buscador.js
  │   ├── calculadora.js
  │   ├── darkmode.js
  │   ├── slider.js
  │   ├── horario.js
  │   └── uploader.js
  ├── img/
  ├── video/
  └── fonts/

Regla general: casi todo lo editable está marcado en el código con
un comentario que empieza con "CAMBIAR ... AQUÍ". Busca esa palabra
(Ctrl+F / Cmd+F) en el archivo indicado en cada sección de abajo.


----------------------------------------------------------------
 1. LOGO
----------------------------------------------------------------
Archivo: index.html
Busca: "CAMBIAR LOGO AQUÍ" (aparece 4 veces: navbar, hero, loader
y footer).

  <img src="img/logo/logo.png" alt="Logotipo PEKE-ARI">

Solo cambia la ruta dentro de src="..." por el archivo de tu logo,
guardado dentro de img/logo/. Usa una versión en blanco para el
hero/loader/footer (sobre fondos oscuros) y una versión normal para
la navbar cuando ya hiciste scroll.


----------------------------------------------------------------
 2. VIDEO DEL HERO
----------------------------------------------------------------
Archivo: index.html
Busca: "CAMBIAR VIDEO AQUÍ"

  <video class="hero-video" autoplay muted loop playsinline poster="img/banners/hero-poster.jpg">
    <source src="video/hero-fondo.mp4" type="video/mp4">
  </video>

Reemplaza video/hero-fondo.mp4 por tu propio video (recomendado:
MP4, menos de 10-15 MB, resolución 1920x1080, sin sonido ya que el
video está en "muted"). El "poster" es la imagen que se ve mientras
el video carga; cámbiala también en img/banners/.


----------------------------------------------------------------
 3. PRODUCTOS DEL CATÁLOGO
----------------------------------------------------------------
Archivo: js/catalogo.js
Busca: "CAMBIAR PRODUCTOS AQUÍ" — es el arreglo "productos".

Cada producto es un bloque así:

  {
    nombre: "Cuaderno Universitario 100 hojas",
    descripcion: "Cuadriculado, pasta dura, ideal para clases.",
    precio: 2.50,
    categoria: "Papelería",
    imagen: "img/productos/cuaderno.jpg",
    etiqueta: "nuevo"
  },

Para agregar un producto nuevo: copia un bloque completo (desde la
{ hasta la } con su coma), pégalo antes del corchete final "]" y
edita sus datos.

  - precio       -> número, sin el símbolo $ (ejemplo: 4.50)
  - categoria    -> debe ser EXACTAMENTE una de estas (mayúsculas
                    y tildes incluidas), o el filtro no lo va a
                    encontrar:
                    "Útiles escolares", "Papelería",
                    "Copias e Impresiones", "Juguetes",
                    "Manualidades", "Snacks", "Otros"
  - imagen       -> ruta del archivo dentro de img/productos/
  - etiqueta     -> uno de estos 5 valores:
                    "nuevo"   -> insignia 🔥 Nuevo
                    "oferta"  -> insignia 💲 Oferta
                    "vendido" -> insignia ⭐ Más vendido
                    "agotado" -> producto atenuado, sin botón de compra
                    null      -> sin insignia (sin comillas)
  - destacado    -> true / false (sin comillas). Se usa para el
                    orden "Destacados primero" del catálogo.

Para borrar un producto, elimina su bloque completo { ... } (con su
coma). El buscador (js/buscador.js) y los "Productos Destacados"
(los que tienen etiqueta) del index.html se actualizan solos, leen
esta misma lista — no hay que tocarlos aparte.


----------------------------------------------------------------
 4. CATEGORÍAS DEL CATÁLOGO
----------------------------------------------------------------
Archivos: index.html (botones de filtro) + js/catalogo.js (dato
"categoria" de cada producto).

Si quieres agregar una categoría nueva (por ejemplo "Oficina"):

  1. En index.html, busca la sección <!-- CATÁLOGO --> y copia un
     botón de filtro existente:
       <button class="filtro-btn" data-filtro="Papelería">Papelería</button>
     Cámbialo a:
       <button class="filtro-btn" data-filtro="Oficina">Oficina</button>

  2. En js/catalogo.js, usa categoria: "Oficina" en los productos
     que correspondan a esa categoría nueva.

El texto de data-filtro debe coincidir EXACTO con el texto de
categoria en catalogo.js.


----------------------------------------------------------------
 5. PRECIOS DE LA CALCULADORA DE IMPRESIÓN
----------------------------------------------------------------
Archivo: js/calculadora.js
Busca: "CAMBIAR PRECIOS AQUÍ"

  const PRECIO_BASE = {
    byn:   { simple: 0.03, doble: 0.05 },
    color: { simple: 0.15, doble: 0.25 }
  };

  const MULTIPLICADOR_TAMANO = {
    A4: 1,
    Carta: 1,
    Oficio: 1.1
  };

  const EXTRA_PAPEL = {
    normal: 0,
    bond: 0.01,
    couche: 0.05,
    cartulina: 0.08
  };

  - PRECIO_BASE es el precio por HOJA según si es blanco/negro o
    color, y si es a una cara (simple) o dos caras (doble).
  - MULTIPLICADOR_TAMANO multiplica el precio final según el
    tamaño del papel (1 = sin cambio, 1.1 = 10% más caro, etc.)
  - EXTRA_PAPEL se suma por hoja según el tipo de papel elegido.

No es necesario tocar nada más abajo de ese bloque; el cálculo
(hojas x precio x multiplicador) se hace solo.


----------------------------------------------------------------
 6. NÚMERO DE WHATSAPP
----------------------------------------------------------------
Aparece en VARIOS archivos, cámbialo en todos para que quede
consistente. Formato: código de país + número, SIN el signo "+" y
sin espacios (ejemplo Ecuador: 593999999999).

  - index.html      -> busca "593999999999" (botón flotante, hero,
                        sección académicos, formulario de contacto)
  - js/calculadora.js -> línea del botón calcWhatsapp.href
  - Footer (index.html) -> ícono de WhatsApp en redes sociales

Sugerencia: usa buscar y reemplazar en todo el proyecto (en
Sublime Text: Find > Find in Files) buscando "593999999999" y
reemplazando por tu número real.


----------------------------------------------------------------
 7. HORARIOS (y el badge 🟢 Abierto / 🔴 Cerrado)
----------------------------------------------------------------
Archivo: js/horario.js
Busca: "CAMBIAR HORARIOS AQUÍ" — es el objeto "horarios".

  const horarios = {
    0: { abre: null,    cierra: null    }, // Domingo (cerrado)
    1: { abre: "08:00", cierra: "19:00" }, // Lunes
    2: { abre: "08:00", cierra: "19:00" }, // Martes
    3: { abre: "08:00", cierra: "19:00" }, // Miércoles
    4: { abre: "08:00", cierra: "19:00" }, // Jueves
    5: { abre: "08:00", cierra: "19:00" }, // Viernes
    6: { abre: "09:00", cierra: "14:00" }  // Sábado
  };

Cada número (0 al 6) es un día, empezando en Domingo = 0. Usa
formato 24 horas ("HH:MM"). Para un día cerrado todo el día, deja
abre y cierra en null (como el Domingo).

Este mismo horario mueve automáticamente el badge "🟢 Abierto /
🔴 Cerrado" de la sección "Estado del Local" — no hay que tocar
nada más para que funcione.

IMPORTANTE: el horario que se muestra como texto fijo en la
sección de Contacto y en el Footer (index.html) NO se actualiza
solo — es solo texto. Si cambias horarios.js, actualiza también
ese texto a mano, buscando "CAMBIAR HORARIO AQUÍ" en index.html.


----------------------------------------------------------------
 8. COLORES DEL SITIO (y modo oscuro)
----------------------------------------------------------------
Archivo: css/style.css
Busca: "CAMBIAR COLORES AQUÍ" (muy al inicio del archivo, dentro
de :root).

  --color-turquesa: #14B8A6;
  --color-rosa:      #FF5DA2;
  --color-negro:     #14181C;
  ...

Cambia el código de color (ejemplo #14B8A6) por el que quieras;
como son variables, el cambio se aplica en todo el sitio
automáticamente (botones, íconos, insignias, etc.)

Si además cambias los colores de marca, revisa css/darkmode.css:
ahí están los mismos colores pero reasignados para el modo oscuro
(fondo, texto, tarjetas). No es obligatorio tocarlo, pero si tu
turquesa/rosa cambian mucho, ajusta también ese archivo para que
combinen en modo oscuro.


----------------------------------------------------------------
 9. PROMOCIONES (slider automático)
----------------------------------------------------------------
Archivo: js/slider.js
Busca: "CAMBIAR PROMOCIONES AQUÍ" — es el arreglo "promociones".

  {
    titulo: "20% de descuento en anillados",
    descripcion: "Válido de lunes a viernes, presentando tu carnet.",
    imagen: "img/banners/promo-anillados.jpg"
  },

Igual que los productos: copia un bloque para agregar una
promoción, o bórralo para quitarla. Las imágenes van en
img/banners/. El slider cambia solo cada 5 segundos, se puede
mover con flechas/puntos, y se pausa al pasar el mouse encima.


----------------------------------------------------------------
 10. GALERÍA
----------------------------------------------------------------
Archivo: js/script.js
Busca: "CAMBIAR IMAGEN AQUÍ" cerca del arreglo "imagenesGaleria".

  { titulo: "Nuestro local", categoria: "Local", imagen: "img/galeria/local-1.jpg" },

  - categoria debe ser EXACTAMENTE una de: "Local", "Productos",
    "Trabajos", "Eventos" (son los botones de filtro de la
    galería). Si agregas una categoría nueva, agrega también su
    botón de filtro en index.html (sección Galería), copiando uno
    existente.
  - Las imágenes van en img/galeria/. Al hacer clic se abren en
    grande (lightbox), con flechas para pasar entre fotos.


----------------------------------------------------------------
 11. SERVICIOS (tarjetas de Copias, Impresiones, etc.)
----------------------------------------------------------------
Archivo: index.html
Busca la sección <section id="servicios">.

Cada servicio es una tarjeta:

  <div class="servicio-tarjeta" data-aos="fade-up">
    <div class="servicio-icono"><i class="fa-solid fa-copy"></i></div>
    <h3>Copias</h3>
    <p>Copias a blanco y negro o a color, en el momento y al mejor precio.</p>
    <a href="#contacto" class="servicio-link">Solicitar <i class="fa-solid fa-arrow-right"></i></a>
  </div>

Para agregar un servicio nuevo, copia un bloque completo
(<div class="servicio-tarjeta">...</div>) y pégalo dentro de
<div class="servicios-grid">, cambiando el título, texto e ícono.

Para cambiar el ícono, reemplaza la clase "fa-solid fa-copy" por
otro ícono de Font Awesome (puedes buscar iconos gratis en
https://fontawesome.com/search?o=r&m=free ). El formato es:
fa-solid fa-NOMBRE-DEL-ICONO.


----------------------------------------------------------------
 12. MAPA (Google Maps)
----------------------------------------------------------------
Archivo: index.html
Busca: "CAMBIAR UBICACIÓN AQUÍ" (sección Contacto).

  <iframe src="https://www.google.com/maps?q=Naranjito,Guayas,Ecuador&output=embed" ...>

Para cambiar la ubicación:
  1. Abre Google Maps en tu navegador y busca tu dirección exacta.
  2. Copia esa dirección (o las coordenadas) tal cual.
  3. Reemplaza el texto después de "q=" en el link de arriba por tu
     dirección/coordenadas, manteniendo "&output=embed" al final.

Ejemplo con coordenadas:
  https://www.google.com/maps?q=-2.213,-79.469&output=embed


----------------------------------------------------------------
 13. REDES SOCIALES, CORREO Y DIRECCIÓN
----------------------------------------------------------------
Archivo: index.html

  - Redes sociales -> busca "CAMBIAR REDES SOCIALES AQUÍ" (footer).
    Cambia cada href="https://facebook.com" etc. por el link real
    de cada red. Si no usas alguna red, borra ese <a>...</a>
    completo.
  - Correo -> busca "CAMBIAR CORREO AQUÍ" (aparece en Contacto y
    puede repetirse en el footer).
  - Dirección -> busca "CAMBIAR DIRECCIÓN AQUÍ" (Contacto y footer).


----------------------------------------------------------------
 14. FORMULARIOS (contacto y subida de archivos)
----------------------------------------------------------------
El formulario de CONTACTO ahora SÍ está conectado a un backend
real (server/routes/contacto.js): valida los datos, revisa que no
sea spam (honeypot + reCAPTCHA v3 opcional + límite de envíos) y
luego abre WhatsApp con el mensaje, igual que antes. Para que
funcione, el servidor debe estar corriendo ("npm start") — ver
README-CAMBIOS.md para instrucciones completas y cómo configurar
tus propias claves de reCAPTCHA.

  - Formulario de subida de archivos -> js/uploader.js. Sigue
    siendo solo interfaz (arrastrar y soltar, lista de archivos,
    validaciones de tipo) y NO sube nada a un servidor todavía,
    tal como en la versión original. Si más adelante quieres
    conectarlo, se puede agregar un endpoint en server/ (por
    ejemplo con la librería "multer") con las mismas protecciones
    que ya tiene el formulario de contacto.


----------------------------------------------------------------
 15. MODO OSCURO
----------------------------------------------------------------
Archivos: js/darkmode.js + css/darkmode.css

El botón de la navbar (ícono de luna/sol) alterna el tema y lo
recuerda automáticamente (localStorage) para la próxima visita. No
necesitas tocar nada para que funcione. Si quieres ajustar los
colores del tema oscuro, edita las variables al inicio de
css/darkmode.css (mismo sistema de --variables que style.css).


----------------------------------------------------------------
 16. NOTA SOBRE css/animations.css
----------------------------------------------------------------
El index.html enlaza un archivo css/animations.css opcional para
separar animaciones @keyframes en un archivo aparte. Por ahora las
animaciones (loader, whatsapp, estado del local, etc.) están
incluidas directamente dentro de css/style.css, así que puedes
crear un css/animations.css vacío (o simplemente quitar esa línea
del <head> si prefieres no usarlo) sin que nada se rompa.


----------------------------------------------------------------
 CONSEJOS FINALES
----------------------------------------------------------------
  - Después de cualquier cambio, corre "npm start" y abre
    http://localhost:3000 en el navegador (no abras index.html
    directamente con doble clic: el catálogo, el formulario y el
    contador de visitas necesitan que el servidor esté corriendo).
    Revisa la consola (F12 > Console) por si aparece algún error
    en rojo — casi siempre es una coma o comilla faltante en un
    arreglo de productos/promociones/galería.
  - Haz cambios de a poco y guarda seguido, así es más fácil
    encontrar el error si algo deja de funcionar.
  - Todas las imágenes deben existir realmente en las carpetas
    img/... con el mismo nombre que pusiste en el código, o no
    se van a mostrar.

================================================================
 Fin del README — PEKE-ARI
================================================================
