import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import logo2 from '../assets/logo2.png';
import { useNavigate } from 'react-router-dom';
import { carritoContext } from "../contexts/carritoContext";
import ItemsFormularioCompra from '../components/(formulario)/ItemsFormularioCompra';
import RevisionCompra from '../components/RevisionCompra';
import { Button } from 'react-bootstrap';

const FormularioCompra = () => {
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
    const [productosCompra, setProductosCompra] = useState(() => {
        const savedProducts = localStorage.getItem('productosCompra');
        return savedProducts ? JSON.parse(savedProducts) : [];
    });
    const [errorDescripcion, setErrorDescripcion] = useState('');
    const [fechaCreacion, setFechaCreacion] = useState('');
    const [motivosSeleccionados, setMotivosSeleccionados] = useState([]);
    const [datos, setDatos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [motivoActual, setMotivoActual] = useState('');
    const [comentario, setComentario] = useState('');

    useEffect(() => {
        const today = new Date();
        setFechaCreacion(today.toISOString().split('T')[0]); // Formato YYYY-MM-DD
    }, []);

    useEffect(() => {
        const storedProductos = JSON.parse(localStorage.getItem('productosCompra')) || [];
        setProductosCompra(storedProductos);
    }, []);

    useEffect(() => {
        localStorage.setItem('productosCompra', JSON.stringify(productosCompra));
    }, [productosCompra]);

    const opciones = [
        { value: "1", label: "Reparacion / Materiales" },
        { value: "2", label: "Papeleria / Material de Oficina" },
        { value: "3", label: "Equipos de Sistema" },
        { value: "4", label: "Repuestos Vehiculos" },
    ];

    const renderButtons = () => {
        return opciones.map(opcion => (
            motivosSeleccionados.includes(opcion.value) && (
                <Button
                    key={opcion.value}
                    className='btn btn-success btn-sm mx-2 my-2'
                    onClick={() => { setMotivoActual(opcion.value); handleShow(); }}
                >
                    Agregar Productos de {opcion.label}
                </Button>
            )
        ));
    };

    const handleMotivoChange = (event) => {
        const value = event.target.value;
        setMotivosSeleccionados((prev) =>
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
    };
    

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validación de campos vacíos en los productos
        for (const producto of productosCompra) {
            if (!producto.descripcion || !producto.cantidad || !producto.medida || !producto.motivo || !producto.area) {
                Swal.fire({
                    icon: 'error',
                    title: 'Campos incompletos',
                    text: `El producto con código ${producto.ItemCode} tiene campos vacíos. Por favor complete todos los campos.`,
                });
                return; // Detener el envío si algún campo está vacío
            }
        }
        
        Swal.fire({
            title: "¿Desea guardar los cambios?",
            showDenyButton: true,
            confirmButtonText: "Guardar",
            denyButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Crear el payload con los motivos y productos
                    const motivoPayload = {
                        motivo01: motivosSeleccionados.includes("1") ? 1 : 0,
                        motivo02: motivosSeleccionados.includes("2") ? 1 : 0,
                        motivo03: motivosSeleccionados.includes("3") ? 1 : 0,
                        motivo04: motivosSeleccionados.includes("4") ? 1 : 0,
                    };
        
                    const payload = {
                        user_id: datosUsuario.user.id,
                        num_ped: getNextNumeroPed(),
                        tipo: datosUsuario.user.sucursale_id === 35 ? 0 : 1,
                        anulada: 1,
                        PCO: 1,
                        status: 'Pendiente',
                        comentario: comentario,
                        aprobada: 1,
                        ...motivoPayload, // Agregar motivos
                        items_compras: productosCompra.map(producto => ({
                            codigo: producto.ItemCode,
                            descripcion: producto.descripcion,
                            cantidad: producto.cantidad,
                            medida: producto.medida,
                            area: producto.area,
                            motivo: producto.motivo,
                            inventario: motivosSeleccionados.includes("2") ? producto.inventario : undefined,
                            consumo: motivosSeleccionados.includes("2") ? producto.consumo : undefined,
                            tipo_motivo: producto.tipo_motivo,
                            validado: 0
                        }))
                    };
        
                    console.log('Payload a enviar:', payload);
                    const response = await fetch(`${apiBaseUrl}/ordencompra/guardar.json`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
        
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al enviar los datos');
                    }
        
                    const responseData = await response.json();
                    console.log('Datos enviados correctamente', responseData);
        
                    setProductosCompra([]);  // Resetea el estado de los productos
                    localStorage.removeItem('productosCompra');  // Limpia el almacenamiento local
                    navigate('/IndexPageCompra');
                } catch (error) {
                    console.error('Error al enviar la solicitud:', error);
                    Swal.fire('Error', error.message, 'error');
                }
            }
        });
    };
    

    useEffect(() => {
        const getDatos = async () => {
            const response = await fetch(`${apiBaseUrl}/ordencompra/numped.json`);
            const data = await response.json();
            setDatos(data.orden || []);
        };
        getDatos();
    }, [apiBaseUrl]);

    const getNextNumeroPed = () => {
        if (datos.length > 0) {
            const maxNumeroPed = Math.max(...datos.map(item => parseInt(item.num_ped)));
            return maxNumeroPed + 1;
        }
        return 1;
    };
 // console.log(productosCompra);


    return (
        <form onSubmit={handleSubmit}>
            <div className='container'>
                <div className='py-1 col-12'>
                    <div className="d-flex justify-content-between">
                        <img src={logo2} alt="logo" width={50} />
                        <h3 className="py-2 text-center">Solicitud de Compra</h3>
                        <img src={logo2} alt="logo" width={50} />
                    </div>
                    <div className='row'>
                        <h6>(*) Datos Requeridos</h6>
                        <div className='col-5'>
                            <label htmlFor="solicitante" className="col-form-label fw-bolder">Solicitante:</label>
                            <input
                                style={{ width: "300px" }}
                                id="solicitante"
                                className="form-control"
                                type="text"
                                defaultValue={datosUsuario.user.nombre}
                                disabled
                                readOnly
                            />
                        </div>
                        <div className='col-3'>
                            <label htmlFor="numeroSolicitud" className="col-form-label fw-bolder">Nº de Solicitud:</label>
                            <input
                                style={{ width: "200px" }}
                                id="numeroSolicitud"
                                className="form-control"
                                type="text"
                                value={getNextNumeroPed()}
                                disabled
                               
                            />
                        </div>
                        <div className='col-4 text-start' >
                            <label htmlFor="fechaSolicitud" className="col-form-label fw-bolder">Fecha de Solicitud:</label>
                            <input
                                style={{ width: "200px" }}
                                id="fechaSolicitud"
                                className="form-control text-start"
                                type="text"
                                value={fechaCreacion}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-5'>
                            <label htmlFor="motivo" className="col-form-label fw-bolder">Motivo de la Solicitud</label>
                            {opciones.map((opcion) => (
                                <div key={opcion.value}>
                                    <input
                                        type="checkbox"
                                        id={opcion.value}
                                        value={opcion.value}
                                        checked={motivosSeleccionados.includes(opcion.value)}
                                        onChange={handleMotivoChange}
                                    />
                                    <label htmlFor={opcion.value}>{opcion.label}</label>
                                </div>
                            ))}
                        </div>
                        <div className='col-6'>
                        <label htmlFor="fechaSolicitud" className="col-form-label fw-bolder">Comentario</label>
                            <textarea
                                style={{ width: "500px" }}
                                id="comentario"
                                className="form-control text-start"
                                type="text"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)} // Actualiza el estado al escribir
                              
                                placeholder='Ingrese un comentario'
                                
                            />
                        </div>
                    </div>
                    <div className='row py-2'>
                        <div className='col-12'>
                            <h5 className='text-start py-1 text-start'>Agregue los Productos a la Solicitud:</h5>
                            {renderButtons()}
                            <ItemsFormularioCompra
                                show={showModal}
                                handleClose={handleClose}
                                setProductosCompra={setProductosCompra}
                                productosCompra={productosCompra}
                                errorDescripcion={errorDescripcion}
                                datos={datos}
                                getNextNumeroPed={getNextNumeroPed}
                                motivoActual={motivoActual}
                                opciones = {opciones}
                            />
                        </div>
                    </div>
                    <div className='text-center py-3'>
                        <h5 className='fw-bolder text-black py-3'>Cantidad de Artículos Agregados en la Orden: "{productosCompra.length}"</h5>
                        {productosCompra.length > 0 && (
                            <RevisionCompra productosCompra={productosCompra} opciones={opciones} />
                            
                        )}
                        
                        {productosCompra.length > 0 ? (
                              <input className="btn btn-primary mx-2" type="submit" value="ENVIAR" />
                          ) : (
                              <input className="btn btn-disabled mx-2" type="submit" value="ENVIAR" disabled />
                          )}

                                        
                    </div>
                </div>
            </div>
        </form>
    );
};

export default FormularioCompra;
