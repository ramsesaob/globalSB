import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'datatables.net-responsive-dt';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExportView1 from '../components/(exportar)/ExportView1';
import ExportView2 from '../components/(exportar)/ExportView2';
import { carritoContext } from "../contexts/carritoContext";
import ExportView3 from '../components/(exportar)/ExportView3';
import logo2 from '../assets/logo2.png';
import { ar } from 'date-fns/locale';

const ViewPage = () => {
  const { datosUsuario,apiBaseUrl } = useContext(carritoContext);
  const [ordenPedido, setOrdenPedido] = useState(null);
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  

  useEffect(() => {
    const getDatos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/ordenp/view/${id}.json`);
        const data = await response.json();
        setOrdenPedido(data.ordenPedido);

        // Inicializar DataTable después de obtener los datos
        // Check if DataTable is already initialized on the table before reinitializing
          if (!$.fn.DataTable.isDataTable('#table_id')) {
            $('#table_id').DataTable({
                responsive: true,
                paging: false,
                info: false,
                searching: false,
                ordering: false
            });
          }

      } catch (error) {
       // console.error(error);
      }
    };

    getDatos();
  }, [id]);

  //console.log(ordenPedido);



  if (!ordenPedido) {
    return <div className="text-center">Loading...</div>;
  }
  
  

  const exportToPDF = () => {
    const unit = 'pt';
    const size = 'A4';
    const orientation = 'portrait';
    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);
  
    const getMotivoDescripcion = (descripcion) => {
      if (descripcion === '1') {
        return 'Alta Rotación';
      } else if (descripcion === '2') {
        return 'Ventas al mayor';
      } else if (descripcion === '3') {
        return 'Ventas de Clientes Especiales';
      } else {
        return 'Descripción desconocida';
      }
    };
  
    doc.setFontSize(15);
    const title = `Orden Pedido #${ordenPedido.numero_ped}`;
    const motivo = `Motivo: ${getMotivoDescripcion(ordenPedido.descripcion)}`;
    const solicitud = `Fecha de Solicitud: ${ordenPedido.created ? new Date(ordenPedido.created).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No disponible'}`;
    const solicitante = `Solicitante: ${ordenPedido.user.nombre}`;
    const status_aprobado = `Status: ${ordenPedido.Status_aprobada}`;
    const logo = logo2;
    const headers = [['Serial', 'Descripción', 'Cant Sol', 'Cant Enviada', 'Despacho', 'Comentario']];
    
    // Ajustar aquí la forma en que se obtienen los datos
    const data = ordenPedido.orden_items.map(item => {
      const trasladoValue = String(item.traslado); // Asegúrate de que sea una cadena
      return [
        item.articulo?.codigo || 'No disponible',
        item.articulo?.descripcion || 'No disponible',
        item.cantidad || 'No disponible',
        item.cantidad_val || 'No disponible',
        trasladoValue === '1' ? 'Almacen' :
        trasladoValue === '2' ? 'Traslado Tienda' : 'No disponible',
        item.comentario || 'No disponible',
      ];
    });
    
  
    let content = {
      startY: 140,
      head: headers,
      body: data
    };
  
    const marginTop = 40;
  
    doc.text(title, doc.internal.pageSize.getWidth() / 2, marginTop, { align: 'center' });
    const imageWidth = 30;
    const imageHeight = 30;
    const marginLeft2 = 480;
    const marginTop2 = 20;
  
    doc.addImage(logo, 'PNG', marginLeft2, marginTop2, imageWidth, imageHeight);
    doc.text(motivo, marginLeft, marginTop + 20, { align: 'left' });
    doc.text(solicitud, marginLeft, marginTop + 40, { align: 'left' });
    doc.text(solicitante, marginLeft, marginTop + 60, { align: 'left' });
    doc.text(status_aprobado, marginLeft, marginTop + 80, { align: 'left' });
    doc.autoTable(content);
    doc.save(`OrdenPedido_${ordenPedido.numero_ped}.pdf`);
  };
  

       

  const printTable = () => {
    window.print();
  };
  const handleBack = () => {
    navigate(-1); // Navega hacia atrás usando navigate con el valor -1
  };

  return (
    <div className="container py-4">
    <div className="row ">
      <div className="col-lg-2">
      <button className="btn btn-light active border-success text-success mb-3" onClick={handleBack}>
          <i className="bx bx-arrow-back"></i> Regresar
        </button>
      </div>
      <div className="col-lg-8">
        
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <h3 className="card-title mb-0 text-center">Orden Pedido #{ordenPedido.numero_ped}</h3>
          </div>
          <div className="card-body">
            {ordenPedido.anulada === 0 ? (
              <h2>
                <div className="alert alert-danger text-center" role="alert">
                  ANULADA
                </div>
              </h2>
            ) : (
              ''
            )}
            <div className='row '>
            <div className='col-lg-6'>
              <p className="card-text"><strong>Creado:</strong> {new Date(ordenPedido.created).toLocaleString()}</p>
              </div>
              <div className='col-lg-6'>
              <p className="card-text"><strong>Motivo: </strong> 
                          {ordenPedido.descripcion === '1' ? 'Alta Rotación' :
                          ordenPedido.descripcion === '2' ? 'Ventas al por mayor' :
                          ordenPedido.descripcion === '3' ? 'Ventas de Clientes Especiales' :
                          'Descripción desconocida'} {/* Opcional */}
                        </p>
              </div>
              <div className='col-lg-6 py-1'>
              <p className="card-text"><strong>Solicitante:</strong> {ordenPedido.user.nombre}</p>
              </div>
             
              <div className='col-lg-6 py-1'>
              <p className="card-text"><strong>Status:</strong> {ordenPedido.Status_aprobada}</p>
              </div>
              <div className='col-lg-6'>
              <p className="card-text"><strong>Tipo: </strong>{ordenPedido.tipo === 'P' ? ('Estándar') : ('Navidad')} </p> 
              </div>
              <div className='col-lg-6'>
              <p className="card-text"><strong>Comentario: </strong>{ordenPedido.comentario} </p> 
              </div>
              
            </div>
           
            <div className="mt-1">
              <h5 className="mb-3 text-center">Artículos de la Orden</h5>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered table-condensed table-responsive text-center" id="table_id">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad Solicitada</th>
                      <th>Cantidad Enviada</th>
                      <th>Tipo Despacho</th>
                      <th>Comentario</th>
                   
                    </tr>
                  </thead>
                  <tbody>
                    {ordenPedido.orden_items.map((item, index) => {
                     // const articulo = articulos[index] || {}; // Obtiene el artículo correspondiente
                      return (
                        <tr key={item.id} className={item.validado == 1 ? 'table-success' : 'table-danger'}>
                          <td>{index + 1}</td>
                          <td>{item.articulo.codigo || 'No disponible'}</td>
                          <td>{item.articulo.descripcion  || 'No disponible'}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.cantidad_val}</td>
                          <td>{item.tipo_entrega === 1 ? 'Almacen' : item.traslado === 0 ? 'Traslado/Tienda' : ''}</td>
                          <td>{item.comentario}</td>
                         
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
  
            <div className="text-center mt-4">
              <button className="btn btn-danger mx-2" onClick={exportToPDF}>
                <i className=' bx bxs-file-pdf bx-md'></i> 
              </button>
              {datosUsuario.user.role == 'admin' &&  (
                <>
                
                <ExportView2 ordenPedido={ordenPedido} id={id} />
                <ExportView1 ordenPedido={ordenPedido} id={id}  />
                <ExportView3 ordenPedido={ordenPedido} id={id} />
                </>
                
              )}
              {datosUsuario.user.role === 'user2' && ordenPedido.anulada === 1 && (
                  <>
                    <ExportView2 ordenPedido={ordenPedido} id={id} />
                    <ExportView1 ordenPedido={ordenPedido} id={id} />
                    <ExportView3 ordenPedido={ordenPedido} id={id} />
                  </>
                )}
              
               
              <button className="btn btn-secondary mx-2" onClick={printTable}>
                <i className='bx bxs-printer bx-md'></i> 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  
  );
};

export default ViewPage;
