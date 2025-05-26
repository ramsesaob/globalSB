import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { carritoContext } from '../contexts/carritoContext';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const IndexRevisionProvisiones = () => {
    
  const [registros, setRegistros] = useState([]);
  const [selectedRegistros, setSelectedRegistros] = useState([]);
  const [fechaPago, setFechaPago] = useState(null);
  const [showFechaDialog, setShowFechaDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    empresa: { value: null, matchMode: FilterMatchMode.IN },
    proveedor: { value: null, matchMode: FilterMatchMode.CONTAINS },
    departamento: { value: null, matchMode: FilterMatchMode.CONTAINS },
    monto_bs: { value: null, matchMode: FilterMatchMode.EQUALS },
    monto_dol: { value: null, matchMode: FilterMatchMode.EQUALS },
    fecha_pago: { value: null, matchMode: FilterMatchMode.DATE_IS }
  });
  const [empresas, setEmpresas] = useState([]);
  const [registrosEditados, setRegistrosEditados] = useState(new Set());
  const [proveedores, setProveedores] = useState([]);
  const [tasas, setTasas] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [showProveedorDialog, setShowProveedorDialog] = useState(false);
  const [currentEditingRow, setCurrentEditingRow] = useState(null);
  const { apiBaseUrl, datosUsuario } = useContext(carritoContext);
  const toast = React.useRef(null);
  const [searchProveedor, setSearchProveedor] = useState('');

  useEffect(() => {
    cargarDatos();
    cargarTasas();
    cargarProveedores();
  }, []);

  const cargarTasas = async () => {
    try {
      const response = await axios.get('http://192.168.0.195/apick/result/tasa.json');
      setTasas(response.data.resultado || []);
    } catch (error) {
      console.error('Error al cargar tasas:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las tasas' });
    }
  };

  const cargarProveedores = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/pagos/proveedores.json`);
      setProveedores(response.data.proveedores || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores' });
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://192.168.0.195/apick/provisiones/index.json');
      setRegistros(response.data.registros);
      
      // Extraer empresas únicas para el filtro
      const empresasUnicas = [...new Set(response.data.registros.map(reg => reg.empresa))];
      setEmpresas(empresasUnicas.map(empresa => ({ label: empresa, value: empresa })));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos' });
    } finally {
      setLoading(false);
    }
  };

  const empresaFilterTemplate = (options) => {
    return (
      <MultiSelect
        value={options.value}
        options={empresas}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Seleccione empresas"
        className="p-column-filter"
        maxSelectedLabels={3}
        selectedItemsLabel="{0} empresas seleccionadas"
      />
    );
  };

  const clearFilters = () => {
    setFilters({
      empresa: { value: null, matchMode: FilterMatchMode.IN },
      proveedor: { value: null, matchMode: FilterMatchMode.CONTAINS },
      departamento: { value: null, matchMode: FilterMatchMode.CONTAINS },
      monto_bs: { value: null, matchMode: FilterMatchMode.EQUALS },
      monto_dol: { value: null, matchMode: FilterMatchMode.EQUALS },
      fecha_pago: { value: null, matchMode: FilterMatchMode.DATE_IS }
    });
  };

  const verificarDuplicidad = (rowData) => {
    if (!rowData.empresa || !rowData.proveedor) return false;
    
    // Buscamos otros registros con la misma empresa y proveedor
    const duplicados = registros.filter(registro => 
      registro.id !== rowData.id && // Excluimos el registro actual
      registro.empresa === rowData.empresa && 
      registro.proveedor === rowData.proveedor
    );

    return duplicados.length > 0;
  };

  const duplicidadTemplate = (rowData) => {
    const esDuplicado = verificarDuplicidad(rowData);
    return (
      <div className={`p-2 rounded ${esDuplicado ? 'bg-danger text-white' : ''}`}>
        {esDuplicado ? 'DUPLICADO' : ''}
      </div>
    );
  };

  const calcularMontoDol = (montoBs, tasa) => {
    if (!montoBs || !tasa) return 0;
    const numMontoBs = parseFloat(montoBs.toString().replace(/,/g, ''));
    const numTasa = parseFloat(tasa.toString().replace(',', '.'));
    return (numMontoBs / numTasa).toFixed(2);
  };

  const montoBsEditor = (options) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => {
          const newValue = e.value;
          const registro = options.rowData;
          const montoDol = calcularMontoDol(newValue, registro.tasa);
          
          const updatedRegistro = {
            ...registro,
            monto_bs: newValue,
            monto_dol: montoDol
          };
          
          const updatedRegistros = registros.map(r => 
            r.id === registro.id ? updatedRegistro : r
          );
          setRegistros(updatedRegistros);
          setRegistrosEditados(prev => new Set([...prev, registro.id]));
          setSelectedRegistros(prev => [...prev, registro]);
        }}
        mode="decimal"
        minFractionDigits={2}
        maxFractionDigits={2}
        className="w-100"
      />
    );
  };

  const tasaEditor = (options) => {
    return (
      <div className="p-inputgroup">
        <select
          className="form-select"
          style={{ width: '40%' }}
          onChange={(e) => {
            const selectedTasa = tasas.find(t => t.Currency === e.target.value);
            if (selectedTasa) {
              const registro = options.rowData;
              const montoDol = calcularMontoDol(registro.monto_bs, selectedTasa.Rate);
              
              const updatedRegistro = {
                ...registro,
                tasa: selectedTasa.Rate,
                monto_dol: montoDol
              };
              
              const updatedRegistros = registros.map(r => 
                r.id === registro.id ? updatedRegistro : r
              );
              setRegistros(updatedRegistros);
              setRegistrosEditados(prev => new Set([...prev, registro.id]));
              setSelectedRegistros(prev => [...prev, registro]);
            }
          }}
          value={tasas.find(t => t.Rate === options.value)?.Currency || ''}
        >
          <option value="">Seleccionar</option>
          {tasas.map((tasa, index) => (
            <option key={index} value={tasa.Currency}>
              {tasa.Currency}
            </option>
          ))}
        </select>
        <InputNumber
          value={options.value}
          onValueChange={(e) => {
            const newValue = e.value;
            const registro = options.rowData;
            const montoDol = calcularMontoDol(registro.monto_bs, newValue);
            
            const updatedRegistro = {
              ...registro,
              tasa: newValue,
              monto_dol: montoDol
            };
            
            const updatedRegistros = registros.map(r => 
              r.id === registro.id ? updatedRegistro : r
            );
            setRegistros(updatedRegistros);
            setRegistrosEditados(prev => new Set([...prev, registro.id]));
            setSelectedRegistros(prev => [...prev, registro]);
          }}
          mode="decimal"
          minFractionDigits={4}
          maxFractionDigits={4}
          style={{ width: '60%' }}
          placeholder="Editar tasa..."
        />
      </div>
    );
  };

  const proveedorEditor = (options) => {
    return (
      <div className="p-inputgroup">
        <input
          type="text"
          className="form-control"
          value={options.value}
          onClick={() => {
            setCurrentEditingRow(options.rowData);
            setShowProveedorDialog(true);
          }}
          readOnly
          placeholder="Click para buscar proveedor..."
        />
      </div>
    );
  };

  const handleSearchProveedor = (value) => {
    setSearchProveedor(value);
    const filtered = proveedores.filter(item =>
      item.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProveedores(filtered);
  };

  const handleSelectProveedor = (proveedor) => {
    if (currentEditingRow) {
      const updatedRegistro = {
        ...currentEditingRow,
        proveedor: proveedor.nombre,
        grupo: proveedor.grupo,
        subgrupo: proveedor.subgrupo,
        banco: proveedor.banco
      };
      
      // Actualizar el registro en el estado
      const updatedRegistros = registros.map(r => 
        r.id === currentEditingRow.id ? updatedRegistro : r
      );
      setRegistros(updatedRegistros);
      
      // Marcar como editado y seleccionar
      setRegistrosEditados(prev => new Set([...prev, currentEditingRow.id]));
      setSelectedRegistros(prev => [...prev, currentEditingRow]);

      // Forzar la actualización de la tabla para recalcular duplicidades
      setTimeout(() => {
        const forceUpdate = [...updatedRegistros];
        setRegistros(forceUpdate);
      }, 0);
    }
    setShowProveedorDialog(false);
  };

  const handleGuardarCambios = async () => {
    if (selectedRegistros.length === 0) {
      toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione al menos un registro' });
      return;
    }

    // Filtrar solo los registros que han sido editados
    const registrosParaGuardar = selectedRegistros.filter(registro => 
      registrosEditados.has(registro.id)
    );

    if (registrosParaGuardar.length === 0) {
      toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'No hay cambios para guardar' });
      return;
    }

    setShowFechaDialog(true);
  };

  console.log(registrosEditados);
  console.log(selectedRegistros);
  const confirmarFechaPago = async () => {
    try {
      // Preparar los datos para enviar
      const datosParaGuardar = selectedRegistros
        .filter(registro => registrosEditados.has(registro.id))
        .map(registro => {
          // Asegurarnos que los valores numéricos sean números
          const montoBs = parseFloat(registro.monto_bs) || 0;
          const tasa = parseFloat(registro.tasa) || 0;
          const montoDol = parseFloat(registro.monto_dol) || 0;

          // Formatear la fecha correctamente
          let fechaFormateada = null;
          if (fechaPago) {
            const fecha = new Date(fechaPago);
            fechaFormateada = fecha.toISOString().split('T')[0];
          }

          console.log('Fecha original:', fechaPago);
          console.log('Fecha formateada:', fechaFormateada);
          console.log('Tasa:', tasa);

          return {
            id: parseInt(registro.id),
            user_id: parseInt(datosUsuario.user.id),
            reprogramacion_fecha: fechaFormateada,
            monto_bs: montoBs,
            tasa: tasa,
            monto_dol: montoDol,
            proveedor: registro.proveedor || '',
            grupo: registro.grupo || '',
            subgrupo: registro.subgrupo || '',
            banco: registro.banco || ''
          };
        });

      console.log('Datos a enviar:', JSON.stringify(datosParaGuardar, null, 2));

      // Llamada al endpoint
      const response = await axios.put('http://192.168.0.195/apick/provisiones/revision.json', datosParaGuardar, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Verificar si la respuesta es exitosa
      if (response.status === 200 || response.status === 201) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: 'Los cambios se guardaron correctamente'
        });
        
        setShowFechaDialog(false);
        setSelectedRegistros([]);
        setFechaPago(null);
        setRegistrosEditados(new Set());
        
        // Recargar los datos
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      console.error('Detalles del error:', error.response?.data);
      
      let errorMessage = 'Error al guardar los cambios';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: errorMessage
      });
    }
  };

  const rowClass = (rowData) => {
    const esDuplicado = verificarDuplicidad(rowData);
    return {
      'row-duplicada': esDuplicado
    };
  };

  return (
    <div className="container-fluid p-4">
      <Toast ref={toast} />
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Revisión de Provisiones</h3>
          <div>
            <Button
              icon="pi pi-filter-slash"
              label="Limpiar Filtros"
              className="p-button-outlined p-button-light me-2"
              onClick={clearFilters}
            />
            <Button
              label="Guardar Cambios"
              icon="pi pi-save"
              className="p-button-success"
              onClick={handleGuardarCambios}
              disabled={selectedRegistros.length === 0}
            />
          </div>
        </div>
        <div className="card-body">
          <DataTable
            value={registros}
            selection={selectedRegistros}
            onSelectionChange={(e) => setSelectedRegistros(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            loading={loading}
            className="p-datatable-sm"
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={['empresa', 'proveedor', 'departamento']}
            editMode="cell"
            rowClassName={rowClass}
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column 
              field="fecha_pago" 
              header="Fecha Pago" 
              sortable 
              filter 
              filterField="fecha_pago"
              dataType="date"
            ></Column>
            <Column 
              field="empresa" 
              header="Empresa" 
              sortable 
              filter 
              filterField="empresa"
              filterElement={empresaFilterTemplate}
              showFilterMenu={true}
            ></Column>
            <Column 
              field="proveedor" 
              header="Proveedor" 
              sortable 
              filter 
              filterField="proveedor"
              editor={proveedorEditor}
              body={(rowData) => (
                <span className={registrosEditados.has(rowData.id) ? 'text-primary fw-bold' : ''}>
                  {rowData.proveedor}
                </span>
              )}
            ></Column>
            <Column 
              field="monto_bs" 
              header="Monto Bs" 
              sortable 
              filter 
              filterField="monto_bs"
              dataType="numeric"
              editor={montoBsEditor}
              body={(rowData) => (
                <span className={registrosEditados.has(rowData.id) ? 'text-primary fw-bold' : ''}>
                  {rowData.monto_bs}
                </span>
              )}
            ></Column>
            <Column 
              field="tasa" 
              header="Tasa" 
              sortable 
              editor={tasaEditor}
              body={(rowData) => (
                <span className={registrosEditados.has(rowData.id) ? 'text-primary fw-bold' : ''}>
                  {rowData.tasa}
                </span>
              )}
            ></Column>
            <Column 
              field="monto_dol" 
              header="Monto USD" 
              sortable 
              filter 
              filterField="monto_dol"
              dataType="numeric"
              body={(rowData) => (
                <span className={registrosEditados.has(rowData.id) ? 'text-primary fw-bold' : ''}>
                  {rowData.monto_dol}
                </span>
              )}
            ></Column>
            <Column 
              field="departamento" 
              header="Departamento" 
              sortable 
              filter 
              filterField="departamento"
            ></Column>
            <Column body={duplicidadTemplate} header="Duplicidad"></Column>
          </DataTable>
        </div>
      </div>

      <Dialog
        visible={showProveedorDialog}
        style={{ width: '600px' }}
        header="Seleccionar Proveedor"
        modal
        onHide={() => {
          setShowProveedorDialog(false);
          setSearchProveedor('');
        }}
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <span className="p-input-icon-left w-100">
              <i className="pi pi-search" />
              <input
                type="text"
                className="form-control"
                value={searchProveedor}
                onChange={(e) => handleSearchProveedor(e.target.value)}
                placeholder="Buscar proveedor..."
                autoFocus
              />
            </span>
          </div>
          <div className="field">
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table table-hover">
                <thead className="sticky-top bg-light">
                  <tr>
                    <th>Proveedor</th>
                    <th>Grupo</th>
                    <th>Subgrupo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProveedores.map((proveedor, index) => (
                    <tr
                      key={index}
                      onClick={() => handleSelectProveedor(proveedor)}
                      style={{ cursor: 'pointer' }}
                      className="hover-highlight"
                    >
                      <td>{proveedor.nombre}</td>
                      <td>{proveedor.grupo}</td>
                      <td>{proveedor.subgrupo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProveedores.length === 0 && (
              <div className="text-center p-3 text-muted">
                No se encontraron proveedores
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showFechaDialog}
        style={{ width: '450px' }}
        header="Seleccionar Fecha de Pago"
        modal
        onHide={() => setShowFechaDialog(false)}
        footer={
          <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowFechaDialog(false)} className="p-button-text" />
            <Button label="Confirmar" icon="pi pi-check" onClick={confirmarFechaPago} autoFocus />
          </div>
        }
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="fechaPago">Fecha de Pago</label>
            <Calendar
              id="fechaPago"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default IndexRevisionProvisiones;
