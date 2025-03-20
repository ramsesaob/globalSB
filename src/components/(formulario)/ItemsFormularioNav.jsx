import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { carritoContext } from "../../contexts/carritoContext";

const ItemsFormularioNav = ({ show, handleClose, setProductos, productosnav, numeroPedido }) => {
  const { apiBaseUrl } = useContext(carritoContext);
  const [errors, setErrors] = useState({});
  const [focusIndex, setFocusIndex] = useState(null);
  const [descripcionNoEncontrada, setDescripcionNoEncontrada] = useState('');

  const handleSearchSerial = async (index) => {
    const serial = productosnav[index].serial;
    setDescripcionNoEncontrada(''); // Reset error message before the search
    //console.log("Buscando serial:", serial);

    try {
      const { id, descripcion, empaque } = await buscarDescripcion(serial);
      setProductos(prevProductos => {
        const updatedProductos = [...prevProductos];
        updatedProductos[index] = { ...updatedProductos[index], descripcion, id, empaque };
        return updatedProductos;
      });
    } catch (error) {
   //   console.error("Error al buscar la descripción del producto:", error);
      setDescripcionNoEncontrada('Descripción no encontrada');
      setTimeout(() => {
        setDescripcionNoEncontrada('');
      }, 5000);
    }
  };

  const buscarDescripcion = async (serial) => {
    try {
        const response = await fetch(`${apiBaseUrl}/art/serialn.json?codigo=${serial}`);
        const data = await response.json();

      //  console.log('Datos recibidos de la API:', data); // Para depuración

        if (!response.ok) {
            throw new Error("Error en la API: " + response.status);
        }

        // Verifica si el objeto contiene un ID
        if (!data || !data.id) {
            throw new Error("Descripción no encontrada");
        }

        // Ya no necesitas acceder a un array, sino directamente a las propiedades del objeto
        return {
            id: data.id,
            descripcion: data.descripcion,
            empaque: data.empaque,
        };
    } catch (error) {
        console.error("Error al buscar la descripción del producto:", error);
        throw error;
    }
};
  

const handleProductChange = (index, event, field) => {
  const updatedProducts = [...productosnav];
  let value = event.target.value.replace('.', ',').replace(',', '.'); // Convertir entre puntos y comas
  updatedProducts[index][field] = value;

  // Verificar duplicados al cambiar el serial
  if (field === 'serial') {
    const seriales = updatedProducts.map(producto => producto.serial);
    if (seriales.filter((serial, idx) => serial === value && idx !== index).length > 0) {
      setErrors(prev => ({ ...prev, [`serial-${index}`]: 'El serial ya está en uso' }));
    } else {
      setErrors(prev => {
        const { [`serial-${index}`]: removedError, ...rest } = prev;
        return rest;
      });
    }
  }

  setProductos(updatedProducts);
};
  useEffect(() => {
    if (show && productosnav.length === 0) {
      agregarProducto();
    }
  }, [show]);

  const agregarProducto = () => {
    const newErrors = {};
    const seriales = productosnav.map(producto => producto.serial); // Obtener todos los seriales
  
    productosnav.forEach((producto, index) => {
      if (!producto.serial) newErrors[`serial-${index}`] = 'El campo Serial es obligatorio';
      if (!producto.descripcion) newErrors[`descripcion-${index}`] = 'El campo Descripción es obligatorio';
      if (!producto.cantidad) newErrors[`cantidad-${index}`] = 'El campo Cantidad es obligatorio';
  
      // Verificar si hay duplicados
      if (seriales.indexOf(producto.serial) !== index) {
        newErrors[`serial-${index}`] = 'El serial ya está en uso';
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    setProductos([...productosnav, { serial: '', descripcion: '', cantidad: '' }]);
  };
  const eliminarProducto = (index) => {
    const updatedProducts = productosnav.filter((_, i) => i !== index);
    setProductos(updatedProducts);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { name } = e.target;

      if (name === 'serial') {
        handleSearchSerial(index);
        document.querySelector(`input[name="cantidad"][data-index="${index}"]`)?.focus();
      } else if (name === 'descripcion') {
        document.querySelector(`input[name="cantidad"][data-index="${index}"]`)?.focus();
      } else if (name === 'cantidad') {
        document.querySelector(`button.btn-success[data-index="${index}"]`)?.focus();
      } else if (name === 'add-button') {
        const nextIndex = index + 1;
        const nextSerialInput = document.querySelector(`input[name="serial"][data-index="${nextIndex}"]`);
        nextSerialInput ? nextSerialInput.focus() : document.querySelector('input[name="serial"][data-index="0"]')?.focus();
      }
    }
  };

  const handleAgregarClick = (index) => {
    agregarProducto();
    setTimeout(() => {
      document.querySelector(`input[name="serial"][data-index="${index + 1}"]`)?.focus();
    }, 0);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 d-flex justify-content-center">
          Agregar Productos Navidad para la Orden # {numeroPedido}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosnav.map((producto, index) => (
                <tr key={index}>
                  <td width={"30%"}>
                    <Form.Control
                      type="text"
                      name="serial"
                      data-index={index}
                      value={producto.serial}
                      onChange={(e) => handleProductChange(index, e, 'serial')}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      isInvalid={!!errors[`serial-${index}`]}
                      size="sm"
                      placeholder='ingresar serial'
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`serial-${index}`]}
                    </Form.Control.Feedback>
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      name="descripcion"
                      data-index={index}
                      value={producto.descripcion || ''}
                      onChange={(e) => handleProductChange(index, e, 'descripcion')}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      isInvalid={!!errors[`descripcion-${index}`]}
                      size="sm"
                      placeholder='ingresar descripción'
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`descripcion-${index}`]}
                    </Form.Control.Feedback>
                    {descripcionNoEncontrada && (
                      <p className="text-danger mt-1">{descripcionNoEncontrada}</p>
                    )}
                  </td>
                  <td width={"10%"}>
                    <Form.Control
                      type="text"
                      name="cantidad"
                      data-index={index}
                      value={producto.cantidad}
                      onChange={(e) => handleProductChange(index, e, 'cantidad')}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={() => setFocusIndex(index)}
                      onBlur={() => setFocusIndex(null)}
                      isInvalid={!!errors[`cantidad-${index}`]}
                      size="sm"
                      style={{ width: '100px' }}
                      placeholder='ingresar cantidad'
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`cantidad-${index}`]}
                    </Form.Control.Feedback>
                    {focusIndex === index && producto.empaque && ( // Display only when focused
                    <p className="text-muted">Cantidad mínima: {parseFloat(producto.empaque).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  )}
                  </td>
                  <td width={"10%"} className="text-center">
                    <Button variant="danger" size="sm" onClick={() => eliminarProducto(index)}>
                      <i className='bx bx-trash'></i>
                    </Button>
                    <Button variant="success" size="sm" onClick={() => handleAgregarClick(index)} data-index={index}>
                      +
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <h6 className='fw-bolder text-black m-0'>Cantidad de Artículos Agregados en la Orden: "{productosnav.length}"</h6>
        <Button variant="danger" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ItemsFormularioNav;
