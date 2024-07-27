import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Rutas from './components/Rutas';
import Carrito from './contexts/Carrito';




const App = () => {
 
 
  return (
    <>

    <Carrito>
   <Rutas/>
   </Carrito>

   </>
  )
}

export default App