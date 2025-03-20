import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carritoContext } from '../contexts/carritoContext';
import Login from './Login';
import logo from '../assets/logo.png';

const NavMenu = ({ role }) => {
  
  switch (role) {
    case 'admin':
      return (
        <>
          <li className="nav-item">
            <Link to="/Inicio" className="nav-link active" aria-current="page">
              <i className='bx bx-home'></i>Inicio
            </Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className='bx bx-list-ul'></i> Solicitud
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/Formulario" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Inventario</Link></li>
              <li><Link to="/Formulario2" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Inventario Navidad</Link></li>
              <li><Link to="/FormularioCompra" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Compra</Link></li>
              <li><Link to="/SolNavidadDev" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Devolucion de Navidad</Link></li>
              <li><Link to="/SolInsuficiencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Justificacion de Incidencias Pendientes</Link></li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-archive'></i>Ordenes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/IndexPage" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ordenes Inventario</Link></li>
              <li><Link to="/IndexDevNavidad" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Ordenes Devolucion Navidad</Link></li>
              
           
              <li><Link to="/IndexPageCompra" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ordenes Compra</Link></li>
              <li><Link to="/IndexPersonDescuentos" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Descuentos </Link></li>
              
            </ul>
          </li>
          <li className="nav-item">
            <Link to="/ExcelUpload" className="nav-link active" aria-current="page">
            <i className='bx bxs-file'></i>Ofertas de Ventas
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/Ofertas" className="nav-link active" aria-current="page">
            <i className='bx bxs-file'></i>Ofertas
            </Link>
            
          </li>
         
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-report'></i> Reportes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/PorcentajeSuc" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Existencia en Sucursales</Link></li>
              
           
              <li><Link to="/AnalisisLogistica" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Analísis logistica</Link></li>
              
            </ul>
          </li>
        
              <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-report'></i>Biometrico
            </a>
            <ul className="dropdown-menu">
            <li><Link to="/Biometrico" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Biometrico</Link></li>
            <li><Link to="/RepAsistencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Asistencia</Link></li>
            <li><Link to="/PersonListaB" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>lista personas</Link></li>
       
             
            </ul>
          </li>
            

        </>
      );
    case 'user1':
      return (
        <>
          <li className="nav-item">
            <Link to="/Inicio" className="nav-link active" aria-current="page">
              <i className='bx bx-home'></i>Inicio
            </Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className='bx bx-list-ul'></i> Solicitud
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/Formulario" className="nav-link active" aria-current="page">Solicitud Inventario</Link></li>
              <li><Link to="/Formulario2" className="nav-link active" aria-current="page">Solicitud Inventario Navidad</Link></li>
              <li><Link to="/SolNavidadDev" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Devolucion de Navidad</Link></li>
              <li><Link to="/SolInsuficiencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Justificacion de Incidencias Pendientes</Link></li>
             {/* <li><Link to="/FormularioCompra" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Compra</Link></li> **/} 
            </ul>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-archive'></i>Ver Ordenes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/IndexPage" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Mis Ordenes Rep Inventario</Link></li>
              <li><Link to="/IndexDevNavidad" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Mis Ordenes Devolucion Navidad</Link></li>
              <li><Link to="/IndexInsf" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Mis Ordenes Insf</Link></li>
              
             {/* <li><Link to="/FormularioCompra" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Compra</Link></li> **/} 
            </ul>
          </li>
          { /**   <li className="nav-item">
            <Link to="/IndexPage" className="nav-link active" aria-current="page">
              <i className='bx bxs-archive'></i>Ver Ordenes
            </Link>
          </li> **/}
       
        </>
      );
    case 'user2':
      return (
        <>
          <li className="nav-item">
            <Link to="/Inicio" className="nav-link active" aria-current="page">
              <i className='bx bx-home'></i>Inicio
            </Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-archive'></i>Ordenes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/IndexPage" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Ordenes Inventario</Link></li>
              <li><Link to="/IndexDevNavidad" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Ordenes Devolucion Navidad</Link></li>
              <li><Link to="/IndexInsf" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Ordenes Insf</Link></li>
            </ul>
          </li>
          <li className="nav-item">
            <Link to="/ExcelUpload" className="nav-link active" aria-current="page">
              <i className='bx bxs-archive'></i>Excelupload
            </Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-report'></i> Reportes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/PorcentajeSuc" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Existencia en Sucursales</Link></li>
              
           
              <li><Link to="/AnalisisLogistica" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Analísis logistica</Link></li>
              
            </ul>
          </li>
        </>
      );
    case 'user4':
        return (
          <>
            <li className="nav-item">
              <Link to="/Inicio" className="nav-link active" aria-current="page">
                <i className='bx bx-home'></i>Inicio
              </Link>
            </li>
           
            
            <li className="nav-item">
              <Link to="/ExcelUpload" className="nav-link active" aria-current="page">
                <i className='bx bxs-archive'></i>Excelupload
              </Link>
            </li>
          </>
        );
    //usuarios del biometrico RRHH
    case 'user5':
          return (
            <>
              <li className="nav-item">
                <Link to="/Inicio" className="nav-link active" aria-current="page">
                  <i className='bx bx-home'></i>Inicio
                </Link>
              </li>
              <li className="nav-item dropdown">
                    <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className='bx bxs-report'></i>Biometrico
                    </a>
                    <ul className="dropdown-menu">
                    <li><Link to="/Biometrico" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Biometrico</Link></li>
                    <li><Link to="/RepAsistencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Asistencia</Link></li>
                    
                    
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className='bx bxs-report'></i>Descuentos
                    </a>
                    <ul className="dropdown-menu">
                    <li><Link to="/IndexPersonDescuentos" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Descuentos </Link></li>
                    
                    
                    </ul>
                  </li>
            

               
            
            </>
          );
    /* TIENDAS RRHH */
    case 'user6':
            return (
              <>
                <li className="nav-item">
                  <Link to="/Inicio" className="nav-link active" aria-current="page">
                    <i className='bx bx-home'></i>Inicio
                  </Link>
                </li>
                <li className="nav-item dropdown">
                    <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className='bx bxs-report'></i>Biometrico
                    </a>
                    <ul className="dropdown-menu">
                    <li><Link to="/Biometrico" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Biometrico</Link></li>
                    <li><Link to="/RepAsistencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Asistencia</Link></li>
                    
                    
                    </ul>
                  </li>
              
              </>
            );
    //gerentes de tiendas
    case 'gerente':
      return (
        <>
          <li className="nav-item">
            <Link to="/Inicio" className="nav-link active" aria-current="page">
              <i className='bx bx-home'></i>Inicio
            </Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i className='bx bx-list-ul'></i> Solicitud
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/Formulario" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Inventario</Link></li>
              <li><Link to="/Formulario2" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Inventario Navidad</Link></li>
              
              <li><Link to="/SolNavidadDev" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Solicitud Devolucion de Navidad</Link></li>
              <li><Link to="/SolInsuficiencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Justificacion de Incidencias Pendientes</Link></li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-archive'></i>Ordenes
            </a>
            <ul className="dropdown-menu">
              <li><Link to="/IndexPage" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Mis Ordenes de Inventario</Link></li>
              <li><Link to="/IndexDevNavidad" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Mis Ordenes Devolucion Navidad</Link></li>
              <li><Link to="/IndexInsf" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Ver Ordenes Insuficiencia</Link></li>
           
           
              
            </ul>
          </li>
         
       
        
        
              <li className="nav-item dropdown">
            <a className="nav-link active" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className='bx bxs-report'></i>Biometrico
            </a>
            <ul className="dropdown-menu">
            <li><Link to="/Biometrico" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Biometrico</Link></li>
            <li><Link to="/RepAsistencia" className="nav-link active" aria-current="page"><i className='bx bx-chevron-right'></i>Reporte Asistencia</Link></li>
         
       
             
            </ul>
          </li>
            

        </>
      );
    default:
      return null;
  }
};

const Header = () => {
  const [show, setShow] = useState(false);
  const { cart, salir, validado, datosUsuario } = useContext(carritoContext);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/busquedas', { state: inputValue });
  };

  const navStyle = {
    background: '#000000',
    background: '-webkit-linear-gradient(to bottom, #0f9b0f, #000000)',
    background: 'linear-gradient(to bottom, #0f9b0f, #000000)',
    
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg p-2" data-bs-theme="dark" style={navStyle}>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={logo} alt="logo" width={30} className="rounded" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
            {validado ? (
              <>
                <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                  <NavMenu role={datosUsuario.user.role} />
                </ul>
                <ul className="navbar-nav ml-auto" data-bs-theme="dark">
                  <li className="nav-item dropdown text-white" data-bs-theme="dark">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="mx-2 text-dark fw-bold text-white">{`${datosUsuario.user.nombre}`}</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><Link to="/Tendencias" className="nav-link active" aria-current="page">Tendencias</Link></li>
                      <li><Link to="/Perfil" className="nav-link active" aria-current="page">Mi perfil</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href="#" onClick={() => salir()}>
                        <button className="btn btn-danger d-flex align-items-center">
                          Cerrar Sesión <i className='bx bx-log-out bx-sm ms-1'></i>
                        </button>
                      </a></li>
                    </ul>
                  </li>
                </ul>
              </>
            ) : (
              <a className="btn btn-light btn-lg btn-outline-dark text-center" href="#" onClick={() => setShow(true)}>
                <i className='bx bx-user'></i> Login
              </a>
            )}
          </div>
        </div>
      </nav>
      <Login show={show} handleClose={() => setShow(false)} />
    </>
  );
};

export default Header;
