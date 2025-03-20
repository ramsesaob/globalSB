import React, { useContext, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { carritoContext } from "../contexts/carritoContext";
const PorcentajeSuc = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [category, setCategory] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const { apiBaseUrl } = useContext(carritoContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/sucursal/porcentajesuc.json`);
        const result = await response.json();
        setData(result.sucursales);
        setFilteredData(result.sucursales); // Inicialmente muestra todos los datos
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Extraer sucursales y categorías únicas
    const uniqueSucursales = [...new Set(data.map(item => item.SUCURSAL))];
    const uniqueCategorias = [...new Set(data.map(item => item.Categoria))];
    setSucursales(uniqueSucursales);
    setCategorias(uniqueCategorias);
  }, [data]);

  const handleFilter = () => {
    const filtered = data.filter(item => {
      return (
        (category ? item.Categoria === category : true) &&
        (sucursal ? item.SUCURSAL === sucursal : true)
      );
    });
    setFilteredData(filtered);
  };

  // Preparar datos para el gráfico y ordenarlos
  const sortedData = [...filteredData].sort((a, b) => {
    return parseFloat(b.Porcentaje_Exist) - parseFloat(a.Porcentaje_Exist); // Ordenar de mayor a menor
  });

  const chartData = {
    labels: sortedData.map(item => item.SUCURSAL),
    datasets: [
      {
        label: 'Porcentaje de Existencia',
        data: sortedData.map(item => parseFloat(item.Porcentaje_Exist)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Función para formatear el porcentaje
  const formatPercentage = (value) => {
    return `${(parseFloat(value)).toFixed(2).replace('.', ',')}%`;
  };
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

  return (
    <div className="container">
      <h2 className='text-center mt-3'>Existencia de Sucursales</h2>
      <div>
      <div className="d-flex justify-content-between mb-2 border" style={{ width: '100%', display: 'flex', gap: '10px', alignItems: 'center', borderRadius: '5px', backgroundColor: '#BBD2C5' }}>
        <h5 style={{ width: '30%'}} className='text-center mt-2 font-weight-bold ' >Seleccione para filtrar:</h5>
        <select
          value={sucursal}
          onChange={(e) => setSucursal(e.target.value)}
          className="form-select mb-2 mt-2"
          style={{ width: '50%' }}
        >
          <option value="">Seleccione Sucursal</option>
          {sucursales
            .sort((a, b) => a.localeCompare(b)) // Ordenar alfabéticamente
            .map((suc, index) => (
              <option key={index} value={suc}>{suc}</option>
            ))}
        </select>


        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-select mb-2 mx-2 mt-2"
          style={{ width: '50%' }}
        >
          <option value="">Seleccione Categoría</option>
          {categorias.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        <button className="btn btn-success btn-sm mt-2 mb-2 mx-2" onClick={handleFilter}>Buscar</button>
          </div>
        
      </div>
      <Bar data={chartData} />
      <table className="table table-striped table-hover mt-3 text-center">
        <thead>
          <tr>
            <th>#</th>
            <th>Sucursal</th>
            <th>Categoría</th>
            <th>Existencia</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
              <td>{item.SUCURSAL}</td>
              <td>{item.Categoria}</td>
              <td>{formatNumber(item.Exist_Suc)}</td>
              <td>{formatPercentage(item.Porcentaje_Exist)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PorcentajeSuc;
