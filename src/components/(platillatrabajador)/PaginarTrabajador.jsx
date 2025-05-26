import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const PaginarTrabajador = ({ currentPage, totalPages, setCurrentPage, TotalItems }) => {

    const [isPrevClicked, setIsPrevClicked] = useState(false);
    const [isNextClicked, setIsNextClicked] = useState(false);
    /*
    const nav = {
        
        background: '#000000',  
        background: '-webkit-linear-gradient(to right,rgb(30, 29, 29), #0f9b0f)',  
        background: 'linear-gradient(to right,rgba(13, 13, 13, 0.42), #0f9b0f)' 
        
        };
        
    const [inputValue, setInputValue] = useState('');
    const handleChange = (event) => {
        setInputValue(event.target.value);
    };


    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        navigate('/', {
            state: inputValue,
        });
    };
    */
    // Use the useMediaQuery hook to get the screen size
    const isSmScreen = window.matchMedia("(max-width: 576px)").matches;
       // Función para calcular el rango de páginas a mostrar
       const getPageRange = () => {
        const halfRange = 2; // Número de páginas a mostrar a cada lado de la página actual
        let startPage = Math.max(1, currentPage - halfRange);
        let endPage = Math.min(totalPages, currentPage + halfRange);

        // Ajustar el rango si la página actual está cerca del principio o del final
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 4);
            } else {
                startPage = Math.max(1, endPage - 4);
            }
        }

        return { startPage, endPage };
    };

    const { startPage, endPage } = getPageRange();

    const handlePrevClick = () => {
        setCurrentPage(currentPage - 1);
        setIsPrevClicked(true);
        setIsNextClicked(false);
    };

    const handleNextClick = () => {
        setCurrentPage(currentPage + 1);
        setIsNextClicked(true);
        setIsPrevClicked(false);
    };

    return (
        <div >
            <div>
                <h5 className='text-center pt-2'>Pagina {currentPage} de {totalPages}</h5>
            </div>
            <div className={`${isSmScreen ? 'd-flex flex-column justify-content-center align-items-center p-0' : 'd-flex justify-content-center align-items-center  p-1'
                }`} >
                <nav >
                    <ul className="pagination  ms-3 mt-1">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className={`page-link paginator-btn ${isPrevClicked ? 'active' : ''}`}
                                
                                href="#"
                                onClick={handlePrevClick}
                                aria-label="Anterior"
                            >
                                <i className='bx bxs-left-arrow'></i> Ant
                            </button>
                        </li>
                        {[...Array(endPage - startPage + 1).keys()].map((num) => (
                            <li key={startPage + num} className={`page-item ${currentPage === startPage + num ? 'active btn-' : ''}`}>
                                <a
                                    className="page-link paginator-btn"
                                    href="#"
                                    onClick={() => setCurrentPage(startPage + num)}
                                >
                                    {startPage + num}
                                </a>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                               className={`page-link paginator-btn ${isNextClicked ? 'active' : ''}`}
                               onClick={handleNextClick}
                                aria-label="Siguiente"
                            >
                                Sig <i className='bx bxs-right-arrow ' ></i>
                            </button>
                        </li>
                    </ul>
                </nav>
                {/*}
            <form className="d-flex justify-content-end me-2" role="search" onSubmit={handleSubmit} >
            <input value={inputValue} onChange={handleChange} className="form-control me-2" type="search" placeholder="Buscar Trabajador" aria-label="Search" />
            <button className="btn  btn-outline-warning" type="submit"><i className='bx bx-search'></i></button>
            </form>*/}
            </div>
        </div>


    )
}
export default PaginarTrabajador