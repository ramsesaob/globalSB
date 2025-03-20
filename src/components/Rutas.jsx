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
import Tendencias from '../pages/Tendencias';
import Perfil from '../pages/Perfil';
import ExcelUpload from '../pages/ExcelUpload';
import FormularioCompra from '../pages/FormularioCompra';
import Inicio2 from '../pages/Inicio2';
import Ofertas from '../pages/Ofertas';
import AnalisisLogistica from '../pages/AnalisisLogistica';
import PorcentajeSuc from '../pages/PorcentajeSuc';
import IndexPageCompra from '../pages/IndexPageCompra';
import ViewPageCompra from '../pages/ViewPageCompra';
import VerificacionCompra from '../pages/VerificacionCompra';
import Biometrico from '../pages/Biometrico';
import PersonListaB from '../pages/PersonListaB';
import RepAsistencia from '../pages/RepAsistencia';
import SolNavidadDev from '../pages/SolNavidadDev';
import IndexDevNavidad from '../pages/IndexDevNavidad';
import SolInsuficiencia from '../pages/SolInsuficiencia';
import IndexInsf from '../pages/IndexInsf';
import ViewPageInsf from '../pages/ViewPageInsf';
import EditarInsf from '../pages/EditarInsf';
import VerificacionInsf from '../pages/VerificacionInsf';
import ViewItemsDiferencia from '../pages/ViewItemsDiferencia';
import IndexPersonDescuentos from '../pages/IndexPersonDescuentos';
import IndexAjustesProc from '../pages/IndexAjustesProc';



const Rutas = () => {
  const { validado } = useContext(carritoContext)
  return (
    <>
   <BrowserRouter>
      <Header/>
      <Routes>
      
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/inicio2" element={<Inicio2 />} />
        
      
      
      
     
        <Route path="*" element={<Inicio />} />
      
  
        <Route element={<RutasProtegidas validado={validado}/>}>
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/IndexPage" element={<IndexPage />} />
        <Route path="/ViewPage/:id" element={<ViewPage />} />
        <Route path="/EditFormulario/:id" element={<EditFormulario />} />
        <Route path="/Busquedas" element={<Busquedas />} />
        <Route path="/verificacion/:id" element={<Verificacion />} />
        <Route path="/formulario2" element={<Formulario2 />} />
        <Route path="/tendencias" element={<Tendencias />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/ExcelUpload" element={<ExcelUpload />} />
        <Route path="/FormularioCompra" element={<FormularioCompra />} />
        <Route path="/Ofertas" element={<Ofertas />} />
        <Route path="/AnalisisLogistica" element={<AnalisisLogistica />} />
        <Route path="/PorcentajeSuc" element={<PorcentajeSuc />} />
        <Route path="/IndexPageCompra" element={<IndexPageCompra />} />
        <Route path="/ViewPageCompra/:id" element={<ViewPageCompra />} />
        <Route path="/VerificacionCompra/:id" element={<VerificacionCompra />} />
        <Route path="/Biometrico" element={<Biometrico />} />
        <Route path="/PersonListaB" element={<PersonListaB />} />
        <Route path="/RepAsistencia" element={<RepAsistencia />} />
        <Route path="/SolNavidadDev" element={<SolNavidadDev />} />
        <Route path="/IndexDevNavidad" element={<IndexDevNavidad />} />
        <Route path="/SolInsuficiencia" element={<SolInsuficiencia />} />
        <Route path="/IndexInsf" element={<IndexInsf />} />
        <Route path="/ViewPageInsf/:id" element={<ViewPageInsf />} />
        <Route path="/EditarInsf/:id" element={<EditarInsf />} />
        <Route path="/VerificacionInsf/:id" element={<VerificacionInsf />} />
        <Route path="/ViewItemsDiferencia" element={<ViewItemsDiferencia />} />
        <Route path="/IndexPersonDescuentos" element={<IndexPersonDescuentos />} />
        <Route path="/IndexAjustesProc" element={<IndexAjustesProc />} />

        




        

        
        
    

          </Route>
      </Routes>
      
      <Footer />
    </BrowserRouter>
   
   </>
  )
}

export default Rutas
