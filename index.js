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

    //FUNCIONES

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

import { auth, signInWithEmailAndPassword } from './firebase.js';

const loginForm = document.querySelector(".formulario_login");
const btnEntrar = loginForm.querySelector("button");

btnEntrar.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Iniciaste sesión correctamente");
        window.location.href = "administrador.html";
    } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
    }
});