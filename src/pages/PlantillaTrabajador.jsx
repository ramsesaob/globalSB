import React, { useEffect, useState, useMemo, useContext } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import ModalEditarTrabajador from '../components/(platillatrabajador)/ModalEditarTrabajador';
import ModalVistaTrabajador from '../components/(platillatrabajador)/ModalVistaTrabajador';
import PaginarTrabajador from '../components/(platillatrabajador)/PaginarTrabajador';
import { FaFilterCircleXmark } from "react-icons/fa6";
import { carritoContext } from "../contexts/carritoContext";
import moment from 'moment/moment';
//const apiBaseUrl = 'http://192.168.0.195/apick';



const PlantillaTrabajador = () => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalEditar, setModalEditar] = useState({ show: false, trabajador: null });
    const [modalVista, setModalVista] = useState({ show: false, trabajador: null });
    const [sucursales, setSucursales] = useState([]);
    const [sucursalesFinal, setSucursalesFinal] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [limit, setLimit] = useState(1000);
    const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
    const role = datosUsuario.user.role;
    //console.log(datosUsuario.user)
    // Filtros
    const [tempNombre, setTempNombre] = useState('');
    const [tempApellido, setTempApellido] = useState('');
    const [tempCedula, setTempCedula] = useState('');
    const [tempSucursal, setTempSucursal] = useState('');
    const [tempDepartamento, setTempDepartamento] = useState('');
    const [filterNombre, setFilterNombre] = useState('');
    const [filterApellido, setFilterApellido] = useState('');
    const [filterCedula, setFilterCedula] = useState('');
    const [selectedSucursal, setSelectedSucursal] = useState('');
    const [selectedDepartamento, setSelectedDepartamento] = useState('');
    const cargando = loading;
    const API = `${apiBaseUrl}/person/list2.json?codigosuc=`; // api registros trabajadores
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch de las sucursales de la API
        fetch(`${apiBaseUrl}/sucursal/sucursales.json`)
            .then(response => response.json())
            .then(data => {
                setSucursales(data.sucursales);  // Guardamos las sucursales de las tiendas en el estado
            })
            .catch(error => console.error('Error al cargar las sucursales:', error));
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const firstPage = await axios.get(`${apiBaseUrl}/person/list2.json?codigosuc=&page=1`);
                const totalPages = parseInt(firstPage.data.totalPages);
                let allRegistros = [...firstPage.data.registros];
                // Si hay más de una página, las pedimos en paralelo
                const promises = [];
                for (let i = 2; i <= totalPages; i++) {
                    promises.push(axios.get(`${API}&page=${i}`));
                }
                const results = await Promise.all(promises);
                results.forEach(res => {
                    allRegistros = allRegistros.concat(res.data.registros);
                });
                // Filtrado según el rol del usuario
                let filteredTrabajadores = [];
                if (role === 'admin' || role === 'user2' || role === 'user5' || !datosUsuario.user.sucursale) {
                    // Si el usuario es 'admin', 'user2' o no tiene sucursal asignada, no aplicamos el filtro de sucursal
                    filteredTrabajadores = allRegistros;
                } else if (role === 'user1' || role === 'user6' || role === 'gerente') {
                    // Aplicamos el filtro de sucursal para estos roles
                    filteredTrabajadores = allRegistros.filter(trabajador => trabajador.codigosuc === datosUsuario.user.sucursale.codigo);
                } else {
                    // Para otros roles, no aplicamos ningún filtro (esto es opcional, depende de tu lógica)
                    filteredTrabajadores = allRegistros;
                }
                // Mapear y preparar los datos para el estado
                setTrabajadores(filteredTrabajadores.map((trabajador) => ({
                    ...trabajador,
                    telefonoCorporativo: trabajador.telefonoCorporativo || "N/A",
                    radio: trabajador.radio || "N/A",
                    equipoComputacion: trabajador.equipoComputacion || false,
                    user_id: datosUsuario.user.id,
                })));
            } catch (error) {
                console.error("Error al cargar registros:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);
    useEffect(() => {
        if (sucursales.length > 0 && trabajadores.length > 0) {
            const nombresExistentes = new Set(sucursales.map(s => s.nombre.trim()));

            const faltantes = trabajadores
                .filter(trab => {
                    const nombreSucursal = trab.Nombre_Suc ? trab.Nombre_Suc.trim() : trab.descripcion?.trim();
                    return nombreSucursal && !nombresExistentes.has(nombreSucursal);
                })
                .map(trab => {
                    const nombreSucursal = trab.Nombre_Suc ? trab.Nombre_Suc.trim() : trab.descripcion?.trim();
                    return {
                        nombre: nombreSucursal,
                        codigo: trab.codigosuc,
                        descripcion: trab.descripcion,
                        codigo_empresa: null,
                        codigo_nomina: null
                    };
                });
            // Eliminar duplicados por nombre
            const unicasFaltantes = Array.from(new Map(faltantes.map(s => [s.nombre, s])).values());
            const todas = [...sucursales, ...unicasFaltantes];
            todas.sort((a, b) => a.codigo.localeCompare(b.codigo));

            setSucursalesFinal(todas);
            //console.log(todas)
        }
    }, [sucursales, trabajadores]);
   
  const handleSave = async (updatedData) => {
    const { id } = modalEditar.trabajador;
    
   
    const dataToSend = {
        detalle_trabajador: {
            talla_camisa: updatedData.talla_camisa,
            talla_pantalon: updatedData.talla_pantalon,
            talla_zapato: updatedData.talla_zapato,
            userid: datosUsuario.user.id // Añadir el user_id al detalle_trabajador
        },
        equipo_trabajador: {
            telefono: updatedData.telefono,
            telefono_modelo: updatedData.telefono_modelo,
            telefono_serial: updatedData.telefono_serial,
            radio_serial: updatedData.radio_serial,
            radio_modelo: updatedData.radio_modelo,
            equipo_computacion: updatedData.equipo_computacion,
            modelo_equipo_computacion: updatedData.modelo_equipo_computacion
        }
    };
    
    // Deshabilitar el botón de guardar
    setIsSaving(true);
    try {
        await axios.put(`${apiBaseUrl}/detallest/edit/${id}.json`, dataToSend);

        // Actualizar el estado localmente
        setTrabajadores((prevTrabajadores) =>
            prevTrabajadores.map((trabajador) =>
                trabajador.id === id
                    ? {
                        ...trabajador,
                        ...updatedData,
                        user_id: datosUsuario.user.id // Asegurarse de que user_id se actualice en el estado local
                    }
                    : trabajador
            )
        );
        Swal.fire({
            title: "Se actualizó el trabajador con éxito",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        });

        setModalEditar({ show: false, trabajador: null });
    } catch (error) {
        console.error("Error al actualizar el trabajador:", error);
        Swal.fire({
            title: "Error al actualizar el trabajador",
            text: "Ocurrió un error al intentar actualizar la información del trabajador.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
    finally {
        // Habilitar el botón de guardar nuevamente después de la operación
        setIsSaving(false);
    }
};




    const filteredTrabajadores = useMemo(() => {
        return trabajadores.filter(trabajador =>
            (trabajador.nombre.toLowerCase().includes(filterNombre.toLowerCase())) &&
            trabajador.apellido.toLowerCase().includes(filterApellido.toLowerCase()) && // Nuevo filtro por apellido
            trabajador.cedula.includes(filterCedula) &&
            (selectedSucursal ? (trabajador.Nombre_Suc || trabajador.descripcion || '').trim() === selectedSucursal : true) &&
            (selectedDepartamento ? trabajador.orgName === selectedDepartamento : true)
        );
    }, [trabajadores, filterNombre, filterApellido, filterCedula, selectedSucursal, selectedDepartamento]);
    const paginatedTrabajadores = useMemo(() => {
        const indexOfLastItem = currentPage * limit;
        const indexOfFirstItem = indexOfLastItem - limit;
        return filteredTrabajadores.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredTrabajadores, currentPage, limit]);
    // Función para convertir la primera letra de un string a mayúscula
    const capitalizeFirstLetter = (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };
    const uniqueDepartamentos = useMemo(() => {
        const departamentos = new Set(trabajadores.map(trabajador => trabajador.orgName));
        return Array.from(departamentos).sort((a, b) => a.localeCompare(b));;
    }, [trabajadores]);
    useEffect(() => {
        setTotalPages(Math.ceil(filteredTrabajadores.length / limit));
    }, [filteredTrabajadores, limit]);
    const aplicarFiltros = (e) => {
        if (e) e.preventDefault();
        setFilterNombre(tempNombre);
        setFilterApellido(tempApellido); // Aplicar filtro de apellido
        setFilterCedula(tempCedula);
        setSelectedSucursal(tempSucursal);
        setSelectedDepartamento(tempDepartamento);
        setCurrentPage(1);
    };

    const limpiarFiltros = () => {
        setTempNombre('');
        setTempApellido(''); // Limpiar filtro de apellido
        setTempCedula('');
        setTempSucursal('');
        setTempDepartamento('');
        setFilterNombre('');
        setFilterApellido(''); // Limpiar filtro de apellido
        setFilterCedula('');
        setSelectedSucursal('');
        setSelectedDepartamento('');
        setCurrentPage(1);
    };

    return (
        <>
            <h3 className='text-center pt-3'>
                Plantilla de Trabajadores  <i className='bx bx-spreadsheet text-success'></i></h3>
            {cargando ? (
                <>
                    <h5 className='text-center my-4'>Espere un momento, por favor...</h5>
                    <div className="d-flex justify-content-center align-items-start" style={{ height: '100vh' }}>
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="container text-center pb-0 mb-0">
                    <div className='filtros-trabajador-container'>
                        <h5 className='text-start ms-3 mt-3'>Filtros:</h5>
                        <div className="filtros-trabajador-card">
                            <select className="form-select filtros-trabajador-item" onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
                                <option value={1000}>Cantidad de trabajadores a mostrar</option>
                                <option value={50}>50 Trabajadores</option>
                                <option value={100}>100 Trabajadores</option>
                                <option value={200}>200 Trabajadores</option>
                                <option value={500}>500 Trabajadores</option>
                            </select>
                        </div>
                        <div className="filtros-trabajador-card">
                            <input type="text" className="form-control filtros-trabajador-item" placeholder='Filtrar por nombre' value={tempNombre} onChange={(e) => setTempNombre(e.target.value)} />
                        </div>
                        <div className="filtros-trabajador-card">
                            <input type="text" className="form-control filtros-trabajador-item" placeholder='Filtrar por apellido' value={tempApellido} onChange={(e) => setTempApellido(e.target.value)} /> {/* Nuevo campo para filtrar por apellido */}
                        </div>
                        <div className="filtros-trabajador-card">
                            <input type="text" className="form-control filtros-trabajador-item" placeholder='Filtrar por cedula' value={tempCedula} onChange={(e) => setTempCedula(e.target.value)} />
                        </div>
                        <div className="filtros-trabajador-card">
                            <select className="form-select filtros-trabajador-item" value={tempDepartamento} onChange={(e) => setTempDepartamento(e.target.value)}>
                                <option value=''>Filtrar por departamento</option>
                                {uniqueDepartamentos.map(departamento => (
                                    <option key={departamento} value={departamento}>{capitalizeFirstLetter(departamento)}</option>
                                ))}
                            </select>
                        </div>
                        {(datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2' || datosUsuario.user.role === 'user5') && (
                            <div className="filtros-trabajador-card">
                                <select
                                    className="form-select filtros-trabajador-item"
                                    value={tempSucursal}
                                    onChange={(e) => {
                                        setTempSucursal(e.target.value);
                                        /*console.log(e.target.value);*/
                                    }}
                                >
                                    <option value=''>Filtrar por sucursal</option>
                                    {sucursalesFinal.map(sucursal => (
                                        <option key={sucursal.codigo} value={sucursal.nombre}>
                                            ({sucursal.codigo}) ({sucursal.descripcion}) - {sucursal.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="filtros-trabajador-card">
                            <div className="d-flex"> {/* Alinea los botones a la izquierda */}
                                <p className='ms-1 me-2 mt-3'>Manejo de filtros:</p>
                                <button className="btn btn-outline-success btn-sm " onClick={aplicarFiltros}>
                                    <i className='bx bx-filter-alt me-1' style={{ fontSize: '15px' }}></i>Aplicar
                                </button>
                                <button className="btn btn-outline-secondary btn-sm " onClick={limpiarFiltros}>
                                    <FaFilterCircleXmark className='me-1' style={{ fontSize: '15px' }} />Limpiar
                                </button>
                            </div>
                        </div>
                        <div className="filtros-info-extra">
                            <p className='mb-1 ms-4' >
                                <span className="badge text-bg-success rounded-pill me-1"><i className='bx bxs-user-detail m-auto'></i></span>
                                Cantidad total de trabajadores en la plantilla: <strong>{filteredTrabajadores.length}</strong>
                            </p>
                            <p >
                                <span className="badge text-bg-success rounded-pill me-1"><i className='bx bxs-user-rectangle m-auto'></i></span>
                                Cantidad de trabajadores por pagina: <strong>{limit}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="table-container table-responsive">
                        <table className="table table-bordered table-group-divider table-hover text-center table-responsive">
                            <thead className='table-secondary '>
                                <tr className=''>
                                    <th scope="col">#</th>
                                    <th scope="col">Cedula</th>
                                    <th scope="col">Nombre</th>
                                    <th scope="col">Apellido</th>
                                    <th scope="col">Departamento</th>
                                    {(datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2' || datosUsuario.user.role === 'user5') && (
                                        <>
                                            <th scope="col">Sucursal</th>
                                            <th scope="col">Codigo Sucursal</th>
                                        </>
                                    )}
                                    <th scope="col">Última Modificación</th>
                                    <th scope="col">Informacion detallada</th>
                                    <th scope="col">Editar Información</th>
                                </tr>
                            </thead>
                            <tbody className='aling-item-center'>
                                {paginatedTrabajadores.map((item, index) => (
                                    <tr key={item.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{item.cedula}</td>
                                        <td>{item.nombre}</td>
                                        <td>{item.apellido}</td>
                                        <td>{item.orgName}</td>
                                        {(datosUsuario.user.role === 'admin' || datosUsuario.user.role === 'user2' || datosUsuario.user.role === 'user5') && (
                                            <>
                                                <td>{item.Nombre_Suc || item.descripcion}</td>
                                                <td>{item.codigosuc}</td>
                                            </>
                                        )}
                                        <td>{(item.modified) ? moment(item.modified).format('DD/MM/YYYY') : 'Sin modificar'}</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => setModalVista({ show: true, trabajador: item })}>
                                                <i className='bi bi-info-circle'></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-success btn-sm" onClick={() => setModalEditar({ show: true, trabajador: item })}>
                                                <i className='bi bi-pencil-square'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginarTrabajador
                        currentPage={currentPage}
                        totalPages={totalPages}
                        TotalItems={filteredTrabajadores.length}
                        setCurrentPage={setCurrentPage}
                    />
                </div >
            )}
            {modalEditar.show && <ModalEditarTrabajador trabajador={modalEditar.trabajador} onSave={handleSave} setModalEditar={setModalEditar} />}
            {modalVista.show && <ModalVistaTrabajador trabajador={modalVista.trabajador} setModalVista={setModalVista} />}
        </>
    );

};

export default PlantillaTrabajador;
