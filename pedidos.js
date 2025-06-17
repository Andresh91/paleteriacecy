import { db, getDoc, collection, getDocs, addDoc, doc } from './firebase.js';

const saboresDiv = document.getElementById("saboresPedido");
const btnAgregarSabor = document.getElementById("btnAgregarSabor");
const btnEnviarPedido = document.getElementById("btnEnviarPedido");

let saboresDisponibles = [];
let saboresSeleccionados = [];
let tiendaId = "";
let tiendaNombre = "";

// Obtener tienda desde la URL y validar en Firestore
async function mostrarNombreTienda() {
  const params = new URLSearchParams(window.location.search);
  tiendaId = params.get("tienda");

  console.log("ID recibido:", tiendaId);

  // Cambiar contraseña
  document.getElementById("btnCambiarContrasena").addEventListener("click", (e) => {
    e.preventDefault();
    if (!tiendaId) {
      alert("No se especificó ninguna tienda.");
      return;
    }
    window.location.href = `contrasena.html?tienda=${tiendaId}`;
  });


  try {
    const tiendaDoc = await getDoc(doc(db, "tiendas", tiendaId));
    if (tiendaDoc.exists()) {
      tiendaNombre = tiendaDoc.data().nombre;
      document.getElementById("nombreTienda").textContent = tiendaNombre;
    } else {
      document.getElementById("nombreTienda").textContent = "Tienda no encontrada";
      btnEnviarPedido.disabled = true;
      btnAgregarSabor.disabled = true;
    }
  } catch (error) {
    console.error("Error al obtener tienda:", error);
    alert("Hubo un error al verificar la tienda.");
  }
}

// Cargar sabores disponibles desde Firestore
async function cargarSabores() {
  const snapshot = await getDocs(collection(db, "sabores"));
  saboresDisponibles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function agregarSabor() {
  const div = document.createElement("div");
  div.classList.add("sabor-item");

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

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "X";
  btnEliminar.classList.add("btn-eliminar-sabor");

  btnEliminar.addEventListener("click", () => {
    const index = saboresSeleccionados.findIndex(item => item.select === select);
    if (index !== -1) {
      saboresSeleccionados.splice(index, 1);
    }
    div.remove();
  });

  div.appendChild(select);
  div.appendChild(inputCantidad);
  div.appendChild(btnEliminar);
  saboresDiv.appendChild(div);

  saboresSeleccionados.push({ select, inputCantidad });
}

async function enviarPedido() {
  if (!tiendaId || !tiendaNombre) return alert("No se puede enviar el pedido sin tienda válida.");

  const detalles = saboresSeleccionados.map(({ select, inputCantidad }) => ({
    saborId: select.value,
    saborNombre: select.options[select.selectedIndex].text,
    cantidad: parseInt(inputCantidad.value)
  }));

  // Validación simple
  const datosValidados = detalles.every(item => item.saborId && item.cantidad > 0);
  if (!datosValidados) {
    return alert("Por favor, rellena todos los campos.");
  }

  // Mensaje para WhatsApp
  let mensaje = `🍦 *Pedido de paletas - Helados La Tía Cecy* 🍦\n`;
  mensaje += `📍 Tienda: *${tiendaNombre}*\n\n`;
  mensaje += `*Sabores:*\n`;
  detalles.forEach(item => {
    mensaje += `✅ ${item.saborNombre}: ${item.cantidad} Pzs\n`;
  });
  mensaje += `\nGracias por tu pedido. 🙌`;

  const numero = "526151077971";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");

    // Guardar en Firestore
  try {
    await addDoc(collection(db, "pedidos"), {
      tiendaId,
      tiendaNombre,
      fecha: new Date().toISOString(),
      detalles
    });

    setTimeout(() => {
      alert("Pedido enviado correctamente.");
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error("Error al enviar pedido:", error);
    alert("Hubo un error al guardar el pedido. Por favor, inténtalo de nuevo.");
  }
}

btnAgregarSabor.addEventListener("click", agregarSabor);
btnEnviarPedido.addEventListener("click", enviarPedido);

// Iniciar funciones
mostrarNombreTienda();
cargarSabores();
