import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap';

const ItemsFormularioCompra = ({ show, handleClose, setProductosCompra, getNextNumeroPed, motivoActual, opciones }) => {
  
  const [productosPorMotivo, setProductosPorMotivo] = useState({
    "1": [],
    "2": [],
    "3": [],
    "4": []
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(""); // Estado para almacenar el texto de búsqueda

  // Cargar los artículos desde la API
  useEffect(() => {
    const fetchArticulos = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://globalbusiness.ddns.net:12443/apick/art/articulos.json');
        const data = await response.json();
        setArticulos(data.articulos); // Guardamos los artículos en el estado
      } catch (error) {
        console.error('Error al obtener los artículos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticulos();
  }, []);

  useEffect(() => {
    const currentProducts = productosPorMotivo[motivoActual] || [];
    setFilteredProducts(currentProducts);
    setProductosCompra(Object.values(productosPorMotivo).flat());
  }, [productosPorMotivo, motivoActual, setProductosCompra]);

  const agregarProducto = () => {
    const newErrors = {};
    filteredProducts.forEach((producto, index) => {
      if (!producto.motivo) newErrors[`motivo-${index}`] = 'El campo Motivo es obligatorio';
      if (!producto.descripcion) newErrors[`descripcion-${index}`] = 'El campo Descripción es obligatorio';
      if (!producto.cantidad) newErrors[`cantidad-${index}`] = 'El campo Cantidad es obligatorio';
      if (!producto.medida) newErrors[`medida-${index}`] = 'El campo Unidad Medida es obligatorio';
      if (!producto.area) newErrors[`area-${index}`] = 'El campo Área Utilizar es obligatorio';
      if (motivoActual === "2") {
        if (!producto.inventario) newErrors[`inventario-${index}`] = 'El campo Inventario es obligatorio';
        if (!producto.consumo) newErrors[`consumo-${index}`] = 'El campo Consumo es obligatorio';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => {
        setErrors({});
      }, 3000);
      return;
    }

    const nuevoProducto = {
      serial: '',
      descripcion: '',
      cantidad: '1',
      medida: '',
      area: '',
      motivo: '',
      inventario: '',
      consumo: '',
      tipo_motivo: motivoActual || '',
    };

    setProductosPorMotivo(prev => {
      const updated = {
        ...prev,
        [motivoActual]: [...prev[motivoActual], nuevoProducto]
      };
      setProductosCompra(Object.values(updated).flat());
      return updated;
    });
  };

  const eliminarProducto = (index) => {
    setProductosPorMotivo(prev => {
      // Filtrar el producto eliminado y actualizar el estado
      const updatedProducts = prev[motivoActual].filter((_, i) => i !== index);
      
      // Actualizar el estado con la lista filtrada
      const updated = {
        ...prev,
        [motivoActual]: updatedProducts
      };
      
      setProductosCompra(Object.values(updated).flat());
      return updated;
    });
  };
  
  

  const handleProductChange = (index, event, field) => {
    const updatedProducts = [...productosPorMotivo[motivoActual]];
    updatedProducts[index][field] = event.target.value;

    setProductosPorMotivo(prev => {
      const updated = {
        ...prev,
        [motivoActual]: updatedProducts
      };
      setProductosCompra(Object.values(updated).flat());
      return updated;
    });
  };

  // Filtrar los artículos según el texto de búsqueda
 /** const filteredArticulos = articulos.filter(articulo => 
    articulo.ItemName.toLowerCase().includes(searchText.toLowerCase())
  );*/
  
  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Agregar Productos de {opciones.find(opcion => opcion.value === motivoActual)?.label} a la Solicitud # {getNextNumeroPed()}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {filteredProducts.length > 0 ? (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Motivo</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Unidad Medida</th>
                <th>Área Utilizar</th>
                {motivoActual === "2" && (
                  <>
                    <th>Inventario</th>
                    <th>Consumo</th>
                  </>
                )}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((producto, index) => (
                <tr key={index}>
                  <td>
                    <Form.Select
                      value={producto.motivo}
                      onChange={(e) => handleProductChange(index, e, 'motivo')}
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="Reposición">Reposición</option>
                      <option value="Dañado">Dañado</option>
                      <option value="Mejora">Mejora</option>
                      <option value="Otro">Otro</option>
                    </Form.Select>
                    {errors[`motivo-${index}`] && <Form.Text className="text-danger">{errors[`motivo-${index}`]}</Form.Text>}
                  </td>
                  <td>
            {/* Campo de búsqueda y selección combinados */}
            <Form.Control
              type="text"
              value={producto.descripcion || searchText}  // Si no tiene descripcion, mostrar el texto de búsqueda
              onChange={(e) => setSearchText(e.target.value)} // Actualiza el texto de búsqueda conforme el usuario escribe
              placeholder="Buscar o seleccionar descripción"
              disabled={loading}  // Deshabilitar mientras se carga la lista
            />
            {/* Mostrar las opciones filtradas */}
            {searchText && (
              <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredArticulos.length > 0 ? (
                  filteredArticulos.map((articulo) => (
                    <div
                      key={articulo.ItemCode}
                      className="dropdown-item"
                      onClick={() => {
                        // Actualizar la descripcion y también almacenar el ItemCode
                        handleProductChange(index, { target: { value: articulo.ItemName } }, 'descripcion');
                        
                        // Guardar el ItemCode de manera oculta
                        handleProductChange(index, { target: { value: articulo.ItemCode } }, 'ItemCode');
                        
                        // Limpiar el campo de búsqueda después de seleccionar
                        setSearchText("");
                      }}
                    >
                      {articulo.ItemName}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item text-muted">No se encontraron resultados</div>
                )}
              </div>
            )}
            {errors[`descripcion-${index}`] && <Form.Text className="text-danger">{errors[`descripcion-${index}`]}</Form.Text>}
          </td>


                  <td>
                    <Form.Control
                      type="text"
                      value={producto.cantidad}
                      onChange={(e) => handleProductChange(index, e, 'cantidad')}
                    />
                    {errors[`cantidad-${index}`] && <Form.Text className="text-danger">{errors[`cantidad-${index}`]}</Form.Text>}
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={producto.medida}
                      onChange={(e) => handleProductChange(index, e, 'medida')}
                    />
                    {errors[`medida-${index}`] && <Form.Text className="text-danger">{errors[`medida-${index}`]}</Form.Text>}
                  </td>
                  <td>
                    <Form.Control 
                      type="text"
                      value={producto.area}
                      onChange={(e) => handleProductChange(index, e, 'area')}
                    />
                    {errors[`area-${index}`] && <Form.Text className="text-danger">{errors[`area-${index}`]}</Form.Text>}
                  </td>
                  {motivoActual === "2" && (
                    <>
                      <td>
                        <Form.Control
                          type="text"
                          value={producto.inventario}
                          onChange={(e) => handleProductChange(index, e, 'inventario')}
                        />
                        {errors[`inventario-${index}`] && <Form.Text className="text-danger">{errors[`inventario-${index}`]}</Form.Text>}
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={producto.consumo}
                          onChange={(e) => handleProductChange(index, e, 'consumo')}
                        />
                        {errors[`consumo-${index}`] && <Form.Text className="text-danger">{errors[`consumo-${index}`]}</Form.Text>}
                      </td>
                    </>
                  )}
                  <td className="text-center">
                    <Button variant="danger" size="sm" onClick={() => eliminarProducto(index)}>
                      <i className='bx bx-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={agregarProducto}>Agregar Productos</Button>
        <Button variant="danger" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemsFormularioCompra;
