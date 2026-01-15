import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Importamos las páginas desde sus nuevas carpetas
import Directorio from './pages/Directorio';
import PerfilFuncionario from './pages/PerfilFuncionario';
import TarjetasInformativas from './pages/TarjetasInformativas';
import Estadisticas from './pages/Estadisticas';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Directorio />} />
        <Route path="/informativas" element={<TarjetasInformativas />} />
        <Route path="/perfil/:slug" element={<PerfilFuncionario />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </HashRouter>
  );
}

export default App;