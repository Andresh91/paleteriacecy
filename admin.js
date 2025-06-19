import { db, collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from "./firebase.js";

// Referencias a botones y contenedores
const btnGraficaTiendas = document.getElementById("btnGraficaTiendas");
const contenedorGraficaTiendas = document.getElementById("contenedorGraficaTiendas");
const tiendaBorrarSelect = document.getElementById("tiendaBorrar");
const infoPedidosTienda = document.getElementById("infoPedidosTienda");
const btnBorrarPedidosTienda = document.getElementById("btnBorrarPedidosTienda");

// Contexto del canvas
const ctxTiendas = document.getElementById("graficaTiendas").getContext("2d");

// Variable para la gráfica
let chartTiendas;

// Al hacer clic: mostrar solo la gráfica de tiendas
btnGraficaTiendas.addEventListener("click", () => {
  contenedorGraficaTiendas.style.display = "block";
  contenedorComparativa.style.display = "none";
});

// Función para cargar y graficar datos
async function cargarEstadisticas() {
  // Leer todos los pedidos y tiendas
  const [pedidosSnap, tiendasSnap] = await Promise.all([
    getDocs(collection(db, "pedidos")),
    getDocs(collection(db, "tiendas"))
  ]);

  // Map de ID de tienda → nombre
  const mapaTiendas = {};
  tiendasSnap.forEach(doc => {
    mapaTiendas[doc.id] = doc.data().nombre;
  });

  // Contar total de paletas por tienda
  const conteoTiendas = {};
  pedidosSnap.forEach(docPedido => {
    const { tiendaId, detalles = [] } = docPedido.data();
    const nombre = mapaTiendas[tiendaId] || tiendaId;
    detalles.forEach(({ cantidad = 0 }) => {
      conteoTiendas[nombre] = (conteoTiendas[nombre] || 0) + cantidad;
    });
  });

  // Graficar
  const labels = Object.keys(conteoTiendas);
  const data = Object.values(conteoTiendas);

  if (chartTiendas) chartTiendas.destroy();
  chartTiendas = new Chart(ctxTiendas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total de paletas",
        data,
        backgroundColor: "#8B4513"
      }]
    },
    options: { responsive: true }
  });
}

const btnComparativa = document.getElementById("btnGraficaComparativa");
const contenedorComparativa = document.getElementById("contenedorGraficaComparativa");
const ctxComparativa = document.getElementById("graficaComparativa").getContext("2d");
let chartComparativa;

// Mostrar/ocultar contenedores
btnComparativa.addEventListener("click", async () => {
  contenedorGraficaTiendas.style.display = "none";
  contenedorComparativa.style.display = "block";
  await graficaComparativaSabores();
});

function generarColores(n) {
  const colores = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(Math.random() * 156 + 100);
    const g = Math.floor(Math.random() * 156 + 100);
    const b = Math.floor(Math.random() * 156 + 100);
    colores.push(`rgb(${r},${g},${b})`);
  }
  return colores;
}

async function graficaComparativaSabores() {
  // Traemos los pedidos y las tiendas
  const [pedidosSnap, tiendasSnap] = await Promise.all([
    getDocs(collection(db, "pedidos")),
    getDocs(collection(db, "tiendas"))
  ]);

  // Mapa de tiendaID → nombre
  const mapaTiendas = {};
  tiendasSnap.forEach(d => mapaTiendas[d.id] = d.data().nombre);

  //Primer paso: construimos
  // -setSabores: para todas las claves saborNombre
  // -matriz[tiendaNombre][saborNombre] = suma cantidades
  const setSabores = new Set();
  const matriz = {};
  pedidosSnap.forEach(d => {
    const { tiendaId, detalles = [] } = d.data();
    const tiendaNombre = mapaTiendas[tiendaId] || tiendaId;
    if (!matriz[tiendaNombre]) matriz[tiendaNombre] = {};
    detalles.forEach(({ saborNombre = "Desconocido", cantidad = 0 }) => {
      setSabores.add(saborNombre);
      matriz[tiendaNombre][saborNombre] = (matriz[tiendaNombre][saborNombre] || 0) + cantidad;
    });
  });

  const sabores = Array.from(setSabores).sort();
  const tiendas = Object.keys(matriz);

  // Colores
  const colores = generarColores(tiendas.length);

  const datasets = tiendas.map((tienda, i) => ({
    label: tienda,
    data: sabores.map(s => matriz[tienda][s] || 0),
    backgroundColor: colores[i]
  }));

  // destruimos la anterior si existía
  if (chartComparativa) chartComparativa.destroy();

  chartComparativa = new Chart(ctxComparativa, {
    type: "bar",
    data: { labels: sabores, datasets },
    options: { 
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: "Comparativa de paletas por sabor y tienda"
        }
      },
      scales: {
        x: { title: { display: true, text: "Sabores" } },
        y: { title: { display: true, text: "Cantidad" }, beginAtZero: true }
      }
    }
  });  
}

// Cargar el select de tiendas para borrar
async function cargarTiendasParaBorrar() {
  const snapshot = await getDocs(collection(db, "tiendas"));
  snapshot.forEach(docTienda => {
    const opt = document.createElement("option");
    opt.value = docTienda.id;
    opt.textContent = docTienda.data().nombre;
    tiendaBorrarSelect.appendChild(opt);
  });
}

// Mostrar cuántos pedidos tiene la tienda seleccionada
const pedidoBorrarSelect = document.getElementById("pedidoBorrar");

tiendaBorrarSelect.addEventListener("change", async () => {
  const tiendaId = tiendaBorrarSelect.value;
  infoPedidosTienda.textContent = "";
  pedidoBorrarSelect.innerHTML ='<option value="">-- Selecciona un pedido --</option>';

  if (!tiendaId) return;

  const snapshot = await getDocs(collection(db, "pedidos"));
  const pedidos = snapshot.docs.filter(doc => doc.data().tiendaId === tiendaId);

  if (pedidos.length === 0) {
    infoPedidosTienda.textContent = "Esta tienda no tiene pedidos registrados.";
    return;
  }

  infoPedidosTienda.textContent = `Esta tienda tiene ${pedidos.length} pedidos.`;
  
  pedidos.forEach(doc => {
    const pedido = doc.data();
    const fecha = pedido.fecha ? new Date(pedido.fecha).toLocaleString() : "Sin fecha";
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = `Pedido del ${fecha}`;
    pedidoBorrarSelect.appendChild(opt);
  });
});

// Borrar todos los pedidos de la tienda seleccionada
btnBorrarPedidosTienda.addEventListener("click", async () => {
  const pedidoId = pedidoBorrarSelect.value;

  if (!pedidoId) return alert("Selecciona un pedido para borrar.");

  const confirmar = confirm("¿Seguro que quieres borrar este pedido?");
  if (!confirmar) return;

  await deleteDoc(doc(db, "pedidos", pedidoId));

  alert("Pedido eliminado correctamente.");

  // Actualizar interfaz
  pedidoBorrarSelect.selectedIndex = 0;
  tiendaBorrarSelect.dispatchEvent(new Event("change"));
  await cargarEstadisticas();
});

// Inicialización
await Promise.all([
  cargarTiendasParaBorrar(),
  cargarEstadisticas()
]);
