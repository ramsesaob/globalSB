import { useEffect, useState } from "react";
import { carritoContext } from "./carritoContext"

const Carrito = ({children}) => {
    const [validado, setValidado] = useState(false);
    const [datosUsuario, setDatosUsuario] = useState([]);
     //const [cart, setCart] = useState([]);
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
    const apiBaseUrl = 'http://192.168.0.195/apick';
   //   const apiBaseUrl = 'https://globalbusiness.ddns.net:12443/apick';
    //const apiBaseUrl = 'https://globalbusiness.ddns.net:12443/api_local';
   // const apiBaseUrl = 'http://192.168.0.195/api_local';
    useEffect(() => {
      // Guardar el estado cart en el localStorage
      localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

  /**   const agregar = (producto, cant) =>{
      if(producto.stock >= cant){
        setCart((currItems)=>{
            const isItemInCart = currItems.find((item)=> item.id === producto.id)
            if(isItemInCart){
                return currItems.map((item)=>{
                  if(item.id === producto.id){
                    
                    return {...item, cantidad: item.cantidad = cant};

                  }else{
                    return item;
                  }  
                })
        }else{
            return [...currItems, {...producto, cantidad: cant}];
        }
        })
      }else{
        alert("La cantidad no puede ser mayor al STOCK!!!!")
      }
        //setCart([...cart, producto])
       //console.log("agregado")
       //console.log(cart)
    }

    const vaciar = () =>{
      const confirmarEliminar = window.confirm("¿Estás seguro de que deseas vaciar  carrito?");
      
      if (confirmarEliminar) {
        setCart([])
      }
    }

    const eliminar = (id) => {
      const confirmarEliminar = window.confirm("¿Estás seguro de que deseas eliminar este elemento del carrito?");
      
      if (confirmarEliminar) {
    
        setCart((currItems) => {
          return currItems.filter((item) => item.id !== id);
        });
      }
    };

    const comprar = () => {
      if (validado) {
        fetch('https://dummyjson.com/carts/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            products: cart.map((item) => ({
              id: item.id,
              quantity: item.cantidad
            }))
          })
        })
          .then((res) => res.json())
          .then(console.log);
        alert("Gracias por su compra");
        setCart([]);
      } else {
        // Handle the case when the user is not logged in
        alert("Debe iniciar sesión para realizar la compra");
        // You can redirect the user to a login page or display an error message
      }
    };
 */
    const salir = () => {
      setValidado(false)
      setDatosUsuario(null)
    }
   
  return (
    <carritoContext.Provider 
        value={{ validado, setValidado, datosUsuario, setDatosUsuario, salir, apiBaseUrl}}>
        {children}
    </carritoContext.Provider>
  )
}

export default Carrito