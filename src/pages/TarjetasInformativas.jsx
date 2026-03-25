import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import HeaderOficial from '../components/HeaderOficial';
import { COLORS } from '../utils/constants';

// Función para normalizar texto en las búsquedas
const limpiarTexto = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
};

const REGIONES = {
  "Noroeste": ["Baja California", "Baja California Sur", "Sonora", "Sinaloa", "Nayarit", "Colima"],
  "Noreste": ["Tamaulipas", "Veracruz", "Zacatecas", "San Luis Potosí"],
  "Centro": ["Ciudad de México", "México", "Hidalgo"],
  "Suroeste": ["Michoacán", "Guerrero", "Morelos", "Puebla", "Tlaxcala"],
  "Sureste": ["Oaxaca", "Chiapas", "Tabasco", "Campeche", "Yucatán", "Quintana Roo"]
};

function TarjetasInformativasPublicas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapaDeLinks, setMapaDeLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [cluesData, setCluesData] = useState([]);

  // PAGINACIÓN
  const [visibleCount, setVisibleCount] = useState(20);

  // FILTROS
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroEstatusOp, setFiltroEstatusOp] = useState('TODOS');
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroRegion, setFiltroRegion] = useState('TODAS');

  // --- RUTAS PÚBLICAS ---
  const API_SIBE_URL = "https://torre-control-production.up.railway.app/api/unidades/publico";
  const LINKS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        // 1. Obtener datos de la base de datos (Sin Auth)
        const respuestaApi = await fetch(API_SIBE_URL);
        if (!respuestaApi.ok) throw new Error('Error al conectar con SIBE');
        const dataBaseDatos = await respuestaApi.json();

        // 2. Obtener links del Excel
        const promesaLinks = new Promise((resolve, reject) => {
          Papa.parse(LINKS_URL, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
          });
        });
        const dataExcel = await promesaLinks;

        // 3. Procesar mapa de links
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
        setCluesData(dataBaseDatos);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  // Resetear paginación al buscar o filtrar
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, filtroEstado]);

  const opcionesEntidad = React.useMemo(() => {
    const todasLasEntidades = [...new Set(cluesData.map(d => d.entidad).filter(Boolean))];
    if (filtroRegion === 'TODAS') return todasLasEntidades.sort();
    const estadosDeLaRegion = REGIONES[filtroRegion] || [];
    return todasLasEntidades.filter(entidad => estadosDeLaRegion.includes(entidad)).sort();
  }, [cluesData, filtroRegion]);

  const opcionesNivel = React.useMemo(() => {
    return [...new Set(cluesData.map(d => d.nivel).filter(Boolean))].sort();
  }, [cluesData]);

  // ==========================================
  // ✨ SISTEMA DE FILTRADO ROBUSTO ✨
  // ==========================================
  const resultados = cluesData.filter(item => {
    const t = limpiarTexto(searchTerm);
    const palabras = t.split(/\s+/).filter(Boolean);
    const cluesKey = (item.clues || '').toUpperCase();
    const estatusOriginal = item.estatus_operacion || '';
    const estatusNorm = limpiarTexto(estatusOriginal);

    const cumpleBusqueda = (textoObjetivo) => {
      if (!textoObjetivo) return false;
      const objetivo = limpiarTexto(textoObjetivo);
      return palabras.every(p => objetivo.includes(p));
    };

    const coincideTexto = t === '' || (cluesKey.includes(t) || cumpleBusqueda(item.nombre) || cumpleBusqueda(item.municipio) || cumpleBusqueda(item.plan_clave) || cumpleBusqueda(item.plan_desc) || estatusNorm.includes(t));

    // Lógica de Estatus
    let coincideEstatusOp = true;
    if (filtroEstatusOp !== 'TODOS') {
      const esTransferencia = estatusNorm.includes('TRANSFERENCIA') || estatusNorm.includes('TRASFERENCIA');
      const esCorresponde = estatusNorm.includes('CORRESPONDE');
      const esBaja = estatusNorm.includes('BAJA') || estatusNorm.includes('FUERA');
      const esConstruccion = (estatusNorm.includes('CONSTRUCCI') || estatusNorm.includes('PROCESO')) && !esTransferencia;
      const esActivo = estatusNorm.includes('ACTIVO') || (estatusNorm.includes('OPERACION') && !esBaja);

      switch (filtroEstatusOp) {
        case 'ACTIVO': coincideEstatusOp = esActivo; break;
        case 'CONSTRUCCION': coincideEstatusOp = esConstruccion; break;
        case 'BAJA': coincideEstatusOp = esBaja; break;
        case 'NO_CORRESPONDE': coincideEstatusOp = esCorresponde; break;
        case 'PROCESO_TRANSFERENCIA': coincideEstatusOp = esTransferencia; break;
        default: coincideEstatusOp = true;
      }
    }

    const datosDrive = mapaDeLinks[cluesKey] || {};
    const tieneArchivo = !!datosDrive.url;
    let coincideEstado = true;
    if (filtroEstado === 'PENDIENTE') coincideEstado = !tieneArchivo;
    else if (filtroEstado === 'CON_ARCHIVO') coincideEstado = tieneArchivo;

    const coincideEntidad = filtroEntidad === 'TODAS' || item.entidad === filtroEntidad;
    const coincideNivel = filtroNivel === 'TODOS' || item.nivel === filtroNivel;

    let coincideRegion = true;
    if (filtroRegion !== 'TODAS') {
      const estadosDeLaRegion = REGIONES[filtroRegion] || [];
      coincideRegion = estadosDeLaRegion.includes(item.entidad);
    }

    return coincideTexto && coincideEstatusOp && coincideEstado && coincideEntidad && coincideNivel && coincideRegion;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-xl font-bold text-gray-500 animate-pulse">Cargando Unidades... 🗂️</div>
      </div>
    );
  }

  const limpiarFiltros = () => {
    setSearchTerm(""); setFiltroRegion('TODAS'); setFiltroEntidad('TODAS');
    setFiltroNivel('TODOS'); setFiltroEstado('TODOS'); setFiltroEstatusOp('TODOS');
    setVisibleCount(20);
  };

  const hayFiltrosActivos = searchTerm !== '' || filtroRegion !== 'TODAS' || filtroEntidad !== 'TODAS' || filtroNivel !== 'TODOS' || filtroEstado !== 'TODOS' || filtroEstatusOp !== 'TODOS';

  const obtenerEtiquetaFiltro = () => {
    if (!hayFiltrosActivos) return "Unidades Operativas";
    const partes = [];
    if (searchTerm) return `Coincidencias con "${searchTerm}"`;
    if (filtroEstado === 'PENDIENTE') partes.push("Sin Tarjeta Inf.");
    if (filtroEstado === 'CON_ARCHIVO') partes.push("Con Tarjeta Inf.");
    if (filtroEstatusOp !== 'TODOS') partes.push(filtroEstatusOp.replace(/_/g, ' '));
    if (filtroEntidad !== 'TODAS') partes.push(filtroEntidad);
    if (filtroRegion !== 'TODAS') partes.push(`Región ${filtroRegion}`);
    if (filtroNivel !== 'TODOS') partes.push(filtroNivel);
    return partes.join(' • ');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Directorio de Unidades Médicas</h1>
          <p className="text-gray-500">Consulta pública de Tarjetas Informativas.</p>
        </div>

        {/* --- PANEL DE FILTROS --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="relative w-full md:flex-1">
              <input type="text" placeholder="Buscar por nombre, CLUES o municipio..." className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-800 uppercase text-sm bg-gray-50 hover:bg-white transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" /><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clipRule="evenodd" /></svg>
              </span>
            </div>

            <div className="flex overflow-x-auto gap-2 w-full md:w-auto scrollbar-hide pb-1 md:pb-0">
              {[{ id: 'TODOS', label: 'Todos', color: 'bg-gray-100 text-gray-600' }, { id: 'CON_ARCHIVO', label: '📄 Con Archivo', color: 'bg-blue-50 text-blue-700 border-blue-200' }, { id: 'PENDIENTE', label: '⚠️ Sin Archivo', color: 'bg-red-50 text-red-700 border-red-200' }].map((btn) => (
                <button key={btn.id} onClick={() => setFiltroEstado(btn.id)} className={`px-4 py-3 rounded-lg text-xs font-bold uppercase whitespace-nowrap border transition-all ${filtroEstado === btn.id ? 'ring-2 ring-offset-1 ring-blue-400 ' + btn.color : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}>{btn.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative w-full">
              <select className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none bg-white cursor-pointer" value={filtroEstatusOp} onChange={(e) => setFiltroEstatusOp(e.target.value)}>
                <option value="TODOS">Todos los Estatus</option>
                <option value="ACTIVO">En Operación</option>
                {/*<option value="CONSTRUCCION">En Construcción</option>*/}
                <option value="BAJA">Fuera de Operación</option>
                {/*<option value="NO_CORRESPONDE">No corresponde</option>*/}
                {/*<option value="PROCESO_TRANSFERENCIA">En proceso de transferencia</option>*/}
              </select>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z" clipRule="evenodd" /></svg></div>
              <select className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]" value={filtroRegion} onChange={(e) => { setFiltroRegion(e.target.value); setFiltroEntidad('TODAS'); }}>
                <option value="TODAS">Todas las Regiones</option>
                {Object.keys(REGIONES).map(region => (<option key={region} value={region}>{region}</option>))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" /></svg></div>
              <select className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]" value={filtroEntidad} onChange={(e) => setFiltroEntidad(e.target.value)}>
                <option value="TODAS">Todas las Entidades</option>
                {opcionesEntidad.map(ent => (<option key={ent} value={ent}>{ent}</option>))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-950 pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" /><path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" /></svg></div>
              <select className="w-full md:w-auto p-3 pl-10 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-800 outline-none bg-white min-w-[180px]" value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
                <option value="TODOS">Todos los Niveles</option>
                {opcionesNivel.map(niv => (<option key={niv} value={niv}>{niv}</option>))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-2 border-t border-gray-100 gap-4">
            <div className="w-full md:w-auto flex justify-start">
              {hayFiltrosActivos ? (
                <button onClick={limpiarFiltros} className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition-all animate-fade-in"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>LIMPIAR FILTROS</button>
              ) : <div className="hidden md:block w-32"></div>}
            </div>
            <div className="flex flex-col items-center md:items-end w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-800">{resultados.length}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-2 border-gray-200">{obtenerEtiquetaFiltro()}</span>
              </div>
              {hayFiltrosActivos && (<span className="text-[10px] text-gray-400 italic">de un universo de {cluesData.length} registros</span>)}
            </div>
          </div>
        </div>

        {/* --- TARJETAS --- */}
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
            const linkVisualizacion = rawLink ? rawLink.replace("uc?export=download&id=", "file/d/") + "/view" : null;

            return (
              <div key={unidad.clues} className={`bg-white p-6 rounded-xl shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg border-gray-100`}>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white text-xs font-bold px-2 py-1 rounded shadow-sm" style={{ backgroundColor: COLORS.verde }}>{unidad.clues}</span>
                    {unidad.nivel && (<span className="text-[10px] font-bold uppercase px-2 py-1 rounded border bg-indigo-50 text-indigo-700 border-indigo-200">{unidad.nivel}</span>)}

                    {/* ✨ ESTATUS: Solo visual, sin función de clic ✨ */}
                    {(() => {
                      const estatusOriginal = unidad.estatus_operacion ? unidad.estatus_operacion : '';
                      const estatus = limpiarTexto(estatusOriginal);

                      const esTransferencia = estatus.includes('TRANSFERENCIA') || estatus.includes('TRASFERENCIA');
                      const esBaja = estatus.includes('BAJA') || estatus.includes('FUERA');
                      const esConstruccion = (estatus.includes('CONSTRUCCI') || estatus.includes('PROCESO')) && !esTransferencia;
                      const esActivo = estatus.includes('ACTIVO') || (estatus.includes('OPERACION') && !esBaja);

                      let bgColor = 'bg-gray-50';
                      let textColor = 'text-gray-600';
                      let borderColor = 'border-gray-200';
                      let dotColor = 'text-gray-400';

                      if (esTransferencia) { bgColor = 'bg-purple-50'; textColor = 'text-purple-700'; borderColor = 'border-purple-200'; dotColor = 'text-purple-500'; }
                      else if (esBaja) { bgColor = 'bg-red-50'; textColor = 'text-red-700'; borderColor = 'border-red-200'; dotColor = 'text-red-500'; }
                      else if (esConstruccion) { bgColor = 'bg-blue-50'; textColor = 'text-blue-700'; borderColor = 'border-blue-200'; dotColor = 'text-blue-500'; }
                      else if (esActivo) { bgColor = 'bg-green-50'; textColor = 'text-green-700'; borderColor = 'border-green-200'; dotColor = 'text-green-500'; }

                      return (
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 ${bgColor} ${textColor} ${borderColor}`}>
                          <span className={`text-[12px] ${dotColor}`}>●</span>
                          {unidad.estatus_operacion || 'Sin Estatus'}
                        </span>
                      );
                    })()}

                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{unidad.nombre}</h3>
                  <p className="text-sm text-gray-500">{unidad.municipio} {unidad.entidad ? `• ${unidad.entidad}` : ''}</p>
                  {fechaArchivo && (<p className="text-xs text-green-800 mt-1">Actualizado: <span className="font-medium text-gray-900">{fechaArchivo}</span></p>)}
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  {/* ✨ BOTÓN DE TARJETA: Lo único que quedó ✨ */}
                  {linkVisualizacion ? (
                    <a href={linkVisualizacion} target="_blank" rel="noreferrer" style={{ backgroundColor: COLORS.guinda }} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all shadow-md transform active:scale-95 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      <span>Ver Tarjeta Inf.</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-red-500 bg-red-50 border border-red-100 text-sm italic">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
                      Pendiente Tarjeta
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < resultados.length && (
          <div className="text-center mt-8 pb-8">
            <button onClick={() => setVisibleCount(prev => prev + 20)} className="px-8 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all transform active:scale-95">
              ⬇️ Mostrar más
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default TarjetasInformativasPublicas;
