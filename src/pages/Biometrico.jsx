import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap'; // Usamos React Bootstrap para el modal
import FilterModal from '../components/(biometrico)/FilterModal';
import ExcelBiometrico from '../components/(biometrico)/ExcelBiometrico';
import logo2 from '../assets/logo2.png';
import { useContext } from "react";
import { carritoContext } from "../contexts/carritoContext";

const Biometrico = () => {
  const [data, setData] = useState([]);  // Datos originales sin filtrar
  const [filteredData, setFilteredData] = useState([]);  // Datos filtrados
  const [entryCounts, setEntryCounts] = useState({}); // Datos de entradas por sucursal y fecha
  const [filters, setFilters] = useState({
    group: '',
    name: '',
    dateFrom: '', // Fecha desde
    dateTo: '',   // Fecha hasta
    deviceName: '', // Sucursal
    department: '', // Departamento
    id_galac: '',
    id: ''
  });
  const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal de filtros
  // Listas para los selects de Sucursal y Departamento
  const [deviceNames, setDeviceNames] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sucursal, setsucursal] = useState([]);
  // Función para obtener el nombre del día de la semana
  const obtenerDiaSemana = (fecha) => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  // Convertimos la fecha al formato 'YYYY-MM-DD' y luego a un objeto Date en UTC
  const date = new Date(fecha + 'T00:00:00Z'); // Aseguramos que la fecha sea tratada en UTC
    return dias[date.getUTCDay()]; // Usamos getUTCDay() para obtener el día de la semana en UTC
  };
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const getUrlParams = () => new URLSearchParams(window.location.search);

  //console.log(deviceNames);
 //console.log('entryCounts:', entryCounts);
 //console.log('data:', data);
 
 const groupBySucursal = (data, key) => {
  return data.reduce((result, item) => {
    // Usamos el campo especificado (device_name o Suc_asiganda)
    const sucursalKey = item[key];
    if (!result[sucursalKey]) {
      result[sucursalKey] = [];
    }
    result[sucursalKey].push(item);
    return result;
  }, {});
};


// El uso de useEffect para obtener los datos filtrados.
 
useEffect(() => {
  const urlParams = getUrlParams();
  const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato 'YYYY-MM-DD'

  // Configuración de los filtros
  setFilters((prevFilters) => ({
    ...prevFilters,
    dateFrom: today, // Fecha de inicio es el día de hoy
    dateTo: today,   // Fecha de fin es el día de hoy
    deviceName: urlParams.get('device_name') || '',
    id_galac: urlParams.get('id_galac') || '',
    name: urlParams.get('name') || '',
    id: urlParams.get('id') || '',
    Suc_asiganda: datosUsuario?.user?.role === 'user6' || datosUsuario?.user?.role === 'gerente'
      ? datosUsuario?.user?.sucursale?.descripcion || '' // Usar el código de sucursal si el usuario es 'user6'
      : urlParams.get('Suc_asiganda') || '', // Usar el valor de URL o vacío
  }));
}, [datosUsuario]); // Se ejecuta cuando 'datosUsuario' cambia

// El uso de useEffect para obtener los datos filtrados
useEffect(() => {
  // Solo proceder si tenemos filtros de fecha válidos
  if (!filters.dateFrom || !filters.dateTo) return;

  const params = new URLSearchParams(filters);

  // Construir la URL completa
  const url = `${apiBaseUrl}/biometrico/all.json?${params.toString()}`;

  // Imprimir la URL en la consola
  console.log('URL de la solicitud:', url);
  fetch(`${apiBaseUrl}/biometrico/all.json?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      const registros = data.registros || [];

      if (Array.isArray(registros)) {
        setData(registros);

        // Filtrar los datos por fechas
        let filteredData = registros.filter(item => {
          const itemDate = item.date;
          return itemDate >= filters.dateFrom && itemDate <= filters.dateTo;
        });

        // Filtrar según `deviceName` y `filterBy`
        if (filters.deviceName) {
          if (filters.filterBy === 'device_name') {
            filteredData = filteredData.filter(item =>
              item.device_name?.toLowerCase().includes(filters.deviceName.toLowerCase())
            );
          }
        }

        // Filtrar por `id_galac` y `id`
        if (filters.id_galac) {
          filteredData = filteredData.filter(item =>
            item.id_galac?.toLowerCase().includes(filters.id_galac.toLowerCase())
          );
        }

        if (filters.id) {
          filteredData = filteredData.filter(item =>
            item.id?.toLowerCase().includes(filters.id.toLowerCase())
          );
        }

        // Filtrar según el rol del usuario (si es 'user6')
        if (datosUsuario?.user.role === 'user6') {
          filteredData = filteredData.filter(item => Number(item.id_sucursal) === Number(datosUsuario.user.sucursale_id));
        }

        // Agrupar las sucursales solo si no se ha seleccionado una sucursal
        if (!deviceNames.length) {
          const agrupadas = groupBySucursal(filteredData, 'device_name');
          setDeviceNames(agrupadas);
        }

        setFilteredData(filteredData);

        // Recalcular el conteo de entradas por sucursal y fecha
        const countMap = {};
        filteredData.forEach((item) => {
          const key = `${item.device_name}-${item.date}`;
          countMap[key] = (countMap[key] || 0) + 1;
        });
        setEntryCounts(countMap); // Actualizar el conteo de entradas
      } else {
        console.error('La respuesta no contiene un array válido en "registros".', data);
      }
    })
    .catch((err) => console.error('Error fetching data:', err));
}, [filters, datosUsuario]); // Re-calcular cuando los filtros o los datos del usuario cambien
console.log('registros:', data);
//console.log('deviceNames:', deviceNames);
  // Establecer la fecha hasta por defecto como la fecha actual
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato 'YYYY-MM-DD'
    setFilters((prevFilters) => ({
      ...prevFilters,
      dateTo: today, // Establecer la fecha "hasta" por defecto
      dateFrom: today, 
    }));
  }, []);
  
  // Función para aplicar los filtros
  const applyFilters = () => {
    let filtered = [...data];
  
    // Filtrar por nombre de persona
    if (filters.name) {
      filtered = filtered.filter(item =>
        item.person_name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
  
    // Filtrar por fecha
    if (filters.dateFrom) {
      filtered = filtered.filter(item => item.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => item.date <= filters.dateTo);
    }
  
    // Filtrar por dispositivo o sucursal
    if (filters.deviceName) {
      if (filters.filterBy === 'device_name') {
        // Filtrar por la sucursal marcada (device_name)
        filtered = filtered.filter(item =>
          item.device_name?.toLowerCase().includes(filters.deviceName.toLowerCase())
        );
      } else if (filters.filterBy === 'Suc_asiganda') {
        // Filtrar por la sucursal asignada (Suc_asiganda)
        filtered = filtered.filter(item =>
          item.Suc_asiganda?.toLowerCase().includes(filters.deviceName.toLowerCase())
        );
      }
    }
  
    // Filtrar por ID Galac
    if (filters.id_galac) {
      filtered = filtered.filter(item =>
        item.id_galac?.toLowerCase().includes(filters.id_galac.toLowerCase())
      );
    }
  
    // Filtrar por ID
    if (filters.id) {
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(filters.id.toLowerCase())
      );
    }
  
    // Si es el rol user6, filtrar solo por la sucursal del usuario
    if (datosUsuario?.user?.role === 'user6') {
      filtered = filtered.filter(item => Number(item.id_sucursal) === Number(datosUsuario.user.sucursale_id));
    }
  
    // Ordenar por fecha de entrada más reciente
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    setFilteredData(filtered);
    setShowModal(false); // Cerrar el modal de filtros
  };
  
  
  
  
  // Función para resetear los filtros
  const resetFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilters({
      name: '',
      dateFrom: today,
      dateTo: today,
      deviceName: '',
      department: '',
      id_galac: '',
      id: '',
      Suc_asiganda: datosUsuario?.user?.role === 'user6'
      ? datosUsuario?.user?.sucursale?.descripcion || '' // Usar el código de sucursal si el usuario es 'user6'
      : '',
    });
  
    setFilteredData(data.filter(item => item.date === today)); // Resetear la data a los registros del día actual
  };
  
  


  // Función para calcular las horas trabajadas
  const calcularHorasTrabajadas = (entryTime, exitTime) => {
    const entrada = new Date(`1970-01-01T${entryTime}Z`);
    const salida = new Date(`1970-01-01T${exitTime}Z`);

    const diferencia = salida - entrada;
    const horas = Math.floor(diferencia / 1000 / 60 / 60);
    const minutos = Math.floor((diferencia / 1000 / 60) % 60);

    return `${horas}h ${minutos}m`;
  };

  // Función para manejar la actualización de datos

  const handleUpdate = () => {
    const params = new URLSearchParams(filters);  // Usamos los filtros actuales
  
    fetch(`${apiBaseUrl}/biometrico/all.json?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        const registros = data.registros || [];
  
        if (Array.isArray(registros)) {
          setData(registros);
  
          // Filtrar los registros según el rol del usuario (si es 'user6')
          let filteredData = [...registros]; // Asegúrate de crear una copia de los registros
  
          if (datosUsuario?.user.role === 'user6') {
            filteredData = filteredData.filter(item => Number(item.id_sucursal) === Number(datosUsuario.user.sucursale_id));
          }
  
          // Aplicar filtros de fecha
          filteredData = filteredData.filter(item => {
            const itemDate = item.date;
            return itemDate >= filters.dateFrom && itemDate <= filters.dateTo;
          });
  
          // Filtrar por nombre de sucursal (deviceName)
          if (filters.deviceName) {
            filteredData = filteredData.filter(item => 
              item.device_name?.toLowerCase().includes(filters.deviceName.toLowerCase())
            );
          }
  
          // Filtrar por id_galac
          if (filters.id_galac) {
            filteredData = filteredData.filter(item => 
              item.id_galac?.toLowerCase().includes(filters.id_galac.toLowerCase())
            );
          }
  
          // Filtrar por id
          if (filters.id) {
            filteredData = filteredData.filter(item => 
              item.id?.toLowerCase().includes(filters.id.toLowerCase())
            );
          }
  
          setFilteredData(filteredData);
  
          // Recalcular el conteo de entradas por sucursal y fecha
          const countMap = {};
          filteredData.forEach((item) => {
            const key = `${item.device_name}-${item.date}`;
            countMap[key] = (countMap[key] || 0) + 1;
          });
          setEntryCounts(countMap); // Actualizar el conteo de entradas
        } else {
          console.error('La respuesta no contiene un array válido en "registros".', data);
        }
      })
      .catch((err) => console.error('Error fetching data:', err));
  };
  

  

  const [sortConfig, setSortConfig] = useState({
    key: 'date',  // Columna por la que se ordenará inicialmente
    direction: 'desc',  // Orden descendente por defecto
  });

  const parseTime = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds; // Devuelve el tiempo total en segundos
  };

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  useEffect(() => {
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = sortConfig.key === 'worked_hours' ? calcularHorasTrabajadas(a.entry_time, a.exit_time) : a[sortConfig.key];
      const bValue = sortConfig.key === 'worked_hours' ? calcularHorasTrabajadas(b.entry_time, b.exit_time) : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  }, [sortConfig]);

//console.log(deviceNames)
  return (
    <div className="container">
      <div className="d-flex justify-content-between py-1">
        <div>
          <img src={logo2} alt="logo" width={60} />
        </div>
        <div className="text-center flex-grow-1">
          <h1 className="title py-2">Incidencias Biometricas General</h1>
        </div>
        <div>
          <img src={logo2} alt="logo" width={60} />
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
         {/* Tabla de entradas por sucursal y fecha */}
         <table className="table table-bordered text-center table-sm">
  <thead>
    <tr>
      <th>Sucursal</th>
      <th>Fecha</th>
      <th>Entradas</th>
    </tr>
  </thead>
  <tbody>
    {Object.keys(entryCounts)
      .map((key) => {
        const parts = key.split('-');
        // Verificar que la clave tiene el formato esperado (4 partes)
        if (parts.length === 4) {
          const deviceName = parts[0];  // Nombre del dispositivo (por ejemplo, C09, MB03)
          const year = parts[1];        // Año (2024)
          const month = parts[2];       // Mes (11)
          const day = parts[3];         // Día (28)

          // Construir la fecha completa en formato YYYY-MM-DD
          const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const entryCount = entryCounts[key]; // Obtener el conteo de entradas para esta clave

          return {
            deviceName,
            fullDate,
            entryCount,
          };
        }
        return null; // Si no tiene 4 partes, no renderizar nada
      })
      .filter(Boolean)  // Eliminar valores null
      .sort((a, b) => a.deviceName.localeCompare(b.deviceName))  // Ordenar por nombre de dispositivo (sucursal)
      .map(({ deviceName, fullDate, entryCount }, index) => (
        <tr key={index}>
          <td>{deviceName}</td>
          <td>{fullDate}</td>
          <td>{entryCount}</td>
        </tr>
      ))}
  </tbody>
</table>


        </div>

        <div className="col-12 col-md-6">
          <h4 className="fw-bold">Acciones:</h4>
          <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border border-success p-2 mb-2 border-opacity-50 bg-success-subtle">
            <button className="btn btn-primary btn-md" onClick={handleUpdate}>
              <i className="bx bx-revision"></i> Datos
            </button>
            <button className="btn btn-info" onClick={() => setShowModal(true)} title="Aplicar filtros">
              <i className="bx bx-filter-alt"></i> Filtrar
            </button>
            <ExcelBiometrico data={filteredData} obtenerDiaSemana={obtenerDiaSemana} calcularHorasTrabajadas={calcularHorasTrabajadas} />
            <button className="btn btn-danger btn-sm" onClick={resetFilters} title="Borrar filtros">
              <i className="bx bxs-trash"></i> Filtros
            </button>
          </div>

          <FilterModal
            showModal={showModal}
            setShowModal={setShowModal}
            filters={filters}
            setFilters={setFilters}
            deviceNames={deviceNames}
            departments={departments}
            applyFilters={applyFilters}
            isUser6={datosUsuario?.user.role === 'user6'}
            userDeviceName={datosUsuario?.user.sucursale_id}  // Asumiendo que `sucursale_id` es el nombre del dispositivo
          />

        </div>
      </div>

      {/* Tabla de registros filtrados */}
      <table id="table_id" className="table table-striped table-hover text-center table-sm table-responsive">
        <thead>
          <tr>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('id_galac')}>
              <i className="bx bx-sort"></i>ID
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('id')}>
              <i className="bx bx-sort"></i>Cédula
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('person_name')}>
              <i className="bx bx-sort"></i>Nombre
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('device_name')}>
              <i className="bx bx-sort"></i>Suc Marcada
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('date')}>
              <i className="bx bx-sort"></i>Fecha
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('day')}>
              <i className="bx bx-sort"></i>Día
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('entry_time')}>
              <i className="bx bx-sort"></i>Hora Entrada
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('exit_time')}>
              <i className="bx bx-sort"></i>Hora Salida
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('worked_hours')}>
              <i className="bx bx-sort"></i>Horas Trabajadas
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('sucursal_id')}>
              <i className="bx bx-sort"></i>Suc Asignada
            </th>
            <th className="bg-success-subtle text-success-emphasis" onClick={() => handleSort('orgName')}>
              <i className="bx bx-sort"></i>Departamento
            </th>
          </tr>
        </thead>

        <tbody className="text-center">
          {filteredData.map((item, index) => (
            <tr key={`${item.id}-${index}`}>
              <td>{item.id_galac}</td>
              <td>{item.id}</td>
              <td>{item.person_name}</td>
              <td>{item.device_name}</td>
              <td>{item.date}</td>
              <td>{obtenerDiaSemana(item.date)}</td>
              <td>{item.entry_time}</td>
              <td>{item.exit_time}</td>
              <td>{calcularHorasTrabajadas(item.entry_time, item.exit_time)}</td>
              <td>{item.Suc_asiganda}</td>
              <td>{item.orgName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
};

export default Biometrico;
