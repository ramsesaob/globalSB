import React, { useState } from 'react';

const FormularioPagos = () => {
  // Estado de los campos del formulario
  const [monto, setMonto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [metodo, setMetodo] = useState('movil');
  const [fecha, setFecha] = useState('');
  const [bancoDestino, setBancoDestino] = useState('');
  const [error, setError] = useState('');
  const [imagen, setImagen] = useState(null);

  // Lista de bancos de destino (solo un ejemplo, puedes agregar los bancos que necesites)
  const bancos = [
    'Banco A',
    'Banco B',
    'Banco C',
    'Banco D',
  ];

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar si los campos están llenos
    if (!monto || !referencia || !fecha || !bancoDestino || !imagen) {
      setError('Todos los campos son obligatorios');
      return;
    }
    // Si todo es correcto, procesamos el pago (puedes agregar la lógica necesaria aquí)
    setError('');
    alert('Formulario enviado correctamente');
  };

  // Función para manejar la carga de la imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result); // Guardamos la imagen en el estado
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Formulario de Pagos</h2>
      <form onSubmit={handleSubmit}>
        {/* Monto del pago */}
        <div className="form-group">
          <label>Monto del pago:</label>
          <input
            type="number"
            className="form-control"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            required
          />
        </div>

        {/* Número de referencia */}
        <div className="form-group">
          <label>Número de referencia:</label>
          <input
            type="text"
            className="form-control"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Referencia"
            required
          />
        </div>

        {/* Método de pago */}
        <div className="form-group">
          <label>Método de pago:</label>
          <select
            className="form-control"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <option value="movil">Pago Móvil</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        {/* Banco de destino */}
        <div className="form-group">
          <label>Banco de destino:</label>
          <select
            className="form-control"
            value={bancoDestino}
            onChange={(e) => setBancoDestino(e.target.value)}
          >
            <option value="">Seleccione un banco</option>
            {bancos.map((banco, index) => (
              <option key={index} value={banco}>
                {banco}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha del pago */}
        <div className="form-group">
          <label>Fecha del pago:</label>
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        {/* Subir imagen (captura de pantalla) */}
        <div className="form-group">
          <label>Subir una foto (captura de pantalla del pago):</label>
          <input
            type="file"
            className="form-control-file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagen && (
            <div className="mt-3">
              <h5>Vista previa de la imagen:</h5>
              <img
                src={imagen}
                alt="Vista previa"
                style={{ width: '200px', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>

        {/* Mostrar errores de validación */}
        {error && <p className="text-danger">{error}</p>}

        {/* Botón para enviar el formulario */}
        <button type="submit" className="btn btn-primary">
          Enviar Pago
        </button>
      </form>
    </div>
  );
};

export default FormularioPagos;
