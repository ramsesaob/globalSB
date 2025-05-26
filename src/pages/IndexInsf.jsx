import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { carritoContext } from '../contexts/carritoContext';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

const IndexInsf = () => {
  const [ordenes, setOrdenes] = useState([]);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);  
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useMemo(() => debounce(value => setSearchTerm(value), 500), []);
  const [totalOrders, setTotalOrders] = useState(0);  
  const [statusFilter, setStatusFilter] = useState('');
  const [allOrders, setAllOrders] = useState([]);  // Guardar todas las órdenes
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [searchNsolicitud, setSearchNsolicitud] = useState('');
  const [searchDescripcion, setSearchDescripcion] = useState('');
  const [searchComentario, setSearchComentario] = useState('');
  // Crear funciones debounced
  const debouncedSearchNsolicitud = useMemo(() => debounce(value => setSearchNsolicitud(value), 100), []);
  const debouncedSearchDescripcion = useMemo(() => debounce(value => setSearchDescripcion(value), 100), []);
  const debouncedSearchComentario = useMemo(() => debounce(value => setSearchComentario(value), 100), []);

  console.log(datosUsuario);
  const navigate = useNavigate();
  
  const fetchOrders = async () => {
    try {
      // Realizamos la solicitud al backend con los parámetros de filtros
      const response = await axios.get(`${apiBaseUrl}/ordeninsf/page.json`, {
        params: {
          nsolicitud: searchNsolicitud,
          descripcion: searchDescripcion,
          comentario: searchComentario,
          status: statusFilter,
        }
      });
      
  
      const ordenes = response.data.ordenes;
      const totalOrders = response.data.total;  // Total de órdenes desde el backend
  
      // Filtrar las órdenes según el rol y otros filtros
      let filteredOrders = applyFilters(ordenes);
  
      // Calculamos el total de órdenes filtradas
      setTotalOrders(filteredOrders.length);
  
      // Calculamos el total de páginas basado en las órdenes filtradas
      setTotalPages(Math.ceil(filteredOrders.length / limit));
  
      // Actualizamos las órdenes en la página actual según la paginación
      setOrdenes(filteredOrders.slice((page - 1) * limit, page * limit));
  
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar órdenes según el rol, búsqueda y estado
  const applyFilters = (ordenes) => {
    let filteredOrders = ordenes;

    // Filtrado por rol de usuario
    const role = datosUsuario.user.role;
    if (role == 'admin') {
      filteredOrders = ordenes; // El admin ve todas las órdenes
    } else if (role == 'user1' || role == 'user3') {
      filteredOrders = ordenes.filter(orden => orden.user_id == datosUsuario.user.id); // 'user1' y 'user3' ven solo sus propias órdenes
    } else if (role == 'user2') {
      filteredOrders = ordenes; // 'user2' ve todas las órdenes
    } else if (role == 'gerente') {
      const sucursal = datosUsuario.user.sucursale?.descripcion || '';
      filteredOrders = ordenes.filter(orden => orden.descripcion && orden.descripcion.trim().toLowerCase() === sucursal.trim().toLowerCase());
    } else {
      filteredOrders = ordenes.filter(orden => orden.user_id === datosUsuario.user.id); // Por defecto, solo ve sus propias órdenes
    }

    // Filtrado adicional por términos de búsqueda (searchTerm)
    if (searchTerm && searchTerm.trim() !== '') {
      filteredOrders = filteredOrders.filter(orden => 
        (orden.descripcion && orden.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (orden.comentario && orden.comentario.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (orden.nsolicitud && orden.nsolicitud.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrado adicional por estado (status)
    if (statusFilter) {
      filteredOrders = filteredOrders.filter(orden => orden.status === statusFilter);
    }

    return filteredOrders;
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, sortConfig, statusFilter, datosUsuario, apiBaseUrl, allOrders, searchTerm, searchNsolicitud, searchDescripcion, searchComentario]);  // Asegúrate de incluir las dependencias correctas


  const handleAprobarPedido = async (id) => {
    setLoading(true);
    Swal.fire({
      title: 'APROBACION TIENDA',
      text: '¡Estas seguro de aprobar el pedido? No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Verificar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${apiBaseUrl}/ordeninsf/aprobar/${id}.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              aprobacion_tienda: 1,
              fecha_aprobacion_tienda: new Date().toISOString(),
            }),
          });

          if (response.ok) {
            setOrdenes(prevOrdenes => prevOrdenes.map(orden =>
              orden.id === id
                ? { ...orden, aprobacion_tienda: 1, fecha_aprobacion_tienda: new Date().toISOString() }
                : orden
            ));
            

            Swal.fire('Procesado', 'La solicitud ha sido procesada correctamente.', 'success');
            fetchOrders(); // Actualizamos la lista de órdenes después de la aprobación
            setFilteredInsf(filteredInsf.map(orden => (orden.id === id ? { ...orden, aprobacion_tienda: 1 } : orden)));
          } else {
            console.error('Error al procesar el pedido');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al enviar la solicitud:', error);
        }
      }
    });
  };

  // Funciones de paginación
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1); 
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1); 
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));  
    setPage(1);  // Reiniciamos la página cuando cambiamos el límite
  };
  const formatDate = (fecha) => {
    // Verificar si la fecha es null o undefined
    if (!fecha) {
      console.error('Fecha no válida:', fecha);
      return 'N/A'; // Devuelve 'N/A' si la fecha es null o undefined
    }
  
    // Verificar si la fecha tiene un valor válido antes de continuar
    if (typeof fecha !== 'string') {
      console.error('Fecha no válida:', fecha);
      return 'Fecha no válida'; // Devuelve 'Fecha no válida' si no es una cadena
    }
  
    // Asegurarse de que la fecha esté en el formato esperado
    const dateString = fecha.split('.')[0]; // '2024-10-22 15:41:48'
    
    // Verificar si la fecha tiene el formato correcto
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      console.error('Fecha no válida:', dateString);
      return 'Fecha no válida'; // Devuelve 'Fecha no válida' si no es un formato de fecha válido
    }
  
    // Crear el objeto Date (asumimos que la fecha está en UTC)
    const createdDate = new Date(dateString + 'Z'); // Añadir 'Z' para tratarlo como UTC
    
    // Verificar si la creación de la fecha fue exitosa
    if (isNaN(createdDate.getTime())) {
      console.error('Fecha no válida (Date inválido):', dateString);
      return 'Fecha no válida'; // Devuelve 'Fecha no válida' si el objeto Date es inválido
    }
  
    // Obtener los componentes de la fecha y hora
    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const day = String(createdDate.getDate()).padStart(2, '0');
    let hours = createdDate.getHours();
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am'; // Determina si es AM o PM
    
    hours = hours % 12; // Convierte a formato 12 horas
    hours = hours ? String(hours).padStart(2, '0') : '12'; // Asegura que la hora sea '12' en vez de '0'
    
    // Devuelve la fecha en el formato deseado
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };
  
  
  const clearFilters = () => {
    setSearchNsolicitud('');
    setSearchDescripcion('');
    setSearchComentario('');
    setFilteredInsf(insf);
    setStatusFilter('');
    setPage(1);
    setLimit(10);
    fetchOrders();
    setLoading(true);
    setLoading(false);
    setFilteredInsf(filteredInsf);
    setTotalPages(Math.ceil(filteredInsf.length / limit));

    
  };
  
  

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  
  const handleSearchChange = (field, value) => {
    if (field === "nsolicitud") debouncedSearchNsolicitud(value);
    if (field === "descripcion") debouncedSearchDescripcion(value);
    if (field === "comentario") debouncedSearchComentario(value);
  };
  
// Function declaration instead of expression
const getSortedOrders = () => {
  return [...ordenes].sort((a, b) => {
    if (!sortConfig.key) return 0; // Si no hay clave de ordenamiento, no hacer nada

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    // Manejar valores nulos o indefinidos
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';

    // Si la clave es 'numero_solicitud', convertimos a número para hacer una comparación numérica
    if (sortConfig.key === 'nsolicitud') {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }

    // Comparación de strings o números
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Now, you can use getSortedOrders without issues

  
  const handleSort = (key) => {
    setSortConfig(prev => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };
  





  return (
    <div className="container-fluid mt-3">
    <h2 className="mb-2 text-center">Órdenes de Insuficiencias</h2>
  
    <div className="d-flex flex-column flex-sm-row justify-content-between mb-1 mt-1">
  <div className="d-flex flex-column flex-sm-row mb-1 w-100">
      <input
      type="text"
      className="form-control form-control-sm mx-2 mb-1"
      placeholder="Buscar por Nº de Solicitud"
      value={searchNsolicitud}
      onChange={(e) => handleSearchChange("nsolicitud", e.target.value)}
    />

         <input
        type="text"
        className="form-control form-control-sm mx-2 mb-1"
        placeholder="Buscar por Tienda"
        value={searchDescripcion}  // El valor del input está vinculado al estado
        onChange={(e) => handleSearchChange("descripcion", e.target.value)}
      />
    <input
      type="text"
      className="form-control form-control-sm mx-2 mb-1"
      placeholder="Buscar por Responsable"
      value={searchComentario}
      onChange={(e) => handleSearchChange("comentario", e.target.value)}
    />
  



    <select
      className="form-select form-select-sm mx-2 form-control-info mb-1 text-black w-100 w-sm-auto"
      onChange={(e) => setStatusFilter(e.target.value)}
      value={statusFilter}
    >
      <option value="">Todos los estados</option>
      <option value="Orden Creada">Orden Creada</option>
      <option value="Autorizada por Tienda">Autorizada por Tienda</option>
      <option value="Finalizada">Finalizada</option>
      <option value="Ajuste Confirmado">Ajuste Confirmado</option>
      <option value="Pendiente de Confirmación">Pendiente de Confirmación</option>
    </select>

    <select
      className="form-select form-select-sm mx-2 form-control-info mb-1 text-black w-100 w-sm-auto"
      onChange={handleLimitChange}
      value={limit}
      style={{ width: '50px' }}
    >
    
      <option value="20">20</option>
      <option value="50">50</option>
      <option value="100">100</option>
      <option value="200">200</option>
      <option value="500">500</option>
    </select>

    <button 
  className="btn btn-danger btn-sm mx-2" 
  onClick={clearFilters}
>
<i className="bx bxs-trash"></i> 
</button>

  </div>

  <div className="d-flex flex-column flex-sm-row">
    <button className="btn btn-info mx-2 btn-sm">
      <Link to="/ViewItemsDiferencia" className="nav-link active" aria-current="page">
        Items Negativos
      </Link>
    </button>
    {datosUsuario.user.role === 'user2' && (
      <button className="btn btn-success mx-2 btn-sm">
        <Link to="/IndexAjustesProc" className="nav-link active" aria-current="page">
          Ajustes Procesados
        </Link>
      </button>
    )}
    {datosUsuario.user.role === 'admin' && (
      <button className="btn btn-light mx-2 btn-sm">
        <Link to="/IndexAjustesProc" className="nav-link active" aria-current="page">
          Ajustes Procesados
        </Link>
      </button>
    )}
  </div>
</div>

  
    {loading ? (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-striped text-center table-sm table-hover">
          <thead>
            <tr className="table-info">
            <th
              onClick={() => handleSort('created')}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bx bx-sort${sortConfig.key === 'created' && sortConfig.direction === 'asc' ? '-down' : '-up'}`}></i>
              Fecha de Creación
            </th>
            {(datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2') && (

              <th
                onClick={() => handleSort('fecha_aprobacion_tienda')}
                style={{ cursor: 'pointer' }}
              >
                <i className={`bx bx-sort${sortConfig.key === 'updated' && sortConfig.direction === 'asc' ? '-down' : '-up'}`}></i>
                Fecha de Aprobación
              </th>
            )}


              <th
                onClick={() => {
                  setSortConfig((prev) => ({
                    key: 'nsolicitud',
                    direction: prev.key === 'nsolicitud' ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc',
                  }));
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className={`bx bx-sort${sortConfig.key === 'nsolicitud' && sortConfig.direction === 'asc' ? '-down' : '-up'}`}></i>
                Solicitud
              </th>

              <th>Responsable</th>
              <th
                onClick={() =>
                  setSortConfig({
                    key: 'descripcion',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
                style={{ cursor: 'pointer' }}
              >
                <i className={`bx bx-sort${sortConfig.direction == 'asc' ? '-down' : '-up'}`}></i>
                Tienda
              </th>
              <th>Status</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {getSortedOrders().map((orden) => (
           
              <tr key={orden.id} className={orden.status === 'Finalizada' ? 'table-success' : 'table-warning' && orden.status === 'Orden Creada' ? 'table-danger' : 'table-warning' && orden.status === 'Ajuste Confirmado' ? 'table-success' : 'table-warning'}>
                <td>{formatDate(orden.created) || 'N/A'}</td>
                <>
                {(datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user2') && (
                 <td>
                  {orden.fecha_aprobacion_tienda ? formatDate(orden.fecha_aprobacion_tienda) : 'N/A'}
                  
                   
                  </td>
                  )}
                </>
                <td>{orden.nsolicitud || 'N/A'}</td>
                <td>{orden.comentario || 'Sin comentario'}</td>
                <td>{orden.descripcion || 'N/A'}</td>
                <td className={orden.status == 'Aprobado Gerente' ? 'table-warning' : ''}>
                  {orden.status || 'Sin estado'}
                </td>
  
                <td>
                  <Link to={`/ViewPageInsf/${orden.id}`} className="btn btn-primary btn-sm mx-2 my-1">
                    Ver
                  </Link>
  
                  {orden.aprobacion_tienda == 0 && (datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user1') && (
                    <>
                      <Link to={`/EditarInsf/${orden.id}`} className="btn btn-primary btn-sm mx-2 my-1">
                        Editar
                      </Link>
                    </>
                  )}
                  {orden.aprobacion_tienda == 0 && (datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'gerente') && (
                    <>
                      <button
                        className="btn btn-success btn-sm text-white mx-1 y-1"
                        onClick={() => handleAprobarPedido(orden.id)}
                      >
                        Aprobar
                      </button>
                    </>
                  )}
                  {(orden.aprobacion_tienda == 1 && orden.procesada_inv == 0 && (datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2')) && (
                    <Link to={`/VerificacionInsf/${orden.id}`} className="btn btn-warning btn-sm  mx-1 py-1">
                      Verificar
                    </Link>
                  )}
                  {(orden.tieneItemConPrecioNegativo == 1 && orden.status == 'Pendiente de Confirmación' && (datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2')) && (
                    <Link to={`/VerificacionInsf/${orden.id}`} className="btn btn-warning btn-sm  mx-1 my-1">
                      Verificar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  
    <div className="pagination d-flex justify-content-center align-items-center mt-3 gap-2 py-5">
      <button className="btn btn-primary" onClick={handlePreviousPage} disabled={page == 1}>
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button className="btn btn-primary" onClick={handleNextPage} disabled={page == totalPages}>
        Siguiente
      </button>
    </div>
  </div>
  
  );
};

export default IndexInsf;
