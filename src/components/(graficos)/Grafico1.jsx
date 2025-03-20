import { useContext, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { carritoContext } from '../../contexts/carritoContext';

// Registra los componentes que utilizarás
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Grafico1 = () => {
    const [categories, setCategories] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const { apiBaseUrl } = useContext(carritoContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/art/categorias.json`);
                const data = await response.json();
    
                if (response.ok) {
                    // Suponiendo que `data.categories` es el arreglo que necesitas
                    const categoryData = data.categories;
    
                    // Agrupar por categoría
                    const categoryTotals = {};
                    
                    categoryData.forEach(item => {
                        const category = item.categoria;
                        const stock = parseInt(item.total_stock, 10) || 0;
    
                        if (category) {
                            categoryTotals[category] = (categoryTotals[category] || 0) + stock;
                        }
                    });
    
                    // Ordenar categorías por cantidad de artículos (stock)
                    const sortedCategories = Object.entries(categoryTotals)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10); // Seleccionar las primeras 5 categorías
    
                    setCategories(sortedCategories.map(([category]) => category));
                    setStocks(sortedCategories.map(([, stock]) => stock));
                } else {
                    console.warn('Error fetching data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [apiBaseUrl]);
    
    

    const chartData = {
        labels: categories,
        datasets: [
            {
                label: 'Stock por Categoria',
                data: stocks,
                backgroundColor: '#188955e0',
                borderColor: '#0a130fe0',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h5 className='text-center'>Top 10 Categorías por Stock con mas Artículos</h5>
            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </div>
    );
};

export default Grafico1;
