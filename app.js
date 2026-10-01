document.addEventListener("DOMContentLoaded", () => {
  renderizarOfertas();
  actualizarContadorCarrito();
  activarFinalizarCompra();
  renderizarDetalleProducto();
});

// Finalizar compra: exige un ingreso simulado (localStorage) antes de confirmar el pedido
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

  function hayProductosEnCarrito() {
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (Array.isArray(carrito) && carrito.length > 0) return true;
    } catch {}
    // Mientras las filas del carrito sean estáticas (de ejemplo), también cuentan
    return document.querySelectorAll("#lista-carrito .item-carrito").length > 0;
  }

  function mostrarMensaje(texto) {
    const mensaje = document.querySelector("#mensaje-compra");
    mensaje.textContent = texto;
    mensaje.hidden = false;
  }

  function mostrarError(texto, campo) {
    errorLogin.textContent = texto;
    errorLogin.hidden = false;
    campo.focus();
  }

  function cerrarDialogo() {
    errorLogin.hidden = true;
    formulario.reset();
    dialogo.close();
  }

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

// ===== Contador del carrito (header) =====
// Corregido: ahora muestra 0 cuando el carrito está vacío.
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

function renderizarOfertas(categoria = null) {
  const contenedor = document.querySelector("#contenedor-ofertas");
  if (!contenedor) return;
  if (typeof productos === "undefined" || !Array.isArray(productos)) return;

  // 🔹 Filtrar solo productos en oferta
  let lista = productos.filter((producto) => producto.oferta);

  // 🔹 Si además se pasa una categoría, filtrar dentro de las ofertas
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
}
function renderizarDetalleProducto() {
  const contenedor = document.getElementById("detalle-producto");
  if (!contenedor) return; // si no existe el contenedor, no hace nada

  const params = new URLSearchParams(window.location.search);
  const idProducto = parseInt(params.get("id"));
  const producto = productos.find(p => p.id === idProducto);

  if (!producto) {
    contenedor.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  contenedor.innerHTML = `
    <div class="producto-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}" width="300" height="300">
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
