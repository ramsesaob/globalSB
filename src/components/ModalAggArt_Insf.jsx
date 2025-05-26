import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { carritoContext } from '../contexts/carritoContext';

const ModalAggArt_Insf = ({  show, onClose, articuloSeleccionado, insuficiencias, setInsuficiencias, insuficienciasSinFiltrar, setInsuficienciasSinFiltrar }) => {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [codigoAlternativo, setCodigoAlternativo] = useState('');
    const [error, setError] = useState('');
    const [loadingDescripcion, setLoadingDescripcion] = useState(false);
    const [loading, setLoading] = useState(false);
      const { datosUsuario, apiBaseUrl } = useContext(carritoContext);

  
    useEffect(() => {
      if (articuloSeleccionado && articuloSeleccionado.Codigo) {
        setCodigo(articuloSeleccionado.Codigo);
        setDescripcion(articuloSeleccionado.Descripcion);
        setCodigoAlternativo('');
        setError('');
      }
    }, [articuloSeleccionado]);

   // console.log('Articulo seleccionado:', articuloSeleccionado);
    //console.log('Insuficiencias:', insuficiencias);
   // console.log('Insuficiencias sin filtrar:', insuficienciasSinFiltrar);


    const handleAgregarArticuloAlternativo = async () => {
      setLoading(true);
      if (codigoAlternativo) {
        try {
          const response = await fetch(`${apiBaseUrl}/art/serial2.json?codigo=${codigoAlternativo}`);
          if (!response.ok) {
            throw new Error(`Error al obtener artículo: ${response.statusText}`);
          }
    
          const data = await response.json();
          console.log('Respuesta de la API:', data);
    
          if (data && data.descripcion) {
            // Actualiza insuficiencias
            const updatedInsuficiencias = insuficiencias.map(insf => {
              if (insf.Codigo === articuloSeleccionado.Codigo && insf.Fecha === articuloSeleccionado.Fecha) {
                const existeAlternativo = insf.articulosAlternativos?.some(alt => alt.codigo === codigoAlternativo);
                if (!existeAlternativo) {
                  return {
                    ...insf,
                    articulosAlternativos: [
                      ...(insf.articulosAlternativos || []),
                      { 
                        codigo: codigoAlternativo, 
                        descripcion: data.descripcion, 
                        observacion: '', 
                        precio: parseFloat(data.precio) || 0,
                        stock_sistema: '',
                        stock_fisico:'' 
                      }
                    ]
                  };
                }
              }
              return insf;
            });
    
            setInsuficiencias(updatedInsuficiencias);
            console.log('Updated insuficiencias:', updatedInsuficiencias);

    
            // Actualiza insuficienciasSinFiltrar
            const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
              if (ins.Codigo === articuloSeleccionado.Codigo && ins.Fecha === articuloSeleccionado.Fecha) {
                return {
                  ...ins,
                  articulosAlternativos: [
                    ...(ins.articulosAlternativos || []),
                    { 
                      codigo: codigoAlternativo, 
                      descripcion: data.descripcion, 
                      observacion: '', 
                      precio: parseFloat(data.precio) || 0,
                      stock_sistema: 0,
                      stock_fisico: 0
                    }
                  ]
                };
              }
              return ins;
            });
    
            setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);
           // console.log('Updated insuficienciasSinFiltrar:', updatedInsuficienciasSinFiltrar);
    
            // Guardamos los datos en localStorage
            localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
            setLoading(false);
    
            // Limpiamos los campos
            setCodigoAlternativo('');
            setError('');
          } else {
            setError('Artículo no encontrado con el código ingresado.');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error al obtener artículo alternativo:', error);
          setError('Hubo un error al buscar el artículo.');
          setLoading(false);
        }
      } else {
        setError('Por favor ingrese un código de artículo alternativo.');
        setLoading(false);
      }
    };
    
    

    const handleEliminarArticuloAlternativo = (codigo) => {
      const updatedInsuficiencias = insuficiencias.map(insf => {
        if (insf.Codigo === articuloSeleccionado.Codigo && insf.Fecha === articuloSeleccionado.Fecha) {
          // Filtramos los artículos alternativos para eliminar el que coincida con el código
          const articulosAlternativosActualizados = insf.articulosAlternativos?.filter(articulo => articulo.codigo !== codigo);
          
          return {
            ...insf,
            articulosAlternativos: articulosAlternativosActualizados
          };
        }
        return insf;
      });
    
      // Actualizamos el estado de insuficiencias
      setInsuficiencias(updatedInsuficiencias);
      
      // Actualizamos también insuficienciasSinFiltrar
      const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
        if (ins.Codigo === articuloSeleccionado.Codigo && ins.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = ins.articulosAlternativos?.filter(articulo => articulo.codigo !== codigo);
          
          return {
            ...ins,
            articulosAlternativos: articulosAlternativosActualizados
          };
        }
        return ins;
      });
    
      setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);
      
      // Guardamos los datos actualizados en localStorage
      localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
    
      console.log('Articulo eliminado, insuficiencias actualizadas:', updatedInsuficiencias);
    };
    
    

    const handleObservacionChange = (codigo, value) => {
      const updatedInsuficiencias = insuficiencias.map(insf => {
        if (insf.Codigo === articuloSeleccionado.Codigo && insf.Fecha === articuloSeleccionado.Fecha) {
          // Actualiza la observación del artículo alternativo correspondiente
          const articulosAlternativosActualizados = insf.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, observacion: value }; // Actualiza la observación
            }
            return articulo;
          });
    
          return {
            ...insf,
            articulosAlternativos: articulosAlternativosActualizados
          };
        }
        return insf;
      });

      

    
      // Actualiza el estado de insuficiencias
      setInsuficiencias(updatedInsuficiencias);
    
      // Actualiza también el estado sin filtrar
      const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
        if (ins.Codigo === articuloSeleccionado.Codigo && ins.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = ins.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, observacion: value }; // Actualiza la observación
            }
            return articulo;
          });
    
          return {
            ...ins,
            articulosAlternativos: articulosAlternativosActualizados
          };
        }
        return ins;
      });
    
      setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);
    
      // Guarda los datos actualizados en localStorage
      localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
    
      console.log('Observación actualizada:', updatedInsuficiencias);
    };


    const handleStockSistemaChange = (codigo, value) => {
      const updatedInsuficiencias = insuficiencias.map(insf => {
        if (insf.Codigo === articuloSeleccionado.Codigo && insf.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = insf.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, stock_sistema: parseFloat(value) || 0 }; // Actualiza el stock sistema
            }
            return articulo;
          });
          return { ...insf, articulosAlternativos: articulosAlternativosActualizados };
        }
        return insf;
      });
    
      setInsuficiencias(updatedInsuficiencias);
      
      const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
        if (ins.Codigo === articuloSeleccionado.Codigo && ins.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = ins.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, stock_sistema: parseFloat(value) || 0 };
            }
            return articulo;
          });
          return { ...ins, articulosAlternativos: articulosAlternativosActualizados };
        }
        return ins;
      });
    
      setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);
      localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
    };
    
    const handleStockFisicoChange = (codigo, value) => {
      const updatedInsuficiencias = insuficiencias.map(insf => {
        if (insf.Codigo === articuloSeleccionado.Codigo && insf.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = insf.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, stock_fisico: parseFloat(value) || 0 }; // Actualiza el stock físico
            }
            return articulo;
          });
          return { ...insf, articulosAlternativos: articulosAlternativosActualizados };
        }
        return insf;
      });
    
      setInsuficiencias(updatedInsuficiencias);
      
      const updatedInsuficienciasSinFiltrar = insuficienciasSinFiltrar.map(ins => {
        if (ins.Codigo === articuloSeleccionado.Codigo && ins.Fecha === articuloSeleccionado.Fecha) {
          const articulosAlternativosActualizados = ins.articulosAlternativos.map(articulo => {
            if (articulo.codigo === codigo) {
              return { ...articulo, stock_fisico: parseFloat(value) || 0 };
            }
            return articulo;
          });
          return { ...ins, articulosAlternativos: articulosAlternativosActualizados };
        }
        return ins;
      });
    
      setInsuficienciasSinFiltrar(updatedInsuficienciasSinFiltrar);
      localStorage.setItem('insuficiencias', JSON.stringify(updatedInsuficiencias));
    };
    
    
      

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Artículos Alternativos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Código de Artículo Original</Form.Label>
            <Form.Control
              type="text"
              value={articuloSeleccionado?.Codigo || ''}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripción del Artículo Original</Form.Label>
            <Form.Control
              type="text"
              value={loadingDescripcion ? 'Cargando...' : descripcion || ''}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Código de Artículo para Ajustar</Form.Label>
            <Form.Control
              type="text"
              value={codigoAlternativo}
              onChange={(e) => setCodigoAlternativo(e.target.value)}
              placeholder="Ingrese el código del artículo alternativo"
            />
          </Form.Group>
          <Button variant="primary" onClick={handleAgregarArticuloAlternativo} setLoading={true} >
            Agregar Artículo
          </Button>

          {error && <div className="mt-2 text-danger">{error}</div>}
        </Form>

        {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Stock Sistema</th>
              <th>Stock Fisico</th>
              <th>Observación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {insuficiencias.some(insf =>
              insf.Codigo === articuloSeleccionado?.Codigo &&
              insf.Fecha === articuloSeleccionado?.Fecha &&
              Array.isArray(insf.articulosAlternativos) &&
              insf.articulosAlternativos.length > 0
            ) ? (
              insuficiencias.find(insf =>
                insf.Codigo === articuloSeleccionado?.Codigo &&
                insf.Fecha === articuloSeleccionado?.Fecha
              )?.articulosAlternativos.map((articulo, index) => (
                <tr key={index}>
                  <td>{articulo.codigo}</td>
                  <td>{articulo.descripcion}</td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      value={articulo.stock_sistema}
                      onChange={(e) => handleStockSistemaChange(articulo.codigo, e.target.value)}
                      min={0}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      value={articulo.stock_fisico}
                      onChange={(e) => handleStockFisicoChange(articulo.codigo, e.target.value)}
                      min={0}
                    />
                  </td>
                  <td>
                    <textarea
                      className="form-control form-control-sm"
                      rows="1"
                      style={{ width: '100%' }}
                      value={articulo.observacion || ''}
                      onChange={(e) => handleObservacionChange(articulo.codigo, e.target.value)}
                      maxLength={250} 
                    ></textarea>
                  </td>
                  <td>
                    <Button variant="danger" onClick={() => handleEliminarArticuloAlternativo(articulo.codigo)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No hay artículos Agregados.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAggArt_Insf;
