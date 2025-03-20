import React from 'react';
import Rutas from './components/Rutas';
import Carrito from './contexts/Carrito';



const App = () => {
  return (

    <Carrito>
      
        <Rutas />
    
    </Carrito>

  );
};

export default App;
