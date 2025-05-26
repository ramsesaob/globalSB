import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';

const ViewPageDan = () => {
  const [solDanado, setSolDanado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionValues, setCorrectionValues] = useState({});
  const [selectedItemsLlegados, setSelectedItemsLlegados] = useState([]);
  const [selectedItemsRevision, setSelectedItemsRevision] = useState([]);
  const [clasificaciones, setClasificaciones] = useState({});
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/danado/view/${id}.json`);
        setSolDanado(response.data.solDanado);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar los detalles.");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleItemSelectionLlegada = (itemId) => {
    setSelectedItemsLlegados((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  //console.log(selectedItems);
  const handleSalidaTienda = async () => {
    if (selectedItems.length === 0) {
      alert('Por favor seleccione al menos un item para marcar como salida');
      return;
    }
  
    // Filtrar items que no tienen salida (NULL o 0)
    const nuevosItems = selectedItems.filter(itemId => {
      const item = solDanado.items_danados.find(i => i.id === itemId);
      return item && (item.salida === null || item.salida === 0);
    });
  
    if (nuevosItems.length === 0) {
      alert('Los items seleccionados ya tienen salida registrada');
      return;
    }
  
    setProcessing(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/danado/salida-tienda/${id}.json`, {
        userId: datosUsuario.user.id,
        items: nuevosItems
      });
      
      // Refrescar datos
      const updatedData = await axios.get(`${apiBaseUrl}/danado/view/${id}.json`);
      setSolDanado(updatedData.data.solDanado);
      setSelectedItems([]);
      alert('Salida registrada correctamente');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Error al registrar la salida: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessing(false);
    }
  };
  const handleEntradaAlmacen = async () => {
    if (selectedItemsLlegados.length === 0) {
      alert('Por favor seleccione al menos un item para marcar como recibido');
      return;
    }
  
    const confirmMessage = `¿Confirmar recepción de ${selectedItemsLlegados.length} item(s) en almacén?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
  
    setProcessing(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/danado/entrada-almacen/${id}.json`, {
        solDanadoId: id,
        userId: datosUsuario.user.id,
        items: selectedItemsLlegados
      });
      
      // Refrescar datos
      const updatedData = await axios.get(`${apiBaseUrl}/danado/view/${id}.json`);
      setSolDanado(updatedData.data.solDanado);
      setSelectedItemsLlegados([]);
      
      if (updatedData.data.solDanado.status === 'En revisión') {
        alert('Todos los items han sido recibidos. La solicitud está lista para revisión');
      } else {
        alert('Recepción parcial registrada. Puede recibir los items restantes');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Error al registrar la entrada: ${error.response?.data?.message || 'Por favor intente nuevamente'}`);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleItemSelectionRevision = (itemId) => {
    setSelectedItemsRevision(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };
  
  const handleClasificacionChange = (itemId, value) => {
    setClasificaciones(prev => ({
      ...prev,
      [itemId]: value
    }));
  };
  
  const handleRevisionAlmacen = async () => {
    // Validar que todos los items seleccionados tengan clasificación
    const itemsSinClasificacion = selectedItemsRevision.filter(
      itemId => !clasificaciones[itemId]
    );
    
    if (itemsSinClasificacion.length > 0) {
      alert('Por favor seleccione una clasificación para todos los items marcados');
      return;
    }
  
    if (!window.confirm('¿Confirmar revisión de los items seleccionados?')) {
      return;
    }
  
    setProcessing(true);
    try {
      // Preparar datos para enviar al backend
      const itemsParaRevision = {};
      selectedItemsRevision.forEach(itemId => {
        itemsParaRevision[itemId] = clasificaciones[itemId];
      });
  
      const response = await axios.post(`${apiBaseUrl}/danado/revision-almacen/${id}.json`, {
        solDanadoId: id,
        userId: datosUsuario.user.id,
        items: itemsParaRevision
      });
      
      // Refrescar datos
      const updatedData = await axios.get(`${apiBaseUrl}/danado/view/${id}.json`);
      setSolDanado(updatedData.data.solDanado);
      setSelectedItemsRevision([]);
      setClasificaciones({});
      
      if (updatedData.data.solDanado.status === 'Completado') {
        alert('Todos los items han sido revisados. Proceso completado');
      } else {
        alert('Revisión parcial registrada. Puede revisar los items restantes');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Error al registrar la revisión: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessing(false);
    }
  };
 

  if (loading) return (
    <div className="text-center my-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  const handleBack = () => {
    navigate(-1);
  };

  // Validación de roles y estados - CORREGIDO
  const isTiendaUser = datosUsuario?.user?.role === 'user1';
  const isAlmacenUser = datosUsuario?.user?.role === 'user2';
  const isAdmin = datosUsuario?.user?.role === 'admin';
  
  // Corrección importante aquí - estaba mal la condición
  const canMarkSalida = isTiendaUser && 
    (solDanado?.status === 'Pendiente' || solDanado?.status === 'Pendiente (Parcial)');
  
    const canMarkEntrada = isAlmacenUser && 
    (solDanado?.status === 'En tránsito' || solDanado?.status === 'Recibido Parcialmente');
    const canReview = isAlmacenUser && 
    (solDanado?.status === 'En revisión' || solDanado?.status === 'Revisado Parcialmente');
  


const handleCorrectionChange = (itemId, value) => {
  setCorrectionValues(prev => ({
    ...prev,
    [itemId]: parseInt(value) || 0
  }));
};

const handleSaveCorrection = async () => {
  try {
    await axios.post(`${apiBaseUrl}/danado/corregir-salida/${id}`, {
      items: correctionValues,
      userId: datosUsuario.user.id
    });
    
    // Refrescar datos
    const response = await axios.get(`${apiBaseUrl}/danado/view/${id}.json`);
    setSolDanado(response.data.solDanado);
    setCorrectionMode(false);
    alert('Corrección guardada correctamente');
  } catch (error) {
    alert('Error al guardar la corrección');
    console.error(error);
  }
};

if (loading) return (
  <div className="text-center my-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

if (error) return <div className="alert alert-danger">{error}</div>;
if (!solDanado) return <div className="alert alert-warning">No se encontraron datos</div>;

console.log(solDanado);
  return  (
    <div className="container mt-4">
      <button className="btn btn-light active border-success text-success mb-3" onClick={handleBack}>
        <i className="bx bx-arrow-back"></i> Regresar
      </button>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Detalle de la Solicitud de Producto Dañado</h3>
        </div>

        <div className="card-body">
          {/* Encabezado con información (sin cambios) */}
          <div className="row mb-3">
            <div className="col-md-4">
              <h5><strong>N° Solicitud:</strong> {solDanado.nsolicitud}</h5>
              <h5><strong>Tienda:</strong> {solDanado.sucursal}</h5>
              <h5><strong>Fecha:</strong> {moment(solDanado.created).format('YYYY-MM-DD')}</h5>
            </div>
            <div className="col-md-4">
              <h5><strong>Motivo:</strong> {solDanado.motivo}</h5>
              <h5><strong>Responsable:</strong> {solDanado.responsable}</h5>
            </div>
            <div className="col-md-4">
              <h5><strong>Status:</strong></h5>
              <h3 className={`text-center ${
                solDanado.status === 'Pendiente' ? 'bg-warning text-dark' :
                solDanado.status === 'En tránsito' ? 'bg-info text-white' :
                solDanado.status === 'Aprobado' ? 'bg-success text-white' :
                solDanado.status === 'Rechazado' ? 'bg-danger text-white' :
                'bg-secondary text-white'
              }`}>{solDanado.status}</h3>
            </div>
          </div>

          {/* Botones de acción - CORREGIDO (eliminados los inputs que causaban el error) */}
          <div className="mb-4 d-flex justify-content-between">
          {canMarkSalida && (
              <button 
                className="btn btn-danger"
                onClick={handleSalidaTienda}
                disabled={processing || selectedItems.length === 0}
              >
                {processing ? 'Procesando...' : 'Marcar Salida de Tienda'}
              </button>
            )}
                        
            {canMarkEntrada && (
              <button 
                className="btn btn-primary"
                onClick={handleEntradaAlmacen}
                disabled={processing || selectedItemsLlegados.length === 0}
              >
                {processing ? 'Procesando...' : 'Marcar Entrada en Almacén'}
              </button>
            )}
            
            {canReview && (
                <button
                  className="btn btn-info"
                  onClick={handleRevisionAlmacen}
                  disabled={processing || selectedItemsRevision.length === 0}
                >
                  {processing ? 'Procesando...' : 'Registrar Revisión'}
                </button>
              )}
          </div>

          <h4 className="mt-4 mb-3 text-center fw-bold text-success">Detalles de los Productos Dañados</h4>

          {/* Tabla de productos - los inputs de selección deben estar aquí */}
          <div className="table-responsive">
            <table className="table table-bordered text-center table-sm">
              <thead className="thead-dark">
                <tr>
                  {canMarkSalida && <th>Seleccionar</th>}
                  {canMarkEntrada && <th>Recibido</th>}
                  {canReview && <th>Revisar</th>}
                  <th>#</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Composición</th>
                  <th>Precio</th>
                  <th>Piezas Dañadas</th>
                  <th>Set de Pieza</th>
                  <th>Stock Sistema</th>
                  <th>Tipo</th>
                  <th>Bulto</th>
                  <th>Cuenta</th>
                  <th>Observaciones</th>
                  {(isAdmin || isAlmacenUser) && (
                    <>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Revisión</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {solDanado.items_danados.map((item, index) => (
                  <tr key={item.id}>
                    {/* Columna de selección para salida */}
                    {canMarkSalida && (
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelection(item.id)}
                          disabled={item.salida > 0}
                          title={item.salida > 0 ? "Este ítem ya tiene salida registrada" : ""}
                        />
                        {item.salida > 0 && <span className="badge bg-success ms-2">✓</span>}
                      </td>
                    )}
                    
                    {/* Columna de selección para entrada */}
                    {canMarkEntrada && (
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedItemsLlegados.includes(item.id)}
                          onChange={() => handleItemSelectionLlegada(item.id)}
                          disabled={item.entrada > 0}
                          title={item.entrada > 0 ? "Este ítem ya fue recibido" : ""}
                        />
                        {item.entrada > 0 && <span className="badge bg-primary ms-2">✓</span>}
                      </td>
                    )}
                    {canReview && (
                        <td>
                          <div className="d-flex flex-column">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                checked={selectedItemsRevision.includes(item.id)}
                                onChange={() => handleItemSelectionRevision(item.id)}
                                disabled={item.revision === 1}
                                className="form-check-input"
                              />
                            </div>
                            {selectedItemsRevision.includes(item.id) && (
                              <select
                                className="form-select form-select-sm mt-1"
                                value={clasificaciones[item.id] || ''}
                                onChange={(e) => handleClasificacionChange(item.id, e.target.value)}
                              >
                                <option value="">Seleccione...</option>
                                <option value="recuperado">Recuperado</option>
                                <option value="desecho">Desecho</option>
                              </select>
                            )}
                          </div>
                        </td>
                      )}
                    {/* Resto de columnas (sin cambios) */}
                    <td>{index + 1}</td>
                    <td>{item.codigo}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.composicion}</td>
                    <td>{item.precio}</td>
                    <td>{item.pcs_danadas}</td>
                    <td>{item.presentacion_set}</td>
                    <td>{item.stock}</td>
                    <td>{item.tipo}</td>
                    <td>{item.bulto}</td>
                    <td>{item.cuenta}</td>
                    <td>{item.observaciones}</td>
                    
                    {/* Columnas para admin/almacen */}
                    {(isAdmin || isAlmacenUser) && (
                      <>
                        <td>
                        
                        {item.entrada > 0 && <span className="badge bg-success ms-2">✓</span>}
                        {item.entrada === null && <span className="badge bg-danger ms-2">✗</span>}
                      </td>
                      <td>
                       
                        {item.salida > 0 && <span className="badge bg-success ms-2">✓</span>}
                        {item.salida === null && <span className="badge bg-danger ms-2">✗</span>}
                      </td>
                      <td>
                        {item.revision > 0 && <span className="badge bg-success ms-2">✓</span>}
                        {item.revision === null && <span className="badge bg-danger ms-2">✗</span>}
                      </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPageDan;