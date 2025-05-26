import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';
import Swal from 'sweetalert2';

const ModalViewDatosInsfSap = ({ showModal, handleClose, solInsuficiencia, handleItemApproval }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  useEffect(() => {
   // console.log("selectedItems updated:", selectedItems);
  }, [selectedItems, solInsuficiencia, handleClose]);
  
  const handleSelectItem = (ajusteId, isChecked) => {
    setSelectedItems((prevSelectedItems) => {
      if (isChecked) {
        // Agregar solo si no está ya en la lista
        if (!prevSelectedItems.includes(ajusteId)) {
          return [...prevSelectedItems, ajusteId];
        }
      } else {
        // Eliminar el ajusteId de la lista si se desmarca
        return prevSelectedItems.filter((id) => id !== ajusteId);
      }
      return prevSelectedItems;
    });
  };
  
  

  
  //console.log('solInsuficiencia', solInsuficiencia);
  //console.log('selectedItems', selectedItems);
 // console.log("usuario", datosUsuario.user.id);

  // Función para manejar la aprobación de items

  const handleApproveItems = async () => {
    // Asegurarse de que haya elementos seleccionados
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selección de Items',
        text: 'Por favor, seleccione al menos un item.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
   
  
    
  
    // Obtenemos la fecha actual
    const fechaActual = new Date().toISOString();
  
    try {
      const response = await fetch(`${apiBaseUrl}/ajuste/aprobado.json`, {
        method: 'PUT',
        body: JSON.stringify({
          ids: selectedItems,
          usuario: datosUsuario.user.id,  // Pasamos el ID del usuario actual desde el frontend
          fecha: fechaActual,  // Si necesitas enviar la fecha desde el frontend
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (data.message === 'Items aprobados correctamente') {
        Swal.fire({
          icon: 'success',
          title: 'Guardado!',
          text: 'La solicitud se ha guardado correctamente.',
          confirmButtonText: 'Aceptar'
        });
        handleClose();
        // Actualizar el estado local o realizar refetch si es necesario
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al aprobar los items.',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      console.error('Error al aprobar items:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al aprobar los items.',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  
  

  if (!showModal || !solInsuficiencia) return null; // Aseguramos que haya datos para mostrar

  

  return (
    <div className="modal show modal-lg" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles de la Solicitud de Insuficiencia</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          <div className="modal-body">
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>Códigos Ajuste</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Tienda</th>
                  <th>Motivo</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
              {solInsuficiencia.insuficiencia_items && solInsuficiencia.insuficiencia_items.length > 0 ? (
                solInsuficiencia.insuficiencia_items.map((item) => (
                  // Mapeamos los ajustes de cada item
                  item.insuficiencia_ajustes.map((ajuste) => (
                    <tr key={ajuste.id} className={ajuste.procesado == 1 ? "table-success" : "table-danger"}>
                      <td>
                        <input
                          type="checkbox"
                          disabled={ajuste.procesado == 1}  // Verificar si ya está procesado
                          checked={selectedItems.includes(ajuste.id)} // Verificar si el ajuste está seleccionado
                          onChange={(e) => handleSelectItem(ajuste.id, e.target.checked)} // Pasamos el ajuste.id y el estado del checkbox
                        />
                      </td>
                      <td>{ajuste.codigo_ajustar}</td>
                      <td>{ajuste.entrada}</td>
                      <td>{ajuste.salida}</td>
                      <td>{solInsuficiencia.user.sucursale.codigo}</td>
                      <td>{ajuste.observacion_inv}</td>
                      <td>
                        {parseFloat(((item.precio01) - ajuste.precio).toFixed(2) * ajuste.salida).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No hay items disponibles.</td>
                </tr>
              )}
            </tbody>

            </table>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
            <button type="button" className="btn btn-primary" onClick={handleApproveItems}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalViewDatosInsfSap;
