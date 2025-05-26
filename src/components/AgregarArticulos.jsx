import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { carritoContext } from "../contexts/carritoContext";
const AgregarArticulos = ({ show, handleClose, setProductos, productos, numeroPedido }) => {
  const { apiBaseUrl } = useContext(carritoContext);
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [errors, setErrors] = useState({});
  const [focusIndex, setFocusIndex] = useState(null); // Estado para controlar el índice enfocado
  const [descripcionNoEncontrada, setDescripcionNoEncontrada] = useState('');

  const handleSearchSerial = async (index) => {
    try {
      const serial = productos[index].serial;
      const articulo = await buscarDescripcion(serial);  // Ahora esta función devuelve todos los campos del producto
  
      setProductos(prevProductos => {
        const updatedProductos = [...prevProductos];
        updatedProductos[index] = {
          ...updatedProductos[index],
          ...articulo,  // Asigna todos los campos del artículo al producto correspondiente
        };
        return updatedProductos;
      });
  
      setDescripcionNoEncontrada(''); // Limpiar mensaje si se encuentra la descripción
    } catch (error) {
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

        if (!response.ok) {
            throw new Error("Error en la API: " + response.status);
        }

        // Verifica si el objeto contiene un ID
        if (!data || !data.id) {
            throw new Error("Descripción no encontrada");
        }

        // Devolver todos los campos necesarios
        return {
            id: data.id,
            descripcion: data.descripcion,
            empaque: data.empaque,
            departamento: data.departamento,
            categoria: data.categoria,
            codigo: data.codigo,
            pcs_danadas: data.pcs_danadas || '', // Si no tiene cantidad, se inicializa como vacío
            cod_departamento: data.cod_departamento,
            unidad_compra: data.unidad_compra,
            precio: data.precio,
            cod_barra: data.cod_barra,
            PorcImpuesto: data.PorcImpuesto,
            composicion: data.composicion
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
     // if (!producto.cantidad) newErrors[`cantidad-${index}`] = 'El campo Piezas Dañadas es obligatorio';
      if (!producto.presentacion_set) newErrors[`presentacion_set-${index}`] = 'El campo Piezas por Set es obligatorio';
      if (!producto.stock) newErrors[`stock-${index}`] = 'El campo Stock es obligatorio';
  
      // Verificar si hay duplicados
      if (seriales.indexOf(producto.serial) !== index) {
        newErrors[`serial-${index}`] = 'El serial ya está en uso';
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Si hay errores, detén el proceso
    }
  
    setErrors({}); // Si no hay errores, vacía los errores previos
  
    // Agregar un nuevo producto vacío
    const nuevoProducto = { serial: '', descripcion: '', cantidad: '', presentacion_set: '', stock: '' };
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
    /**if (field === 'serial') {
      const seriales = updatedProducts.map(producto => producto.serial);
      if (seriales.filter((serial, idx) => serial === value && idx !== index).length > 0) {
        setErrors(prev => ({ ...prev, [`serial-${index}`]: 'El serial ya está en uso' }));
      } else {
        setErrors(prev => {
          const { [`serial-${index}`]: removedError, ...rest } = prev;
          return rest;
        });
      }
    }*/
  
    setProductos(updatedProducts);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Evitar el comportamiento por defecto
  
      const { name } = e.target;
      //console.log(`Presionado Enter en el campo: ${name} (Índice: ${index})`);
  
      let nextField;
      if (name === 'serial') {
        handleSearchSerial(index);
        nextField = document.querySelector(`input[name="descripcion"][data-index="${index}"]`);
    
      } else if (name === 'descripcion') {
        nextField = document.querySelector(`input[name="pcs_danadas"][data-index="${index}"]`);
      
      } else if (name === 'pcs_danadas') {
        nextField = document.querySelector(`input[name="presentacion_set"][data-index="${index}"]`);
      
      } else if (name === 'presentacion_set') {
        // Asegurémonos de que estamos encontrando el campo de "stock" correctamente
        nextField = document.querySelector(`input[name="stock"][data-index="${index}"]`);
       
      } else if (name === 'stock') {
        nextField = document.querySelector(`button.btn-success[data-index="${index}"]`);
      } else if (name === 'add-button') {
        const nextIndex = index + 1;
        if (nextIndex < productos.length) {
          nextField = document.querySelector(`input[name="serial"][data-index="${nextIndex}"]`);
        } else {
          nextField = document.querySelector('input[name="serial"][data-index="0"]');
        }
      }
  
      // Verificamos si se encontró el siguiente campo
      if (nextField) {
       // console.log(`Enfocando en el siguiente campo: ${nextField.name} (Índice: ${index})`);
        nextField.focus();
      } else {
      //  console.log(`No se pudo encontrar el siguiente campo para el índice: ${index}`);
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
    <Modal show={show} onHide={handleClose} size="xl" centered>
    <Modal.Header closeButton>
    <Modal.Title className="w-100 d-flex justify-content-center">
          Agregar Articulos
        </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Descripción</th>
              <th>Pieza Dañadas</th>
              <th>Piezas por Set</th>
              <th>Stock Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr key={index}>
                <td width={"25%"}>
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
                    name="pcs_danadas"
                    data-index={index}
                    value={producto.pcs_danadas}
                    onChange={(e) => handleProductChange(index, e, 'pcs_danadas')}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  ///  onFocus={() => setFocusIndex(index)} // Set focus index
                 //   onBlur={() => setFocusIndex(null)} // Clear focus index
                    isInvalid={!!errors[`pcs_danadas-${index}`]}
                    size="sm"
                    style={{ width: '100px' }} // Ajusta el ancho aquí
                    placeholder='ingresar pcs_danadas'
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`pcs_danadas-${index}`]}
                  </Form.Control.Feedback>
                </td>
                <td width={"10%"}>
                    <Form.Control
                      type="text"
                      name="presentacion_set"
                      data-index={index}
                      value={producto.presentacion_set}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => handleProductChange(index, e, 'presentacion_set')}
                      size="sm"
                      placeholder="piezas por set"
                      isInvalid={!!errors[`presentacion_set-${index}`]}
                      onFocus={() => setFocusIndex(index)} // Set focus index
                      onBlur={() => setFocusIndex(null)} // Clear focus index
                    />
                    <Form.Control.Feedback type="invalid">
                    {errors[`presentacion_set-${index}`]}
                  </Form.Control.Feedback>
                  {focusIndex === index && producto.empaque && ( // Display only when focused
                    <p className="text-muted">Empaque: {parseFloat(producto.empaque).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  )}
                  </td>
                  <td width={"10%"}>
                    <Form.Control
                      type="text"
                      name="stock"
                      data-index={index}
                      value={producto.stock}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => handleProductChange(index, e, 'stock')}
                      size="sm"
                      placeholder="stock disponible"
                      isInvalid={!!errors[`stock-${index}`]}
                    />
                    <Form.Control.Feedback type="invalid">
                    {errors[`stock-${index}`]}
                  </Form.Control.Feedback>
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


export default AgregarArticulos;
