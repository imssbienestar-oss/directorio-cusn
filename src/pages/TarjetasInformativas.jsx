import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import HeaderOficial from '../components/HeaderOficial';
import { COLORS } from '../utils/constants';

// YA NO IMPORTAMOS EL JSON LOCAL
// import cluesDataEstática from '../data/clues.json'; 

function TarjetasInformativas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({});
  const [loading, setLoading] = useState(true);
  
  // AHORA LOS DATOS DE LAS UNIDADES VIVEN EN EL ESTADO
  const [cluesData, setCluesData] = useState([]); 

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(20);

  // FILTRO DE ESTADO
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // --- TUS 2 LINKS DE EXCEL (CSV) ---
  // 1. EL CATÁLOGO (Hoja con clues, nombre, municipio, etc.)
  const CATALOGO_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=1927761955&single=true&output=csv"; 
  
  // 2. LOS LINKS (Hoja que llena el Robot con los PDFs)
  const LINKS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  // --- FUNCIÓN DE FECHA ---
  const parsearFecha = (fechaString) => {
    if (!fechaString) return null;
    const partes = fechaString.split('-'); 
    if (partes.length === 3) {
      return new Date(partes[2], partes[1] - 1, partes[0]);
    }
    return new Date(fechaString);
  };

  // --- SEMÁFORIZACIÓN ---
  const analizarAntiguedad = (fechaString) => {
    if (!fechaString) return null;

    const fechaDoc = parsearFecha(fechaString);
    const hoy = new Date();
    
    if (isNaN(fechaDoc.getTime())) return null;

    const diferenciaTime = Math.abs(hoy - fechaDoc);
    const dias = Math.ceil(diferenciaTime / (1000 * 60 * 60 * 24)); 

    let tipo = 'VERDE';
    let color = 'bg-green-100 text-green-800 border-green-200';
    let texto = 'Actualizado';
    let icon = '🟢';

    if (dias > 30) {
        tipo = 'ROJO';
        color = 'bg-red-100 text-red-800 border-red-200';
        texto = 'Desactualizado';
        icon = '🔴';
    } else if (dias > 15) {
        tipo = 'AMARILLO';
        color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        texto = 'Atención';
        icon = '🟡';
    }

    return { tipo, color, texto, icon, dias };
  };

  // --- CARGA DE DATOS MAESTRA (CATÁLOGO + LINKS) ---
  useEffect(() => {
    const cargarTodo = async () => {
        // 1. Promesa para el Catálogo (Nombres, Municipio, etc.)
        const promesaCatalogo = new Promise((resolve) => {
            Papa.parse(CATALOGO_URL, {
                download: true, header: true,
                complete: (results) => resolve(results.data)
            });
        });

        // 2. Promesa para los Links (PDFs y Fechas)
        const promesaLinks = new Promise((resolve) => {
            Papa.parse(LINKS_URL, {
                download: true, header: true,
                complete: (results) => resolve(results.data)
            });
        });

        // Esperamos a que ambos terminen
        const [dataCatalogo, dataLinks] = await Promise.all([promesaCatalogo, promesaLinks]);

        // A. Guardamos el Catálogo en el estado (Filtrando filas vacías)
        const catalogoLimpio = dataCatalogo.filter(row => row.clues && row.nombre);
        setCluesData(catalogoLimpio);

        // B. Procesamos el Mapa de Links
        const mapa = {};
        if (dataLinks) {
            dataLinks.forEach(row => {
                if(row.clues) {
                    mapa[row.clues.trim().toUpperCase()] = {
                        url: row.link_pdf,
                        fecha: row.fecha 
                    };
                }
            });
        }
        setMapaDeLinks(mapa);
        setLoading(false);
    };

    cargarTodo();
  }, []);

  // RESETEAR PAGINACIÓN AL FILTRAR
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, filtroEstado]);

  // Usamos el estado 'cluesData' en lugar del json estático
  const totalUnidades = cluesData.length;

  // --- LÓGICA DE FILTRADO
  const resultados = cluesData.filter(item => {
    const termino = searchTerm.toUpperCase();
    const cluesKey = item.clues ? item.clues.toUpperCase() : '';
    
    // Datos del Excel de Links
    const datosDrive = mapaDeLinks[cluesKey] || {};
    const tieneArchivo = !!datosDrive.url;
    const infoSemaforo = analizarAntiguedad(datosDrive.fecha);

    // Filtro de Texto
    const coincideTexto = searchTerm === '' || (
      cluesKey.includes(termino) || 
      (item.nombre && item.nombre.toUpperCase().includes(termino)) ||
      (item.municipio && item.municipio.toUpperCase().includes(termino))
    );

    // Filtro de Estado
    let coincideEstado = true;
    if (filtroEstado === 'PENDIENTE') {
        coincideEstado = !tieneArchivo; 
    } else if (filtroEstado !== 'TODOS') {
        if (!tieneArchivo || !infoSemaforo) {
            coincideEstado = false;
        } else {
            coincideEstado = infoSemaforo.tipo === filtroEstado;
        }
    }

    return coincideTexto && coincideEstado;
  });

  // SI ESTÁ CARGANDO, MOSTRAMOS UN INDICADOR
  if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
             <div className="text-xl font-bold text-gray-500 animate-pulse">Cargando Tarjetas... 🗂️</div>
        </div>
      );
  }

 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />
      
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tarjetas Informativas</h1>
          <p className="text-gray-500">Gestión y semaforización de Cédulas de Unidades Médicas.</p>
        </div>

        {/* --- BARRA DE CONTROL Y FILTROS --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* BUSCADOR */}
                <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Buscar unidad..."
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-800 uppercase"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                </div>

                {/* FILTRO DE ESTADO */}
                <div className="flex overflow-x-auto gap-2 pb-1 w-full md:w-auto">
                    {[
                        { id: 'TODOS', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
                        { id: 'VERDE', label: '🟢 Al día', color: 'bg-green-50 text-green-700 border-green-200' },
                        { id: 'AMARILLO', label: '🟡 Atención', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        { id: 'ROJO', label: '🔴 Vencidos', color: 'bg-red-50 text-red-700 border-red-200' },
                        { id: 'PENDIENTE', label: '⚠️ Sin Archivo', color: 'bg-gray-800 text-white' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFiltroEstado(btn.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap border transition-all ${
                                filtroEstado === btn.id 
                                ? 'ring-2 ring-offset-1 ring-blue-400 ' + btn.color 
                                : 'border-gray-100 hover:bg-gray-50 text-gray-400'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* CONTADOR DE RESULTADOS */}
            <div className="mt-3 text-xs font-bold text-gray-400 text-right uppercase">
                Mostrando {resultados.length} de {totalUnidades} Unidades
            </div>
        </div>

        {/* --- LISTA DE RESULTADOS --- */}
        <div className="space-y-4">
          
          {resultados.length === 0 && !loading && (
             <div className="text-center py-10 opacity-60">
                <p className="text-xl font-bold">No hay unidades con este criterio</p>
             </div>
          )}

          {resultados.slice(0, visibleCount).map((unidad) => {
            const cluesKey = unidad.clues ? unidad.clues.toUpperCase() : '';
            
            const datosDrive = mapaDeLinks[cluesKey] || {}; 
            const rawLink = datosDrive.url;
            const fechaArchivo = datosDrive.fecha;

            // calculo de semáforo
            const semaforo = analizarAntiguedad(fechaArchivo);

            const linkVisualizacion = rawLink 
                ? rawLink.replace("uc?export=download&id=", "file/d/") + "/view"
                : null;

            return (
              <div key={unidad.clues} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-white text-xs font-bold px-2 py-1 rounded shadow-sm" style={{ backgroundColor: COLORS.verde }}>
                        {unidad.clues}
                      </span>
                      
                      {/* ETIQUETA SEMÁFORO */}
                      {semaforo && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 ${semaforo.color}`}>
                             {semaforo.icon} {semaforo.texto} ({semaforo.dias} días)
                          </span>
                      )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{unidad.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    {unidad.municipio} {unidad.entidad ? `• ${unidad.entidad}` : ''}
                  </p>

                  {fechaArchivo && (
                      <p className="text-xs text-gray-400 mt-1">
                          📅 Actualizado: <span className="font-medium text-gray-600">{fechaArchivo}</span>
                      </p>
                  )}
                </div>

                {linkVisualizacion ? (
                  <a 
                    href={linkVisualizacion} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 whitespace-nowrap"
                    style={{ backgroundColor: COLORS.guinda }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Ver Cédula</span>
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

        {/* VER MÁS PAGINACIÓN */}
        {visibleCount < resultados.length && (
          <div className="text-center mt-8 pb-8">
            <button 
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="px-8 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all transform active:scale-95"
            >
              ⬇️ Mostrar más
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default TarjetasInformativas;