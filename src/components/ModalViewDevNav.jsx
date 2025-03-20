import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { carritoContext } from '../contexts/carritoContext';

const ModalViewDevNav = ({ isOpen, onRequestClose, solicitudId }) => {
  const [devolucion, setDevolucion] = useState(null);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext); 

  // Cargar los datos de la devolución según el ID
  useEffect(() => {
    if (solicitudId) {
      const fetchDevolucion = async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/devnavidad/view/${solicitudId}.json`);
          const data = await response.json();
          setDevolucion(data.devolucionesnav);
        } catch (error) {
          console.error('Error al cargar los detalles de la devolución:', error);
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un error al cargar los detalles de la devolución.'
          });
        }
      };

      fetchDevolucion();
    }
  }, [solicitudId]);

  if (!devolucion) return null;

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Cabecera de la orden
    const header = [
      ['Motivo:', devolucion.motivo],
      ['Número de Solicitud:', devolucion.nsolicitud],
      ['Sucursal:', devolucion.user.sucursale.descripcion],
      ['Comentario:', devolucion.comentario || 'No disponible'],
      ['Nº de Precinto:', devolucion.nprecinto || 'No disponible'],
    ];

    // Detalles de la tabla
    const columns = ['Código Artículo', 'Nombre Artículo', 'Existencia Ref', 'Cantidad Enviada', 'Diferencial' , 'Nº del Bulto', 'Comentario'];
    const rows = devolucion.devoluciondetalles.map((detalle) => [
      detalle.cod_articulo,
      detalle.des_articulo,
      `${formatNumber(detalle.exist_suc)}`,
      `${detalle.cant_enviar}`,
      `${detalle.cant_enviar - detalle.exist_suc}`,
      detalle.num_bulto,
      detalle.comentario || 'No disponible'
    ]);

    // Convertir la cabecera a una hoja de trabajo
    const wsHeader = XLSX.utils.aoa_to_sheet(header);
    // Convertir los detalles de la tabla a una hoja de trabajo
    const wsDetails = XLSX.utils.aoa_to_sheet([columns, ...rows]);

    // Crear un nuevo libro de trabajo y agregar ambas hojas
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsHeader, 'Orden');
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles');

    // Escribir el archivo Excel
    XLSX.writeFile(wb, 'devolucion_navidad.xlsx');
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Detalles de la Devolución', 14, 20);

    // Agregar los datos de la devolución
    doc.setFontSize(12);
    doc.text(`Motivo: ${devolucion.motivo}`, 14, 30);
    doc.text(`Número de Solicitud: ${devolucion.nsolicitud}`, 14, 40);
    doc.text(`Sucursal: ${devolucion.user.sucursale.descripcion}`, 14, 50);
    doc.text(`Comentario: ${devolucion.comentario || 'No disponible'}`, 14, 60);
    doc.text(`Número de Precinto: ${devolucion.nprecinto || 'No disponible'}`, 14, 70);


    // Tabla de detalles
    const columns = ['Código Artículo', 'Nombre Artículo', 'Existencia Ref', 'Cantidad Enviada', 'Nº del Bulto', 'Comentario'];
    const rows = devolucion.devoluciondetalles.map((detalle) => [
      detalle.cod_articulo,
      detalle.des_articulo,
      `${formatNumber(detalle.exist_suc)}/unds`,
      `${detalle.cant_enviar}/unds`,
      detalle.num_bulto,
      detalle.comentario || 'No disponible'
    ]);

    doc.autoTable({
      startY: 70,
      head: [columns],
      body: rows
    });

    doc.save('devolucion_navidad.pdf');
  };

  return (
    <Modal show={isOpen} onHide={onRequestClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de la Devolución</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6><strong>Motivo:</strong> {devolucion.motivo}</h6>
        <h6><strong>Número de Solicitud:</strong> {devolucion.nsolicitud}</h6>
        <h6><strong>Sucursal:</strong> {devolucion.user.sucursale.descripcion}</h6>
        <h6><strong>Número de Precinto:</strong> {devolucion.nprecinto || 'No disponible'}</h6>
        <h6><strong>Comentario:</strong> {devolucion.comentario || 'No disponible'}</h6>

        {devolucion.anulada === 0 ? (
              <h2>
                <div className="alert alert-danger text-center" role="alert">
                  ANULADA
                </div>
              </h2>
            ) : (
              ''
            )}

        <h5 className="mt-4">Detalles de la Devolución</h5>
        <table className="table table-bordered" id="devTable">
          <thead>
            <tr>
              <th>Codigo Articulo</th>
              <th>Nombre Articulo</th>
              <th>Existencia Ref</th>
              <th>Cantidad Enviada</th>
              <th>Difrencial</th>
              <th>Nº del Bulto</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {devolucion.devoluciondetalles.map((detalle) => (
              <tr key={detalle.id}>
                <td>{detalle.cod_articulo}</td>
                <td>{detalle.des_articulo}</td>
                <td>{formatNumber(detalle.exist_suc)}/unds</td>
                <td>{detalle.cant_enviar}/unds</td>
                <td>{detalle.cant_enviar - detalle.exist_suc }</td>
                <td>{detalle.num_bulto}</td>
                <td>{detalle.comentario || 'No disponible'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        
      <button className="btn btn-success" title='Descargar Excel' onClick={exportToExcel}><i className='bx bxs-file'></i>Excel <i className='bx bxs-download'></i></button>
        <button className="btn btn-danger " onClick={exportToPDF}>
                <i className=' bx bxs-file-pdf '>PDF</i> <i className='bx bxs-download'></i>
              </button>
        <Button variant="primary" onClick={onRequestClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalViewDevNav;
