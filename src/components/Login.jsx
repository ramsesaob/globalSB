import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Swal from 'sweetalert2';
import logo from '../assets/Logo Global Business_1900x580.png';
// para el contexto
import { useContext } from "react";
import { carritoContext } from '../contexts/carritoContext';


const Login = ({show, handleClose}) => {

  const {setValidado, setDatosUsuario, datosUsuario, apiBaseUrl } = useContext(carritoContext)
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('')
  const [datosCorrectos, setDatosCorrectos] = useState(false);
  

  
  function handleUsuario(event) {
    setUsuario(event.target.value);
  
  }
  function handleContrasenia(event) {
    setContrasenia(event.target.value);
  
  }

  function enviarDatos(event) {
    event.preventDefault();
  
    fetch(`${apiBaseUrl}/usuarios/login.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: usuario,
        password: contrasenia,
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.message === 'Login successful') {
        if (data.user.status == 1) {
          // User is active, proceed with the login
          setDatosCorrectos(true);
          setValidado(true);
          setDatosUsuario(data);
          // ...
        } else {
          // User is inactive, display an error message
          setDatosCorrectos(false);
          setValidado(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El usuario está inactivo. Por favor, verifique.",
          });
        }
      } else {
        // Invalid credentials, display an error message
        setDatosCorrectos(false);
        setValidado(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Los datos ingresados no son correctos. Por favor, verifique.",
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema con la solicitud. Por favor, inténtelo de nuevo más tarde.",
      });
    });
  
    handleClose();
  }
  
  

const nav = {
  background: '#000000',  /* fallback for old browsers */
  background: '-webkit-linear-gradient(to bottom, #0f9b0f, #000000)',  /* Chrome 10-25, Safari 5.1-6 */
  background: 'linear-gradient(to bottom, #0f9b0f, #000000)', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
};


  return (
    
    <Modal show={show} onHide={handleClose} style={{ marginTop: '1%' }} size="sm" centered dialogClassName="modal-50w" className='text-white'>
    <Form onSubmit={enviarDatos} style={nav}>
      <Modal.Header closeButton>
        <Modal.Title className='text-center'>Inicio de Sesión   <img src={logo} alt="logo" width={120} className="rounded" /> </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Usuario</Form.Label>
          <div className="input-group flex-nowrap">
            <span className="input-group-text" id="addon-wrapping"><i className='bx bx-user'></i></span>
            <Form.Control
              autoComplete="on"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresar usuario"
              aria-label="Username"
              aria-describedby="addon-wrapping"
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Contraseña</Form.Label>
          <div className="input-group flex-nowrap">
            <span className="input-group-text" id="addon-wrapping"><i className='bx bxs-key'></i></span>
            <Form.Control
              type="password"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              placeholder="Ingresar contraseña"
              aria-label="Password"
              aria-describedby="addon-wrapping"
            />
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" type='submit'>
          Enviar
        </Button>
        <Button variant="danger" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
  
  );
}

export default Login;