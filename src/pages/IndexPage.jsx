import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import SearchTable from '../components/SearchTable';
import { carritoContext } from "../contexts/carritoContext";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from 'primereact/button';
import { locale, addLocale } from 'primereact/api';
import { es } from '../../node_modules/primelocale/es.json'; // Importar archivo JSON directamente


const IndexPage = () => {
  const { datosUsuario } = useContext(carritoContext);
  const [ordenPedidos, setOrdenPedidos] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [tableKey, setTableKey] = useState(0); // Key para forzar la actualización del DataTable
  const [filteredOrdenPedidos, setFilteredOrdenPedidos] = useState([]); // Estado para almacenar los pedidos filtrados
  const [filters, setFilters] = useState({  
    'nombre': { value: null, matchMode: 'contains' },  
    'sucursal': { value: null, matchMode: 'contains' }, 
    'numero_ped': { value: null, matchMode: 'contains' }, 
    'created': { value: null, matchMode: 'contains' }, 
    'Status_aprobada': { value: null, matchMode: 'contains' }, 
  });
  const [showFilters, setShowFilters] = useState(false);
  
// Configuración de idioma español en el DataTable
  useEffect(() => {
    // Configuración de localización
    addLocale('es', es); // 'es' debe coincidir con el nombre del idioma en el JSON
    locale('es');
  }, []);

  useEffect(() => {  
    const fetchAndFilterOrdenPedidos = async () => {  
      try {  
        const response = await axios.get(`http://192.168.0.107/ped2/OrdenPedidos/page.json`);  
        const ordenPedidos = response.data.orden;

        const role = datosUsuario.user.role;  
        const filteredPedidos = ordenPedidos.filter(orden => {  
          if (role == 'admin') {  
            return true;  
          } else if (role == 'user1') {  
            return orden.user_id == datosUsuario.user.id;  
          } else if (role == 'user2') {  
            return true;  
          } else {  
            return orden.user_id == datosUsuario.user.id;  
          }  
        });  
  
        setOrdenPedidos(ordenPedidos);  
        setFilteredOrdenPedidos(filteredPedidos);  
     
      } catch (error) {  
        console.error('Error fetching data:', error);  
      }  
    };  
  
    fetchAndFilterOrdenPedidos();  
  }, [datosUsuario]); 

  const handleAnularPedido = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, anularlo'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://192.168.0.107/ped2/OrdenPedidos/anular/${id}.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              anulada: 1,
              fecha_anulada: new Date().toISOString(),
            }),
          });
  
          if (response.ok) {
            setOrdenPedidos(prevOrdenPedidos =>
              prevOrdenPedidos.map(pedido =>
                pedido.id === id ? { ...pedido, anulada: 1, fecha_anulada: new Date().toISOString() } : pedido
              )
            );
            Swal.fire('Anulado', 'El pedido ha sido anulado.', 'success');
            setTableKey(prevKey => prevKey + 1); // Forzar la actualización del DataTable
          } else {
            console.error('Error al anular el pedido');
          }
        } catch (error) {
          console.error('Error al enviar la solicitud:', error);
        }
      }
    });
  };

  const actionTemplate = (rowData) => (
    <div>
      <button className='btn btn-success btn-sm mx-2'>
        <Link style={{ textDecoration: 'none', color: 'white' }} to={`/ViewPage/${rowData.id}`}>
          <span>Ver</span>
        </Link>
      </button>
      
      {((rowData.anulada == 1 || rowData.anulada == null ) && (rowData.Status_aprobada == 'Pendiente')  && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user1')) && (
        <button className='btn btn-danger btn-sm' onClick={() => handleAnularPedido(rowData.id)}>Anular</button>
      )}
     
      {((rowData.Status_aprobada != 'Procesada' )  && (rowData.anulada != 0)   && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user2')) && (
        <button className='btn btn-info btn-sm mx-2'>
          <Link style={{ textDecoration: 'none', color: 'white' }} to={`/Verificacion/${rowData.id}`}>
            <span>Verificar</span>
          </Link>
        </button>
      )}
    </div>
  );

  const anuladaTemplate = (rowData) => (
    <i className={`btn btn-lg bx ${parseInt(rowData.anulada) == 0 ? 'bx-block btn-sm' : 'bx-check-circle'}`} style={{ color: parseInt(rowData.anulada) == 0 ? '#f10b0b' : '#1ef100' }} />
  );
  const tipoTemplate = (rowData) => {
    if (rowData.tipo === 'P') {
      return 'Normal'; 
    }
    if (rowData.tipo === 'N') {
      return 'Navidad';
  }
  };

  const rowClassName = (rowData) => {
    return parseInt(rowData.anulada) == 0 ? 'table-anulada' : ''; // Aplica clase 'table-anulada' si anulada es 0
  };

  const rowClass = (rowData) => {
    if (rowData.Status_aprobada == 'Procesada') {
      return 'table-validada'; // Aplica clase 'table-validada' si Status_aprobada es 'Validada'
    } else if (rowData.Status_aprobada == 'Parcialmente') {
      return 'table-semi'; // Aplica clase 'table-semi' si Status_aprobada es 'Parcialmente'
    } 
    else if (rowData.Status_aprobada == 'Pendiente') {
      return 'table-NoValidada'; // Aplica clase 'table-NoValidada' si Status_aprobada es 'Pendiente'
    } else {
      return ''; // Retorna una cadena vacía si no se cumple ninguna condición
    }
  };

  const headerStyle = {
    background: 'rgb(0 141 61 / 84%)', // Color de fondo deseado para la cabecera
    color: 'white', // Color del texto en la cabecera, opcional
    fontWeight: 'bold', // Otras propiedades de estilo, opcional
    borderBottom: '1px solid #333', // Borde inferior para la cabecera
    textAlign: 'center', // Alinear el texto en la cabecera
  };

  const formatDate = (rowData) => {
    const createdDate = new Date(rowData.created);
    const year = createdDate.getFullYear();
    const month = String(createdDate.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const day = String(createdDate.getDate()).padStart(2, '0');
    const hours = String(createdDate.getHours()).padStart(2, '0');
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleFilterChange = (e) => {
    setFilters(e.filters);  // Actualiza el estado de los filtros
  };



  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  

  return (
    <div className="container">
      <h2 className='text-center p-1'>Ordenes de Pedidos</h2>

      <div className='d-flex justify-content-between' >
          <SearchTable />
          <Button
            label={showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'} 
            icon="pi pi-filter" 
            className=" p-filter-toggle-button btn btn-info btn-sm " 
            onClick={toggleFilters}
            style={{ height: "40px", lineHeight: "30px" }} /* Ajusta la altura aquí */
          />
       </div>
    <div className={`p-datatable ${showFilters ? 'filters-visible' : ''}`} >
      <DataTable
        key={tableKey}
        value={filteredOrdenPedidos}
        paginator
        resizableColumns
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        responsive
        rowClassName={rowClassName}
        globalFilter={globalFilterValue} // Aplicar filtro global
        className='p-datatable-sm text-center' 
        bodyClassName={rowClass}
        filters={filters} 
        filterDisplay="row" 
        onFilter={handleFilterChange}
      
      >
        <Column field="numero_ped" header="Numero de pedido" sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} filter filterPlaceholder="Buscar por pedido" />
        <Column field="created" header="Fecha de pedido" sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} body={formatDate} filter filterPlaceholder="Buscar por Fecha" />
        <Column field="sucursal" header="Sucursal" sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} filter filterPlaceholder="Buscar por Sucursal" />
        <Column field="Status_aprobada" header="Status" sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} bodyClassName={rowClass} filter filterPlaceholder="Buscar por Status" />
        <Column field="anulada" header="Activa" body={anuladaTemplate} sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} />
        <Column field="tipo" header="Tipo" body={tipoTemplate} sortable headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} />
        <Column header="Acciones" body={actionTemplate} headerStyle={headerStyle} bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} />
      </DataTable>
    </div>
  </div>
  );
};

export default IndexPage;
