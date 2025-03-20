import React, { useEffect, useState, useContext } from 'react';
import { carritoContext } from "../contexts/carritoContext";
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Ofertas = () => {
    const { apiBaseUrl } = useContext(carritoContext);
    const [ofertas, setOfertas] = useState([]);
    const [filteredOfertas, setFilteredOfertas] = useState([]);
    const [selectedOferta, setSelectedOferta] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(1000);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchOfertas = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/sucursal/ofertaspendientes.json?page=${currentPage}&limit=${itemsPerPage}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setOfertas(data.oferta);
                setTotalRecords(data.total); // Total de registros
                setTotalPages(data.totalpages); // Total de páginas
                setFilteredOfertas(data.oferta); // Guardar la lista completa para el filtrado
            } catch (error) {
                console.error('Error fetching ofertas:', error);
            }
        };

        fetchOfertas();
    }, [apiBaseUrl, currentPage, itemsPerPage]);

    useEffect(() => {
        const result = ofertas.filter(oferta =>
            oferta.CardNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
            oferta.RIF.includes(searchTerm)
        );
        setFilteredOfertas(result);
        setCurrentPage(1); // Resetear a la primera página al filtrar
    }, [searchTerm, ofertas]);

    const openModal = (oferta) => {
        setSelectedOferta(oferta);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedOferta(null);
    };

    // Paginación
    const currentOfertas = filteredOfertas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Lógica para mostrar solo 5 botones de paginación
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Ofertas Pendientes</h1>
            <div className="d-flex justify-content-between mb-4">
                <Form.Group className="mb-0" style={{ width: '30%' }}>
                    <Form.Control
                        type="text"
                        placeholder="Filtrar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control form-control-sm"
                        aria-label="Buscar"
                        name="search"
                        id="search"
                        autoComplete="off"
                    />
                </Form.Group>

                <Form.Group className="mb-0" style={{ width: '30%' }}>
                    <Form.Label>Registros por página</Form.Label>
                    <Form.Control
                        as="select"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reiniciar a la primera página al cambiar el límite
                        }}
                    >
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                        <option value={5000}>10000</option>
                    </Form.Control>
                </Form.Group>
            </div>

            <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                    <tr>
                        <th>Nº de Oferta</th>
                        <th>Fecha</th>
                        <th>RIF</th>
                        <th>Sucursal</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOfertas.map((oferta) => (
                        <tr key={oferta.DocEntry}>
                            <td>{oferta.DocEntry}</td>
                            <td>{new Date(oferta.DocDate).toLocaleDateString()}</td>
                            <td>{oferta.RIF}</td>
                            <td>{oferta.CardNAME}</td>
                            <td>
                                <Button variant="primary" onClick={() => openModal(oferta)}>Ver Detalle</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Paginación */}
            <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                    <li className="page-item">
                        <Button
                            className="page-link"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            <i className='bx bx-first-page'></i>
                        </Button>
                    </li>
                    <li className="page-item">
                        <Button
                            className="page-link"
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <i className='bx bx-left-arrow-alt'></i>
                        </Button>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <Button
                                className="page-link"
                                onClick={() => handlePageChange(number)}
                            >
                                {number}
                            </Button>
                        </li>
                    ))}
                    <li className="page-item">
                        <Button
                            className="page-link"
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <i className='bx bx-right-arrow-alt'></i>
                        </Button>
                    </li>
                    <li className="page-item">
                        <Button
                            className="page-link"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <i className='bx bx-last-page'></i>
                        </Button>
                    </li>
                </ul>
            </nav>

            <p className="mt-3 text-center text-muted">Total de órdenes: {totalRecords}</p>

            <Modal show={modalIsOpen} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de la Orden</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOferta ? (
                        <>
                            <p><strong>DocEntry:</strong> {selectedOferta.DocEntry}</p>
                            <p><strong>DocDate:</strong> {new Date(selectedOferta.DocDate).toLocaleString()}</p>
                            <p><strong>RIF:</strong> {selectedOferta.RIF}</p>
                            <p><strong>Card Name:</strong> {selectedOferta.CardNAME}</p>
                        </>
                    ) : (
                        <p>Cargando...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Ofertas;
