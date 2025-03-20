import React, { useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import ExportUpload1 from '../components/(exportar)/ExportUpload1';
import ExportUpload2 from '../components/(exportar)/ExportUpload2';
import { carritoContext } from "../contexts/carritoContext";
import Swal from 'sweetalert2';

const ExcelUpload = () => {
  const [data, setData] = useState([]);
  const [uComens, setUComens] = useState('');
  const [fileName, setFileName] = useState('');
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);
  const [d2Value, setComments] = useState('');
  const [c1Value, setNumAtCard] = useState('');
  const [sucursalMap, setSucursalMap] = useState(new Map());
  const [c2Value, setWarehouseCode] = useState('');

  // Filtros
  const [filterSucursal, setFilterSucursal] = useState('');
  const [filterCodigo, setFilterCodigo] = useState('');
  const [filterCantidad, setFilterCantidad] = useState('');
  const [filterPcsXbulto, setFilterPcsXbulto] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);

      // Verifica si el archivo ya ha sido subido
      try {
        const response = await fetch(`${apiBaseUrl}/ofertaventa/index.json`); // Ajusta la URL según sea necesario
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const existingFile = data.find(item => item.file_name === file.name);

        if (existingFile) {
          Swal.fire('Oops...', 'Este archivo ya ha sido subido.', 'error');
          return;
        }
      } catch (checkError) {
        console.error('Error checking file existence:', checkError);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const d1Cell = sheet['D1'];
        const d1Value = d1Cell ? d1Cell.v : '';
        setUComens(d1Value);

        const d2Cell = sheet['D2'];
        const d2Value = d2Cell ? d2Cell.v : '';
        setComments(d2Value);

        const c1Cell = sheet['C1'];
        const c1Value = c1Cell ? c1Cell.v : '';
        setNumAtCard(c1Value);

        const c2Cell = sheet['C2'];
        const c2Value = c2Cell ? c2Cell.v : '';
        setWarehouseCode(c2Value);

        const range = XLSX.utils.decode_range(sheet['!ref']);
        range.s.c = 1;
        range.s.r = 3;

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          range: range,
        });

        const headers = jsonData[0];
        const itemIndex = headers.indexOf('ITEM');
        const pcsXbultoIndex = headers.indexOf('PCS X BULTO');

        const sucursalIndices = {
          'V5': headers.indexOf('V5'),
          'V3': headers.indexOf('V3'),
          'VLN': headers.indexOf('VLN'),
          'V6': headers.indexOf('V6'),
          'MCY': headers.indexOf('MCY'),
          'MCY2': headers.indexOf('MCY2'),
          'BQ-C': headers.indexOf('BQ-C'),
          'BQ-E': headers.indexOf('BQ-E'),
          'MB-1': headers.indexOf('MB-1'),
          'MB-2': headers.indexOf('MB-2'),
          'MB-3': headers.indexOf('MB-3'),
          'C1': headers.indexOf('C1'),
          'C2': headers.indexOf('C2'),
          'C3': headers.indexOf('C3'),
          'C4': headers.indexOf('C4'),
          'C5': headers.indexOf('C5'),
          'C6': headers.indexOf('C6'),
          'C7': headers.indexOf('C7'),
          'C8': headers.indexOf('C8'),
          'BRN': headers.indexOf('BRN'),
          'SNC': headers.indexOf('SNC'),
          'MGRT': headers.indexOf('MGRT'),
          'MTRN': headers.indexOf('MTRN'),
          'PF01': headers.indexOf('PF01'),
          'LCH': headers.indexOf('LCH'),
          'C9': headers.indexOf('C9'),
          'C10': headers.indexOf('C10'),
        };

        const groupedData = {};

        jsonData.slice(1).forEach(row => {
          const codigo = row[itemIndex] || '';
          const pcsXbulto = row[pcsXbultoIndex] || 0;
          Object.entries(sucursalIndices).forEach(([sucursal, index]) => {
            const cantidad = row[index] || 0;
            if (cantidad > 0) {
              if (!groupedData[sucursal]) {
                groupedData[sucursal] = {};
              }
              if (!groupedData[sucursal][codigo]) {
                groupedData[sucursal][codigo] = { cantidad: 0, pcsXbulto: pcsXbulto };
              }
              groupedData[sucursal][codigo].cantidad += cantidad;
            }
          });
        });

        const formattedData = [];
        Object.keys(groupedData).forEach(sucursal => {
          Object.keys(groupedData[sucursal]).forEach(codigo => {
            formattedData.push({
              sucursal,
              codigo,
              cantidad: groupedData[sucursal][codigo].cantidad,
              pcsXbulto: groupedData[sucursal][codigo].pcsXbulto,
              uComens: d1Value,
              Comments: d2Value,
              NumAtCard: c1Value,
            });
          });
        });

        // Ordena los datos por el código en orden alfabético
        formattedData.sort((a, b) => {
          const sucursalComparison = a.sucursal.localeCompare(b.sucursal);
          if (sucursalComparison !== 0) return sucursalComparison;
          return a.codigo.localeCompare(b.codigo);
        });

        setData(formattedData);

        // Guarda los metadatos del archivo
        try {
          const response = await fetch(`${apiBaseUrl}/ofertaventa/guardar.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_name: file.name,
              upload_date: new Date().toISOString(), // Formato ISO 8601
              user_id: datosUsuario.user.id,
              numero_doc: `Web${d1Value}`,
            }),
          });
        
          // Verifica que la respuesta sea exitosa
          if (!response.ok) {
            const errorDetails = await response.text(); // Obtener detalles del error
            throw new Error(`Error saving file metadata: ${errorDetails}`);
          }
        
          console.log('File metadata saved successfully');
        } catch (insertError) {
          console.error('Error inserting file metadata:', insertError);
        }
        
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Filtrar datos según los filtros aplicados
  const filteredData = data.filter(row => {
    return (
      (filterSucursal === '' || row.sucursal.toLowerCase().includes(filterSucursal.toLowerCase())) &&
      (filterCodigo === '' || row.codigo.toLowerCase().includes(filterCodigo.toLowerCase())) &&
      (filterCantidad === '' || row.cantidad.toString().includes(filterCantidad)) &&
      (filterPcsXbulto === '' || row.pcsXbulto.toString().includes(filterPcsXbulto))
    );
  });

  return (
    <div className="container">
      <h1 className='text-center py-1'>Generar Ofertas de Ventas</h1>
      <div className="row flex-nowrap">
        <div className="col col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6">
          <h3>Carga Tu Archivo Aqui:</h3>
          <input
            className='form-control mb-3 form-control-md custom-file-input border-success text-success'
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>

        <div className="col col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 text-center">
          <h3>Archivos Para Exportar</h3>
          <ExportUpload2 data={data} uComens={uComens} d2Value={d2Value} c1Value={c1Value} onUpdateSucursalMap={setSucursalMap} c2Value={c2Value} />
          <ExportUpload1 data={data} uComens={uComens} sucursalMap={sucursalMap} c2Value={c2Value} />
        </div>
      </div>

      {/* Filtros */}
      <div className="row my-3">
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Filtrar por sucursal"
            className="form-control"
            value={filterSucursal}
            onChange={(e) => setFilterSucursal(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Filtrar por código"
            className="form-control"
            value={filterCodigo}
            onChange={(e) => setFilterCodigo(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Filtrar por cantidad"
            className="form-control"
            value={filterCantidad}
            onChange={(e) => setFilterCantidad(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Filtrar por pcs x bulto"
            className="form-control"
            value={filterPcsXbulto}
            onChange={(e) => setFilterPcsXbulto(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de datos filtrados */}
      <div className="row">
        <div className="col">
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>PCS X Bulto</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.sucursal}</td>
                    <td>{row.codigo}</td>
                    <td>{row.cantidad}</td>
                    <td>{row.pcsXbulto}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No se encontraron datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
