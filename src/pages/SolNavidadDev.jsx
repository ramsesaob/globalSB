import React, { useState, useEffect, useContext, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { carritoContext } from '../contexts/carritoContext';
import Swal from 'sweetalert2';
import { Navigate, useNavigate } from 'react-router-dom';
import logo2 from '../assets/navidad.png';
const SolNavidadDev = () => {
  const [articulos, setArticulos] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 1000;
  const [totalArticulos, setTotalArticulos] = useState([]);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [comentarioSolicitud, setComentarioSolicitud] = useState(""); // Nuevo estado para comentario de solicitud
  const navigate = useNavigate();
  const [correlativo, setCorrelativo] = useState(null);  // Estado para el correlativo actual
  const [ultimoCorrelativo, setUltimoCorrelativo] = useState(null);  // Para almacenar el último valor obtenido
  const [isProcessing, setIsProcessing] = useState(false);
  const [precinto, setPrecinto] = useState('');

  // Función para obtener el último correlativo
    const obtenerUltimoCorrelativo = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/devnavidad/numped.json`);

      if (!response.ok) {
        throw new Error('No se pudo obtener el último correlativo');
      }

      const data = await response.json();
      const ultimoCorrelativo = data.orden[0].nsolicitud;

      return parseInt(ultimoCorrelativo);
    } catch (error) {
      console.error('Error al obtener el último correlativo:', error);
      return null; // Si ocurre un error, retornar null
    }
  };

  // Función para generar el nuevo correlativo
  const generarCorrelativo = async () => {
    const ultimoCorrelativo = await obtenerUltimoCorrelativo();
    if (ultimoCorrelativo === null) {
      console.error('No se pudo obtener el último correlativo. No se puede generar uno nuevo.');
      return null;
    }

    // Generar el nuevo correlativo, incrementando el último correlativo
    const nuevoCorrelativo = ultimoCorrelativo + 1;
    console.log('Nuevo correlativo generado:', nuevoCorrelativo);

    return nuevoCorrelativo;
  };

  // useEffect para actualizar el correlativo cada 5 segundos
  useEffect(() => {
    // Función para actualizar el correlativo
    const actualizarCorrelativo = async () => {
      const nuevoCorrelativo = await generarCorrelativo();
      if (nuevoCorrelativo !== null) {
        setCorrelativo(nuevoCorrelativo);  // Guardamos el correlativo en el estado solo si cambia
      }
    };

    // Llamada inicial
    actualizarCorrelativo();

    // Establecer un intervalo para actualizar el correlativo cada 5 segundos
    const intervalo = setInterval(() => {
      actualizarCorrelativo();
    }, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, []);  // Este efecto solo se ejecutará una vez al montar el componente

  // Usamos useMemo para memorizar el valor de "Correlativo" o "Cargando..."
  const mensajeCorrelativo = useMemo(() => {
    return correlativo !== null ? correlativo : "Cargando...";
  }, [correlativo]);  // Se recalcula solo cuando 'correlativo' cambia


  // Obtener datos desde el endpoint con paginación
  const fetchArticulos = async () => {
    setIsLoading(true);
    let allArticulos = [];
    let page = 1;
    let totalArticulos = 0;

    try {
      while (true) {
        const url = `${apiBaseUrl}/sucursal/existenciasucursal.json?departamento=NAVIDAD&sucursal=${datosUsuario.user.sucursale.codigo}&limit=${itemsPerPage}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();

        // Acumular los artículos
        allArticulos = [...allArticulos, ...data.articulos];
        totalArticulos = parseInt(data.total);
        setTotalPages(Math.ceil(totalArticulos / itemsPerPage));

        if (allArticulos.length >= totalArticulos) {
          break;
        }

        page++;
      }

      setArticulos(allArticulos);
      setTotalArticulos(allArticulos);
      setDevoluciones(allArticulos.map(articulo => ({
        ItemCode: articulo.ItemCode,
        cantidad: '',
        numeroBulto: '',
        comentario: '',
        des_articulo: articulo.ItemName ,  // Descripción del artículo
        exist_suc: articulo.Exist_Suc ,    // Existencia en sucursal
      })));
      //console.log(devoluciones); 

    } catch (error) {
      console.error('Error al obtener los datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, [datosUsuario.user.sucursale.codigo]); // Vuelve a obtener los artículos cuando cambie la sucursal
  

  // Manejar cambios en los campos de devoluciones
  const handleInputChange = (itemCode, field, value) => {
    setDevoluciones(prevDevoluciones =>
      prevDevoluciones.map(dev =>
        dev.ItemCode === itemCode ? { ...dev, [field]: value } : dev
      )
    );
  };
  

  // Filtrar artículos por búsqueda
  const filteredArticulos = totalArticulos.filter(articulo => {
    return articulo.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.ItemCode.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Paginación: manejar cambio de página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticulos.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Agregar artículo no listado
  const [nuevoArticulo, setNuevoArticulo] = useState({
    ItemCode: '',
    ItemName: '',
    exist_suc: 0,
    cantidad: '',
    numeroBulto: '',
    comentario: '',
  });

  const handleNuevoArticuloChange = (field, value) => {
    setNuevoArticulo(prev => ({ ...prev, [field]: value }));
  };

  const agregarArticuloManual = () => {
    setDevoluciones(prev => [
      ...prev,
      { 
        ...nuevoArticulo,
        ItemCode: nuevoArticulo.ItemCode,
        ItemName: nuevoArticulo.ItemName,
        exist_suc: nuevoArticulo.exist_suc,
       
        des_articulo: nuevoArticulo.ItemName,
        cantidad: '',
        numeroBulto: '',
        comentario: 'Producto agregado no listado',
      }
    ]);
    setNuevoArticulo({ ItemCode: '', ItemName: '', exist_suc: 0, cantidad: 0, numeroBulto: '', comentario: '' });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Si ya estamos procesando, no hacer nada
    if (isProcessing) {
      Swal.fire({
        icon: 'warning',
        title: '¡Proceso en curso!',
        text: 'Por favor espera mientras procesamos la devolución.',
      });
      return;
    }
  
    // Validar que el campo 'precinto' no esté vacío
    if (!precinto || precinto.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El campo "Nº de Precinto" es obligatorio. Por favor ingresa un número de precinto.',
      });
      return;
    }
  
    // Establecer que estamos procesando
    setIsProcessing(true);
  
    // Filtrar artículos con cantidad mayor que 0 y asegurarse que las cantidades son válidas
    const itemsConCantidadValida = devoluciones.filter(dev => {
      const cantidad = parseFloat(dev.cantidad);
      return !isNaN(cantidad) && cantidad >= 0;  // Aseguramos que la cantidad sea mayor a 0
    });
  
    if (itemsConCantidadValida.length === 0) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Por favor, ingresa al menos un artículo con cantidad mayor a 0.'
      });
      setIsProcessing(false);  // Terminar el proceso
      return;
    }
  
    // Crear objeto para la orden de devolución
    const ordenDevolucion = {
      nsolicitud: correlativo.toString(),  // Correlativo generado
      motivo: "Devolución de Inventario Navidad", // Motivo
      comentario: comentarioSolicitud || "", // Comentario de la solicitud
      user_id: datosUsuario.user.id,
      anulada: 1, 
      procesada: 1,
      nprecinto: precinto,  // Aquí el campo 'precinto' siempre tendrá valor
      Devoluciondetalles: itemsConCantidadValida.map(dev => ({
        cod_articulo: dev.ItemCode || "",  // Código del artículo
        des_articulo: dev.des_articulo || "",  // Descripción del artículo
        exist_suc: dev.exist_suc || "",    // Existencia en sucursal
        cant_enviar: dev.cantidad || "",   // Cantidad
        num_bulto: dev.numeroBulto || "",  // Número de bultos
        comentario: dev.comentario || ""   // Comentario adicional
      }))
    };
  
    console.log(ordenDevolucion);
  
    // Confirmar con SweetAlert2 antes de guardar
    Swal.fire({
      title: 'Confirmar Devolución',
      text: `¿Está seguro de que desea procesar la devolución con ${itemsConCantidadValida.length} artículo(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Enviar la orden de devolución al servidor
          const response = await fetch(`${apiBaseUrl}/devnavidad/guardar.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ordenDevolucion),
          });
  
          const textResponse = await response.text();  // Obtener la respuesta como texto
          console.log(textResponse); // Ver la respuesta completa en consola
  
          // Intentar convertir la respuesta a JSON
          const result = JSON.parse(textResponse);  // Convertir a JSON
          console.log('Resultado del servidor:', result); // Ver el resultado completo
  
          if (result.message && result.message.includes('Orden de devolución creada correctamente')) {
            Swal.fire({
              icon: 'success',
              title: '¡Devolución procesada!',
              text: 'La devolución se ha guardado correctamente.',
            }).then(() => {
              // Limpiar los campos del formulario o redirigir
              setCorrelativo(null);  // Limpiar correlativo (si es necesario)
              setComentarioSolicitud('');  // Limpiar comentario
              setPrecinto('');  // Limpiar precinto
              setDevoluciones([]);  // Limpiar artículos
              setSearchTerm('');  // Limpiar búsqueda
  
              // Redirigir o recargar la página (opcional)
              navigate('/IndexDevNavidad');
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: result.message || 'Hubo un problema al procesar la devolución. Inténtalo nuevamente.',
            });
          }
        } catch (error) {
          console.error('Error al guardar la orden de devolución:', error);
  
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un error al procesar la solicitud. Revisa la consola para más detalles.',
          });
        }
      } else {
        // Si se cancela la acción
        Swal.fire({
          icon: 'info',
          title: 'Acción cancelada',
          text: 'La devolución no fue procesada.',
        });
      }
  
      // Independientemente del resultado, terminar el proceso
      setIsProcessing(false);
    });
  };
  
  
  
  
  

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const background = {
    background: '#76b852',  
 background: '-webkit-linear-gradient(to left,rgb(45, 83, 24),rgb(90, 160, 53))',  
 background: 'linear-gradient(to left,rgb(46, 80, 29),rgb(59, 116, 23))', 
 width: '70%',
 margin: 'auto',

   };
   const background2 = {
    background: '#76b852',  
 background: '-webkit-linear-gradient(to left,rgb(45, 83, 24),rgb(90, 160, 53))',  
 background: 'linear-gradient(to left,rgb(182, 214, 167),rgb(197, 236, 173))', 

   };

  

  return (
    <div className="container mt-0" style={background2}>

      <div className="d-flex justify-content-between">
        <div>
          <img src={logo2} alt="logo" width={50} />
        </div>
        <div>
          <h2 className="py-1 text-center"><i class='bx bx-notepad'></i> Devolución de Artículos Navidad</h2>
        </div>
        <div>
          <img src={logo2} alt="logo" width={50} />
        </div>
      </div>


      {/* Mostrar correlativo y motivo de la solicitud */}
      <div className="row border border-success-subtle shadow py-2 custom-background  text-white" style={background}  >
        <div className="col-md-6">
          <p><strong><i className='bx bxs-circle'></i> Correlativo:</strong> {mensajeCorrelativo}</p>
          <p><strong><i className='bx bxs-circle'></i> Motivo:</strong> Devolución de inventario Navidad</p>
          <p><strong><i className='bx bxs-circle'></i> Nº de Precinto:</strong> <input type="text" required placeholder='Escribir Nº de Precinto' onChange={(e) => setPrecinto(e.target.value)} className="form-control border-success text-success" /> </p>

        </div>

        {/* Comentario general de la solicitud */}
        <div className="col-md-6">
          <label htmlFor="comentarioSolicitud" className="fw-bold"><i className='bx bxs-circle'></i>  Comentario de la Solicitud:</label>
          <textarea
            id="comentarioSolicitud"
            className="form-control  border-success text-success"
            placeholder="Escribir Comentario..."
            rows="3"
            value={comentarioSolicitud}
            onChange={(e) => setComentarioSolicitud(e.target.value)}
          />
        </div>
      </div>


      <div className="row d-flex justify-content-between align-items-end py-2">
        {/* Buscador alineado a la izquierda */}
        <div className="col-md-6">
          <label htmlFor="search" className="fw-bold"><i className='bx bxs-search'></i> Buscar Artículos por Nombre o Código: </label>
          <input
            type="text"
            className="form-control border-success text-success"
            placeholder="Escribe el nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search"
            name="search"
            autoComplete="on"
          />
        </div>

        {/* Paginación alineada a la derecha */}
        <div className="col-md-4 text-end">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                  <i className='bx bx-left-arrow-alt'></i>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                  <i className='bx bx-right-arrow-alt'></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>





      {/* Loader mientras se obtienen los datos */}
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">

          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Tabla de artículos */}
          <table className="table table-bordered table-striped table-hover table-sm text-center">
            <thead>
              <tr className="table-success">
                <th scope="col">Código</th>
                <th scope="col">Nombre del Artículo</th>
                <th scope="col">Categoría</th>
                <th scope="col">Existencia Ref</th>
                <th scope="col">Cantidad a Enviar</th>
                <th scope="col">Número de Caja</th>
                <th scope="col">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(articulo => {
                const devolucion = devoluciones.find(dev => dev.ItemCode === articulo.ItemCode);
                return (
                  <tr key={articulo.ItemCode}>
                    <td>{articulo.ItemCode}</td>
                    <td>{articulo.ItemName}</td>
                    <td>{articulo.CATEGORIA}</td>
                    <td>{formatNumber(articulo.Exist_Suc)}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={devolucion.cantidad}
                        onChange={(e) => handleInputChange(articulo.ItemCode, 'cantidad', e.target.value)}
                        min="0"

                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={devolucion.numeroBulto}
                        onChange={(e) => handleInputChange(articulo.ItemCode, 'numeroBulto', e.target.value)}
                      />
                    </td>
                    <td>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={devolucion.comentario}
                        onChange={(e) => handleInputChange(articulo.ItemCode, 'comentario', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* Mostrar los artículos manualmente agregados */}
              {devoluciones.filter(dev => !articulos.find(art => art.ItemCode === dev.ItemCode)).map(dev => (
                <tr key={dev.ItemCode}>
                  <td>{dev.ItemCode}</td>
                  <td>{dev.ItemName}</td>
                  <td>--</td> {/* Puedes agregar una categoría predeterminada si lo deseas */}
                  <td>{dev.exist_suc || 0}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={dev.cantidad}
                      onChange={(e) => handleInputChange(dev.ItemCode, 'cantidad', e.target.value)}
                      min="0"
                      max={dev.exist_suc}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={dev.numeroBulto}
                      onChange={(e) => handleInputChange(dev.ItemCode, 'numeroBulto', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={dev.comentario}
                      onChange={(e) => handleInputChange(dev.ItemCode, 'comentario', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          {/* Formulario para agregar artículos manualmente */}
          <div className="mb-4">
            <h5>Agregar Artículo No Listado</h5>
            <div className="row">
              <div className="col-md-3">
                <label htmlFor="itemCode">Código del Artículo:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Código del Artículo"
                  value={nuevoArticulo.ItemCode}
                  onChange={(e) => handleNuevoArticuloChange('ItemCode', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="itemName">Nombre del Artículo:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre del Artículo"
                  value={nuevoArticulo.ItemName}
                  onChange={(e) => handleNuevoArticuloChange('ItemName', e.target.value)}
                />
              </div>
              <div className="col-md-1">
                <label htmlFor="existencia">Existencia:</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Existencia"
                  value={nuevoArticulo.exist_suc}
                  onChange={(e) => handleNuevoArticuloChange('exist_suc', e.target.value)}
                />
              </div>

            </div>
            <button type="button" className="btn btn-success mt-3" onClick={agregarArticuloManual}>
              Agregar Artículo
            </button>
          </div>

          {/* Paginación */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">Enviar Devoluciones</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SolNavidadDev;
