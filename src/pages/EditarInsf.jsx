import React, { useState, useEffect, useContext } from 'react';
import { carritoContext } from '../contexts/carritoContext';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

const EditarInsf = ({ setInsuficiencias }) => {
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

    const handleInputChange = (campo, valor, tipo, index, ajusteIndex = null) => {
        // Si el cambio es en solInsuficiencia
        if (tipo === 'solInsuficiencia') {
            setInsuficienciaEditada(prevState => ({
                ...prevState,
                solInsuficiencia: {
                    ...prevState.solInsuficiencia,
                    [campo]: valor
                }
            }));
        }
    
        // Si el cambio es en un insuficiencia_item
        if (tipo === 'insuficiencia_item') {
            const updatedItems = [...insuficienciaEditada.solInsuficiencia.insuficiencia_items];
            updatedItems[index][campo] = valor;
            setInsuficienciaEditada(prevState => ({
                ...prevState,
                solInsuficiencia: {
                    ...prevState.solInsuficiencia,
                    insuficiencia_items: updatedItems
                }
            }));
        }
    
        // Si el cambio es en un insuficiencia_ajuste
        if (tipo === 'insuficiencia_ajuste') {
            const updatedItems = [...insuficienciaEditada.solInsuficiencia.insuficiencia_items];
            const item = updatedItems[index];
            const ajuste = item.insuficiencia_ajustes[ajusteIndex];
    
            // Verificar si ya existe otro ajuste con el mismo código y la misma fecha de insuficiencia
            if (campo === 'codigo_ajustar') {
                const isDuplicate = item.insuficiencia_ajustes.some((ajuste, idx) => {
                    return idx !== ajusteIndex && ajuste.codigo_ajustar === valor &&
                        item.fecha_insuficienca === ajuste.fecha_insuficienca;
                });
    
                if (isDuplicate) {
                    alert('Ya existe un ajuste con el mismo código y fecha de insuficiencia.');
                    return; // No hacemos nada si es un duplicado
                }
            }
    
            // Si no es un duplicado, actualizamos el ajuste
            item.insuficiencia_ajustes[ajusteIndex][campo] = valor;
    
            setInsuficienciaEditada(prevState => ({
                ...prevState,
                solInsuficiencia: {
                    ...prevState.solInsuficiencia,
                    insuficiencia_items: updatedItems,
                   
                }
            }));
        }
    };
    

   // console.log( insuficienciaEditada)

    const handleGuardarEdicion = async () => {
        setIsLoading(true);
        
          // Muestra un SweetAlert para confirmar si desea guardar los cambios
          const result = await Swal.fire({
            title: '¿Deseas Editar los cambios?',
            text: "Esto podra afectar los datos anteriores. Los cambios no se podrán revertir.",
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
        if (!insuficienciaEditada?.solInsuficiencia?.comentario ||  !insuficienciaEditada?.solInsuficiencia?.user_id) {
            Swal.fire('Error', 'Por favor complete todos los campos necesarios (comentario, estado, usuario).', 'error');
            return;
        }
    
        /// Cambiar el estado de la insuficiencia a "Creada" directamente en el objeto que enviarás
          let insuficienciaAEnviar = { ...insuficienciaEditada.solInsuficiencia, status: 'Orden Creada' };


       // Cambiar el estado a "Creada"
       setInsuficienciaEditada(prevState => ({
            ...prevState,
            solInsuficiencia: {
                ...prevState.solInsuficiencia,
                status: 'Orden Creada'
            }
        }));
    
    
        // Formatear las fechas dentro de insuficienciaAEnviar
        if (insuficienciaAEnviar.insuficiencia_items) {
            insuficienciaAEnviar.insuficiencia_items.forEach(item => {
                if (item.fecha_conteo) {
                    item.fecha_conteo = formatFecha(item.fecha_conteo);
                }
            });
        }
    
        // Validar 'user_id' está presente
        if (!insuficienciaAEnviar?.user_id) {
            alert("El campo 'user_id' no puede estar vacío.");
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
           // console.log('Datos enviados:', JSON.stringify(insuficienciaAEnviar));
    
            const data = await response.json();
    
            // Verificar si la respuesta es exitosa
            if (response.ok) {
                console.log('Respuesta exitosa:', data);
                Swal.fire('¡Éxito!', 'Insuficiencia actualizada correctamente.', 'success');
                navigate('/IndexInsf');
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

    return (
        <div className="container mt-4">
            <button className="btn btn-light active border-success text-success mb-3" width="100%" onClick={handleBack}>
          <i className="bx bx-arrow-back"></i> Regresar
        </button>
    <h3 className="mb-3 text-primary">Editar Orden de Insuficiencia Nº {insuficienciaEditada?.solInsuficiencia?.nsolicitud}</h3>

    {/* Muestra los detalles de la insuficiencia */}
    <div className="card p-3 mb-3" style={{ backgroundColor: '#9ec8eb', border: '1px solid #ddd' }}>
       
        <div className="row">
            <div className="col-md-6">
                <div className="form-group">
                    <label><strong>Código Solicitud:</strong></label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#eaf0f5' }}
                        value={insuficienciaEditada?.solInsuficiencia?.nsolicitud || ''} 
                        disabled
                    />

                </div>
                <div className="form-group">
                    <label><strong>Motivo:</strong></label>
                
                        <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#eaf0f5' }}
                        value={insuficienciaEditada.solInsuficiencia?.motivo || ''}
                        disabled
                    />

                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                  
                </div>
                <div className="form-group">
                    <label><strong>Responsable Conteo:</strong></label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#eaf0f5' }}
                        value={insuficienciaEditada?.solInsuficiencia?.comentario || ''}
                        onChange={(e) => handleInputChange('comentario', e.target.value, 'solInsuficiencia')}
                        disabled
                    />
                </div>
            </div>
        </div>
    </div>

    {/* Formulario de edición para los artículos (insuficiencia_items) */}
    <h2 className="text-info fw-bold">Artículos de la Insuficiencia:</h2>
    {insuficienciaEditada?.solInsuficiencia?.insuficiencia_items?.map((item, index) => (
        <div key={item.id} className="card p-3 mb-3" style={{ backgroundColor: '#c0e5e9', border: '1px solid #ddd' }}>
            <h3 className="text-blue font-weight-bold fw-bold">Artículo #{index + 1}</h3>
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label><strong>Fecha de Insuficiencia:</strong></label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={moment(item.fecha_insuficienca).format('YYYY-MM-DD HH:mm:ss.SSS') || '' }
                           disabled 
                        />
                    </div>
                    <div className="form-group">
                        <label><strong>Codigo Reportado:</strong></label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={item.item_rep || ''}
                           disabled
                        />
                    </div>
                    <div className="form-group">
                        <label><strong>Descripción del Artículo:</strong></label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={item.descripcion_rep || ''}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label><strong>Cant. Reportada:</strong></label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={item.cant_rep || ''}
                           disabled
                        />
                    </div>
                </div>
                <div className="col-md-6">

                <div className="form-group">
                        <label><strong>Fecha del Conteo</strong></label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={moment(item.fecha_conteo).format('YYYY-MM-DD HH:mm') || ''}
                            onChange={(e) => handleInputChange('item_tienda', e.target.value, 'insuficiencia_item', index)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label><strong>Conteo Físico:</strong></label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={item.conteo_fisico || ''}
                            onChange={(e) => handleInputChange('conteo_fisico', e.target.value, 'insuficiencia_item', index)}
                        />
                    </div>
                    <div className="form-group">
                        <label><strong>Comentario:</strong></label>
                        <textarea
                            type="text"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: '#eaf0f5' }}
                            value={item.comentario_tienda || ''}
                            onChange={(e) => handleInputChange('comentario_tienda', e.target.value, 'insuficiencia_item', index)}
                            row = "3"
                        />
                    </div>
                </div>
            </div>

            {/* Ajustes de cada artículo */}
            {item.insuficiencia_ajustes && item.insuficiencia_ajustes.map((ajuste, ajusteIndex) => (
                <div key={ajuste.id} className="card p-2 mb-2" style={{ backgroundColor: '#7cbccd', border: '1px solid #ddd' }}>
                    <h4 className="text-warning fw-bold text-center">Ajuste #{ajusteIndex + 1}</h4>
                    <div className="row">
                        <div className="col-md-3 mb-2">
                            <label><strong>Código Ajustar:</strong></label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.codigo_ajustar || ''}
                                onChange={(e) => handleInputChange('codigo_ajustar', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                            />
                        </div>
                            <div className="col-md-3 mb-2">
                            <label><strong>Desripcion:</strong></label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.descripcion || ''}
                                onChange={(e) => handleInputChange('descripcion', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                            />
                            


                        </div>
                        <div className="col-md-1 mb-2">
                            <label><strong>stock_sistema:</strong></label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.stock_sistema || '0'}
                                onChange={(e) => handleInputChange('stock_sistema', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                min={0}
                            />
                            


                        </div>
                        <div className="col-md-1 mb-2">
                            <label><strong>stock_fisico:</strong></label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.stock_fisico || '0'}
                                onChange={(e) => handleInputChange('stock_fisico', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                                min={0}
                            />
                            


                        </div>

                        
                       
                        <div className="col-md-3 mb-2">
                            <label><strong>Observaciones:</strong></label>
                            <textarea
                                type="text"
                                className="form-control form-control-sm"
                                style={{ backgroundColor: '#eaf0f5' }}
                                value={ajuste.observaciones || ''}
                                onChange={(e) => handleInputChange('observaciones', e.target.value, 'insuficiencia_ajuste', index, ajusteIndex)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ))}

    <div className="text-center mt-3 mb-5">
    <button className="btn btn-primary mt-3 text-white fw-bold text-center"  disabled={isLoading}  style={{ backgroundColor: '#28a745', borderColor: '#28a745' }} onClick={handleGuardarEdicion}>
    {isLoading ? 'Guardando...' : 'Guardar Solicitud'}
    </button>
    </div>


        </div>

    
    


    );
};

export default EditarInsf;
