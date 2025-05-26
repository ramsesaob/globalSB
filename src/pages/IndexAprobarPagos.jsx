import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { DataView } from 'primereact/dataview';
import axios from 'axios';
import ModalResumenPagos from '../components/ModalResumenPagos';


const IndexAprobarPagos = () => {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPagos, setSelectedPagos] = useState([]);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        empresa: { value: null, matchMode: FilterMatchMode.EQUALS },
        sucursal: { value: null, matchMode: FilterMatchMode.EQUALS },
        proveedor: { value: null, matchMode: FilterMatchMode.CONTAINS },
        grupo: { value: null, matchMode: FilterMatchMode.EQUALS },
        subgrupo: { value: null, matchMode: FilterMatchMode.EQUALS },
        monto_dol: { value: null, matchMode: FilterMatchMode.BETWEEN },
        status: { value: 'pendiente', matchMode: FilterMatchMode.EQUALS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [empresasOptions, setEmpresasOptions] = useState([]);
    const [sucursalesOptions, setSucursalesOptions] = useState([]);
    const [gruposOptions, setGruposOptions] = useState([]);
    const [subgruposOptions, setSubgruposOptions] = useState([]);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const toast = useRef(null);
    const [summaryData, setSummaryData] = useState([]);
    const [totalSelected, setTotalSelected] = useState({ dol: 0, bsf: 0 });
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    useEffect(() => {
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://192.168.0.195/apick/pagos/index.json?tipo_pago=p2');
            setPagos(response.data.registros);
            
            // Extraer opciones únicas para filtros
            const empresas = [...new Set(response.data.registros.map(p => p.empresa))];
            const sucursales = [...new Set(response.data.registros.map(p => p.sucursal))];
            const grupos = [...new Set(response.data.registros.map(p => p.grupo))];
            const subgrupos = [...new Set(response.data.registros.map(p => p.subgrupo))];
            
            setEmpresasOptions(empresas.map(e => ({ label: e, value: e })));
            setSucursalesOptions(sucursales.map(s => ({ label: s, value: s })));
            setGruposOptions(grupos.map(g => ({ label: g, value: g })));
            setSubgruposOptions(subgrupos.map(sg => ({ label: sg, value: sg })));
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pagos:', error);
            setLoading(false);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los pagos',
                life: 3000
            });
        }
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center">
              
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar en todos los campos"
                    />
                </span>
            </div>
        );
    };

    const empresaFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={empresasOptions}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                placeholder="Seleccione empresa"
                showClear
                className="p-column-filter"
            />
        );
    };

    const sucursalFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={sucursalesOptions}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                placeholder="Seleccione sucursal"
                showClear
                className="p-column-filter"
            />
        );
    };

    const grupoFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={gruposOptions}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                placeholder="Seleccione grupo"
                showClear
                className="p-column-filter"
            />
        );
    };

    const subgrupoFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={subgruposOptions}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                placeholder="Seleccione subgrupo"
                showClear
                className="p-column-filter"
            />
        );
    };

    const montoFilterTemplate = (options) => {
        return (
            <div className="flex flex-column gap-2">
                <InputText
                    type="number"
                    placeholder="Mínimo"
                    onChange={(e) => options.filterCallback([e.target.value, options.value?.[1]], options.index)}
                    className="mb-2"
                />
                <InputText
                    type="number"
                    placeholder="Máximo"
                    onChange={(e) => options.filterCallback([options.value?.[0], e.target.value], options.index)}
                />
            </div>
        );
    };

    const montoBodyTemplate = (rowData) => {
        return `${parseFloat(rowData.monto_dol).toFixed(2)} $ | ${parseFloat(rowData.monto_bsf).toFixed(2)} Bs`;
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <span className={`p-tag p-tag-${rowData.status === 'pendiente' ? 'warning' : rowData.status === 'aprobado' ? 'success' : 'danger'}`}>
                {rowData.status}
            </span>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    className='btn btn-success '
                    label="Aprobar Pagos Seleccionados"
                    icon="bx bx-check" 
                    severity="success"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={!selectedPagos || selectedPagos.length === 0} 
                />

                <Button
                    className='btn btn-danger my-2 mx-2'
                    label="Rechazar seleccionados"
                    icon="bx bx-x"
                    severity="danger"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={!selectedPagos || selectedPagos.length === 0}
                />
                <Button
                    className='btn btn-info'
                    label="Ver Resumen"
                    icon="bx  bx-list-ul"
                    severity='info'
                    onClick={() => setShowSummaryModal(true)}
                    disabled={!selectedPagos || selectedPagos.length === 0}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <Button
                className='btn btn-warning me-2'
                label="Actualizar"
                icon="bx bx-refresh"
                onClick={fetchPagos}
            />
        );
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            const ids = selectedPagos.map(p => p.id);
            // Aquí iría tu llamada al backend para aprobar
            // await axios.post('/ruta/para/aprobar', { ids });
            
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Pagos aprobados correctamente',
                life: 3000
            });
            
            setSelectedPagos([]);
            setShowApproveDialog(false);
            await fetchPagos();
        } catch (error) {
            console.error('Error approving payments:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al aprobar pagos',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            const ids = selectedPagos.map(p => p.id);
            // Aquí iría tu llamada al backend para rechazar
            // await axios.post('/ruta/para/rechazar', { ids, motivo: rejectionReason });
            
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Pagos rechazados correctamente',
                life: 3000
            });
            
            setSelectedPagos([]);
            setRejectionReason('');
            setShowRejectDialog(false);
            await fetchPagos();
        } catch (error) {
            console.error('Error rejecting payments:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al rechazar pagos',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const approveDialogFooter = (
        <React.Fragment>
            <Button  label="Cancelar" icon="pi pi-times" outlined onClick={() => setShowApproveDialog(false)} />
            <Button label="Aprobar" icon="pi pi-check" severity="success" onClick={handleApprove} />
        </React.Fragment>
    );

    const rejectDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setShowRejectDialog(false)} />
            <Button label="Rechazar" icon="pi pi-times" severity="danger" onClick={handleReject} />
        </React.Fragment>
    );

     // Función para calcular resúmenes
    const calculateSummary = (selected) => {
        if (!selected || selected.length === 0) {
            setSummaryData([]);
            setTotalSelected({ dol: 0, bsf: 0 });
            return;
        }

        // Agrupar por empresa
        const byEmpresa = selected.reduce((acc, pago) => {
            if (!acc[pago.empresa]) {
                acc[pago.empresa] = {
                    empresa: pago.empresa,
                    dol: 0,
                    bsf: 0,
                    count: 0
                };
            }
            acc[pago.empresa].dol += parseFloat(pago.monto_dol);
            acc[pago.empresa].bsf += parseFloat(pago.monto_bsf);
            acc[pago.empresa].count += 1;
            return acc;
        }, {});

        // Calcular totales
        const totals = {
            dol: Object.values(byEmpresa).reduce((sum, emp) => sum + emp.dol, 0),
            bsf: Object.values(byEmpresa).reduce((sum, emp) => sum + emp.bsf, 0),
            count: selected.length
        };

        setSummaryData(Object.values(byEmpresa));
        setTotalSelected(totals);
    };

    // Actualizar cuando cambia la selección
    useEffect(() => {
        calculateSummary(selectedPagos);
    }, [selectedPagos]);

      const headerStyle = {
    background: 'rgb(0 141 61 / 84%)', // Color de fondo deseado para la cabecera
    color: 'white', // Color del texto en la cabecera, opcional
    fontWeight: 'bold', // Otras propiedades de estilo, opcional
    borderBottom: '1px solid #333', // Borde inferior para la cabecera
    textAlign: 'center', // Alinear el texto en la cabecera
  };
    
    return (
        <div className="card container-fluid p-2 p-md-4">
            <Toast ref={toast} />

            <h1 className="text-center mt-3 mb-3 h2">Pagos Pendientes de Aprobación</h1>
            
            <Toolbar 
                className="mb-3" 
                style={{backgroundColor: 'rgb(235 239 235)'}} 
                left={leftToolbarTemplate} 
                right={rightToolbarTemplate} 
            />
         
            <DataTable
                value={pagos}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                tableStyle={{ minWidth: '50rem' }}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={['empresa', 'sucursal', 'proveedor', 'grupo', 'subgrupo', 'observaciones']}
                header={renderHeader}
                emptyMessage="No se encontraron pagos pendientes."
                selection={selectedPagos}
                onSelectionChange={(e) => setSelectedPagos(e.value)}
                selectionMode="checkbox"
                scrollable
                scrollHeight="flex"
                className="p-datatable-responsive"
                resizableColumns
                columnResizeMode="fit"
                stripedRows
                showGridlines
                size="normal"
                style={{ width: '100%' }}
            >
                <Column 
                    selectionMode="multiple" 
                    headerStyle={{ ...headerStyle }} 
                    style={{ width: '3rem' }}
                />
               
                <Column
                    field="empresa"
                    header="Empresa"
                    headerStyle={{ ...headerStyle }} 
                    sortable
                    filter
                    filterField="empresa"
                    showFilterMenu={false}
                    filterElement={empresaFilterTemplate}
                    style={{ minWidth: '12rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-building mr-2"></i>
                            <span>{rowData.empresa}</span>
                        </div>
                    )}
                />
                <Column
                    field="sucursal"
                    header="Sucursal"
                    headerStyle={{ ...headerStyle }} 
                    sortable
                    filter
                    filterField="sucursal"
                    showFilterMenu={false}
                    filterElement={sucursalFilterTemplate}
                    style={{ minWidth: '10rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-map-marker mr-2"></i>
                            <span>{rowData.sucursal}</span>
                        </div>
                    )}
                />
                <Column 
                    field="proveedor" 
                    header="Proveedor"  
                    headerStyle={{ ...headerStyle }}  
                    sortable 
                    filter 
                    style={{ minWidth: '12rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-user mr-2"></i>
                            <span>{rowData.proveedor}</span>
                        </div>
                    )}
                />
                <Column
                    field="grupo"
                    header="Grupo"
                    headerStyle={{ ...headerStyle }} 
                    sortable
                    filter
                    filterField="grupo"
                    showFilterMenu={false}
                    filterElement={grupoFilterTemplate}
                    style={{ minWidth: '10rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-tag mr-2"></i>
                            <span>{rowData.grupo}</span>
                        </div>
                    )}
                />
                <Column
                    field="subgrupo"
                    header="Subgrupo"
                    headerStyle={{ ...headerStyle }} 
                    sortable
                    filter
                    filterField="subgrupo"
                    showFilterMenu={false}
                    filterElement={subgrupoFilterTemplate}
                    style={{ minWidth: '10rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-tags mr-2"></i>
                            <span>{rowData.subgrupo}</span>
                        </div>
                    )}
                />
                <Column
                    header="Monto"
                    headerStyle={{ ...headerStyle }} 
                    body={montoBodyTemplate}
                    sortable
                    sortField="monto_dol"
                    filter
                    filterField="monto_dol"
                    showFilterMenu={false}
                    filterElement={montoFilterTemplate}
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="observaciones" 
                    header="Observaciones"  
                    headerStyle={{ ...headerStyle }}  
                    style={{ minWidth: '12rem' }}
                    body={(rowData) => (
                        <div className="flex align-items-center">
                            <i className="pi pi-comment mr-2"></i>
                            <span>{rowData.observaciones || 'Sin observaciones'}</span>
                        </div>
                    )}
                />
                <Column 
                    field="status" 
                    header="Estado"  
                    headerStyle={{ ...headerStyle }}  
                    body={statusBodyTemplate} 
                    style={{ minWidth: '8rem' }} 
                />
            </DataTable>

         


            <Dialog
                visible={showApproveDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={approveDialogFooter}
                onHide={() => setShowApproveDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    <span>
                        ¿Está seguro de aprobar los {selectedPagos.length} pagos seleccionados?
                    </span>
                </div>
            </Dialog>

            <Dialog
                visible={showRejectDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Rechazar Pagos"
                modal
                footer={rejectDialogFooter}
                onHide={() => setShowRejectDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>
                            ¿Está seguro de rechazar los {selectedPagos.length} pagos seleccionados?
                        </span>
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="rejectionReason">Motivo del rechazo:</label>
                        <InputText
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ingrese el motivo del rechazo"
                        />
                    </div>
                </div>
            </Dialog>

              <ModalResumenPagos
                visible={showSummaryModal}
                onHide={() => setShowSummaryModal(false)}
                summaryData={summaryData}
                totalSelected={totalSelected}
                onApprove={() => {
                    setShowSummaryModal(false);
                    setShowApproveDialog(true);
                }}
            />
        </div>
    );
};

export default IndexAprobarPagos;