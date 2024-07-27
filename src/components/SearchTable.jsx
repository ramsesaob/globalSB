
import React, { useState } from 'react'
import { useNavigate} from 'react-router-dom';

const SearchTable = () => {
   
    
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
            isSmScreen ? 'd-flex flex-column justify-content-end align-items-center mb-3 p-1' : 'd-flex justify-content-between align-items-center mb-3 p-1'
          }`} >
         
              <form className="d-flex justify-content-end" role="search" onSubmit={handleSubmit} >
                              <input  value={inputValue} onChange={handleChange} className="form-control me-2 border-success text-success" type="search" placeholder="Buscar Nº de pedido" aria-label="Search" />                   
                              <button  className="btn  btn-outline-success" type="submit"><i className='bx bx-search'></i></button>
                            
              </form>
        </div>
        
    
        )
      }

export default SearchTable
