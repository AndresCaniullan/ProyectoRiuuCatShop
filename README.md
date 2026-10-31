# ProyectoRiuuCatShop

## Cómo ejecutarlo

1. Clonar o descargar el repositorio.
2. Abrir la carpeta en Visual Studio Code.
3. Abrir index.html con la extensión *Live Server*.

También se puede ver online en el link del sitio publicado.

## Cómo se guarda el carrito

El carrito se guarda en localStorage, con la clave carrito, como un arreglo de objetos con solo el id y la cantidad de cada producto:

json
[ { "id": 1, "cantidad": 2 }, { "id": 4, "cantidad": 1 } ]


El nombre, el precio y la imagen se buscan siempre en data/productos.js, así los datos no se repiten ni quedan desactualizados.

---

## Procedencia de imágenes y recursos

| Recurso | Archivos | Procedencia |
|---|---|---|
| Imágenes de categorías | img/categoria-*.jpeg | Generadas con inteligencia artificial (Gemini) |
| Logo | img/logo-RiuuCatShop.png | Generado con inteligencia artificial (Gemini) |
| Íconos de lupa y carrito | img/icono-lupa.png, img/icono-carrito.png | Generados con inteligencia artificial (Gemini) |
| Imágenes de ofertas | img/oferta-* | Generadas con inteligencia artificial (Gemini) |
| Imágenes de publicidad | img/publicidad-* | Generadas con inteligencia artificial (Gemini) |
| Sugerencia de La Anónima | Enlace e imágenes de la publicidad | Tomados del sitio de La Anónima, usados solo con fines publicitarios y educativos |

Los precios, marcas y descripciones de los productos son de ejemplo, para el proyecto académico.

## Uso de inteligencia artificial

Según las pautas de la consigna, declaramos que usamos inteligencia artificial como asistente durante el desarrollo. Todo el código fue probado, lo comprendemos y podemos explicarlo y modificarlo.

*Daniela Albera (carrito de compras y estilos del carrito):*
- Usé *Claude* para analizar el estado del proyecto frente a la consigna y organizar la división de tareas.
- Generé con Claude, a partir de instrucciones propias, el código del carrito en app.js (agregar al carrito, mostrar el carrito, cambiar cantidades, eliminar y calcular totales) y los cambios en pages/carrito.html.
- Usé Claude para corregir estilos en estilos.css: diseño adaptable del carrito, margen lateral del contenido y el buscador en pantallas chicas.
- Probé cada cambio en el navegador, en tamaño computadora y celular, antes de subirlo.

*Andrés Caniullan (catálogo, búsqueda, categorías y productos relacionados):*
- Usó *Claude* como asistente para desarrollar el buscador, el filtro por categorías, los productos relacionados y la sugerencia de La Anónima.
- Probó cada funcionalidad en el navegador antes de subirla.

*Imágenes:*
- El logo, los íconos y las imágenes de categorías, ofertas y publicidad fueron generados con *Gemini*.
- Las imágenes y el enlace de la sugerencia provienen del sitio de La Anónima.