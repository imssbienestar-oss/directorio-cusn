import React, { useState, useEffect } from 'react';
import HeaderOficial from '../components/HeaderOficial'; // Usamos el mismo Header que en Tarjetas
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/constants'; 

const NuevaInspeccion = () => {
  const navigate = useNavigate();
  
  // ESTADOS
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [seleccionados, setSeleccionados] = useState({});

  // 1. CARGAR MÓDULOS (Conexión a tu API)
  useEffect(() => {
    const cargarModulos = async () => {
      try {
        // Ajusta la URL si es necesario
        const response = await fetch('https://torre-control-production.up.railway.app/api/cedulas/modulos'); 
        if(response.ok) {
            const data = await response.json();
            setModulos(data);
        } else {
            // Fallback por si la API falla mientras pruebas
            console.warn("No se pudo conectar a la API, usando datos falsos");
            setModulos([
                { id: 1, nombre: 'Calidad', icono: 'clipboard-check' },
                { id: 2, nombre: 'Urgencias', icono: 'ambulance' } // Ejemplo
            ]);
        }
      } catch (error) {
        console.error("Error cargando módulos", error);
      } finally {
        setLoadingModulos(false);
      }
    };
    cargarModulos();
  }, []);

  // 2. BUSCAR UNIDADES
  const handleBuscar = (texto) => {
    setBusqueda(texto);
    if(texto.length > 2) {
        
        const mockResultados = [
            { clues: 'CSSSA0001', nombre: 'H.G. DR. BELISARIO DOMÍNGUEZ', municipio: 'TUXTLA GUTIÉRREZ' },
            { clues: 'CSSSA0002', nombre: 'C.S. TUXTLA', municipio: 'TUXTLA GUTIÉRREZ' },
            { clues: 'CSSSA0132', nombre: 'HOSPITAL BÁSICO COMUNITARIO', municipio: 'CINTALAPA' }
        ].filter(u => u.nombre.includes(texto.toUpperCase()) || u.clues.includes(texto.toUpperCase()));
        
        setResultadosBusqueda(mockResultados);
    } else {
        setResultadosBusqueda([]);
    }
  };

  const seleccionarUnidad = (unidad) => {
    setUnidadSeleccionada(unidad);
    setBusqueda('');
    setResultadosBusqueda([]);
  };

  // 3. MANEJO DE CHECKBOXES
  const toggleModulo = (id) => {
    setSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 4. ACCIÓN FINAL
  const iniciarInspeccion = () => {
    const modulosIds = Object.keys(seleccionados).filter(id => seleccionados[id]);
    alert(`Iniciando visita a ${unidadSeleccionada.nombre} con ${modulosIds.length} módulos.`);
    // Aquí navegarías a la pantalla de preguntas:
    // navigate('/inspeccion/cuestionario', { state: { unidad: unidadSeleccionada, modulos: modulosIds } });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24"> {/* pb-24 para espacio del botón flotante */}
      
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* TÍTULO (Estilo idéntico a TarjetasInformativas) */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nueva Inspección</h1>
          <p className="text-gray-500">Configura la visita seleccionando la unidad médica y las áreas a evaluar.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* --- COLUMNA IZQUIERDA: SELECCIÓN DE UNIDAD (4 columnas) --- */}
            <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🏥 1. Unidad Médica
                    </h2>
                    
                    {!unidadSeleccionada ? (
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-800 outline-none uppercase text-sm"
                                placeholder="Buscar CLUES o Nombre..."
                                value={busqueda}
                                onChange={(e) => handleBuscar(e.target.value)}
                            />
                            <span className="absolute left-3 top-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                                </svg>
                            </span>

                            {/* Lista Flotante de Resultados */}
                            {resultadosBusqueda.length > 0 && (
                                <div className="absolute w-full bg-white border border-gray-200 mt-2 rounded-lg shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                                    {resultadosBusqueda.map((uni) => (
                                        <div 
                                            key={uni.clues}
                                            onClick={() => seleccionarUnidad(uni)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors"
                                        >
                                            <div className="font-bold text-gray-800 text-xs">{uni.clues}</div>
                                            <div className="text-xs text-gray-600 truncate">{uni.nombre}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // TARJETA DE UNIDAD SELECCIONADA
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative animate-fade-in">
                            <button 
                                onClick={() => setUnidadSeleccionada(null)}
                                className="absolute top-2 right-2 text-green-700 hover:text-red-600 transition-colors bg-white rounded-full p-1 shadow-sm"
                                title="Cambiar Unidad"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="text-[10px] font-bold text-green-800 bg-green-200 px-2 py-0.5 rounded w-fit mb-2">
                                SELECCIONADA
                            </div>
                            <div className="font-bold text-gray-800 text-sm mb-1">{unidadSeleccionada.clues}</div>
                            <div className="text-sm text-gray-700 leading-tight">{unidadSeleccionada.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">{unidadSeleccionada.municipio}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- COLUMNA DERECHA: SELECCIÓN DE MÓDULOS (8 columnas) --- */}
            <div className="lg:col-span-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            📋 2. Módulos a Inspeccionar
                        </h2>
                        {Object.keys(seleccionados).filter(k => seleccionados[k]).length > 0 && (
                             <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                {Object.keys(seleccionados).filter(k => seleccionados[k]).length} Seleccionados
                             </span>
                        )}
                    </div>

                    {loadingModulos ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modulos.map((modulo) => (
                                <label 
                                    key={modulo.id} 
                                    className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-all group
                                        ${seleccionados[modulo.id] 
                                            ? 'border-green-600 bg-green-50 ring-1 ring-green-600 shadow-sm' 
                                            : 'border-gray-200 hover:border-green-400 hover:bg-gray-50 hover:shadow-sm'}`}
                                >
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" // Ocultamos el checkbox nativo
                                        checked={!!seleccionados[modulo.id]}
                                        onChange={() => toggleModulo(modulo.id)}
                                    />
                                    
                                    {/* Icono Check Personalizado */}
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-colors
                                        ${seleccionados[modulo.id]
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : 'bg-white border-gray-300 text-transparent group-hover:border-green-400'
                                        }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div>
                                        <span className={`font-bold block transition-colors ${seleccionados[modulo.id] ? 'text-green-900' : 'text-gray-700'}`}>
                                            {modulo.nombre}
                                        </span>
                                        <span className="text-xs text-gray-500">Módulo de evaluación</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {modulos.length === 0 && !loadingModulos && (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                            No hay módulos cargados en el sistema.
                            <br/>
                            <span className="text-xs">Ve a Configuración  Cédulas para subir uno.</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </main>

      {/* --- BARRA DE ACCIÓN INFERIOR (Sticky) --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
            
            <div className="hidden md:block">
                <p className="text-xs text-gray-400 font-bold uppercase">Resumen</p>
                <div className="text-sm text-gray-700">
                    {unidadSeleccionada ? unidadSeleccionada.clues : 'Sin unidad'} 
                    <span className="mx-2 text-gray-300">|</span> 
                    {Object.keys(seleccionados).filter(k => seleccionados[k]).length} módulos
                </div>
            </div>

            <button 
                disabled={!unidadSeleccionada || Object.keys(seleccionados).filter(k => seleccionados[k]).length === 0}
                onClick={iniciarInspeccion}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all transform shadow-md
                    ${(!unidadSeleccionada || Object.keys(seleccionados).filter(k => seleccionados[k]).length === 0)
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-green-700 hover:bg-green-800 hover:scale-105 active:scale-95'}`}
            >
                <span>Comenzar Inspección</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>

    </div>
  );
};

export default NuevaInspeccion;