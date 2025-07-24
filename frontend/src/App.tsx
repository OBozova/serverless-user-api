import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Detail from './pages/detail';
import Register from './pages/register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/detail"
          element={
            <ProtectedRoute>
              <Detail />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
