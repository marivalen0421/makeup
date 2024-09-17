let todosLosProductos = [];
const tasaCambioUSDToCOP = 4000;
let carrito = [];
const IVA = 0.19;
const ENVIO_GRATIS_MIN = 150000;
const COSTO_ENVIO = 12000;

// Cargar los productos del servidor
async function cargarProductos() {
    try {
        document.getElementById('loading').style.display = 'block';

        const response = await fetch('/productos');
        todosLosProductos = await response.json();

        document.getElementById('loading').style.display = 'none'

        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función para mostrar los productos en la página
function mostrarProductos(productos) {
    const productosContainer = document.getElementById('productos');
    const template = document.getElementById('producto-template').content;

    productosContainer.innerHTML = ''; // Limpiamos el contenedor

    productos.forEach(producto => {
        const productoClone = template.cloneNode(true);

        // Llenamos la plantilla con los datos del producto
        productoClone.querySelector('img').src = producto.image_link;
        productoClone.querySelector('img').alt = producto.name;
        productoClone.querySelector('h2').textContent = producto.name;
        productoClone.querySelector('.marca').textContent = `Marca: ${producto.brand}`;

        const precioCOP = (producto.price * tasaCambioUSDToCOP).toFixed(0).toLocaleString('es-CO');
        productoClone.querySelector('.precio').textContent = `Precio: $${precioCOP} COP`;

        // Obtener botón de agregar al carrito y el input de cantidad
        const agregarCarritoBtn = productoClone.querySelector('.agregar-carrito-btn');
        const cantidadInput = productoClone.querySelector('.cantidad-input');

        // Asociar evento de agregar al carrito
        agregarCarritoBtn.addEventListener('click', () => {
            const cantidad = parseInt(cantidadInput.value);
            agregarAlCarrito(producto, cantidad);
        });

        // Agregamos la card al contenedor de productos
        productosContainer.appendChild(productoClone);
    });
}
function filtrarProductos() {
    const filtro = document.getElementById('buscador').value.toLowerCase();
    const productosFiltrados = todosLosProductos.filter(producto => 
        producto.name.toLowerCase().includes(filtro) || 
        producto.brand.toLowerCase().includes(filtro)
    );
    mostrarProductos(filtro === '' ? todosLosProductos : productosFiltrados);
}

// Función para agregar productos al carrito
function agregarAlCarrito(producto, cantidad) {
    const itemCarrito = carrito.find(item => item.id === producto.id);

    if (itemCarrito) {
        itemCarrito.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    // Mostrar mensaje de confirmación
    mostrarMensaje('Producto agregado al carrito correctamente', 'success');
}

// Función para mostrar el mensaje de confirmación
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.classList.add(tipo === 'success' ? 'mensaje-exito' : 'mensaje-error');
    document.body.appendChild(mensajeDiv);

    setTimeout(() => {
        mensajeDiv.remove();
    }, 1000); // El mensaje desaparece después de 3 segundos
}

// Mostrar el modal del carrito con una tabla
document.getElementById('ver-carrito-btn').addEventListener('click', () => {
    const carritoModal = document.getElementById('carrito-modal');
    const carritoLista = document.getElementById('carrito-lista');
    
    carritoLista.innerHTML = ''; // Limpiamos el contenido actual
    
    let totalSinIVA = 0;
    let totalConIVA = 0;

    // Crear tabla
    const table = document.createElement('table');
    table.classList.add('carrito-tabla');

    // Encabezados de la tabla
    const headers = `
        <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio sin IVA</th>
            <th>Precio con IVA</th>
        </tr>
    `;
    table.innerHTML = headers;

    // Agregar productos al carrito
    carrito.forEach(item => {
        const precioSinIVA = item.price * item.cantidad * tasaCambioUSDToCOP;
        const precioConIVA = precioSinIVA * (1 + IVA);
        
        totalSinIVA += precioSinIVA;
        totalConIVA += precioConIVA;

        const row = `
            <tr>
                <td><img src="${item.image_link}" alt="${item.name}" class="imagen-carrito"></td>
                <td>${item.name}</td>
                <td>${item.cantidad}</td>
                <td>$${precioSinIVA.toFixed(2)} COP</td>
                <td>$${precioConIVA.toFixed(2)} COP</td>
            </tr>
        `;
        table.innerHTML += row;
    });

    // Mostrar el total y el IVA en la tabla
    const totalRow = `
        <tr>
            <td colspan="3" style="text-align: right;"><strong>Total sin IVA:</strong></td>
            <td colspan="2"><strong>$${totalSinIVA.toFixed(2)} COP</strong></td>
        </tr>
        <tr>
            <td colspan="3" style="text-align: right;"><strong>Total con IVA:</strong></td>
            <td colspan="2"><strong>$${totalConIVA.toFixed(2)} COP</strong></td>
        </tr>
    `;

    table.innerHTML += totalRow;

    // Verificar si se aplica el envío gratis
    let costoEnvio = 0;
    if (totalConIVA < ENVIO_GRATIS_MIN) {
        costoEnvio = COSTO_ENVIO;
        const envioRow = `
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Costo de envío:</strong></td>
                <td colspan="2"><strong>$${costoEnvio.toFixed(2)} COP</strong></td>
            </tr>
        `;
        table.innerHTML += envioRow;
        totalConIVA += costoEnvio; // Sumar costo de envío si no es gratis
    }

    // Mostrar el total final en la tabla
    const totalFinalRow = `
        <tr>
            <td colspan="3" style="text-align: right;"><strong>Total final:</strong></td>
            <td colspan="2"><strong>$${totalConIVA.toFixed(2)} COP</strong></td>
        </tr>
    `;
    table.innerHTML += totalFinalRow;

    // Agregar la tabla al modal
    carritoLista.appendChild(table);

    // Mensaje de envío gratis fuera de la tabla
    const envioGratisDiv = document.createElement('div');
    envioGratisDiv.classList.add('mensaje-envio-gratis');
    envioGratisDiv.style.textAlign = 'center';
    envioGratisDiv.style.marginTop = '10px';
    if (totalConIVA > ENVIO_GRATIS_MIN) {
        envioGratisDiv.textContent = '¡Envío gratis por compras mayores a $150,000!';
    } else {
        envioGratisDiv.textContent = `Compra más de $150,000 para obtener envío gratis.`;
    }
    carritoLista.appendChild(envioGratisDiv);

    // Botón para finalizar la compra
    const finalizarCompraBtn = document.createElement('button');
    finalizarCompraBtn.classList.add('botonfin')
    finalizarCompraBtn.textContent = 'Finalizar Compra';
    finalizarCompraBtn.addEventListener('click', finalizarCompra);
    carritoLista.appendChild(finalizarCompraBtn);

    carritoModal.style.display = 'block'; // Mostrar el modal
});

// Función para cerrar el modal del carrito
document.getElementById('cerrar-carrito-btn').addEventListener('click', () => {
    const carritoModal = document.getElementById('carrito-modal');
    carritoModal.style.display = 'none'; // Ocultar el modal
});

// Función para finalizar la compra 
function finalizarCompra() {
    const totalFinal = carrito.reduce((total, item) => {
        const precioSinIVA = item.price * item.cantidad * tasaCambioUSDToCOP;
        const precioConIVA = precioSinIVA * (1 + IVA);
        return total + precioConIVA;
    }, 0);
    
    const mensaje = `
        Compra finalizada. ¡Gracias por tu compra!
        Total a pagar: $${totalFinal.toFixed(2)} COP
    `;
    
    alert(mensaje);
    
    carrito = []; // Vaciar el carrito
    document.getElementById('carrito-modal').style.display = 'none'; // Cerrar el modal
}
// Llamar a cargar los productos cuando el DOM esté listo
document.addEventListener("DOMContentLoaded",()=>{
    cargarProductos();
    document.getElementById('buscador').addEventListener('input', filtrarProductos);
} );
