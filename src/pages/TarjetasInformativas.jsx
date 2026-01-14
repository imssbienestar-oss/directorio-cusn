import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // Importamos el lector de Excel
import HeaderOficial from '../components/HeaderOficial';
import cluesDataEstática from '../data/clues.json'; // Tu JSON con nombres y direcciones
import { COLORS } from '../utils/constants';

function TarjetasInformativas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({}); // Aquí guardaremos los links del Excel
  const [loading, setLoading] = useState(true);

  // --- CONFIGURACIÓN DE TU EXCEL ---
  // Pega aquí el link que obtienes en: Archivo > Compartir > Publicar en la web > CSV
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  // 1. Cargar los links actualizados desde Google Sheets
  useEffect(() => {
    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        console.log("Lo que leo del Excel:", results.data);
        const mapa = {};
        if (results.data) {
          results.data.forEach(row => {
            if(row.clues) {
              mapa[row.clues.trim().toUpperCase()] = row.link_pdf;
            }
          });
        }
        setMapaDeLinks(mapa);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error cargando Excel:", err);
        setLoading(false); // Quitamos loading aunque falle para mostrar lo estático
      }
    });
  }, []);

  // 2. Filtrar el JSON estático (Buscamos por CLUES, Nombre o Municipio)
  const resultados = cluesDataEstática.filter(item => {
    if (searchTerm === '') return false; // Inicia vacío
    const termino = searchTerm.toUpperCase();
    
    // Protección por si el JSON tiene datos vacíos
    const clues = item.clues ? item.clues.toUpperCase() : '';
    const nombre = item.nombre ? item.nombre.toUpperCase() : '';
    const municipio = item.municipio ? item.municipio.toUpperCase() : '';

    return (
      clues.includes(termino) || 
      nombre.includes(termino) ||
      municipio.includes(termino)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tarjetas Informativas</h1>
          <p className="text-gray-500">Busca la unidad médica para descargar su Cédula o información actualizada.</p>
        </div>

        {/* --- BUSCADOR --- */}
        <div className="mb-12 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="Escribe CLUES, Nombre o Municipio..."
                  className="w-full p-4 pl-14 border-none focus:ring-0 text-lg uppercase placeholder:normal-case text-gray-700"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <span className="absolute left-5 text-gray-400 text-xl">
                  {loading ? '⏳' : '🏥'}
                </span>
                
                {/* Indicador de carga visual */}
                {loading && (
                   <div className="absolute right-4">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                   </div>
                )}
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">
              {loading ? 'Sincronizando con base de datos...' : 'Base de datos actualizada y lista'}
            </p>
        </div>

        {/* --- LISTA DE RESULTADOS --- */}
        <div className="space-y-4">
          
          {/* Mensaje si no encuentra nada */}
          {resultados.length === 0 && searchTerm !== '' && !loading && (
             <div className="text-center py-10 opacity-60">
                <p className="text-xl font-bold">No encontramos esa unidad</p>
                <p className="text-sm">Verifica la CLUES o el nombre</p>
             </div>
          )}

          {resultados.map((unidad) => {
            // Buscamos si existe un PDF actualizado en el Excel para esta unidad
            const linkDescarga = mapaDeLinks[unidad.clues];

            return (
              <div key={unidad.clues} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
                
                {/* Datos de la Unidad */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-white text-xs font-bold px-2 py-1 rounded shadow-sm" style={{ backgroundColor: COLORS.verde }}>
                        {unidad.clues}
                      </span>
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider border border-gray-200 px-2 py-1 rounded">
                        {unidad.municipio}
                      </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{unidad.nombre}</h3>
                  <p className="text-sm text-gray-500">{unidad.jurisdiccion}</p>
                </div>

                {/* Botón de Acción */}
                {linkDescarga ? (
                  <a 
                    href={linkDescarga} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 whitespace-nowrap"
                    style={{ backgroundColor: COLORS.guinda }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Descargar Cédula</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed whitespace-nowrap">
                    ⏳ Sin documento
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