import React from 'react'

const ModalVistaTrabajador = ({ trabajador, setModalVista }) => {
    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog  modal-dialog-centered modal-xl">
                    <div className="modal-content modal-trabajador">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Vista de informacion del trabajador(a) {trabajador.nombre} {trabajador.apellido}</h1>
                            <button type="button" className="btn btn-danger btn-close" onClick={() => setModalVista({ show: false, trabajador: null })} aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <h3 className=''>Informacion del trabajador(a)</h3>
                            <hr />
                            <div className="row d-flex justify-content-center align-items-center ">
                                <div className="col-md-6">
                                    <div className="card text-center " >
                                        <div className="card-header">
                                            <h5 className='text-center mt-2'><span className="badge bg-success">Datos Personales</span></h5>
                                        </div>
                                        <div className="card-body">
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item"><strong>Nombre:</strong> {trabajador.nombre}</li>
                                                <li className="list-group-item"><strong>Apellido:</strong> {trabajador.apellido}</li>
                                                <li className="list-group-item"><strong>Cédula:</strong> {trabajador.cedula}</li>
                                                <li className="list-group-item"><strong>Género:</strong> {trabajador.genero}</li>
                                                {trabajador.talla_camisa || trabajador.talla_pantalon || trabajador.talla_zapato ? (
                                                    <>
                                                        <li className="list-group-item"><strong>Talla de Camisa:</strong> {trabajador.talla_camisa  || 'No tiene talla  de camisaasignada'}</li>
                                                        <li className="list-group-item"><strong>Talla de Pantalón:</strong> {trabajador.talla_pantalon || 'No tiene talla de pantalon asignada'}</li>
                                                        <li className="list-group-item"><strong>Talla de Zapato:</strong> {trabajador.talla_zapato || 'No tiene talla zapato asignada'}</li>
                                                    </>
                                                ) : (
                                                    <li className="list-group-item">El trabajador no posee <span className="badge text-bg-primary"><strong>tallas</strong></span> asignadas.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card text-center " style={{ height: '100%' }}>
                                        <div className="card-header">
                                            <h5 className='mt-2'><span className="badge bg-success">Datos Empresariales</span></h5>
                                        </div>
                                        <div className="card-body">
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item"><strong>Nombre Sucursal:</strong> {trabajador.Nombre_Suc}</li>
                                                <li className="list-group-item"><strong>Descripción Sucursal:</strong> {trabajador.descripcion}</li>
                                                <li className="list-group-item"><strong>Código Sucursal:</strong> {trabajador.codigosuc}</li>
                                                <li className="list-group-item"><strong>Departamento:</strong> {trabajador.orgName}</li>
                                                <li className="list-group-item"><strong>RIF Cliente:</strong> {trabajador.cliente}</li>
                                                <li className="list-group-item"><strong>Galac ID:</strong> {trabajador.Galac_id}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="card text-center " style={{ height: '100%' }}>
                                        <div className="card-header ">
                                            <h5 className='mt-2'><span className="badge bg-success">Equipos Asignados</span></h5>
                                        </div>
                                        <div className="card-body">
                                            <ul className="list-group list-group-flush">
                                                {trabajador.telefono === 1 ? (
                                                    <>
                                                        <li className="list-group-item"><strong>Modelo del Teléfono Corporativo:</strong> {trabajador.telefono_modelo || 'Modelo de telefono no registrado'}</li>
                                                        <li className="list-group-item"><strong>Serial del Teléfono Corporativo:</strong> {trabajador.telefono_serial || 'Serial de telefono no registrado'}</li>
                                                    </>
                                                ) : (
                                                    <li className="list-group-item">El trabajador no posee un <span className='badge text-bg-primary'><strong>teléfono </strong></span> asignado.</li>
                                                )}
                                                {trabajador.radio_serial ? (
                                                    <>
                                                        <li className="list-group-item"><strong>Modelo del Radio:</strong> {trabajador.radio_modelo || 'Modelo de radio no registrado'}</li>
                                                        <li className="list-group-item"><strong>Serial del Radio:</strong> {trabajador.radio_serial || 'Serial de radio no registrado'}</li>
                                                    </>
                                                ) : (
                                                    <li className="list-group-item">El trabajador no posee un <span className="badge text-bg-primary"><strong>radio</strong></span> asignado.</li>
                                                )}
                                                {trabajador.equipo_computacion === 1 ? (
                                                    <>

                                                        <li className="list-group-item"><p className='fw-bold'>El trabajador posee un equipo de computacion asigandor</p> <p className='text-success'>Modelo del Equipo de computacion es:</p> <strong>{trabajador.modelo_equipo_computacion}</strong></li>
                                                    </>
                                                ) : (
                                                    <li className="list-group-item">El trabajador no posee un <span className="badge text-bg-primary"><strong>equipo de computación</strong></span> asignado.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" onClick={() => setModalVista({ show: false, trabajador: null })}
                            ><i className='bi bi-x-square me-1'></i>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalVistaTrabajador