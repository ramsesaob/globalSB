import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx'; // Importamos la librería xlsx

const DetalleAsisMod = ({ showModal, setShowModal, registros }) => {
  const [showModalExcel, setShowModalExcel] = useState(false);

  const obtenerDiaSemana = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const date = new Date(fecha + 'T00:00:00Z'); // Aseguramos que la fecha sea tratada en UTC
    return dias[date.getUTCDay()]; // Usamos getUTCDay() para obtener el día de la semana en UTC
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(registros.map(registro => ({
      Nombre: registro.person_name || 'DIA AUSENTE',
      Fecha: registro.date || 'No disponible',
      Cedula: registro.CEDULA || 'No disponible',
      SucursalMarcada: registro.device_name || 'No disponible',
      Dia: obtenerDiaSemana(registro.date) || 'No disponible',
      HoraEntrada: registro.entry_time || 'DIA AUSENTE',
      HoraSalida: registro.exit_time || 'DIA AUSENTE',
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

    // Guardar el archivo Excel
    XLSX.writeFile(wb, `registros_asistencia${registros[0]?.person_name}.xlsx`);
  };

  return (
    <Modal size="lg" centered show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title className='text-center'>Detalles de Asistencia de {registros[0]?.person_name} desde {registros[0]?.date} hasta {registros[registros.length - 1]?.date}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {registros.length === 0 ? (
          <p>No hay registros disponibles.</p>
        ) : (
          <table className="table table-striped table-hover table-bordered text-center">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Cédula</th>
                <th>Sucursal Marcada</th>
                <th>Dia</th>
                <th>Hora Entrada</th>
                <th>Hora Salida</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro, index) => {
                const isAbsent = !registro.entry_time || !registro.exit_time;
                const isAbsent2 = registro.entry_time === registro.exit_time;

                const rowClass = `${isAbsent ? 'table-danger' : 'table-success'} ${isAbsent2 ? 'table-warning' : ''}`;

                return (
                  <tr key={index} className={rowClass}>
                    <td>{registro.person_name || 'DIA AUSENTE'}</td>
                    <td>{registro.date || 'No disponible'}</td>
                    <td>{registro.CEDULA || 'No disponible'}</td>
                    <td>{registro.device_name || 'No disponible'}</td>
                    <td>{obtenerDiaSemana(registro.date) || 'No disponible'}</td>
                    <td>{registro.entry_time || 'DIA AUSENTE'}</td>
                    <td>{registro.exit_time || 'DIA AUSENTE'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Modal.Body>
      <Modal.Footer>
      <Button variant="success" onClick={exportToExcel} className='d-flex align-items-center'>
        <i className="bx bxs-file"></i>Excel <i className="bx bxs-download"></i>
        </Button>
        <Button variant="danger" onClick={() => setShowModal(false)}>
          Cerrar
        </Button>
        
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleAsisMod;
