import {  db,  collection,  getDoc,  getDocs,  doc,  auth,  signInWithEmailAndPassword,} from "./firebase.js";

// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // === Declaración de variables DOM ===
  const btnPedidosTienda = document.getElementById("btn_pedidos-tienda");
  const btnIniciarSesion = document.getElementById("btn_iniciar-sesion");
  const btnEntrar = document.getElementById("btn_login_admin");
  const formPedidos = document.querySelector(".formulario_pedidos");
  const formularioLogin = document.querySelector(".formulario_login");
  const tiendaSelect = document.getElementById("tiendaSelect");
  const claveTienda = document.getElementById("claveTienda");
  const btnHacerPedido = document.getElementById("btn_hacer_pedido");
  const contenedorPedidoLogin = document.querySelector(".contenedor_pedido-login");
  const cajaTraseraPedidos = document.querySelector(".caja_trasera-pedidos");
  const cajaTraseraLogin = document.querySelector(".caja_trasera-login");

  // === Lógica de interfaz ===
  function anchoPage() {
    if (window.innerWidth > 850) {
      cajaTraseraLogin.style.display = "block";
      cajaTraseraPedidos.style.display = "block";
    } else {
      cajaTraseraLogin.style.display = "block";
      cajaTraseraLogin.style.opacity = "1";
      cajaTraseraPedidos.style.display = "none";
      formPedidos.style.display = "block";
      contenedorPedidoLogin.style.left = "0px";
      formularioLogin.style.display = "none";
    }
  }

  function pedidosTienda() {
    if (window.innerWidth > 850) {
      formPedidos.style.display = "block";
      contenedorPedidoLogin.style.left = "10px";
      formularioLogin.style.display = "none";
      cajaTraseraLogin.style.opacity = "1";
      cajaTraseraPedidos.style.opacity = "0";
    } else {
      formPedidos.style.display = "block";
      contenedorPedidoLogin.style.left = "0px";
      formularioLogin.style.display = "none";
      cajaTraseraLogin.style.display = "block";
      cajaTraseraPedidos.style.display = "none";
    }
  }

  function iniciarSesion() {
    if (window.innerWidth > 850) {
      formularioLogin.style.display = "block";
      contenedorPedidoLogin.style.left = "410px";
      formPedidos.style.display = "none";
      cajaTraseraLogin.style.opacity = "0";
      cajaTraseraPedidos.style.opacity = "1";
    } else {
      formularioLogin.style.display = "block";
      contenedorPedidoLogin.style.left = "0px";
      formPedidos.style.display = "none";
      cajaTraseraLogin.style.display = "none";
      cajaTraseraPedidos.style.display = "block";
      cajaTraseraPedidos.style.opacity = "1";
    }
  }

  // === Eventos ===
  window.addEventListener("resize", anchoPage);
  btnPedidosTienda.addEventListener("click", pedidosTienda);
  btnIniciarSesion.addEventListener("click", iniciarSesion);

  // Previene envío del formulario por Enter
  formPedidos.addEventListener("submit", (e) => e.preventDefault());

  // === Lógica para cargar tiendas ===
  async function mostrarListaTiendas() {
    try {
      const snapshot = await getDocs(collection(db, "tiendas"));
      tiendaSelect.innerHTML = '<option value="">-- Selecciona una tienda --</option>';
      snapshot.forEach((doc) => {
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

  // === Iniciar sesión como administrador ===
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

      alert(`Nueva contraseña generada: ${nuevaClave}\nGuárdala en un lugar seguro.`);
      document.getElementById("recuperarContrasena").style.display = "none";
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      alert("Error al recuperar la contraseña. Por favor, inténtalo de nuevo.");
    }
  });

  // === Validar tienda y contraseña ===
  btnHacerPedido.addEventListener("click", async () => {
    const tiendaId = tiendaSelect.value.trim();
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

      // Redirigir a pedidos con tienda ID
      window.location.href = `pedidos.html?tienda=${tiendaId}`;
    } catch (error) {
      console.error("Error al validar tienda:", error);
      alert("Ocurrió un error al verificar la tienda.");
    }
  });

  // Ejecutar función de tamaño al cargar
  anchoPage();
});
