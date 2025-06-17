//Ejecutando funciones
document.getElementById("btn_pedidos-tienda").addEventListener("click", pedidosTienda);
document.getElementById("btn_iniciar-sesion").addEventListener("click", iniciarSesion);
window.addEventListener("resize", anchoPage);

//Declarando variables
var formulario_pedidos = document.querySelector(".formulario_pedidos");
var formulario_login = document.querySelector(".formulario_login");
var contenedor_pedido_login = document.querySelector(".contenedor_pedido-login");
var caja_trasera_pedidos = document.querySelector(".caja_trasera-pedidos");
var caja_trasera_login = document.querySelector(".caja_trasera-login");

// Funcion para cambiar el tamaño de la página
function anchoPage(){
    if (window.innerWidth > 850){
        caja_trasera_login.style.display = "block";
        caja_trasera_pedidos.style.display = "block";
    }else{
        caja_trasera_login.style.display = "block";
        caja_trasera_login.style.opacity = "1";
        caja_trasera_pedidos.style.display = "none";
        formulario_pedidos.style.display = "block";
        contenedor_pedido_login.style.left = "0px";
        formulario_login.style.display = "none";   
    }
}

anchoPage();

// Cambiar a formulario de pedidos
    function pedidosTienda(){
        if (window.innerWidth > 850){
            formulario_pedidos.style.display = "block";
            contenedor_pedido_login.style.left = "10px";
            formulario_login.style.display = "none";
            caja_trasera_login.style.opacity = "1";
            caja_trasera_pedidos.style.opacity = "0";
        }else{
            formulario_pedidos.style.display = "block";
            contenedor_pedido_login.style.left = "0px";
            formulario_login.style.display = "none";
            caja_trasera_login.style.display = "block";
            caja_trasera_pedidos.style.display = "none";
        }
    }

    // Cambiar a formulario de inicio de sesión
    function iniciarSesion(){
        if (window.innerWidth > 850){
            formulario_login.style.display = "block";
            contenedor_pedido_login.style.left = "410px";
            formulario_pedidos.style.display = "none";
            caja_trasera_login.style.opacity = "0";
            caja_trasera_pedidos.style.opacity = "1";
        }else{
            formulario_login.style.display = "block";
            contenedor_pedido_login.style.left = "0px";
            formulario_pedidos.style.display = "none";
            caja_trasera_login.style.display = "none";
            caja_trasera_pedidos.style.display = "block";
            caja_trasera_pedidos.style.opacity = "1";
        }
}

//Firebase e inicio de sesión

import { db, collection, getDoc, getDocs, doc, auth, signInWithEmailAndPassword } from './firebase.js';

// Iniciar sesión del admin
const loginForm = document.querySelector(".formulario_login");
const btnEntrar = document.getElementById("btn_login_admin");

btnEntrar.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.querySelector('.formulario_login input[type="text"]').value;
    const password = document.querySelector('.formulario_login input[type="password"]').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Iniciaste sesión correctamente");
        window.location.href = "administrador.html";
    } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
    }
});

// Mostrar lista de tiendas
async function mostrarListaTiendas() {
    const tiendaSelect = document.getElementById("tiendaSelect");

    try {
        const snapshot = await getDocs(collection(db, "tiendas"));
        tiendaSelect.innerHTML = '<option value="">-- Selecciona una tienda --</option>';

        snapshot.forEach(doc => {
            const tienda = doc.data();
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = tienda.nombre;
            tiendaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al mostrar tiendas:", error);
        tiendaSelect.innerHTML = '<option value="">Error al cargar tiendas</option>';
    }
}

mostrarListaTiendas();

// Validar tienda y contraseña
const tiendaSelect = document.getElementById("tiendaSelect");
const claveTienda = document.getElementById("claveTienda");
const btnHacerPedido = document.getElementById("btn_hacer_pedido");

btnHacerPedido.addEventListener("click", async () => {
    const tiendaId = tiendaSelect.value;
    const claveIngresada = claveTienda.value;

    if (!tiendaId || !claveIngresada) {
        return alert("Selecciona una tienda y escribe la contraseña");
    }

    try {
        const tiendaDocRef = doc(db, "tiendas", tiendaId);
        const tiendaDoc = await getDoc(tiendaDocRef);

        if (!tiendaDoc.exists()) {
            return alert("La tienda no existe");
        }

        const datos = tiendaDoc.data();
        if (datos.contraseña !== claveIngresada) {
            return alert("Contraseña incorrecta");
        }

        // Contraseña correcta, redireccionar a la página de pedidos
        window.location.href = `pedidos.html?tienda=${tiendaId}`;

    } catch (error) {
        console.error("Error al validar tienda:", error);
        alert("Ocurrió un error al verificar la tienda.");
    }
});
