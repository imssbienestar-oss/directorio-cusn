import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import HeaderOficial from '../components/HeaderOficial';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/constants';

const REGIONES = {
  "Noroeste": ["Baja California", "Baja California Sur", "Sonora", "Sinaloa", "Nayarit", "Colima"],
  "Noreste": ["Tamaulipas", "Veracruz", "Zacatecas", "San Luis Potosí"],
  "Centro": ["Ciudad de México", "México", "Hidalgo"],
  "Suroeste": ["Michoacán", "Guerrero", "Morelos", "Puebla", "Tlaxcala"],
  "Sureste": ["Oaxaca", "Chiapas", "Tabasco", "Campeche", "Yucatán", "Quintana Roo"]
};

function TarjetasInformativas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);

  const qFunc = unidadSeleccionada ? (parseInt(unidadSeleccionada.q_func) || 0) : 0;
  const qNoFunc = unidadSeleccionada ? (parseInt(unidadSeleccionada.q_no_func) || 0) : 0;
  const totalQuirofanos = qFunc + qNoFunc;
  const [cluesData, setCluesData] = useState([]);
  const navigate = useNavigate();

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(20);

  // FILTRO DE ESTADO
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroRegion, setFiltroRegion] = useState('TODAS');

  // --- BD Railway
  const API_SIBE_URL = "https://torre-control-production.up.railway.app/api/unidades/publico";

  // --- PDFs
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

  const opcionesEntidad = React.useMemo(() => {
    // 1. Primero sacamos todas las entidades que existen en tus datos (BD)
    const todasLasEntidades = [...new Set(cluesData.map(d => d.entidad).filter(Boolean))];

    // 2. Si el usuario NO ha seleccionado región, mostramos todas
    if (filtroRegion === 'TODAS') {
      return todasLasEntidades.sort();
    }

    // 3. Si YA seleccionó región, filtramos la lista
    const estadosDeLaRegion = REGIONES[filtroRegion] || [];

    // Cruzamos las dos listas: Solo mostramos las entidades que (A) Existen en la BD y (B) Pertenecen a esa región
    return todasLasEntidades
      .filter(entidad => estadosDeLaRegion.includes(entidad))
      .sort();

  }, [cluesData, filtroRegion]);

  const opcionesNivel = React.useMemo(() => {
    const unicos = [...new Set(cluesData.map(d => d.nivel).filter(Boolean))];
    return unicos.sort();
  }, [cluesData]);

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
      (item.municipio && item.municipio.toUpperCase().includes(termino)) ||
      (item.plan_clave && item.plan_clave.toUpperCase().includes(termino)) ||
      (item.plan_desc && item.plan_desc.toUpperCase().includes(termino))
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

    const coincideEntidad = filtroEntidad === 'TODAS' || item.entidad === filtroEntidad;
    const coincideNivel = filtroNivel === 'TODOS' || item.nivel === filtroNivel;

    let coincideRegion = true;
    if (filtroRegion !== 'TODAS') {
      const estadosDeLaRegion = REGIONES[filtroRegion] || [];
      coincideRegion = estadosDeLaRegion.includes(item.entidad);
    }

    return coincideTexto && coincideEstado && coincideEntidad && coincideNivel && coincideRegion;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-xl font-bold text-gray-500 animate-pulse">Cargando Unidades... 🗂️</div>
      </div>
    );
  }

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroRegion('TODAS');
    setFiltroEntidad('TODAS');
    setFiltroNivel('TODOS');
    setFiltroEstado('TODOS');
    setVisibleCount(20);
  };

  const hayFiltrosActivos =
    searchTerm !== '' ||
    filtroRegion !== 'TODAS' ||
    filtroEntidad !== 'TODAS' ||
    filtroNivel !== 'TODOS' ||
    filtroEstado !== 'TODOS';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Directorio de Unidades Médicas</h1>
          <p className="text-gray-500">Gestión y semaforización de Cédulas de Unidades Médicas.</p>
        </div>

        {/* --- BARRA DE CONTROL Y FILTROS --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">

          {/* FILA 1: BUSCADOR Y DROPDOWNS */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">

            {/* Buscador (Más ancho) */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre, CLUES o municipio..."
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-800 uppercase text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2 text-gray-950"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7">
                <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" />
              </svg>
              </span>
            </div>
            {/* Select Región */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]"
                value={filtroRegion}
                onChange={(e) => {
                  setFiltroRegion(e.target.value);
                  setFiltroEntidad('TODAS'); // Tip Pro: Si cambias de región, resetea la entidad para no confundir
                }}
              >
                <option value="TODAS">
                  Todas las Regiones</option>
                {Object.keys(REGIONES).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Select Entidad */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]"
                value={filtroEntidad}
                onChange={(e) => setFiltroEntidad(e.target.value)}
              >
                <option value="TODAS">Todas las Entidades</option>
                {opcionesEntidad.map(ent => (
                  <option key={ent} value={ent}>{ent}</option>
                ))}
              </select>
            </div>

            {/* Select Nivel */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                  <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
              >
                <option value="TODOS">Todos los Niveles</option>
                {opcionesNivel.map(niv => (
                  <option key={niv} value={niv}>{niv}</option>
                ))}
              </select>
            </div>
          </div>

          {/* FILA 2: BOTONES DE ESTATUS Y CONTADOR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">

            {/* Botones de Colores */}
            <div className="flex overflow-x-auto gap-2 pb-1 w-full md:w-auto scrollbar-hide">
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
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1 px-3 py-2 ml-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition-all animate-fade-in"
              >
                {/* Icono de Papelera SVG (Estilo oficial) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                </svg>

                ELIMINAR FILTROS
              </button>
            )}
            {/* Contador */}
            <div className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
              {resultados.length} de {totalUnidades} Resultados
            </div>

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
                    {unidad.nivel && (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded border bg-indigo-50 text-indigo-700 border-indigo-200">
                        {unidad.nivel}
                      </span>
                    )}

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

                      Actualizado: <span className="font-medium text-gray-600">{fechaArchivo}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => setUnidadSeleccionada(unidad)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
                  >
                    Detalles
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
                    <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-red-500 bg-red-50 border border-red-100 whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                      </svg>
                      Pendiente
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
        <ModalExpedienteSibe
          unidadId={unidadSeleccionada.clues}
          onClose={() => setUnidadSeleccionada(null)}
        />
      )}
    </div>
  );
}

const ModalExpedienteSibe = ({ unidadId, onClose }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullData = async () => {
      if (!unidadId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://torre-control-production.up.railway.app/api/unidades/publico/${unidadId}`);
        if (!response.ok) throw new Error(`Error ${response.status}: No se pudo obtener la información.`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error al cargar expediente:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [unidadId]);

  // --- COMPONENTES INTERNOS ---

  const SubNav = ({ items }) => (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 flex gap-6 px-10 py-3 overflow-x-auto scrollbar-hide shadow-sm">
      {items.map(item => (
        <a 
          key={item.id} 
          href={`#${item.id}`} 
          className="text-[10px] font-bold text-slate-400 hover:text-[#1B4D3E] uppercase tracking-wider transition-colors whitespace-nowrap"
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h3 className="text-[11px] font-black text-[#1B4D3E] uppercase tracking-[0.2em] mb-4 border-b pb-2 mt-6 first:mt-0">
      {title}
    </h3>
  );

  const SubSection = ({ id, title, children }) => (
    <div id={id} className="mb-10 last:mb-0 scroll-mt-24">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-1 bg-[#D4AF37] rounded-full"></div>
        <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );

  const DataBox = ({ label, value }) => (
    <div className="bg-gray-50/50 p-3 rounded border border-gray-100">
      <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">{label}</span>
      <span className="text-sm text-slate-700 font-semibold">{value || '---'}</span>
    </div>
  );

  const StatusCard = ({ label, val }) => (
    <div className="p-4 rounded border border-gray-100 flex flex-col items-center bg-white shadow-sm">
      <span className="text-[9px] font-bold text-gray-400 uppercase mb-2 text-center">{label}</span>
      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${val?.toUpperCase() === 'SÍ' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
        {val || 'N/D'}
      </span>
    </div>
  );

  // --- RENDERS DE ESTADO ---

  if (error) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-sm">
        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
        <p className="text-sm font-bold text-gray-800 uppercase mb-4">{error}</p>
        <button onClick={onClose} className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold text-xs uppercase">Cerrar</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center">
        <div className="w-12 h-12 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consultando Datos Oficiales</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-fade-in">

        {/* HEADER INSTITUCIONAL */}
        <div className="bg-[#1B4D3E] p-6 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center border border-white/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight leading-tight">{data.nombre}</h2>
              <p className="text-xs text-white/60 font-medium">CLUES: {data.clues} | {data.entidad_nombre || data.entidad}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white text-2xl font-light">✕</button>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="flex bg-slate-50 border-b overflow-x-auto scrollbar-hide">
          {['GENERAL', 'INFRAESTRUCTURA', 'RECURSOS HUMANOS', 'CAPACIDAD OPERATIVA'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab ? 'border-[#D4AF37] text-[#1B4D3E] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SUB-NAVEGACIÓN (Sticky) */}
        {activeTab === 'INFRAESTRUCTURA' && (
          <SubNav items={[
            { id: 'suministros', label: 'Suministros' },
            { id: 'telecom', label: 'Conectividad' },
            { id: 'inmueble', label: 'Inmueble' }
          ]} />
        )}
        {activeTab === 'RECURSOS HUMANOS' && (
          <SubNav items={[
            { id: 'plantilla', label: 'Plantilla General' },
            { id: 'especialidades', label: 'Médicos Especialistas' }
          ]} />
        )}
        {activeTab === 'CAPACIDAD OPERATIVA' && (
          <SubNav items={[
            { id: 'consulta', label: 'Consulta Externa' },
            { id: 'hospitalizacion', label: 'Hospitalización' },
            { id: 'quirurgico', label: 'Área Quirúrgica' }
          ]} />
        )}

        {/* CUERPO DEL EXPEDIENTE */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white scroll-smooth">
          
          {activeTab === 'GENERAL' && (
            <div className="space-y-8 animate-fade-in">
              <SubSection title="Datos de Identificación">
                <DataBox label="Nivel de Atención" value={data.nivel} />
                <DataBox label="Tipología" value={data.tipologia} />
                <DataBox label="Estatus Operativo" value={data.estatus_operacion} />
                <div className="md:col-span-3"><DataBox label="Domicilio Completo" value={data.direccion} /></div>
              </SubSection>
            </div>
          )}

          {activeTab === 'INFRAESTRUCTURA' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <SubSection id="suministros" title="Servicios Básicos y Suministros">
                <StatusCard label="Agua Potable" val={data.srv_agua_potable_oficial} />
                <StatusCard label="Energía Eléctrica" val={data.srv_energia_electrica_oficial} />
                <StatusCard label="Drenaje / Alcantarillado" val={data.srv_drenaje_oficial} />
                <StatusCard label="Planta de Emergencia" val={data.srv_planta_luz_oficial} />
              </SubSection>

              <SubSection id="telecom" title="Telecomunicaciones">
                <StatusCard label="Acceso a Internet" val={data.srv_internet_tipo_oficial} />
                <StatusCard label="Red de Telefonía" val={data.srv_telefonia_oficial} />
                <DataBox label="Ancho de Banda" value={data.srv_internet_velocidad} />
              </SubSection>

              <SubSection id="inmueble" title="Detalles del Edificio">
                <DataBox label="M2 Terreno" value={data.srv_infra_m2_terreno_oficial} />
                <DataBox label="M2 Construcción" value={data.srv_infra_m2_construccion_oficial} />
                <DataBox label="Fecha Construcción" value={data.fecha_construccion} />
                <DataBox label="Estado de Conservación" value={data.estado_inmueble} />
              </SubSection>
            </div>
          )}

          {activeTab === 'RECURSOS HUMANOS' && (
            <div className="space-y-12 animate-fade-in">
              <section id="plantilla">
                <SectionHeader title="Plantilla de Personal Oficial" />
                <div className="border rounded-lg overflow-hidden border-gray-100 mb-8 shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Categoría de Personal</th>
                        <th className="text-center px-2">Ocu.</th>
                        <th className="text-center px-2">Vac.</th>
                        <th className="text-center px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700 bg-white">
                      <TableRow label="Médicos Generales" ocu={data.rh_med_general_ocu_oficial} vac={data.rh_med_general_vac_oficial} />
                      <TableRow label="Médicos Especialistas" ocu={data.rh_med_cirujano_ocu_oficial} vac={data.rh_med_cirujano_vac_oficial} />
                      <TableRow label="Enfermería General" ocu={data.rh_enf_general_ocu_oficial} vac={data.rh_enf_general_vac_oficial} />
                      <TableRow label="Personal Paramédico" ocu={data.rh_paramedico_oficial} vac={0} />
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'CAPACIDAD OPERATIVA' && (
            <div className="space-y-12 animate-fade-in">
              <SubSection id="consulta" title="Consulta Externa">
                <CapacityCircle label="Consultorios Grales" hab={data.sm_ce_med_gral_hab_oficial} des={data.sm_ce_med_gral_des_oficial} />
                <CapacityCircle label="Consultorios Especialidad" hab={data.sm_ce_especialidad_hab_oficial} des={0} />
              </SubSection>
              
              <SubSection id="hospitalizacion" title="Hospitalización">
                <CapacityCircle label="Camas Sensables" hab={data.sm_hosp_camas_hab_oficial} des={data.sm_hosp_camas_des_oficial} />
                <CapacityCircle label="Camas Pediatría" hab={data.sm_hosp_camas_pediatria_hab_oficial} des={0} />
              </SubSection>

              <SubSection id="quirurgico" title="Área Quirúrgica">
                <CapacityCircle label="Quirófanos" hab={data.sm_qx_salas_operacion_hab_oficial} des={data.sm_qx_salas_operacion_des_oficial} />
                <CapacityCircle label="Salas de Expulsión" hab={data.sm_qx_salas_expulsion_hab_oficial} des={0} />
              </SubSection>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end px-10">
          <button
            onClick={onClose}
            className="bg-[#1B4D3E] text-white px-10 py-2.5 rounded font-bold text-sm hover:bg-[#153b2f] transition-all shadow-md active:scale-95"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const TableRow = ({ label, ocu, vac }) => (
  <tr className="hover:bg-gray-50/50 transition-colors">
    <td className="px-4 py-3 font-medium text-slate-700">{label}</td>
    <td className="text-center font-bold text-slate-600">{ocu || 0}</td>
    <td className="text-center font-bold text-red-400">{vac || 0}</td>
    <td className="text-center font-black text-[#1B4D3E]">{(Number(ocu) || 0) + (Number(vac) || 0)}</td>
  </tr>
);

const CapacityCircle = ({ label, hab, des }) => (
  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm hover:border-[#D4AF37] transition-all">
    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3 text-center tracking-tighter">{label}</span>
    <div className="flex justify-around items-end">
      <div className="text-center">
        <div className="text-2xl font-black text-[#1B4D3E]">{hab || 0}</div>
        <div className="text-[8px] font-bold text-gray-400 uppercase">Hab.</div>
      </div>
      <div className="text-center border-l border-gray-200 pl-4">
        <div className="text-lg font-bold text-red-300">{des || 0}</div>
        <div className="text-[8px] font-bold text-gray-400 uppercase">Des.</div>
      </div>
    </div>
  </div>
);
export default TarjetasInformativas;