import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReporteModal = ({ show, handleClose, orders }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMotivo, setSelectedMotivo] = useState('');
  const [chartData, setChartData] = useState({});

  const motivos = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Alta Rotación' },
    { value: '2', label: 'Ventas al por mayor' },
    { value: '3', label: 'Ventas de Clientes E' },
  ];

  const handleFilter = () => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const filteredData = orders.filter(ordenItem => {
      const orderDate = new Date(ordenItem.created);
      const isInDateRange =
        (!startDate || orderDate >= start) &&
        (!endDate || orderDate <= end);
      const isStatusMatch = !selectedStatus || ordenItem.Status_aprobada === selectedStatus;
      const isMotivoMatch = !selectedMotivo || ordenItem.descripcion === selectedMotivo;

      return isInDateRange && isStatusMatch && isMotivoMatch;
    });

    const counts = {
      total: filteredData.length,
      pending: filteredData.filter(o => o.Status_aprobada === 'Pendiente').length,
      partially: filteredData.filter(o => o.Status_aprobada === 'Parcialmente').length,
      processed: filteredData.filter(o => o.Status_aprobada === 'Procesada').length,
    };

    const data = {
      labels: ['Total', 'Pendientes', 'Parcialmente', 'Procesadas'],
      datasets: [
        {
          label: 'Órdenes', // Este es el label que aparecerá en la leyenda
          data: [
            counts.total,
            counts.pending,
            counts.partially,
            counts.processed,
          ],
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 14,
            },
          },
        },
      },
    };

    setChartData({ data, options });
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Reporte de Órdenes De Inventario", 60, 10);
    html2canvas(document.getElementById('report-content')).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 20);
      pdf.save("reporte.pdf");
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className='text-center'>Reporte de Órdenes De Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body id="report-content">
        <h5 className="text-center">Filtros</h5>
        <Form>
          <div className="row">
            <div className="col-sm-6 mb-1">
              <Form.Group controlId="formStartDate">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-sm-6 mb-1">
              <Form.Group controlId="formEndDate">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Form.Group>
            </div>
          </div>
          <div className="mb-3">
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Parcialmente">Parcialmente</option>
                <option value="Procesada">Procesada</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="mb-3">
            <Form.Group controlId="formMotivo">
              <Form.Label>Motivo</Form.Label>
              <Form.Select value={selectedMotivo} onChange={(e) => setSelectedMotivo(e.target.value)}>
                {motivos.map(motivo => (
                  <option key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </Form>
        <h5 className="text-center mt-3">Estadísticas</h5>
        {chartData.data && <Bar data={chartData.data} options={chartData.options} />}
      </Modal.Body>
      <Modal.Footer>
       
        <Button variant="success" onClick={handleFilter}>Filtrar</Button>
        <Button variant="secondary" onClick={downloadPDF}><i class='bx bx-download'></i> PDF</Button>
        <Button variant="danger" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReporteModal;
