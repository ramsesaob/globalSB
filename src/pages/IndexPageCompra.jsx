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
import  ReporteModal  from '../components/ReporteModal';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext'; // Si usas campos de texto
import ModalEditarCompra from '../components/ModalEditarCompra';


const IndexPageCompra = () => {
 
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
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
      'descripcion': { value: null, matchMode: 'contains' },  
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusCounts, setStatusCounts] = useState({
      total: 0,
      pending: 0,
      partially: 0,
      processed: 0,
      canceled: 0,
    });
    const [showReportModal, setShowReportModal] = useState(false);
    const handleShowReportModal = () => setShowReportModal(true);
    const handleCloseReportModal = () => setShowReportModal(false);
    const [showEditModal, setShowEditModal] = useState(false);  // Para mostrar el modal
const [editOrderData, setEditOrderData] = useState(null);    // Para almacenar los datos de la orden que se está editando

    
  // Configuración de idioma español en el DataTable
    useEffect(() => {
      // Configuración de localización
      addLocale('es', es); // 'es' debe coincidir con el nombre del idioma en el JSON
      locale('es');
    }, []);
  
    useEffect(() => {  
      const fetchAndFilterOrdenPedidos = async () => {  
       
        try {  
          const response = await axios.get(`${apiBaseUrl}/ordencompra/page.json`);  
          const ordenPedidos = response.data.orden;
  
          const role = datosUsuario.user.role;  
          const filteredPedidos = ordenPedidos.filter(orden => { 
            setLoading(true); // Inicia estado de carga 
            if (role == 'admin') {  
              return true;  
            } else if (role == 'user1') {  
              return orden.user_id == datosUsuario.user.id;  
            } else if (role == 'user2') {  
              return true;  
            } else if (role === 'user3') {
              return orden.user_id === datosUsuario.user.id;
            }else {  
              return orden.user_id == datosUsuario.user.id;  
            }  
          });  
    
          setOrdenPedidos(ordenPedidos);  
          setFilteredOrdenPedidos(filteredPedidos);  
       
       
        // Calcular los conteos de estado
        const counts = {
          total: role === 'admin' || role === 'user2' ? ordenPedidos.length : filteredPedidos.length,
          pending: (role === 'admin' || role === 'user2' ? ordenPedidos : filteredPedidos)
            .filter(o => o.status === 'Pendiente' && o.anulada != 0).length, // Solo cuenta si no está anulada
          partially: (role === 'admin' || role === 'user2' ? ordenPedidos : filteredPedidos)
            .filter(o => o.status === 'Parcialmente' && o.anulada != 0).length, // Solo cuenta si no está anulada
          processed: (role === 'admin' || role === 'user2' ? ordenPedidos : filteredPedidos)
            .filter(o => o.status === 'Procesada' && o.anulada != 0).length, // Solo cuenta si no está anulada
          canceled: (role === 'admin' || role === 'user2' ? ordenPedidos : filteredPedidos)
            .filter(o => o.anulada == 0).length, // Cuenta solo las órdenes anuladas
        };
        setStatusCounts(counts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
      fetchAndFilterOrdenPedidos();  
    }, [datosUsuario, tableKey, filters, ordenPedidos]); 
  
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
            const response = await fetch(`${apiBaseUrl}/ordenp/anular/${id}.json`, {
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
          <Link style={{ textDecoration: 'none', color: 'white' }} to={`/ViewPageCompra/${rowData.id}`}>
            <span>Ver</span>
          </Link>
        </button>
        
        {/* Botón de Editar */}
        {((rowData.anulada == 1 || rowData.anulada == null ) && (rowData.status == 'Pendiente')  && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user1')) && (
          <button className='btn btn-warning btn-sm mx-2' onClick={() => handleEdit(rowData)}>
            Editar
          </button>
         
        )}
        
        {((rowData.anulada == 1 || rowData.anulada == null ) && (rowData.status == 'Pendiente')  && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user1')) && (
          <button className='btn btn-danger btn-sm' onClick={() => handleAnularPedido(rowData.id)}>Anular</button>
        )}
    
        {((rowData.status != 'Verificada' )  && (rowData.anulada != 0)   && (datosUsuario.user.role == 'admin' || datosUsuario.user.role == 'user2')) && (
          <button className='btn btn-info btn-sm mx-2'>
            <Link style={{ textDecoration: 'none', color: 'white' }} to={`/VerificacionCompra/${rowData.id}`}>
              <span>Verificar</span>
            </Link>
          </button>
        )}
      </div>
    );
    
  
    const aprobadaTemplate = (rowData) => {
       // console.log('Estado de aprobada:', rowData.aprobada); // Verificar el valor
      
        return (
          <i
            className={`btn btn-lg bx ${parseInt(rowData.aprobada) === 1 ? 'bx-block btn-sm' : 'bx-check-circle'}`}
            style={{ color: parseInt(rowData.aprobada) === 0 ? 'rgb(33 115 18)' : '#f10b0b' }}
          />
        );
      };
      

    const tipoTemplate = (rowData) => {
      if (rowData.tipo === '1') {
        return 'Tienda'; 
      }
      if (rowData.tipo === '0') {
        return 'Local';
    }
    };
   
   
  
    const rowClassName = (rowData) => {
      return parseInt(rowData.aprobada) === 0 ? 'table-validada' : ''; // Aplica clase 'table-anulada' si anulada es 0
    };
  
    const rowClass = (rowData) => {
      if (rowData.status == 'Verificada') {
        return 'table-validada'; // Aplica clase 'table-validada' si Status_aprobada es 'Validada'
      } else if (rowData.status == 'Parcialmente') {
        return 'table-semi'; // Aplica clase 'table-semi' si Status_aprobada es 'Parcialmente'
      } 
      else if (rowData.status == 'Pendiente') {
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
      const dateString = rowData.created.split('.')[0]; // '2024-10-22 15:41:48'
      const createdDate = new Date(dateString + 'Z'); // Añadir 'Z' para tratarlo como UTC
    
      if (isNaN(createdDate.getTime())) {
        console.error('Fecha no válida:', dateString);
        return 'Fecha no válida';
      }

    
      // Obtener los componentes de la fecha y hora
      const year = createdDate.getFullYear();
      const month = String(createdDate.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
      const day = String(createdDate.getDate()).padStart(2, '0');
      let hours = createdDate.getHours();
      const minutes = String(createdDate.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am'; // Determina si es AM o PM
    
      hours = hours % 12; // Convierte a formato 12 horas
      hours = hours ? String(hours).padStart(2, '0') : '12'; // Asegura que la hora sea '12' en vez de '0'
    
      // Devuelve la fecha en el formato deseado
      return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    };
    
    
    
  
   /* const formatDate = (rowData) => {
      const dateString = rowData.created.split('.')[0]; // '2024-10-22 15:41:48'
      const createdDate = new Date(dateString + 'Z'); // Añadir 'Z' para indicar UTC
    
      const year = createdDate.getFullYear();
      const month = String(createdDate.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
      const day = String(createdDate.getDate()).padStart(2, '0');
      const hours = String(createdDate.getUTCHours()).padStart(2, '0'); // Usa getUTCHours para la hora UTC
      const minutes = String(createdDate.getUTCMinutes()).padStart(2, '0'); // Usa getUTCMinutes para los minutos
      const seconds = String(createdDate.getUTCSeconds()).padStart(2, '0'); // Usa getUTCSeconds para los segundos
    
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    */
  
    const handleFilterChange = (e) => {
      setFilters(e.filters);  // Actualiza el estado de los filtros
    };
  
  
  
    const toggleFilters = () => {
      setShowFilters(!showFilters);
    };
    if (!ordenPedidos) {
      return <div className="text-center">Loading...</div>; // Muestra un mensaje de carga mientras se obtienen los datos
    }
  
    const commonBodyStyle = {
      textAlign: 'center',
      fontSize: '0.8rem',
      padding: '1px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal', // Permite múltiples líneas
      maxHeight: '3em', // Limita la altura para dos líneas
    };
    const obtenerMotivosSeleccionados = (rowData) => {
        const motivosMap = {
            motivo01: "Reparacion / Materiales",
            motivo02: "Papeleria / Material de Oficina",
            motivo03: "Equipos de Sistema",
            motivo04: "Repuestos Vehiculos",
        };
    
        const motivos = Object.keys(motivosMap).filter(key => {
            const valor = Number(rowData[key]);
          //  console.log(`Evaluando ${key}: ${valor}`); // Para depurar
            return valor === 1;
        }).map(key => motivosMap[key]);
    
       // console.log(`Motivos seleccionados: ${motivos}`); // Para depurar
        return motivos.length > 0 ? motivos.join(", ") : "Ninguno";
    };
    
    const handleEdit = (order) => {
      setEditOrderData(order);  // Establece los datos de la orden en el estado
      setShowEditModal(true);    // Muestra el modal de edición
    };
    
    const handleCloseEditModal = () => {
      setShowEditModal(false);
    };
    
    
    
    
  
    return (
      <div className="container">
      <h2 className='text-center p-1'>Ordenes de Pedidos de Compra</h2>
      <div className='d-flex justify-content-between py-2'>
        <Button
          label={showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          icon="pi pi-filter"
          className="p-filter-toggle-button btn btn-info btn-sm"
          onClick={toggleFilters}
          style={{ height: "40px", lineHeight: "30px" }}
        />
       
            
          <div className="status-counts">
          <ModalEditarCompra
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            editOrderData={editOrderData}  // Asegúrate de que este prop es el que contiene los datos de la orden
            setEditOrderData={setEditOrderData}  // Asegúrate de que esta función actualiza el estado editOrderData
          />

        <ReporteModal
          show={showReportModal} 
          handleClose={handleCloseReportModal} 
          statusCounts={statusCounts} 
          filteredOrdenPedidos={filteredOrdenPedidos}
          orders={ordenPedidos} 
        />
            <span className='text-black fs-5'><i class='bx bxs-grid-alt bx-spin' ></i>Total: {statusCounts.total}</span>
            <span className='text-danger fs-5'> | <i className='bx bxs-message-alt-x bx-tada' ></i> Pendientes: {statusCounts.pending}</span>
            <span className='text-info fs-5'> | <i className='bx bxs-message-alt-error bx-tada' ></i> Parcialmente: {statusCounts.partially}</span>
            <span className='text-success fs-5'> | <i className='bx bxs-message-alt-check bx-tada' ></i> Procesadas: {statusCounts.processed}</span>
            <span className='text-warning fs-5'> | <i className='bx bxs-error-circle bx-tada' ></i> Anuladas: {statusCounts.canceled}</span>
            <Button className="btn btn-light btn-sm mx-2" variant="info" onClick={handleShowReportModal}><i className='bx bxs-report'></i>Reporte</Button>
          </div>
       
      </div>
      {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
      <div className={`p-datatable ${showFilters ? 'filters-visible' : ''}`} >
      <DataTable
        key={tableKey}
        value={filteredOrdenPedidos}
        paginator
        resizableColumns
        rows={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
        responsive={true}
        rowClassName={rowClassName}
        globalFilter={globalFilterValue}
        className='table-condensed p-datatable-sm text-center' 
        bodyClassName={rowClass}
        filters={filters} 
        filterDisplay="row" 
        onFilter={handleFilterChange}
      >
        <Column 
          field="num_ped" 
          header="Nº Ped" 
          sortable 
          headerStyle={{ ...headerStyle, width: '120px' }} 
          bodyStyle={commonBodyStyle} 
          filter 
          filterPlaceholder="Buscar por pedido" 
        />
        <Column 
          field="created" 
          header="Fecha de pedido" 
          sortable 
          headerStyle={{ ...headerStyle, width: '150px' }} 
          bodyStyle={commonBodyStyle} 
          body={formatDate} 
          filter 
          filterPlaceholder="Buscar por Fecha" 
        />
        <Column 
          field="Sucursal" 
          header="Sucursal" 
          sortable 
          headerStyle={{ ...headerStyle, width: '100px' }} 
          bodyStyle={commonBodyStyle} 
          filter 
          filterPlaceholder="Buscar por Sucursal" 
        />
        <Column 
            field="descripcion" 
            header="Motivo" 
            sortable 
            headerStyle={{ ...headerStyle, width: '150px' }} 
            bodyStyle={commonBodyStyle} 
            body={(rowData) => obtenerMotivosSeleccionados(rowData)} 
            filter 
            filterPlaceholder="Buscar por Motivo" 
        />

        <Column 
          field="status" 
          header="Status" 
          sortable 
          headerStyle={{ ...headerStyle, width: '100px' }} 
          bodyStyle={commonBodyStyle} 
          bodyClassName={rowClass} 
          filter 
          filterPlaceholder="Buscar por Status" 
        />
        <Column 
          field="aprobada" 
          header="Apro" 
          body={aprobadaTemplate} 
          sortable 
          headerStyle={{ ...headerStyle, width: '80px' }} 
          bodyStyle={commonBodyStyle} 
        />
        <Column 
          field="tipo" 
          header="Tipo" 
          body={tipoTemplate} 
          sortable 
          headerStyle={{ ...headerStyle, width: '80px' }} 
          bodyStyle={commonBodyStyle} 
        />
        <Column 
          field="comentario" 
          header="Comentario" 
          sortable 
          headerStyle={{ ...headerStyle, width: '200px' }} 
          bodyStyle={commonBodyStyle} 
          filter 
          filterPlaceholder="Buscar por Comentario" 
        />
        <Column 
          header="Acciones" 
          body={actionTemplate} 
          headerStyle={headerStyle} 
          bodyStyle={{ textAlign: 'center', fontSize: '0.8rem' }} 
        />
      </DataTable>
  
        </div>
        )}
      </div>
    );
  };
 

export default IndexPageCompra
