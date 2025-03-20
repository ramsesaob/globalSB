import moment from 'moment';
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, InputGroup, FormControl, Pagination, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { carritoContext } from '../contexts/carritoContext';

const IndexAjustesProc = () => {
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext); 
  const [ajustes, setAjustes] = useState([]);
  const [filteredAjustes, setFilteredAjustes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterProcessed, setFilterProcessed] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
    const navigate = useNavigate();
    const [sucursales, setSucursales] = useState([]);
    const [filterSucursal, setFilterSucursal] = useState(null);

  // Llamada a la API
  useEffect(() => {
    const fetchAjustes = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/ajuste/itemsprocesados.json`);
        const data = await response.json();
        setAjustes(data.ajustes); // Asumiendo que la estructura de los datos sigue la forma que enviaste antes
        setFilteredAjustes(data.ajustes);
      } catch (error) {
        console.error('Error al obtener los ajustes:', error);
      }
    };

    fetchAjustes();
  }, []);

    useEffect(() => {
      // Fetch de las sucursales de la API
      fetch(`${apiBaseUrl}/sucursal/sucursales.json`)
        .then(response => response.json())
        .then(data => {
          setSucursales(data.sucursales);  // Guardamos las sucursales en el estado
        })
        .catch(error => console.error('Error al cargar las sucursales:', error));
    }, []); 

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
  
      return (
        (item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterDate ? item.fecha_creado.includes(filterDate) : true) &&
        processedMatch &&
        sucAsigMatch
      );
    });
  
    
    setFilteredAjustes(filteredData);
  };
  const clearFilters = () => {
    // Restablece los filtros a sus valores iniciales
    setSearchQuery("");  // Limpiar la búsqueda
    setFilterDate("");   // Limpiar fecha
    setFilterProcessed("all"); // Restablecer el filtro de procesado al valor inicial
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

  const handleBack = () => {
    navigate(-1); // Navega hacia atrás
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
        onClick={handleBack}
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
          <Button onClick={applyFilters} variant="primary" className="mt-2 mx-2">
            Aplicar Filtros
          </Button>
        

        {/* Botón para borrar filtros */}
      
          <Button onClick={clearFilters} variant="danger" className="mt-2 ">
          <i className="bx bxs-trash"></i> Filtros
          </Button>
          </Col>
      </Row>

      <Table striped bordered hover responsive className="text-center">
        <thead>
          <tr className="table-primary">
            <th>Tienda</th>
            <th>Nº Sol</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Motivo</th>
            <th>Entrada</th>
            <th>Salida</th>
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
              <td>{ajuste.codigo}</td>
              <td>{ajuste.item_descripcion}</td>
              <td>{ajuste.motivo}</td>
              <td>{ajuste.entrada}</td>
              <td>{ajuste.salida}</td>
              <td>{moment(ajuste.fecha_creado).format('DD-MM-YYYY')}</td>
              <td>{ajuste.procesado === null ? 'No procesado' : 'Procesado'}</td>
              <td>{ajuste.fecha_procesado ? moment(ajuste.fecha_procesado).format('DD-MM-YYYY') : 'No procesado'}</td>

            </tr>
          ))}
        </tbody>
      </Table>

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
    </div>
  );
};

export default IndexAjustesProc;
