import React, { useState, useEffect } from 'react';
import logo2 from '../assets/logo2.png';
import { useContext } from "react";
import { carritoContext } from "../contexts/carritoContext";
import ExcelRepAsistencia from '../components/(biometrico)/ExcelRepAsistencia';
import DetalleAsisMod from '../components/(biometrico)/DetalleAsisMod';

const RepAsistencia = () => {
  // Estado para los datos, las sucursales y los filtros
    const [registros, setRegistros] = useState([]);
    const [sucursales, setSucursales] = useState([]);
  // Obtener la fecha actual en formato YYYY-MM-DD
    const today1 = new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
    const [registroDetails, setRegistroDetails] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); // Estado para el modal
    // Cambiamos modalVisible a showModal
    const [showModal, setShowModal] = useState(false); // Nuevo estado para el modal
  
 
    // Estado para ordenación
    const [filters, setFilters] = useState({
      startDate: today1,
      endDate: today1,
      cedula: '',
      nombre: '',
      apellido: '',
      sucursal: '',
      diasAusentes: '',
      id_galac: '',
    });
  
    // Estado para ordenación
    const [sortConfig, setSortConfig] = useState({
      key: '',      // El campo por el cual se está ordenando
      direction: '' // La dirección del orden (ascendente o descendente)
    });
  
    // Función para cargar los datos de la API con los filtros
    const fetchData = async () => {
      const { startDate, endDate, cedula, nombre, apellido, sucursal, id_galac } = filters;
      let url = `${apiBaseUrl}/biometrico/asistencia.json?`;
  
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (cedula) url += `cedula=${cedula}&`;
      if (nombre) url += `nombre=${nombre}&`;
      if (apellido) url += `apellido=${apellido}&`;
      if (id_galac) url += `id_galac=${id_galac}&`;
  
      // Condicional para agregar la sucursal dependiendo del rol
      if (datosUsuario.user && datosUsuario?.user.role === 'user6' || datosUsuario?.user?.role === 'gerente') {
        const sucursalAsignada = datosUsuario.user.sucursale.descripcion;
        url += `sucursal=${sucursalAsignada}&`;
      } else if (sucursal) {
        url += `sucursal=${sucursal}&`;
      }
  
      // Eliminar el último '&' si existe
      url = url.slice(0, -1);
  
      try {
        const response = await fetch(url);
        const data = await response.json();
        let registrosFiltrados = data.registros;
  
        // Filtrar los registros según el valor de diasAusentes si está definido
        if (filters.diasAusentes) {
          registrosFiltrados = registrosFiltrados.filter((registro) => {
            return registro.Dias_Ausentes === filters.diasAusentes;
          });
        }
  
        setRegistros(registrosFiltrados);
  
        // Agrupar las sucursales solo si no se ha seleccionado una sucursal
        if (!sucursal) {
          const agrupadas = groupBySucursal(registrosFiltrados);
          setSucursales(agrupadas);
        }
  
      } catch (error) {
        console.error("Error al consultar la API", error);
      }
    };
  
    // Función para agrupar las sucursales
    const groupBySucursal = (data) => {
      return [...new Set(data.map((registro) => registro.Sucursal))]; // Obtiene las sucursales únicas
    };
  
    // Función para agrupar los días ausentes
    const groupByausentes = (data) => {
      return [...new Set(data.map((registro) => registro.Dias_Ausentes))]; // Obtener valores únicos de "Dias_Ausentes"
    };
  
    // Función para manejar el cambio de los filtros
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    };
  
    // Función para calcular la diferencia de días
    const calculateDaysDifference = (startDate, endDate) => {
      if (!startDate || !endDate) return 0;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };
  
    // Función para manejar el clic en las cabeceras de la tabla y ordenar
    const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };
  
    // Ordenar los registros
    const sortedRecords = [...registros].sort((a, b) => {
      if (!sortConfig.key) return 0;
  
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
  
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    // Hook para aplicar los filtros cada vez que cambian
    useEffect(() => {
      fetchData();
    }, [filters]);
    const handleViewDetails = async (registro) => {
      const { startDate, endDate } = filters;
      
      // Construir la URL para la API de detalles, usando la cédula
      const url = `${apiBaseUrl}/biometrico/asistenciadetalle.json?startDate=${startDate}&endDate=${endDate}&cedula=${registro.Cedula}`;
      
      try {
        // Realizar el fetch a la API de detalles
        const response = await fetch(url);
        const data = await response.json();
    
       // console.log("Detalles cargados:", registroDetails);  // Verifica que los datos sean correctos
        
        // Si la respuesta contiene registros, actualizamos el estado
        if (data.registros && data.registros.length > 0) {
          setRegistroDetails(data.registros);  // Actualiza los detalles
          setShowModal(true);  // Muestra el modal
        } else {
          console.log("No hay registros disponibles para este usuario.");
        }
      } catch (error) {
        console.error('Error al obtener los detalles:', error);
      }
    };
    

    const handleCloseModal = () => {
      setModalVisible(false);  // Cierra el modal
      setRegistroDetails([]);  // Limpia los detalles cuando el modal se cierra
    };
    
    useEffect(() => {
      fetchData();
    }, [filters]);
  
  
  return (
    <div className="container">
      <div className="d-flex justify-content-between">
        <div>
          <img src={logo2} alt="logo" width={60} />
        </div>
        <div className="text-center flex-grow-1">
          <h1 className="title py-2">Reporte de Asistencia</h1>
        </div>
        <div>
          <img src={logo2} alt="logo" width={60} />
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-1">
        <div className="row">
          <div className="col-md-3 mb-3">
            <label htmlFor="startDate" className="form-label">Fecha inicio</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Fecha inicio"
              max={today}  
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="endDate" className="form-label">Fecha fin</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="Fecha fin"
              max={today}  
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="cedula" className="form-label">Cédula</label>
            <input
              type="text"
              className="form-control"
              name="cedula"
              value={filters.cedula}
              onChange={handleFilterChange}
              placeholder="Cédula"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="id_galac" className="form-label">Galac</label>
            <input
              type="text"
              className="form-control"
              name="id_galac"
              value={filters.id_galac}
              onChange={handleFilterChange}
              placeholder="id galac"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={filters.nombre}
              onChange={handleFilterChange}
              placeholder="Nombre"
            />
          </div>
       
          <div className="col-md-3 mb-3">
            <label htmlFor="apellido" className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              name="apellido"
              value={filters.apellido}
              onChange={handleFilterChange}
              placeholder="Apellido"
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="sucursal" className="form-label">Sucursal</label>
            <select
              className="form-select"
              name="sucursal"
              value={filters.sucursal}
              onChange={handleFilterChange}
              disabled={datosUsuario?.user.role === 'user6'}  // Deshabilitamos el select si el usuario es 'user6'
            >
             {datosUsuario?.user.role === 'user6' ? (
            // Si el usuario es 'user6', solo mostramos su sucursal
            <option >{datosUsuario.user.sucursale.descripcion}</option>
          ) : (
            <>
              <option value="">Seleccionar Sucursal</option>
              {sucursales.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </>
          )}
            </select>
            
          </div>
            <div className="col-md-3 mb-3">
            <label htmlFor="diasAusentes" className="form-label">Días Ausentes</label>
            <select
                className="form-select"
                name="diasAusentes"
                value={filters.diasAusentes}
                onChange={handleFilterChange}
            >
                <option value="">Seleccionar Días Ausentes</option>
                {groupByausentes(registros).map((dias) => (
                <option key={dias} value={dias}>
                    {dias}
                </option>
                ))}
            </select>
            </div>
            <div className="col-md-3 mb-3">
            <label htmlFor="diasConsultados" className="form-label">Días Consultados</label>
            <input
              type="text"
              className="form-control"
              name="diasConsultados"
              value={calculateDaysDifference(filters.startDate, filters.endDate)}
              disabled
            />
          </div>

          <div className="col-md-3 mb-3">
          <label htmlFor="sucursal" className="form-label">Descargar</label>
                {/* Botón para exportar a Excel */}
                 <ExcelRepAsistencia registros={registros} /> 
            </div>
        </div>
      </div>

      {/* Tabla de registros */}
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr className="text-center table-success">
            <th onClick={() => handleSort('id')}>#</th>
            <th onClick={() => handleSort('Cod_Galac')}>Galac</th>
            <th onClick={() => handleSort('Cedula')}>Cédula</th>
            <th onClick={() => handleSort('nombre')}>Nombre</th>
            <th onClick={() => handleSort('apellido')}>Apellido</th>
            <th onClick={() => handleSort('Sucursal')}>Sucursal</th>
            <th onClick={() => handleSort('fecha_inicio')}>Fecha Inicio</th>
            <th onClick={() => handleSort('fecha_final')}>Fecha Final</th>
            <th onClick={() => handleSort('Dias_Marcados')}>Días Marcados</th>
            <th onClick={() => handleSort('Dias_ConUnSoloMarcaje')}>Con un Solo Marcaje</th>
            <th onClick={() => handleSort('Dias_Ausentes')}>Días Ausentes</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((registro, index) => (
            <tr key={registro.Cedula}>
              <td>{index + 1}</td>
              <td>{registro.Cod_Galac}</td>
              <td>{registro.Cedula}</td>
              <td>{registro.nombre}</td>
              <td>{registro.apellido}</td>
              <td>{registro.Sucursal}</td>
              <td>{registro.fecha_inicio}</td>
              <td>{registro.fecha_final}</td>
              <td>{registro.Dias_Marcados}</td>
              <td>{registro.Dias_ConUnSoloMarcaje}</td>
              <td>{registro.Dias_Ausentes}</td>
              <td className="text-center">
                <button className="btn btn-light btn-lg" onClick={() => handleViewDetails(registro)}>
                <i className='bx bx-search-alt-2' style={{ color: '#07e03f' }}></i>

                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
       {/* Mostrar el modal solo cuando showModal es true */}
       {showModal && (
        <DetalleAsisMod showModal={showModal} setShowModal={setShowModal} registros={registroDetails} ob />
      )}
    </div>
  );
};

export default RepAsistencia;
