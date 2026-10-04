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