import React, { useState } from 'react';

function Contador() {
    const [contador, setContador] = useState(0);

    const incrementar = () => {
        setContador(contador + 1);
    };

    const decrementar = () => {
        if (contador > 0) {
            setContador(contador - 1);
        } else {
            alert('No se puede decrementar')
        }
    };
    const reiniciar = () => {
        setContador(0);
        alert('Contador reiniciado')
    };

    return (
        <div className='container'>
            <div className='card mt-5 pb-5'>
                <div className="d-flex justify-content-center align-items-center text-center py-2">
                    <h1>
                        Contador: <span className="badge text-bg-dark">{contador}</span>
                    </h1>
                </div>
                <div className='text-center'>
                    <button className='btn btn-success btn-sm me-2' onClick={incrementar}>+</button>
                    <button className='btn btn-warning btn-sm me-2' onClick={reiniciar}>Reiniciar</button>
                    <button className='btn btn-danger btn-sm me-2' onClick={decrementar}>-</button>
                </div>
            </div>
        </div>
    );
}

export default Contador;
