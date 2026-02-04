import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderOficial from '../components/HeaderOficial';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const CuestionarioInspeccion = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unidad, modulosIds, inspector } = location.state || {};

    const [cuestionario, setCuestionario] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    // 1. VALIDACIÓN DE SEGURIDAD Y RECUPERACIÓN OFFLINE
    useEffect(() => {
        if (!unidad || !modulosIds || !inspector) {
            navigate('/inspeccion/nueva');
            return;
        }

        const guardado = localStorage.getItem(`temp_inspeccion_${unidad.clues}`);
        if (guardado) {
            setRespuestas(JSON.parse(guardado));
        }
    }, [unidad, modulosIds, inspector, navigate]);

    // 2. CARGAR PREGUNTAS
    useEffect(() => {
        const fetchPreguntas = async () => {
            if (!modulosIds) return;
            try {
                const response = await fetch('https://torre-control-production.up.railway.app/api/cedulas/preguntas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: modulosIds })
                });

                if (response.ok) {
                    const data = await response.json();
                    agruparPreguntas(data);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPreguntas();
    }, [modulosIds]);

    const agruparPreguntas = (data) => {
        const estructura = {};
        data.forEach(row => {
            if (!estructura[row.modulo_nombre]) estructura[row.modulo_nombre] = {};
            if (!estructura[row.modulo_nombre][row.seccion_nombre]) {
                estructura[row.modulo_nombre][row.seccion_nombre] = [];
            }
            estructura[row.modulo_nombre][row.seccion_nombre].push({
                id: row.pregunta_id,
                texto: row.texto_pregunta,
                tipo: row.tipo_respuesta
            });
        });
        setCuestionario(estructura);
    };

    const totalPreguntasTotales = useMemo(() => {
        let cuenta = 0;
        Object.values(cuestionario).forEach(secciones => {
            Object.values(secciones).forEach(pregs => {
                cuenta += pregs.length;
            });
        });
        return cuenta;
    }, [cuestionario]);

    // 4. MANEJAR RESPUESTAS + AUTO-GUARDADO
    const handleRespuesta = (preguntaId, valor) => {
        const nuevasRespuestas = { ...respuestas, [preguntaId]: valor };
        setRespuestas(nuevasRespuestas);
        localStorage.setItem(`temp_inspeccion_${unidad.clues}`, JSON.stringify(nuevasRespuestas));
    };

    // 5. FINALIZAR VISITA
    const finalizarVisita = async () => {
        const contestadas = Object.keys(respuestas).length;

        if (contestadas < totalPreguntasTotales) {
            MySwal.fire({
                title: <p className="text-gray-800 font-bold">Cuestionario Incompleto</p>,
                html: (
                    <div className="text-sm text-gray-600">
                        Has respondido <span className="font-bold text-blue-600">{contestadas}</span> de <span className="font-bold text-blue-600">{totalPreguntasTotales}</span> preguntas.
                        <br />Por favor, contesta todo antes de finalizar.
                    </div>
                ),
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#15803d',
                customClass: { popup: 'rounded-2xl shadow-xl' }
            });
            return;
        }

        const payload = { unidad, inspector, respuestas, fecha: new Date().toISOString() };

        if (!navigator.onLine) {
            const pendientes = JSON.parse(localStorage.getItem('inspecciones_pendientes') || '[]');
            pendientes.push(payload);
            localStorage.setItem('inspecciones_pendientes', JSON.stringify(pendientes));

            MySwal.fire({
                title: '¡Guardado Localmente!',
                text: 'Sin conexión. La inspección se enviará automáticamente al recuperar la señal.',
                icon: 'info',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#15803d',
                customClass: { popup: 'rounded-2xl' }
            }).then(() => {
                localStorage.removeItem(`temp_inspeccion_${unidad.clues}`);
                navigate('/informativas');
            });
            return;
        }

        setEnviando(true);
        try {
            const res = await fetch('https://torre-control-production.up.railway.app/api/cedulas/finalizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const dataJson = await res.json();
                MySwal.fire({
                    title: '¡Inspección Finalizada!',
                    text: '¿Deseas descargar el reporte en PDF institucional?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, descargar PDF',
                    cancelButtonText: 'Ir al inicio',
                    confirmButtonColor: '#15803d',
                    cancelButtonColor: '#6b7280',
                    customClass: { popup: 'rounded-2xl shadow-2xl' }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.open(`https://torre-control-production.up.railway.app/api/cedulas/reporte/${dataJson.id}`, '_blank');
                    }
                    localStorage.removeItem(`temp_inspeccion_${unidad.clues}`);
                    navigate('/informativas');
                });
            } else {
                throw new Error("Error en el servidor");
            }
        } catch (error) {
            MySwal.fire({
                title: 'Error de Red',
                text: 'No pudimos conectar con el servidor. Se guardará localmente.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            }).then(() => {
                const pendientes = JSON.parse(localStorage.getItem('inspecciones_pendientes') || '[]');
                pendientes.push(payload);
                localStorage.setItem('inspecciones_pendientes', JSON.stringify(pendientes));
                navigate('/informativas');
            });
        } finally {
            setEnviando(false);
        }
    };

    // 6. RENDERIZADO DE INPUTS (Incluye Recursos Humanos)
    const renderInput = (pregunta, moduloNombre) => {
        const valorActual = respuestas[pregunta.id];

        // --- CASO ESPECIAL: RECURSOS HUMANOS ---
        if (moduloNombre === 'Recursos Humanos') {
            const valHr = valorActual || { total: '', capacitados: '' };
            return (
                <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Total:</label>
                        <input
                            type="number"
                            value={valHr.total || ''}
                            onChange={(e) => handleRespuesta(pregunta.id, { ...valHr, total: e.target.value })}
                            className="w-20 p-2 border border-gray-300 rounded-md text-center font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Capacitados:</label>
                        <input
                            type="number"
                            value={valHr.capacitados || ''}
                            onChange={(e) => handleRespuesta(pregunta.id, { ...valHr, capacitados: e.target.value })}
                            className="w-20 p-2 border border-gray-300 rounded-md text-center font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                </div>
            );
        }

        // --- CASOS ESTÁNDAR ---
        switch (pregunta.tipo) {

            case 'cumple':
            return (
                <div className="flex flex-wrap gap-2 w-full">
                    {/* OPCIÓN: CUMPLE (VERDE) */}
                    <button
                        onClick={() => handleRespuesta(pregunta.id, 'Cumple')}
                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm border flex flex-col items-center justify-center gap-1
                            ${valorActual === 'Cumple' 
                                ? 'bg-green-600 text-white border-green-700 ring-2 ring-green-300 transform scale-95' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50'}`}
                    >
                        <span className="text-lg">✅</span>
                        <span>CUMPLE</span>
                    </button>

                    {/* OPCIÓN: EN PROCESO (AMARILLO) */}
                    <button
                        onClick={() => handleRespuesta(pregunta.id, 'En Proceso')}
                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm border flex flex-col items-center justify-center gap-1
                            ${valorActual === 'En Proceso' 
                                ? 'bg-yellow-500 text-white border-yellow-600 ring-2 ring-yellow-300 transform scale-95' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-yellow-50'}`}
                    >
                        <span className="text-lg">⚠️</span>
                        <span>PARCIAL</span>
                    </button>

                    {/* OPCIÓN: NO CUMPLE (ROJO) */}
                    <button
                        onClick={() => handleRespuesta(pregunta.id, 'No Cumple')}
                        className={`flex-1 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm border flex flex-col items-center justify-center gap-1
                            ${valorActual === 'No Cumple' 
                                ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-300 transform scale-95' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50'}`}
                    >
                        <span className="text-lg">❌</span>
                        <span>NO</span>
                    </button>

                    {/* OPCIÓN: NO APLICA (GRIS) */}
                    <button
                        onClick={() => handleRespuesta(pregunta.id, 'No Aplica')}
                        className={`py-3 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm border flex flex-col items-center justify-center gap-1
                            ${valorActual === 'No Aplica' 
                                ? 'bg-gray-500 text-white border-gray-600 ring-2 ring-gray-300 transform scale-95' 
                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                    >
                        <span className="text-lg">⚪</span>
                        <span>N/A</span>
                    </button>
                </div>
            );
                
            case 'TRICOLOR':
                return (
                    <div className="flex gap-2">
                        {[
                            { lab: 'C', val: 'Cumple', color: 'bg-green-600 border-green-700' },
                            { lab: 'P', val: 'En Proceso', color: 'bg-yellow-500 border-yellow-600' },
                            { lab: 'N', val: 'No Cumple', color: 'bg-red-600 border-red-700' }
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => handleRespuesta(pregunta.id, opt.val)}
                                className={`w-10 h-10 rounded-full border-2 font-bold transition-all flex items-center justify-center
                                    ${valorActual === opt.val ? `${opt.color} text-white shadow-inner scale-90` : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                            >
                                {opt.lab}
                            </button>
                        ))}
                    </div>
                );
            case 'SI_NO_NA':
                return (
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                        {['SÍ', 'NO', 'N/A'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleRespuesta(pregunta.id, opt)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all
                                    ${valorActual === opt ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );
            case 'NUMERICO':
                return (
                    <input
                        type="number"
                        value={valorActual || ''}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="w-24 p-2 border border-gray-300 rounded-lg text-right font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={valorActual || ''}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Escribe aquí..."
                    />
                );
        }
    };

    if (!unidad) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32">
            <HeaderOficial />

            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 max-w-6xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inspección en curso</p>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{unidad.nombre}</h2>
                        <p className="text-xs text-gray-500 font-mono">{unidad.clues} | {inspector.nombre} ({inspector.cargo})</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm("¿Estás seguro? Se perderá el progreso.")) {
                                localStorage.removeItem(`temp_inspeccion_${unidad.clues}`);
                                navigate(-1);
                            }
                        }}
                        className="text-xs font-bold text-red-600 border border-red-200 px-4 py-2 rounded-lg"
                    >
                        ABANDONAR
                    </button>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {loading ? (
                    <div className="flex flex-col items-center py-20 text-gray-400">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold">Generando cédula digital...</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.keys(cuestionario).map((moduloNombre) => (
                            <section key={moduloNombre} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-800 px-6 py-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">📋 {moduloNombre}</h3>
                                </div>
                                <div className="p-6 space-y-10">
                                    {Object.keys(cuestionario[moduloNombre]).map((seccionNombre) => (
                                        <div key={seccionNombre}>
                                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>{seccionNombre}
                                            </h4>
                                            <div className="divide-y divide-gray-100">
                                                {cuestionario[moduloNombre][seccionNombre].map((pregunta) => (
                                                    <div key={pregunta.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                                        <p className="text-gray-700 text-sm font-medium leading-relaxed max-w-xl group-hover:text-black transition-colors">
                                                            {pregunta.texto}
                                                        </p>
                                                        <div className="flex-shrink-0">
                                                            {renderInput(pregunta, moduloNombre)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-2xl z-30">
                <div className="container mx-auto max-w-4xl flex justify-between items-center">
                    <div className="text-sm">
                        <span className="text-gray-400 font-bold uppercase text-[10px] block leading-none">Progreso</span>
                        <span className={`font-bold ${Object.keys(respuestas).length === totalPreguntasTotales ? 'text-green-600' : 'text-blue-700'}`}>
                            {Object.keys(respuestas).length} de {totalPreguntasTotales} respondidas
                        </span>
                    </div>
                    <button
                        disabled={enviando}
                        onClick={finalizarVisita}
                        className={`${enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 active:scale-95'} text-white px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg`}
                    >
                        {enviando ? 'Enviando...' : 'Finalizar Visita'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuestionarioInspeccion;
