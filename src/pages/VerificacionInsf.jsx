import React, { useState, useEffect, useContext } from 'react';
import { carritoContext } from '../contexts/carritoContext';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';


const VerificacionInsf = () => {
    const { apiBaseUrl } = useContext(carritoContext);  // Obtén apiBaseUrl del contexto
    const [insuficienciaEditada, setInsuficienciaEditada] = useState(null); // Iniciar vacío
    const params = useParams();
    const id = params.id; // Obtenemos el ID desde la URL
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

            // Cargar los datos de la insuficiencia desde la API
            useEffect(() => {
                const obtenerInsuficiencia = async () => {
                    try {
                        const response = await fetch(`${apiBaseUrl}/ordeninsf/view/${id}.json`);
                        const data = await response.json();
                        
                        if (response.ok) {
                            setInsuficienciaEditada(data); // Establecer el estado con los datos obtenidos
                        } else {
                            throw new Error('No se pudo obtener la insuficiencia');
                        }
                    } catch (error) {
                        Swal.fire('Error', error.message, 'error');
                    }
                };
        
                obtenerInsuficiencia();
                setIsLoading(false);
            }, [id, apiBaseUrl]);
        
            const handleGuardarEdicion = async () => {

                // Muestra un SweetAlert para confirmar si desea guardar los cambios
                const result = await Swal.fire({
                    title: '¿Deseas Editar los cambios?',
                    text: "Esto podrá afectar los datos anteriores. Los cambios no se podrán revertir.",
                    icon: 'warning',
                    showCancelButton: true,  // Mostrar el botón de cancelar
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, guardar',
                    cancelButtonText: 'No, cancelar'
                });
            
                if (!result.isConfirmed) {
                    return;
                }
            
                // Función para formatear la fecha
                const formatFecha = (fecha) => {
                    const date = new Date(fecha);
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
                    return `${yyyy}-${mm}-${dd} ${hours}:${minutes}:${seconds}.${milliseconds}`;
                };
            
                // Validar los campos necesarios antes de hacer la solicitud
                if (!insuficienciaEditada?.solInsuficiencia?.comentario || !insuficienciaEditada?.solInsuficiencia?.status || !insuficienciaEditada?.solInsuficiencia?.user_id) {
                    Swal.fire('Error', 'Por favor complete todos los campos necesarios (comentario, estado, usuario).', 'error');
                    return;
                }
            
                let insuficienciaAEnviar = { ...insuficienciaEditada.solInsuficiencia };
                let todosPrecioCero = true;
                let tienePrecioNegativo = false;
                let tieneObservacionNoProcede = false;
            
                // Primero calculamos los precios
                // Primero calculamos los precios
                if (insuficienciaAEnviar.insuficiencia_items) {
                    insuficienciaAEnviar.insuficiencia_items.forEach(item => {
                        item.precio02 = 0;

                        let tieneObservacionNoProcede = false; // Variable para comprobar si hay "NO PROCEDE PARA COBRO" en los ajustes

                        // Verificar si el campo observacion_inv contiene "NO PROCEDE PARA COBRO" en algún ajuste del item
                        if (item.insuficiencia_ajustes) {
                            item.insuficiencia_ajustes.forEach(ajuste => {
                                if (ajuste.observacion_inv && ajuste.observacion_inv.trim().toUpperCase() === "NO PROCEDE PARA COBRO".toUpperCase()) {
                                    tieneObservacionNoProcede = true;
                                }
                            });
                        }

                        if (item.insuficiencia_ajustes && item.insuficiencia_ajustes.length > 0) {
                            let totalAjustes = 0;

                            // Recorrer los ajustes para cada item
                            item.insuficiencia_ajustes.forEach(ajuste => {
                                let precioFinal = 0;
                                let precioFinal1 = 0;

                                const precio = parseFloat(ajuste.precio) || 0;
                                const salida = parseFloat(ajuste.salida) || 0;

                                if (salida === 0) {
                                    precioFinal = 0;
                                } else {
                                    item.precio01 = parseFloat(item.precio01) || 0;
                                    precioFinal1 = item.precio01 - precio;
                                    precioFinal = salida * precioFinal1;
                                }

                                totalAjustes += precioFinal;
                            });

                            // Asignar la sumatoria de los precios finales al campo precio02 del item
                            item.precio02 = totalAjustes;
                            insuficienciaAEnviar.precio2 = totalAjustes; // Actualizar el total
                        }

                        // Aquí verificamos si el precio02 es negativo, pero si la observación "NO PROCEDE PARA COBRO" está en algún ajuste, no lo contamos como negativo
                        if (item.precio02 < 0 && !tieneObservacionNoProcede) {
                            tienePrecioNegativo = true;
                        }

                        // Verificar si todos los precios son cero
                        if (item.precio02 !== 0) {
                            todosPrecioCero = false;
                        }

                        // Formatear la fecha de conteo si existe
                        if (item.fecha_conteo) {
                            item.fecha_conteo = formatFecha(item.fecha_conteo);
                        }
                    });
                }

            
                // Cambiar el estado basado en las condiciones
                if (tienePrecioNegativo && !tieneObservacionNoProcede) {
                    insuficienciaAEnviar.status = 'Pendiente de Confirmación';
                } else if (tieneObservacionNoProcede) {
                    insuficienciaAEnviar.status = 'Finalizada';
                } else if (todosPrecioCero) {
                    insuficienciaAEnviar.status = 'Finalizada';
                } else {
                    insuficienciaAEnviar.status = 'Finalizada'; // Mantener el estado por defecto si no aplica ninguna condición
                }
                
            
                // Agregar la actualización de los campos aprobacion_tienda y fecha_aprobacion_tienda
                insuficienciaAEnviar.procesada_inv = 1;
                insuficienciaAEnviar.fecha_procesda_inv = new Date().toISOString();
            
                // Validar 'user_id' está presente
                if (!insuficienciaAEnviar?.user_id) {
                    alert("El campo 'user_id' no puede estar vacío.");
                    return;
                }
            
                // Validar 'motivo' está presente
                if (!insuficienciaAEnviar?.insuficiencia_items?.[0]?.insuficiencia_ajustes?.[0]?.observacion_inv) {
                    alert("El campo 'motivo' no puede estar vacío.");
                    return;
                }
            
                console.log('Datos a enviar:', insuficienciaAEnviar);
            
                // Llamada a la API para guardar los cambios
                try {
                    const response = await fetch(`${apiBaseUrl}/ordeninsf/edit/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(insuficienciaAEnviar),
                    });
            
                    const data = await response.json();
            
                    // Verificar si la respuesta es exitosa
                    if (response.ok) {
                        console.log('Respuesta exitosa:', data);
                        Swal.fire('¡Éxito!', 'Insuficiencia actualizada correctamente.', 'success');
                        navigate(`/ViewPageInsf/${id}`);
                    } else {
                        console.error('Error al actualizar:', data);
                        Swal.fire('Error al actualizar', data.message, 'error');
                    }
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error en la solicitud:', error);
                    Swal.fire('Error', 'Hubo un problema al intentar actualizar la insuficiencia.', 'error');
                }
            };
            
            
            
            
            
            if (!insuficienciaEditada) {
                return <div>Cargando...</div>; // Mostrar un mensaje mientras se cargan los datos
            }
            
            const handleBack = () => {
                navigate(-1); // Navega hacia atrás usando navigate con el valor -1
              };

              const handleInputChange = (field, value, arrayName, index, ajusteIndex) => {
                setInsuficienciaEditada((prevState) => {
                    const updatedState = { ...prevState };
            
                    if (arrayName === 'insuficiencia_ajuste') {
                        updatedState.solInsuficiencia.insuficiencia_items[index].insuficiencia_ajustes[ajusteIndex][field] = value;
                    } else if (arrayName === 'insuficiencia_item') {
                        updatedState.solInsuficiencia.insuficiencia_items[index][field] = value;
                    } else {
                        updatedState.solInsuficiencia[field] = value;
                    }
            
                    return updatedState;
                });
            };
            
        console.log('insuficienciaEditada:', insuficienciaEditada);    
        
  return (
    <div className="container mt-4">
        <div >
            <button className="btn btn-light active border-success text-success mb-1" width="100%" onClick={handleBack}>
            <i className="bx bx-arrow-back"></i> Regresar
            </button>
            <h2 className="mb-2 text-balck text-center">Verificando Datos de la Orden  Nº {insuficienciaEditada?.solInsuficiencia?.nsolicitud}</h2>
        </div> 

       { /* Muestra los detalles de la insuficiencia */}
    <div className="card p-2 mb-3" style={{ backgroundColor: '##73d0df9e', border: '1px solid #ddd' }}>
       
        <div className="row">
        <div className="col-md-1">
            </div>
            <div className="col-md-3">
                <div className="form-group">
                    <label><strong>Numero de Solicitud:</strong></label>
                    <p>  {insuficienciaEditada?.solInsuficiencia?.nsolicitud}</p>

                </div>
                <div className="form-group">
                    <label><strong>Motivo:</strong></label>
                    <p>{insuficienciaEditada?.solInsuficiencia?.motivo}</p>
                </div>
            </div>
            <div className="col-md-3">
                <div className="form-group">
                <label><strong>Fecha:</strong></label>
                <p>{moment(insuficienciaEditada?.solInsuficiencia?.created).format('YYYY-MM-DD HH:mm:ss')}</p>  

                    <label><strong>Status:</strong></label>
                    <p>{insuficienciaEditada?.solInsuficiencia?.status}</p>
                </div>
                
                
            </div>
            <div className="col-md-4">
                
                <div className="form-group">
                    <label><strong>Responsable:</strong></label>
                    <p>{insuficienciaEditada?.solInsuficiencia?.comentario}</p>

                    <label><strong>Tienda </strong> </label>
                    <p>{insuficienciaEditada?.solInsuficiencia?.user.sucursale.descripcion}</p>
                </div>
                
            </div>
            
        </div>
    </div> 

      <h2 className="text-info fw-bold">Artículos de la Insuficiencia:</h2>

        {insuficienciaEditada?.solInsuficiencia?.insuficiencia_items?.map((item, index) => (
            <div key={item.id} className="card p-3 mb-3" style={{ backgroundColor: '#c0e5e9', border: '1px solid #ddd' }}>
                <h3 className="text-blue font-weight-bold fw-bold">Artículo #{index + 1}</h3>
                <div className="table-responsive mb-3" >
                <table className="table table-sm  table-striped table-hover text-center table-info" >
                    <tbody>
                        <tr >
                            <td ><strong>Fecha de Insuficiencia:</strong>
                            <p>{moment(item.created).format('YYYY-MM-DD')}</p>
                            </td>
                            <td><strong>Código Reportado:</strong>
                            <p>{item.item_rep}</p>
                            </td>
                            
                            <td><strong>Descripción del Artículo:</strong>
                            <p>{item.descripcion_rep}</p>
                            </td>
                            <td><strong>Cantidad:</strong>
                            <p>{item.cant_rep}</p>
                            </td>
                            <td><strong>Fecha del Conteo:</strong>
                            <p>{moment(item.fecha_conteo).format('YYYY-MM-DD HH:mm')}</p>
                            </td>
                            <td><strong>Conteo Físico:</strong>
                            <p>{item.conteo_fisico}</p>
                            </td>
                            
                            <td><strong>Observaciones:</strong>
                            <p>{item.comentario_tienda}</p>
                            </td>
                            <td>
                            <strong>Precio:</strong>
                            <p>{item.precio01}</p>
                            </td>
                        </tr>
                       
                        
                        
                       
                       
                    </tbody>
                </table>
                </div>


    
                {/* Ajustes de cada artículo */}
                {item.insuficiencia_ajustes && item.insuficiencia_ajustes.map((ajuste, ajusteIndex) => (
                    <div key={ajuste.id} className="card p-2 mb-2" style={{ backgroundColor: '#7cbccd', border: '1px solid #ddd' }}>
                        <h4 className="text-warning fw-bold text-center">Ajuste #{ajusteIndex + 1}</h4>
                        <div className="row">
                            <div className="col-md-2 mb-1">
                                <label><strong>Código Ajustar:</strong></label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.codigo_ajustar || ''}
                                    onChange={(e) => handleInputChange('codigo_ajustar', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                />
                             
                            </div>
                            <div className="col-md-2 mb-1">
                            <label><strong>Desripcion del Producto:</strong></label>
                            <textarea
                                type="text"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value= {ajuste.descripcion || ''}
                                onChange={(e) => handleInputChange('descripcion', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                rows={3}
                            />
                            


                        </div>
                            <div className="col-md-2 mb-1">
                                <label><strong>Observaciones Tienda:</strong></label>
                                <textarea
                                    type="text"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.observaciones || ''}
                                    onChange={(e) => handleInputChange('observaciones', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                    rows={3}
                                />
                            </div>
                            <div className="col-md-1 mb-1">
                                <label><strong>Precio:</strong></label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.precio ? parseFloat(ajuste.precio).toFixed(2) : ''}
                                    onChange={(e) => handleInputChange('precio', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                    step="any"  // Permite cualquier número decimal
                                />

                            </div>
                            <div className="col-md-1 mb-1">
                                <label><strong> Sistema:</strong></label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.stock_sistema || ''}
                                  
                                    step="any"  // Permite cualquier número decimal
                                    disabled
                                />

                            </div>
                            <div className="col-md-1 mb-1">
                                <label><strong> Fisico:</strong></label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.stock_fisico || ''}
                                  
                                    step="any"  // Permite cualquier número decimal
                                    disabled
                                />

                            </div>
                            
                            <div className="col-md-1 mb-1">
                                <label><strong>Entrada:</strong></label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.entrada ? parseFloat(ajuste.entrada) : 0}
                                    onChange={(e) => handleInputChange('entrada', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                    step="any"  // Permite cualquier número decimal
                                    min={0}
                                />

                            </div>
                            <div className="col-md-1 mb-1">
                                <label><strong>Salida:</strong></label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: '#eaf0f5' }}
                                    value={ajuste.salida ? parseFloat(ajuste.salida) : 0}
                                    onChange={(e) => handleInputChange('salida', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                    step="any"  // Permite cualquier número decimal
                                    min={0}
                                />

                            </div>
                            <div className="col-md-1 mb-1">
                                <label><strong>Motivos:</strong></label>
                               
                                <select name="observacion_inv" id="observacion_inv"
                                className="form-select form-select-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.observacion_inv}
                                onChange={(e) => handleInputChange('observacion_inv', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                
                                >
                                <option value="">Seleccione</option>
                                <option value="CRUCE">CRUCE</option>
                                <option value="EMI SIN MOV">EMI SIN MOV</option>
                                <option value="ERROR EN TRASLADO">ERROR EN TRASLADO</option>
                                <option value="ERROR KLK">ERROR KLK</option>
                                <option value="FALTANTE NO REPORTADO">FALTANTE NO REPORTADO</option>
                                <option value="FALTANTE MAL REPORTADO">FALTANTE MAL REPORTADO</option>
                                <option value="FALTANTE MAL REPORTADO CICLICO">FALTANTE MAL REPORTADO CICLICO</option>
                                <option value="NO PROCEDE PARA AJUSTE">NO PROCEDE PARA AJUSTE</option>
                                <option value="NO PROCEDE PARA COBRO">NO PROCEDE PARA COBRO</option>
                                <option value="MAL ETIQUETADO">MAL ETIQUETADO</option>
                                <option value="MALA FACTURACION">MALA FACTURACION</option>
                                <option value="MERCANCIA DEJADA POR CLIENTE">MERCANCIA DEJADA POR CLIENTE</option>
                                <option value="MALA SALIDA POR MD">MALA SALIDA POR MD</option>
                                <option value="MIGRACION">MIGRACION</option>
                                <option value="RECUPERADO">RECUPERADO</option>
                                <option value="REVERSO">REVERSO</option>
                                <option value="SINIESTRO">SINIESTRO</option>
                                <option value="SOBRANTE MAL REPORTADO">SOBRANTE MAL REPORTADO</option>
                                <option value="SOBRANTE NO REPORTADO">SOBRANTE NO REPORTADO</option>
                                <option value="VENTA PREVIA EP">VENTA PREVIA EP</option>
                                
                                



                                </select>
                            </div>
                        </div>

                        <div>
                          
                            <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddAjuste(index)}
                        >
                            Agregar Ajuste
                        </button>   
                        </div>
                    </div>

                    
                ))}
                    <div>
               
            </div>
               
            </div>
            
            
        
            
        ))}

            <div className="text-center mt-3 mb-5">
    <button className="btn btn-primary mt-3 text-white fw-bold text-center"  disabled={isLoading}  style={{ backgroundColor: '#28a745', borderColor: '#28a745' }} onClick={handleGuardarEdicion}>
    {isLoading ? 'Guardando...' : 'Guardar Solicitud'}
    </button>
    </div>

    </div>
  )
}

export default VerificacionInsf
