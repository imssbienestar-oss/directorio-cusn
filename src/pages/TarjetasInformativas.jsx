import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import HeaderOficial from '../components/HeaderOficial';
import { COLORS } from '../utils/constants';

function TarjetasInformativas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

  const qFunc = unidadSeleccionada ? (parseInt(unidadSeleccionada.q_func) || 0) : 0;
  const qNoFunc = unidadSeleccionada ? (parseInt(unidadSeleccionada.q_no_func) || 0) : 0;
  const totalQuirofanos = qFunc + qNoFunc;
  
  // AHORA LOS DATOS DE LAS UNIDADES VIVEN EN EL ESTADO
  const [cluesData, setCluesData] = useState([]);

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(20);

  // FILTRO DE ESTADO
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // --- 1. CONFIGURACIÓN DE FUENTES DE DATOS ---

  // A. BASE DE DATOS REAL (Railway) - Nombres, Municipios, Activos
  const API_SIBE_URL = "https://torre-control-production.up.railway.app/api/unidades/publico";

  // B. EXCEL DEL ROBOT (Links y Fechas de PDFs)
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

  // --- CARGA DE DATOS HÍBRIDA (API + EXCEL) ---
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        // PASO 1: Pedir el catálogo maestro a Railway
        const respuestaApi = await fetch(API_SIBE_URL);
        if (!respuestaApi.ok) throw new Error('Error al conectar con SIBE');
        const dataBaseDatos = await respuestaApi.json();

        // PASO 2: Pedir los Links al Excel
        const promesaLinks = new Promise((resolve, reject) => {
          Papa.parse(LINKS_URL, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
          });
        });
        const dataExcel = await promesaLinks;

        // PASO 3: Procesar Mapa de Links
        const mapa = {};
        if (dataExcel) {
          dataExcel.forEach(row => {
            if (row.clues) {
              mapa[row.clues.trim().toUpperCase()] = {
                url: row.link_pdf,
                fecha: row.fecha
              };
            }
          });
        }
        setMapaDeLinks(mapa);

        // PASO 4: Guardar los datos de la BD en el estado
        // La API ya devuelve { clues, nombre, municipio, entidad... }
        setCluesData(dataBaseDatos);
        setLoading(false);

      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  // RESETEAR PAGINACIÓN AL FILTRAR
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, filtroEstado]);

  const totalUnidades = cluesData.length;

  // --- LÓGICA DE FILTRADO
  const resultados = cluesData.filter(item => {
    const termino = searchTerm.toUpperCase();
    const cluesKey = item.clues ? item.clues.toUpperCase() : '';

    // Cruzamos con datos del Excel (Links)
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
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap border transition-all ${filtroEstado === btn.id
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

            // Buscamos si tiene Link de PDF
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
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setUnidadSeleccionada(unidad)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
                  >
                    📊 Detalles
                  </button>

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

      {unidadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">

            {/* Encabezado del Modal */}
            <div className="bg-gray-800 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{unidadSeleccionada.nombre}</h2>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  CLUES: {unidadSeleccionada.clues}
                </span>
              </div>
              <button
                onClick={() => setUnidadSeleccionada(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cuerpo del Modal: La Grid de Infraestructura */}
            <div className="p-6">
              <h3 className="text-gray-500 text-sm font-bold uppercase mb-4 border-b pb-2">
                Capacidad Instalada
              </h3>

              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Tarjeta Ambulancias */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  {/* Icono eliminado */}
                  <div className="text-2xl font-bold text-gray-700">{unidadSeleccionada.ambulancias || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Ambulancias</div>
                </div>

                {/* Tarjeta Consultorios */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  {/* Icono eliminado */}
                  <div className="text-2xl font-bold text-gray-700">{unidadSeleccionada.consultorios || 0}</div>
                  <div className="text-xs text-gray-600 font-medium">Consultorios</div>
                </div>

                {/* Tarjeta Quirófanos */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  {/* Número Total Grande */}
                  <div className="text-2xl font-bold text-gray-700">{totalQuirofanos}</div>
                  <div className="text-xs text-gray-600 font-medium uppercase mb-2">Total Quirófanos</div>

                  {/* Desglose Formal */}
                  <div className="flex justify-center gap-3 text-[10px] font-bold border-t border-gray-300 pt-2">
                    <span className="text-green-700">
                      {qFunc} Funcionales
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-700">
                      {qNoFunc} No Func.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
                <p>📍 <strong>Ubicación:</strong> {unidadSeleccionada.municipio}</p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={() => setUnidadSeleccionada(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TarjetasInformativas;