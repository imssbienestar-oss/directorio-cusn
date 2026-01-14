import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import HeaderOficial from '../components/HeaderOficial';
import cluesDataEstática from '../data/clues.json';
import { COLORS } from '../utils/constants';

function TarjetasInformativas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({});
  const [loading, setLoading] = useState(true);

  // --- NUEVO ESTADO: EL FILTRO DE PENDIENTES ---
  const [soloFaltantes, setSoloFaltantes] = useState(false);

  // Link de tu CSV publicado
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  useEffect(() => {
    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const mapa = {};
        if (results.data) {
          results.data.forEach(row => {
            if (row.clues) {
              mapa[row.clues.trim().toUpperCase()] = row.link_pdf;
            }
          });
        }
        setMapaDeLinks(mapa);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error cargando Excel:", err);
        setLoading(false);
      }
    });
  }, []);

  // --- 1. CALCULAMOS ESTADÍSTICAS GLOBALES ---
  // Esto se hace antes de filtrar para mostrar los números reales siempre
  const totalUnidades = cluesDataEstática.length;
  // Contamos cuántas tienen link en el mapa
  const totalConCedula = cluesDataEstática.filter(item =>
    mapaDeLinks[item.clues ? item.clues.toUpperCase() : '']
  ).length;
  const totalSinCedula = totalUnidades - totalConCedula;
  const porcentajeAvance = Math.round((totalConCedula / totalUnidades) * 100) || 0;


  // --- 2. LÓGICA DE FILTRADO MAESTRA ---
  const resultados = cluesDataEstática.filter(item => {
    const termino = searchTerm.toUpperCase();
    const clues = item.clues ? item.clues.toUpperCase() : '';
    const entidad = item.entidad ? item.entidad.toUpperCase() : '';
    const nombre = item.nombre ? item.nombre.toUpperCase() : '';
    const municipio = item.municipio ? item.municipio.toUpperCase() : '';
    const nivel = item.nivel ? item.nivel.toUpperCase() : '';

    // Paso A: Filtro de Texto (Si está vacío, pasa todo)
    const coincideTexto = searchTerm === '' || (
      clues.includes(termino) ||
      nombre.includes(termino) ||
      municipio.includes(termino) ||
      entidad.includes(termino) ||
      nivel.includes(termino)
    );

    // Paso B: Filtro de "Solo Faltantes"
    const tieneCedula = !!mapaDeLinks[clues]; // Doble negación convierte a booleano real

    if (soloFaltantes && tieneCedula) {
      return false; // Si queremos solo faltantes y esta SÍ tiene, la ocultamos
    }

    // Paso C: Resultado final (AND lógico)
    // Debe coincidir el texto Y (si está activo el filtro) debe faltarle la cédula
    return coincideTexto;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Monitor de Acreditación</h1>
          <p className="text-gray-500">Gestión y descarga de Cédulas de Unidades Médicas.</p>
        </div>

        {/* --- NUEVO: TABLERO DE CONTROL (Estadísticas) --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
            
            {/* 1. Total Unidades */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase">Total Unidades</p>
                <p className="text-2xl font-bold text-gray-800">{totalUnidades}</p>
            </div>

            {/* 2. Con Cédula */}
            <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 text-center">
                <p className="text-xs text-green-600 font-bold uppercase">Con Cédula</p>
                <p className="text-2xl font-bold text-green-700">{totalConCedula}</p>
            </div>

            {/* 3. Pendientes (Botón Filtro) */}
            {/* CAMBIO: Agregué 'col-span-2 md:col-span-1' para que en celular ocupe todo el ancho de abajo */}
            <button 
                onClick={() => setSoloFaltantes(!soloFaltantes)}
                className={`p-4 rounded-xl shadow-sm border transition-all transform active:scale-95 text-center col-span-2 md:col-span-1 ${soloFaltantes ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-300' : 'bg-red-50 text-red-800 border-red-100 hover:bg-red-100'}`}
            >
                <p className={`text-xs font-bold uppercase ${soloFaltantes ? 'text-red-100' : 'text-red-600'}`}>Pendientes (Clic para filtrar)</p>
                <p className="text-2xl font-bold">{totalSinCedula}</p>
            </button>
        </div>

        {/* --- BUSCADOR --- */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white z-10 border border-gray-100">
            <input
              type="text"
              placeholder="Buscar por nombre, municipio, nivel..."
              className="w-full p-4 pl-14 border-none focus:ring-0 text-lg uppercase placeholder:normal-case text-gray-700"
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <span className="absolute left-5 text-gray-400 text-xl">
              {loading ? '⏳' : '🔍'}
            </span>
          </div>

          {/* Mensaje de estado del filtro */}
          <div className="flex justify-between items-center px-4 py-2 text-xs font-bold uppercase tracking-wider">
            <span>
              {soloFaltantes ? (
                <span className="text-red-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  Filtrando solo pendientes
                </span>
              ) : (
                <span className="text-gray-400">Mostrando todo</span>
              )}
            </span>
            <span className="text-gray-500">
              {resultados.length} Resultados visibles
            </span>
          </div>
        </div>

        {/* --- LISTA DE RESULTADOS --- */}
        <div className="space-y-4">

          {resultados.length === 0 && !loading && (
            <div className="text-center py-10 opacity-60">
              <p className="text-xl font-bold">No hay coincidencias</p>
              {soloFaltantes && <p className="text-sm text-red-500">¡Buenas noticias! No hay pendientes con ese criterio.</p>}
            </div>
          )}

          {resultados.map((unidad) => {
            const linkDescarga = mapaDeLinks[unidad.clues ? unidad.clues.toUpperCase() : ''];

            return (
              <div key={unidad.clues} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white text-xs font-bold px-2 py-1 rounded shadow-sm" style={{ backgroundColor: COLORS.verde }}>
                      {unidad.clues}
                    </span>
                    {unidad.nivel && (
                      <span className="text-gray-500 text-[10px] font-bold uppercase border border-gray-200 px-2 py-1 rounded">
                        {unidad.nivel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{unidad.nombre}</h3>
                  <p className="text-sm text-gray-500">{unidad.municipio} {unidad.entidad ? `• ${unidad.entidad}` : ''}</p>
                </div>

                {linkDescarga ? (
                  <a
                    href={linkDescarga}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 whitespace-nowrap"
                    style={{ backgroundColor: COLORS.guinda }}
                  >
                    <span>Descargar PDF</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-red-600 bg-red-50 border border-red-100 whitespace-nowrap">
                    ⚠️ Pendiente
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default TarjetasInformativas;