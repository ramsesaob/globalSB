
import React, { useState } from 'react'
import { useNavigate} from 'react-router-dom';

const Paginar = ({currentPage, totalPages, handlePageChange }) => {
  const nav = {
    
    background: '#BBD2C5',  /* fallback for old browsers */
    background: '-webkit-linear-gradient(to left, #536976, #BBD2C5)',  /* Chrome 10-25, Safari 5.1-6 */
    background: 'linear-gradient(to left, #536976, #BBD2C5)', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

     };

     const [inputValue, setInputValue] = useState('');
    const handleChange = (event) => {
      setInputValue(event.target.value);
    };


    const navigate = useNavigate();
    const handleSubmit = (event) => {
      event.preventDefault();
      navigate('/busquedas', {
        state: inputValue,
      });	
    };
    // Use the useMediaQuery hook to get the screen size
    const isSmScreen = window.matchMedia("(max-width: 576px)").matches;
    return (

      <div className={`${
        isSmScreen ? 'd-flex flex-column justify-content-between align-items-center mb-3 p-1' : 'd-flex justify-content-between align-items-center mb-3 p-1'
      }`} style={nav}>
      <nav >
        <ul className="pagination py-2">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className=" btn btn-secondary page-link "
              href="#"
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Anterior"
            >
              <i class='bx bxs-left-arrow'></i> Ant
            </button>
          </li>
          {[...Array(totalPages).keys()].map((num) => (
            <li key={num + 1} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
              <a
                className="page-link"
                href="#"
                onClick={() => handlePageChange(num + 1)}
              >
                {num + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a
              className="page-link "
              href="#"
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Siguiente"
            >
              Sig <i class='bx bxs-right-arrow' ></i>
            </a>
          </li>
        </ul>
      </nav>
          <form className="d-flex justify-content-end" role="search" onSubmit={handleSubmit} >
                          <input  value={inputValue} onChange={handleChange} className="form-control me-2" type="search" placeholder="Buscar Nº de pedido" aria-label="Search" />                   
                          <button  className="btn  btn-outline-info" type="submit"><i class='bx bx-search'></i></button>
                        
          </form>
    </div>
    

    )
  }
export default Paginar
