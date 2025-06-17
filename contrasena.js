import { db, getDoc, updateDoc, doc } from "./firebase.js";

// Obtener tiendaID desde la URL
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tiendaId = params.get("tienda");

  const btnRegresar = document.getElementById("btnRegresar");
  btnRegresar.addEventListener("click", (e) => {
    e.preventDefault();
    if (!tiendaId) {
      alert("No se especificó ninguna tienda. Redirigiendo a inicio...");
      window.location.href = "index.html";
      return;
    }
    window.location.href = `pedidos.html?tienda=${tiendaId}`;
  });

  // Obtener nombre de la tienda
  async function mostrarNombreTienda() {
    try {
      const tiendaDoc = await getDoc(doc(db, "tiendas", tiendaId));
      if (tiendaDoc.exists()) {
        const nombre = tiendaDoc.data().nombre;
        document.getElementById(
          "nombreTienda"
        ).textContent = `Tienda: ${nombre}`;
      } else {
        document.getElementById("nombreTienda").textContent =
          "Tienda no encontrada.";
      }
    } catch (error) {
      document.getElementById("nombreTienda").textContent =
        "Error al obtener la tienda.";
    }
  }

  mostrarNombreTienda();

  // Cambiar contraseña
  const claveActualInput = document.getElementById("claveActual");
  const claveNuevaInput = document.getElementById("claveNueva");
  const claveConfirmarInput = document.getElementById("claveConfirmar");
  const btnCambiarClave = document.getElementById("btnCambiarClave");

  btnCambiarClave.addEventListener("click", async () => {
    const claveActual = claveActualInput.value;
    const claveNueva = claveNuevaInput.value;
    const claveConfirmar = claveConfirmarInput.value;

    if (!claveActual || !claveNueva || !claveConfirmar) {
      return alert("Completa todos los campos.");
    }

    if (claveNueva.length < 4) {
      return alert("La nueva contraseña debe tener al menos 4 caracteres.");
    }

    if (claveNueva !== claveConfirmar) {
      return alert("La nueva contraseña no coincide.");
    }

    try {
      const tiendaRef = doc(db, "tiendas", tiendaId);
      const tiendaDoc = await getDoc(tiendaRef);

      if (!tiendaDoc.exists()) {
        return alert("Tienda no encontrada.");
      }

      const claveGuardada = tiendaDoc.data().contraseña;

      if (claveActual !== claveGuardada) {
        return alert("La contraseña actual es incorrecta.");
      }

      // Actualizar clave
      await updateDoc(tiendaRef, {
        contraseña: claveNueva,
      });

      alert("Contraseña actualizada correctamente.");
      claveActualInput.value = "";
      claveNuevaInput.value = "";
      claveConfirmarInput.value = "";

      // Redirigir a index
      window.location.href = "index.html";

    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      alert("Error al cambiar la contraseña.");
    }
  });
});
