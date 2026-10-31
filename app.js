// ============================ Inicialización ============================
// Al cargar el DOM se ejecutan las cuatro funciones principales. Cada una
// revisa primero si los elementos que necesita existen en la página actual
// (index, producto o carrito); si no los encuentra, no hace nada. Por eso
// este mismo app.js puede incluirse igual en las tres páginas.

// document.addEventListener("DOMContentLoaded", () => {
//   renderizarOfertas();
//   actualizarContadorCarrito();
//   activarFinalizarCompra();
//   renderizarDetalleProducto();
//   renderizarPublicidad();
// });
document.addEventListener("DOMContentLoaded", () => {
  activarBuscador();
  activarCategorias();
  activarMenuMovil();
  renderizarOfertas();
  renderizarCatalogo();   //  nueva
  activarFlechasCarrusel();
  activarRotacionAutomatica();
  actualizarContadorCarrito();
  activarFinalizarCompra();
  renderizarDetalleProducto();
  renderizarRelacionados(producto);   //  nueva
  renderizarPublicidad();
});
// ============================ Carrito ============================

// Suma las cantidades del carrito guardado en localStorage y actualiza el
// número que se ve junto al ícono del carrito en el header (las 3 páginas).
function actualizarContadorCarrito() {
  const contador = document.querySelector("#contador-carrito");
  if (!contador) return;
  let total = 0;
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    total = carrito.reduce((suma, item) => suma + (item.cantidad || 1), 0);
  } catch {}
  contador.textContent = total;
}

// Maneja el botón "Finalizar compra" de carrito.html: si no hay productos
// avisa, si ya hay una sesión guardada completa la compra directo, y si no
// hay sesión abre un diálogo de login simulado (solo guarda el email, nunca
// la contraseña) antes de completarla.
function activarFinalizarCompra() {
  const botonFinalizar = document.querySelector("#btn-finalizar");
  const dialogo = document.querySelector("#dialogo-login");
  if (!botonFinalizar || !dialogo) return;

  const formulario = document.querySelector("#form-login");
  const campoEmail = document.querySelector("#login-email");
  const campoClave = document.querySelector("#login-clave");
  const errorLogin = document.querySelector("#login-error");
  const botonCancelar = document.querySelector("#btn-cancelar-login");

  const CLAVE_SESION = "sesion";
  const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const LARGO_MINIMO_CLAVE = 6;

  // Hay algo para comprar si localStorage tiene productos, o (mientras se
  // prueba con datos de ejemplo) si el HTML ya trae filas estáticas.
  function hayProductosEnCarrito() {
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (Array.isArray(carrito) && carrito.length > 0) return true;
    } catch {}
    return document.querySelectorAll("#lista-carrito .item-carrito").length > 0;
  }

  // Muestra un aviso en #mensaje-compra (ej. "carrito vacío", "gracias por tu compra").
  function mostrarMensaje(texto) {
    const mensaje = document.querySelector("#mensaje-compra");
    mensaje.textContent = texto;
    mensaje.hidden = false;
  }

  // Muestra un error dentro del diálogo de login y devuelve el foco al campo con el problema.
  function mostrarError(texto, campo) {
    errorLogin.textContent = texto;
    errorLogin.hidden = false;
    campo.focus();
  }

  // Limpia el formulario de login y cierra el diálogo.
  function cerrarDialogo() {
    errorLogin.hidden = true;
    formulario.reset();
    dialogo.close();
  }

  // Vacía el carrito (localStorage y la lista en pantalla) y muestra el mensaje de éxito.
  function completarCompra() {
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    document.querySelector("#lista-carrito").replaceChildren();
    document.querySelector("#cantidad-total").textContent = "0";
    document.querySelector("#total-compra").textContent = "$0";
    document.querySelector("#carrito-vacio").hidden = false;
    mostrarMensaje("¡Gracias por tu compra!");
  }

  botonFinalizar.addEventListener("click", () => {
    if (!hayProductosEnCarrito()) {
      mostrarMensaje("Tu carrito está vacío. Agregá productos para finalizar la compra.");
      return;
    }
    if (localStorage.getItem(CLAVE_SESION)) {
      completarCompra();
      return;
    }
    dialogo.showModal();
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const email = campoEmail.value.trim();
    const clave = campoClave.value;

    if (!EXPRESION_EMAIL.test(email)) {
      mostrarError("Ingresá un correo electrónico válido.", campoEmail);
      return;
    }
    if (clave.length < LARGO_MINIMO_CLAVE) {
      mostrarError(`La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`, campoClave);
      return;
    }

    // Solo se guarda el correo: la contraseña nunca se almacena.
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ email }));
    cerrarDialogo();
    completarCompra();
  });

  botonCancelar.addEventListener("click", cerrarDialogo);
}

// ============================ Carrito: agregar, mostrar y modificar (Daniela) ============================
// En localStorage, con la clave "carrito", se guarda un arreglo con solo el id y la cantidad
// de cada producto, por ejemplo: [ { id: 1, cantidad: 2 }, { id: 4, cantidad: 1 } ].
// El nombre, el precio y la imagen se buscan siempre en el arreglo productos (data/productos.js).

// Esta sección tiene su propio DOMContentLoaded para no modificar el bloque de inicialización de arriba.
document.addEventListener("DOMContentLoaded", () => { // espera a que el HTML de la página esté cargado
  activarAgregarAlCarrito(); // activa +, − y "Agregar al carrito" (solo actúa en producto.html)
  renderizarCarrito(); // dibuja la lista del carrito (solo actúa en carrito.html)
}); // fin del DOMContentLoaded de esta sección

// Lee el carrito guardado en localStorage y lo devuelve como arreglo.
function leerCarrito() { // función sin parámetros que devuelve el carrito
  try { // intenta leer; si el dato guardado está roto, salta al catch
    const carrito = JSON.parse(localStorage.getItem("carrito")); // convierte el texto guardado en arreglo
    return Array.isArray(carrito) ? carrito : []; // si es un arreglo lo devuelve, si no (ej. null) devuelve uno vacío
  } catch { // si JSON.parse falló
    return []; // devuelve un carrito vacío para que la página no se rompa
  } // fin del try/catch
} // fin de leerCarrito

// Guarda el carrito en localStorage y actualiza el número del ícono del header.
function guardarCarrito(carrito) { // recibe el arreglo del carrito
  localStorage.setItem("carrito", JSON.stringify(carrito)); // lo convierte a texto y lo guarda con la clave "carrito"
  actualizarContadorCarrito(); // reusa la función que ya existía para refrescar el contador
} // fin de guardarCarrito

// Devuelve el precio que se cobra: si el producto tiene precioFinal (con descuento) usa ese, si no usa precio.
function precioDeProducto(producto) { // recibe un objeto producto
  return producto.precioFinal ?? producto.precio; // ?? elige el de la derecha solo si precioFinal no existe
} // fin de precioDeProducto

// Convierte un número en texto con formato de precio argentino, ej. 18500 → "$ 18.500".
function formatearPrecio(valor) { // recibe un número
  return `$ ${Number(valor).toLocaleString("es-AR")}`; // mismo formato que usan las tarjetas de ofertas
} // fin de formatearPrecio

// ---------- Página de detalle (producto.html) ----------

// Activa los botones +, − y "Agregar al carrito" que arma renderizarDetalleProducto().
function activarAgregarAlCarrito() { // función sin parámetros
  const contenedor = document.getElementById("detalle-producto"); // busca la sección del detalle
  if (!contenedor) return; // si no existe, no estamos en producto.html: no hace nada
  const botonAgregar = contenedor.querySelector(".btn-agregar"); // botón "Agregar al carrito"
  if (!botonAgregar) return; // si no está, es porque el producto no se encontró: no hace nada
  const botonSumar = contenedor.querySelector(".btn-sumar"); // botón +
  const botonRestar = contenedor.querySelector(".btn-restar"); // botón −
  const valorCantidad = contenedor.querySelector(".cantidad-valor"); // el número que se ve entre + y −
  const idProducto = parseInt(new URLSearchParams(window.location.search).get("id")); // id que viene en la URL (?id=N), pasado a número
  let cantidad = 1; // cantidad elegida; arranca en 1

  botonSumar.addEventListener("click", () => { // cuando se hace clic en +
    cantidad++; // suma 1
    valorCantidad.textContent = cantidad; // muestra el nuevo número
  }); // fin del evento de +

  botonRestar.addEventListener("click", () => { // cuando se hace clic en −
    if (cantidad > 1) { // solo resta si queda al menos 1 (no permite 0 ni negativos)
      cantidad--; // resta 1
      valorCantidad.textContent = cantidad; // muestra el nuevo número
    } // fin del if
  }); // fin del evento de −

  botonAgregar.addEventListener("click", () => { // cuando se hace clic en "Agregar al carrito"
    const carrito = leerCarrito(); // trae el carrito guardado
    const existente = carrito.find((item) => item.id === idProducto); // busca si este producto ya estaba
    if (existente) { // si ya estaba en el carrito
      existente.cantidad += cantidad; // le suma la cantidad elegida
    } else { // si no estaba
      carrito.push({ id: idProducto, cantidad: cantidad }); // lo agrega con su id y cantidad
    } // fin del if/else
    guardarCarrito(carrito); // guarda el carrito y actualiza el contador del header
  }); // fin del evento de "Agregar al carrito"
} // fin de activarAgregarAlCarrito

// ---------- Página del carrito (carrito.html) ----------

// Dibuja la lista del carrito, el resumen y el mensaje de carrito vacío.
function renderizarCarrito() { // función sin parámetros
  const lista = document.querySelector("#lista-carrito"); // el <ul> donde van las filas
  if (!lista) return; // si no existe, no estamos en carrito.html: no hace nada
  const mensajeVacio = document.querySelector("#carrito-vacio"); // párrafo "Tu carrito está vacío"
  const cantidadTotal = document.querySelector("#cantidad-total"); // número de "Cantidad de productos"
  const totalCompra = document.querySelector("#total-compra"); // número de "Total"

  const carrito = leerCarrito(); // trae el carrito guardado
  lista.replaceChildren(); // borra las filas anteriores para dibujar de cero
  let sumaCantidades = 0; // acumulador de unidades
  let sumaTotal = 0; // acumulador de plata

  carrito.forEach((item) => { // recorre cada producto guardado en el carrito
    const producto = productos.find((p) => p.id === item.id); // busca sus datos completos en productos.js
    if (!producto) return; // si ese id ya no existe en productos.js, lo saltea
    const subtotal = precioDeProducto(producto) * item.cantidad; // precio × cantidad
    sumaCantidades += item.cantidad; // suma las unidades al total de unidades
    sumaTotal += subtotal; // suma el subtotal al total a pagar
    lista.append(crearFilaCarrito(producto, item.cantidad, subtotal)); // arma la fila y la agrega a la lista
  }); // fin del forEach

  mensajeVacio.hidden = sumaCantidades > 0; // oculta el mensaje si hay productos; lo muestra si no hay
  cantidadTotal.textContent = sumaCantidades; // muestra la cantidad total de unidades
  totalCompra.textContent = formatearPrecio(sumaTotal); // muestra el total con formato de precio
} // fin de renderizarCarrito

// Crea y devuelve un <li> con la fila de un producto (misma estructura y clases que tenía el HTML de ejemplo).
function crearFilaCarrito(producto, cantidad, subtotal) { // recibe el producto, su cantidad y su subtotal
  const fila = document.createElement("li"); // crea el <li>
  fila.className = "item-carrito"; // clase para que tome los estilos del CSS
  fila.dataset.id = producto.id; // agrega data-id="N" para identificar la fila

  const imagen = document.createElement("img"); // crea la imagen
  imagen.className = "item-imagen"; // clase de estilos
  imagen.src = `.${producto.imagen}`; // "./img/..." pasa a "../img/..." porque carrito.html está dentro de pages/
  imagen.alt = producto.nombre; // texto alternativo con el nombre real
  imagen.width = 100; // ancho de la imagen
  imagen.height = 100; // alto de la imagen

  const nombre = document.createElement("p"); // crea el párrafo del nombre
  nombre.className = "item-nombre"; // clase de estilos
  nombre.textContent = producto.nombre; // escribe el nombre del producto

  const grupoCantidad = document.createElement("div"); // contenedor de −, número y +
  grupoCantidad.className = "item-cantidad"; // clase de estilos
  grupoCantidad.setAttribute("role", "group"); // accesibilidad: indica que los 3 elementos van juntos
  grupoCantidad.setAttribute("aria-label", `Cantidad de ${producto.nombre}`); // accesibilidad: nombre del grupo

  const botonRestar = document.createElement("button"); // crea el botón −
  botonRestar.type = "button"; // botón común (no envía formularios)
  botonRestar.className = "btn-restar"; // clase de estilos
  botonRestar.textContent = "-"; // texto visible
  botonRestar.setAttribute("aria-label", `Disminuir cantidad de ${producto.nombre}`); // accesibilidad
  botonRestar.addEventListener("click", () => cambiarCantidad(producto.id, -1)); // al hacer clic resta 1

  const valorCantidad = document.createElement("span"); // crea el número de cantidad
  valorCantidad.className = "cantidad-valor"; // clase de estilos
  valorCantidad.textContent = cantidad; // muestra la cantidad guardada

  const botonSumar = document.createElement("button"); // crea el botón +
  botonSumar.type = "button"; // botón común
  botonSumar.className = "btn-sumar"; // clase de estilos
  botonSumar.textContent = "+"; // texto visible
  botonSumar.setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`); // accesibilidad
  botonSumar.addEventListener("click", () => cambiarCantidad(producto.id, 1)); // al hacer clic suma 1

  grupoCantidad.append(botonRestar, valorCantidad, botonSumar); // mete −, número y + dentro del grupo

  const textoSubtotal = document.createElement("p"); // crea el párrafo del subtotal
  textoSubtotal.className = "item-subtotal"; // clase de estilos
  textoSubtotal.textContent = `Subtotal: ${formatearPrecio(subtotal)}`; // escribe el subtotal con formato

  const botonEliminar = document.createElement("button"); // crea el botón X
  botonEliminar.type = "button"; // botón común
  botonEliminar.className = "btn-eliminar"; // clase de estilos
  botonEliminar.textContent = "X"; // texto visible
  botonEliminar.setAttribute("aria-label", `Eliminar ${producto.nombre} del carrito`); // accesibilidad
  botonEliminar.addEventListener("click", () => eliminarDelCarrito(producto.id)); // al hacer clic lo elimina

  fila.append(imagen, nombre, grupoCantidad, textoSubtotal, botonEliminar); // arma la fila con todas las partes
  return fila; // devuelve la fila lista para agregar a la lista
} // fin de crearFilaCarrito

// Suma o resta unidades a un producto del carrito (cambio vale 1 o -1) y vuelve a dibujar.
function cambiarCantidad(idProducto, cambio) { // recibe el id del producto y +1 o -1
  const carrito = leerCarrito(); // trae el carrito guardado
  const item = carrito.find((i) => i.id === idProducto); // busca ese producto en el carrito
  if (!item) return; // si no está, no hace nada
  if (item.cantidad + cambio < 1) return; // no deja bajar de 1 (para sacarlo se usa la X)
  item.cantidad += cambio; // aplica el cambio
  guardarCarrito(carrito); // guarda y actualiza el contador del header
  renderizarCarrito(); // vuelve a dibujar la lista y los totales
} // fin de cambiarCantidad

// Saca un producto del carrito y vuelve a dibujar.
function eliminarDelCarrito(idProducto) { // recibe el id del producto a sacar
  const carrito = leerCarrito().filter((i) => i.id !== idProducto); // se queda con todos menos ese
  guardarCarrito(carrito); // guarda y actualiza el contador del header
  renderizarCarrito(); // vuelve a dibujar la lista y los totales
} // fin de eliminarDelCarrito


// ============================ Carrusel ============================
// Se activan UNA sola vez al cargar la página (ver el DOMContentLoaded de arriba).
// El ancho de las tarjetas se mide en cada clic, porque el contenido cambia al filtrar.

// Cuánto hay que desplazar el carrusel: el ancho de 3 tarjetas (+ el espacio entre ellas).
function calcularDesplazamiento(contenedor) {
  const tarjeta = contenedor.querySelector(".tarjeta-producto");
  if (!tarjeta) return 0;
  return (tarjeta.offsetWidth + 16) * 3; // 16 = gap del CSS
}

function activarFlechasCarrusel() {
  const contenedor = document.querySelector("#contenedor-ofertas");
  const botonAnterior = document.querySelector(".carrusel-anterior");
  const botonSiguiente = document.querySelector(".carrusel-siguiente");
  if (!contenedor || !botonAnterior || !botonSiguiente) return;

  botonAnterior.addEventListener("click", () => {
    contenedor.scrollLeft -= calcularDesplazamiento(contenedor);
  });
  botonSiguiente.addEventListener("click", () => {
    contenedor.scrollLeft += calcularDesplazamiento(contenedor);
  });
}

function activarRotacionAutomatica() {
  const contenedor = document.querySelector("#contenedor-ofertas");
  if (!contenedor) return;

  setInterval(() => {
    // Si llegó al final, vuelve al inicio
    if (contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth) {
      contenedor.scrollLeft = 0;
    } else {
      contenedor.scrollLeft += calcularDesplazamiento(contenedor);
    }
  }, 4000); // cada 4 segundos
}






















// ============================ Catálogo (ofertas, filtros y búsqueda) ============================

// // Estado actual de los filtros. renderizarOfertas() lee este objeto cada vez que se dibuja.
// const filtros = { categoria: null, texto: "" };

// // Nombre "lindo" de cada categoría, para usarlo como título del catálogo.
// const NOMBRES_CATEGORIA = {
//   alimento: "Alimento",
//   sanitario: "Sanitario",
//   juguetes: "Juguetes",
//   accesorios: "Accesorios",
//   vestimenta: "Vestimenta"
// };

// // Pasa a minúsculas y quita tildes, así "camisa" encuentra "Camisá" y "BUZO" encuentra "buzo".
// function normalizarTexto(texto) {
//   return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
// }

// // Devuelve los productos que corresponde mostrar según los filtros activos.
// // - Sin filtros: solo los productos en oferta (el carrusel de la portada).
// // - Con categoría y/o texto: todos los productos del catálogo que coincidan.
// function obtenerProductosAMostrar() {
//   const texto = normalizarTexto(filtros.texto);
//   const hayFiltros = filtros.categoria !== null || texto !== "";

//   return productos.filter((producto) => {
//     if (producto.categoria === "publicidad") return false; // la publicidad nunca es un producto a la venta
//     if (!hayFiltros) return producto.oferta;
//     const coincideCategoria = filtros.categoria === null || producto.categoria === filtros.categoria;
//     const coincideTexto = texto === "" || normalizarTexto(producto.nombre).includes(texto);
//     return coincideCategoria && coincideTexto;
//   });
// }

// // Texto del título (<h2>) según lo que se esté mostrando.
// function obtenerTituloCatalogo() {
//   const texto = filtros.texto.trim();
//   if (texto && filtros.categoria) {
//     return `Resultados para "${texto}" en ${NOMBRES_CATEGORIA[filtros.categoria]}`;
//   }
//   if (texto) return `Resultados para "${texto}"`;
//   if (filtros.categoria) return NOMBRES_CATEGORIA[filtros.categoria];
//   return "Ofertas destacadas";
// }

// // Pinta las tarjetas de producto dentro de #contenedor-ofertas (index.html),
// // según los filtros activos (ver obtenerProductosAMostrar).
// function renderizarOfertas() {
//   const contenedor = document.querySelector("#contenedor-ofertas");
//   if (!contenedor) return;
//   if (typeof productos === "undefined" || !Array.isArray(productos)) return;

//   document.querySelector("#titulo-catalogo").textContent = obtenerTituloCatalogo();

//   const lista = obtenerProductosAMostrar();
//   contenedor.replaceChildren();
//   contenedor.scrollLeft = 0; // vuelve al principio del carrusel

//   if (lista.length === 0) {
//     const vacio = document.createElement("p");
//     vacio.textContent = "No se encontraron productos.";
//     contenedor.append(vacio);
//     return;
//   }

//   lista.forEach((producto) => {
//     const tarjeta = document.createElement("a");
//     tarjeta.className = "tarjeta-producto";
//     tarjeta.href = `pages/producto.html?id=${producto.id}`;

//     const imagen = document.createElement("img");
//     imagen.src = producto.imagen;
//     imagen.alt = producto.nombre;

//     const nombre = document.createElement("h3");
//     nombre.textContent = producto.nombre;

//     // El precio que se muestra es el mismo que se cobra en el carrito (precioFinal si hay descuento).
//     const precio = document.createElement("p");
//     precio.className = "precio";
//     if (producto.precioFinal !== undefined) {
//       const precioOriginal = document.createElement("del"); // <del>: precio anterior tachado
//       precioOriginal.textContent = formatearPrecio(producto.precio);
//       const etiqueta = document.createElement("span");
//       etiqueta.className = "etiqueta-descuento";
//       etiqueta.textContent = `-${producto.descuento}%`;
//       precio.append(precioOriginal, ` ${formatearPrecio(precioDeProducto(producto))} `, etiqueta);
//     } else {
//       precio.textContent = formatearPrecio(precioDeProducto(producto));
//     }

//     tarjeta.append(imagen, nombre, precio);
//     contenedor.append(tarjeta);
//   });
// }

// ============================ Catálogo (ofertas y resultados) ============================

// Estado actual de los filtros. renderizarCatalogo() lee este objeto cada vez que se dibuja.
const filtros = { categoria: null, texto: "" };

// Nombre "lindo" de cada categoría, para usarlo como título de los resultados.
const NOMBRES_CATEGORIA = {
  alimento: "Alimento",
  sanitario: "Sanitario",
  juguetes: "Juguetes",
  accesorios: "Accesorios",
  vestimenta: "Vestimenta"
};

// Pasa a minúsculas y quita tildes, así "camisa" encuentra "Camisá" y "BUZO" encuentra "buzo".
function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Crea la tarjeta <a> de un producto. La usan el carrusel de ofertas y la lista de resultados.
function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("a");
  tarjeta.className = "tarjeta-producto";
  tarjeta.href = `pages/producto.html?id=${producto.id}`;

  const imagen = document.createElement("img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;

  const nombre = document.createElement("h3");
  nombre.textContent = producto.nombre;

  // El precio que se muestra es el mismo que se cobra en el carrito (precioFinal si hay descuento).
  const precio = document.createElement("p");
  precio.className = "precio";
  if (producto.precioFinal !== undefined) {
    const precioOriginal = document.createElement("del"); // <del>: precio anterior tachado
    precioOriginal.textContent = formatearPrecio(producto.precio);
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-descuento";
    etiqueta.textContent = `-${producto.descuento}%`;
    precio.append(precioOriginal, ` ${formatearPrecio(precioDeProducto(producto))} `, etiqueta);
  } else {
    precio.textContent = formatearPrecio(precioDeProducto(producto));
  }

  tarjeta.append(imagen, nombre, precio);
  return tarjeta;
}

// Pinta el carrusel de #contenedor-ofertas (index.html): siempre muestra solo los productos en oferta.
function renderizarOfertas() {
  const contenedor = document.querySelector("#contenedor-ofertas");
  if (!contenedor) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  const ofertas = productos.filter((producto) => producto.oferta);
  contenedor.replaceChildren();

  if (ofertas.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "No hay productos en oferta.";
    contenedor.append(vacio);
    return;
  }

  ofertas.forEach((producto) => contenedor.append(crearTarjetaProducto(producto)));
}

// Devuelve los productos que coinciden con la categoría y/o el texto buscado.
function obtenerProductosFiltrados() {
  const texto = normalizarTexto(filtros.texto);

  return productos.filter((producto) => {
    if (producto.categoria === "publicidad") return false; // la publicidad nunca es un producto a la venta
    const coincideCategoria = filtros.categoria === null || producto.categoria === filtros.categoria;
    const coincideTexto = texto === "" || normalizarTexto(producto.nombre).includes(texto);
    return coincideCategoria && coincideTexto;
  });
}

// Título de la sección de resultados según los filtros activos.
function obtenerTituloCatalogo() {
  const texto = filtros.texto.trim();
  if (texto && filtros.categoria) {
    return `Resultados para "${texto}" en ${NOMBRES_CATEGORIA[filtros.categoria]}`;
  }
  if (texto) return `Resultados para "${texto}"`;
  return NOMBRES_CATEGORIA[filtros.categoria];
}

// Dibuja la lista de resultados debajo del carrusel. Si no hay ningún filtro activo, oculta la sección.
function renderizarCatalogo() {
  const seccion = document.querySelector("#seccion-catalogo");
  const lista = document.querySelector("#lista-catalogo");
  if (!seccion || !lista) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  const hayFiltros = filtros.categoria !== null || normalizarTexto(filtros.texto) !== "";
  seccion.hidden = !hayFiltros; // hidden = true oculta la sección
  if (!hayFiltros) return;

  document.querySelector("#titulo-catalogo").textContent = obtenerTituloCatalogo();
  lista.replaceChildren();

  const resultados = obtenerProductosFiltrados();
  if (resultados.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "No se encontraron productos.";
    lista.append(vacio);
    return;
  }

  resultados.forEach((producto) => {
    const item = document.createElement("li");
    item.append(crearTarjetaProducto(producto));
    lista.append(item);
  });
}













// ============================ Filtros, buscador y menú móvil (Andrés) ============================

// Buscador del header. Funciona en las 3 páginas:
// - En index.html filtra el catálogo mientras se escribe (input) y al enviar (submit).
// - En producto.html y carrito.html no hay catálogo, así que manda a index.html?buscar=texto.
// function activarBuscador() {
//   const formulario = document.querySelector(".buscador");
//   const campo = document.querySelector("#buscador");
//   if (!formulario || !campo) return;
//   const estamosEnIndex = document.querySelector("#contenedor-ofertas") !== null;

//   // Si venimos de otra página con ?buscar=..., arrancamos ya filtrado.
//   if (estamosEnIndex) {
//     const buscado = new URLSearchParams(window.location.search).get("buscar");
//     if (buscado) {
//       campo.value = buscado;
//       filtros.texto = buscado;
//     }
//   }

//   formulario.addEventListener("submit", (evento) => {
//     evento.preventDefault(); // evita que la página se recargue
//     if (!estamosEnIndex) {
//       window.location.href = `../index.html?buscar=${encodeURIComponent(campo.value.trim())}`;
//       return;
//     }
//     filtros.texto = campo.value;
//     renderizarOfertas();
//   });

//   if (estamosEnIndex) {
//     campo.addEventListener("input", () => {
//       filtros.texto = campo.value;
//       renderizarOfertas();
//     });
//   }
// }

function activarBuscador() {
  const formulario = document.querySelector(".buscador");
  const campo = document.querySelector("#buscador");
  if (!formulario || !campo) return;

  const estamosEnIndex = document.querySelector("#contenedor-ofertas") !== null;

  // Si venimos de otra página con ?buscar=..., arrancamos ya filtrado.
  if (estamosEnIndex) {
    const buscado = new URLSearchParams(window.location.search).get("buscar");
    if (buscado) {
      campo.value = buscado;
      filtros.texto = buscado;
    }
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault(); // evita que la página se recargue
    if (!estamosEnIndex) {
      window.location.href = `../index.html?buscar=${encodeURIComponent(campo.value.trim())}`;
      return;
    }
    filtros.texto = campo.value;
    renderizarCatalogo();
    document.querySelector("#seccion-catalogo").scrollIntoView({ behavior: "smooth" });
  });

  if (estamosEnIndex) {
    campo.addEventListener("input", () => {
      filtros.texto = campo.value;
      renderizarCatalogo();
    });
  }
}







// Marca visualmente la categoría elegida (y desmarca las demás).
function marcarCategoriaActiva() {
  document.querySelectorAll(".categoria[data-categoria]").forEach((enlace) => {
    const esLaActiva = enlace.dataset.categoria === filtros.categoria;
    enlace.classList.toggle("activa", esLaActiva);
    if (esLaActiva) {
      enlace.setAttribute("aria-current", "true");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });
}

// Clic en una categoría: filtra el catálogo. Un segundo clic en la misma categoría quita el filtro.

// function activarCategorias() {
//   const enlaces = document.querySelectorAll(".categoria[data-categoria]");
//   if (enlaces.length === 0) return; // producto.html y carrito.html no tienen categorías

//   enlaces.forEach((enlace) => {
//     enlace.addEventListener("click", (evento) => {
//       evento.preventDefault(); // el href="#" no debe saltar al inicio de la página
//       const elegida = enlace.dataset.categoria;
//       filtros.categoria = filtros.categoria === elegida ? null : elegida;
//       marcarCategoriaActiva();
//       renderizarOfertas();
//       cerrarMenuMovil();
//       document.querySelector(".carrusel-ofertas").scrollIntoView({ behavior: "smooth" });
//     });
//   });
// }
function activarCategorias() {
  const enlaces = document.querySelectorAll(".categoria[data-categoria]");
  if (enlaces.length === 0) return; // producto.html y carrito.html no tienen categorías

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault(); // el href="#" no debe saltar al inicio de la página
      const elegida = enlace.dataset.categoria;
      filtros.categoria = filtros.categoria === elegida ? null : elegida;
      marcarCategoriaActiva();
      renderizarCatalogo();
      cerrarMenuMovil();
      // Si quedó el filtro puesto, baja hasta los resultados
      if (filtros.categoria !== null) {
        document.querySelector("#seccion-catalogo").scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}





// Botón "Menú" (solo se ve en pantallas chicas): agrega/quita la clase .mostrar que ya existe en el CSS.
function activarMenuMovil() {
  const boton = document.querySelector(".boton-menu");
  const menu = document.querySelector("#menu-categorias");
  if (!boton || !menu) return;

  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("mostrar"); // devuelve true si quedó la clase puesta
    boton.setAttribute("aria-expanded", abierto);
  });
}

// Cierra el menú del celular (se usa después de elegir una categoría).
function cerrarMenuMovil() {
  const boton = document.querySelector(".boton-menu");
  const menu = document.querySelector("#menu-categorias");
  if (!boton || !menu) return;
  menu.classList.remove("mostrar");
  boton.setAttribute("aria-expanded", "false");
}


// ============================ Publicidad ============================

// Pinta las tarjetas de publicidad dentro de #contenedor-publicidad (index.html),
// mostrando solo los productos con categoria "publicidad".
function renderizarPublicidad() {
  const contenedor = document.querySelector("#contenedor-publicidad");
  if (!contenedor) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  const lista = productos.filter((producto) => producto.categoria === "publicidad");
  contenedor.replaceChildren();

  if (lista.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "No hay publicidad disponible.";
    contenedor.append(vacio);
    return;
  }

  lista.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "publicidad";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;

    // Si la publicidad tiene "enlace" en productos.js, la imagen es un link que abre en una pestaña nueva.
    if (producto.enlace) {
      const enlace = document.createElement("a");
      enlace.href = producto.enlace;
      enlace.target = "_blank";
      enlace.rel = "noopener noreferrer";
      enlace.setAttribute("aria-label", `${producto.nombre} (se abre en una pestaña nueva)`);
      enlace.append(imagen);
      tarjeta.append(enlace);
    } else {
      tarjeta.append(imagen);
    }
    contenedor.append(tarjeta);
  });
}


// ============================ Detalle de producto ============================

// Arma el HTML del detalle de producto dentro de #detalle-producto (pages/producto.html),
// buscando en data/productos.js el producto cuyo id llega por query string (?id=N).
function renderizarDetalleProducto() {
  const contenedor = document.getElementById("detalle-producto");
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const idProducto = parseInt(params.get("id"));
  const producto = productos.find(p => p.id === idProducto);

  if (!producto) {
    contenedor.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

// ============================ Productos relacionados (Andrés) ============================

// Muestra hasta 4 productos de la misma categoría que el producto abierto (sin contar el mismo).
// Si no hay ninguno, la sección queda oculta.
function renderizarRelacionados(producto) {
  const seccion = document.querySelector("#productos-relacionados");
  const grilla = document.querySelector("#relacionados-grid");
  if (!seccion || !grilla) return;

  const relacionados = productos
    .filter((otro) => otro.categoria === producto.categoria && otro.id !== producto.id)
    .slice(0, 4);

  seccion.hidden = relacionados.length === 0;
  grilla.replaceChildren();

  relacionados.forEach((otro) => {
    const enlace = document.createElement("a");
    enlace.className = "relacionado";
    enlace.href = `producto.html?id=${otro.id}`; // producto.html está en la misma carpeta (pages/)

    const imagen = document.createElement("img");
    imagen.src = `.${otro.imagen}`; // "./img/..." pasa a "../img/..."
    imagen.alt = otro.nombre;
    imagen.width = 150;
    imagen.height = 150;

    const nombre = document.createElement("p");
    nombre.textContent = otro.nombre;

    const precio = document.createElement("p");
    precio.className = "relacionado-precio";
    precio.textContent = formatearPrecio(precioDeProducto(otro));

    enlace.append(imagen, nombre, precio);
    grilla.append(enlace);
  });
}


  contenedor.innerHTML = `
    <div class="producto-imagen">
      <img src=".${producto.imagen}" alt="${producto.nombre}" width="300" height="300">
    </div>
    <div class="producto-info">
      <h2>${producto.nombre}</h2>
        <p class="producto-precio">${producto.precioFinal !== undefined ? `<del>${formatearPrecio(producto.precio)}</del> ` : ""}${formatearPrecio(precioDeProducto(producto))}</p>
      
      <div class="producto-cantidad">
        <button type="button" class="btn-restar">-</button>
        <span class="cantidad-valor">1</span>
        <button type="button" class="btn-sumar">+</button>
      </div>
      <button type="button" class="btn-agregar">Agregar al carrito</button>
      <div class="producto-descripcion">
        <h3>Descripción del producto</h3>
        <p>${producto.descripcion}</p>
      </div>
    </div>
  `;
}