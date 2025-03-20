import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useContext } from "react";
import { carritoContext } from "../contexts/carritoContext";
import ModalArtCod from '../components/ModalArtCod';
import { Button } from 'react-bootstrap';

const Verificacion = () => {
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [ordenPedido, setOrdenPedido] = useState(null);
  const [existencias, setExistencias] = useState({});
  const [comentarios, setComentarios] = useState({}); // Nuevo estado para comentarios
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [cantidadesCorregidas, setCantidadesCorregidas] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const getDatos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/ordenp/view/${id}.json`);
        const data = await response.json();
        setOrdenPedido(data.ordenPedido);

        const itemCodes = data.ordenPedido.orden_items.map(item => item.articulo.codigo);

        const existenciasPromises = itemCodes.map(itemcode =>
          fetch(`${apiBaseUrl}/art/existencia.json?itemcode=${itemcode}`)
            .then(res => res.json())
            .then(data => ({ itemcode, existencias: data.articulos }))
        );

        const existenciasResults = await Promise.all(existenciasPromises);
        //console.log('Existencias results:', existenciasResults);

        const existenciasData = existenciasResults.reduce((acc, { itemcode, existencias }) => {
          acc[itemcode] = existencias;
          return acc;
        }, {});
       // console.log('Existencias data:', existenciasData);

        setExistencias(existenciasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getDatos();
  }, [id, apiBaseUrl]);

  if (!ordenPedido) {
    return <div className="text-center">Loading...</div>;
  }

  const handleValidateItem = (itemId, newValue) => {
    const updatedItems = ordenPedido.orden_items.map(item =>
      item.id === itemId ? { ...item, validado: parseInt(newValue) } : item
    );
    setOrdenPedido({ ...ordenPedido, orden_items: updatedItems });
  };

  const handleComentarioChange = (itemId, value) => {
    setComentarios(prev => ({ ...prev, [itemId]: value }));
  };



  const handleComentarioSubmit = async (itemId) => {
    const comentario = comentarios[itemId] || '';
    // Lógica para enviar el comentario a la API si es necesario
  };

  const saveValidationChanges = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Está seguro de que desea actualizar los status de validación de los items?",
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Cancelar"
    });

    if (isConfirmed) {
      try {
        const fecha = new Date().toISOString();

        const updatedItems = ordenPedido.orden_items.map(item => ({
          id: item.id,
          validado: item.validado,
          user_validado: datosUsuario.user.id,
          cantidad_val: item.validado === 1 ? cantidadesCorregidas[item.id] || item.cantidad : item.cantidad, // Usar la cantidad corregida si está validado
          comentario: comentarios[item.id] || '', // Agregar comentario
          traslado: item.traslado || 1 
        }));
        
        console.log('Datos a guardar:', updatedItems);
        
        const totalItems = updatedItems.length;
        const validatedItems = updatedItems.filter(item => item.validado === 1).length;

        let statusAprobada = 'Pendiente';
        if (validatedItems === totalItems && validatedItems > 0) {
          statusAprobada = 'Procesada';
        } else if (validatedItems > 0) {
          statusAprobada = 'Parcialmente';
        }

        const data = {
          id: ordenPedido.id,
          orden_items: updatedItems,
          status_aprobada: statusAprobada
        };

        const response = await fetch(`${apiBaseUrl}/ordenp/verificar/${id}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          Swal.fire('¡Actualizado!', 'Los cambios han sido actualizados correctamente.', 'success');
          navigate('/IndexPage');
        } else {
          Swal.fire('¡Error!', 'Ha ocurrido un error al actualizar los cambios.', 'error');
        }
      } 
      
      catch (error) {
        Swal.fire('¡Error!', 'Ha ocurrido un error al enviar la solicitud.', 'error');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCantidadCorregidaChange = (itemId, newCantidad) => {
    setCantidadesCorregidas(prev => ({ ...prev, [itemId]: newCantidad }));
  };
  const openModal = (oferta) => {
   
    setModalIsOpen(true);
  };

  const closeModal = () => {
      setModalIsOpen(false);
  
  };
  const handleTrasladoChange = (itemId, value) => {
    setOrdenPedido(prev => {
        const updatedItems = prev.orden_items.map(item => 
            item.id === itemId ? { ...item, traslado: value } : item
        );
        return { ...prev, orden_items: updatedItems };
    });
};


  return (
    <div className="container py-4" style={{ width: '90%' }}>
      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-light active border-success text-success" onClick={handleBack}>
          <i className="bx bx-arrow-back"></i> Regresar
        </button>
      </div>
      <div className='card border-success mt-1'>
        <div className="card text-center bg-success">
          <h2 className="card-title text-center mb-0 py-1 text-white">Verificación de la Orden N° {ordenPedido.numero_ped}</h2>
          <div style={{ width: '120px' }}></div>
        </div>

        <div className="card-body">
          <div className='row py-2'>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Motivo: </strong>
                {ordenPedido.descripcion === '1' ? 'Alta Rotación' :
                  ordenPedido.descripcion === '2' ? 'Ventas al por mayor' :
                    ordenPedido.descripcion === '3' ? 'Ventas de Clientes Especiales' :
                      'Descripción desconocida'}
              </p>
            </div>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Solicitante:</strong> {ordenPedido.user.nombre}</p>
            </div>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Creado:</strong> {new Date(ordenPedido.created).toLocaleString()}</p>
            </div>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Status:</strong> {ordenPedido.Status_aprobada}</p>
            </div>
            <div className='col-md-3 col-lg-3 py-1'>
              <p className="card-text mx-2"><strong>Tipo:</strong> {ordenPedido.tipo === 'P' ? 'Normal' : 'Navidad'}</p>
            </div>
            <div className='col-md-3 col-lg-3 py-1'>
            <Button className="btn btn-info btn-sm" variant="primary" onClick={() => openModal()}>Buscar Articulo</Button>
            <ModalArtCod isOpen={modalIsOpen} onRequestClose={closeModal} />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="departmentFilter" className="form-label">Filtrar por Departamento</label>
            <select
              id="departmentFilter"
              className="form-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Todos</option>
              {Array.from(new Set(ordenPedido.orden_items.map(item => item.articulo.departamento))).map(departamento => (
                <option key={departamento} value={departamento}>{departamento}</option>
              ))}
            </select>
          </div>

          <h4 className='text-center text-danger'>Articulos Pendientes de Verificar</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered table-condensed table-responsive text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cant Solicitada</th>
                  <th>Pieza Bulto</th>
                  <th>Departamento</th>
                  <th>Categoria</th>
                  <th>Existencias</th>
                  <th>Disponible</th>
                  <th>Verificación</th>
                  <th>Cant Corregida</th>
                  <th>Despacho</th>
                  <th colSpan="2" width="1200px">Comentario</th>
                </tr>
              </thead>
              <tbody>
              {ordenPedido.orden_items
                  .filter(item => !selectedDepartment || item.articulo.departamento === selectedDepartment)
                  .map((item, index) => {
                    const itemExistencias = existencias[item.articulo.codigo] || [];
                    return (
                      <tr key={item.id} className={item.validado === 1 ? 'table-success' : ''}>
                        <td>{index + 1}</td>
                        <td>{item.articulo.codigo}</td>
                        <td>{item.articulo.descripcion}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.articulo.empaque}</td>
                        <td>{item.articulo.departamento}</td>
                        <td>{item.articulo.categoria}</td>
                        <td>
                          {itemExistencias.length === 0 ? (
                            <p>No disponible</p>
                          ) : (
                            itemExistencias.map((existencia, index) => {
                              const formattedExistencia = parseFloat(existencia.Existencia).toFixed(2).replace('.', ',');
                              return (
                                <div key={index}>
                                  {existencia.whscode}: {formattedExistencia}
                                </div>
                              );
                            })
                          )}
                        </td>
                        <td>
                          {itemExistencias.length === 0 ? (
                            <p>No disponible</p>
                          ) : (
                            itemExistencias.map((existencia, index) => {
                              const formattedDisponible = parseFloat(existencia.Disponible).toFixed(2).replace('.', ',');
                              return (
                                <div key={index}>
                                  {existencia.whscode}: {formattedDisponible}
                                </div>
                              );
                            })
                          )}
                        </td>
                        <td>
                          <select
                            value={item.validado} 
                            onChange={(e) => handleValidateItem(item.id, e.target.value)} 
                          >
                            <option value={0}>No verificado</option>
                            <option value={1}>Verificado</option>
                          </select>
                        </td>
                        <td>
                          {item.validado === 1  ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              defaultValue={item.cantidad_val === null ? item.cantidad : item.cantidad_val}
                              onChange={(e) => handleCantidadCorregidaChange(item.id, e.target.value)}
                            />
                          ) : null}
                        </td>
                        <td>
                              <select
                                  value={item.traslado || 1} // Por defecto será al almacen
                                  onChange={(e) => handleTrasladoChange(item.id, e.target.value)}
                              >
                                  <option value={1}>Almacen</option>
                                  <option value={2}>Traslado entre tiendas</option>
                              </select>
                          </td>
                        <td className='w-200'>
                                    <input
                                        type="text"
                                        className="form-control form-control-md comentario-input " 
                                        value={comentarios[item.id] || ''}
                                        onChange={(e) => handleComentarioChange(item.id, e.target.value)}
                                        onBlur={() => handleComentarioSubmit(item.id)} // Enviar al perder el foco
                                        width={200}
                                    />
                          </td>
                          

                      </tr>

                    );
                  })}
                </tbody>

            </table>
          </div>
        </div>

        <div className="card-footer text-center mt-4">
          <button className="btn btn-success mx-2" onClick={saveValidationChanges}>
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verificacion;
