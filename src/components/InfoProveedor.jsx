import React from 'react'

const InfoProveedor = ({ proveedorInfo, cuentaSeleccionada }) => {
  if (!proveedorInfo) return null;
  return (
     <div className="card p-3 mb-3 bg-light">
      <h5>Información del Proveedor</h5>
      <div className="row">
        <div className="col-md-4">
          <p><strong>RIF:</strong> {proveedorInfo.Rif}</p>
          <p><strong>Código:</strong> {proveedorInfo.codigo}</p>
        </div>
        <div className="col-md-4">
          <p><strong>Ciudad:</strong> {proveedorInfo.ciudad}</p>
          <p><strong>Clase:</strong> {proveedorInfo.clase}</p>
        </div>
        <div className="col-md-4">
          <p><strong>Grupo:</strong> {proveedorInfo.grupo}</p>
          <p><strong>Subgrupo:</strong> {proveedorInfo.subgrupo}</p>
        </div>
      </div>
      
      {cuentaSeleccionada && (
        <div className="mt-3">
          <h6>Información Bancaria</h6>
          <div className="row">
            <div className="col-md-6">
               <p><strong>Nombre:</strong> {cuentaSeleccionada.Nombre}</p>
               <p><strong>Codigo:</strong> {cuentaSeleccionada.codigo}</p>
              <p><strong>Banco:</strong> {cuentaSeleccionada.codigo_banco}</p>
              <p><strong>Cuenta:</strong> {cuentaSeleccionada.n_cuenta}</p>
              <p><strong>Nombre Activo:</strong> {cuentaSeleccionada.nombre_act}</p>
              <p><strong>Codigo Activo:</strong> {cuentaSeleccionada.codigo_act}</p>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoProveedor
