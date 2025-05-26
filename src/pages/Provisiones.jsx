import { useEffect, useState, useContext } from "react"
import { carritoContext } from '../contexts/carritoContext'
import Swal from "sweetalert2"
import gruposData from '../components/Grupos.json'; 
import InfoProveedor from "../components/InfoProveedor";

const Provisiones = () => {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    sucursal: '',
    proveedor: '',
    proveedorInfo: null,
    cuenta_proveedor: '',
    monto_bsf: '0',
    tasa: '0',
    monto_dol: '0.0000',
    grupo: '',
    subgrupo: '',
    banco: '',
    motivo: '',
    retencion: false,
    observaciones: '',
    fecha_pago: '',
    cuentasBancarias: [],
    cuentaSeleccionada: null
  });

  const [proveedores, setProveedores] = useState([]);
  const [cuentasProveedores, setCuentasProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tasas, setTasas] = useState([]);
  const { apiBaseUrl } = useContext(carritoContext);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState({
    proveedor: false
  });

  // Manejadores de cambios
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'retencion') {
      setFormData(prev => ({
        ...prev,
        retencion: checked ? 1 : 0
      }));
      return;
    }

    if (name === 'empresa') {
      const selected = sucursales.find(item => item.descripcion === value);
      setFormData(prev => ({
        ...prev,
        empresa: selected?.nombre || '',
        sucursal: selected?.descripcion || ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proveedoresRes, cuentasRes, sucursalesRes, tasasRes] = await Promise.all([
          fetch(`${apiBaseUrl}/pagos/proveedores.json`),
          fetch(`${apiBaseUrl}/pagos/proveedoresct.json`),
          fetch(`${apiBaseUrl}/sucursal/sucursales.json`),
          fetch(`${apiBaseUrl}/result/tasa.json`)
        ]);
        
        const proveedoresData = await proveedoresRes.json();
        const cuentasData = await cuentasRes.json();
        const sucursalesData = await sucursalesRes.json();
        const tasasData = await tasasRes.json();
        
        setProveedores(proveedoresData.proveedores);
        setCuentasProveedores(cuentasData.proveedores);
        setSucursales(sucursalesData.sucursales || []);
        setTasas(tasasData.resultado || []);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  const handleAmountBolivaresChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      monto_bsf: value,
      monto_dol: calculateMontoUsd(value, prev.tasa)
    }));
  };

  const handleTasaChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      tasa: value,
      monto_dol: calculateMontoUsd(prev.monto_bsf, value)
    }));
  };

const calculateMontoUsd = (montoBsf, tasa) => {
    // Función para parsear la tasa y convertirla en número
    const parseTasaToNumber = (tasaValue) => {
        if (!tasaValue) return 0;
        // Convertir la coma a punto solo en la tasa
        const cleanedTasa = tasaValue.toString().replace(',', '.');
        const number = parseFloat(cleanedTasa);
        return isNaN(number) ? 0 : number;
    };

    // Convertir el monto en bolívares a número, eliminando comas y puntos como separadores de miles
    const numMontoBsf = parseFloat(montoBsf.replace(/,/g, ''));

    // Convertir la tasa a número, asegurándose de que sea un valor válido con 3 decimales
    let numTasa = parseTasaToNumber(tasa);

    // Limitar la tasa a 3 decimales
    numTasa = parseFloat(numTasa.toFixed(3));

    // Verificar que tanto el monto como la tasa sean válidos antes de calcular
    if (numMontoBsf >= 0 && numTasa > 0) {
        const resultado = numMontoBsf / numTasa;
        return resultado.toFixed(2);  // Limitar a 2 decimales para el resultado
    } else {
        return "0.00";  // Si no es válido, devolver 0.00
    }
};


  const handleChangeProveedor = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      proveedor: value,
      proveedorInfo: null,
      cuentasBancarias: [],
      cuentaSeleccionada: null
    }));

    if (value !== '') {
      setFilteredProveedores(proveedores.filter(item =>
        item.nombre.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredProveedores([]);
    }
  };

  const handleSelectProveedor = (item) => {
    const cuentasProveedor = cuentasProveedores.filter(
      cuenta => cuenta.codigo === item.codigo
    );

    setFormData(prev => ({
      ...prev,
      proveedor: item.nombre,
      proveedorInfo: item,
      cuenta_proveedor: item.codigo,
      grupo: item.grupo,
      subgrupo: item.subgrupo,
      cuentasBancarias: cuentasProveedor,
      cuentaSeleccionada: cuentasProveedor[0] || null
    }));
    
    setShowSuggestions(prev => ({...prev, proveedor: false}));
  };

  // Enviar formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Primero verificamos si existe un pago similar
    const checkResponse = await fetch(`${apiBaseUrl}/provisiones/index.json`);
    if (!checkResponse.ok) throw new Error("Error al verificar pagos existentes");
    
    const existingPaymentsData = await checkResponse.json();
    const existingPayments = existingPaymentsData.pagos || []; // Asegúrate de que esto coincida con la estructura de tu API
    
    // Buscar pagos con el mismo proveedor y monto similar
  // Buscar pagos con el mismo proveedor, grupo, subgrupo y monto similar
const duplicatePayment = existingPayments.find(payment => 
  payment.proveedor == formData.proveedor &&
  payment.grupo == formData.grupo &&
  payment.subgrupo == formData.subgrupo &&
  Math.abs(parseFloat(payment.monto_bsf) - parseFloat(formData.monto_bsf)) < 0.01
);

    
    if (duplicatePayment) {
      Swal.fire({
        title: '¡Pago duplicado detectado!',
        html: `Ya existe un pago programado para este proveedor (<strong>${formData.proveedor}</strong>) con un monto similar (<strong>${duplicatePayment.monto_bsf} BsF</strong>).<br><br>
               ¿Estás seguro de que deseas continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          await savePayment();
        } else {
          setIsSubmitting(false);
        }
      });
      return; // Importante: salir de la función aquí
    }
    
    // Si no hay duplicados, guardar normalmente
    await savePayment();
    
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: '¡Error!',
      text: 'Hubo un error al verificar pagos existentes',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
    });
    setIsSubmitting(false);
  }
};
console.log(formData);
// Función separada para guardar el pago
const savePayment = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/provisiones/guardar.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fecha_pago: formData.fecha_pago,
        nombre: formData.nombre,
        departamento: formData.departamento,
        empresa: formData.empresa,     
         proveedor: formData.proveedor,
        cuenta_proveedor: formData.cuentasBancarias,
        monto_bs: parseFloat(formData.monto_bsf),
        monto_dol: parseFloat(formData.monto_dol),
        tasa: parseFloat(formData.tasa),
        grupo: formData.grupo,
        subgrupo: formData.subgrupo,
        observaciones: formData.motivo,
        banco: formData.banco,
     
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar el pago');
    }

    const result = await response.json();
    Swal.fire({
      title: '¡Pago guardado exitosamente!',
      text: result.message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
    });
    
    // Limpiar formulario después de guardar
    setFormData({
      fecha_pago: '',
      nombre: '',
      departamento: '',
      sucursal: '',
      proveedor: '',
      cuenta_proveedor: '',
      monto_bsf: '0',
      tasa: '0',
      monto_dol: '0.0000',
      grupo: '',
      subgrupo: '',
      motivo: '',
      retencion: false,
      observaciones: ''

    });
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: '¡Error!',
      text: error.message || 'Hubo un error al guardar la solicitud de pago',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn btn-primary',
      },
    });
    throw error; // Re-lanzamos el error para que lo capture el llamador
  } finally {
    setIsSubmitting(false);
  }
};

// Agregar este useEffect
useEffect(() => {
  const checkDuplicatePayments = async () => {
    setDuplicateWarning(null); // Limpiamos la advertencia anterior

    console.log("Formulario actual:", formData);  // Verificar qué datos se están enviando

    // Verificar que todos los campos esenciales están completos y monto_bsf es válido
   const formProveedor = formData.proveedor.trim().toLowerCase();
    const formEmpresa = formData.empresa.trim().toLowerCase();


    if (
      formData.proveedor &&
      formData.empresa 
      
    ) {
      try {
        const response = await fetch(`${apiBaseUrl}/provisiones/index.json`);
        if (!response.ok) return;

        const data = await response.json();
       // console.log("Datos de pagos obtenidos:", data);
        const existingPayments = data.registros;  // Asumiendo que los pagos actuales vienen de 'data.registros'

        const duplicate = existingPayments.find(payment => {
        

          // Validar que los campos no sean null, undefined o vacíos antes de hacer trim()
          const paymentProveedor = payment.proveedor ? payment.proveedor.trim().toLowerCase() : '';
          const paymentEmpresa = payment.empresa ? payment.empresa.trim().toLowerCase() : '';
         
          // Comparar los campos clave, manejando tolerancia en montos y tasas
          return (
            paymentProveedor === formProveedor &&
            paymentEmpresa === formEmpresa 
          );
        });

        if (duplicate) {
          // Si se encontró un pago duplicado, se muestra una advertencia
          setDuplicateWarning(`Ya existe un pago con el mismo proveedor ${formProveedor} y empresa ${formEmpresa}.`); 
        } else {
          // Si no hay duplicado, continúa con la lógica normal
          setDuplicateWarning(null);
        }
      } catch (error) {
        console.error('Error al verificar pagos duplicados:', error);
      }
    }
  };

  // Debounce: esperar 1 segundo después del último cambio para ejecutar la validación
  const debounceTimer = setTimeout(checkDuplicatePayments, 1000);

  // Limpiar el timeout cuando el componente se desmonte o cuando cambien las dependencias
  return () => clearTimeout(debounceTimer);
}, [formData.proveedor, formData.empresa, apiBaseUrl]);


  return (
    <div className="container">
      <h3 className="text-center pt-3">
       < i className='bx  bx-timer'  ></i>  Programacion de Provisiones  < i className='bx bxs-bank aling-end'  ></i> 
      </h3>
      
                {duplicateWarning && (
    <div className="alert alert-danger text-center " style={{ maxWidth: '1500px', fontSize: '1.2rem' }}>
      <i className="bx bx-error-circle me-2"></i> {duplicateWarning}
    </div>
  )}
      <div className="card p-3" style={{ background: "#edeaea" }}>
        <form onSubmit={handleSubmit}>
          <div className="row gx-4 gy-4">
             {/* Fecha del pago */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="nombre" className="form-label">
                  Fecha del pago
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="nombre"
                  name="fecha_pago"
                  placeholder="Fecha del pago"
                  value={formData.fecha_pago}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
           
            {/* Nombre y apellido */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="nombre" className="form-label">
                  Nombre y apellido
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre y apellido"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Departamento */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="departamento" className="form-label">
                  Departamento
                </label>
                <select
                  name="departamento"
                  id="departamento"
                  className="form-select"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Departamentos solicitantes</option>
                  <option value="Ingresos">INGRESOS</option>
                  <option value="Impuestos">IMPUESTOS</option>
                  <option value="Legal">LEGAL</option>
                  <option value="Infraestructura">INFRAESTRUCTURA</option>
                  <option value="Mercancias nacionales">MERCANCIAS NACIONALES</option>
                  <option value="Tecnología">TECNOLOGIA</option>
                  <option value="RRHH">RRHH</option>
                  <option value="Carla Colina">CARLA COLINA</option>
                  <option value="Karina Hamid">KARINA HAMID</option>
                  <option value="Compras oficina">COMPRAS OFICINA</option>
                  <option value="Marketing">MARKETING</option>
                  <option value="Cuentas por pagar 1">CUENTAS POR PAGAR 1</option>
                  <option value="Cuentas por pagar 2">CUENTAS POR PAGAR 2</option>
                  <option value="Cuentas por pagar 3">CUENTAS POR PAGAR 3</option>
                  <option value="Cuentas por pagar 4">CUENTAS POR PAGAR 4</option>
                  <option value="Cuentas por pagar 5">CUENTAS POR PAGAR 5</option>
                </select>
              </div>
            </div>

            {/* Sucursal */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="sucursal" className="form-label">
                  Empresa
                </label>
                
                  <select 
                    name="empresa" 
                    id="empresa" 
                    className="form-select"
                    value={formData.sucursal} // mostrar el valor de la descripción
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Seleccionar sucursal</option>
                    {sucursales.map((item, index) => (
                      <option 
                        key={`sucursal-${item.id_sucursal || index}`} 
                        value={item.descripcion} // para poder identificar al seleccionar
                      >
                        {item.nombre} ({item.descripcion})
                      </option>
                    ))}
                  </select>

              </div>
            </div>

             <div className="col-md-3">
              <div className="card p-2 position-relative">
                <label htmlFor="proveedor" className="form-label">
                  Proveedor
                </label>
                <div className="position-relative">
                  <input 
                    type="text"
                    className="form-control"
                    id="proveedor"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleChangeProveedor}
                    onFocus={() => setShowSuggestions(prev => ({...prev, proveedor: true}))}
                    onBlur={() => setTimeout(() => setShowSuggestions(prev => ({...prev, proveedor: false})), 100)}
                    autoComplete="off"
                    required
                  />

                  {showSuggestions.proveedor && formData.proveedor !== '' && (
                    <ul 
                      className="list-group position-absolute w-100 bg-white"
                      style={{
                        top: '100%',
                        left: 0,
                        zIndex: 10,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderTop: 'none'
                      }}
                    >
                      {filteredProveedores.length > 0 ? (
                        filteredProveedores.map((item, index) => (
                          <li
                            key={`proveedor-${index}`}
                            className="list-group-item list-group-item-action"
                            onMouseDown={() => handleSelectProveedor(item)}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.nombre}
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">Sin resultados</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Cuenta Bancaria */}
            {formData.proveedorInfo && (
              <div className="col-md-3">
                <div className="card p-2">
                  <label htmlFor="cuenta_bancaria" className="form-label">
                    Seleccionar Cuenta Bancaria
                  </label>
                  <select
                    className="form-select"
                    id="cuenta_bancaria"
                    value={formData.cuentaSeleccionada?.n_cuenta || ''}
                    onChange={(e) => {
                      const selected = formData.cuentasBancarias.find(
                        cuenta => cuenta.n_cuenta === e.target.value
                      );
                      setFormData(prev => ({
                        ...prev,
                        cuentaSeleccionada: selected
                      }));
                    }}
                    required
                  >
                    {formData.cuentasBancarias.map((cuenta, index) => (
                      <option key={index} value={cuenta.n_cuenta}>
                        {cuenta.codigo_banco} - {cuenta.n_cuenta}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}


            {/* Monto bolívares */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="monto_bsf" className="form-label">
                  Monto bolivares
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="monto_bsf"
                  name="monto_bsf"
                  placeholder="0.00"
                  value={formData.monto_bsf}
                  onChange={handleAmountBolivaresChange}
                  required
                />
              </div>
            </div>

            {/* Tasa */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="tasa" className="form-label">
                  Tasa
                </label>
                <div className="input-group">
                  <select
                    className="form-select"
                    id="tasa_select"
                    onChange={(e) => {
                      const selectedTasa = tasas.find(t => t.Currency === e.target.value);
                      if (selectedTasa) {
                        setFormData(prev => ({
                          ...prev,
                          tasa: selectedTasa.Rate,
                          monto_dol: calculateMontoUsd(prev.monto_bsf, selectedTasa.Rate)
                        }));
                      }
                    }}
                  >
                    <option value="">Seleccionar moneda</option>
                    {tasas.map((tasa, index) => (
                      <option key={index} value={tasa.Currency}>
                        {tasa.Currency} - {tasa.Rate}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    id="tasa"
                    name="tasa"
                    placeholder="0.00"
                    value={formData.tasa}
                    onChange={handleTasaChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Monto USD */}
            <div className="col-md-3">
              <div className="card p-2">
                <label htmlFor="monto_dol" className="form-label">
                  Monto USD
                </label>
                <input
                  type="text"
                  className="form-control deactive-input"
                  id="monto_dol"
                  name="monto_dol"
                  placeholder="0.00"
                  value={formData.monto_dol}
                  readOnly
                />
              </div>
            </div>


            {/* Motivo (Explicación del gasto) */}
            <div className="col-md-6">
              <div className="card p-2">
                <label htmlFor="motivo" className="form-label">
                  Explicación del gasto
                </label>
                <textarea
                  name="motivo"
                  id="motivo"
                  className="form-control"
                  placeholder="Explicación"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            {/* Observaciones */}
            <div className="col-md-6">
              <div className="card p-2">
                <label htmlFor="observaciones" className="form-label">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  id="observaciones"
                  className="form-control"
                  placeholder="Observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Retención */}
            <div className="col-md-3">
              <div className="form-check form-switch">
               <input
                    className="form-check-input"
                    type="checkbox"
                    id="retencion"
                    name="retencion"
                    checked={formData.retencion === 1}
                    onChange={handleChange}
                  />

                <label className="form-check-label" htmlFor="retencion">
                  ¿El proveedor es agente de retención?
                </label>
              </div>
            </div>
          </div>

        
        
            {/* Botón de enviar + advertencia */}
              <div className="d-flex flex-column align-items-center mt-3">
                <button 
                  className="btn btn-success mb-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar solicitud de Provisión'}
                </button>

                {duplicateWarning && (
                  <div className="alert alert-danger text-center" style={{ maxWidth: '500px' }}>
                    <i className="bx bx-error-circle me-2"></i> {duplicateWarning}
                  </div>
                )}
              </div>
        </form>
      
        <InfoProveedor
          proveedorInfo={formData.proveedorInfo} 
          cuentaSeleccionada={formData.cuentaSeleccionada} 
        />
      </div>
    </div>
  )
}

export default Provisiones