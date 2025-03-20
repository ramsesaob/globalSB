import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';
import ModalViewDatosInsfSap from '../components/ModalViewDatosInsfSap';

const ViewPageInsf = () => {
  const [solInsuficiencia, setSolInsuficiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
  const [selectedItem, setSelectedItem] = useState(null); // Estado para el item seleccionado

  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/ordeninsf/view/${id}.json`);
        setSolInsuficiencia(response.data.solInsuficiencia);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar los detalles.");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, showModal]); // Solo ejecutar cuando cambie el ID

  if (loading) return (
    <div className="text-center my-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  const handleBack = () => {
    navigate(-1); // Navega hacia atrás
  };

  const handleShowModal = (item) => {
    setSelectedItem(item);  // Establece el item seleccionado
    setShowModal(true);      // Muestra el modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-light active border-success text-success mb-3 "
        onClick={handleBack}
      >
        <i className="bx bx-arrow-back"></i> Regresar
      </button>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Detalle de la Solicitud de Insuficiencia</h3>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-sm-12 col-md-4">
              <h5><strong>Número de solicitud:</strong> {solInsuficiencia.nsolicitud}</h5>
              <h5><strong>Tienda:</strong> {solInsuficiencia.user.sucursale.descripcion}</h5>
              <h5><strong>Fecha:</strong> {moment(solInsuficiencia.created).format('YYYY-MM-DD')}</h5>
            </div>

            <div className="col-sm-12 col-md-4">
              <h5><strong>Motivo:</strong> {solInsuficiencia.motivo}</h5>
              <h5><strong>Responsable Conteo:</strong> {solInsuficiencia.comentario}</h5>
            </div>

            <div className="col-sm-12 col-md-4">
              <h5 className="text-black"><strong>Status:</strong></h5>
              <h3 className="text-white bg-info text-center">{solInsuficiencia.status}</h3>
            </div>

            {datosUsuario?.user.role === 'user2' && solInsuficiencia?.status === 'Ajuste Confirmado' && (
              <div className="col-sm-12 col-md-2">
                <button
               width="10%"
               className="btn btn-light  border-success text-info mb-3 "
               onClick={() => handleShowModal(solInsuficiencia)} // Pasar el item seleccionado
               style={{ marginLeft: 'auto' }}

             >
               Ver Detalles
             </button>
            </div> )}
            {datosUsuario?.user.role === 'user2' && solInsuficiencia?.status === 'Finalizada' && (
              <div className="col-sm-12 col-md-2">
                <button
               width="10%"
               className="btn btn-light  border-success text-info mb-3 "
               onClick={() => handleShowModal(solInsuficiencia)} // Pasar el item seleccionado
               style={{ marginLeft: 'auto' }}

             >
               Ver Detalles
             </button>
            </div> )}

            {datosUsuario?.user.role === 'user2' && solInsuficiencia?.status === 'Pendiente de Confirmación' && (
              <div className="col-sm-12 col-md-2">
                <button
               width="10%"
               className="btn btn-light  border-success text-info mb-3 "
               onClick={() => handleShowModal(solInsuficiencia)} // Pasar el item seleccionado
               style={{ marginLeft: 'auto' }}

             >
               Ver Detalles
             </button>
            </div> )}
           
          </div>

          <h4 className="mt-1 mb-3 text-center fw-bold text-info">
            Detalles de los Items de Insuficiencia:
          </h4>

          <div className="table-responsive">
            <table className="table table-sm text-center">
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>Fecha Insuficiencia</th>
                  <th>Item</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Fecha Conteo</th>
                  <th>Conteo de Pieza</th>
                  <th>Comentario</th>
                  <th>Codigos Ajuste</th>
                  <th>Descripcion</th>
                  <th>Motivo</th>  
                  <th>Stock Sistema</th>
                  <th>Stock Fisico</th>

                  {/* Mostrar columnas de precios y total solo si el rol es 'user02' o 'admin' */}
                  {(datosUsuario.user.role === 'user2' || datosUsuario.user.role === 'admin') && (
                    <>
                       <th>Entrada</th>
                       <th>Salida</th>
                      <th>Precio Art Insf</th>
                      <th>Precio Ajsute</th>
                  
                     
                    </>
                  )}
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {solInsuficiencia.insuficiencia_items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{moment(item.fecha_insuficienca.split('T')[0]).format('DD-MM-YYYY')}</td>


                    <td>{item.item_rep}</td>
                    <td>{item.descripcion_rep}</td>
                    <td>{item.cant_rep}</td>
                    <td>{moment(item.fecha_conteo).format('DD-MM-YYYY')}</td>
                    <td>{item.conteo_fisico}</td>
                    <td>{item.comentario_tienda}</td>

                    {/* Mapeo de los ajustes para cada columna */}
                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{ajuste.codigo_ajustar}</div>
                      ))}
                    </td>

                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item">{ajuste.descripcion}</div>
                      ))}
                    </td>
                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item">{ajuste.observacion_inv}</div>
                      ))}
                    </td>

                   
                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{ajuste.stock_sistema || '0'}</div>
                      ))}
                    </td>
                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{ajuste.stock_fisico || '0'}</div>
                      ))}
                    </td>

                    {/* Mostrar precios y total solo si el rol es 'user02' o 'admin' */}
                    {(datosUsuario.user.role == 'user2' || datosUsuario.user.role === 'admin') && (
                      <>
                         <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{ajuste.entrada || '0' }</div>
                      ))}
                    </td>

                    <td>
                      {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{ajuste.salida || '0'}</div>
                      ))}
                    </td>
                        <td>{item.precio01}</td>
                        <td>
                        {item.insuficiencia_ajustes.map((ajuste) => (
                        <div key={ajuste.id} className="ajuste-item py-1">{parseFloat(ajuste.precio).toFixed(2)}</div>
                          ))} 
                        </td>
                         
                       
                      
                      </>
                      
                    )}
                      {
                          (datosUsuario.user.role === 'user2' || datosUsuario.user.role === 'admin'  ) && (
                            <td className={`${item.precio02 > 0 ? 'text-success' : ''} ${item.precio02 < 0 ? 'text-danger' : ''}`}>
                              {item.precio02}
                            </td>
                          )
                        }

                        {
                            datosUsuario.user.role === 'user1' || datosUsuario.user.role === 'gerente' && (
                              <td className={item.precio02 < 0 ? 'text-danger' : ''}>
                                {item.precio02 < 0 ? item.precio02 : 0}
                              </td>
                            )
                      }

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para mostrar detalles adicionales */}
      <ModalViewDatosInsfSap
        showModal={showModal}
        handleClose={handleCloseModal}
        solInsuficiencia={selectedItem} // Pasar el item seleccionado
      />
    </div>
  );
};

export default ViewPageInsf;
