import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import ModalViewDevNav from '../components/ModalViewDevNav';
import { carritoContext } from '../contexts/carritoContext';

const IndexDevNavidad = () => {
  const [ordenes, setOrdenes] = useState([]);
const { datosUsuario, apiBaseUrl } = useContext(carritoContext);  
    const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controlar la apertura del modal
  const [solicitudId, setSolicitudId] = useState(null); // Guardar el ID de la solicitud seleccionada
const [tableKey, setTableKey] = useState(0); // Key para forzar la actualización del DataTable
  // Simulamos obtener las órdenes desde la API
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/devnavidad/page.json`);
        const data = await response.json();
      
        // Filtrar las órdenes según el rol del usuario
        const ordenesFiltradas = 
  (datosUsuario.user.role === 'user1') 
    ? data.orden.filter(orden => orden.user_id == datosUsuario.user.id) // 'user1' solo ve sus propias órdenes
    : (datosUsuario.user.role === 'gerente') 
      ? data.orden.filter(orden => orden.sucursal == datosUsuario.user.sucursale.descripcion) // 'gerente' filtra por sucursal
      : data.orden; // Para otros roles, se muestran todas las órdenes



        setOrdenes(ordenesFiltradas);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Hubo un error al cargar las órdenes. Inténtalo nuevamente.'
        });
      }
    };

    fetchOrdenes();
  }, [ordenes,]);

    // Función para abrir el modal y pasar el ID de la solicitud
    const handleVerDetalles = (id) => {
        setSolicitudId(id);
        setIsModalOpen(true);
      };
 const handleAprobarPedido = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Verificar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${apiBaseUrl}/devnavidad/procesar/${id}.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                procesada: 0,
                fecha_procesada: new Date().toISOString(),
            }),
          });
  
          if (response.ok) {
            setOrdenes(prevOrdenes =>
              prevOrdenes.map(orden =>
                orden.id === id ? { ...orden, procesada: 0, fecha_procesada: new Date().toISOString() } : orden
              )
            );
            Swal.fire('Procesado', 'La solicitud ha sido procesada correctamente.', 'success');
            setTableKey(prevKey => prevKey + 1); // Forzar la actualización del DataTable
          } else {
            console.error('Error al procesar el pedido');
          }
        } catch (error) {
          console.error('Error al enviar la solicitud:', error);
        }
      }
    });
  };

  useEffect(() => {
    setTableKey(prevKey => prevKey + 1); // Forzar la actualización del DataTable al abrir el modal
  }, [isModalOpen]);

     const handleAnularPedido = async (id) => {
         Swal.fire({
           title: '¿Estás seguro?',
           text: '¡No podrás revertir esto!',
           icon: 'warning',
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#d33',
           confirmButtonText: 'Sí, anularlo'
         }).then(async (result) => {
           if (result.isConfirmed) {
             try {
               const response = await fetch(`${apiBaseUrl}/devnavidad/anular/${id}.json`, {
                 method: 'PUT',
                 headers: {
                   'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                   anulada: 1,
                   fecha_anulada: new Date().toISOString(),
                 }),
               });
       
               if (response.ok) {
                setOrdenes(preventDefault =>
                  preventDefault.map(pedido =>
                     pedido.id === id ? { ...pedido, anulada: 0, fecha_anulada: new Date().toISOString() } : pedido
                   )
                 );
                 Swal.fire('Anulado', 'El pedido ha sido anulado.', 'success');
                 setTableKey(prevKey => prevKey + 1); // Forzar la actualización del DataTable
               } else {
                 console.error('Error al anular el pedido');
               }
             } catch (error) {
               console.error('Error al enviar la solicitud:', error);
             }
           }
         });
       };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center" >Órdenes de Devolución de Inventario Navidad</h2>

      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <table className="table table-striped table-bordered mt-4">
          <thead>
            <tr className="table-primary text-center fw-bold ">
              <th>#</th>
              <th>Fecha de Creación</th>
              <th>N° Solicitud</th>
              <th>Sucursal</th>
              <th>Procesada</th>
              <th>Precinto</th>
              <th>Comentario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden, index) => (
            <tr 
            key={orden.id} 
            className={`text-center ${orden.procesada == 0 ? 'table-success' : ''} ${orden.anulada == 0 ? 'table-danger' : ''}`}
          >
                <td>{index + 1}</td>

                <td>{new Date(orden.created).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                <td>{orden.nsolicitud || 'No disponible'}</td>
                <td>{orden.sucursal}</td>
                <td>{orden.procesada == 0 ? 'Si' : 'No'}</td>
                <td>{orden.nprecinto}</td>
                <td>{orden.comentario}</td>
               
                
                <td>
                  <div className="d-flex justify-content-center align-items-end ">
                    <button
                      className="btn btn-info btn-sm text-white mx-1"
                      onClick={() => handleVerDetalles(orden.id)} // Abrir el modal con el ID de la solicitud
                    >
                      Ver 
                    </button>

                    {(orden.procesada == 1 && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user2')) && (
                      <button
                        className="btn btn-success btn-sm text-white mx-1"
                        onClick={() => handleAprobarPedido(orden.id)}
                      >
                        Verificar
                      </button>
                    )}
                    {(orden.anulada == 1 && orden.procesada == 1  && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user2')) && (
                       <button
                       className="btn btn-danger btn-sm text-white mx-1"
                       onClick={() => handleAnularPedido(orden.id)}
                       >
                       Anular 
                     </button>
                    )}
                   
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal para ver los detalles de la devolución */}
      <ModalViewDevNav
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        solicitudId={solicitudId}
      />
    </div>
  );
};

export default IndexDevNavidad;
