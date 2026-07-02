import {Toaster, toast} from 'sonner';
import { BrowserRouter, Routes, Route} from 'react-router';
import Homepage from './pages/Homepage';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import Manufacture from './pages/Manufacture';

function App() {
 

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/manufacture" element={<Manufacture />} /> 
          
        </Routes>
      </BrowserRouter>
    
    <Toaster className = "right"/> <button onClick={() => toast('Order saved successfully!')}>SAVE</button>
    </>
  )
}

export default App
