import React from 'react';

const Input = ({ articulo }) => {
  return (
    <div>
      <input
        className="form-control form-control-md"
        type="text"
        placeholder={articulo.DESCRIPCION}
        aria-label=".form-control-sm example"
        name="descripcion"
        value={articulo.DESCRIPCION}
      />
    </div>
  );
};

export default Input;