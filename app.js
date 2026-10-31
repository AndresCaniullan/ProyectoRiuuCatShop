// ============================ Inicialización ============================
// Al cargar el DOM se ejecutan las cuatro funciones principales. Cada una
// revisa primero si los elementos que necesita existen en la página actual
// (index, producto o carrito); si no los encuentra, no hace nada. Por eso
// este mismo app.js puede incluirse igual en las tres páginas.
document.addEventListener("DOMContentLoaded", () => {
  renderizarOfertas();
  actualizarContadorCarrito();
  activarFinalizarCompra();
  renderizarDetalleProducto();
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
function activarFlechasCarrusel(contenedor) {
  const tarjeta = contenedor.querySelector(".tarjeta-producto");
  if (!tarjeta) return;

  const anchoTarjeta = tarjeta.offsetWidth + 16; // incluye gap
  const desplazamiento = anchoTarjeta * 3; // mueve 3 productos

  document.querySelector(".carrusel-anterior").addEventListener("click", () => {
    contenedor.scrollLeft -= desplazamiento;
  });

  document.querySelector(".carrusel-siguiente").addEventListener("click", () => {
    contenedor.scrollLeft += desplazamiento;
  });
}
function activarRotacionAutomatica(contenedor) {
  const tarjeta = contenedor.querySelector(".tarjeta-producto");
  if (!tarjeta) return;

  const anchoTarjeta = tarjeta.offsetWidth + 16; // incluye gap
  const desplazamiento = anchoTarjeta * 3; // mueve 3 productos por vez

  setInterval(() => {
    // Si llegó al final, vuelve al inicio
    if (contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth) {
      contenedor.scrollLeft = 0;
    } else {
      contenedor.scrollLeft += desplazamiento;
    }
  }, 4000); // cada 4 segundos
}


// ============================ Catálogo (ofertas destacadas) ============================

// Pinta las tarjetas de producto dentro de #contenedor-ofertas (index.html),
// mostrando solo los productos en oferta y, si se pasa categoria, filtrando además por esa categoría.
function renderizarOfertas(categoria = null) {
  const contenedor = document.querySelector("#contenedor-ofertas");
  if (!contenedor) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  let lista = productos.filter((producto) => producto.oferta);
  if (categoria) {
    lista = lista.filter((producto) => producto.categoria === categoria);
  }

  contenedor.replaceChildren();

  if (lista.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "No hay productos en oferta.";
    contenedor.append(vacio);
    return;
  }

  lista.forEach((producto) => {
    const tarjeta = document.createElement("a");
    tarjeta.className = "tarjeta-producto";
    tarjeta.href = `pages/producto.html?id=${producto.id}`;

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$ ${Number(producto.precio).toLocaleString("es-AR")}`;

    tarjeta.append(imagen, nombre, precio);
    contenedor.append(tarjeta);
  });

  activarFlechasCarrusel(contenedor);
  activarRotacionAutomatica(contenedor);
}

// ============================ Publicidad ============================

// Pinta las tarjetas de publicidad dentro de #contenedor-publicidad (index.html),
// mostrando solo los productos con categoria "publicidad".
function renderizarPublicidad() {
  const contenedor = document.querySelector("#contenedor-publicidad");
  if (!contenedor) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  let lista = productos.filter((producto) => producto.categoria === "publicidad");

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

    tarjeta.append(imagen);
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

  contenedor.innerHTML = `
    <div class="producto-imagen">
      <img src=".${producto.imagen}" alt="${producto.nombre}" width="300" height="300">
    </div>
    <div class="producto-info">
      <h2>${producto.nombre}</h2>
      <p class="producto-precio">$ ${Number(producto.precio).toLocaleString("es-AR")}</p>
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