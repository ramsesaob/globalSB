import React, { useContext, useState } from 'react';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';
import Swal from 'sweetalert2';
const ModalAggTrabInsf = ({ item, closeModal }) => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [tasaDia, setTasaDia] = useState('');
  const [totalDescontar, setTotalDescontar] = useState(Math.abs(item.precio02)); // Total siempre positivo
  const [descuentoTotal, setDescuentoTotal] = useState(0); // Total de descuentos acumulados
  const [codigo, setCodigo] = useState(''); // Guardamos el código o cédula ingresado
  const [busquedaTrabajadores, setBusquedaTrabajadores] = useState([]); // Resultados de búsqueda
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [isLoading, setIsLoading] = useState(false);

  // Función para buscar trabajadores por cédula o Galac_id
  const buscarTrabajadores = async () => {
    if (codigo) {
      const response = await fetch(`${apiBaseUrl}/biometrico/person.json?codigo=${codigo}`);
      const data = await response.json();
      setBusquedaTrabajadores(data.registros); // Guardamos los trabajadores encontrados
    }
  };
  

  // Añadir un trabajador a la lista de trabajadores
  const handleAddTrabajador = (trabajador) => {
    // Verificamos si el trabajador ya está en la lista antes de agregarlo
    const trabajadorExistente = trabajadores.some(t => t.cedula === trabajador.cedula || t.id_galac === trabajador.Galac_id);
    
    if (trabajadorExistente) {
      Swal.fire('Error', 'Este trabajador ya ha sido agregado.', 'error');
      return; // No agregar el trabajador si ya está en la lista
    }
  
    const trabajadorNuevo = {
      descripcion: trabajador.descripcion,
      cedula: trabajador.cedula,
      nombre: trabajador.nombre || '',
      apellido: trabajador.apellido || '',
      descuento: '', // Inicializar como vacío para permitir la edición
      cuotas: 1, // Cuotas por trabajador
      montoDolares: 0,
      montoBolivares: 0, // Inicializar en 0
      id_galac: trabajador.Galac_id,
    };
  
    setTrabajadores([...trabajadores, trabajadorNuevo]);
    setBusquedaTrabajadores([]); // Limpiar resultados de búsqueda
    setCodigo(''); // Limpiar el campo de búsqueda
  };
  
  // Eliminar un trabajador de la lista
  const handleRemoveTrabajador = (index) => {
    const newTrabajadores = [...trabajadores];
    newTrabajadores.splice(index, 1); // Eliminar el trabajador en el índice dado
    setTrabajadores(newTrabajadores);
  };

  // Cambio de descuento en dólares
// Cambio de descuento en dólares
const handleDescuentoChange = (index, value) => {
    const descuento = value !== '' ? parseFloat(value) : 0;
    const newTrabajadores = [...trabajadores];
  
    // Actualizamos el valor del descuento en dólares
    newTrabajadores[index].descuento = descuento;
  
    // Calculamos el monto en bolívares (descuento * tasaDia)
    newTrabajadores[index].montoBolivares = descuento * tasaDia;
  
    // Calcular la sumatoria de descuentos en bolívares
    const totalDescuentoSumado = newTrabajadores.reduce((sum, trabajador) => sum + (parseFloat(trabajador.descuento) || 0), 0);

// Aplicar toFixed(2) después de la suma para formatear el resultado final
const totalDescuentoSumadoFormateado = totalDescuentoSumado.toFixed(2);

  
    setDescuentoTotal(totalDescuentoSumado);
  
    // Actualizar el estado con los nuevos trabajadores
    setTrabajadores(newTrabajadores);
  };
  

  // Cambio de cuotas por trabajador
  const handleCuotasChange = (index, value) => {
    const newTrabajadores = [...trabajadores];
    newTrabajadores[index].cuotas = value;
    setTrabajadores(newTrabajadores);
  };

  const handleSave = async () => {
    // Validar si todos los trabajadores tienen un descuento
    for (let trabajador of trabajadores) {
      if (!trabajador.descuento || trabajador.descuento === '') {
        Swal.fire('Error', `El descuento del trabajador ${trabajador.nombre} ${trabajador.apellido} no está especificado.`, 'error');
        return;
      }
    }
  
    
  
    setIsLoading(true);
  
    const result = await Swal.fire({
      title: '¿Deseas guardar los cambios?',
      text: "Los cambios no se podrán revertir.",
      icon: 'warning',
      showCancelButton: true, 
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'No, cancelar'
    });
  
    if (descuentoTotal.toFixed(2) > totalDescontar.toFixed(2)) {
      Swal.fire('Error', 'La sumatoria de descuentos no puede superar el total a descontar', 'error');
      setIsLoading(false); // Desactivar el estado de carga si no se cumple la validación
      return;
    }
  
    if (descuentoTotal.toFixed(2) < totalDescontar.toFixed(2)) {
      Swal.fire('Error', 'La sumatoria de descuentos no puede ser inferior al total a descontar', 'error');
      setIsLoading(false); // Desactivar el estado de carga si no se cumple la validación
      return;
    }
  
    // Datos a enviar al backend
    const data = trabajadores.map(trabajador => ({
      cedula: trabajador.cedula,
      id_galac: trabajador.id_galac,
      total: totalDescontar,
      tasa: tasaDia,
      desc_dolar: trabajador.descuento,
      desc_boli: trabajador.montoBolivares,
      cuotas: trabajador.cuotas,
      insuficiencia_items_id: item.id,
      motivo: 'INSUFICIENCIA',
      user_id: datosUsuario.user.id,
      cod_suc: item.cod_suc,
      codigo_art: item.item_rep,
    }));
  
    try {
      const response = await fetch(`${apiBaseUrl}/descuento/guardar.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
        console.log('Respuesta del servidor:', errorText); // Imprimir la respuesta para depuración
  
        Swal.fire('Error', 'Hubo un problema con la solicitud al servidor.', 'error');
        setIsLoading(false);
        return;
      }
  
      const result = await response.json();
      console.log("Respuesta completa del backend:", result);
  
      if (result.descuento) {
        Swal.fire('Guardado!', 'La solicitud se ha guardado correctamente.', 'success');
        // Llamamos a handleUpdateItems para actualizar los datos en el componente principal
      
        setIsLoading(false);
        closeModal();
      } else {
        Swal.fire('Guardado!', 'La solicitud se ha guardado correctamente.', 'success');

      
        setIsLoading(false);
        closeModal();
      }
  
    } catch (error) {
      console.error('Error en el fetch:', error);
      Swal.fire('Error', `Hubo un error al guardar la solicitud: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  
  
  
  
  

  return (
    <div className="modal modal-lg" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Agregar Trabajadores para {item.item_rep}</h5>
            <button type="button" className="close" onClick={closeModal}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>Fecha: {moment(item.fecha_insuficienca).format('YYYY-MM-DD')}</p>
            <p>Descripción: {item.descripcion_rep}</p>
            <p>Total a descontar: {item.precio02}</p>

            <div className="form-group">
              <label>Tasa del Día</label>
              <input 
                type="number"
                className="form-control"
                value={tasaDia}
                onChange={(e) => setTasaDia(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Total a descontar</label>
              <input 
                type="number"
                className="form-control"
                value={totalDescontar}
                onChange={(e) => setTotalDescontar(Math.abs(e.target.value))}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Cédula o Galac ID</label>
              <input 
                type="text"
                className="form-control"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)} // Actualizamos el estado cuando se cambia el valor
                placeholder="Ingrese la cédula o Galac ID"
              />
              <button className="btn btn-primary mt-2" onClick={buscarTrabajadores}>
                Buscar
              </button>
            </div>

            {/* Mostrar resultados de búsqueda */}
            <div className="mt-3">
              {busquedaTrabajadores.length > 0 && (
                <ul className="list-group">
                  {busquedaTrabajadores.map((trabajador) => (
                    <li key={trabajador.Galac_id} className="list-group-item">
                      <div>
                        <strong>{trabajador.nombre} {trabajador.apellido}</strong> ({trabajador.codigo}) - {trabajador.descripcion}
                      </div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAddTrabajador(trabajador)}
                      >
                        Agregar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tabla de trabajadores seleccionados */}
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
                            className='form-control form-control-sm'
                          type="number"
                          step="0.01"  // Permitimos decimales
                          value={trabajador.descuento || ''} // Si descuento es 0 o vacío, mostrar vacío
                          onChange={(e) => handleDescuentoChange(index, e.target.value)}
                        />
                      </td>
                      <td>{trabajador.montoBolivares !== undefined ? trabajador.montoBolivares.toFixed(2) : '0.00'}</td>
                      <td>
                        <input
                         className='form-control form-control-sm'
                          type="number"
                          value={trabajador.cuotas}
                          onChange={(e) => handleCuotasChange(index, e.target.value)}
                        />
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveTrabajador(index)}
                        >
                          <i className='bx bx-trash' ></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAggTrabInsf;
