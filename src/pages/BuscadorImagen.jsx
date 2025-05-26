import React, { useContext, useState, useMemo, useCallback } from 'react';
import { MdOutlineImageSearch } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { carritoContext } from '../contexts/carritoContext';
import { Knob } from 'primereact/knob';
import { Image } from 'primereact/image';

// Constantes de configuración
const API_ENDPOINTS = {
    IMAGE_UPLOAD: 'http://192.168.0.102:8000/image/upload',
    PRODUCTS: '/art/serial.json?codigo=',
    IMAGE_URL: 'http://192.168.0.102:8000/static/'
};

const ITEMS_PER_PAGE = 9;

const BuscadorImagen = () => {
    // Estados
    const [state, setState] = useState({
        file: null,
        imagePreview: null,
        resultado: [],
        inputValue: '',
        loading: false,
        error: '',
        isAnimating: false,
        currentPage: 1
    });

    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
    const navigate = useNavigate();

    // Memoized values
    const { resultado, currentPage } = state;
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = useMemo(() => resultado.slice(indexOfFirstItem, indexOfLastItem), [resultado, indexOfFirstItem, indexOfLastItem]);
    const totalPages = useMemo(() => Math.ceil(resultado.length / ITEMS_PER_PAGE), [resultado.length]);

    // Handlers
    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        // Validación: solo permitir archivos de imagen
        if (file && !file.type.startsWith('image/')) {
            alert('Formato no permitido. Solo se permiten imágenes.');
            setState(prev => ({
                ...prev,
                file: null,
                imagePreview: null,
                resultado: [],
                currentPage: 1
            }));
            return;
        }
        // Validación: tamaño máximo
        if (file && file.size > 5 * 1024 * 1024) {
            alert('La imagen es demasiado grande. El tamaño máximo es de 2MB.');
            setState(prev => ({
                ...prev,
                file: null,
                imagePreview: null,
                resultado: [],
                currentPage: 1,
                error: 'La imagen es demasiado grande. El tamaño máximo permitido es de 2MB.'
            }));
            return;
        }
        const reader = file ? new FileReader() : null;

        if (reader) {
            reader.onloadend = () => {
                setState(prev => ({
                    ...prev,
                    file,
                    imagePreview: reader.result,
                    resultado: [],
                    currentPage: 1
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setState(prev => ({
                ...prev,
                file: null,
                imagePreview: null,
                resultado: [],
                currentPage: 1
            }));
        }
    }, []);
    
    const getExistencia = async (itemcode) => {
        try {
            const response = await fetch(`${apiBaseUrl}/art/existencia.json?itemcode=${itemcode}`);
            if (!response.ok) {
                throw new Error('Error al obtener la existencia');
            }
            const data = await response.json();
            return data.articulos.reduce((acc, articulo) => {
                acc[articulo.whscode] = {
                    existencia: articulo.Existencia,
                    disponible: articulo.Disponible,
                };
                return acc;
            }, {});
        } catch (error) {
            console.error('Error al obtener la existencia:', error);
            return {};
        }
    };

    const handleSubmitImagen = useCallback(async (event) => {
        event.preventDefault();
        const { file } = state;
    
        if (!file) {
            setState(prev => ({ ...prev, error: "Por favor selecciona una imagen." }));
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            setState(prev => ({ ...prev, loading: true, error: '', resultado: [], currentPage: 1 }));
    
            const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error desconocido del servidor');
            }
    
            const data = await response.json();
            console.log('Respuesta de imagen API:', data);
    
            const productos = await Promise.all(
                data.results.map(async (item) => {
                    const res = await fetch(`${apiBaseUrl + API_ENDPOINTS.PRODUCTS}${item.name}`);
                    if (!res.ok) return null;
                    const prod = await res.json();
    
                    // Obtener la existencia del producto
                    const existencia = await getExistencia(item.name);
    
                    return prod?.codigo ? {
                        ...prod,
                        imagen: item.image_url,
                        similaridad: Math.round(item.score * 100),
                        existencia, // Agregar existencia
                    } : null;
                })
            );
    
            const productosFiltrados = productos.filter(Boolean)
                .sort((a, b) => b.similaridad - a.similaridad);
    
            setState(prev => ({ ...prev, resultado: productosFiltrados }));
        } catch (err) {
            console.error('Error:', err);
            setState(prev => ({ ...prev, error: err.message }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [state.file]);
    



    const handleClearResults = useCallback(() => {
        setState(prev => ({ ...prev, isAnimating: true, resultado: [], currentPage: 1 }));
        setTimeout(() => {
            setState(prev => ({ ...prev, isAnimating: false }));
        }, 1000);
    }, []);

    // Funciones de renderizado
    const getColorClass = useCallback((similaridad) => {
        if (similaridad >= 80) return '#0b4c2e';
        if (similaridad >= 50) return '#ffc107';
        return '#dc3545';
    }, []);

    const renderProductoDetectado = useCallback(() => {
        if (state.resultado.length === 0) return 'No se ha detectado ningún producto';

        const { descripcion, categoria, codigo, unidad_compra, empaque, precio, imagen, similaridad, composicion } = state.resultado[0];
        return (
            <>
                <div className="row">
                    <div className="col-md-6">
                        <strong>Nombre:</strong> {descripcion}<br />
                        <strong>Categoría:</strong> {categoria}<br />
                        <strong>Código:</strong> {codigo}<br />
                        <strong>Composicion:</strong> {composicion}<br />
                        <strong>Empaque:</strong> {empaque}Unds<br />
                        <strong>Precio:</strong> {precio}$
                    </div>
                    <div className="col-md-6 text-center">
                        <div className={`img-thumbnail rounded m-2 mb-2 ${similaridad >= 99 ? 'bg-success' : ''}`} style={{ maxWidth: '210px', maxHeight: '200px' }}>
                            <Image
                                src={imagen}
                                zoomSrc={imagen}
                                alt={descripcion}
                                width="200"
                                height="190"
                                preview
                                className="img-fluid pe-0"
                                style={{ objectFit: 'contain', maxWidth: '200px', maxHeight: '190px' }}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }, [state.resultado]);

    // Renderizado del paginador
    const renderPagination = useMemo(() => {
        if (totalPages <= 1) return null;

        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    
        

        return (
            <nav className="mt-4 justify-content-center">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${state.currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link paginator-btn"
                            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            disabled={state.currentPage === 1}
                        >
                            Anterior
                        </button>
                    </li>

                    {pageNumbers.map(number => (
                        <li
                            key={number}
                            className={`page-item ${state.currentPage === number ? 'active' : ''}`}
                        >
                            <button
                                className="page-link paginator-btn"
                                onClick={() => setState(prev => ({ ...prev, currentPage: number }))}
                            >
                                {number}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${state.currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link paginator-btn"
                            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            disabled={state.currentPage === totalPages}
                        >
                            Siguiente
                        </button>
                    </li>
                </ul>
            </nav>
        );
    }, [totalPages, state.currentPage]);

    // Extraer valores del estado para facilitar el acceso
    const { file, imagePreview, loading, error, isAnimating } = state;

    return (
        <>
            <h1 className='text-center py-3'>Buscar Imagen <MdOutlineImageSearch className='text-success' /></h1>
            <div className="card mx-2 px-2" style={{ backgroundColor: '#edeaea' }}>
                <div className="row">
                    <div className="col-md-6 d-flex justify-content-center align-items-start my-1">
                        <div className="d-flex flex-column w-100">
                            <div className="card shadow mt-1 mb-2 p-2 w-100">
                                <div className="mt-2 mb-2 text-center">
                                    <form data-testid="form-imagen" onSubmit={handleSubmitImagen}>
                                        <h5 className="text-white fw-bold rounded mb-2 mx-2 p-1" style={{ backgroundColor: '#0b4c2e' }}>
                                            Seleccione una imagen para buscar productos con imagenes similares
                                        </h5>
                                        <input className="form-control" type="file" accept="image/*" data-testid="input-imagen" onChange={handleFileChange} />
                                        {loading && (
                                            <>
                                                <h5 className="text-center mt-2 mb-1">Buscando productos con imágenes similares...</h5>
                                            </>
                                        )}
                                        <button className="btn btn-success mt-2 me-2" type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Buscando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-search-alt my-auto me-1"></i>
                                                    Buscar productos similares
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    {error && (
                                        <div className="alert alert-danger alert-dismissible fade show mt-3 mb-0 text-center" role="alert">
                                            <i className='bx bx-error me-1'></i>{error}
                                            <button
                                                type="button"
                                                className="btn-close"
                                                aria-label="Close"
                                                onClick={() => setState(prev => ({ ...prev, error: '' }))}
                                            ></button>
                                        </div>
                                    )}
                                    <button className='btn btn-outline-danger mt-2' onClick={handleClearResults}>
                                        <i className={`bx bx-trash-alt my-auto me-1 ${isAnimating ? 'bx-tada' : ''}`}></i>
                                        Limpiar resultados
                                    </button>
                                </div>
                            </div>
                            <div className="card shadow mt-1 mb-1 p-3 w-100">
                                <h5 className='text-center text-white rounded fw-bold p-1 mb-3' style={{ backgroundColor: '#0b4c2e' }}>
                                    Informacion del producto mas similar a la imagen:
                                </h5>
                                <div className="row">
                                    {loading ? (
                                        <div className="text-center">
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                            <p>Analizando imagen...</p>
                                        </div>
                                    ) : (
                                        <div>{renderProductoDetectado()}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 d-flex justify-content-center mt-4 py-0">
                        {imagePreview && (
                            <div className="card shadow mt-0 mx-auto mb-4 p-2 w-100" style={{ height: '101%', backgroundColor: '#edeaea'  }} >
                                <h5 className="text-white text-center fw-bold p-1 rounded" style={{ backgroundColor: '#0b4c2e' }}>Vista previa de la imagen:</h5>
                                <div className="d-flex justify-content-center my-auto">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="img-fluid border border-success"
                                        style={{ maxHeight: '420px', objectFit: 'contain', width: '365px' }}
                                      
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="container2">
                {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3">Buscando productos similares...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-center mt-4">
                            Resultados de busqueda de productos similares:
                            <span className="badge badge-pill bg-success ms-1">{resultado.length}</span>                          
                        </h2>
                        <div className="row">
                            {currentItems.map(producto => (
                                <ProductoCard
                                    key={producto.codigo}
                                    producto={producto}
                                    getColorClass={getColorClass}
                                />
                            ))}
                        </div>
                        <div className='text-center mt-2'>
                            <h4>Página {currentPage} de {totalPages}</h4>
                        </div>
                        {renderPagination}
                    </>
                )}
            </div>
        </>
    );
};

// Componente separado para la tarjeta de producto
const ProductoCard = React.memo(({ producto, getColorClass }) => (
    <div className="col-md-4 p-3">
        <div className='card my-2 h-100' style={{ backgroundColor: '#edeaea' }}>
            <div className="card-header text-white" style={{ backgroundColor: '#0b4c2e', height: '80px' }}>
                <h5 className='text-center my-auto'>{producto.descripcion}</h5>
            </div>
            <div className='card-body'>
                <div className="row">
                    <div className="col-md-6">
                        <div
                            className="d-flex flex-column align-items-center"
                            style={{ width: '100%' }}
                        >
                            <div class={`card mb-4  ${producto.similaridad >= 99 ? 'bg-info' : ''} `} style={{ width: '230px' }}>

                                <Image
                                    src={producto.imagen}
                                    alt={producto.descripcion}
                                    width="225"
                                    height="220"
                                    preview
                                    className="card-img-top border border-success"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>

                            <div className="pt-2 text-center flex-grow-1">
                                <Knob
                                    value={producto.similaridad}
                                    min={0}
                                    max={100}
                                    valueColor={getColorClass(producto.similaridad)}
                                    valueTemplate={'{value}%'}
                                    readOnly={true}
                                    size={100}
                                    strokeWidth={10}
                                />
                                <p><strong>Porcentaje de similitud:</strong></p>
                            </div>

                            <p className="mt-2 text-center" style={{ wordBreak: 'break-all' }}>
                                <strong>Url Imagen:</strong> {producto.imagen}
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <ul className="list-group list-group">
                            <li className="list-group-item">Categoria: {producto.categoria}</li>
                            <li className="list-group-item">Codigo: {producto.codigo}</li>
                            <li className="list-group-item">Composicion: {producto.composicion}</li>
                            <li className="list-group-item">Empaque: {producto.empaque} Unds</li>
                            <li className="list-group-item">Precio: {producto.precio}$</li>
                            <li className="list-group-item">
                                <strong>Existencia:</strong>
                                {producto.existencia && Object.keys(producto.existencia).length > 0 ? (
                                    <ul className="list-group">
                                        {Object.entries(producto.existencia).map(([whscode, { existencia, disponible }]) => (
                                            <ul className="list-group my-2">
                                                <li className="list-group-item ">
                                                    <strong>Almacén {whscode}:</strong>
                                                </li>
                                                <li className="list-group-item text-primary">
                                                    Existencia: {Number(existencia).toFixed(0)} Unds
                                                </li>
                                                <li className="list-group-item text-success">
                                                    Disponible: {Number(disponible).toFixed(0)} Unds
                                                </li>
                                            </ul>

                                        ))}
                                    </ul>
                                ) : (
                                    <p>No disponible</p>
                                )}
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

export default BuscadorImagen;