import React, { useState } from 'react';
import axios from 'axios';

const Prueba = () => {
    const [formData, setFormData] = useState({
        person_id: '',
        monto_bsf: '',
        monto_dol: '',
        motivo: '',
        observaciones: '',
        tasa: '',
        proveedor: '',
        grupo: '',
        subgrupo: '',
        numero_referencia: '',
        banco_origen: '',
        lote: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        try {
            const response = await axios.post('http://tudominio.com/programacion-pago.json', formData);
            
            if (response.data.success) {
                setMessage(response.data.message);
                // Limpiar formulario si es necesario
                setFormData({
                    person_id: '',
                    monto_bsf: '',
                    monto_dol: '',
                    motivo: '',
                    observaciones: '',
                    tasa: '',
                    proveedor: '',
                    grupo: '',
                    subgrupo: '',
                    numero_referencia: '',
                    banco_origen: '',
                    lote: ''
                });
            } else {
                setError(response.data.message);
                if (response.data.errors) {
                    // Manejar errores de validación aquí
                    console.error('Errores de validación:', response.data.errors);
                }
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <div className="d-flex align-items-center">
  <h2 className="mb-0 me-2">Programación de Pago</h2>
  <i className="bx bx-fork-knife fs-3"></i>
</div>

            <h2>Programación de Pago</h2> <i className=' btn  bx  bx-fork-knife'></i>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Person ID:</label>
                    <input type="number" name="person_id" value={formData.person_id} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label>Monto BsF:</label>
                    <input type="number" step="0.01" name="monto_bsf" value={formData.monto_bsf} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label>Monto USD:</label>
                    <input type="number" step="0.01" name="monto_dol" value={formData.monto_dol} onChange={handleChange} required />
                </div>
                
                {/* Agrega más campos según necesites */}
                
                <button type="submit" className="btn btn-primary">Guardar</button>
            </form>
        </div>
    );
};

export default Prueba;