let sabores = JSON.parse(localStorage.getItem('sabores')) || [];
let tiendas = JSON.parse(localStorage.getItem('tiendas')) || [];
let entregas = JSON.parse(localStorage.getItem('entregas')) || [];

function validarClave() {
    const clave = document.getElementById('claveAdmin').value;
    const error = document.getElementById('errorClave');

    if (clave === 'admin1') {
        location.href = 'administrador.html';
    } else {
        error.textContent = 'Contraseña incorrecta';
    }
}

function guardarSabores() {
    localStorage.setItem('sabores', JSON.stringify(sabores));
}

function guardarTiendas() {
    localStorage.setItem('tiendas', JSON.stringify(tiendas));
}

function guardarEntregas() {
    localStorage.setItem('entregas', JSON.stringify(entregas));
}

function mostrarSabores() {
    const lista = document.getElementById('listaSabores');
    if (!lista) return;
    lista.innerHTML = '';
    sabores.forEach((sabor, index) => {
        lista.innerHTML += `
            <div class="sabor-item">
                ${sabor.imagen ? `<img src="${sabor.imagen}" alt="${sabor.nombre}" width="50">` : ''}
                ${sabor.nombre} <button onclick="eliminarSabor(${index})">Eliminar</button>
            </div>
        `;
    });
}

function mostrarTiendas() {
    const lista = document.getElementById('listaTiendas');
    if (!lista) return;
    lista.innerHTML = '';
    tiendas.forEach((tienda, index) => {
        lista.innerHTML += `
            <div class="tienda-item">
                ${tienda} <button onclick="eliminarTienda(${index})">Eliminar</button>
            </div>
        `;
    });
}

function mostrarOpcionesDistribucion() {
    const tiendaSelect = document.getElementById('tiendaSelect');
    const saboresContainer = document.getElementById('saboresDistribuir');

    if (!tiendaSelect || !saboresContainer) return;

    tiendaSelect.innerHTML = '<option disabled selected>Seleccionar tienda</option>';
    tiendas.forEach(t => {
        tiendaSelect.innerHTML += `<option value="${t}">${t}</option>`;
    });

    saboresContainer.innerHTML = '';
    sabores.forEach(sabor => {
        saboresContainer.innerHTML += `
            <label>${sabor.nombre}: <input type="number" min="0" name="${sabor.nombre}"></label><br>
        `;
    });
}

function registrarEntrega() {
    const tienda = document.getElementById('tiendaSelect').value;
    const inputs =  document.querySelectorAll('#saboresDistribuir input');

    const cantidades = {};
    inputs.forEach(input => {
        const cantidad = parseInt(input.value);
        if (cantidad > 0) {
            cantidades[input.name] = cantidad;
        }
    });

    if (tienda && Object.keys(cantidades).length > 0) {
        entregas.push({ tienda, cantidades, fecha: new Date().toLocaleString() });
        guardarEntregas();
        alert("Entrega registrada con éxito");
        mostrarHistorialEntregas();
    } else {
      alert("Selecciona una tienda y cantidades Válidas.");
    }
}

function mostrarHistorialEntregas() {
    const historial = document.getElementById('historialEntregas');
    if (!historial) return;
    historial.innerHTML = '';
    entregas.forEach(entrega => {
        historial.innerHTML += `<div class="sabor-item">
            <strong>${entrega.tienda}</strong> - ${entrega.fecha}<br>
            ${Object.entries(entrega.cantidades).map(([sabor, cantidad]) => `${sabor}: ${cantidad}`).join(', ')}
        </div>`;
    });
}

function agregarSabor() {
    const input = document.getElementById('saborInput');
    const fileInput = document.getElementById('imagenSabor');
    const nuevoSabor = input.value.trim();
    const file = fileInput.files[0];

    if (nuevoSabor && !sabores.some(s => s.nombre === nuevoSabor)) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                sabores.push({ nombre: nuevoSabor, imagen: e.target.result });
                guardarSabores();
                mostrarSabores();
                mostrarOpcionesDistribucion();
                input.value = '';
                fileInput.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            sabores.push({ nombre: nuevoSabor, imagen: '' });
            guardarSabores();
            mostrarSabores();
            mostrarOpcionesDistribucion();
            input.value = '';
        }
    }
}

function agregarTienda() {
    const input = document.getElementById('tiendaInput');
    const nuevaTienda = input.value.trim();
    if (nuevaTienda && !tiendas.includes(nuevaTienda)) {
        tiendas.push(nuevaTienda);
        guardarTiendas();
        mostrarTiendas();
        mostrarOpcionesDistribucion();
        mostrarFormularioPedido();
        input.value = '';
    }
}

function eliminarSabor(index) {
    sabores.splice(index, 1);
    guardarSabores();
    mostrarSabores();
    mostrarOpcionesDistribucion();
}

function eliminarTienda(index) {
    tiendas.splice(index, 1);
    guardarTiendas();
    mostrarTiendas();
    mostrarOpcionesDistribucion();
    mostrarFormularioPedido();
}

function mostrarFormularioPedido() {
    const tiendaSelect = document.getElementById('tiendaPedido');
    const saboresDiv = document.getElementById('saboresPedido');

    if (!tiendaSelect || !saboresDiv) return;

    tiendaSelect.innerHTML = '<option disabled selected>Seleccionar tienda</option>';
    tiendas.forEach(t => {
        tiendaSelect.innerHTML += `<option value="${t}">${t}</option>`;
    });

    saboresDiv.innerHTML = '';
    agregarFilaSabor();
}

function enviarPedido() {
    const tienda = document.getElementById('tiendaPedido').value;
    const filas =  document.querySelectorAll('#saboresPedido .fila-sabor');

    const pedido = {};
    filas.forEach(fila => {
        const select = fila.querySelector('.select-sabor');
        const input = fila.querySelector('.cantidad-sabor');
        const sabor = select.value;
        const cantidad = parseInt(input.value);

        if (cantidad && cantidad > 0) {
            pedido[sabor] = cantidad;
        }
    });

    if (tienda && Object.keys(pedido).length > 0) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        pedidos.push({ tienda, pedido, fecha: new Date().toLocaleString() });
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        //Enviar mensaje WhatsApp
        let mensaje = `🧊 *Nuevo pedido de paletas* 🧊%0A`;
        mensaje += `📍 Tienda: *${tienda}*%0A`;
        mensaje += `📅 fecha: ${new Date().toLocaleString()}%0A`;
        mensaje += `📝 Pedido:%0A`;

        Object.entries(pedido).forEach(([sabor, cantidad]) => {
            mensaje += `✅ ${sabor}: ${cantidad}%0A`;
        });

        let numeroWhatsApp = "5216151077971";
        let urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
        window.open(urlWhatsApp, '_blank');

        alert("Pedido enviado con éxito");
        //Limpiar campos
        document.getElementById('tiendaPedido').value = '';
        document.getElementById('saboresPedido').innerHTML = '';
        agregarFilaSabor();
    } else {
        alert("Selecciona una tienda y cantidades Válidas.");
    }
}

function agregarFilaSabor() {
    const saboresDiv = document.getElementById('saboresPedido');
    const fila = document.createElement('div');
    fila.classList.add('fila-sabor');

    let selectHTML = '<select class="select-sabor"><option disabled selected>Seleccionar sabor</option>';
    sabores.forEach(s => {
        selectHTML += `<option value="${s.nombre}">${s.nombre}</option>`;
    });
    selectHTML += '</select>';

    fila.innerHTML = `
        ${selectHTML}
        <input type="number" min="0" class="cantidad-sabor" placeholder="Cantidad">
        <button onclick="this.parentElement.remove()">Eliminar</button>
    `;
    saboresDiv.appendChild(fila);
}

mostrarSabores();
mostrarTiendas();
mostrarOpcionesDistribucion();
mostrarHistorialEntregas();
mostrarFormularioPedido();
