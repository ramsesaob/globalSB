import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Table, Button, Form, InputGroup, 
  FormControl, Pagination, Row, Col, 
  Spinner, Alert, Badge, 
  Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { carritoContext } from '../contexts/carritoContext';
import axios from 'axios/index';
import moment from 'moment';
import debounce from 'lodash.debounce';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const IndexItemsDanados = () => {
  const { apiBaseUrl, datosUsuario } = useContext(carritoContext);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Filtros
 const [filters, setFilters] = useState({
  search: '',
  sucursal: '',
  nsolicitud: '',
  status: '',
  ajustado: '',
  fechaDesde: '',
  fechaHasta: ''
});

  
  // Paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 50
  });
  
  const navigate = useNavigate();

  // Obtener todos los items
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primera petición para saber el total de páginas
        const firstPage = await axios.get(`${apiBaseUrl}/danado/items.json?page=1`);
        const totalPages = firstPage.data.pagination?.pageCount || 1;
        
        // Si solo hay una página, usar esos datos directamente
        if (totalPages === 1) {
          setAllItems(firstPage.data.registros || []);
          return;
        }
        
        // Obtener todas las páginas restantes en paralelo
        const pagePromises = [];
        for (let i = 2; i <= totalPages; i++) {
          pagePromises.push(axios.get(`${apiBaseUrl}/danado/items.json?page=${i}`));
        }
        
        const responses = await Promise.all(pagePromises);
        const allData = responses.reduce((acc, res) => {
          return [...acc, ...(res.data.ajustes || [])];
        }, firstPage.data.ajustes || []);
        
        setAllItems(allData);
      } catch (err) {
        console.error("Error al cargar registros:", err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllItems();
  }, [apiBaseUrl]);

  // Obtener sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/sucursal/sucursales.json`);
        setSucursales(response.data.sucursales || []);
      } catch (err) {
        console.error('Error al cargar las sucursales:', err);
      }
    };
    
    fetchSucursales();
  }, [apiBaseUrl]);

  // Filtrar items localmente
const filteredItems = useMemo(() => {
  return allItems.filter(item => {
    const matchesSearch = !filters.search || 
      item.codigo.toLowerCase().includes(filters.search.toLowerCase()) || 
      item.descripcion.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSucursal = !filters.sucursal || item.sucursal === filters.sucursal;
    const matchesNsolicitud = !filters.nsolicitud || String(item.nsolicitud).includes(filters.nsolicitud);
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesAjustado = filters.ajustado === ''
      || (filters.ajustado === 'si' && item.ajustado)
      || (filters.ajustado === 'no' && !item.ajustado);

    const fechaCreacion = moment(item.created);

    const matchesFechaDesde = !filters.fechaDesde || fechaCreacion.isSameOrAfter(moment(filters.fechaDesde), 'day');
    const matchesFechaHasta = !filters.fechaHasta || fechaCreacion.isSameOrBefore(moment(filters.fechaHasta), 'day');

    return (
      matchesSearch &&
      matchesSucursal &&
      matchesNsolicitud &&
      matchesStatus &&
      matchesAjustado &&
      matchesFechaDesde &&
      matchesFechaHasta
    );
  });
}, [allItems, filters]);


  // Manejar selección/deselección de items
  const handleSelectItem = (itemId, isChecked) => {
    setSelectedItems(prev => {
      if (isChecked) {
        return [...prev, itemId];
      } else {
        return prev.filter(id => id !== itemId);
      }
    });
  };

  // Verificar si un item puede ser ajustado
  const canBeAdjusted = (item) => {
    return item.status === 'Completado' && !item.ajustado;
  };



  // Guardar ajustes seleccionados
 const saveAdjustments = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.post(`${apiBaseUrl}/danado/ajustar.json`, {
      items: selectedItems,
      user_ajuste: datosUsuario.user.id, // ID del usuario
    });

    // Mostrar el mensaje de éxito o error usando SweetAlert
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Ajuste realizado',
        text: response.data.message,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.data.message || 'Hubo un problema al ajustar los items.',
      });
    }

    // Actualizar el estado local con los items ajustados
    setAllItems(prev => prev.map(item => {
      if (selectedItems.includes(item.id)) {
        return {
          ...item,
          ajustado: true,
          fecha_ajuste: new Date().toISOString(),
          user_ajuste: datosUsuario.id
        };
      }
      return item;
    }));

    setSelectedItems([]);
    setShowConfirmModal(false);
  } catch (err) {
    console.error("Error al guardar ajustes:", err);
    setError('Error al guardar los ajustes. Por favor, intente nuevamente.');
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al guardar los ajustes. Por favor, intente nuevamente.',
    });
  } finally {
    setLoading(false);
  }
};
const handleSelectAll = () => {
  // Filtramos los items "Completados" antes de seleccionar todos
  const itemsCompletados = filteredItems.filter(item => 
    item.status === 'Completado' && item.revision == 1 && item.ajustado == null
  );

  if (selectAll) {
    setSelectedItems([]); // Desmarcar todos
  } else {
    const allCompletedItemIds = itemsCompletados.map(item => item.id); // Obtener todos los IDs de los items completados
    setSelectedItems(allCompletedItemIds); // Marcar solo los completados
  }
  setSelectAll(!selectAll); // Alternar el estado de selección
};


  // Datos paginados
  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, pagination]);

  // Total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / pagination.itemsPerPage);
  }, [filteredItems, pagination.itemsPerPage]);

  // Manejar cambio de filtros con debounce
  const handleFilterChange = debounce((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetear a página 1
  }, 300);

  // Cambiar página
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo(0, 0);
  };

  // Generar números de página para la paginación
  const generatePageNumbers = () => {
    const { currentPage } = pagination;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const exportToExcel = () => {
    const exportItems = selectedItems.length > 0
      ? allItems.filter(item => selectedItems.includes(item.id))
      : filteredItems;

    const worksheet = XLSX.utils.json_to_sheet(exportItems.map(item => ({
      Código: item.codigo,
       Descripción: item.descripcion,
      'Piezas Danadas': item.pcs_danadas,
      'Fecha Creado': moment(item.created).format('DD/MM/YYYY'),
      Sucursal: item.sucursal,
       Cuenta: item.cuenta,
      Solicitud: item.nsolicitud,
      Estado: item.status,
      Revision: item.revision == 1 ? "Sí" : "No",
      Clasificación: item.clasificacion,
      Ajustado: item.ajustado ? 'Sí' : 'No',
      'Fecha Procesado': item.fecha_ajuste ? moment(item.fecha_ajuste).format('DD/MM/YYYY') : ''
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ItemsDañados');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'items_danados.xlsx');
  };


  return (
    <div className="container mt-2">
      <Button
        variant="light"
        className="active border-success text-success mb-3"
        onClick={() => navigate(-1)}
      >
        <i className="bx bx-arrow-back"></i> Regresar
      </Button>
      
      <h2 className="mb-3 text-center">Listado de Items Dañados</h2>
      
      {/* Filtros */}
      <Row className="mb-3 g-2">
        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Buscar</Form.Label>
            <Form.Control
              type="text"
              placeholder="Código o descripción"
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Form.Group>
        </Col>
        
        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Sucursal</Form.Label>
            <Form.Select
              onChange={(e) => handleFilterChange('sucursal', e.target.value)}
            >
              <option value="">Todas</option>
              {sucursales.map((suc) => (
                <option key={suc.codigo} value={suc.codigo}>
                  {suc.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">N° Solicitud</Form.Label>
            <Form.Control
              type="text"
              placeholder="Número de solicitud"
              onChange={(e) => handleFilterChange('nsolicitud', e.target.value)}
            />
          </Form.Group>
        </Col>
        
        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Estado</Form.Label>
            <Form.Select
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente">Pendiente</option>
            </Form.Select>
          </Form.Group>
        </Col>
         <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Ajustado</Form.Label>
            <Form.Select
              onChange={(e) => handleFilterChange('ajustado', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="no">Pendientes</option>
              <option value="si">Ajustados</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Desde</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Form.Group>
            <Form.Label className="text-success fw-bold">Hasta</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
            />
          </Form.Group>
        </Col>

         <Col xs={12} md={6} lg={3}>

         <Button 
          className='btn-sm mx-2 my-2'
          variant="outline-primary"
          onClick={exportToExcel}
          disabled={loading || (filteredItems.length === 0 && selectedItems.length === 0)}
        >
          <i className="bx bx-download"></i> Descargar Excel
        </Button>

          <Button
            className="btn-sm "
            variant="outline-danger"
            onClick={() => {
              setFilters({
                search: '',
                sucursal: '',
                nsolicitud: '',
                status: '',
                ajustado: '',
                fechaDesde: '',
                fechaHasta: ''
              });
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            Limpiar Filtros
          </Button>
        </Col>

      </Row>
         <Button 
              className='btn-sm mx-2 my-2'
              variant="warning"
              onClick={handleSelectAll}
              disabled={loading || filteredItems.length === 0} // Deshabilitar si está cargando o no hay items filtrados
              >
            {selectAll ? 'Desmarcar Todos' : 'Seleccionar Todos'}
          </Button>
       {/* Botón para guardar ajustes */}
      {selectedItems.length > 0 && (
        <div className="mb-3">
          <Button 
            variant="success" 
            onClick={() => saveAdjustments()}
            disabled={loading}
          >
            <i className="bx bx-check"></i> Guardar Ajustes ({selectedItems.length})
          </Button>
        </div>
      )}
      {/* Resultados */}
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
     

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
              <Table striped bordered hover className="mt-3">
                <thead className="table-primary">
                  <tr className=''>
                    <th>
                      Ajustar 
                    
                    </th>
                    <th>Sucursal</th>
                    <th>Nº Solicitud</th>
                    <th>Fecha Creado</th>
                    <th>Estado</th>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Revision</th>
                    <th>Clasificacion</th>
                    <th>Ajuste</th>
                    <th>Fecha Procesado</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <tr key={`${item.id}-${item.nsolicitud}-${item.sucursal}`}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            disabled={item.status !== 'Completado' || item.revision != 1 || item.ajustado != null} // Deshabilitar si no está completado
                          />
                        </td>
                        <td>{item.sucursal}</td>
                        <td>{item.nsolicitud}</td>
                        <td>{moment(item.created).format('DD/MM/YYYY')}</td>
                        <td>
                          <Badge bg={item.status === 'Completado' ? 'success' : 'warning'}>
                            {item.status}
                          </Badge>
                        </td>
                        <td>{item.codigo}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.revision == 1 ? "Sí" : "No"}</td>
                        <td>{item.clasificacion}</td>
                        <td>
                          <Badge bg={item.ajustado ? 'success' : 'secondary'}>
                            {item.ajustado ? 'Procesado' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td>
                          {item.fecha_ajuste ? 
                            moment(item.fecha_ajuste).format('DD/MM/YYYY') : 
                            '--'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No se encontraron registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

          </div>
           
          {/* Paginación */}
          {totalPages > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredItems.length)} de{' '}
                {filteredItems.length} registros
              </div>
              
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={pagination.currentPage === 1} 
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(pagination.currentPage - 1)} 
                  disabled={pagination.currentPage === 1} 
                />
                
                {generatePageNumbers().map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === pagination.currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(pagination.currentPage + 1)} 
                  disabled={pagination.currentPage === totalPages} 
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={pagination.currentPage === totalPages} 
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IndexItemsDanados;