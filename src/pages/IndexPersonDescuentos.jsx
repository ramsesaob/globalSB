import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { carritoContext } from '../contexts/carritoContext';
import * as XLSX from 'xlsx';  // Importar para la exportación a Excel
import { jsPDF } from 'jspdf'; // Importar para la exportación a PDF
import Swal from 'sweetalert2';

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
  const [checkedItems, setCheckedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Cargar los datos de la API
const fetchData = async () => {
  try {
      let allRegistros = []; // Aquí vamos a almacenar todos los registros obtenidos de cada página
    let currentPage = 1; // Empezamos desde la página 1
    const limit = 1000; // O el límite que determines por página
    let totalRecords = 0;

    // Realizamos un ciclo para obtener todas las páginas de resultados
    while (true) {
      // Realizar la solicitud a la API con el número de página y el límite
      const response = await axios.get(`${apiBaseUrl}/descuento/persondesc.json`, {
        params: {
          page: currentPage,
          limit: limit,
        }
      });

      const registros = response.data.registros;
      totalRecords = response.data.total; // Total de registros disponibles
      allRegistros = [...allRegistros, ...registros]; // Agregar los registros de la página actual al array

      console.log(`Página ${currentPage} de ${Math.ceil(totalRecords / limit)} cargada...`);

      // Si ya se han obtenido todos los registros (es decir, la cantidad de registros obtenidos es igual al total), salir del ciclo
      if (allRegistros.length >= totalRecords) {
        console.log('Todos los registros han sido obtenidos.');
        break;
      }

      // Avanzar a la siguiente página
      currentPage++;
    }

    // Filtrado por roles de usuario después de haber obtenido todos los registros
    const role = datosUsuario.user.role;
    const sucursal = datosUsuario.user.sucursale?.descripcion || '';

    let filteredPedidos = []; // Crear la variable fuera del filtro para ir agregando resultados

    // Filtrado por roles de usuario antes de aplicar otros filtros
    if (role === 'admin') {
      filteredPedidos = allRegistros; // El admin ve todas las órdenes
    } else if (role === 'user1') {
      filteredPedidos = allRegistros.filter(orden => orden.Suc_asig === sucursal); // Filtrar por descripción de la sucursal
    } else if (role === 'user2') {
      filteredPedidos = allRegistros; // 'user2' ve todas las órdenes
    } else if (role === 'user5') {
      filteredPedidos = allRegistros; // 'user5' ve todas las órdenes
    } else if (role === 'user7') {
      filteredPedidos = allRegistros; // 'user7' ve todas las órdenes
    } else if (role === 'user3') {
      filteredPedidos = allRegistros.filter(orden => orden.Suc_asig === sucursal); // Filtrar por descripción de la sucursal
    } else if (role === 'gerente') {
      filteredPedidos = allRegistros.filter(orden => orden.Suc_asig === sucursal); // Filtrar por descripción de la sucursal
    } else if (role === 'user6') {
      filteredPedidos = allRegistros.filter(orden => orden.Suc_asig === sucursal); // Filtrar por descripción de la sucursal
    } else {
      filteredPedidos = allRegistros.filter(orden => orden.user_id === datosUsuario.user.id); // Por defecto, solo ve sus propias órdenes
    }

    setData(filteredPedidos); // Actualiza el estado con los datos filtrados por rol

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  
  // Llamar a fetchData cuando el componente se monta
  useEffect(() => {
    fetchData(); // Llamada inicial para cargar los datos
  }, []); // Solo se ejecuta una vez al montar el componente
  
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
  
  // Filtrado adicional sobre los datos de la API
  const filteredData = data.filter(item => {
    const itemFecha = moment(item.created).format('YYYY-MM-DD');
    const fechaDesdeValid = filters.fechaDesde ? moment(itemFecha).isSameOrAfter(filters.fechaDesde) : true;
    const fechaHastaValid = filters.fechaHasta ? moment(itemFecha).isSameOrBefore(filters.fechaHasta) : true;
  
    const sucAsigMatch = filters.Suc_asignada ? item.Suc_asignada?.trim().toLowerCase().includes(filters.Suc_asignada.trim().toLowerCase()) : true;
  
    const nombreMatch = filters.nombre && item.nombre ? item.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) : true;
    const galacIdMatch = filters.Galac_id && item.Galac_id ? item.Galac_id.toLowerCase().includes(filters.Galac_id.toLowerCase()) : true;
    const sucursalIncMatch = filters.Sucursal_Inc && item.Sucursal_Inc ? item.Sucursal_Inc.toLowerCase().includes(filters.Sucursal_Inc.toLowerCase()) : true;
  
    // Filtrado por rol (si es necesario para los filtros adicionales)
    const { role } = datosUsuario.user;
    let roleMatch = true;  // Por defecto, permitimos que todos los datos sean visibles
  
    if (role === 'user5') {
      roleMatch = item.verificado_rrhh !== '1';
    }
    if (role === 'user7') {
      roleMatch = item.verificado_ingreso !== '1';
    }
    if (role === 'user8') {
      roleMatch = item.verficado_ctpp !== '1';
    }
  
    return (
      nombreMatch &&
      item.cedula.includes(filters.cedula) &&
      galacIdMatch &&
      sucAsigMatch &&
      sucursalIncMatch &&
      fechaDesdeValid && fechaHastaValid &&
      roleMatch
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

  const handleSelectAll = () => {
    setSelectAll((prevSelectAll) => {
      const newCheckedState = {};
      filteredData.forEach(item => {
        newCheckedState[item.id] = !prevSelectAll;  // Cambiar el estado de todos los checkboxes
      });
      setCheckedItems(newCheckedState);
      return !prevSelectAll;  // Invertir el estado de "Seleccionar todos"
    });
  };
  
  
  
  // Función para manejar el cambio de cada checkbox individual
  const handleCheckboxChange = (id) => {
    setCheckedItems((prevCheckedItems) => {
      const updatedCheckedItems = { ...prevCheckedItems, [id]: !prevCheckedItems[id] };
      
      // Verificar si todos los checkboxes están seleccionados
      const allChecked = filteredData.every(item => updatedCheckedItems[item.id]);
      setSelectAll(allChecked);  // Actualiza el estado de "Seleccionar todos" según el estado de los checkboxes
      return updatedCheckedItems;
    });
  };
  
  
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
    const groupSucursalcod = [...new Set(filteredData.map(item => item.cod_suc_asignada))].join(", "); // Agrupamos las sucursales
  
    filteredData.forEach((item) => {
      const bolivares = parseFloat(item.Bolivares); // Sin toFixed() aquí
      totalBolivares += bolivares; // Acumulamos el total de Bolivares
      
      // Convertimos la fecha a un formato de texto 'YYYY-MM-DD'
      const fechaTexto = moment(item.created).format('YYYY-MM-DD'); // Formateamos la fecha como texto
  
      ws_data.push([
        'L',
        '', '', '', '', '', '', '', '', '', '', '',
        'BP',
        `V${item.cedula} `,
        bolivares.toFixed(3).replace('.', ','), // Convertimos a formato con coma
        '', '', 
        `${item.cod_suc_asignada} ${moment().format('YYYY-MM-DD')} INSUFICIENCIA`, 
        '', '', '', '',
        item.Suc_asignada,
        fechaTexto // Agregamos la fecha formateada como texto
      ]);
    });
  
    // Agregamos la fila final con "GL" y la sumatoria de Bolivares
    ws_data.push([
      'L',
      '', '', '', '', '', '', '', '', '', '', '',
      'GL', // Cambiar BP a GL en la última fila
      '1.1.07.010',  // Cédula fija en la última fila
      '', // Dejar vacío el campo de Bolivares
      totalBolivares.toFixed(2).replace('.', ','), // Convertimos la sumatoria a formato con coma
      '', 
      `${groupSucursalcod} ${moment().format('YYYY-MM-DD')} INSUFICIENCIA`, 
      '', '', '', '',
      groupSucursal, // Colocamos las sucursales agrupadas
      moment().format('YYYY-MM-DD') // Fecha de hoy en formato texto
    ]);
  
    // Convertir los datos en una hoja de trabajo de Excel
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
    // Crear un nuevo libro de trabajo y agregar la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // Generar el archivo de Excel con el nombre adecuado
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
      totalBolivares += bolivares; // Acumulamos el total de Bolivares
      
      // Convertimos la fecha a un formato de texto 'YYYY-MM-DD'
      const fechaTexto = moment(item.created).format('YYYY-MM-DD'); // Formateamos la fecha como texto
  
      // Agregamos los datos de cada fila separándolos con tabuladores
      txtData += [
        'L',
        '', '', '', '', '', '', '', '', '', '', '',
        'BP',
        `V${item.cedula}`,
        bolivares.toFixed(3).replace('.', ','), // Convertimos a formato con coma
        '', '', '', '', '', '', '',
        item.Suc_asignada,
        fechaTexto // Agregamos la fecha formateada como texto
      ].join('\t') + '\n';
    });
  
    // Agregamos la fila final con "GL" y la sumatoria de Bolivares
    txtData += [
      'L',
      '', '', '', '', '', '', '', '', '', '', '',
      'GL', // Cambiar BP a GL en la última fila
      '1.1.07.010',  // Cédula fija en la última fila
      '', // Dejar vacío el campo de Bolivares
      totalBolivares.toFixed(2).replace('.', ','), // Convertimos la sumatoria a formato con coma
      '', '', '', '', '', '',
      groupSucursal, // Colocamos las sucursales agrupadas
      moment().format('YYYY-MM-DD') // Fecha de hoy en formato texto
    ].join('\t') + '\n';
  
    // Crear un Blob con el contenido del archivo .txt
    const blob = new Blob([txtData], { type: 'text/plain' });
  
    // Crear un enlace para descargar el archivo
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `descuentos_personales_tiendas(${moment().format('YYYY-MM-DD')}).txt`; // Nombre del archivo con extensión .txt
    link.click();
  };
  
  
  
  

  const exportToExcel3 = () => {
    if (!filteredData || filteredData.length === 0) {
      console.error('No hay datos para exportar.');
      return;
    }
  
    const ws_data = [];
    let totalBolivares = 0; // Variable para almacenar la sumatoria de Bolivares
  
    filteredData.forEach((item) => {
      const bolivares = parseFloat(item.Bolivares); // Aseguramos que Bolivares es un número
      console.log("Bolivares:", bolivares);
      const cuotas = parseFloat(item.cuotas); // Aseguramos que Cuotas es un número
      totalBolivares += bolivares; // Acumulamos el total de Bolivares
  
      // Obtener el código de empresa y código de nómina de la sucursal correspondiente
      const sucursalData = sucursales.find(s => s.nombre === item.Suc_asignada);
      const codigo_empresa = sucursalData?.codigo_empresa || 'default_value';
      const codigo_nomina = sucursalData?.codigo_nomina || 'default_value';
  
      // Verificar que la división no sea por 0 para evitar errores
      const bolviresmult= bolivares.toFixed(2) * 100;
      const divisionBolivaresCuotas = cuotas !== 0 ? ((bolviresmult / cuotas) ) : '0';
     
      console.log("bolviresmult:", bolviresmult);
      // Agregar los datos al array
      ws_data.push([
        codigo_empresa,
        codigo_nomina,
        item.Galac_id,
        moment(item.created).format('DDMMYYYY'),
        '2034',
        bolviresmult, // Convertimos a formato con coma
        divisionBolivaresCuotas, // Dividido por cuotas
        'personal',
      ]);
    });
  
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    const fileName = `descuentos_personales_tiendas(${moment().format('YYYY-MM-DD')}).xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  
  
  
  

  const handleSendData = async () => {
    const selectedIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
  
    // Si no hay elementos seleccionados, mostramos un mensaje de advertencia
    if (selectedIds.length === 0) {
      Swal.fire('Por favor, seleccione al menos un descuento.');
      return;
    }
  
    // Obtener el ID y el rol del usuario
    const userId = datosUsuario.user.id;
    const userRole = datosUsuario.user.role;
  
    // Confirmación de envío
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres enviar estos descuentos?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });
  
    if (!result.isConfirmed) {
      return;  // Si el usuario cancela, no hacer nada
    }
  
    const dataToSend = {
      selectedIds,  // IDs de los elementos seleccionados
      filters,      // Filtros aplicados
      userId,       // ID del usuario
      userRole,     // Rol del usuario
    };
  
    try {
      const response = await axios.post(
        `${apiBaseUrl}/descuento/aprobaringreso.json`, 
        dataToSend, 
        {
          headers: {
            'Content-Type': 'application/json', // Aseguramos que el tipo de contenido es JSON
          },
        }
      );
  
      // Mostrar mensaje de éxito con SweetAlert2
      await Swal.fire({
        title: '¡Éxito!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
  
      // Limpiar los select y checkboxes después de enviar
      setFilters({
        nombre: '',
        cedula: '',
        Galac_id: '',
        Suc_asignada: '',
        Sucursal_Inc: '',
        fechaDesde: moment().format('YYYY-MM-DD'),
        fechaHasta: moment().format('YYYY-MM-DD'),
      });
      setCheckedItems({});
      setSelectAll(false);
  
      // Recargar los datos después de enviar
      fetchData();  // Esto recargará los datos después de enviar correctamente.
  
      console.log("Datos enviados correctamente:", response.data);
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert('Hubo un error al procesar la solicitud.');
    }
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
          {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
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
          )}
           {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
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
          )}

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
    {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
      <div className="my-2 flex-end">
        <button className="btn btn-success mx-1 my-1" onClick={exportToExcel}><i className='bx bxs-file bx-sm'></i> Excel Dpto RRHH <i class='bx bx-download bx-sm'></i></button>
        <button className="btn btn-danger mx-1 my-1" onClick={exportToExcel3}><i class='bx bxs-file-txt bx-sm'></i> TXT Dpto de RRHH <i class='bx bx-download bx-sm'></i></button>
        <button className="btn btn-success mx-1 my-1" onClick={exportToExcel2}><i className='bx bxs-file bx-sm'></i> Excel Dpto Ingreso <i class='bx bx-download bx-sm'></i></button>
    {/* <button className="btn btn-danger mx-1 my-1" onClick={exportToTxt}>TXT Dpto de Ingreso</button>*/} 
      </div>
    )}

     

      {/* Mostrar datos filtrados */}
      <div className='table-responsive d-flex justify-content-center'>
      <table className='table table-striped table-hover table-bordered table-sm table-responsive text-center mt-3'>
        <thead>
          <tr className='table-success'>
            <th>#</th>
            {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
            <th>
               <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                Procesado
            </th> 
            )} 
            <th>Fecha</th>
            {(datosUsuario.user.role === 'user2' ) && (
            <th>
               N de Orden
            </th> 
            )} 
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
              <tr key={item.id}>
                <td>{index + 1}</td>
                {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
                <td>
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                )}
              <td>{moment(item.created).format('YYYY-MM-DD')}</td>
              {(datosUsuario.user.role === 'user2' ) && (
            <th>
             {item.nsolicitud}
            </th> 
            )} 
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

      {(datosUsuario.user.role === 'user5' || datosUsuario.user.role === 'user7') && (
        <div className="my-2 flex-center justify-content-center d-flex ">
        <button className="btn btn-success mx-1 my-1" onClick={handleSendData}>Enviar</button>
     </div>
      )}
    
    


    </div>
  );
};

export default IndexPersonDescuentos;
