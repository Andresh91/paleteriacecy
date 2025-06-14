import { db, collection, getDocs, deleteDoc, doc } from "./firebase.js";

// Referencias a botones y contenedores
const btnGraficaTiendas = document.getElementById("btnGraficaTiendas");
const btnGraficaSabores = document.getElementById("btnGraficaSabores");
const contenedorGraficaTiendas = document.getElementById(
  "contenedorGraficaTiendas"
);
const contenedorGraficaSabores = document.getElementById(
  "contenedorGraficaSabores"
);
const infoPedidosTienda = document.getElementById("infoPedidosTienda");

// Canvas para gráficas
const ctxTiendas = document.getElementById("graficaTiendas").getContext("2d");
const ctxSabores = document.getElementById("graficaSabores").getContext("2d");

// Variables para guardar las gráficas activas (evitar duplicadas)
let chartTiendas, chartSabores;

// Escuchar botones
btnGraficaTiendas.addEventListener("click", () => {
  contenedorGraficaTiendas.style.display = "block";
  contenedorGraficaSabores.style.display = "none";
});

btnGraficaSabores.addEventListener("click", () => {
  contenedorGraficaSabores.style.display = "block";
  contenedorGraficaTiendas.style.display = "none";
});

// Función principal para cargar datos y graficar
async function cargarEstadisticas() {
  const pedidosSnapshot = await getDocs(collection(db, "pedidos"));
  const tiendasSnapshot = await getDocs(collection(db, "tiendas"));

  // Crear diccionario de IDs → nombres
  const mapaTiendas = {};
  tiendasSnapshot.forEach((doc) => {
    mapaTiendas[doc.id] = doc.data().nombre;
  });

  const conteoTiendas = {};
  const conteoSabores = {};

  pedidosSnapshot.forEach((doc) => {
    const pedido = doc.data();
    const tiendaId = pedido.tiendaId;
    const detalles = pedido.detalles || [];

    // Usar el nombre real de la tienda (o el ID si no existe)
    const nombreTienda = mapaTiendas[tiendaId] || tiendaId;
    conteoTiendas[nombreTienda] = (conteoTiendas[nombreTienda] || 0) + 1;

    // Contar total de paletas por sabor
    detalles.forEach((detalle) => {
      const saborNombre = detalle.saborNombre || "Desconocido";
      const cantidad = detalle.cantidad || 0;
      conteoSabores[saborNombre] = (conteoSabores[saborNombre] || 0) + cantidad;
    });
  });

  graficarTiendas(conteoTiendas);
  graficarSabores(conteoSabores);
}

// Crear gráfica por tienda
function graficarTiendas(data) {
  const labels = Object.keys(data);
  const valores = Object.values(data);

  if (chartTiendas) chartTiendas.destroy();

  chartTiendas = new Chart(ctxTiendas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Pedidos por tienda",
          data: valores,
          backgroundColor: "#8B4513",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// Crear gráfica por sabor
function graficarSabores(data) {
  const labels = Object.keys(data);
  const valores = Object.values(data);

  if (chartSabores) chartSabores.destroy();

  chartSabores = new Chart(ctxSabores, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Paletas por sabor",
          data: valores,
          backgroundColor: generarColores(labels.length),
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// Función para generar colores aleatorios
function generarColores(n) {
  const colores = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(Math.random() * 150);
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 15);
    colores.push(`rgb(${r},${g},${b})`);
  }
  return colores;
}

const tiendaBorrarSelect = document.getElementById("tiendaBorrar");
const btnBorrarPedidosTienda = document.getElementById(
  "btnBorrarPedidosTienda"
);

// Cargar tiendas en el <select>
async function cargarTiendasParaBorrar() {
  const snapshot = await getDocs(collection(db, "tiendas"));
  snapshot.forEach((docTiendas) => {
    const option = document.createElement("option");
    option.value = docTiendas.id;
    option.textContent = docTiendas.data().nombre;
    tiendaBorrarSelect.appendChild(option);
  });
}

// Borrar pedidos de la tienda seleccionada
btnBorrarPedidosTienda.addEventListener("click", async () => {
  const tiendaId = tiendaBorrarSelect.value;
  if (!tiendaId) return alert("Selecciona una tienda");

  const confirmar = confirm(
    `¿Estás seguro de que quieres borrar todos los pedidos de la tienda ${tiendaId}?`
  );
  if (!confirmar) return;

  const snapshot = await getDocs(collection(db, "pedidos"));
  const eliminaciones = [];

  snapshot.forEach((pedido) => {
    if (pedido.data().tiendaId === tiendaId) {
      eliminaciones.push(deleteDoc(doc(db, "pedidos", pedido.id)));
    }
  });

  await Promise.all(eliminaciones);
  alert("Pedidos eliminados correctamente");

  infoPedidosTienda.textContent = "";
  tiendaBorrarSelect.selectedIndex = 0;

  await cargarEstadisticas();

});

tiendaBorrarSelect.addEventListener("change", async () => {
    const tiendaId = tiendaBorrarSelect.value;
    if (!tiendaId) {
        infoPedidosTienda.textContent = "";
        return;
    }

    const snapshot = await getDocs(collection(db, "pedidos"));
    let contador = 0;

    snapshot.forEach((pedido) => {
        if (pedido.data().tiendaId === tiendaId) {
            contador++;
        }
    });

    if (contador === 0) {
        infoPedidosTienda.textContent = "Esta tienda no tiene pedidos registrados";
    } else {
        infoPedidosTienda.textContent = `Esta tienda tiene ${contador} pedido(s).`;
    }
});

cargarTiendasParaBorrar();
cargarEstadisticas();