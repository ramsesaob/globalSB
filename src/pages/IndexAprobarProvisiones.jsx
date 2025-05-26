import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import ModalResumenPagos from '../components/ModalResumenPagos';
import Swal from 'sweetalert2';

const IndexAprobarProvisiones = () => {
    const [provisiones, setProvisiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvisiones, setSelectedProvisiones] = useState([]);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        empresa: { value: null, matchMode: FilterMatchMode.CONTAINS },
        proveedor: { value: null, matchMode: FilterMatchMode.CONTAINS },
        grupo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        subgrupo: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState([]);
    const [totalSelected, setTotalSelected] = useState({ dol: 0, bsf: 0, count: 0 });
    const toast = useRef(null);

    useEffect(() => {
        fetchProvisiones();
    }, []);

    const fetchProvisiones = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://192.168.0.195/apick/provisiones/index.json');
            setProvisiones(response.data.registros);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching provisiones:', error);
            setLoading(false);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar las provisiones',
                life: 3000
            });
        }
    };

   
    const handleApprove = async () => {
        try {
            setLoading(true);
            const provisionesToProcess = selectedProvisiones.map(p => ({
                id: p.id,
                fecha_pago: p.fecha_pago,
                user_id: 1 // Aquí deberías obtener el ID del usuario actual de tu sistema
            }));

            console.log('Datos a enviar:', provisionesToProcess);
            
            const response = await axios.put('http://192.168.0.195/apick/provisiones/aprobar.json', provisionesToProcess);
            console.log('Respuesta del servidor:', response.data);

            if (response.data.message) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
                
                setSelectedProvisiones([]);
                setShowApproveDialog(false);
                await fetchProvisiones();
            } else {
                throw new Error(response.data.message || 'Error al aprobar las provisiones');
            }
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            console.error('Estado de la respuesta:', error.response?.status);
            
            let errorMessage = 'Error al aprobar las provisiones';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            const provisionesToReject = selectedProvisiones.map(p => ({
                id: p.id,
                fecha_pago: p.fecha_pago,
                user_id: 1, // Aquí deberías obtener el ID del usuario actual de tu sistema
                motivo_anulado: rejectionReason
            }));
            
            const response = await axios.put('http://192.168.0.195/apick/provisiones/rechazar.json', provisionesToReject);

            if (response.data.message) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: response.data.message,
                    life: 3000
                });
                
                setSelectedProvisiones([]);
                setRejectionReason('');
                setShowRejectDialog(false);
                await fetchProvisiones();
            } else {
                throw new Error(response.data.message || 'Error al rechazar las provisiones');
            }
        } catch (error) {
            console.error('Error al rechazar provisiones:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error al rechazar las provisiones',
                life: 3000
            });
        } finally {
            setLoading(false);
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
                <h5 className="m-0">Provisiones Pendientes</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar..."
                        className="p-inputtext-sm"
                    />
                </span>
            </div>
        );
    };

    const montoBodyTemplate = (rowData) => {
        return (
            <div className="d-flex flex-column">
                <span className="text-success">${parseFloat(rowData.monto_dol).toFixed(2)}</span>
                <span className="text-primary">{parseFloat(rowData.monto_bs).toFixed(2)} Bs</span>
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    className='btn btn-success mx-2'
                    label="Aprobar Provisiones"
                    icon="bx bx-check" 
                    severity="success"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={!selectedProvisiones || selectedProvisiones.length === 0} 
                />

                <Button
                    className='btn btn-danger my-2 mx-2'
                    label="Rechazar seleccionados"
                    icon="bx bx-x"
                    severity="danger"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={!selectedProvisiones || selectedProvisiones.length === 0}
                />
                <Button
                    className='btn btn-info'
                    label="Ver Resumen"
                    icon="bx bx-list-ul"
                    severity='info'
                    onClick={() => setShowSummaryModal(true)}
                    disabled={!selectedProvisiones || selectedProvisiones.length === 0}
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
                onClick={fetchProvisiones}
            />
        );
    };

    // Calcular resumen cuando cambia la selección
    useEffect(() => {
        if (selectedProvisiones.length > 0) {
            const byEmpresa = selectedProvisiones.reduce((acc, prov) => {
                if (!acc[prov.empresa]) {
                    acc[prov.empresa] = {
                        empresa: prov.empresa,
                        dol: 0,
                        bsf: 0,
                        count: 0
                    };
                }
                acc[prov.empresa].dol += parseFloat(prov.monto_dol);
                acc[prov.empresa].bsf += parseFloat(prov.monto_bs);
                acc[prov.empresa].count += 1;
                return acc;
            }, {});

            const totals = {
                dol: Object.values(byEmpresa).reduce((sum, emp) => sum + emp.dol, 0),
                bsf: Object.values(byEmpresa).reduce((sum, emp) => sum + emp.bsf, 0),
                count: selectedProvisiones.length
            };

            setSummaryData(Object.values(byEmpresa));
            setTotalSelected(totals);
        } else {
            setSummaryData([]);
            setTotalSelected({ dol: 0, bsf: 0, count: 0 });
        }
    }, [selectedProvisiones]);

    const headerStyle = {
        background: 'rgb(0 141 61 / 84%)',
        color: 'white',
        fontWeight: 'bold',
        borderBottom: '1px solid #333',
        textAlign: 'center'
    };

    const approveDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setShowApproveDialog(false)} />
            <Button label="Aprobar" icon="pi pi-check" severity="success" onClick={handleApprove} />
        </React.Fragment>
    );

    const rejectDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setShowRejectDialog(false)} />
            <Button label="Rechazar" icon="pi pi-times" severity="danger" onClick={handleReject} />
        </React.Fragment>
    );

    return (
        <div className="card container-fluid p-2 p-md-4">
            <Toast ref={toast} />
            
            <h1 className="text-center mt-3 mb-3 h2">Provisiones Pendientes de Aprobación</h1>
            
            <Toolbar 
                className="mb-3" 
                style={{backgroundColor: 'rgb(235 239 235)'}} 
                left={leftToolbarTemplate} 
                right={rightToolbarTemplate} 
            />
         
            <DataTable
                value={provisiones}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '20rem' }}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={['empresa', 'proveedor', 'grupo', 'subgrupo', 'observaciones']}
                header={renderHeader}
                emptyMessage="No se encontraron provisiones pendientes."
                selection={selectedProvisiones}
                onSelectionChange={(e) => setSelectedProvisiones(e.value)}
                selectionMode="checkbox"
                scrollable
                scrollHeight="flex"
                className="p-datatable-responsive p-datatable-sm"
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
                    field="created"
                    header="Fecha de Solicitud"
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="fecha_pago"
                    header="Fecha de Pago"
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="nombre"
                    header="Nombre del Solicitante"
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="empresa" 
                    header="Empresa" 
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="proveedor" 
                    header="Proveedor" 
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '12rem' }}
                />
                <Column 
                    field="grupo" 
                    header="Grupo" 
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '10rem' }}
                />
                <Column 
                    field="subgrupo" 
                    header="Subgrupo" 
                    headerStyle={{ ...headerStyle }}
                    sortable
                    filter
                    style={{ minWidth: '10rem' }}
                />
                <Column 
                    field="monto_dol" 
                    header="Monto" 
                    headerStyle={{ ...headerStyle }}
                    body={montoBodyTemplate}
                    style={{ minWidth: '10rem' }}
                />
                <Column 
                    field="observaciones" 
                    header="Observaciones" 
                    headerStyle={{ ...headerStyle }}
                    style={{ minWidth: '15rem' }}
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
                        ¿Está seguro de aprobar las {selectedProvisiones.length} provisiones seleccionadas?
                    </span>
                </div>
            </Dialog>

            <Dialog
                visible={showRejectDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Rechazar Provisiones"
                modal
                footer={rejectDialogFooter}
                onHide={() => setShowRejectDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>
                            ¿Está seguro de rechazar las {selectedProvisiones.length} provisiones seleccionadas?
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

export default IndexAprobarProvisiones;
