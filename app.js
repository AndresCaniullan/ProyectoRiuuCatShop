// app.js — lógica compartida de la página principal.
// Depende de que data/productos.js se haya cargado antes (ver <script> en index.html).

document.addEventListener("DOMContentLoaded", () => {
  renderizarOfertas();
  actualizarContadorCarrito();
  activarFiltrosPorCategoria();
  activarMenuMovil();
});

// Muestra/oculta el menú de categorías en pantallas chicas
function activarMenuMovil() {
  const boton = document.querySelector(".boton-menu");
  const menu = document.querySelector("#menu-categorias");
  if (!boton || !menu) return;

  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("mostrar");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
}

// Pinta las tarjetas de producto dentro de #contenedor-ofertas
function renderizarOfertas(categoria = null) {
  const contenedor = document.querySelector("#contenedor-ofertas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const listaAMostrar = categoria
    ? productos.filter((p) => p.categoria === categoria)
    : productos.filter((p) => p.oferta);

  listaAMostrar.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";
    tarjeta.innerHTML = `
      <a href="pages/producto.html?id=${producto.id}">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
      </a>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Al hacer click en una categoría, filtra el listado en vez de navegar
function activarFiltrosPorCategoria() {
  document.querySelectorAll(".categoria").forEach((boton) => {
    boton.addEventListener("click", (evento) => {
      evento.preventDefault();
      const categoria = boton.dataset.categoria;
      renderizarOfertas(categoria);
    });
  });
}

// Lee el carrito guardado en localStorage y muestra la cantidad de ítems
function actualizarContadorCarrito() {
  const contador = document.querySelector("#contador-carrito");
  if (!contador) return;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const cantidadTotal = carrito.reduce((acum, item) => acum + item.cantidad, 0);
  contador.textContent = cantidadTotal;
}