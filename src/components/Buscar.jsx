import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { carritoContext } from "../contexts/carritoContext";

const Buscar = () => {
  const { datosUsuario } = useContext(carritoContext);
  const location = useLocation();
  const valueSearch = location.state;
  const API = 'http://192.168.0.107/ped2/ordenPedidos/search.json?parametro=';

  const [datos, setDatos] = useState([]);
  const navigate = useNavigate();

  const getDatos = async (valueSearch) => {
    try {
      const URI = API + valueSearch;
      const response = await fetch(URI);
      const data = await response.json();
      setDatos(data.orden);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDatos(valueSearch);
  }, [valueSearch]);

  const handleAnularPedido = (id) => {
    // Función para manejar la anulación del pedido
  };

  // Filtrar y mapear las órdenes según el rol del usuario
  const filteredOrders = datos.filter((orden) => {
    if (datosUsuario.user.role === 'user1') {
      return orden.role === datosUsuario.user.role;
    } else {
      return true; // Mostrar todas las órdenes para el rol 'admin'
    }
  });
  const handleBack = () => {
    navigate(-1); // Navega hacia atrás usando navigate con el valor -1
  };

  return (
    <div className="container">
      <h1 className="text-center py-3">Buscar por ({valueSearch})</h1>
      <div className="row">
      <div className="text-start py-4">
        <button className="btn btn-ligth active" onClick={handleBack}>
        <i class='bx bx-arrow-back'></i> Regresar
        </button>
      </div>
        <table className='table table-striped table-hover table-bordered table-condensed table-responsive text-center'>
          <thead>
            <tr className='table-info'>
              <th>Numero de pedido</th>
              <th>Fecha de pedido</th>
              <th>Sucursal</th>
              <th>Anulada</th>
              <th className='table-secondary'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.filter(orden => {
              if (datosUsuario.user.role == 'admin') {
                return true; // Si es admin, mostrar todos los pedidos
              } else if (datosUsuario.user.role == 'user1') {
                return  orden.user_id == datosUsuario.user.id; //solo los pedidos del usuario
              } else if (datosUsuario.user.role == 'user2') {
                return true; // Si es user2, mostrar todos los pedidos
              } else {
                return  orden.user_id == datosUsuario.user.id;
              }
            }).map((orden, index) => (
              <tr key={index} className={orden.anulada == 0 ? 'table-danger' : ''}>
                <td>{orden.numero_ped}</td>
                <td>{orden.created}</td>
                <td>{orden.sucursal}</td>
                <td>
                  {orden.anulada == 1 ? (
                    <i className='btn btn-lg bx bx-check-circle' style={{ color: '#1ef100' }}></i>
                  ) : (
                    <i className='btn btn-lg bx bx-block btn-lg' style={{ color: '#f10b0b' }}></i>
                  )}
                </td>
                <td>
                  <button className='btn btn-info btn-md mx-2'>
                    <Link style={{ textDecoration: 'none', color: 'white' }} to={`/ViewPage/${orden.id}`}>
                      <span>Ver</span>
                    </Link>
                  </button>
                  {(datosUsuario.user.role === 'user1' || datosUsuario.user.role === 'admin') && orden.anulada === 1 && (
                    <button className='btn btn-danger' onClick={() => handleAnularPedido(orden.id)}>Anular</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default Buscar;
