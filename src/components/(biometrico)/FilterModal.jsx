import React, { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { carritoContext } from '../../contexts/carritoContext';

const FilterModal = ({ showModal, setShowModal, filters, setFilters, deviceNames, departments, applyFilters, isUser6, userDeviceName }) => {

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const { datosUsuario } = useContext(carritoContext);
  const today = new Date().toISOString().split('T')[0];
//console.log(deviceNames);
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Filtros</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="text"
          name="id"
          placeholder="Filtrar por cedula"
          value={filters.id}
          onChange={handleFilterChange}
          className="form-control form-control-md mb-2"
        />
        <input
          type="text"
          name="id_galac"
          placeholder="Filtrar por Galac"
          value={filters.id_galac}
          onChange={handleFilterChange}
          className="form-control form-control-md mb-2"
        />
        <input
          type="text"
          name="name"
          placeholder="Filtrar por nombre"
          value={filters.name}
          onChange={handleFilterChange}
          className="form-control form-control-md mb-2"
        />
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="form-control form-control-md mb-2"
          max={today}  
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="form-control form-control-md mb-2"
          max={today}  
        />
            <select
              name="deviceName"
              value={filters.deviceName || (datosUsuario?.user.role === 'user6' ? datosUsuario.user.sucursale.descripcion : '')}
              onChange={handleFilterChange}
              className="form-control form-control-md mb-2"
              disabled={datosUsuario?.user.role === 'user6'}  // Deshabilitar si el usuario es 'user6'
            >
              {datosUsuario?.user.role === 'user6' ? (
                // Si el usuario es 'user6', solo mostramos su sucursal
                <option value={datosUsuario.user.sucursale.descripcion}>
                  {datosUsuario.user.sucursale.descripcion}
                </option>
              ) : (
                <>
                  <option value="">Seleccionar Sucursal</option>
                  {deviceNames && typeof deviceNames === 'object' && Object.keys(deviceNames).length > 0 ? (
              Object.keys(deviceNames).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
                    ))
                  ) : (
                    <option disabled>No hay sucursales disponibles</option> // Mensaje si deviceNames es vacío o inválido
                  )}
                </>
              )}
            </select>





       
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
