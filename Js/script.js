fetch("./data.json")
    .then(respuesta => respuesta.json())
    .then(productos => {
        miPrograma(productos)
    })

function miPrograma(productos){

let login = document.getElementById("login")
let pantallaCompra = document.getElementById("pantallaCompra")

//REGISTRO
let usuario = document.getElementById("usuario")
let contrasenia = document.getElementById("contrasenia")
let registrarse = document.getElementById("registrarse")

registrarse.addEventListener("click", () => {
    let infoUsuario = { usuario: usuario.value, contrasenia: contrasenia.value }
    if (usuario.value != "" && contrasenia.value != "") {
        localStorage.setItem("infoUsuario", JSON.stringify(infoUsuario))
        lanzarAlertaToast("Registro exitoso!")
    } else {
        lanzarAlertaSweet("center", "Ups!", "No ingreso usuario o contraseña valida", "error", true)
    }
})

//INICIAR SESION
let usuarioRegistrado = document.getElementById("usuarioRegistrado")
let contraseniaRegistrado = document.getElementById("contraseniaRegistrado")
let iniciarSesion = document.getElementById("iniciarSesion")

iniciarSesion.addEventListener("click", () => {
    let infoUsuario = JSON.parse(localStorage.getItem("infoUsuario"))
    if (infoUsuario.usuario == usuarioRegistrado.value && infoUsuario.contrasenia == contraseniaRegistrado.value) {
        login.classList.add("ocultar")
        pantallaCompra.classList.remove("ocultar")
    } else {
        lanzarAlertaSweet("center", "Intente de nuevo!", "Usuario o contraseña incorrectos.", "error", true)
    }
})

//CERRAR SESION
let cerrarSesion = document.getElementById("cerrarSesion")

cerrarSesion.addEventListener("click", () => {

    Swal.fire({
        icon: "question",
        text: "Esta seguro que quiere cerrar sesion?",
        showCancelButton: true,
        confirmButtonText: 'Sí, seguro',
        cancelButtonText: 'No, no quiero'
    }).then((result) => {
        if (result.isConfirmed) {
            login.classList.remove("ocultar")
            pantallaCompra.classList.add("ocultar")
        }
    })
})

let carritoDOM = document.getElementById("carrito")

let carrito = JSON.parse(localStorage.getItem("carrito")) || []
renderizarCarrito(carrito)

//RENDER PRODUCTOS
renderizarProductos(productos)

function renderizarProductos(arrayProductos) {
    let contenedor = document.getElementById("contenedorProductos")
    contenedor.innerHTML = ""
    arrayProductos.forEach(({ nombre, precio, img, id, stock }) => {
        let tarjetaProducto = document.createElement("div")

        tarjetaProducto.className = "tarjetaProducto"

        tarjetaProducto.innerHTML = `
        <h3 class=tituloProducto>${nombre}</h3>
        <img src=${img}>
        <p>Precio: $${precio}</p>
        <p class=stock>Quedan <span id=span${id}>${stock}</span> unidades</p>
        <button id=${id}>AREGAR AL CARRITO</button>
        <br><br>
        <button class="comprar-ya" id="comprar-ya-${id}">COMPRAR YA</button>
        `

        contenedor.append(tarjetaProducto)

        let boton = document.getElementById(id)
        boton.addEventListener("click", agregarProductoAlCarrito)

        let botonComprarYa = document.getElementById(`comprar-ya-${id}`)
        botonComprarYa.addEventListener("click", () => {
            let prod = productos.find(p => p.id === id)
            if (prod.stock > 0) {
                lanzarAlertaSweet("center", "Muchas gracias por su compra!", "", "success", false, 1500)
                let elementoSpan = document.getElementById("span" + prod.id)
                prod.stock--
                elementoSpan.innerText = prod.stock
            } else {
                lanzarAlertaSweet("center", "Sin stock!", "No hay mas stock del producto seleccionado", "error", true)
            }
        })
    })
}

//AGREGAR PRODUCTOS AL CARRITO
function agregarProductoAlCarrito(e) {
    let productoBuscado = productos.find(producto => producto.id === Number(e.target.id))
    let posicionProd = productos.findIndex(producto => producto.id == e.target.id)

    if (productos[posicionProd].stock > 0) {
        lanzarAlertaToast("Producto agregado al carrito!")

        let elementoSpan = document.getElementById("span" + e.target.id)
        productos[posicionProd].stock--
        elementoSpan.innerText = productos[posicionProd].stock

        if (carrito.some(producto => producto.id == productoBuscado.id)) {
            let pos = carrito.findIndex(producto => producto.id === productoBuscado.id)
            carrito[pos].unidades++
            carrito[pos].subtotal = carrito[pos].precio * carrito[pos].unidades
        } else {
            carrito.push({
                id: productoBuscado.id,
                nombre: productoBuscado.nombre,
                precio: productoBuscado.precio,
                unidades: 1,
                subtotal: productoBuscado.precio
            })
        }

        localStorage.setItem("carrito", JSON.stringify(carrito))
        renderizarCarrito(carrito)

    } else {
        lanzarAlertaSweet("center", "Sin stock!", "No hay mas stock del producto seleccionado", "error", true)
    }
}

//RENDER CARRITO
function renderizarCarrito(arrayDeProductos) {
    carritoDOM.innerHTML = ""

    if (arrayDeProductos.length === 0) {
        carritoDOM.innerHTML = "<p class=mensajeCarrito>Ups! El carrito está vacío</p>"

    } else {
        arrayDeProductos.forEach(({ nombre, precio, id, unidades, subtotal }) => {
            carritoDOM.innerHTML += `
            <div>
                <p class=contenido>${nombre} Precio: $${precio} Unidades: ${unidades} Subtotal: $${subtotal}</p>
                <button class="eliminar-producto" data-id="${id}">Eliminar producto</button>
            </div>
        `
        })
        function calcularTotal(arrayDeProductos) {
            let total = 0
            for (let i = 0; i < arrayDeProductos.length; i++) {
                total += arrayDeProductos[i].subtotal
            }
            return total
        }
        let totalAPagar = calcularTotal(arrayDeProductos)
        carritoDOM.innerHTML += `
        <h3 class=total>TOTAL A PAGAR: $${totalAPagar}</h3>
        <button id="comprar">Comprar carrito</button>
        `

        let botonComprar = document.getElementById("comprar")
        botonComprar.addEventListener("click", finalizarCompra)

        let botonesEliminar = document.querySelectorAll(".eliminar-producto")
        botonesEliminar.forEach(boton => boton.addEventListener("click", eliminarProducto))
    }
}

//ELIMINAR PRODUCTO DEL CARRITO
function eliminarProducto(e) {
    Swal.fire({
        icon: "question",
        text: "Esta seguro que quiere eliminar este producto del carrito?",
        showCancelButton: true,
        confirmButtonText: 'Sí, seguro',
        cancelButtonText: 'No, no quiero'
    }).then((result) => {
        if (result.isConfirmed) {
            let idProducto = Number(e.target.dataset.id)
            let pos = carrito.findIndex(producto => producto.id === idProducto)
            carrito.splice(pos, 1)
            localStorage.setItem("carrito", JSON.stringify(carrito))
            renderizarCarrito(carrito)
        }
    })
}

//BUSCADOR
let buscador = document.getElementById("buscador")
let botonBuscar = document.getElementById("buscar")
buscador.addEventListener("keypress", function (e) {
  if (e.key === 'Enter') {
    filtrar()
  }
})

botonBuscar.addEventListener("click", filtrar)

function filtrar() {
  let arrayFiltrado = productos.filter(producto => producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()))
  
  if (arrayFiltrado.length === 0) {
    let contenedor = document.getElementById("contenedorProductos")
    contenedor.innerHTML = "<h2>Ups! No se encontraron coincidencias</h2>"
  } else {
    renderizarProductos(arrayFiltrado)
  }
}


//FUNCIONES
let botonCarrito = document.getElementById("botonCarrito")
botonCarrito.addEventListener("click", mostrarCarrito)

function mostrarCarrito() {
    let contenedorProductos = document.getElementById("contenedorProductos")
    carritoDOM.classList.toggle("ocultar")
    botonCarrito.innerText == "Entrar al carrito" ? botonCarrito.innerText = "Salir del carrito" : botonCarrito.innerText = "Entrar al carrito"
    contenedorProductos.classList.toggle("ocultar")
}



function finalizarCompra() {
    lanzarAlertaSweet('center', 'Muchas gracias por su compra', "", "success", false, 1500)

    localStorage.removeItem("carrito")
    carrito = []
    renderizarCarrito(carrito)
}

function lanzarAlertaSweet(position, title, text, icon, showConfirmButton, timer) {
    Swal.fire({
        position,
        title,
        text,
        icon,
        showConfirmButton,
        timer,
    })
}

function lanzarAlertaToast(text) {
    Toastify({
        text: text,
        duration: 3000,
        newWindow: true,
        close: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #093e17, #067411)",
        },
    }).showToast();
}
}
