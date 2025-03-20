import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Asegúrate de importar XLSX correctamente


const ExcelBiometrico = ({ data, obtenerDiaSemana, calcularHorasTrabajadas }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    const sortableItems = [...data];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  const exportToExcel = () => {
    const headers = [
      'ID', 'Cédula', 'Nombre', 'Sucursal', 'Fecha', 'Día', 'Hora Entrada', 'Hora Salida',  'Horas Trabajadas', 'Sucursal Asignada', 'Departamento'
    ];
    const rows = data.map(item => [
      item.id_galac, item.id, item.person_name, item.device_name, item.date,
      obtenerDiaSemana(item.date), item.entry_time, item.exit_time, 
      calcularHorasTrabajadas(item.entry_time, item.exit_time), item.Suc_asiganda, item.orgName
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    XLSX.writeFile(wb, 'Registros.xlsx');
  };

  return (
    <div>
      <button className="btn btn-success" title='Descargar Excel' onClick={exportToExcel}><i className='bx bxs-file'></i>Excel <i className='bx bxs-download'></i></button>
    </div>
  );
};

export default ExcelBiometrico;
