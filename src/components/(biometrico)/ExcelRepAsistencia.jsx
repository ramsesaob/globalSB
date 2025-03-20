import React from 'react';
import * as XLSX from 'xlsx'; // Importar la librería para generar el Excel

const ExcelRepAsistencia = ({ registros }) => {
  // Función para exportar los datos a Excel
  const exportToExcel = () => {
    // Crear un objeto de libro de trabajo (workbook)
    const wb = XLSX.utils.book_new();

    // Convertir los registros a una hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(registros);

    // Añadir la hoja al libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");

    // Crear un archivo Excel y disparar la descarga
    XLSX.writeFile(wb, "Reporte_Asistencia.xlsx");
  };

  return (
    <div>
      <button className="btn btn-success" title="Descargar Excel" onClick={exportToExcel}>
        <i className="bx bxs-file"></i>Excel <i className="bx bxs-download"></i>
      </button>
    </div>
  );
};

export default ExcelRepAsistencia;
