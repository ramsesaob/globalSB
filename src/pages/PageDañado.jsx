import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import AgregarArticulos from '../components/AgregarARticulos';
import { carritoContext } from '../contexts/carritoContext';
import ModalAggTrabDan from '../components/ModalAggTrabDan';
import moment from 'moment';
import Swal from 'sweetalert2';

// Supongo que `datosUsuario` es el objeto que contiene la información del usuario


const PageDañado = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const handleShow = () => setModalVisible(true);
    const handleClose = () => setModalVisible(false);
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
    const [productos, setProductos] = useState(() => {
    const savedProducts = localStorage.getItem('productos');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [modalItem, setModalItem] = useState(() => {
    const savedModalItem = localStorage.getItem('modalItem');
    return savedModalItem ? JSON.parse(savedModalItem) : null; // Si no hay valor en localStorage, se inicializa en null
  });
    const [showModal, setShowModal] = useState(false);
    const [correlativo, setCorrelativo] = useState(null);
    const [ responsable, setResponsable ] = useState('');
   const [trabajadoresData, setTrabajadoresData] = useState({});  // Cambié a un objeto para asociar trabajadores a productos
   const [tasaDia2, setTasaDia2] = useState(0);
   
      // Verificar si algún producto tiene tipo "TRANSFERENCIA"
  const mostrarColumnaDocumento = productos.some(producto => producto.tipo === 'TRANSFERENCIA');
    useEffect(() => {
        // Guardar productos en localStorage
        localStorage.setItem('productos', JSON.stringify(productos));
      }, [productos]);
      useEffect(() => {
        // Guardar productos en localStorage
        localStorage.setItem('modalItem', JSON.stringify(modalItem));
      }, [modalItem]);
    const openModal = (producto) => {
        setModalItem(producto);
        
        setShowModal(true);
      };
      
      const closeModal = () => {
        
        setShowModal(false);
      };
      
//console.log('Productos en el padre:', productos);

  // Lógica para obtener la cuenta según el tipo de daño
  const getCuentaFromTipo = (tipo) => {
    const cuentas = {
      'TRANSFERENCIA': '5.5.1.001',
      'INTERTIENDA': '5.5.1.002',
      'OBSOLECENCIA': '5.5.1.003',
      'HURTO': '5.5.1.004',
      'TIENDA': '5.5.1.005',
      'CLIENTE': '5.5.1.006',
      'CONTAINER GALPON': '5.5.1.007',
      'MANIPULACION GALPON': '5.5.1.008',
      'SINIESTRO': '5.5.1.009',
      'COBRO A TRABAJADORES': '1.1.04.117',
      'NAVIDAD': '5.5.1.010',
    };
    return cuentas[tipo] || ''; // Devuelve una cuenta vacía si el tipo no existe
  };

  const handleInputChange = (index, event, field) => {
    const { value } = event.target;
    const updatedProductos = [...productos];
  
    // Si se cambia el tipo de daño, actualiza la cuenta correspondiente
    if (field === 'tipo') {
      const cuenta = getCuentaFromTipo(value);  // Obtiene la cuenta basada en el tipo
      updatedProductos[index] = {
        ...updatedProductos[index],
        [field]: value,
        cuenta: cuenta, // Asigna la cuenta al producto
      };
    } else {
      updatedProductos[index][field] = value;
    }
  
    setProductos(updatedProductos);
  };
  
  const handleTipoChange = (index, e) => {
    const tipo = e.target.value;
    const updatedProductos = [...productos];
  
    // Cambiar tipo de producto
    updatedProductos[index].tipo = tipo;
  
    // Asignar la cuenta automáticamente al cambiar el tipo
    const cuenta = getCuentaFromTipo(tipo);
    updatedProductos[index].cuenta = cuenta;
  
    // Si el tipo es "TRANSFERENCIA", habilitamos el campo para el número de documento
    if (tipo === "TRANSFERENCIA") {
      updatedProductos[index].showDocumentoInput = true;
    } else {
      updatedProductos[index].showDocumentoInput = false;
    }
  
    // Actualizamos el producto
    setProductos(updatedProductos);
  };

  console.log(datosUsuario);
  
 const obtenerUltimoCorrelativo = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/danado/numped.json`);

      if (!response.ok) {
        throw new Error('No se pudo obtener el último correlativo');
      }

      const data = await response.json();
      const ultimoCorrelativo = data.orden[0].nsolicitud;

      return parseInt(ultimoCorrelativo);
    } catch (error) {
      console.error('Error al obtener el último correlativo:', error);
      return null; // Si ocurre un error, retornar null
    }
  };
 

  // Función para generar el nuevo correlativo
  const generarCorrelativo = async () => {
    const ultimoCorrelativo = await obtenerUltimoCorrelativo();
   // console.log('Correlativo obtenido:', ultimoCorrelativo);
    if (ultimoCorrelativo === null) {
      console.error('No se pudo obtener el último correlativo. No se puede generar uno nuevo.');
      return null;
    }

    // Generar el nuevo correlativo, incrementando el último correlativo
    const nuevoCorrelativo = ultimoCorrelativo + 1;
    //console.log('Nuevo correlativo generado:', nuevoCorrelativo);

    return nuevoCorrelativo;
  };

  // useEffect para actualizar el correlativo cada 5 segundos
  useEffect(() => {
    // Función para actualizar el correlativo
    const actualizarCorrelativo = async () => {
      const nuevoCorrelativo = await generarCorrelativo();
      if (nuevoCorrelativo !== null) {
        setCorrelativo(nuevoCorrelativo);  // Guardamos el correlativo en el estado solo si cambia
      }
    };

    // Llamada inicial
    actualizarCorrelativo();

    // Establecer un intervalo para actualizar el correlativo cada 5 segundos
    const intervalo = setInterval(() => {
      actualizarCorrelativo();
    }, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, []);  // Este efecto solo se ejecutará una vez al montar el componente

  // Usamos useMemo para memorizar el valor de "Correlativo" o "Cargando..."
  const mensajeCorrelativo = useMemo(() => {
    return correlativo !== null ? correlativo : "Cargando...";
  }, [correlativo]);  // Se recalcula solo cuando 'correlativo' cambia

  const background = {
    background: '#76b852',  
 background: '-webkit-linear-gradient(to left,rgb(94, 211, 31),rgb(90, 160, 53))',  
 background: 'linear-gradient(to left,rgb(213, 230, 228),rgb(218, 237, 238))', 
 width: '100%',
 margin: 'auto',

   };
 
   const handleSave = async () => {
    // Validación del campo responsable
    if (!responsable.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'El campo "Responsable" no puede estar vacío.',
      });
      return;
    }
  
    // Validación de los campos de los productos
    const productosInvalidos = productos.map((producto, index) => {
      const camposVacios = [];
      if (!producto.codigo?.trim()) camposVacios.push('Código');
      if (!producto.descripcion?.trim()) camposVacios.push('Descripción');
      if (!producto.departamento?.trim()) camposVacios.push('Departamento');
      if (!producto.categoria?.trim()) camposVacios.push('Categoría');
      if (!producto.cod_barra?.trim()) camposVacios.push('Código de Barra');
      if (!producto.composicion?.trim()) camposVacios.push('Composición');
      if (!producto.pcs_danadas) camposVacios.push('pcs_danadas');
      if (!producto.presentacion_set) camposVacios.push('Piezas por Set');
      if (!producto.stock) camposVacios.push('Stock');
      if (!(producto.tipo?.trim())) camposVacios.push('Tipo de Dañado');
  
      if (camposVacios.length > 0) {
        return {
          index,
          codigo: producto.codigo,
          camposVacios,
        };
      }
  
      return null;
    }).filter((producto) => producto !== null);
  
    if (productosInvalidos.length > 0) {
      const mensajeError = productosInvalidos
        .map(
          (producto) =>
            `Producto con código "${producto.codigo}" tiene los siguientes campos vacíos: ${producto.camposVacios.join(
              ', '
            )}`
        )
        .join('\n');
  
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos en productos',
        text: mensajeError,
      });
      return;
    }
  
    const cabecera = {
      motivo: 'DAÑADO',
      responsable,
      status: 'Pendiente',
      salida: null,
      entrada: null,
      revision: null,
      anulada: null,
      fecha_revision: null,
      fecha_anulada: null,
      user_id: datosUsuario.user.id,
      nsolicitud: correlativo,
      sucursal: datosUsuario.user.sucursale.codigo,
    };
  
    try {
      // Validar que trabajadoresData no esté vacío si el tipo de daño es 'COBRO A TRABAJADORES'
      const productosConCobroATrabajadores = productos.filter(producto => producto.tipo === 'COBRO A TRABAJADORES');
      if (productosConCobroATrabajadores.length > 0 && Object.keys(trabajadoresData).length === 0) {
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: 'Debe agregar trabajadores para los productos con tipo "COBRO A TRABAJADORES".',
        });
        return;
      }
  
      // 1. Guardar la cabecera de la solicitud
      const responseCabecera = await fetch(`${apiBaseUrl}/danado/guardar.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cabecera),
      });
  
      if (!responseCabecera.ok) {
        throw new Error('Error al guardar la cabecera de la solicitud');
      }
  
      const dataCabecera = await responseCabecera.json();
      const sol_danado_id = dataCabecera.sol_danado_id;
  
      // 2. Guardar los detalles de todos los productos dañados (sin filtrar por tipo)
      const productosDetalle = productos.map(producto => ({
        ...producto,
        sol_danado_id,
        user_id: datosUsuario.user.id,
        sucursal: datosUsuario.user.sucursale.codigo,
      }));
  
      const responseProductos = await fetch(`${apiBaseUrl}/danado/detalle.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productosDetalle),
      });
  
      if (!responseProductos.ok) {
        throw new Error('Error al guardar los productos dañados');
      }
  
      const dataProductos = await responseProductos.json();
  
      // 3. Obtener los IDs y Códigos de los productos guardados
      const productosGuardados = dataProductos.saved_product_ids;
  
      // 4. Asociar trabajadores con los productos guardados, solo para productos de tipo 'COBRO A TRABAJADORES'
      const trabajadores = Object.values(trabajadoresData)
        .flat()
        .map((trabajador) => {
          const productostrabajdor = productos.find(
            (producto) =>
              producto.id === trabajador.productoId && producto.tipo === 'COBRO A TRABAJADORES'
          );
  
          if (productostrabajdor) {
            const productoRelacionado = productosGuardados.find(
              (producto) =>
                producto.codigo === productostrabajdor.codigo || producto.id === productostrabajdor.id
            );
  
            if (productoRelacionado) {
              return {
                codigo_art: productoRelacionado.codigo,
                cedula: trabajador.cedula,
                id_galac: trabajador.id_galac,
                total: trabajador.descuento,
                tasa: tasaDia2 || 0,
                desc_dolar: trabajador.descuento,
                desc_boli: trabajador.montoBolivares,
                cuotas: trabajador.cuotas,
                item_danado_id: productoRelacionado.id,
                motivo: 'Cobro por Daño',
                user_id: datosUsuario.user.id,
                cod_suc: datosUsuario.user.sucursale?.codigo || '',
                sol_danado_id, // ID de la cabecera
              };
            }
          }
  
          return null;
        })
        .filter((item) => item !== null);
  
      // 5. Guardar los trabajadores
      if (trabajadores.length > 0) {
        const responseTrabajadores = await fetch(`${apiBaseUrl}/danado/trabajador.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trabajadores),
        });
  
        if (!responseTrabajadores.ok) {
          throw new Error('Error al guardar los trabajadores');
        }
      }
  
      // 6. Limpiar los estados y mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Datos guardados!',
        text: 'Los datos han sido guardados correctamente.',
        timer: 3000,
        showConfirmButton: false,
      });
  
      setProductos([]);
      setResponsable('');
      setTrabajadoresData({});
       // Aquí eliminamos los datos de localStorage del modal
    localStorage.removeItem('trabajadoresPorProducto');  // Borra los datos guardados en el localStorage
    localStorage.removeItem('productosPorResponsable');  // Borra los datos guardados en el localStorage
    localStorage.removeItem('productosPorTrabajador');  // Borra los datos guardados en el localStorage

    } catch (error) {
      console.error('Error al guardar los datos:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Hubo un error',
        text: 'No se pudieron guardar los datos.',
      });
    }
  };
  
 const handleGuardarTrabajadores = (producto, trabajadores) => {
    // Asegúrate de que estamos actualizando correctamente el estado
    setTrabajadoresData(prevState => ({
      ...prevState,
      [producto.id]: trabajadores,  // Aquí asociamos los trabajadores con el producto.id
    }));
  
  //  console.log('Trabajadores guardados en el padre:', trabajadores);
  };

  
console.log('Productos:', productos);
useEffect(() => {
 // console.log('Trabajadores Comp Padre:', trabajadoresData);
}, [trabajadoresData]);


  return (
    <div className="container-fluid mt-3">
         <h1 className='text-center py-3 '>Reportar Productos Dañados</h1>
      <div className='card border border-success-subtle'>
         <div className="row border border-info-subtle  py-2  text-BLACK" style={background}>
                <div className="col-md-2">
                    </div>
                <div className="col-md-4">
                  <p className="fs-5"><strong><i className='bx bxs-circle'></i> Correlativo:</strong> {correlativo}</p>
                  <p className="fs-5"><strong><i className='bx bxs-circle'></i> Motivo: </strong> DAÑADO
                  </p>
        
                  <p className="fs-5"><strong><i className='bx bxs-circle'></i> Fecha:</strong> {moment().format('YYYY-MM-DD')} </p>
                </div>
                <div className="col-md-5">
                  <label htmlFor="comentarioSolicitud" className="fw-bold fs-5"><i className='bx bxs-circle'></i> Nombres del Responsable de Conteo:</label>
                  <input
                    id="comentarioSolicitud"
                    className="form-control border-info text-info"
                    placeholder="Escribir Responsable..."
                    rows="3"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    required
                    style={{ width: '70%' }}
                  />
                   <Button variant="success" onClick={handleShow} className='my-3'>
                        Agregar Productos
                        </Button>
                        <AgregarArticulos
                        show={modalVisible}
                        handleClose={handleClose}
                        setProductos={setProductos}
                        productos={productos}
                        />
                </div>
                
              </div>
       
        <div className='card border border-success-subtle' style={background}>
         
          <div className='card-body' style={background}>
          <table className="table table-striped text-center table-hover " style={background}>
            <thead>
                <tr className="text-center text-BLACK table-dark">
                <th>#</th>
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Departamento</th>
                <th>Categoria</th>
                <th>Cod Barra</th>
                <th>Composicion</th>
                <th>Piezas Dañadas</th>
                <th>Set de Pieza</th>
                <th>Stock</th>
                <th>Nº Bulto</th>
                <th>Tipo de Dañado</th>
                <th>Nº Documento</th>
                <th>Observaciones</th>
                <th>Acciones</th> {/* Columna de acciones con el botón */}
                </tr>
            </thead>
            <tbody>
                {productos.map((producto, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{producto.codigo}</td>
                    <td>{producto.descripcion}</td>
                    <td>{producto.departamento}</td>
                    <td>{producto.categoria}</td>
                    <td>{producto.cod_barra}</td>
                    <td>{producto.composicion}</td>
                    <td>{producto.pcs_danadas}</td>
                    <td>{producto.presentacion_set}</td>
                    <td>{producto.stock}</td>
                    <td>
                    <Form.Control
                        type="text"
                        value={producto.bulto || ''}
                        onChange={(e) => handleInputChange(index, e, 'bulto')}
                        placeholder="Nº de Bulto"
                        required
                    />
                    </td>
                    <td width={150}>
                    <Form.Control
                        as="select"
                        value={producto.tipo || ''}
                        onChange={(e) => handleTipoChange(index, e)} // Cambia el tipo y muestra el input del documento si es "TRANSFERENCIA"
                        placeholder="Tipo"
                        className="form-select"
                        style={{ width: '200px' }}  // 200px es un valor más controlado
                        required
                    >
                        <option value="">(Seleccionar)</option>
                        <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                        <option value="INTERTIENDA">INTERTIENDA</option>
                        <option value="OBSOLECENCIA">OBSOLECENCIA</option>
                        <option value="HURTO">HURTO</option>
                        <option value="TIENDA">TIENDA</option>
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="CONTAINER GALPON">CONTAINER GALPON</option>
                        <option value="MANIPULACION GALPON">MANIPULACION GALPON</option>
                        <option value="SINIESTRO">SINIESTRO</option>
                        <option value="COBRO A TRABAJADORES">COBRO A TRABAJADORES</option>
                        <option value="NAVIDAD">NAVIDAD</option>
                    </Form.Control>
                    </td>

                    <td>
                        <Form.Control
                        type="text"
                        value={producto.numeroDocumento || ''}
                        onChange={(e) => handleInputChange(index, e, 'numeroDocumento')}
                        placeholder="Número de Documento"
                        required
                        />
                    </td>
                   
                    <td>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={producto.observaciones || ''}
                        onChange={(e) => handleInputChange(index, e, 'observaciones')}
                        placeholder="Observaciones"
                        className="form-control"
                        required
                        maxLength={250} 
                    />
                    </td>

                    {/* Columna de acciones con el botón */}
                    <td>
                    {producto.tipo === 'COBRO A TRABAJADORES' && (
                        (datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user1') && (
                        <button className="btn btn-success btn-sm" onClick={() => openModal(producto)}>
                            <i className="bx bxs-user-plus bx-flip-horizontal bx-tada bx-md"></i>
                        </button>
                        )
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>

          </div>
        </div>
      </div>
      {/* Modal para ver item */}
      {showModal && modalItem && (
        <ModalAggTrabDan 
        producto={modalItem} 
        closeModal={() => closeModal(false)} 
        onGuardar={(producto, trabajadores, tasaDia) => {
        //  console.log('Producto:', producto);
       //   console.log('Trabajadores:', trabajadores);
       //   console.log('Tasa Día:', tasaDia);  // Aquí obtienes el valor de tasaDia desde el modal
      
          // Aquí puedes realizar cualquier acción, como guardar en el backend
          handleGuardarTrabajadores(producto, trabajadores);
      
          // Actualizas el estado tasaDia2 con el valor recibido
          setTasaDia2(tasaDia);
        }}
      />
        )}
       {/* Botón de Guardar */}
       <Button variant="primary" onClick={handleSave} className="mt-4" disabled={productos.length === 0}>
        Guardar Reporte
      </Button>
    </div>
  );
};

export default PageDañado;
