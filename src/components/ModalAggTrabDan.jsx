import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { carritoContext } from '../contexts/carritoContext';

const ModalAggTrabDan = ({ producto, closeModal, onGuardar }) => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [tasaDia, setTasaDia] = useState(0);
    const [codigo, setCodigo] = useState('');
    const [busquedaTrabajadores, setBusquedaTrabajadores] = useState([]);
    const { apiBaseUrl } = useContext(carritoContext);

   
    // Cargar tasa del día y trabajadores desde localStorage
    useEffect(() => {
        const savedTasaDia = localStorage.getItem('tasaDia');
        if (savedTasaDia) {
            setTasaDia(savedTasaDia);
        }

        const savedTrabajadores = JSON.parse(localStorage.getItem('trabajadoresPorProducto')) || {};
        const key = `${producto.id}_${producto.tipo}`;
        if (savedTrabajadores[key]) {
            setTrabajadores(savedTrabajadores[key]);
        }
    }, [producto.id, producto.tipo]);

    // Guardar tasa del día en localStorage cuando cambia
    useEffect(() => {
        if (tasaDia !== '') {
            localStorage.setItem('tasaDia', tasaDia);
        }
    }, [tasaDia]);

    // Guardar trabajadores en localStorage
    useEffect(() => {
        if (trabajadores.length > 0) {
            const key = `${producto.id}_${producto.tipo}`;
            const trabajadoresPorProducto = JSON.parse(localStorage.getItem('trabajadoresPorProducto')) || {};
            trabajadoresPorProducto[key] = trabajadores;
            localStorage.setItem('trabajadoresPorProducto', JSON.stringify(trabajadoresPorProducto));
        }
    }, [trabajadores, producto.id, producto.tipo]);

    // Función para agregar trabajador
    const handleAddTrabajador = (trabajador) => {
        const trabajadorExistente = trabajadores.some(t =>
          `${t.cedula}-${t.id_galac}` === `${trabajador.cedula}-${trabajador.Galac_id}`
        );
      
        if (trabajadorExistente) {
          Swal.fire('Error', 'Este trabajador ya ha sido agregado.', 'error');
          return;
        }
      
        const trabajadorNuevo = {
          descripcion: trabajador.descripcion,
          cedula: trabajador.cedula,
          nombre: trabajador.nombre || '',
          apellido: trabajador.apellido || '',
          descuento: '',
          cuotas: 1,
          montoDolares: 0,
          montoBolivares: 0,
          id_galac: trabajador.Galac_id,
          productoId: producto.id,  // Aquí guardamos el id del producto
        };
      
        const nuevosTrabajadores = [...trabajadores, trabajadorNuevo];
        setTrabajadores(nuevosTrabajadores);
    };

   // Función para eliminar trabajador
const handleRemoveTrabajador = (index) => {
    const nuevosTrabajadores = [...trabajadores];
    nuevosTrabajadores.splice(index, 1);
    setTrabajadores(nuevosTrabajadores);

    // Actualizar localStorage después de eliminar un trabajador
    const savedTrabajadores = JSON.parse(localStorage.getItem('trabajadoresPorProducto')) || {};
    savedTrabajadores[`${producto.id}_${producto.tipo}`] = nuevosTrabajadores;
    localStorage.setItem('trabajadoresPorProducto', JSON.stringify(savedTrabajadores));
};

    // Función para buscar trabajadores
    useEffect(() => {
        const fetchTrabajadores = async () => {
            if (codigo) {
                const response = await fetch(`${apiBaseUrl}/biometrico/person.json?codigo=${codigo}`);
                const data = await response.json();
                setBusquedaTrabajadores(data.registros);
            }
        };
        fetchTrabajadores();
    }, [codigo, apiBaseUrl]);

    // Manejo de cambio de descuento
    const handleDescuentoChange = (index, value) => {
        const descuento = value !== '' ? parseFloat(value) : 0;
        const newTrabajadores = [...trabajadores];
        newTrabajadores[index].descuento = descuento;
        newTrabajadores[index].montoBolivares = descuento * tasaDia;

        const totalDescuentoSumado = newTrabajadores.reduce((sum, trabajador) => sum + (parseFloat(trabajador.descuento) || 0), 0);
        setTrabajadores(newTrabajadores);
    };

    // Manejo de cambio de cuotas
    const handleCuotasChange = (index, value) => {
        const newTrabajadores = [...trabajadores];
        newTrabajadores[index].cuotas = value;
        setTrabajadores(newTrabajadores);
    };

    // Manejo de cambio de tasa
    const handleTasaChange = (e) => {
        const nuevaTasa = parseFloat(e.target.value);
        setTasaDia(nuevaTasa);

        const nuevosTrabajadores = trabajadores.map(trabajador => {
            trabajador.montoBolivares = trabajador.descuento * nuevaTasa;
            return trabajador;
        });

        setTrabajadores(nuevosTrabajadores);
    };

    // Función para verificar si el monto total a descontar es válido
    const verificarTotalDescuento = () => {
        const totalDescuento = trabajadores.reduce((sum, trabajador) => sum + (parseFloat(trabajador.descuento) || 0), 0);
        const montoTotal = producto.precio;
    
        // Definir un margen de error para la comparación
        const margenDeError = 0.01;
    
        // Comparar los valores con el margen de error
        if (Math.abs(totalDescuento - montoTotal) > margenDeError) {
            Swal.fire('Error', `El monto total a descontar (${montoTotal}$) no coincide con la suma de los descuentos (${totalDescuento}$).`, 'error');
            return false;
        }
        return true;
    };
    

    // Función para aplicar el descuento total entre todos los trabajadores
    const aplicarDescuentoTotal = () => {
        const totalDescuento = producto.precio;
        const descuentoPorTrabajador = totalDescuento / trabajadores.length;
        
        const nuevosTrabajadores = trabajadores.map(trabajador => {
            trabajador.descuento = descuentoPorTrabajador;
            trabajador.montoBolivares = descuentoPorTrabajador * tasaDia;
            return trabajador;
        });

        setTrabajadores(nuevosTrabajadores);
    };

    const handleGuardarTrabajadores = () => {
        if (verificarTotalDescuento()) {
            onGuardar(producto, trabajadores, tasaDia);  // Envío de datos al padre
            closeModal();  // Opcional: cerrar después de guardar
        }
    };

    return (
        <div className="modal modal-lg" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Agregar Trabajadores para {producto.descripcion}</h5>
                        <button type="button" className="close btn btn-light btn-sm ms-auto" onClick={closeModal}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <p className='fw-bold'>Código: {producto.codigo}</p>
                        <p className='fw-bold'>Descripción: {producto.descripcion}</p>
                        <p className='fw-bold'>Total a Descontar: {producto.precio}$</p>

                        <div className="form-group">
                            <label>Tasa del Día</label>
                            <input
                                type="number"
                                className="form-control"
                                value={tasaDia}
                                onChange={handleTasaChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Cédula o Galac ID</label>
                            <input
                                type="text"
                                className="form-control"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Ingrese la cédula o Galac ID"
                            />
                        </div>

                        <div className="mt-3">
                            {busquedaTrabajadores.length > 0 && (
                                <ul className="list-group">
                                    {busquedaTrabajadores.map((trabajador) => (
                                        <li key={trabajador.Galac_id} className="list-group-item">
                                            <div>
                                                <strong>{trabajador.nombre} {trabajador.apellido}</strong> ({trabajador.codigo}) - {trabajador.descripcion}
                                            </div>
                                            <button className="btn btn-success btn-sm" onClick={() => handleAddTrabajador(trabajador)}>
                                                Agregar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-group mt-4">
                            <label>Trabajadores seleccionados</label>
                            <table className="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th>Suc</th>
                                        <th>Cédula</th>
                                        <th>Nombre</th>
                                        <th>Descuento (USD)</th>
                                        <th>Descuento (Bs)</th>
                                        <th>Cuotas</th>
                                        <th>Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trabajadores.map((trabajador, index) => (
                                        <tr key={index}>
                                            <td>{trabajador.descripcion}</td>
                                            <td>{trabajador.cedula}</td>
                                            <td>{trabajador.nombre} {trabajador.apellido}</td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    step="0.01"
                                                    value={trabajador.descuento || ''}
                                                    onChange={(e) => handleDescuentoChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td>{trabajador.montoBolivares !== undefined ? (trabajador.montoBolivares).toFixed(2)  : '0.00'}</td>
                                            <td>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    value={trabajador.cuotas}
                                                    onChange={(e) => handleCuotasChange(index, e.target.value)}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveTrabajador(index)}>
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button type="button" className="btn btn-warning" onClick={aplicarDescuentoTotal}>
                            Aplicar Monto Total entre Trabajadores
                        </button>
                    </div>

                    <div className="modal-footer">
                       
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleGuardarTrabajadores}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalAggTrabDan;
