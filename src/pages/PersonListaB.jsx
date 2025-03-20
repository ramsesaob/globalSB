import React, { useState, useEffect } from 'react';

const PersonListaB = () => {
  const [personList, setPersonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://192.168.0.111/artemis/api/resource/v1/person/personList',  // URL completa
          {
            method: 'POST',
            headers: {
              'X-Ca-Key': '20231600',
              'x-ca-signature': 'V+f8JZJY1MSvCfGLmqByeOLMrFme3UeM2eUhqZt73Uk=',  // Firma calculada
              'Content-Type': 'application/json',
              'userId': 'admin',
            },
            body: JSON.stringify({ pageNo: 1, pageSize: 100 })  // Datos de la solicitud en formato JSON
          }
        );

        if (!response.ok) {
          throw new Error('Error en la solicitud');
        }

        const data = await response.json();  // Convertir la respuesta en JSON
        
        // Asegúrate de acceder correctamente a los datos de la respuesta
        if (data && data.data && data.data.list) {
          setPersonList(data.data.list);
        } else {
          setPersonList([]);
          setError('No se encontraron datos.');
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Error al obtener los datos');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Lista de Personas</h1>
      <table className="table table-striped table-hover table-bordered table-sm table-responsive table-condensed">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre </th>
            <th>Apellido</th>
            <th>Género</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>organizacion</th>
            <th>Foto</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {personList.length > 0 ? (
            personList.map(person => (
              <tr key={person.personId}>
                <td>{person.personCode}</td>
                <td>{person.personGivenName} </td>
                <td>{person.personFamilyName}</td>
                <td>{person.gender === 0 ? 'Masculino' : 'Femenino'}</td>
                <td>{person.IDGalac || 'No disponible'}</td>
                <td>{person.phoneNo || 'No disponible'}</td>
                <td>{person.orgIndexCode}</td>
                <td>
                  {person.personPhoto?.picUri ? (
                    <img src={person.personPhoto.picUri} alt={person.personName} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  ) : (
                    'No disponible'
                  )}
                </td>
                <td>{person.remark || 'No disponible'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No hay datos disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PersonListaB;
