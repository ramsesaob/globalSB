import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';  // Agrega useRef aquí

import { carritoContext } from '../contexts/carritoContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalAggArt_Insf from '../components/ModalAggArt_Insf';
import Swal from 'sweetalert2';
import moment from 'moment';
import logo3 from '../assets/incidencias.png';
import { useNavigate } from 'react-router-dom';


const SolInsuficiencia = () => {
  const [insuficiencias, setInsuficiencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [searchTermCodigo, setSearchTermCodigo] = useState('');
  const [searchTermDescripcion, setSearchTermDescripcion] = useState('');
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [showModal, setShowModal] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [correlativo, setCorrelativo] = useState(null);
  // Lógica de paginación
  const totalPages = Math.ceil(insuficiencias.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = insuficiencias.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const [articulosAlternativos, setArticulosAlternativos] = useState([]);
  const [insuficienciaForm, setInsuficienciaForm] = useState({
  comentario: '',
  correlativo: correlativo,
  items: []  // Este campo contendrá todos los ítems que se agregarán a la solicitud.
});
const { comentario } = insuficienciaForm;
const [insuficienciasSinFiltrar, setInsuficienciasSinFiltrar] = useState([]); // Estado para almacenar los datos originales (sin filtrar)
  const navigate = useNavigate();

// Cargar los datos desde localStorage o API
const fetchInsuficiencias = async () => {
  setIsLoading(true);

  // Usar siempre la API para obtener los datos más actualizados
  const currentSucursal = datosUsuario.user.sucursale.codigo;
  let url = `${apiBaseUrl}/sucursal/insuficiencia.json?sucursal=${currentSucursal}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const insuficienciasData = data.insuficiencias || [];
    
    setInsuficienciasSinFiltrar(insuficienciasData); // Almacenar todos los productos sin filtros
    setInsuficiencias(insuficienciasData); // Inicializamos con todos los datos
  } catch (error) {
    console.error('Error al obtener las insuficiencias:', error);
  } finally {
    setIsLoading(false);
  }
};
useEffect(() => {
 

  fetchInsuficiencias();
}, [apiBaseUrl, datosUsuario.user.sucursale.codigo]);

// Recargar los datos cuando el correlativo o el comentario cambian





// Filtrar los datos con base en los términos de búsqueda
useEffect(() => {
  const filtrarDatos = () => {
    let filteredData = [...insuficienciasSinFiltrar]; // Trabajar con la copia original de los datos

    // Si no hay filtros, no hacemos nada
    if (!searchTermCodigo && !searchTermDescripcion) {
      setInsuficiencias(insuficienciasSinFiltrar); // Restauramos todos los productos
      return;
    }

    // Filtros
    if (searchTermCodigo) {
      filteredData = filteredData.filter(ins =>
        ins.Codigo.toLowerCase().includes(searchTermCodigo.toLowerCase())
      );
    }

    if (searchTermDescripcion) {
      filteredData = filteredData.filter(ins =>
        ins.Descripcion.toLowerCase().includes(searchTermDescripcion.toLowerCase())
      );
    }

    // Actualizamos la lista filtrada en el estado
    setInsuficiencias(filteredData);
  };

  filtrarDatos();
}, [searchTermCodigo, searchTermDescripcion, insuficienciasSinFiltrar]); // Se ejecutará solo cuando los términos de búsqueda cambien







// Función para actualizar los datos en el input y también en el localStorage
const handleInputChange = (codigo, fecha, campo, valor) => {
  const updatedInsuficiencias = insuficiencias.map(ins => {
    if (ins.Codigo === codigo && ins.Fecha === fecha) {
      return { ...ins, [campo]: valor };
    }
    return ins;
  });
 
  // Actualizamos el estado con los datos modificados
  setInsuficiencias(updatedInsuficiencias);

  // También actualizamos los datos en el estado sin filtrar
  const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
    if (ins.Codigo === codigo && ins.Fecha === fecha) {
      return { ...ins, [campo]: valor };
    }
    return ins;
  });

  // Actualizamos el estado de los datos sin filtrar
  setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);

  // Guardamos los datos actualizados en localStorage
  localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
};

  // Función para mostrar el modal y pasar el artículo seleccionado
const handleMostrarModal = (insuficiencia) => {
  // Guardamos la insuficiencia seleccionada, que ya tiene su código y fecha únicos
  setArticuloSeleccionado(insuficiencia);
  setShowModal(true); // Mostramos el modal
};

  // Función para cerrar el modal
  const handleCerrarModal = () => {
    setShowModal(false); // Cerramos el modal
    

    
  
  };
  

  // Formatear la cantidad como número entero
  const formatQuantity = (quantity) => {
    return Math.round(quantity);
  };

  const background = {
    background: '#76b852',  
 background: '-webkit-linear-gradient(to left,rgb(94, 211, 31),rgb(90, 160, 53))',  
 background: 'linear-gradient(to left,rgb(57, 153, 185),rgb(23, 139, 216))', 
 width: '80%',
 margin: 'auto',

   };

// Función para manejar el cambio de datos en la tabla




  const fechaFormateada = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  
// Guardar solicitud de insuficiencia y sus ítems en la base de datos
const guardarDatos = async () => {
  // Activamos el estado de carga antes de iniciar el proceso
  setIsLoading(true);

  // Muestra un SweetAlert para confirmar si desea guardar los cambios
  const result = await Swal.fire({
    title: '¿Deseas guardar los cambios?',
    text: "Los cambios no se podrán revertir.",
    icon: 'warning',
    showCancelButton: true,  // Mostrar el botón de cancelar
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'No, cancelar'
  });

  // Si el usuario confirma (hace click en "Sí, guardar")
  if (result.isConfirmed) {
    // Validar que el comentario esté presente
    if (!insuficienciaForm || !insuficienciaForm.comentario || insuficienciaForm.comentario.trim() === '') {
      Swal.fire('Error', 'Falta el Responsable en la solicitud', 'error');
      setIsLoading(false); // Desactivar el estado de carga si no se cumple la validación
      return;
    }

   

    let flagError = false; // Flag para detener el proceso si hay errores
    const itemsAValidar = insuficiencias.map(insf => {
      const stockFisico = insf.Stock_Fisico && !isNaN(insf.Stock_Fisico);
      const fechaConteo = insf.Fecha_De_Conteo && !isNaN(new Date(insf.Fecha_De_Conteo).getTime());
      const observaciones = insf.Observaciones && insf.Observaciones !== '';
      const agregarItemAjustar = insf.articulosAlternativos && insf.articulosAlternativos.length > 0;

      if (stockFisico && fechaConteo && observaciones && agregarItemAjustar) {
        return {
          item_rep: insf.Codigo,
          descripcion_rep: insf.Descripcion,
          fecha_insuficiencia: moment(insf.Fecha).format('YYYY-MM-DD HH:mm:ss.SSS'),
          cod_suc: insf.Cod_suc,
          cant_rep: isNaN(parseFloat(insf.Cantidad_Total)) ? 0 : parseFloat(insf.Cantidad_Total),
          conteo_fisico: insf.Stock_Fisico,
          Fecha_De_Conteo: moment(insf.Fecha_De_Conteo).format('YYYY-MM-DD HH:mm:ss.SSS'),
          comentario_tienda: insf.Observaciones,
          num_doc: insf.Num_Doc,
          precio01: insf.Price,
          articulosAlternativos: insf.articulosAlternativos && insf.articulosAlternativos.length > 0
            ? insf.articulosAlternativos.map(articulo => ({
                codigo: articulo.codigo,
                descripcion: articulo.descripcion,
                observaciones: articulo.observacion,
                precio: articulo.precio || '0',
                descripcion: articulo.descripcion,
                stock_sistema: articulo.stock_sistema,
                stock_fisico: articulo.stock_fisico,
                
              }))
            : [],
        };
      } else {
        return null; // Detener el proceso para este ítem si no tiene los campos obligatorios
      }
    }).filter(item => item !== null);

    if (itemsAValidar.length === 0) {
      Swal.fire('Error', 'No hay ítems válidos para guardar', 'error');
      setIsLoading(false); // Deshabilitar el estado de carga si no hay ítems válidos
      return;
    }

    const dataToSend = {
      comentario: insuficienciaForm.comentario || "Sin comentario",
      correlativo: correlativo,
      sucursal_id: datosUsuario.user.sucursale.id,
      user_id: datosUsuario.user.id,
      motivo: 'INSUFICIENCIAS',
      procesada_inv: 0,
      items: itemsAValidar
    };

    try {
      const response = await fetch(`${apiBaseUrl}/ordeninsf/guardar.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
        console.log("datos a guardar", dataToSend);
      if (!response.ok) {
        console.error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
        Swal.fire('Error', 'Hubo un problema con la solicitud al servidor.', 'error');
        setIsLoading(false); // Desactivar el estado de carga en caso de error
        return;
      }
     
      const result = await response.json();
      console.log("Respuesta completa del backend:", result);
      if (result.isConfirmed) {
        localStorage.removeItem('insuficiencias'); // Limpiar los datos de insuficiencias
        setInsuficiencias([]);
        setInsuficienciasSinFiltrar([]);
      }
      if (result.status === 'success') {
        Swal.fire('Guardado!', 'La solicitud se ha guardado correctamente.', 'success');
        localStorage.removeItem('insuficiencias');
        setInsuficiencias([]); // Limpiar las insuficiencias
        setInsuficienciasSinFiltrar([]);
        setInsuficienciaForm({ comentario: '' }); // Restablecer el formulario
        navigate('/IndexInsf');
      } else {
        Swal.fire('Error', `Hubo un error al guardar la solicitud: ${result.message || 'Error desconocido'}`, 'error');
      }

    } catch (error) {
      console.error('Error al guardar la solicitud de insuficiencia:', error);
      Swal.fire('Error', `Hubo un error al guardar la solicitud: ${error.message}`, 'error');
    } finally {
      // Desactivar el estado de carga siempre al final del proceso
      setIsLoading(false);
    }

  } else {
    console.log('El usuario ha cancelado la acción de guardar.');
    setIsLoading(false); // Desactivar el estado de carga si se cancela
  }
};

    const obtenerUltimoCorrelativo = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ordeninsf/numped.json`);

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
   // console.log('Correlativo obtenido:', ultimoCorrelativo);
    if (ultimoCorrelativo === null) {
      console.error('No se pudo obtener el último correlativo. No se puede generar uno nuevo.');
      return null;
    }

    // Generar el nuevo correlativo, incrementando el último correlativo
    const nuevoCorrelativo = ultimoCorrelativo + 1;
    //console.log('Nuevo correlativo generado:', nuevoCorrelativo);

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

  return (
    <div className="container mt-0">
      <h2 className="text-center mb-2 text-info fw-bold py-1"></h2>
       <div className="d-flex justify-content-between">
              <div>
                <img src={logo3} alt="logo" width={90} />
              </div>
              <div>
                <h2 className="py-1 text-center"><i class='bx bx-notepad'></i> INSUFICIENCIAS DE {datosUsuario.user.sucursale.descripcion}</h2>
              </div>
              <div>
                <img src={logo3} alt="logo" width={90} />
              </div>
            </div>


      <div className="row border border-info-subtle  py-2  text-white" style={background}>
        <div className="col-md-6">
          <p><strong><i className='bx bxs-circle'></i> Correlativo:</strong> {correlativo}</p>
          <p><strong><i className='bx bxs-circle'></i> Motivo: </strong> INSUFICIENCIAS
          </p>

          <p><strong><i className='bx bxs-circle'></i> Fecha:</strong> {moment().format('YYYY-MM-DD')} </p>
        </div>
        <div className="col-md-5">
          <label htmlFor="comentarioSolicitud" className="fw-bold"><i className='bx bxs-circle'></i> Nombres del Responsable de Conteo:</label>
          <input
            id="comentarioSolicitud"
            className="form-control border-info text-info"
            placeholder="Escribir Responsable..."
            rows="3"
            value={comentario}
            onChange={(e) => setInsuficienciaForm({...insuficienciaForm, comentario: e.target.value})}
          />
        </div>
      </div>

      {/* Campo de búsqueda */}
      <div className="row d-flex justify-content-between align-items-end py-2">
        <div className="col-3">
          <input
            type="text"
            className="form-control border-info text-info"
            placeholder="Buscar por Código"
            value={searchTermCodigo}
            onChange={(e) => setSearchTermCodigo(e.target.value)}
          />
        </div>
        <div className="col-3">
          <input
            type="text"
            className="form-control border-info text-info"
            placeholder="Buscar por Descripción"
            value={searchTermDescripcion}
            onChange={(e) => setSearchTermDescripcion(e.target.value)}
          />
        </div>

        {/* Paginación */}
        <div className="col-3 text-center">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => paginate(currentPage - 1)}>
                <button className="page-link">
                  <i className="bx bx-left-arrow-alt"></i>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => paginate(index + 1)}>
                  <button className="page-link">{index + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`} onClick={() => paginate(currentPage + 1)}>
                <button className="page-link">
                  <i className="bx bx-right-arrow-alt"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {isLoading ? (
  <div className="d-flex justify-content-center">
    <div className="spinner-border" role="status"></div>
  </div>
) : (
  <form>
    <table className="table table-sm table-bordered table-striped table-hover table-responsive text-center">
      <thead>
        <tr className="table-info">
          <th>#</th>
          <th width="08%">Fecha</th>
          <th>Código</th>
          <th>Descripción</th>
          <th>Nº de Incidencias en 30 Días</th>
          <th>Cantidad</th>
          <th width="5%">Stock Físico</th>
          <th width="15%">Fecha y Hora de Conteo</th>
          <th width="20%">Comentario</th>
          <th>Agregar Item Ajustar</th>
          <th width="15%">Artículos Ajustar</th>
        </tr>
      </thead>
      <tbody>
        {insuficiencias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((insuficiencia, index) => (
          <tr key={`${insuficiencia.Codigo}+${insuficiencia.Fecha}`}>
            <td>{index + 1}</td>
           
            <td>{moment(insuficiencia.Fecha.split('T')[0]).format('DD-MM-YYYY')}</td>
            <td>{insuficiencia.Codigo}</td>
            <td>{insuficiencia.Descripcion}</td>
            <td>{insuficiencia.Incidencias_Ultimos_30_Dias}</td>
            <td>{formatQuantity(insuficiencia.Cantidad_Total)}</td>
            <td>
              <input
                type="number"
                className="form-control form-control-sm"
                value={Number(insuficiencia.Stock_Fisico) }
                onChange={(e) => handleInputChange(insuficiencia.Codigo, insuficiencia.Fecha, 'Stock_Fisico', e.target.value)}
                min="0"
              />
            </td>
            <td>
              <input
                type="datetime-local"
                className="form-control form-control-sm"
                style={{ maxWidth: '180px', display: 'block', margin: '0 auto' }}
                value={insuficiencia.Fecha_De_Conteo ? moment(insuficiencia.Fecha_De_Conteo).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(e) => handleInputChange(insuficiencia.Codigo, insuficiencia.Fecha, 'Fecha_De_Conteo', e.target.value)}
                max={fechaFormateada}
              />
            </td>
            <td>
              <textarea
                className="form-control form-control-sm"
                rows="3"
                style={{ width: '100%' }}
                value={insuficiencia.Observaciones || ''}  // Asegúrate de usar un valor vacío en lugar de undefined
                onChange={(e) => handleInputChange(insuficiencia.Codigo, insuficiencia.Fecha, 'Observaciones', e.target.value)}
                 maxLength={250} 
              />
            </td>
            <td>
              <button className="btn btn-info btn-sm mx-2 my-2" type="button" onClick={() => handleMostrarModal(insuficiencia)}>
                <i className="bx bx-plus bx-edit-alt"></i>
              </button>
            </td>
            <td>
              {insuficiencia.articulosAlternativos && insuficiencia.articulosAlternativos.length > 0 ? (
                <ul>
                  {insuficiencia.articulosAlternativos.map((articulo, index) => (
                    <li key={index}>{articulo.codigo}</li> // Aquí puedes agregar más detalles como 'descripcion' si es necesario
                  ))}
                </ul>
              ) : (
                <span>No hay artículos Agregados</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </form>
)}

          <div className="text-center">
          <button
            className="btn btn-success mt-3"
            onClick={guardarDatos}
            disabled={isLoading}  // Deshabilitar el botón si está cargando
          >
            {isLoading ? 'Guardando...' : 'Guardar Solicitud'}
          </button>

          </div>
      {/* Modal para agregar artículo */}
      <ModalAggArt_Insf
        show={showModal}
        onClose={handleCerrarModal}
        articuloSeleccionado={articuloSeleccionado}
        insuficiencias={insuficiencias}  // Pasamos el estado de insuficiencias
        setInsuficiencias={setInsuficiencias}  // Pasamos la función setInsuficiencias
        setInsuficienciasSinFiltrar={setInsuficienciasSinFiltrar}
        insuficienciasSinFiltrar={insuficienciasSinFiltrar}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
};

export default SolInsuficiencia;
