
import {Navigate, Outlet} from 'react-router-dom'
export const  RutasProtegidas = ({children, validado}) => {
   if(validado===false){
       return  <Navigate to={'/'}/>
   }
     return <Outlet/>
}