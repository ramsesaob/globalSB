import moment from 'moment';
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, InputGroup, FormControl, Pagination, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { carritoContext } from '../contexts/carritoContext';
import axios from 'axios';
 
 
const IndexAjustesProc = () => {
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [ajustes, setAjustes] = useState([]);
  const [filteredAjustes, setFilteredAjustes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterProcessed, setFilterProcessed] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Corregido el nombre del estado
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [filterSucursal, setFilterSucursal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
 
 
  // Llamada a la API
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const firstPage = await axios.get(`${apiBaseUrl}/ajuste/itemsprocesados.json?page=1`);
        const totalPages = parseInt(firstPage.data.pagination.pageCount);
        let allAjustes = [...firstPage.data.ajustes];
 
        const promises = [];
        for (let i = 2; i <= totalPages; i++) {
          promises.push(axios.get(`${apiBaseUrl}/ajuste/itemsprocesados.json?page=${i}`));
        }
 
        const results = await Promise.all(promises);
        results.forEach(res => {
          allAjustes = allAjustes.concat(res.data.ajustes);
        });
 
        setAjustes(allAjustes);
        setFilteredAjustes(allAjustes); // Inicializa filteredAjustes con todos los ajustes
      } catch (error) {
        console.error("Error al cargar registros:", error);
      } finally {
        setLoading(false); // Establecer loading en false después de cargar los datos
      }
    };
 
    fetchAll();
  }, [apiBaseUrl]);
 
  useEffect(() => {
    // Fetch de las sucursales de la API
    fetch(`${apiBaseUrl}/sucursal/sucursales.json`)
      .then(response => response.json())
      .then(data => {
        // Ordenar las sucursales alfabéticamente por descripción
        const sortedSucursales = data.sucursales.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        setSucursales(sortedSucursales);  // Guardamos las sucursales ordenadas en el estado
      })
      .catch(error => console.error('Error al cargar las sucursales:', error));
  }, [apiBaseUrl]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
 
  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };
 
  const handleProcessedChange = (e) => {
    setFilterProcessed(e.target.value === "null" ? null : e.target.value); // Si seleccionas "No Procesado", se asigna null, de lo contrario se mantiene el valor
  };
 
 
 
  const applyFilters = () => {
    let filteredData = ajustes.filter(item => {
      // Verificamos si hay un valor en filterSucursal.Tienda
      const sucAsigMatch = filterSucursal && filterSucursal.Tienda
        ? new RegExp(`^${filterSucursal.Tienda.trim()}$`, 'i').test(item.descripcion.trim()) // Coincidencia exacta
        : true;
 
      const processedMatch = filterProcessed === 'all'
        ? true // No filtra si seleccionas 'Todos'
        : filterProcessed === null
          ? item.procesado === null // Filtra los "No Procesados" si 'null' es seleccionado
          : item.procesado == filterProcessed; // Filtra según si está procesado o no
 
      const statusMatch = filterStatus === "all"
        ? true // No filtra si seleccionas "Todos"
        : item.status === filterStatus; // Filtra según el status
 
      return (
        (item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterDate ? item.fecha_creado.includes(filterDate) : true) &&
        processedMatch &&
        sucAsigMatch &&
        statusMatch // Filtra también por status
      );
    });
 
    setFilteredAjustes(filteredData);
  };
 
  const clearFilters = () => {
    setSearchQuery("");  // Limpiar la búsqueda
    setFilterDate("");   // Limpiar fecha
    setFilterProcessed("all"); // Restablecer el filtro de procesado al valor inicial
    setFilterStatus("all"); // Restablecer el filtro de status al valor inicial
    setFilteredAjustes(ajustes); // Mostrar todos los ajustes nuevamente
    setFilterSucursal(null); // Restablecer filtro de sucursal
  };
 
 
 
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
 
  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAjustes = filteredAjustes.slice(indexOfFirst, indexOfLast);
 
  // Cálculo de páginas dinámico
  const totalPages = Math.ceil(filteredAjustes.length / itemsPerPage);
 
  // Calcula el rango de páginas para mostrar
  const startPage = Math.max(currentPage - 1, 1); // Mostrar la página actual y la anterior
  const endPage = Math.min(currentPage + 1, totalPages); // Mostrar la página siguiente y la actual
 
  // Si estamos cerca del inicio o el final, ajustamos el rango de páginas
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
 
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
 
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
 
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterSucursal(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
 
  console.log(filterSucursal);
 
  return (
    <div className="container mt-2">
 
      <button
        className="btn btn-light active border-success text-success mb-1 "
        onClick={() => navigate(-1)}
      >
        <i className="bx bx-arrow-back"></i> Regresar
      </button>
      <h2 className="mb-1 text-center">Listado de Ajustes</h2>
      <Row className="mb-3">
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Label className='text-success fw-bold'>Buscar:</Form.Label>
          <InputGroup className="mb-1">
            <FormControl
              placeholder="Buscar por código o descripción"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>
 
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Group>
            <Form.Label className='text-success fw-bold'>Filtrar por Fecha:</Form.Label>
            <Form.Control
              type="date"
              value={filterDate}
              onChange={handleDateChange}
            />
          </Form.Group>
        </Col>
 
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Group>
            <Form.Label className='text-success fw-bold'>Filtrar por Procesado:</Form.Label>
            <Form.Control
              as="select"
              value={filterProcessed}
              onChange={handleProcessedChange}
            >
              <option value="all">Todos</option>
              <option value="1">Procesado</option>
              <option value="null">No Procesado</option>
            </Form.Control>
 
          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Group>
            <Form.Label className='text-success fw-bold'>Filtrar por Tienda:</Form.Label>
            <select
              className="form-select form-select-sm"
              name="Tienda"
              value={filterSucursal ? filterSucursal.descripcion : ''}
              onChange={handleFilterChange}
            >
              <option value="">Seleccione una tienda...</option>
              {sucursales.map((sucursal, index) => (
                <option key={index} value={sucursal.descripcion}>
                  {sucursal.descripcion} ({sucursal.codigo})
                </option>
              ))}
            </select>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Group>
            <Form.Label className='text-success fw-bold'>Filtrar por Status:</Form.Label>
            <Form.Control
              as="select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Orden Creada">Orden Creada </option>
              <option value="Autorizada por Tienda">Autorizada por Tienda</option>
              <option value="Ajuste Confirmado">Ajuste Confirmado</option>
              <option value="Pendiente de Confirmación">Pendiente de Confirmación</option>
              <option value="Finalizada">Finalizada</option>
 
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3}>
          <Form.Group>
            <Form.Label className='text-success fw-bold'>Cantidad de registros a mostrar:</Form.Label>
            <select className="form-select" onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}>
              <option value={20}>20 registros</option>
              <option value={50}>50 registros</option>
              <option value={100}>100 registros</option>
              <option value={200}>200 registros</option>
              <option value={500}>500 registros</option>
            </select>
          </Form.Group>
        </Col>
 
        <Col xs={12} sm={6} md={6} lg={6}>
          <Button onClick={applyFilters} variant="primary" className="mt-3 mx-2 ">
            <i className='bx bxs-filter-alt me-1'></i> Aplicar Filtros
          </Button>
 
          {/* Botón para borrar filtros */}
          <Button onClick={clearFilters} variant="danger" className="mt-3 mx-2 ">
            <i className="bx bxs-trash"></i> Filtros
          </Button>
 
          <Button variant="warning" className="mt-3 mx-2 ">
            <Link style={{ textDecoration: 'none', color: 'black' }} to={`/IndexPersonDescuentos`}>
              <i className='bx bxs-discount me-1'></i> Descuentos
            </Link>
          </Button>
        </Col>
      </Row>
      {loading ? (
        <>
          <h5 className='text-center my-4'>Espere un momento, por favor...</h5>
          <div className="d-flex justify-content-center align-items-start" style={{ height: '100vh' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </>
      ) : (
        <>
      <Table striped bordered hover responsive className="text-center">
        <thead>
          <tr className="table-primary">
            <th>Tienda</th>
            <th>Nº Sol</th>
            <th>Status</th>
            <th>Código</th>
            <th>Descripción</th>
 
            <th>Entrada</th>
            <th>Salida</th>
            <th>Motivo</th>
            <th>Fecha Creado</th>
            <th>Procesado</th>
            <th>Fecha Procesado</th>
          </tr>
        </thead>
        <tbody>
          {currentAjustes.map((ajuste, index) => (
            <tr key={index}>
              <td>{ajuste.descripcion}</td>
              <td>{ajuste.nsolicitud}</td>
              <td>{ajuste.status}</td>
              <td>{ajuste.codigo}</td>
              <td>{ajuste.item_descripcion}</td>
 
              <td>{ajuste.entrada}</td>
              <td>{ajuste.salida}</td>
              <td>{ajuste.motivo}</td>
              <td>{moment(ajuste.fecha_creado).format('DD-MM-YYYY')}</td>
              <td>{ajuste.procesado === null ? 'No procesado' : 'Procesado'}</td>
              <td>{ajuste.fecha_procesado ? moment(ajuste.fecha_procesado).format('DD-MM-YYYY') : 'No procesado'}</td>
 
            </tr>
          ))}
        </tbody>
      </Table>
      <div className='text-center mt-2'>
        <h4>Página {currentPage} de {totalPages}</h4>
      </div>
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev onClick={handlePrevious} disabled={currentPage === 1} />
        {pageNumbers.map(number => (
          <Pagination.Item
            key={number}
            onClick={() => handlePageChange(number)}
            active={number === currentPage}
          >
            {number}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages} />
      </Pagination>
      </>
      )}
    </div>
  );
};
 
export default IndexAjustesProc;