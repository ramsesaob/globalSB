import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx'; // Importamos la librería xlsx
import { jsPDF } from 'jspdf'; // Importamos jsPDF

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
    XLSX.writeFile(wb, `registros_asistencia_${registros[0]?.person_name}.xlsx`);
  };
//console.log(registros)
  // Función para exportar a PDF



  const exportToPDF = () => {
    // Crear el documento en formato horizontal (landscape)
    const doc = new jsPDF('landscape'); // Orientación horizontal
  
    // Configuración de márgenes
    const marginLeft = 20; // Margen izquierdo ajustado
    const marginRight = 20; // Margen derecho ajustado
    const marginTop = 20; // Margen superior
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    // Datos adicionales para mostrar debajo del título
    const produceName = "HikCentral Professional";
    const softVersion = "V2.5.0.0";
  
    // Configuración de fuentes
    doc.setFont('helvetica', 'normal');
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Color negro
    doc.text(`Reporte de Asistencia de ${registros[0]?.NOMBRE} ${registros[0]?.APELLIDO}`, marginLeft, marginTop + 10);
    
    // Subtítulo con rango de fechas
    doc.setFontSize(12);
    doc.text(`Desde: ${registros[0]?.date} Hasta: ${registros[registros.length - 1]?.date}`, marginLeft, marginTop + 20);
  
    // Agregar el nombre del producto y versión debajo del título
    doc.setFontSize(10);
    doc.text(`Producto: ${produceName}`, marginLeft, marginTop + 30);
    doc.text(`Versión: ${softVersion}`, marginLeft, marginTop + 40);
  
    // Línea horizontal después del título
    doc.setDrawColor(0);
    doc.line(marginLeft, marginTop + 42, pageWidth - marginRight, marginTop + 42);
  
    // Configuración de la tabla
    const tableStartY = marginTop + 50; // Empieza un poco después de la línea horizontal
    const headers = ['Nombre', 'Fecha', 'Cédula', 'Sucursal', 'Día', 'Hora Entrada', 'Hora Salida'];
    const columnWidths = [30, 35, 30, 30, 30, 35, 35]; // Ancho de cada columna
  
    // Datos de la tabla
    const tableData = registros.map(registro => [
      registro.person_name || 'DIA AUSENTE',
      registro.date || 'No disponible',
      registro.CEDULA || 'No disponible',
      registro.device_name || 'No disponible',
      obtenerDiaSemana(registro.date) || 'No disponible',
      registro.entry_time || 'DIA AUSENTE',
      registro.exit_time || 'DIA AUSENTE',
    ]);
  
    // Cálculo de los días ausentes y días laborados
    let diasAusentes = 0;
    let diasLaborados = 0;
  
    registros.forEach(registro => {
      if (!registro.entry_time || !registro.exit_time) {
        diasAusentes++; // Si no hay hora de entrada o salida, es un día ausente
      } else {
        diasLaborados++; // Si hay entrada y salida, es un día laborado
      }
    });
  
    // Usamos la librería jsPDF AutoTable para generar la tabla
    doc.autoTable({
      startY: tableStartY,
      head: [headers],
      body: tableData,
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
        3: { cellWidth: columnWidths[3] },
        4: { cellWidth: columnWidths[4] },
        5: { cellWidth: columnWidths[5] },
        6: { cellWidth: columnWidths[6] },
      },
      theme: 'grid', // Estilo de la tabla: con líneas
      headStyles: {
        fillColor: [0, 51, 102], // Color de fondo de la cabecera
        textColor: 255, // Color del texto de la cabecera (blanco)
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0, // Color del texto de las celdas (negro)
      },
      margin: { top: marginTop + 25, left: marginLeft, right: marginRight },
      didDrawPage: (data) => {
        // Asegurarse de que la tabla no se desborde de la página
        const pageHeightAvailable = pageHeight - data.cursorY - 10;
        if (pageHeightAvailable < 30) {
          doc.addPage();
        }
      },
    });
  
    // Añadir el total de días laborados y ausentes al final
    const totalStartY = doc.lastAutoTable.finalY + 10; // Justo debajo de la tabla
  
    doc.setFontSize(12);
    doc.text(`Total de días ausentes: ${diasAusentes}`, marginLeft, totalStartY);
    doc.text(`Total de días laborados: ${diasLaborados}`, marginLeft, totalStartY + 10);
  
    // Descargar el PDF
    doc.save(`registros_asistencia_${registros[0]?.person_name}.pdf`);
  };
  

  return (
    <Modal size="lg" centered show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title className='text-center'>
          Detalles de Asistencia de {registros[0]?.person_name} desde {registros[0]?.date} hasta {registros[registros.length - 1]?.date}
        </Modal.Title>
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
          <i className="bx bxs-file"></i> Excel <i className="bx bxs-download"></i>
        </Button>
        <Button variant="primary" onClick={exportToPDF} className='d-flex align-items-center'>
          <i className="bx bx-file"></i> PDF <i className="bx bxs-download"></i>
        </Button>
        <Button variant="danger" onClick={() => setShowModal(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleAsisMod;
