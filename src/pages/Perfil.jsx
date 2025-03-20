import React, { useEffect, useState, useContext } from 'react';

import { carritoContext } from "../contexts/carritoContext";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { datosUsuario, apiBaseUrl } = useContext(carritoContext);



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = datosUsuario.user.id;
        const response = await fetch(`${apiBaseUrl}/usuarios/view/${id}.json`);
        const data = await response.json();

        if (response.ok) {
          // Solo toma el primer resultado si hay varios
          setUser(data);
        } else {
          console.warn('No user found or error occurred');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [datosUsuario]);


  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card">
          <h2>Perfil de Usuario</h2>
          <div className="profile-details">
            <div className="profile-item"><strong>Nombre:</strong> {user.nombre}</div>
            <div className="profile-item"><strong>Usuario:</strong> {user.username}</div>
           
            <div className="profile-item"><strong>Rol:</strong> {user.role}</div>
            
            <div className="profile-item"><strong>Departamento:</strong> {user.departamento}</div>
          
            
          </div>
        </div>
      ) : (
        <div>No se encontró el usuario.</div>
      )}
    </div>
  );
};

export default Perfil;
