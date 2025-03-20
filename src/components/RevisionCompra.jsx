import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const RevisionCompra = ({ productosCompra, opciones }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);

    const handleReviewClick = () => setShowReviewModal(true);
    const handleCloseReviewModal = () => setShowReviewModal(false);
   // console.log(productosCompra)
    //console.log(opciones)
   
    return (
        <>
            <Button className="btn btn-secondary btn-md mx-2" onClick={handleReviewClick}>Revisar</Button>
            <Modal show={showReviewModal} onHide={handleCloseReviewModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Revisión de Productos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Array.isArray(opciones) && opciones.map((opcion) => {
                        const productosFiltrados = productosCompra.filter(productosCompra => productosCompra.tipo_motivo === opcion.value);
                       // console.log(productosFiltrados)
                        return productosFiltrados.length > 0 ? (
                            <div key={opcion.value}>
                                <h5><strong>{opcion.label}</strong></h5>
                                <ul>
                                    {productosFiltrados.map((producto, index) => (
                                        <li key={index}>
                                            {`Motivo: ${producto.motivo || 'N/A'} -Descripción: ${producto.descripcion || 'N/A'} - Cantidad: ${producto.cantidad || '0'} - Unidad Medida: ${producto.medida || 'N/A'} - Área Utilizar: ${producto.area || 'N/A'}`}

                                            {opcion.value === "2" && (
                                                <span>{` - Inventario: ${producto.inventario || 'N/A'} - Consumo: ${producto.consumo || 'N/A'}`}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null;
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseReviewModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RevisionCompra;
