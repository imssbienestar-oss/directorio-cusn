import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Importamos las páginas desde sus nuevas carpetas
import PerfilFuncionario from './pages/PerfilFuncionario';
import TarjetasInformativas from './pages/TarjetasInformativas';
import Estadisticas from './pages/Estadisticas';
import NuevaInspeccion from './pages/NuevaInspeccion';
import CuestionarioInspeccion from './pages/CuestionarioInspeccion';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TarjetasInformativas />} />
        <Route path="/informativas" element={<TarjetasInformativas />} />
        <Route path="/perfil/:slug" element={<PerfilFuncionario />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/inspeccion/nueva" element={<NuevaInspeccion />} />
        <Route path="/inspeccion/cuestionario" element={<CuestionarioInspeccion />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
