import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';
import { Button, Table, Alert } from 'react-bootstrap';
import { carritoContext } from "../contexts/carritoContext";


const ModalArtCod = ({ isOpen, onRequestClose }) => {
    const [sucursales, setSucursales] = useState([]);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [codigoArticulo, setCodigoArticulo] = useState('');
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { apiBaseUrl } = useContext(carritoContext);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/sucursal/sucursales.json`);
                if (!response.ok) throw new Error('Error en la carga de sucursales');
                const result = await response.json();
                setSucursales(result.sucursales.map(s => ({
                    value: s.codigo,
                    label: `${s.nombre} (${s.codigo})`
                })));
            } catch (error) {
                console.error(error);
            }
        };

        fetchSucursales();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        setMessage(''); // Limpiar el mensaje anterior

        try {
            const response = await fetch(`${apiBaseUrl}/sucursal/filtroart.json?${selectedSucursal ? `Cod=${selectedSucursal.value}&` : ''}Articulo=${codigoArticulo}`);
            if (!response.ok) throw new Error('Error en la búsqueda');
            const result = await response.json();
            setArticulos(result);

            if (result.length === 0) {
                setMessage('No se encontraron artículos.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error al realizar la búsqueda.');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedSucursal(null);
        setCodigoArticulo('');
        setArticulos([]);
        setMessage(''); // Limpiar el mensaje al restablecer
    };

    return (
        <Modal show={isOpen} onHide={onRequestClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Búsqueda de Artículos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <Select
                        options={sucursales}
                        onChange={setSelectedSucursal}
                        placeholder="Selecciona una sucursal (opcional)"
                        value={selectedSucursal}
                        styles={{ control: (base) => ({ ...base, minWidth: 200 }) }}
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Código del artículo"
                        value={codigoArticulo}
                        onChange={(e) => setCodigoArticulo(e.target.value)}
                    />
                </div>
                <Button variant="primary" onClick={handleSearch} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </Button>
                <Button variant="secondary" onClick={clearFilters} className="ms-2">Borrar Filtros</Button>

                {message && <Alert variant="info" className="mt-3">{message}</Alert>}

                {articulos.length > 0 && (
                    <Table striped bordered hover className="mt-3" responsive>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>DocNº</th>
                                <th>Suc</th>
                                <th>Fecha</th>
                                <th>Dep</th>
                                <th>Categoría</th>
                                <th>Artículo</th>
                                <th>Descripción Artículo</th>
                                <th>Cant Sol</th>
                                <th>Bultos</th>
                                
                               
                               
                                <th>Exist. Galpón</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articulos.map((articulo, index) => (
                                <tr key={index}>
                                    <td>{articulo.Tipo}</td>
                                    <td>{articulo.DocNum}</td>
                                    <td>{articulo.Cod}</td>
                                    <td>{new Date(articulo.Fecha).toLocaleDateString()}</td>
                                    <td>{articulo.Departamento}</td>
                                    <td>{articulo.Categoria}</td>
                                    <td>{articulo.Articulo}</td>
                                    <td>{articulo["Descripción Artículo"]}</td>
                                    <td>{parseFloat(articulo.Cant_Orig).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td>{articulo.Bultos}</td>
                                 
                                   
                                   
                                    <td>{parseFloat(articulo.Exist_Galpon).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onRequestClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalArtCod;
