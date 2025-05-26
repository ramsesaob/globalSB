import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

const ModalResumenPagos = ({ 
    visible, 
    onHide, 
    summaryData, 
    totalSelected,
    onApprove 
}) => {
    const headerTemplate = (
        <div className="d-flex align-items-center gap-2">
            <i className="pi pi-file-excel text-primary" style={{ fontSize: '1.5rem' }} />
            <span className="fw-bold fs-3">Resumen de Provisiones Seleccionadas</span>
        </div>
    );

    const footerTemplate = (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 w-100">
            <div className="d-flex align-items-center gap-2">
                <span className="fw-bold">Total:</span>
                <span className="text-success fw-bold fs-4">${totalSelected.dol.toFixed(2)}</span>
                <span className="text-primary fw-bold fs-4">{totalSelected.bsf.toFixed(2)} Bs</span>
            </div>
            <div className="d-flex gap-3">
                <Button 
                    label="Cerrar" 
                    icon="pi pi-times" 
                    onClick={onHide} 
                    className="p-button-rounded p-button-outlined p-button-secondary"
                    style={{ minWidth: '120px' }}
                />
                <Button 
                    label="Aprobar Provisiones" 
                    icon="pi pi-check" 
                    onClick={onApprove}
                    className="p-button-rounded p-button-success"
                    style={{ minWidth: '150px' }}
                />
            </div>
        </div>
    );

    return (
        <Dialog
            header={headerTemplate}
            visible={visible}
            onHide={onHide}
            footer={footerTemplate}
            style={{ width: '90vw', maxWidth: '1200px' }}
            breakpoints={{ '1200px': '95vw', '960px': '98vw', '640px': '100vw' }}
            modal
            className="p-fluid"
        >
            <div className="row g-3 py-3">
                {/* Resumen por empresa */}
                <div className="col-12 col-lg-8">
                    <div className="card p-3 rounded-3 shadow-sm h-100">
                        <div className="d-none d-lg-flex bg-light p-3 rounded-3 mb-3">
                            <div className="flex-grow-1 fw-bold text-lg text-dark">
                                <i className="pi pi-building me-2"></i>
                                Empresa
                            </div>
                            <div className="w-8rem text-end fw-bold text-dark mx-1">Provisiones</div>
                            <div className="w-12rem text-end fw-bold text-success mx-1">USD</div>
                            <div className="w-12rem text-end fw-bold text-primary mx-1">Bs</div>
                        </div>

                        <div className="d-flex flex-column ">
                            {summaryData.map((empresa, index) => (
                                <div 
                                    key={index} 
                                    className="d-flex flex-column flex-lg-row  p-2 rounded-3 bg-light hover-shadow transition-all"
                                >
                                    <div className="d-flex align-items-start gap-2 flex-grow-1">
                                      
                                        <div>
                                            <div className="fw-bold fs-6 text-dark">
                                                {empresa.empresa}
                                            </div>
                                            <div className="d-lg-none mt-2">
                                                <div className="d-flex gap-3">
                                                    <span className="badge bg-dark rounded-pill">
                                                        {empresa.count} provisión(es)
                                                    </span>
                                                    <span className="text-success fw-bold">
                                                        ${empresa.dol.toFixed(2)}
                                                    </span>
                                                    <span className="text-primary fw-bold">
                                                        {empresa.bsf.toFixed(2)} Bs
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="d-none d-lg-flex align-items-center gap-4 mt-2 mt-lg-0">
                                        <div className="w-8rem text-center">
                                            <span className="badge bg-dark rounded-pill fs-6">
                                                {empresa.count} provisión(es)
                                            </span>
                                        </div>
                                        <div className="w-12rem text-end text-success fw-bold fs-5">
                                            ${empresa.dol.toFixed(2)}
                                        </div>
                                        <div className="w-12rem text-end text-primary fw-bold fs-5">
                                            {empresa.bsf.toFixed(2)} Bs
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Totales y estadísticas */}
                <div className="col-12 col-lg-4">
                    <div className="card p-4 rounded-3 shadow-sm h-100">
                        <div className="d-flex flex-column gap-4 h-100">
                            <div>
                                <h4 className="fw-bold mb-3 text-dark">
                                    <i className="pi pi-chart-bar me-2"></i>
                                    Resumen General
                                </h4>
                                <Divider />
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="card bg-light p-3 rounded-3 text-center">
                                            <div className="text-muted mb-2">
                                                <i className="pi pi-file me-2"></i>
                                                Total Provisiones
                                            </div>
                                            <div className="fw-bold fs-2 text-dark">
                                                {totalSelected.count}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="card bg-light p-3 rounded-3 text-center">
                                            <div className="text-muted mb-2">
                                                <i className="pi pi-percentage me-2"></i>
                                                Tasa Promedio
                                            </div>
                                            <div className="fw-bold fs-4 text-success">
                                                {(totalSelected.bsf / totalSelected.dol).toFixed(2)} Bs
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-light p-4 rounded-3">
                                <h5 className="text-primary mb-3">
                                    <i className="pi pi-wallet me-2"></i>
                                    Monto Total
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="text-muted">Dólares:</span>
                                        <span className="text-success fw-bold fs-3">
                                            ${totalSelected.dol.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="text-muted">Bolívares:</span>
                                        <span className="text-primary fw-bold fs-3">
                                            {totalSelected.bsf.toFixed(2)} Bs
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="alert alert-info d-flex align-items-center gap-2">
                                    <i className="pi pi-info-circle"></i>
                                    <small>Revise cuidadosamente antes de aprobar</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalResumenPagos;
