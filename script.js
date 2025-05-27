// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyC4oM27x0XLnyR_NmKOkgOpxl88AnFQ6Y0",
    authDomain: "helados-cecy.firebaseapp.com",
    projectId: "helados-cecy",
    storageBucket: "helados-cecy.appspot.com",
    messagingSenderId: "895554303164",
    appId: "1:895554303164:web:eafdb3255959b3c0e58cb9",
    measurementId: "G-W591VTPC34"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Funcionalidad de botones
document.addEventListener("DOMContentLoaded", () => {
    const btnIniciarSesion = document.getElementById("btnIniciarSesion");
    const btnPedidosTienda = document.getElementById("btnPedidosTienda");

    if (btnIniciarSesion && btnPedidosTienda) {
        const inputClaveAdmin = document.getElementById("claveAdmin");
        const errorClave = document.getElementById("errorClave");

        btnIniciarSesion.addEventListener("click", () => {
            const clave = inputClaveAdmin.value.trim();
            if (clave === "admin1") {
                window.location.href = "administrador.html";
            } else {
                errorClave.textContent = "Contraseña incorrecta";
            }
        });

        btnPedidosTienda.addEventListener("click", () => {
            window.location.href = "pedidos.html";
        });
    }

    const btnAgregarSabor = document.getElementById("btnAgregarSabor");
    const btnAgregarTienda = document.getElementById("btnAgregarTienda");
    const btnRegistrarEntrega = document.getElementById("btnRegistrarEntrega");
    const btnMostrarEstadisticas = document.getElementById("btnMostrarEstadisticas");
    const btnActualizar = document.getElementById("btnActualizar");

    if (btnAgregarSabor && btnAgregarTienda && btnRegistrarEntrega) {
        const saborInput = document.getElementById("saborInput");
        const imagenSabor = document.getElementById("imagenSabor");
        const tiendaInput = document.getElementById("tiendaInput");
        const tiendaSelect = document.getElementById("tiendaSelect");
        const saboresDistribuir = document.getElementById("saboresDistribuir");
        const historialEntregas = document.getElementById("historialEntregas");

        let sabores = [];
        let tiendas = [];
        let entregas = [];

        btnAgregarSabor.addEventListener("click", async () => {
            const nombre = saborInput.value.trim();
            const imagen = imagenSabor.files[0];

            if (!nombre || !imagen) {
                alert("Agrega un nombre y selecciona una imagen");
                return;
            }

            const storageRef = ref(storage, `imagenesSabores/${nombre}`);
            await uploadBytes(storageRef, imagen);
            const urlImagen = await getDownloadURL(storageRef);

            await addDoc(collection(db, "sabores"), {
                nombre,
                imagenUrl: urlImagen
            });

            saborInput.value = "";
            imagenSabor.value = "";
            await cargarSabores();
        });

        btnAgregarTienda.addEventListener("click", async () => {
            const nombre = tiendaInput.value.trim();
            if (!nombre) return alert("Agrega un nombre para la tienda");
            await addDoc(collection(db, "tiendas"), { nombre });
            tiendaInput.value = "";
            await cargarTiendas();
        });

        btnRegistrarEntrega.addEventListener("click", async () => {
            const tienda = tiendaSelect.value;
            const cantidades = {};

            sabores.forEach(sabor => {
                const input = document.getElementById(`cantidad-${sabor.nombre}`);
                const cantidad = parseInt(input.value) || 0;
                if (cantidad > 0) {
                    cantidades[sabor.nombre] = cantidad;
                }
                input.value = 0;
            });

            if (!tienda || Object.keys(cantidades).length === 0) {
                alert("Selecciona tienda y agrega cantidades");
                return;
            }

            await addDoc(collection(db, "entregas"), {
                tienda,
                cantidades,
                fecha: Timestamp.now()
            });

            await cargarEntregas();
            alert("Entrega registrada con éxito");
        });

        if (btnMostrarEstadisticas) {
            btnMostrarEstadisticas.addEventListener("click", mostrarEstadisticas);
        }

        if (btnActualizar) {
            btnActualizar.addEventListener("click", async () => {
                await cargarSabores();
                await cargarTiendas();
                await cargarEntregas();
            });
        }

        async function cargarSabores() {
            const snapshot = await getDocs(collection(db, "sabores"));
            sabores = snapshot.docs.map(doc => ({
                nombre: doc.data().nombre,
                imagenUrl: doc.data().imagenUrl || ""
            }));

            saboresDistribuir.innerHTML = sabores.map(sabor =>
                `<label>
                    <img src="${sabor.imagenUrl}" alt="${sabor.nombre}" style="width: 50px; height: 50px;"> 
                    ${sabor.nombre}: 
                    <input type="number" id="cantidad-${sabor.nombre}" min="0" value="0">
                </label><br>`
            ).join('');
        }

        async function cargarTiendas() {
            const snapshot = await getDocs(collection(db, "tiendas"));
            tiendas = snapshot.docs.map(doc => doc.data().nombre);
            tiendaSelect.innerHTML = tiendas.map(tienda =>
                `<option value="${tienda}">${tienda}</option>`
            ).join('');
        }

        async function cargarEntregas() {
            const snapshot = await getDocs(collection(db, "entregas"));
            entregas = snapshot.docs.map(doc => doc.data());
            entregas.sort((a, b) => b.fecha?.seconds - a.fecha?.seconds);
            historialEntregas.innerHTML = entregas.map(e => {
                const lista = Object.entries(e.cantidades).map(
                    ([sabor, cantidad]) => `<li>${sabor}: ${cantidad}</li>`
                ).join('');
                return `<p><strong>${e.tienda}</strong> (${e.fecha?.toDate().toLocaleString() || 'Sin fecha'})<ul>${lista}</ul></p>`;
            }).join('');
        }

        async function mostrarEstadisticas() {
            if (entregas.length === 0) await cargarEntregas();

            const totalPorSabor = {};
            const totalPorTienda = {};

            entregas.forEach(e => {
                totalPorTienda[e.tienda] = (totalPorTienda[e.tienda] || 0) +
                    Object.values(e.cantidades).reduce((a, b) => a + b, 0);

                for (const [sabor, cantidad] of Object.entries(e.cantidades)) {
                    totalPorSabor[sabor] = (totalPorSabor[sabor] || 0) + cantidad;
                }
            });

            const ctx1 = document.getElementById('graficaPedidosPorTienda').getContext('2d');
            const ctx2 = document.getElementById('graficaSaborPorTienda').getContext('2d');

            if (ctx1) {
                new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(totalPorTienda),
                        datasets: [{
                            label: 'Total por tienda',
                            data: Object.values(totalPorTienda),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        }]
                    }
                });
            }

            if (ctx2) {
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(totalPorSabor),
                        datasets: [{
                            label: 'Total por sabor',
                            data: Object.values(totalPorSabor),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        }]
                    }
                });
            }
        }

        function enviarPorWhatsApp(tienda, pedido) {
            const mensaje = `🧊 Pedido para ${tienda}:\n` + Object.entries(pedido).map(
                ([sabor, cantidad]) => `- ${sabor}: ${cantidad}`
            ).join('\n');
            const numero = "5216151077971";
            const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        }

        // Cargar datos al iniciar
        cargarSabores();
        cargarTiendas();
        cargarEntregas();
    }
});
