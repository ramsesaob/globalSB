import { useEffect, useState, useMemo, useCallback } from "react";
import { PiPantsFill } from "react-icons/pi";
import { GiRunningShoe } from "react-icons/gi";
import Swal from 'sweetalert2';

const ModalEditarTrabajador = ({ trabajador, onSave, setModalEditar }) => {
    // Estado de formulario
    const [formData, setFormData] = useState({
        talla_camisa: '',
        talla_pantalon: '',
        talla_zapato: '',
        tieneTelefono: false,
        telefono: 0,
        telefono_modelo: '',
        telefono_serial: '',
        tieneRadio: false,
        radio_serial: '',
        radio_modelo: '',
        tieneEquipo: false,
        equipo_computacion: 0,
        modelo_equipo_computacion: '',
        user_id: null,
    });
    
    const [errors, setErrors] = useState({});
    const [alertType, setAlertType] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        if (trabajador) {
            setFormData({
                talla_camisa: trabajador.talla_camisa || '',
                talla_pantalon: trabajador.talla_pantalon || '',
                talla_zapato: trabajador.talla_zapato || '',
                tieneTelefono: !!trabajador.telefono, // Convertir a booleano
                telefono: trabajador.telefono || 0,
                telefono_modelo: trabajador.telefono_modelo || '',
                telefono_serial: trabajador.telefono_serial || '',
                tieneRadio: !!trabajador.radio_serial, // Convertir a booleano
                radio_serial: trabajador.radio_serial || '',
                radio_modelo: trabajador.radio_modelo || '',
                tieneEquipo: !!trabajador.equipo_computacion, // Convertir a booleano
                equipo_computacion: trabajador.equipo_computacion || 0,
                modelo_equipo_computacion: trabajador.modelo_equipo_computacion || '',
                user_id: trabajador.user_id || null,
            });
        }
    }, [trabajador]);

    useEffect(() => {
        if (formData.tieneTelefono || formData.tieneRadio || formData.tieneEquipo) {
            setAlertType('warning');
        } else {
            setAlertType(null);
        }
    }, [formData.tieneTelefono, formData.tieneRadio, formData.tieneEquipo]);

    const capitalizeFirstLetter = (string) => {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const validateField = useCallback((name, value) => {
        const newErrors = { ...errors };
        switch (name) {
            case 'talla_camisa':
                if (value && !/^[A-Za-z]+$/.test(value)) {
                    newErrors.talla_camisa = 'La talla de camisa solo debe contener letras.';
                } else if (value.length > 3) {
                    newErrors.talla_camisa = 'La talla de camisa debe contener máximo 3 caracteres.';
                } else {
                    delete newErrors.talla_camisa;
                }
                break;
            case 'talla_pantalon':
                if (value && (!/^[0-9]*$/.test(value) || value > 50)) {
                    newErrors.talla_pantalon = 'La talla de pantalón debe ser un número entero menor o igual a 50.';
                } else {
                    delete newErrors.talla_pantalon;
                }
                break;
            case 'talla_zapato':
                if (value && (!/^[0-9]*$/.test(value) || value > 47)) {
                    newErrors.talla_zapato = 'La talla de zapato debe ser un número entero menor o igual a 47.';
                } else {
                    delete newErrors.talla_zapato;
                }
                break;
            case 'telefono_serial':
                if (value && !/^[A-Za-z0-9]+$/.test(value)) {
                    newErrors.telefono_serial = 'El serial del teléfono debe contener solo letras y números.';
                } else {
                    delete newErrors.telefono_serial;
                }
                break;
            case 'radio_serial':
                if (value && !/^[A-Za-z0-9]+$/.test(value)) {
                    newErrors.radio_serial = 'El serial del radio debe contener solo letras y números.';
                } else {
                    delete newErrors.radio_serial;
                }
                break;
            default:
                break;
        }
        setErrors(newErrors);
    }, [errors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e, field) => {
        const { checked } = e.target;
        // Limpiar los campos asociados si el checkbox se desmarca
        if (!checked) {
            switch (field) {
                case 'tieneTelefono':
                    setFormData((prevData) => ({
                        ...prevData,
                        tieneTelefono: false,
                        telefono: 0,
                        telefono_modelo: '',
                        telefono_serial: '',
                    }));
                    break;
                case 'tieneRadio':
                    setFormData((prevData) => ({
                        ...prevData,
                        tieneRadio: false,
                        radio_serial: '',
                        radio_modelo: '',
                    }));
                    break;
                case 'tieneEquipo':
                    setFormData((prevData) => ({
                        ...prevData,
                        tieneEquipo: false,
                        equipo_computacion: 0,
                        modelo_equipo_computacion: '',
                    }));
                    break;
                default:
                    break;
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [field]: checked,
                [`${field === 'tieneTelefono' ? 'telefono' : field === 'tieneEquipo' ? 'equipo_computacion' : ''}`]: checked ? 1 : 0
            }));
        }

        if (formData.tieneTelefono || formData.tieneRadio || formData.tieneEquipo) {
            setAlertType('warning');
        } else {
            setAlertType(null);
        }
    };

    const validateForm = useMemo(() => {
        return () => {
            const newErrors = {};
            if (formData.talla_camisa && !/^[A-Za-z]+$/.test(formData.talla_camisa)) {
                newErrors.talla_camisa = 'La talla de camisa solo debe contener letras.';
            }
            if (formData.talla_camisa.length > 3) {
                newErrors.talla_camisa = 'La talla de camisa debe contener máximo 2 caracteres.';
            }
            if (formData.talla_pantalon && (!/^[0-9]*$/.test(formData.talla_pantalon) || formData.talla_pantalon > 50)) {
                newErrors.talla_pantalon = 'La talla de pantalón debe ser un número entero menor o igual a 50.';
            }
            if (formData.talla_zapato && (!/^[0-9]*$/.test(formData.talla_zapato) || formData.talla_zapato > 47)) {
                newErrors.talla_zapato = 'La talla de zapato debe ser un número entero menor o igual a 47.';
            }
            if (formData.tieneTelefono) {
                if (!formData.telefono_modelo) {
                    newErrors.telefono_modelo = "El modelo del teléfono corporativo es obligatorio.";
                }
                if (formData.telefono_modelo && !/^[A-Za-z0-9\s]+$/.test(formData.telefono_modelo)) {
                    newErrors.telefono_modelo = 'El modelo del teléfono debe contener solo letras y numeros.';
                }
                if (!formData.telefono_serial) {
                    newErrors.telefono_serial = "El serial del teléfono corporativo es obligatorio.";
                }
            }
            if (formData.tieneRadio) {
                if (!formData.radio_serial) {
                    newErrors.radio_serial = "El serial del radio es obligatorio.";
                }
                if (!formData.radio_modelo) {
                    newErrors.radio_modelo = "El modelo del radio es obligatorio.";
                }
            }
            if (formData.tieneEquipo) {
                if (!formData.modelo_equipo_computacion) {
                    newErrors.modelo_equipo_computacion = "El modelo del equipo de computación es obligatorio.";
                }
            }
            setErrors(newErrors);
            if (Object.keys(newErrors).length === 0) {
                setAlertType(null);
            } else {
                setAlertType('danger');
            }
            return Object.keys(newErrors).length === 0;
        };
    }, [formData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar el formulario
        const isValid = validateForm();

        // Si hay errores, mostrar SweetAlert para confirmar si el usuario desea continuar
        if (!isValid) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Hay campos obligatorios sin llenar. ¿Deseas continuar?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Mostrar segunda confirmación
                    Swal.fire({
                        title: '¿Estás realmente seguro?',
                        text: "¿Deseas guardar los cambios con campos vacíos?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sí, guardar',
                        cancelButtonText: 'Cancelar'
                    }).then((secondResult) => {
                        if (secondResult.isConfirmed) {
                            // Mostrar tercera confirmación para verificar los datos ingresados
                            Swal.fire({
                                title: '¿Estás seguro de los datos ingresados?',
                                text: "Por favor, verifica que todos los datos ingresados sean correctos.",
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Sí, guardar',
                                cancelButtonText: 'Cancelar'
                            }).then((thirdResult) => {
                                if (thirdResult.isConfirmed) {
                                    const updatedData = {
                                        talla_camisa: formData.talla_camisa,
                                        talla_pantalon: formData.talla_pantalon,
                                        talla_zapato: formData.talla_zapato,
                                        telefono: formData.telefono,
                                        telefono_modelo: formData.telefono_modelo,
                                        telefono_serial: formData.telefono_serial,
                                        radio_serial: formData.radio_serial,
                                        radio_modelo: formData.radio_modelo,
                                        equipo_computacion: formData.equipo_computacion,
                                        modelo_equipo_computacion: formData.modelo_equipo_computacion,
                                        user_id: formData.user_id,
                                    };
                                    onSave(updatedData);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            // Si no hay errores, mostrar SweetAlert para confirmar los datos ingresados
            Swal.fire({
                title: '¿Estás seguro de los datos ingresados?',
                text: "Por favor, verifica que todos los datos ingresados sean correctos.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedData = {
                        talla_camisa: formData.talla_camisa,
                        talla_pantalon: formData.talla_pantalon,
                        talla_zapato: formData.talla_zapato,
                        telefono: formData.telefono,
                        telefono_modelo: formData.telefono_modelo,
                        telefono_serial: formData.telefono_serial,
                        radio_serial: formData.radio_serial,
                        radio_modelo: formData.radio_modelo,
                        equipo_computacion: formData.equipo_computacion,
                        modelo_equipo_computacion: formData.modelo_equipo_computacion,
                        user_id: formData.user_id,
                    };
                    onSave(updatedData);
                    console.log(updatedData);
                }
            });
        }
    };


    const hasRequiredFieldErrors = () => {
        return (
            errors.telefono_modelo ||
            errors.telefono_serial ||
            errors.radio_serial ||
            errors.radio_modelo ||
            errors.modelo_equipo_computacion
        );
    };

    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content modal-trabajador">
                        <div className="modal-header">
                            <h5 className="modal-title">Trabajador(a) {trabajador.nombre} {trabajador.apellido}</h5>
                            <button type="button" className="btn btn-danger btn-close" onClick={() => setModalEditar({ show: false, trabajador: null })} aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit} className="modal-trabajador">
                                <div className="container">
                                    <h2 className='text-center mb-1'>Editar informacion de {trabajador.nombre} {trabajador.apellido}</h2>
                                    <h5 className="text-center mt-1 "><b>C.I: {trabajador.cedula}</b></h5>
                                    {alertType === 'warning' && (
                                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                            <i className='bi bi-exclamation-circle'></i> <strong>¡Atención!</strong> Los campos con asterisco (<b>*</b>) son obligatorios.
                                        </div>
                                    )}
                                    {alertType === 'danger' && (
                                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                            {(errors.telefono_modelo || errors.telefono_serial || errors.radio_serial || errors.radio_modelo || errors.modelo_equipo_computacion) && (
                                                <>
                                                    <i className='bi bi-exclamation-triangle'></i> <strong>¡Atención!</strong> Por favor, complete los campos con asterisco (<b>*</b>) para continuar.
                                                </>
                                            )}
                                            {errors.talla_camisa && <div>- {errors.talla_camisa}</div>}
                                            {errors.talla_pantalon && <div>- {errors.talla_pantalon}</div>}
                                            {errors.talla_zapato && <div>- {errors.talla_zapato}</div>}
                                            {errors.telefono_modelo && <div>- {errors.telefono_modelo}</div>}
                                            {errors.telefono_serial && <div>- {errors.telefono_serial}</div>}
                                            {errors.radio_serial && <div>- {errors.radio_serial}</div>}
                                            {errors.radio_modelo && <div>- {errors.radio_modelo}</div>}
                                            {errors.modelo_equipo_computacion && <div>- {errors.modelo_equipo_computacion}</div>}
                                        </div>
                                    )}
                                    <hr />
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="text-center">
                                                <label className="form-label"><b>Género</b></label>
                                                <div className="input-group">
                                                    <div className="input-group-text">
                                                        <i className={`text-success ${formData.genero === ''
                                                            ? 'bi bi-universal-access-circle'
                                                            : formData.genero === 'Masculino'
                                                                ? 'bi bi-gender-male'
                                                                : 'bi bi-gender-female'
                                                            }`}></i>
                                                    </div>
                                                    <input type="readonly" className="form-control" value={trabajador.genero} disabled />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <div className="text-center">
                                                <label className="form-label"><b>Talla de Camisa</b></label>
                                                <div className="input-group">
                                                    <div className="input-group-text"><i className="bx bxs-t-shirt text-success"></i></div>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.talla_camisa ? 'is-invalid' : ''}`}
                                                        name="talla_camisa"
                                                        placeholder="Escriba la talla de camisa del trabajador(a) "
                                                        value={formData.talla_camisa}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.talla_camisa && <div className="invalid-feedback ms-2">{errors.talla_camisa}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <div className="text-center">
                                                <label className="form-label"><b>Talla de Pantalón</b></label>
                                                <div className="input-group">
                                                    <div className="input-group-text"><i><PiPantsFill className="text-success" /></i></div>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.talla_pantalon ? 'is-invalid' : ''}`}
                                                        name="talla_pantalon"
                                                        placeholder="Escriba la talla de pantalón del trabajador(a)"
                                                        value={formData.talla_pantalon}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.talla_pantalon && <div className="invalid-feedback">{errors.talla_pantalon}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3 mb-2">
                                            <div className="text-center">
                                                <label className="form-label"><b>Talla de Zapato</b></label>
                                                <div className="input-group">
                                                    <div className="input-group-text"><i><GiRunningShoe className="text-success" /></i></div>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.talla_zapato ? 'is-invalid' : ''}`}
                                                        name="talla_zapato"
                                                        placeholder="Escriba la talla de zapato del trabajador(a)"
                                                        value={formData.talla_zapato}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.talla_zapato && <div className="invalid-feedback">{errors.talla_zapato}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="col-md-4">
                                            <div className="mb-1 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input bg-success"
                                                    name="tieneRadio"
                                                    checked={formData.tieneRadio}
                                                    onChange={(e) => handleCheckboxChange(e, 'tieneRadio')}
                                                />
                                                <label className="form-check-label"><b>¿El Trabajador tiene asignado un Radio?</b></label>
                                            </div>
                                            {formData.tieneRadio && (
                                                <div className="mb-1 ms-4 form-group form-group-checkbox">
                                                    <label className="form-label ms-1 mt-1 mb-1">Serial <b className='text-danger'>*</b></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.radio_serial ? 'is-invalid' : ''}`}
                                                        name="radio_serial"
                                                        placeholder="Escriba el serial del radio"
                                                        value={formData.radio_serial}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.radio_serial && <div className="invalid-feedback">{errors.radio_serial}</div>}
                                                    <label className="form-label ms-1 mt-1 mb-1">Modelo <b className='text-danger'>*</b></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.radio_modelo ? 'is-invalid' : ''}`}
                                                        name="radio_modelo"
                                                        placeholder="Escriba el modelo del radio"
                                                        value={formData.radio_modelo}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.radio_modelo && <div className="invalid-feedback">{errors.radio_modelo}</div>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-0 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input bg-success"
                                                    name="tieneTelefono"
                                                    checked={formData.tieneTelefono}
                                                    onChange={(e) => handleCheckboxChange(e, 'tieneTelefono')}
                                                />
                                                <label className="form-check-label"><b>¿El Trabajador tiene asignado un Telefono Corporativo?</b></label>
                                            </div>
                                            {formData.tieneTelefono && (
                                                <div className="mb-1 ms-4 form-group form-group-checkbox">
                                                    <label className="form-label my-1">Modelo <b className='text-danger' style={{ fontSize: '20px' }}>*</b></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control modal-form ${errors.telefono_modelo ? 'is-invalid' : ''}`}
                                                        name="telefono_modelo"
                                                        placeholder="Escriba el modelo del teléfono"
                                                        value={formData.telefono_modelo}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.telefono_modelo && <div className="invalid-feedback">{errors.telefono_modelo}</div>}
                                                    <label className="form-label ms-1 my-1">Serial <b className='text-danger'>*</b></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.telefono_serial ? 'is-invalid' : ''}`}
                                                        name="telefono_serial"
                                                        placeholder="Escriba el serial del teléfono"
                                                        value={formData.telefono_serial}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.telefono_serial && <div className="invalid-feedback">{errors.telefono_serial}</div>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input bg-success"
                                                    name="tieneEquipo"
                                                    checked={formData.tieneEquipo}
                                                    onChange={(e) => handleCheckboxChange(e, 'tieneEquipo')}
                                                />
                                                <label className="form-check-label"><b>¿El Trabajador tiene asignado un Equipo de Computación?</b></label>
                                            </div>
                                            {formData.tieneEquipo && (
                                                <div className="mb-1 ms-4 form-group form-group-checkbox">
                                                    <label className="form-label ms-1 mt-1 mb-1">Modelo <b className='text-danger'>*</b></label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.modelo_equipo_computacion ? 'is-invalid' : ''}`}
                                                        name="modelo_equipo_computacion"
                                                        placeholder="Escriba el modelo del equipo de computación"
                                                        value={formData.modelo_equipo_computacion}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.modelo_equipo_computacion && <div className="invalid-feedback">{errors.modelo_equipo_computacion}</div>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end align-items-end">
                                   <button 
                                        type="submit" 
                                        className="btn btn-success me-2" 
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <span>Guardando...</span>  // O puedes mostrar un ícono de cargando o un spinner
                                        ) : (
                                            <><i className='bi bi-check-square me-1'></i>Guardar cambios</>
                                        )}
                                    </button>

                                    <button type="button" className="btn btn-danger" onClick={() => setModalEditar({ show: false, trabajador: null })}>
                                        <i className='bi bi-x-square me-1'></i>Cerrar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalEditarTrabajador;
