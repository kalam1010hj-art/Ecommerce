import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Navigate } from "react-router-dom"
function ProtectedRoute({children}){
let {isAuthenticated} = useContext(AuthContext)
console.log(isAuthenticated)
if (!isAuthenticated){
 return <Navigate to="/login" replace/>
}

return(
    children
)
} export default ProtectedRoute;