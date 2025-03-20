import React from 'react'
import Grafico1 from '../components/(graficos)/Grafico1'

const Tendencias = () => {
  return (
    <div>
           <div className="row ">
                <div className="col-md-6 ">
                    <div className="card border border-warning-subtle  shadow h-100 p-2">
                        <Grafico1/>
                    </div> 
                </div>
            </div>   
    </div>
  )
}

export default Tendencias
