//Array de objetos con información de productos de Riuu Cat Shop

const productos = [
  {
    id: 1,
    nombre: "Alimento Adulto 10kg",
    precio: 18500,
    oferta: true, //  está en oferta
    categoria: "alimento",
    peso: "10 kg",
    imagen: "./img/oferta-alimento-adulto-10kg-handler-1.png",
    descripcion: "Alimento balanceado premium para gatos adultos, bolsa de 10 kg. Rico en proteínas y omega 3."
  },
  {
  id: 2,
  nombre: "Collar Lucky para gatos",
  precio: 3500, // ajustá según tu lista de precios
  oferta: true, //  está en oferta (2x1)
  categoria: "accesorios",
  colores: ["naranja", "lavanda", "rosa", "amarillo", "bordó", "celeste", "azul", "rojo"],
  imagen: "./img/oferta-accesorio-collar-luky-2.jpeg", // nombre del archivo en tu carpeta img
  descripcion: "Collar elástico y ajustable para gatos, con funda de silicona para AirTag y accesorios dorados: placa con forma de carita de gato y cascabel. Disponible en varios colores: naranja, lila, rosa, amarillo, bordó, celeste, azul marino y rojo."
},
{
  id: 3,
  nombre: "Piedras Sanitarias 25kg",
  precio: 50000,
  oferta: true, //  está en oferta
  categoria: "higiene",
  peso: "25 kg",
  imagen: "./img/oferta-sanitario-piedritasSanitarias-3.jpeg", // ajustá al nombre real del archivo en tu carpeta img
  descripcion: "Bolsa de 25 kg de piedras sanitarias para gatos. Envíos sin cargo en compras superiores a $30.000."
},
{
  id: 4,
  nombre: "Comedero automático para gatos",
  precio: 7000, // precio original
  oferta: true, //  aparece en el carrusel de ofertas
  categoria: "accesorios",
  imagen: "./img/oferta-alimento-comederoAutomatico-4.png", // ajustá al nombre real del archivo
  descripcion: "Comedero automático con diseño de pez, ideal para dispensar alimento seco. Oferta especial con 20% de descuento.",
  descuento: 20, // porcentaje de descuento
  precioFinal: 5600 // precio con descuento aplicado
},
{
  id: 5,
  nombre: "AURA-VET Loción Dermo-Reestructuradora",
  categoria: "publicidad",
  tipo: "aceite",
  imagen: "./img/publicidad-aceite-5.jpeg", // ajustá al nombre real del archivo
  descripcion: "Loción dermo-reestructuradora con Aceite de Salmón Silvestre. Ayuda a tratar la pérdida de pelo en mascotas.",
  oferta: false, //  no es una oferta de catálogo, es publicidad
  destacado: true // opcional, para marcar que debe aparecer en el bloque de publicidad
},
{
  id: 6,
  nombre: "Publicidad Radio Allen FM 90.8",
  categoria: "publicidad",
  tipo: "radio",
  imagen: "./img/publicidad-radio-6.jpeg", //  nombre de archivo que mencionaste
  descripcion: "Campaña publicitaria de la emisora Allen FM 90.8. Suscríbete y escucha en vivo en www.salganalsol.com.ar.",
  oferta: false, //  no es una oferta de catálogo
  destacado: true // aparece en el bloque de publicidad
}


];