import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { carritoContext } from "../contexts/carritoContext";
import ModalArtCod from '../components/ModalArtCod';
import { Button } from 'react-bootstrap';

const VerificacionCompra = () => {
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [ordenCompra, setordenCompra] = useState(null);
  const [existencias, setExistencias] = useState({});
  const [comentarios, setComentarios] = useState({});
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [cantidadesCorregidas, setCantidadesCorregidas] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [codigo, setCodigo] = useState({});  // Inicializas con el valor de item.codigo

  useEffect(() => {
    const getDatos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/ordencompra/view/${id}.json`);
        const data = await response.json();
        setordenCompra(data.ordenCompra);

        const itemCodes = data.ordenCompra.items_compras.map(item => item.codigo);
        const existenciasPromises = itemCodes.map(itemcode =>
          fetch(`${apiBaseUrl}/art/existencia.json?itemcode=${itemcode}`)
            .then(res => res.json())
            .then(data => ({ itemcode, existencias: data.articulos }))
        );

        const existenciasResults = await Promise.all(existenciasPromises);
        const existenciasData = existenciasResults.reduce((acc, { itemcode, existencias }) => {
          acc[itemcode] = existencias;
          return acc;
        }, {});

        setExistencias(existenciasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getDatos();
  }, [id, apiBaseUrl]);

  if (!ordenCompra) {
    return <div className="text-center">Loading...</div>;
  }

  const handleValidateItem = (itemId, newValue) => {
    const updatedItems = ordenCompra.items_compras.map(item =>
      item.id === itemId ? { ...item, validado: parseInt(newValue) } : item
    );
    setordenCompra({ ...ordenCompra, items_compras: updatedItems });
  };

  const handleComentarioChange = (itemId, value) => {
    setComentarios(prev => ({ ...prev, [itemId]: value }));
  };

  const handleComentarioSubmit = async (itemId) => {
    const comentario = comentarios[itemId] || '';
    // Aquí podrías agregar la lógica para enviar el comentario a la API si es necesario
  };

  // Manejador para el cambio de "Compra"
const handleCompraChange = (itemId, value) => {
  setordenCompra(prev => {
    const updatedItems = prev.items_compras.map(item =>
      item.id === itemId ? { ...item, compra: value } : item
    );
    return { ...prev, items_compras: updatedItems };
  });
};

// Manejador para el cambio de "Tipo Despacho"
const handleTipoDespachoChange = (itemId, value) => {
  setordenCompra(prev => {
    const updatedItems = prev.items_compras.map(item =>
      item.id === itemId ? { ...item, tipo_entrega: value } : item
    );
    return { ...prev, items_compras: updatedItems };
  });
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

        const updatedItems = ordenCompra.items_compras.map(item => ({
          id: item.id,
          codigo: codigo[item.id] || item.codigo,  // Asegurarse de usar el código modificado si existe
          validado: item.validado,
          user_validado: datosUsuario.user.id,
          cantidad_val: item.validado === 1 ? cantidadesCorregidas[item.id] || item.cantidad : item.cantidad, // Usar la cantidad corregida si está validado
          comentario: comentarios[item.id] || '', // Agregar comentario
          tipo_entrega: item.tipo_entrega || '',
          compra: item.compra || '', 
          
          
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
          id: ordenCompra.id,
          items_compras: updatedItems,
          status_aprobada: statusAprobada
        };

        const response = await fetch(`${apiBaseUrl}/ordencompra/verificar/${id}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          Swal.fire('¡Actualizado!', 'Los cambios han sido actualizados correctamente.', 'success');
          navigate('/IndexPageCompra');
        } else {
          Swal.fire('¡Error!', 'Ha ocurrido un error al actualizar los cambios.', 'error');
        }
      } catch (error) {
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
  const handleCodigoChange = (itemId, newCodigo) => {
    setCodigo(prev => ({ ...prev, [itemId]: newCodigo }));
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const obtenerMotivosSeleccionados = (rowData) => {
    const motivosMap = {
      motivo01: "Reparacion / Materiales",
      motivo02: "Papeleria / Material de Oficina",
      motivo03: "Equipos de Sistema",
      motivo04: "Repuestos Vehiculos",
    };

    const motivos = Object.keys(motivosMap).filter(key => {
      const valor = Number(rowData[key]);
      return valor === 1;
    }).map(key => motivosMap[key]);

    return motivos.length > 0 ? motivos.join(", ") : "Ninguno";
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
          <h2 className="card-title text-center mb-0 py-1 text-white">Verificación de la Orden N° {ordenCompra.num_ped}</h2>
        </div>

        <div className="card-body">
          <div className='row py-2'>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Motivo: </strong>
                {obtenerMotivosSeleccionados(ordenCompra)}
              </p>
            </div>
            <div className='col-md-3 col-lg-3'>
              <p className="card-text mx-2"><strong>Solicitante:</strong> {ordenCompra.user.nombre}</p>
            </div>
            <div className='col-md-3 col-lg-2'>
              <p className="card-text mx-2"><strong>Creado:</strong> {new Date(ordenCompra.created).toLocaleString()}</p>
            </div>
            <div className='col-md-3 col-lg-2'>
              <p className="card-text mx-2"><strong>Status:</strong> {ordenCompra.status}</p>
            </div>
            <div className='col-md-3 col-lg-2 py-1'>
              <p className="card-text mx-2"><strong>Tipo:</strong> {ordenCompra.tipo === '1' ? 'Tienda' : 'Local'}</p>
            </div>
            <div className='col-md-3 col-lg-2 py-1'>
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
              {Array.from(new Set(ordenCompra.items_compras.map(item => item.departamento))).map(departamento => (
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
                  <th>Existencias</th>
                  <th>Verificación</th>
                  <th>Cant Corregida</th>
                  <th>Compra</th>
                  <th>Tipo Despacho</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenCompra.items_compras
                  .filter(item => !selectedDepartment || item.departamento === selectedDepartment)
                  .map((item, index) => {
                    const itemExistencias = existencias[item.codigo] || [];
                    return (
                      <tr key={item.id} className={item.validado === 1 ? 'table-success' : ''}>
                        <td>{index + 1}</td>
                        <td>
                        <input
                          type="text"
                          name="codigo"
                          value={codigo[item.id] || item.codigo} // Si no tiene código corregido, se usa el valor original
                          onChange={(e) => handleCodigoChange(item.id, e.target.value)} // Llamas al handler para actualizar solo ese ítem
                          style={{ width: '150px' }}
                          className="form-control form-control-sm"
                        />

                        </td>
                        <td>{item.descripcion}</td>
                        <td>{item.cantidad}</td>

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
                          <select value={item.validado} onChange={(e) => handleValidateItem(item.id, e.target.value)}>
                            <option value={0}>No verificado</option>
                            <option value={1}>Verificado</option>
                          </select>
                        </td>
                        <td>
                          {item.validado === 1 && (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              defaultValue={item.cantidad_val === null ? item.cantidad : item.cantidad_val}
                              onChange={(e) => handleCantidadCorregidaChange(item.id, e.target.value)}
                            />
                          )}
                        </td>
                        <td>
                          <select
                            value={item.compra || ''}
                            onChange={(e) => handleCompraChange(item.id, e.target.value)}
                          >
                            <option value="">(Seleccione)</option>
                            <option value={1}>Sí</option>
                            <option value={2}>No</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={item.tipo_entrega || ''}
                            onChange={(e) => handleTipoDespachoChange(item.id, e.target.value)}
                          >
                            <option value="">(Seleccione)</option>
                            <option value={1}>Almacén</option>
                            <option value={2}>Proveedor</option>
                          </select>
                        </td>

                        <td className='w-200'>
                          <input
                            type="text"
                            className="form-control form-control-md comentario-input"
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
}

export default VerificacionCompra;
