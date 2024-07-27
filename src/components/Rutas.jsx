import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Footer from './Footer';
import { RutasProtegidas } from './RutasProtegidas';
import { carritoContext } from '../contexts/carritoContext';
import { useContext } from 'react'

import Formulario from '../pages/Formulario';
import Header from './Header';
import Inicio from '../pages/Inicio';


import IndexPage from '../pages/IndexPage';
import ViewPage from '../pages/ViewPage';
import EditFormulario from '../pages/EditFormulario';
import Busquedas from '../pages/Busquedas';
import Verificacion from '../pages/Verificacion';
import Formulario2 from '../pages/Formulario2';




const Rutas = () => {
  const { validado } = useContext(carritoContext)
  return (
    <>
   <BrowserRouter>
      <Header/>
      <Routes>
      
        <Route path="/inicio" element={<Inicio />} />
      
      
      
     
        <Route path="*" element={<Inicio />} />
      
  
        <Route element={<RutasProtegidas validado={validado}/>}>
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/IndexPage" element={<IndexPage />} />
        <Route path="/ViewPage/:id" element={<ViewPage />} />
        <Route path="/EditFormulario/:id" element={<EditFormulario />} />
        <Route path="/Busquedas" element={<Busquedas />} />
        <Route path="/verificacion/:id" element={<Verificacion />} />
        <Route path="/formulario2" element={<Formulario2 />} />
        
    

          </Route>
      </Routes>
      
      <Footer />
    </BrowserRouter>
   
   </>
  )
}

export default Rutas
