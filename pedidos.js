import { db, collection, getDocs, addDoc } from './firebase.js';

const tiendaSelect = document.getElementById("tiendaPedido");
const saboresDiv = document.getElementById("saboresPedido");
const btnAgregarSabor = document.getElementById("btnAgregarSabor");
const btnEnviarPedido = document.getElementById("btnEnviarPedido");

let saboresDisponibles = [];
let saboresSeleccionados = [];

// Cargar tiendas
async function cargarTiendas() {
  const snapshot = await getDocs(collection(db, "tiendas"));
  snapshot.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().nombre;
    tiendaSelect.appendChild(option);
  });
}

// Cargar sabores
async function cargarSabores() {
  const snapshot = await getDocs(collection(db, "sabores"));
  saboresDisponibles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function agregarSabor() {
  const div = document.createElement("div");

  const select = document.createElement("select");
  saboresDisponibles.forEach(sabor => {
    const option = document.createElement("option");
    option.value = sabor.id;
    option.textContent = sabor.nombre;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.placeholder = "Cantidad";

  div.appendChild(select);
  div.appendChild(inputCantidad);
  saboresDiv.appendChild(div);

  saboresSeleccionados.push({ select, inputCantidad });
}

// Enviar pedido
async function enviarPedido() {
  const tiendaId = tiendaSelect.value;
  if (!tiendaId) return alert("Selecciona una tienda.");

  //Obtener nombre de la tienda para Whatsapp
  const tiendaNombre = tiendaSelect.options[tiendaSelect.selectedIndex].text;
  
  //Obtener detalles del pedido
  const detalles = saboresSeleccionados.map(({ select, inputCantidad }) => {
    return {
      saborId: select.value,
      saborNombre: select.options[select.selectedIndex].text,
      cantidad: parseInt(inputCantidad.value)
    };
  });

  //Guardar en la base de datos (Firestore)
  await addDoc(collection(db, "pedidos"), {
    tiendaId,
    fecha: new Date().toISOString(),
    detalles
  });

  //Enviar mensaje Whatsapp
let mensaje = `🍦 *Pedido de paletas - Tía Cecy* 🍦\n`;
mensaje += `📍 Tienda: *${tiendaNombre}*\n\n`;
detalles.forEach(item => {
    mensaje += `*Sabores:*\n`;
    mensaje += `✅ ${item.saborNombre}: ${item.cantidad}\n`;
});
mensaje += `\nGracias por tu pedido. 🙌`;

//Número de Whatsapp
const numero = "526151077971";

//Abrir Whatsapp
const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
window.open(url, "_blank");

  alert("Pedido enviado correctamente.");
  window.location.reload();
}

btnAgregarSabor.addEventListener("click", agregarSabor);
btnEnviarPedido.addEventListener("click", enviarPedido);

// Cargar datos al inicio
cargarTiendas();
cargarSabores();
