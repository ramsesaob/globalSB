import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { carritoContext } from "../contexts/carritoContext";

const AnalisisLogistica = () => {
    const { apiBaseUrl } = useContext(carritoContext);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([
        { value: 'oferta', label: 'Ofertas' },
        { value: 'orden', label: 'Órdenes' }
    ]);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [selectedDepartamento, setSelectedDepartamento] = useState(null);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [articuloInput, setArticuloInput] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingExistencias, setLoadingExistencias] = useState(false);
    const [filterExistencias, setFilterExistencias] = useState(null);
    const [existencias, setExistencias] = useState([]);
    const [triggerFetch, setTriggerFetch] = useState(false); // Estado para activar el efecto

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/sucursal/sucursales.json`);
                if (!response.ok) throw new Error('Error en la carga de sucursales');
                const result = await response.json();
                setSucursales(result.sucursales.map(s => ({
                    value: s.codigo, // Usar código para filtrar
                    label: `${s.nombre} (${s.codigo})` // Mostrar nombre junto con el código
                })));
                
            } catch (error) {
                console.error(error);
            }
        };

        const fetchDepartamentos = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/art/departamento.json`);
                if (!response.ok) throw new Error('Error en la carga de departamentos');
                const result = await response.json();
                setDepartamentos(result.departamento.map(d => ({ value: d.departamento, label: d.departamento })));
            } catch (error) {
                console.error(error);
            }
        };

        fetchSucursales();
        fetchDepartamentos();
    }, [apiBaseUrl]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Iniciar carga
            const sucursalParam = selectedSucursal ? `Cod=${encodeURIComponent(selectedSucursal.value)}` : '';
            const departamentoParam = selectedDepartamento ? `departamento=${encodeURIComponent(selectedDepartamento.value)}` : '';
            const params = [sucursalParam, departamentoParam].filter(param => param).join('&');
    
            if (params) {
                const url = `${apiBaseUrl}/sucursal/documentos.json?${params}`;
                 console.log('URL:', url);
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Error en la carga de datos');
                    const result = await response.json();
                    setData(result);
                } catch (error) {
                    console.error(error);
                    setData([]);
                }
            } else {
                setData([]);
            }
            setLoading(false); // Finalizar carga
        };
    
        fetchData();
    }, [apiBaseUrl, selectedSucursal, selectedDepartamento]);
    
 
    

    useEffect(() => {
        const fetchExistencias = async () => {
            if (selectedSucursal && selectedDepartamento) {
                let allArticulos = [];
                let currentPage = 1;
                const limit = 100; // Cambia esto al límite que desees
    
                setLoadingExistencias(true); // Iniciar carga
    
                try {
                    let totalPages = 1;
    
                    do {
                        const url = `${apiBaseUrl}/sucursal/existenciasucursal.json?departamento=${encodeURIComponent(selectedDepartamento.value)}&sucursal=${encodeURIComponent(selectedSucursal.value)}&page=${currentPage}&limit=${limit}`;
                        const response = await fetch(url);
    
                        if (!response.ok) throw new Error('Error en la carga de existencias');
    
                        const result = await response.json();
                        allArticulos = [...allArticulos, ...result.articulos]; // Agrega los artículos a la lista
                        totalPages = result.totalpages; // Obtiene el número total de páginas
                        currentPage++; // Incrementa la página actual
                    } while (currentPage <= totalPages); // Repite hasta que se hayan cargado todas las páginas
    
                    setExistencias(allArticulos); // Actualiza el estado con todos los artículos
                } catch (error) {
                    console.error(error);
                    setExistencias([]);
                } finally {
                    setLoadingExistencias(false); // Finalizar carga
                }
            }
        };
        
        fetchExistencias();
    }, [apiBaseUrl, selectedSucursal, selectedDepartamento]);

    useEffect(() => {
        const fetchArticuloData = async () => {
            setLoading(true);
            try {
                let filtered = [];
                if (articuloInput) {
                    // Buscar por artículo
                    const response = await fetch(`${apiBaseUrl}/sucursal/filtroart.json?Articulo=${encodeURIComponent(articuloInput)}`);
                    if (!response.ok) throw new Error('Error al cargar datos del artículo');
                    const result = await response.json();
                    filtered = result;
                } else {
                    // Filtrado regular
                    filtered = [...data];

                    // Filtrar por Sucursal
                    if (selectedSucursal) {
                        filtered = filtered.filter(item => item.Cod && item.Cod === selectedSucursal.value);
                    }

                    // Filtrar por Departamento
                    if (selectedDepartamento) {
                        filtered = filtered.filter(item => item.Departamento === selectedDepartamento.value);
                    }

                    // Filtrar por Tipo
                    if (selectedTipo) {
                        filtered = filtered.filter(item => item.Tipo.toLowerCase() === selectedTipo.value.toLowerCase());
                    }
                }

                // Combinar con existencias
                let filteredWithExistencias = filtered.map(item => {
                    const existencia = Array.isArray(existencias) ? existencias.find(e => e.ItemCode.trim() === item.Articulo.trim()) : null;
                    let existenciaValor;

                    if (existencia) {
                        const parsedValue = parseFloat(existencia.Exist_Suc.replace(',', '.').trim());
                        existenciaValor = !isNaN(parsedValue) && parsedValue >= 0 ? parsedValue : 'Sin Existencia';
                    } else {
                        existenciaValor = 'Sin Existencia';
                    }

                    return {
                        ...item,
                        Exist_Suc: existenciaValor
                    };
                });

                // Filtrar por existencias
                if (filterExistencias) {
                    if (filterExistencias.value === 'con') {
                        filteredWithExistencias = filteredWithExistencias.filter(item => typeof item.Exist_Suc === 'number' && item.Exist_Suc > 0);
                    } else if (filterExistencias.value === 'sin') {
                        filteredWithExistencias = filteredWithExistencias.filter(item => item.Exist_Suc === 'Sin Existencia');
                    }
                }

                setFilteredData(filteredWithExistencias);
            } catch (error) {
                console.error(error);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        if (triggerFetch) {
            fetchArticuloData();
            setTriggerFetch(false); // Resetear el trigger después de la búsqueda
        }
    }, [data, selectedSucursal, selectedDepartamento, selectedTipo, existencias, filterExistencias, triggerFetch]); // Remover articuloInput

    const handleSearch = () => {
        setTriggerFetch(true); // Activar el efecto
    };

   
  
    useEffect(() => {
     
   // Si no hay filtros seleccionados, restablece filteredData
   if (!selectedSucursal && !selectedDepartamento && !selectedTipo && !articuloInput && !filterExistencias) {
    setFilteredData([]); // Cambia a un array vacío
    return;
}

let filtered = [...data];

    // Filtrar por Sucursal
    if (selectedSucursal) {
        filtered = filtered.filter(item => item.Cod && item.Cod === selectedSucursal.value);
    }

    // Filtrar por Departamento
    if (selectedDepartamento) {
        filtered = filtered.filter(item => item.Departamento === selectedDepartamento.value);
    }

    // Filtrar por Tipo
    if (selectedTipo) {
        filtered = filtered.filter(item => item.Tipo.toLowerCase() === selectedTipo.value.toLowerCase());
    }

    // Filtrar por Artículo
    if (articuloInput) {
        filtered = filtered.filter(item => item.Articulo.toLowerCase().includes(articuloInput.toLowerCase()));
    }
    
        // Combinar con existencias
        let filteredWithExistencias = filtered.map(item => {
            const existencia = Array.isArray(existencias) ? existencias.find(e => e.ItemCode.trim() === item.Articulo.trim()) : null;
            let existenciaValor;
    
            if (existencia) {
                const parsedValue = parseFloat(existencia.Exist_Suc.replace(',', '.').trim());
                existenciaValor = !isNaN(parsedValue) && parsedValue >= 0 ? parsedValue : 'Sin Existencia';
            } else {
                existenciaValor = 'Sin Existencia';
            }
    
            return {
                ...item,
                Exist_Suc: existenciaValor
            };
        });
    
        // Filtrar por existencias
        if (filterExistencias) {
            if (filterExistencias.value === 'con') {
                filteredWithExistencias = filteredWithExistencias.filter(item => typeof item.Exist_Suc === 'number' && item.Exist_Suc > 0);
            } else if (filterExistencias.value === 'sin') {
                filteredWithExistencias = filteredWithExistencias.filter(item => item.Exist_Suc === 'Sin Existencia');
            }
        }
        
      //  console.log('Datos filtrados finales:', filteredWithExistencias);
        setFilteredData(filteredWithExistencias);
    }, [data, selectedSucursal, selectedDepartamento, selectedTipo, articuloInput, existencias, filterExistencias]);
    
// Efecto para ordenar los datos
    useEffect(() => {
    if (filteredData.length === 0) return; // Evita ejecutar si no hay datos

    let sortedData = [...filteredData];

    if (sortConfig.key) {
        sortedData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'ascending'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else {
                return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }
        });
    }

    setFilteredData(sortedData);
}, [ sortConfig]);



      
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
  

    // Función para formatear números
    const formatNumber = (num) => {
        return parseFloat(num).toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Obtiene solo la parte de la fecha (YYYY-MM-DD)
    };

    // Sumar bultos y piezas, y contar órdenes y ofertas
    const calculateTotals = () => {
        const totals = filteredData.reduce((totals, item) => {
           
           
            const bultosValue = item.Bultos || ''; // Asegúrate de que Bultos tenga un valor por defecto
            const piezasPorBulto = bultosValue.split('_')[1] ? parseFloat(bultosValue.split('_')[1]) : 0; // Verifica que el split se realice correctamente
            
          
            
            const cantidadAbierta = parseFloat(item['Cantidad abierta restante']) || 0;
            const BultoADesp = cantidadAbierta / piezasPorBulto; // Usa piezasPorBultoFinal aquí
            
            // Asegúrate de que BultoADesp sea al menos 1
            const BultoFinal = Math.max(1, BultoADesp);
            
           // console.log(`Item: ${item}, Bultos: ${bultos}, Piezas por bulto: ${piezasPorBulto}, Bultostotales: ${bultostotales}`);
    
            totals.bultos += BultoFinal;
            totals.piezas += cantidadAbierta;
    
            if (item.Tipo.toLowerCase() === 'oferta') {
                totals.ofertas += 1;
            } else if (item.Tipo.toLowerCase() === 'orden') {
                totals.ordenes += 1;
            }
    
            return totals;
        }, { bultos: 0, piezas: 0, ofertas: 0, ordenes: 0 });
    
      //  console.log(`Total de bultos calculados: ${totals.bultos}`);
        return totals;
    };
    

    const totals = calculateTotals();
    const printTable = () => {
        window.print();
    };
   
    const clearFilters = () => {
        setSelectedSucursal(null);
        setSelectedDepartamento(null);
        setSelectedTipo(null);
        setArticuloInput("");
        setFilterExistencias(null);
        setSortConfig({ key: null, direction: 'ascending' });
        setFilteredData([]); // Limpiar datos filtrados
    };
   
   
   // console.log('datos filtrados:', filteredData);


    return (
        <div className="container">
            <h1 className="text-center mb-4">Análisis Logístico</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="d-flex justify-content-between mb-3" style={{ display: 'flex', gap: '10px' }}>
                    <Select
                        options={sucursales}
                        onChange={setSelectedSucursal}
                        placeholder="Selecciona una sucursal"
                        value={selectedSucursal} // Agrega esto para enlazar el valor
                        styles={{ control: (base) => ({ ...base, minWidth: 200 }) }}
                    />
                    <Select
                        options={departamentos}
                        onChange={setSelectedDepartamento}
                        placeholder="Selecciona un departamento"
                        value={selectedDepartamento} // Agrega esto para enlazar el valor
                        styles={{ control: (base) => ({ ...base, minWidth: 200 }) }}
                    />
                    <Select
                        options={tipos}
                        onChange={setSelectedTipo}
                        placeholder="Selecciona un tipo de Doc"
                        value={selectedTipo} // Agrega esto para enlazar el valor
                        styles={{ control: (base) => ({ ...base, minWidth: 200 }) }}
                    />
                    <Select
                        options={[
                            { value: 'con', label: 'Con Existencias' },
                            { value: 'sin', label: 'Sin Existencias' }
                        ]}
                        onChange={option => setFilterExistencias(option)}
                        placeholder="Filtrar por existencias"
                        value={filterExistencias} // Agrega esto para enlazar el valor
                        styles={{ control: (base) => ({ ...base, minWidth: 200 }) }}
                    />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="text"
                                placeholder="Filtrar por Código"
                                value={articuloInput}
                                onChange={(e) => setArticuloInput(e.target.value)}
                                className="form-control"
                                style={{ minWidth: '100px' }} // Eliminar marginRight
                            />
                            <button onClick={handleSearch} className="btn btn-light">
                                <i className='bx bxs-search-alt-2'></i>
                            </button>
                            <button className="btn btn-danger" onClick={clearFilters}>
                                <i className='bx bx-trash'></i>
                            </button>
                        </div>
                </div>
            </div>
            {loading ? (
                  <div className="text-center">
                  <p>Cargando datos, por favor espera...</p>
                    <div className="spinner-border" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
              </div>
          ) : (

            <div>
                <table className="table table-bordered table-sm table-responsive">
                    <tbody>
                        <tr>
                            <td>Total de artículos encontrados:</td>
                            <td>{filteredData.length}</td>
                        </tr>
                        <tr>
                            <td>Total de bultos:</td>
                            <td>{formatNumber(totals.bultos)}</td>
                        </tr>
                        <tr>
                            <td>Total de piezas:</td>
                            <td>{formatNumber(totals.piezas)}</td>
                        </tr>
                        <tr>
                            <td>Total de ofertas:</td>
                            <td>{totals.ofertas}</td>
                        </tr>
                        <tr>
                            <td>Total de órdenes:</td>
                            <td>{totals.ordenes}</td>
                        </tr>
                    </tbody>
                </table>
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('Tipo')}>Tipo</th>
                            <th onClick={() => handleSort('Nº')}>Nº</th>
                            <th onClick={() => handleSort('Sucursal')}>Suc</th>
                            <th onClick={() => handleSort('Fecha')}>Fecha</th>
                            <th onClick={() => handleSort('Departamento')}>Dpto</th>
                            <th onClick={() => handleSort('Articulo')}>Código</th>
                            <th onClick={() => handleSort('Descripci\u00f3n Art\u00edculo')}>Descripción</th>
                            <th onClick={() => handleSort('Cantidad abierta restante')}>Cant Solict</th>
                            <th onClick={() => handleSort('Bultos')}>Pieza Bulto</th>
                            <th onClick={() => handleSort('Cantidad_Bultos')}>Bultos Desp</th>
                            <th onClick={() => handleSort('PiezasADesp')}>Piezas Desp</th>
                            <th onClick={() => handleSort('Exist_Galpon')}>Exist MB01</th>
                            <th onClick={() => handleSort('Exist_Galpon')}>Exist MB02</th>
                            <th onClick={() => handleSort('Exist_Suc')}>Exist Suc</th> 
                            <th onClick={() => handleSort('NumAtCard')}>Cont</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="12">No hay datos disponibles para mostrar.</td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => {
                               
                               
                                const bultosValue = item.Bultos || ''; // Asegúrate de que Bultos tenga un valor por defecto
                                const piezasPorBulto = bultosValue.split('_')[1] ? parseFloat(bultosValue.split('_')[1]) : 0; // Verifica que el split se realice correctamente
                                const cantidadAbierta = parseFloat(item['Cantidad abierta restante']) || 0;
                                const BultoADesp = cantidadAbierta /piezasPorBulto ;
                                const BultoFinal = Math.max(1, BultoADesp);

                                return (
                                    <tr key={index}>
                                        <td>{item.Tipo}</td>
                                        <td>{item.DocNum}</td>
                                        <td>{item.Cod}</td>
                                        <td>{formatDate(item.Fecha)}</td>
                                        <td>{item.Departamento}</td>
                                        <td>{item.Articulo}</td>
                                        <td>{item['Descripci\u00f3n Art\u00edculo']}</td>
                                        <td>{formatNumber(item['Cantidad abierta restante'])}</td>
                                        <td>{item.Bultos}</td>
                                        <td>{formatNumber(BultoFinal)}</td>
                                        <td>{formatNumber(cantidadAbierta) }</td>
                                        <td>{formatNumber(item['Exist_MB01'])}</td>
                                        <td>{formatNumber(item['Exist_MB02'])}</td>
                                        <td>
                                            {loadingExistencias ? 'Buscando...' : typeof item.Exist_Suc === 'number' ? formatNumber(item.Exist_Suc) : item.Exist_Suc}
                                        </td>
                                        <td>{item.NumAtCard}</td>


                                      
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
                <button className="btn btn-secondary mx-2" onClick={printTable}>
                    <i className='bx bxs-printer bx-md'></i>
                </button>
            </div>
             )}
        </div>
    );
};

export default AnalisisLogistica;
