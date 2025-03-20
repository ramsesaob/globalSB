import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';
import * as XLSX from 'xlsx';  // Importar para la exportación a Excel
import { jsPDF } from 'jspdf'; // Importar para la exportación a PDF

const IndexPersonDescuentos = () => {
  const [data, setData] = useState([]); // Para almacenar los datos de la API
  const [filters, setFilters] = useState({
    nombre: '',
    cedula: '',
    Galac_id: '',
    Suc_asignada: '',
    Sucursal_Inc: '',
    fechaDesde: moment().format('YYYY-MM-DD'),
    fechaHasta: moment().format('YYYY-MM-DD'),
  }); // Filtros
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext); 
  const [sucursales, setSucursales] = useState([]);

  // Cargar los datos de la API
  useEffect(() => {
    axios.get(`${apiBaseUrl}/descuento/persondesc.json`)
      .then(response => {
        setData(response.data.registros);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch de las sucursales de la API
    fetch(`${apiBaseUrl}/sucursal/sucursales.json`)
      .then(response => response.json())
      .then(data => {
        setSucursales(data.sucursales);  // Guardamos las sucursales en el estado
      })
      .catch(error => console.error('Error al cargar las sucursales:', error));
  }, []);  // Solo se ejecuta una vez al montar el componente

  // Función para actualizar los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Validar que las fechas no sean mayores que la fecha actual
  const validateDates = () => {
    const today = moment().format('YYYY-MM-DD');
    if (filters.fechaDesde && moment(filters.fechaDesde).isAfter(today)) {
      alert('La fecha "Desde" no puede ser mayor a la fecha actual.');
      setFilters(prevState => ({
        ...prevState,
        fechaDesde: ''
      }));
    }
    if (filters.fechaHasta && moment(filters.fechaHasta).isAfter(today)) {
      alert('La fecha "Hasta" no puede ser mayor a la fecha actual.');
      setFilters(prevState => ({
        ...prevState,
        fechaHasta: ''
      }));
    }
    if (filters.fechaDesde && filters.fechaHasta && moment(filters.fechaDesde).isAfter(filters.fechaHasta)) {
      alert('La fecha "Desde" no puede ser mayor que la fecha "Hasta".');
      setFilters(prevState => ({
        ...prevState,
        fechaDesde: ''
      }));
    }
  };

  useEffect(() => {
    validateDates();
  }, [filters.fechaDesde, filters.fechaHasta]);

  // Filtrar los datos según los filtros
  const filteredData = data.filter(item => {
    const itemFecha = moment(item.created).format('YYYY-MM-DD');
    const fechaDesdeValid = filters.fechaDesde ? moment(itemFecha).isSameOrAfter(filters.fechaDesde) : true;
    const fechaHastaValid = filters.fechaHasta ? moment(itemFecha).isSameOrBefore(filters.fechaHasta) : true;
    
    const sucAsigMatch = filters.Suc_asignada ? item.Suc_asignada.trim().toLowerCase().includes(filters.Suc_asignada.trim().toLowerCase()) : true;
  
    return (
      item.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
      item.cedula.includes(filters.cedula) &&
      item.Galac_id.toLowerCase().includes(filters.Galac_id.toLowerCase()) &&
      sucAsigMatch &&
      item.Sucursal_Inc.toLowerCase().includes(filters.Sucursal_Inc.toLowerCase()) &&
      fechaDesdeValid && fechaHastaValid
    );
  });

  const resetfilter = () => {
    setFilters({
      nombre: '',
      cedula: '',
      Galac_id: '',
      Suc_asignada: '',
      Sucursal_Inc: '',
      fechaDesde: moment().format('YYYY-MM-DD'),
      fechaHasta: moment().format('YYYY-MM-DD'),
    });
  };
  
  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Descuentos');
    XLSX.writeFile(wb, `descuentos_personales_tiendas(${moment().format('YYYY-MM-DD')}).xlsx`);
  };

  // Función para exportar a Excel 2
  const exportToExcel2 = () => {
    if (!filteredData || filteredData.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }
  
    const ws_data = [];
    let totalBolivares = 0; // Variable para almacenar la sumatoria de Bolivares
    const groupSucursal = [...new Set(filteredData.map(item => item.Suc_asignada))].join(", "); // Agrupamos las sucursales
    
    filteredData.forEach((item) => {
      const bolivares = parseFloat(item.Bolivares); // Sin toFixed() aquí
      totalBolivares += bolivares; // Acumulamos el total de Bolivares
  
      ws_data.push([
        'L',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'BP',
        `V${item.cedula}`,
        bolivares.toFixed(3).replace('.', ','), // Convertimos a formato con coma
        '',
        '',
        '',
        '',
        '',
        '',
        item.Suc_asignada,
      ]);
    });
  
    // Agregamos la fila final con "GL" y la sumatoria de Bolivares
    ws_data.push([
      'L',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'GL', // Cambiar BP a GL en la última fila
      '1.1.04.117',  // Cédula fija en la última fila
      '', // Dejar vacío el campo de Bolivares
      totalBolivares.toFixed(2).replace('.', ','), // Convertimos la sumatoria a formato con coma
      '',
      '',
      '',
      '',
      '',
      groupSucursal, // Colocamos las sucursales agrupadas
    ]);
  
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    const fileName = `descuentos_personales_tiendas(${moment().format('YYYY-MM-DD')}).xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  
  
  

  const exportToTxt = () => {
    if (!filteredData || filteredData.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }
  
    let txtData = '';
    let totalBolivares = 0; // Variable para la sumatoria de Bolivares
    const groupSucursal = [...new Set(filteredData.map(item => item.Suc_asignada))].join(", "); // Agrupamos las sucursales
    filteredData.forEach((item) => {
      const bolivares = parseFloat(item.Bolivares); // Sin toFixed() aquí
      totalBolivares += bolivares; // Sumamos los valores de Bolivares
  
      txtData += [
        'L',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'BP', // Colocamos BP en las filas normales
        `V${item.cedula}`,
        bolivares.toFixed(2).replace('.', ','), // Convertimos a coma
        '',
        '',
        '',
        '',
        '',
        '',
        item.Suc_asignada,
      ].join('\t') + '\n';
    });
   
    // Agregamos la fila final con GL y la sumatoria de Bolivares
    txtData += [
      'L',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'GL', // Cambiar BP a GL
      '1.1.04.117',  // Cédula fija en la última fila
      '', // Dejar vacío el campo de Bolivares
      totalBolivares.toFixed(2).replace('.', ','), // Mostrar la sumatoria de Bolivares
      '',
      '',
      '',
      '',
      '',
      groupSucursal,
    
    ].join('\t') + '\n';
    
  
    // Crear un Blob con el contenido del archivo .txt
    const blob = new Blob([txtData], { type: 'text/plain' });
  
    // Crear un enlace para descargar el archivo
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `descuentos_personales_tiendas(${moment().format('YYYY-MM-DD')}).txt`; // Nombre del archivo
    link.click();
  };
  
  
  
  

  return (
    <div className='container2'>
      <h1 className='text-center my-2'>Descuentos al Personal de Tiendas</h1>

      {/* Filtros */}
      <div className="row">
        <div className="d-flex flex-wrap justify-content-start my-2">
          <div className="col-12 col-md-1 mx-3 mb-3">
            <label className="fw-bold text-success">
              Nombre:
              <input
                className="form-control form-control-sm"
                type="text"
                name="nombre"
                value={filters.nombre}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <div className="col-12 col-md-1 mx-3 mb-3">
            <label className="fw-bold text-success">
              Cédula:
              <input
                className="form-control form-control-sm"
                type="text"
                name="cedula"
                value={filters.cedula}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <div className="col-12 col-md-1 mx-3 mb-3">
            <label className="fw-bold text-success">
              Codigo Galac:
              <input
                className="form-control form-control-sm"
                type="text"
                name="Galac_id"
                value={filters.Galac_id}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <div className="col-12 col-md-2 mx-3 mb-3">
            <label className="fw-bold text-success">
              Tienda Asignada:
              <select
                className="form-select form-select-sm"
                name="Suc_asignada"
                value={filters.Suc_asignada}
                onChange={handleFilterChange}
              >
                <option value="">Seleccione una tienda...</option>
                {sucursales.map((sucursal, index) => (
                  <option key={index} value={sucursal.nombre}>
                    {sucursal.nombre} ({sucursal.codigo})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="col-12 col-md-2 mx-3 mb-3">
            <label className="fw-bold text-success">
              Tienda de la Incidencia:
              <select
                className="form-select form-select-sm"
                name="Sucursal_Inc"
                value={filters.Sucursal_Inc}
                onChange={handleFilterChange}
              >
                <option value="">Seleccione una tienda...</option>
                {sucursales.map((sucursal, index) => (
                  <option key={index} value={sucursal.nombre}>
                    {sucursal.nombre} ({sucursal.codigo})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Filtro de Fechas */}
          <div className="col-12 col-md-1 mx-3 mb-3">
            <label className="fw-bold text-success">
              Fecha Desde:
              <input
                className="form-control form-control-sm"
                type="date"
                name="fechaDesde"
                value={filters.fechaDesde}
                onChange={handleFilterChange}
                max={moment().format('YYYY-MM-DD')}  // No puede ser mayor a hoy
              />
            </label>
          </div>

          <div className="col-12 col-md-1 mx-3 mb-2">
            <label className="fw-bold text-success">
              Fecha Hasta:
              <input
                className="form-control form-control-sm"
                type="date"
                name="fechaHasta"
                value={filters.fechaHasta}
                onChange={handleFilterChange}
                max={moment().format('YYYY-MM-DD')}  // No puede ser mayor a hoy
              />
            </label>
          </div>
          <div>
            <button className="btn btn-primary mx-1 my-1" onClick={resetfilter}>Limpiar</button>
          </div>
        </div>
      </div>


      {/* Botones para exportar */}
      <div className="my-2 flex-end">
        <button className="btn btn-success mx-1 my-1" onClick={exportToExcel}>Excel Dpto RRHH</button>
        <button className="btn btn-primary mx-1 my-1" onClick={exportToExcel2}>Excel Dpto Ingreso</button>
        <button className="btn btn-danger mx-1 my-1" onClick={exportToTxt}>TXT Dpto de Ingreso</button>
      </div>

      {/* Mostrar datos filtrados */}
      <div className='table-responsive d-flex justify-content-center'>
      <table className='table table-striped table-hover table-bordered table-sm table-responsive text-center mt-3'>
        <thead>
          <tr className='table-success'>
            <th>#</th>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Cod Galac</th>
            <th>Motivo</th>
            <th>Tienda Asignada</th>
            <th>Nombre Asignado</th>
            <th>Aprobado</th>
            <th>Código Artículo</th>
            <th>Precio Dolar</th>
            <th>Precio Bolivares</th>
            <th>Tasa del Día</th>
            <th>Cuotas</th>
            <th>Tienda Inc</th>
            <th>Cod Inc</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{moment(item.created).format('YYYY-MM-DD')}</td>
              <td>{item.nombre}</td>
              <td>{item.apellido}</td>
              <td>V{item.cedula}</td>
              <td>{item.Galac_id}</td>
              <td>{item.motivo}</td>
              <td>{item.Suc_asig}</td>
              <td>{item.Suc_asignada}</td>
              <td>{item.aprobado}</td>
              <td>{item.codigo_art}</td>
              <td>{parseFloat(item.dolar).toFixed(2)}$</td>
              <td>{parseFloat(item.Bolivares).toFixed(2)}Bs</td>
              <td>{item.tasa_del_dia}</td>
              <td>{item.cuotas}</td>
              <td>{item.Sucursal_Inc}</td>
              <td>{item.Descr}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default IndexPersonDescuentos;
