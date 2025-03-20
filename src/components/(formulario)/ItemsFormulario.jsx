import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { carritoContext } from "../../contexts/carritoContext";
const ItemsFormulario = ({ show, handleClose, setProductos, productos, numeroPedido, datos }) => {
  const { apiBaseUrl } = useContext(carritoContext);
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [errors, setErrors] = useState({});
  const [focusIndex, setFocusIndex] = useState(null); // Estado para controlar el índice enfocado
  const [descripcionNoEncontrada, setDescripcionNoEncontrada] = useState('');

  const handleSearchSerial = async (index) => {
    try {
      const serial = productos[index].serial;
      const { id, descripcion, empaque } = await buscarDescripcion(serial);
  
      setProductos(prevProductos => {
        const updatedProductos = [...prevProductos];
        updatedProductos[index] = {
          ...updatedProductos[index],
          descripcion: descripcion,
          id: id,
          empaque: empaque,
        };
        return updatedProductos;
      });
  
      setDescripcionNoEncontrada(''); // Limpiar mensaje si se encuentra la descripción
    } catch (error) {
  //    console.error("Error al buscar la descripción del producto:", error);
      setDescripcionNoEncontrada('Descripción no encontrada');
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setDescripcionNoEncontrada('');
      }, 5000);
    }
  };
  

  const buscarDescripcion = async (serial) => {
    try {
        const response = await fetch(`${apiBaseUrl}/art/serial.json?codigo=${serial}`);
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



  useEffect(() => {
    if (show && productos.length === 0) {
      agregarProducto();
    }
  }, [show]); // Agrega un producto automáticamente si el modal se muestra y está vacío

  const agregarProducto = () => {
    const newErrors = {};
    const seriales = productos.map(producto => producto.serial); // Obtener todos los seriales
  
    productos.forEach((producto, index) => {
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
    const nuevoProducto = { serial: '', descripcion: '', cantidad: '' };
    setProductos([...productos, nuevoProducto]);
  };
  
  const eliminarProducto = (index) => {
    const updatedProducts = productos.filter((_, i) => i !== index);
    setProductos(updatedProducts);
  };

  const handleProductChange = (index, event, field) => {
    const updatedProducts = [...productos];
    let value = event.target.value;
  
    if (value.includes('.')) {
      value = value.replace('.', ',');
    }
  
    value = value.replace(',', '.');
  
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

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const { name } = e.target;

      if (name === 'serial') {
        handleSearchSerial(index);

        const cantidadInput = document.querySelector(`input[name="cantidad"][data-index="${index}"]`);
        if (cantidadInput) {
          cantidadInput.focus();
        }
      } else if (name === 'descripcion') {
        const cantidadInput = document.querySelector(`input[name="cantidad"][data-index="${index}"]`);
        if (cantidadInput) {
          cantidadInput.focus();
        }
      } else if (name === 'cantidad') {
        const addButton = document.querySelector(`button.btn-success[data-index="${index}"]`);
        if (addButton) {
          addButton.focus();
        }
      } else if (name === 'add-button') {
        const nextIndex = index + 1;
        if (nextIndex < productos.length) {
          const nextSerialInput = document.querySelector(`input[name="serial"][data-index="${nextIndex}"]`);
          if (nextSerialInput) {
            nextSerialInput.focus();
          }
        } else {
          const firstSerialInput = document.querySelector('input[name="serial"][data-index="0"]');
          if (firstSerialInput) {
            firstSerialInput.focus();
          }
        }
      }
    }
  };

  const handleAgregarClick = (index) => {
    agregarProducto();

    setTimeout(() => {
      const newIndex = index + 1;
      const newSerialInput = document.querySelector(`input[name="serial"][data-index="${newIndex}"]`);
      if (newSerialInput) {
        newSerialInput.focus();
      }
    }, 0);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
    <Modal.Header closeButton>
    <Modal.Title className="w-100 d-flex justify-content-center">
          Productos de la Orden # {numeroPedido}
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
            {productos.map((producto, index) => (
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
                    onFocus={() => setFocusIndex(index)} // Set focus index
                    onBlur={() => setFocusIndex(null)} // Clear focus index
                    isInvalid={!!errors[`cantidad-${index}`]}
                    size="sm"
                    style={{ width: '100px' }} // Ajusta el ancho aquí
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
      <h6 className='fw-bolder text-black m-0'>Cantidad de Artículos Agregados en la Orden: "{productos.length}"</h6>
      <Button variant="danger" onClick={handleClose}>Cerrar</Button>
    </Modal.Footer>

  </Modal>
);
};


export default ItemsFormulario;
