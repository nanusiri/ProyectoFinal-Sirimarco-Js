let productos = [
    {
        id: 1,
        nombre: "BEEF JERKY: Original",
        precio: 700,
        stock: 10,
        img: "https://cdn.shopify.com/s/files/1/0186/5049/7124/products/1000000924280gJLBFORIGJERKCAHERO.png?v=1620250955"
    },
    {
        id: 2,
        nombre: "BEEF JERKY: Sweet & Hot",
        precio: 800,
        stock: 0,
        img: "https://images.albertsons-media.com/is/image/ABS/960130428-C1N1?$ng-ecom-pdp-mobile$&defaultImage=Not_Available"
    },
    {
        id: 3,
        nombre: "BEEF JERKY: Teriyaki",
        precio: 750,
        stock: 5,
        img: "https://www.jacklinks.com/shop/media/catalog/product/1/0/10000017985_3.25oz_jl_bf_teri_jerk_hero_2.png"
    },
    {
        id:4,
        nombre: "BEEF JERKY: Peppered",
        precio: 750,
        stock: 8,
        img: "https://www.ubuy.com.ar/productimg/?image=aHR0cHM6Ly9tLm1lZGlhLWFtYXpvbi5jb20vaW1hZ2VzL0kvOTFtNDYxeDRkakwuX1NMMTUwMF8uanBn.jpg",
    }
]

let login = document.getElementById("login")
let pantallaCompra = document.getElementById("pantallaCompra")

//REGISTRO
let usuario = document.getElementById("usuario")
let contrasenia = document.getElementById("contrasenia")
let registrarse = document.getElementById("registrarse")

registrarse.addEventListener("click", ()=>{
    let infoUsuario = {usuario: usuario.value, contrasenia: contrasenia.value}
    localStorage.setItem("infoUsuario", JSON.stringify(infoUsuario))
    alert("Registro exitoso, ya puede iniciar sesion")
})

//INICIAR SESION
let usuarioRegistrado = document.getElementById("usuarioRegistrado")
let contraseniaRegistrado = document.getElementById("contraseniaRegistrado")
let iniciarSesion = document.getElementById("iniciarSesion")

iniciarSesion.addEventListener("click", () =>{
    let infoUsuario = JSON.parse(localStorage.getItem("infoUsuario"))
    if (infoUsuario.usuario == usuarioRegistrado.value && infoUsuario.contrasenia == contraseniaRegistrado.value){
        login.classList.add("ocultar")
        pantallaCompra.classList.remove("ocultar")
    }   else {
        alert("Datos inconrrectos, intente de nuevo")
    }
})

//CERRAR SESION
let cerrarSesion = document.getElementById("cerrarSesion")

cerrarSesion.addEventListener("click", () =>{
    login.classList.remove("ocultar")
    pantallaCompra.classList.add("ocultar")
})

let carritoDOM = document.getElementById("carrito")

let carrito = JSON.parse(localStorage.getItem("carrito")) || []
renderizarCarrito(carrito)

//RENDER PRODUCTOS
renderizarProductos(productos)

function renderizarProductos(arrayProductos) {
    let contenedor = document.getElementById("contenedorProductos")
    contenedor.innerHTML = ""
    arrayProductos.forEach(({nombre, precio, img, id, stock}) => {
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
            let graciasMensaje = document.createElement("h3")
            graciasMensaje.textContent = "¡Gracias por su compra!"
            document.getElementById("agradecimiento").appendChild(graciasMensaje)

            setTimeout(function() {
            graciasMensaje.parentNode.removeChild(graciasMensaje)
            }, 3000)
        })
    })
}

//AGREGAR PRODUCTOS AL CARRITO
function agregarProductoAlCarrito(e) { 
    let productoBuscado = productos.find(producto => producto.id === Number(e.target.id))
    let posicionProd = productos.findIndex(producto => producto.id == e.target.id)
    if (productos[posicionProd].stock > 0) {
        
        let elementoSpan = document.getElementById("span"+e.target.id)
        productos[posicionProd].stock--
        elementoSpan.innerText = productos[posicionProd].stock
        
        if (carrito.some(producto => producto.id == productoBuscado.id)){
            let pos = carrito.findIndex(producto => producto.id === productoBuscado.id)
            carrito[pos].unidades++
            carrito[pos].subtotal = carrito[pos].precio * carrito[pos].unidades
        } else{
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
        alert("Producto sin stock")
    }
}

//RENDER CARRITO
function renderizarCarrito(arrayDeProductos) {
    carritoDOM.innerHTML = ""
    
    if (arrayDeProductos.length === 0) {
        carritoDOM.innerHTML = "<p class=mensajeCarrito>Ups! El carrito está vacío</p>"
        
    } else {
        arrayDeProductos.forEach(({nombre, precio, id, unidades, subtotal}) => {
            carritoDOM.innerHTML += `
            <div>
                <p class=contenido>${nombre} Precio: $${precio} Unidades: ${unidades} Subtotal: $${subtotal}</p>
                <button class="eliminar-producto" data-id="${id}">Eliminar producto</button>
            </div>
        `
        })
        function calcularTotal(arrayDeProductos){
            let total = 0
            for(let i = 0; i< arrayDeProductos.length; i++){
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
    let idProducto = Number(e.target.dataset.id)
    let pos = carrito.findIndex(producto => producto.id === idProducto)
    carrito.splice(pos, 1)
    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderizarCarrito(carrito)
}

//BUSCADOR
let buscador = document.getElementById("buscador")
buscador.addEventListener("input", filtrar)

function filtrar(e) {
    let arrayFiltrado = productos.filter( producto => producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()))
    renderizarProductos(arrayFiltrado)
}

let botonCarrito = document.getElementById("botonCarrito")
    botonCarrito.addEventListener("click", mostrarCarrito)

function mostrarCarrito() {
    let contenedorProductos = document.getElementById("contenedorProductos")
    carritoDOM.classList.toggle("ocultar")
    botonCarrito.innerText == "Entrar al carrito" ? botonCarrito.innerText = "Salir del carrito" : botonCarrito.innerText = "Entrar al carrito"
    contenedorProductos.classList.toggle("ocultar")
}



 
function finalizarCompra(){
    let mensajeCompra = document.createElement("h3")
    mensajeCompra.textContent = "¡Muchas gracias por su compra!"
    document.getElementById("mensajeCompra").appendChild(mensajeCompra)
    localStorage.removeItem("carrito") 
    carrito = []
    renderizarCarrito(carrito)

    setTimeout(() => {
        mensajeCompra.remove()
    }, 3000)
}
