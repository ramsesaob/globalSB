import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { carritoContext } from '../contexts/carritoContext';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const IndexDan = () => {
  const [ordenes, setOrdenes] = useState([]);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [searchNsolicitud, setSearchNsolicitud] = useState('');
  const [searchDescripcion, setSearchDescripcion] = useState('');
  const [searchResponsable, setSearchResponsable] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const debouncedSearchNsolicitud = useMemo(() => debounce(value => setSearchNsolicitud(value), 300), []);
  const debouncedSearchDescripcion = useMemo(() => debounce(value => setSearchDescripcion(value), 300), []);
  const debouncedSearchResponsable = useMemo(() => debounce(value => setSearchResponsable(value), 300), []);


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/danado/page.json`, {
        params: {
          nsolicitud: searchNsolicitud,
          descripcion: searchDescripcion,
          responsable: searchResponsable,
          status: statusFilter,
          page,
          limit
        }
      });

      setOrdenes(response.data.ordenes || []);
      setTotalPages(response.data.totalpages || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (fecha) => {
    if (!fecha) return 'N/A';
    const dateString = fecha.split('.')[0];
    const createdDate = new Date(dateString + 'Z');
    if (isNaN(createdDate.getTime())) return 'Fecha no válida';

    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, '0');
    const day = String(createdDate.getDate()).padStart(2, '0');
    let hours = createdDate.getHours();
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleSearchChange = (field, value) => {
    if (field === 'nsolicitud') debouncedSearchNsolicitud(value);
    if (field === 'descripcion') debouncedSearchDescripcion(value);
    if (field === 'responsable') debouncedSearchResponsable(value);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedOrders = () => {
    return [...ordenes].sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';
      if (sortConfig.key === 'nsolicitud') {
        valA = Number(valA);
        valB = Number(valB);
      }
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, statusFilter, searchNsolicitud, searchDescripcion, searchResponsable]);

  const limpiarFiltros = () => {
  setSearchNsolicitud('');
  setSearchDescripcion('');
  setSearchResponsable('');
  setStatusFilter('');
  setFechaInicio('');
  setFechaFin('');
};


  return (
    <div className="container2 mt-3">
      <h2 className="mb-4 text-center">Solicitudes de Productos Dañados</h2>

      <div className="row ">
        <div className="col-sm">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar Nº Solicitud"
            onChange={(e) => handleSearchChange('nsolicitud', e.target.value)}
          />
        </div>
        <div className="col-sm">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar Sucursal"
            onChange={(e) => handleSearchChange('descripcion', e.target.value)}
          />
        </div>
        <div className="col-sm">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar Responsable"
            onChange={(e) => handleSearchChange('responsable', e.target.value)}
          />
        </div>
        <div className="col-sm">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Anulado">Anulado</option>
          </select>
        </div>
        <div className="col-sm-2">
          <select
            className="form-select form-select-sm"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="col-sm-1">
          <div className="col-sm-auto">
          <button className="btn btn-warning btn-sm" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>

          {datosUsuario.user.role === 'user2' && (
                <button className="btn btn-success mx-2 btn-sm">
                  <Link to="/IndexItemsDanados" className="nav-link active" aria-current="page">
                    Ajustes 
                  </Link>
                </button>
              )}

        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-sm text-center">
            <thead className="table-info">
              <tr>
                <th onClick={() => handleSort('created')} style={{ cursor: 'pointer' }}>Fecha</th>
                <th onClick={() => handleSort('nsolicitud')} style={{ cursor: 'pointer' }}>Solicitud</th>
                <th onClick={() => handleSort('descripcion')} style={{ cursor: 'pointer' }}>Sucursal</th>
                <th>Responsable</th>
                <th>Status</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {getSortedOrders().map((orden) => (
                <tr key={orden.id}>
                  <td>{formatDate(orden.created)}</td>
                  <td>{orden.nsolicitud}</td>
                  <td>{orden.descripcion}</td>
                  <td>{orden.responsable || 'N/A'}</td>
                  <td>{orden.status}</td>
                  <td>
                    <Link to={`/ViewPageDan/${orden.id}`} className="btn btn-sm btn-primary">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
        <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default IndexDan;
