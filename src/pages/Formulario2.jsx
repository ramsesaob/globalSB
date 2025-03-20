import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import logo2 from '../assets/logo3.png';
import { useNavigate } from 'react-router-dom';
import { carritoContext } from "../contexts/carritoContext";
import ItemsFormularioNav from '../components/(formulario)/ItemsFormularioNav';
import { Button } from 'react-bootstrap';

const Formulario2 = () => {
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [productosnav, setProductos] = useState(() => {
    const savedProducts = localStorage.getItem('productosnav');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [errorDescripcion, setErrorDescripcion] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState('');
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('');
  const [datos, setDatos] = useState([]);
  const [numeroPedido, setNumeroPedido] = useState(1);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setFechaCreacion(formattedDate);
  }, []);

  useEffect(() => {
    const storedProductos = JSON.parse(localStorage.getItem('productosnav')) || [];
    setProductos(storedProductos);
  }, []);

  useEffect(() => {
    localStorage.setItem('productosnav', JSON.stringify(productosnav));
  }, [productosnav]);

  const handleSearchSerial = async (index) => {
    try {
      const serial = productosnav[index].serial;
      const { id, descripcion, empaque } = await buscarDescripcion(serial);

      setProductos(prevProductos => {
        const updatedProductos = [...prevProductos];
        updatedProductos[index] = {
          ...updatedProductos[index],
          descripcion,
          id,
          empaque,
        };
        return updatedProductos;
      });

      setErrorDescripcion('');
    } catch (error) {
      console.error("Error al buscar la descripción del producto:", error);
      setErrorDescripcion('Descripción no encontrada');
    }
  };

  const buscarDescripcion = async (serial) => {
    try {
      const response = await fetch(`${apiBaseUrl}/art/serial.json?codigo=${serial}`);
      if (!response.ok) {
        throw new Error("Descripción no encontrada");
      }
      const data = await response.json();
      const articulo = data.articulos; 
      return {
        id: articulo.id,
        descripcion: articulo.descripcion,
        empaque: articulo.empaque,
      };
    } catch (error) {
      console.error("Error al buscar la descripción del producto:", error);
      throw error;
    }
  };

  const handleProductChange = (index, event, field) => {
    const updatedProducts = [...productosnav];
    let value = event.target.value;

    value = value.replace('.', ',').replace(',', '.');

    updatedProducts[index][field] = value;
    setProductos(updatedProducts);
  };

  const handleMotivoChange = (e) => {
    setMotivoSeleccionado(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = productosnav.every(producto => {
      if (!producto.cantidad || parseFloat(producto.cantidad) < parseFloat(producto.empaque)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `La cantidad mínima para "${producto.descripcion}" es ${parseFloat(producto.empaque).toFixed(2)}`, 
        });
        return false;
      } else if (parseFloat(producto.cantidad) % parseFloat(producto.empaque) !== 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `La cantidad debe ser un múltiplo de ${parseFloat(producto.empaque).toFixed(2)} para "${producto.descripcion}"`,
        });
        return false;
      }
      return true;
    });

    if (!isValid) {
      return;
    }

    Swal.fire({
      title: "¿Desea guardar los cambios?",
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {  
            user_id: datosUsuario.user.id,  
            numero_ped: numeroPedido,  
            descripcion: motivoSeleccionado,  
            anulada: 1,  
            tipo: 'N',  
            Status_aprobada: 'Pendiente',  
            orden_items: productosnav.map(producto => ({  
              articulo_cod: producto.serial,   
              cantidad: producto.cantidad,  
              comentario: producto.comentario || '',  
              validado: '0',  
            }))  
          };  

          const response = await fetch(`${apiBaseUrl}/ordenp/guardar.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error('Error al enviar los datos');
          }

          const responseData = await response.json();
          console.log('Datos enviados correctamente', responseData);

          setProductos([]);
          localStorage.removeItem('productosnav');
          navigate('/IndexPage');
        } catch (error) {
          console.error('Error al enviar la solicitud:', error);
        }
      }
    });
  };

  const getDatos = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ordenp/numped.json`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setDatos(data.orden || []);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const updateNumeroPedido = () => {
    if (datos.length > 0) {
      const maxNumeroPed = Math.max(...datos.map(item => parseInt(item.numero_ped)));
      setNumeroPedido(maxNumeroPed + 1);
    } else {
      setNumeroPedido(1);
    }
  };

  useEffect(() => {
    getDatos(); // Llama a getDatos al montar el componente
    const interval = setInterval(getDatos, 10000); // Llama a getDatos cada 10 segundos
    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, []);

  useEffect(() => {
    updateNumeroPedido(); // Actualiza el número de pedido cuando los datos cambian
  }, [datos]);

  const navidad = {
    background: '#00000038',  /* fallback for old browsers */
    minHeight: '85vh', // Asegura que el formulario ocupe toda la altura de la pantalla
    paddingBottom: '1rem', // Espacio para el footer
  };


  return (
    <form onSubmit={handleSubmit} style={navidad}>
      <div className='container'>
        <div className='py-1 col-12'>
          <div className="d-flex justify-content-between">
            <div>
              <img src={logo2} width={50} className='rounded mx-1'/>
            </div>
            <div>
              <h3 className="py-2 text-center"> Solicitud de Reposición de Navidad </h3>
            </div>
            <div>
              <img src={logo2} alt="garantia" className='rounded mx-1' width={50} />
            </div>
          </div>
          <div className='row'>
            <h6>(*) Datos Requeridos</h6>
            <div className='col-sm-12 col-md-4 col-lg-4 col-xl-4'>
              <label htmlFor="solicitante" className="col-form-label text-center fw-bolder">Solicitante:</label>
              <input
                id="solicitante"
                style={{ width: "300px" }}
                className="form-control mx-2"
                type="text"
                defaultValue={`${datosUsuario.user.nombre} `}
                disabled
                readOnly
              />
            </div>
            <div className='col-sm-12 col-md-4 col-lg-4 col-xl-4'>
              <label htmlFor="numeroSolicitud" className="col-form-label text-center fw-bolder">Nº de Solicitud:</label>
              <input
                id="numeroSolicitud"
                style={{ width: "300px" }}
                className="form-control mx-2"
                type="text"
                value={numeroPedido}
                disabled
              />
            </div>
            <div className='col-sm-12 col-md-4 col-lg-4 col-xl-4'>
              <label htmlFor="sucursal" className="col-form-label fw-bolder">Comentario:</label>
              <textarea 
                  id="comentario" // Cambié el id para que sea más representativo
                  style={{ width: "300px" }}
                  className="form-control mx-2"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)} // Actualiza el estado al escribir
                />

              </div>
          </div>
          <div className='row'>
            <div className='col-sm-12 col-md-4 col-lg-4 col-xl-4'>
              <label htmlFor="fechaSolicitud" className="col-form-label text-center fw-bolder">Fecha de Solicitud:</label>
              <input
                id="fechaSolicitud"
                style={{ width: "300px" }}
                className="form-control mx-2"
                type="text"
                value={fechaCreacion}
                readOnly
              />
            </div>
            <div className='col-sm-12 col-md-4 col-lg-4 col-xl-4'>
              <label htmlFor="motivo" className="col-form-label text-center fw-bolder">Motivo de la Solicitud</label>
              <select
                id="motivo"
                className="form-select"
                style={{ width: "300px" }}
                value={motivoSeleccionado}
                onChange={handleMotivoChange}
                required
              >
                <option value="">(Seleccione)</option>
                <option value="1">Alta Rotación</option>
                <option value="2">Ventas al mayor</option>
                <option value="3">Ventas de Clientes Especiales</option>
              </select>
            </div>
           
          </div>
          <div className='row py-2'>
            <div className='col-12'>
              <h5 className='text-start py-1 text-center'>Agregue los Productos de la Orden</h5>
              <p className='py-1'>"Si al buscar el serial los datos no coinciden, puede agregar los datos manualmente"</p>
              <Button variant="success" onClick={handleShow}>
                Agregar Productos
              </Button>
              <ItemsFormularioNav 
                show={showModal} 
                handleClose={handleClose} 
                setProductos={setProductos} 
                productosnav={productosnav} 
                errorDescripcion={errorDescripcion} 
                numeroPedido={numeroPedido}
              />
            </div>
          </div>
          <div className='text-center py-3'>
            <p className='fw-bolder'>Cantidad de Artículos Agregados en la Orden: "{productosnav.length}"</p>
            <input className={`btn ${productosnav.length > 0 ? 'btn-primary' : 'btn-disabled'}`} type="submit" value="ENVIAR" disabled={productosnav.length === 0} />
          </div>
        </div>
      </div>
    </form>
  );
}

export default Formulario2;
