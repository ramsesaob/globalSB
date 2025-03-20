import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import ModalAggTrabInsf from '../components/ModalAggTrabInsf';
import { carritoContext } from '../contexts/carritoContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewItemsDiferencia = () => {
  const [itemsDiferencia, setItemsDiferencia] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [loading, setLoading] = useState(true);
  const [conteoTotal, setConteoTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    sucursal: "",
    fecha: "",
    solicitud: "",
    fechaConteo: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  // Restablecer los filtros
  const resetFilters = () => {
    setFilters({
      sucursal: "",
      fecha: "",
      solicitud: "",
      fechaConteo: ""
    });
    setSearchTerm("");
  };

  // Función para abrir el modal
  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  // Función para obtener los datos
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/ordeninsf/itemsDiferencia.json`);
      const ordenes = response.data.itemsDiferencia;

      const userRole = datosUsuario.user.role;

      if (userRole == 'user2' || userRole == 'admin') {
        setItemsDiferencia(ordenes);
      } else {
        const sucursal = datosUsuario.user.sucursale;
        const codigo_sucursal = sucursal.codigo;
        const filteredPedidos = ordenes.filter(orden => orden.cod_suc == codigo_sucursal);
        setItemsDiferencia(filteredPedidos);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar los items
  const filterItems = () => {
    let filtered = [...itemsDiferencia];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const itemRep = item.item_rep ? item.item_rep.toLowerCase() : '';
        const descripcionRep = item.descripcion_rep ? item.descripcion_rep.toLowerCase() : '';
        const sucRep = item.cod_suc ? item.cod_suc.toLowerCase() : '';
        return itemRep.includes(searchTerm.toLowerCase()) || descripcionRep.includes(searchTerm.toLowerCase()) || sucRep.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por sucursal
    if (filters.sucursal) {
      filtered = filtered.filter(item => item.cod_suc === filters.sucursal);
    }

    // Filtro por fecha
    if (filters.fecha) {
      filtered = filtered.filter(item => moment(item.fecha_insuficienca).isSame(filters.fecha, 'day'));
    }

    // Filtro por solicitud
    if (filters.solicitud) {
      filtered = filtered.filter(item => item.nsolicitud.toLowerCase().includes(filters.solicitud.toLowerCase()));
    }

    // Filtro por fecha de conteo
    if (filters.fechaConteo) {
      filtered = filtered.filter(item => moment(item.fecha_conteo).isSame(filters.fechaConteo, 'day'));
    }

    // Ordenar los items
    if (sortColumn) {
      filtered = filtered.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];
        if (sortOrder === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    setFilteredItems(filtered);
    setConteoTotal(filtered.length);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (column) => {
    if (sortColumn === column) {
      setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchOrders();
  }, [apiBaseUrl, showModal]);

  useEffect(() => {
    filterItems();
  }, [filters, searchTerm, sortColumn, sortOrder, itemsDiferencia]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-3">
      <button
        className="btn btn-light active border-success text-success  d-inline-flex align-items-center"
        onClick={handleBack}
      >
        <i className="bx bx-arrow-back"></i> Regresar
      </button>

      <h1 className="text-center">Items con Diferencia</h1>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-4 col-sm-12 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por Tienda, Item o Descripción"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="col-md-3 col-sm-6 mb-2">
          <input
            type="date"
            className="form-control"
            value={filters.fecha}
            name="fecha"
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-3 col-sm-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Filtrar por Solicitud"
            value={filters.solicitud}
            name="solicitud"
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2 col-sm-12 mb-2">
          <button className="btn btn-danger btn-sm " onClick={resetFilters}>
          <i className="bx bxs-trash"></i> Filtros
          </button>
        </div>
      </div>

      <h4 className="text-end mb-3">Total de Items: {conteoTotal}</h4>

      <div className="table-responsive">
        <table className="table table-striped table-bordered table-sm text-center">
          <thead>
            <tr className="align-middle text-center table-dark">
              <th>Suc</th>
              <th>Fecha</th>
              <th>Item</th>
              <th>Descripción</th>
              <th>Sistema</th>
              <th>Físico</th>
              <th>Fecha Conteo</th>
              <th>Comentario Tienda</th>
              <th>Solicitud</th>
              <th>Status</th>
              <th>Precio</th>
              <th>Ajustes</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr key={item.id}>
                <td>{item.cod_suc}</td>
                 <td>{moment(item.fecha_insuficienca.split('T')[0]).format('DD-MM-YYYY')}</td>
                <td>{item.item_rep}</td>
                <td>{item.descripcion_rep}</td>
                <td>{item.cant_rep}</td>
                <td>{item.conteo_fisico}</td>
                <td>{moment(item.fecha_conteo).format('DD-MM-YYYY')}</td>
                <td>{item.comentario_tienda}</td>
                <td>{item.nsolicitud}</td>
                <td>{item.status}</td>
                <td>{item.precio01}</td>
                <td>
                  {item.insuficiencia_ajustes.length > 0 ? (
                    <div>
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr className="table-secondary">
                            <th>Código Ajuste</th>
                            <th>Descripción</th>
                            <th>Salida</th>
                            <th>Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.insuficiencia_ajustes.map((ajuste, index) => (
                            <tr key={index} className="table-secondary">
                              <td>{ajuste.codigo_ajustar}</td>
                              <td>{ajuste.descripcion}</td>
                              <td>{ajuste.salida}</td>
                              <td>{ajuste.precio}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No hay ajustes disponibles</p>
                  )}
                </td>
                <td className={item.precio02 > 0 ? 'text-success' : item.precio02 < 0 ? 'text-danger fw-bold' : ''}>
                  {parseFloat(item.precio02).toFixed(2)} 
                </td>
                <td>
                  {(datosUsuario.user.rol === 'admin' || datosUsuario.user.role === 'user1') && (
                    <button className="btn btn-success btn-sm" onClick={() => openModal(item)}>
                      <i className="bx bxs-user-plus bx-flip-horizontal bx-tada bx-md"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, index) => (
            <li className={`page-item ${index + 1 === currentPage ? "active" : ""}`} key={index}>
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Modal para ver item */}
      {showModal && modalItem && (
        <ModalAggTrabInsf item={modalItem} closeModal={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ViewItemsDiferencia;
