import {Home, Login, Profile, SignUp} from './pages'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import { AuthLayout } from './components'
function App() {
  return (
    <Routes>
      <Route path={"/"} element={<Layout />}>
        <Route path={""} element={<AuthLayout><Home /></AuthLayout>} />
        <Route path={"/signup"} element={<AuthLayout><SignUp /></AuthLayout>} />
        <Route path={"/login"} element={ <AuthLayout><Login /></AuthLayout>} />
        <Route path={"/profile"} element={<AuthLayout><Profile /></AuthLayout>} />
      </Route>
    </Routes>
  )
}

export default App