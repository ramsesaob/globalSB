import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.png';
import { useLocation } from 'react-router-dom';
import { useContext } from "react";
import { carritoContext } from "../contexts/carritoContext";

const EditFormulario = () => {
  const location = useLocation();
  const valueSearch = location.state || '';
  const { datosUsuario } = useContext(carritoContext);
  const [inputValue, setInputValue] = useState(valueSearch);
  const [productos, setProductos] = useState([]);
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState('');
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(''); // Estado para el motivo seleccionado
  const [datos, setDatos] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Estado para manejar la orden de pedido y sus productos
  const [ordenPedido, setOrdenPedido] = useState(null); // Inicialmente nulo hasta cargar los datos

  // Función para cargar los datos del pedido al cargar el componente
  useEffect(() => {
    const fetchOrdenPedido = async () => {
      try {
        const response = await fetch(`http://192.168.0.107/ped2/OrdenPedidos/edit/${id}.json`);
        if (response.ok) {
          const data = await response.json();
          setOrdenPedido(data.ordenPedido); // Asigna solo la parte de ordenPedido del objeto
          setMotivoSeleccionado(data.ordenPedido.descripcion); // Inicializa el motivo seleccionado con el valor de ordenPedido.descripcion
        } else {
          console.error('Error al cargar los datos de la orden de pedido');
        }
      } catch (error) {
        console.error('Error al cargar los datos de la orden de pedido:', error);
      }
    };

    fetchOrdenPedido();
  }, [id]);

  // Función para manejar cambios en el motivo seleccionado
  const handleMotivoChange = (e) => {
    setMotivoSeleccionado(e.target.value); // Actualiza el estado del motivo seleccionado al cambiar la opción
  };

  // Función para manejar cambios en los productos
  const handleProductChange = (index, e, fieldName) => {
    const { value } = e.target;
    const updatedOrdenItems = [...ordenPedido.orden_items];
    updatedOrdenItems[index] = {
      ...updatedOrdenItems[index],
      [fieldName]: value
    };
    setOrdenPedido({
      ...ordenPedido,
      orden_items: updatedOrdenItems
    });
  };

  // Función para agregar un nuevo producto
  const handleAddProduct = () => {
    setOrdenPedido({
      ...ordenPedido,
      orden_items: [
        ...ordenPedido.orden_items,
        { id: null, articulo: { id: '', descripcion: '' }, cantidad: '', comentario: '' }
      ]
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`http://192.168.0.107/ped2/OrdenPedidos/edit/${id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: ordenPedido.user_id,
          descripcion: motivoSeleccionado, // Envía el motivo seleccionado en lugar de ordenPedido.descripcion
          orden_items: ordenPedido.orden_items.map(item => ({
            id: item.id,
            articulo_id: item.articulo.id,
            cantidad: item.cantidad,
            comentario: item.comentario
          }))
        }),
      });

      if (response.ok) {
        console.log('Datos actualizados correctamente');
        navigate('/IndexPage'); // Redirige a la página de inicio después de guardar los datos
      } else {
        console.error('Error al actualizar los datos');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  };

  // Si ordenPedido es nulo, muestra un mensaje de carga o retorna null
  if (ordenPedido === null || !ordenPedido.orden_items) {
    return <p>Cargando...</p>; // Puedes personalizar este mensaje de carga
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='container'>
        <div className='py-1 col-12'>
          <div className="d-flex justify-content-between">
            <div>
              <img src={logo2} alt="garantia" width={50} className='rounded mx-1'/>
            </div>
            <div>
              <h3 className="py-2">EDITANDO LA ORDEN #{ordenPedido.numero_ped}</h3>
            </div>
            <div>
              <img src={logo2} alt="garantia" width={50} />
            </div>
          </div>
          <div className='row flex-justify-content-center'>
            <h6>(*) DATOS REQUERIDOS</h6>
            <div className='col-6'>
              <label htmlFor="staticEmail" className="col-form-label text-center fw-bolder">Solicitante:</label>
              <input
                style={{ "width": "300px" }}
                className="form-control mx-2"
                type="text"
                value={`${ordenPedido.user.nombre}`} // Accede al nombre del usuario desde ordenPedido.user
                defaultValue={`${datosUsuario.firstName} ${datosUsuario.lastName}`}
                aria-label="Disabled input example"
                disabled
                readOnly
              />
            </div>
            <div className='col-6'>
              <label htmlFor="staticEmail" className=" col-form-label text-center fw-bolder">Nº de Solicitud:</label>
              <input
                style={{ "width": "300px" }}
                className="form-control mx-2"
                type="text"
                value={`${ordenPedido.numero_ped}`} // Accede al número de pedido desde ordenPedido.numero_ped
                placeholder="Ingrese Numero de Solicitud"
                disabled // Hacer el campo no editable
              />
            </div>
          </div>
          <div className='row py-4'>
            <div className='col-6'>
              <label htmlFor="created" className="col-form-label text-center fw-bolder">Fecha de Solicitud:</label>
              <input
                style={{ "width": "300px" }}
                className="form-control mx-2"
                type="text"
                value={ordenPedido.created}
                readOnly // Hacer el campo no editable
                disabled
              />
            </div>
            <div className='col-6'>
              <label htmlFor="created" className="col-form-label text-center fw-bolder">Motivo de la Solicitud</label>
              <select
                className="form-select"
                aria-label="Default select example"
                style={{ "width": "300px" }}
                value={motivoSeleccionado} // Usa el estado motivoSeleccionado como valor del select
                onChange={handleMotivoChange} // Maneja cambios en el motivo seleccionado
                required // Hacer el campo obligatorio
              >
                <option value="">(Seleccione)</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>
          </div>
          <div className='row py-3' style={{ border: '1px solid black' }}>
            
            <div className='col-12'>
              <h4 className='text-start py-1 text-uppercase text-center'>PRODUCTOS DE LA ORDEN</h4>
             
            </div>
            <div>
               {/*<button type="button" className="btn btn-success" onClick={handleAddProduct}>Agregar Producto</button>
              Agrega un botón para eliminar productos aquí */}
            </div>
            {ordenPedido.orden_items.map((producto, index) => (
              <div key={index} className='row py-1'>
                <div className='col-4'>
                  <label htmlFor="serial" className="col-sm-6 col-form-label text-center fw-bolder">(*) BUSCAR SERIAL:</label>
                  <div className="d-flex justify-content-end" role="search">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Ejemplo: 123456789"
                      value={producto.articulo.codigo} // Accede al código del artículo desde producto.articulo.codigo
                      onChange={(e) => handleProductChange(index, e, 'serial')}
                    />
                    <button type="button" className="btn btn-info" onClick={() => handleSearchSerial(index)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path fill="currentColor" fillRule="evenodd" d="m16.325 14.899l5.38 5.38a1.008 1.008 0 0 1-1.427 1.426l-5.38-5.38a8 8 0 1 1 1.426-1.426M10 16a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/>
                      </svg>
                    </button>
                  </div>
                  {errorDescripcion && (
                    <p className="text-danger">{errorDescripcion}</p>
                  )}
                </div>
                <div className='col-5'>
                  <label htmlFor="descripcion" className="col-form-label text-center fw-bolder">(*) DESCRIPCION DEL PRODUCTO:</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Ejemplo: Cortina"
                    value={producto.articulo.descripcion} // Accede a la descripción del artículo desde producto.articulo.descripcion
                    onChange={(e) => handleProductChange(index, e, 'descripcion')}
                  />
                </div>
                <div className='col-2'>
                  <label htmlFor="cantidad" className="col-form-label text-center fw-bolder">(*) Cantidad:</label>
                  <input
                    className="form-control form-control-md"
                    type="text"
                    placeholder="Unds"
                    value={producto.cantidad} // Accede a la cantidad desde producto.cantidad
                    onChange={(e) => handleProductChange(index, e, 'cantidad')}
                  />
                </div>
              </div>
            ))}
        
          </div>
        
          <div className='text-center py-3'>
            <input className="btn btn-primary text-center" type="submit" value="ENVIAR" />
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditFormulario;
