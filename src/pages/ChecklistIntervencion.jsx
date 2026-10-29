import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderOficial from '../components/HeaderOficial';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- DATOS DEL CHECKLIST EXTRAÍDOS DEL DOCUMENTO OFICIAL ---
const CHECKLIST_DATA = [
    {
        id: 1,
        titulo: "Dirección y conducción institucional",
        items: [
            { id: "1_1", texto: "Reunión inicial con director, subdirectores y responsables administrativos." },
            { id: "1_2", texto: "Revisar productividad, ocupación hospitalaria y principales rezagos." },
            { id: "1_3", texto: "Definir responsables y compromisos de solución en 72 horas." },
            { id: "1_4", texto: "Identificar los cinco problemas más urgentes del hospital." },
            { id: "1_5", texto: "Identificar conflictos laborales, administrativos y operativos." },
            { id: "1_6", texto: "Transmitir que el objetivo es facilitar el trabajo del personal y mejorar la atención." }
        ]
    },
    {
        id: 2,
        titulo: "Recorrido y diálogo con cada jefe de servicio",
        items: [
            { id: "2_1", texto: "Urgencias." },
            { id: "2_2", texto: "Hospitalización." },
            { id: "2_3", texto: "Medicina interna." },
            { id: "2_4", texto: "Consulta externa y especialidades." },
            { id: "2_5", texto: "Cirugía general." },
            { id: "2_6", texto: "Imagenología." },
            { id: "2_7", texto: "Ginecología y obstetricia." },
            { id: "2_8", texto: "Laboratorio." },
            { id: "2_9", texto: "Pediatría." },
            { id: "2_10", texto: "Farmacia." },
            { id: "2_11", texto: "Anestesiología." },
            { id: "2_12", texto: "Enfermería." },
            { id: "2_13", texto: "Terapia intensiva." },
            { id: "2_14", texto: "Trabajo social." },
            { id: "2_15", texto: "Quirófanos." },
            { id: "2_16", texto: "Servicios generales y mantenimiento." },
            { id: "2_17", texto: "¿Qué le impide atender mejor a sus pacientes?", tipo: "texto" },
            { id: "2_18", texto: "¿Qué medicamentos, insumos, equipo o personal le hacen falta?", tipo: "texto" },
            { id: "2_19", texto: "¿Qué pacientes o procedimientos están retrasados?", tipo: "texto" },
            { id: "2_20", texto: "¿Qué podemos resolver hoy mismo?", tipo: "texto" },
            { id: "2_21", texto: "¿Qué necesita de la dirección general para trabajar mejor?", tipo: "texto" }
        ]
    },
    {
        id: 3,
        titulo: "Abasto de medicamentos e insumos",
        items: [
            { id: "3_1", texto: "Verificar físicamente farmacia y almacenes." },
            { id: "3_2", texto: "Revisar disponibilidad de medicamentos críticos en urgencias, quirófanos y hospitalización." },
            { id: "3_3", texto: "Revisar disponibilidad de medicamentos oncológicos, cuando corresponda." },
            { id: "3_4", texto: "Activar redistribuciones, transferencias y entregas extraordinarias." },
            { id: "3_5", texto: "Informar directamente a los jefes de servicio las soluciones." },
            { id: "3_6", texto: "Identificar medicamentos esenciales faltantes." },
            { id: "3_7", texto: "Verificar insumos de curación, suturas, anestésicos y material quirúrgico." },
            { id: "3_8", texto: "Identificar insumos existentes que no estén llegando a los servicios." },
            { id: "3_9", texto: "Resolver discrepancias entre inventarios físicos y digitales." }
        ]
    },
    {
        id: 4,
        titulo: "Urgencias: flujo y capacidad resolutiva",
        items: [
            { id: "4_1", texto: "Revisar personalmente el servicio en horario de alta demanda." },
            { id: "4_2", texto: "Verificar tiempos de clasificación, valoración y tratamiento." },
            { id: "4_3", texto: "Identificar pacientes con estancia prolongada." },
            { id: "4_4", texto: "Revisar disponibilidad de camas y tiempos de traslado a hospitalización." },
            { id: "4_5", texto: "Revisar disponibilidad de especialistas e interconsultas." },
            { id: "4_6", texto: "Resolver problemas de camillería, limpieza y disponibilidad de espacios." },
            { id: "4_7", texto: "Identificar estudios de laboratorio o imagen que retrasan decisiones." },
            { id: "4_8", texto: "Destrabar traslados y referencias pendientes." },
            { id: "4_9", texto: "Garantizar funcionamiento del área de choque y equipo crítico." },
            { id: "4_10", texto: "Establecer mecanismo de gestión diaria de camas." }
        ]
    },
    {
        id: 5,
        titulo: "Programación quirúrgica",
        items: [
            { id: "5_1", texto: "Revisar programación de los siguientes siete días." },
            { id: "5_2", texto: "Identificar cirugías suspendidas y causas." },
            { id: "5_3", texto: "Verificar disponibilidad de anestesiólogos, cirujanos y enfermería quirúrgica." },
            { id: "5_4", texto: "Confirmar funcionamiento de quirófanos y equipos de anestesia." },
            { id: "5_5", texto: "Identificar pacientes hospitalizados esperando cirugía." },
            { id: "5_6", texto: "Revisar instrumental, material de osteosíntesis e insumos críticos." },
            { id: "5_7", texto: "Revisar esterilización y CEYE." },
            { id: "5_8", texto: "Recuperar procedimientos pendientes cuando sea clínicamente posible." },
            { id: "5_9", texto: "Establecer programación quirúrgica verificable para la siguiente semana." },
            { id: "5_10", texto: "Resolver causas administrativas de suspensión." }
        ]
    },
    {
        id: 6,
        titulo: "Hospitalización y continuidad de la atención",
        items: [
            { id: "6_1", texto: "Revisar ocupación y disponibilidad real de camas." },
            { id: "6_2", texto: "Revisar interconsultas pendientes." },
            { id: "6_3", texto: "Agilizar altas médicas seguras." },
            { id: "6_4", texto: "Revisar referencias a unidades de mayor capacidad resolutiva." },
            { id: "6_5", texto: "Identificar pacientes con estancias prolongadas por causas no clínicas." },
            { id: "6_6", texto: "Destrabar estudios diagnósticos y procedimientos." },
            { id: "6_7", texto: "Garantizar medicamentos durante la hospitalización." },
            { id: "6_8", texto: "Identificar pacientes y familiares con inconformidades pendientes." }
        ]
    },
    {
        id: 7,
        titulo: "Personal y cobertura operativa",
        items: [
            { id: "7_1", texto: "Escuchar directamente al personal médico y de enfermería." },
            { id: "7_2", texto: "Revisar cobertura de guardias y turnos." },
            { id: "7_3", texto: "Resolver necesidades operativas que afectan al personal." },
            { id: "7_4", texto: "Establecer comunicación directa entre los servicios y la dirección." },
            { id: "7_5", texto: "Identificar servicios con déficit crítico de personal." },
            { id: "7_6", texto: "Identificar problemas de pagos, contratos e incidencias laborales." },
            { id: "7_7", texto: "Reconocer públicamente el trabajo de los equipos." }
        ]
    },
    {
        id: 8,
        titulo: "Mística e identidad IMSS-Bienestar",
        items: [
            { id: "8_1", texto: "Reunir a los jefes de servicio y principales liderazgos clínicos." },
            { id: "8_2", texto: "Reforzar que los pacientes son nuestra responsabilidad." },
            { id: "8_3", texto: "Escuchar preocupaciones y reconocer esfuerzos del personal." },
            { id: "8_4", texto: "Reforzar trato digno, humanismo y vocación de servicio." },
            { id: "8_5", texto: "Explicar el sentido del IMSS-Bienestar: atención universal, pública, gratuita y de calidad." },
            { id: "8_6", texto: "Recuperar el orgullo de trabajar en el servicio público." },
            { id: "8_7", texto: "Explicar los cambios operativos y las prioridades institucionales." },
            { id: "8_8", texto: "Acordar compromisos concretos de mejora con los equipos." }
        ]
    },
    {
        id: 9,
        titulo: "Infraestructura, equipamiento y servicios generales",
        items: [
            { id: "9_1", texto: "Verificar agua, electricidad, oxígeno y gases medicinales." },
            { id: "9_2", texto: "Identificar problemas de infraestructura que comprometan la seguridad." },
            { id: "9_3", texto: "Revisar limpieza, sanitarios y condiciones de hospitalización." },
            { id: "9_4", texto: "Verificar lavandería, alimentación y manejo de residuos." },
            { id: "9_5", texto: "Identificar equipos médicos fuera de servicio." },
            { id: "9_6", texto: "Revisar elevadores, climatización y sistemas críticos." },
            { id: "9_7", texto: "Resolver fallas menores de mantenimiento." },
            { id: "9_8", texto: "Escalar de inmediato reparaciones mayores." }
        ]
    },
    {
        id: 10,
        titulo: "Atención al paciente y resolución de inconformidades",
        items: [
            { id: "10_1", texto: "Recorrer salas de espera y hospitalización." },
            { id: "10_2", texto: "Identificar quejas por medicamentos, tiempos de espera o diferimiento de atención." },
            { id: "10_3", texto: "Verificar que no existan cobros indebidos." },
            { id: "10_4", texto: "Establecer responsables para dar seguimiento a los casos no resueltos." },
            { id: "10_5", texto: "Conversar directamente con pacientes y familiares." },
            { id: "10_6", texto: "Resolver casos prioritarios." },
            { id: "10_7", texto: "Garantizar información clara a familiares." }
        ]
    }
];

const ChecklistIntervencion = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Variables temporales en caso de no venir del router
    const { unidad = { clues: "TEST0000001", nombre: "Hospital de Prueba" }, inspector = { nombre: "Inspector Técnico" } } = location.state || {};

    const [respuestas, setRespuestas] = useState({});
    const [enviando, setEnviando] = useState(false);

    // 1. CARGAR RESPUESTAS GUARDADAS (OFFLINE)
    useEffect(() => {
        const guardado = localStorage.getItem(`temp_intervencion_${unidad.clues}`);
        if (guardado) {
            setRespuestas(JSON.parse(guardado));
        }
    }, [unidad.clues]);

    // 2. CÁLCULO DE PROGRESO
    const totalItems = useMemo(() => {
        return CHECKLIST_DATA.reduce((acc, seccion) => acc + seccion.items.length, 0);
    }, []);

    const contestadas = Object.keys(respuestas).filter(key => {
        const val = respuestas[key];
        if (typeof val === 'boolean') return val; // Para los checkboxes
        if (typeof val === 'string') return val.trim().length > 0; // Para cajas de texto
        return false;
    }).length;

    const porcentaje = Math.round((contestadas / totalItems) * 100);

    // 3. MANEJAR CHECKBOX + AUTO-GUARDADO
    const toggleRespuesta = (itemId) => {
        setRespuestas(prev => {
            const nuevasRespuestas = { ...prev };
            if (nuevasRespuestas[itemId]) {
                delete nuevasRespuestas[itemId]; // Desmarcar
            } else {
                nuevasRespuestas[itemId] = true; // Marcar
            }
            localStorage.setItem(`temp_intervencion_${unidad.clues}`, JSON.stringify(nuevasRespuestas));
            return nuevasRespuestas;
        });
    };

    const handleTextoRespuesta = (itemId, valor) => {
        setRespuestas(prev => {
            const nuevasRespuestas = { ...prev };
            if (valor.trim() === '') {
                delete nuevasRespuestas[itemId]; // Resta del progreso si lo borra
            } else {
                nuevasRespuestas[itemId] = valor;
            }
            localStorage.setItem(`temp_intervencion_${unidad.clues}`, JSON.stringify(nuevasRespuestas));
            return nuevasRespuestas;
        });
    };

    // 4. FINALIZAR INTERVENCIÓN
    const finalizarIntervencion = async () => {
        if (contestadas < totalItems) {
            MySwal.fire({
                title: <p className="text-gray-800 font-bold">Checklist Incompleto</p>,
                html: (
                    <div className="text-sm text-gray-600">
                        Has verificado <span className="font-bold text-[#10312B]">{contestadas}</span> de <span className="font-bold text-[#10312B]">{totalItems}</span> puntos críticos.
                        <br />Se recomienda completar todas las acciones antes de retirarse.
                    </div>
                ),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Enviar de todos modos',
                cancelButtonText: 'Continuar revisando',
                confirmButtonColor: '#691C32',
                cancelButtonColor: '#10312B',
                customClass: { popup: 'rounded-2xl shadow-xl' }
            }).then((result) => {
                if (result.isConfirmed) enviarDatos();
            });
        } else {
            enviarDatos();
        }
    };

    const enviarDatos = async () => {
        const payload = { unidad, inspector, respuestas, fecha: new Date().toISOString(), completado: porcentaje };

        // Simulamos guardado Offline si no hay internet
        if (!navigator.onLine) {
            const pendientes = JSON.parse(localStorage.getItem('intervenciones_pendientes') || '[]');
            pendientes.push(payload);
            localStorage.setItem('intervenciones_pendientes', JSON.stringify(pendientes));

            MySwal.fire({
                title: '¡Guardado Localmente!',
                text: 'Sin conexión. El checklist se enviará automáticamente al recuperar la señal.',
                icon: 'info',
                confirmButtonColor: '#10312B',
                customClass: { popup: 'rounded-2xl' }
            }).then(() => {
                localStorage.removeItem(`temp_intervencion_${unidad.clues}`);
                navigate('/');
            });
            return;
        }

        setEnviando(true);
        try {
            // ENDPOINT DEL BACKEND DE SIBE
            const res = await fetch('https://torre-control-production.up.railway.app/api/intervencion/finalizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                MySwal.fire({
                    title: '¡Intervención Finalizada!',
                    text: 'Los datos operativos han sido registrados en SIBE exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Finalizar',
                    confirmButtonColor: '#10312B',
                    customClass: { popup: 'rounded-2xl shadow-2xl' }
                }).then(() => {
                    localStorage.removeItem(`temp_intervencion_${unidad.clues}`);
                    navigate('/');
                });
            } else {
                throw new Error("Error en el servidor");
            }
        } catch (error) {
            MySwal.fire({
                title: 'Error de Red',
                text: 'No pudimos conectar con el servidor. Se ha guardado una copia local.',
                icon: 'error',
                confirmButtonColor: '#691C32'
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32">
            <HeaderOficial />

            {/* BARRA SUPERIOR STICKY CON EL PROGRESO */}
            <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-[90px] md:top-[140px] z-40 w-full transition-all">
                <div className="container mx-auto px-4 py-4 max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <span className="text-[10px] text-[#691C32] font-black uppercase tracking-widest bg-[#691C32]/10 px-2 py-1 rounded">
                            Operativo 72 Horas
                        </span>
                        <h2 className="text-xl font-black text-gray-800 leading-tight mt-1">{unidad.nombre}</h2>
                        <p className="text-xs text-gray-500 font-medium">Clave: {unidad.clues} | Responsable: {inspector.nombre}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-56">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-1.5">
                                <span className="text-gray-400">Progreso Operativo</span>
                                <span className="text-[#10312B]">{porcentaje}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner border border-gray-200 overflow-hidden relative">
                                {/* Efecto de gradiente y animación suave */}
                                <div 
                                    className="bg-gradient-to-r from-[#10312B] to-[#1e5c50] h-full rounded-full transition-all duration-700 ease-out relative" 
                                    style={{ width: `${porcentaje}%` }}
                                >
                                    {/* Brillo tecnológico en la barra */}
                                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-[2px] -skew-x-12"></div>
                                </div>
                            </div>
                        </div>
                        <button
                            disabled={enviando}
                            onClick={finalizarIntervencion}
                            className={`${enviando ? 'bg-gray-400' : 'bg-[#691C32] hover:bg-[#521526]'} text-white text-sm px-6 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95 whitespace-nowrap`}
                        >
                            {enviando ? 'Enviando...' : 'Finalizar'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-gray-800">Checklist de Intervención Hospitalaria</h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-2xl mx-auto">
                        Selecciona cada acción conforme se vaya verificando o resolviendo en la unidad médica.
                    </p>
                </div>

                <div className="space-y-6">
                    {CHECKLIST_DATA.map((seccion) => (
                        <section key={seccion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* ENCABEZADO DE SECCIÓN */}
                            <div className="bg-[#10312B] px-5 py-4 flex items-center gap-3">
                                <div className="bg-[#BC955C] text-white font-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                                    {seccion.id}
                                </div>
                                <h3 className="text-white font-bold text-lg">{seccion.titulo}</h3>
                            </div>

                            {/* LISTA DE ITEMS */}
                            <div className="flex flex-wrap w-full bg-gray-50/30">
                                {seccion.items.map((item) => {
                                    
                                    // RENDERIZADO SI ES CAJA DE TEXTO
                                    if (item.tipo === 'texto') {
                                        return (
                                            <div key={item.id} className="w-full p-5 md:p-7 bg-transparent border-b border-gray-200 group transition-all duration-300 hover:bg-white">
                                                <label className="block text-sm md:text-base font-bold text-gray-800 mb-3 flex items-center gap-3">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#691C32]/10 text-[#691C32] shadow-sm">💬</span>
                                                    {item.texto}
                                                </label>
                                                <textarea
                                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BC955C] focus:border-[#BC955C] outline-none text-sm text-gray-700 bg-white shadow-sm resize-none transition-all duration-300"
                                                    rows="2"
                                                    placeholder="Escribe la respuesta o comentarios aquí..."
                                                    value={respuestas[item.id] || ''}
                                                    onChange={(e) => handleTextoRespuesta(item.id, e.target.value)}
                                                />
                                            </div>
                                        );
                                    }

                                    // RENDERIZADO SI ES CHECKBOX
                                    const isChecked = !!respuestas[item.id];
                                    const gridClass = seccion.id === 2 
                                        ? "w-full md:w-1/2 border-b border-gray-200 md:border-r" 
                                        : "w-full border-b border-gray-200";

                                    return (
                                        <label 
                                            key={item.id} 
                                            className={`${gridClass} flex items-start gap-4 p-5 md:p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden
                                                ${isChecked 
                                                    ? 'bg-[#10312B]/5' 
                                                    : 'bg-white hover:bg-gray-50 hover:shadow-sm'}`}
                                        >
                                            {/* Línea indicadora tecnológica a la izquierda cuando está activo */}
                                            {isChecked && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10312B] shadow-[0_0_8px_#10312B]"></div>}

                                            <div className="pt-0.5 relative z-10">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shadow-sm
                                                    ${isChecked 
                                                        ? 'bg-[#10312B] border-[#10312B] scale-110' 
                                                        : 'bg-white border-gray-300 group-hover:border-[#BC955C]'}`}
                                                >
                                                    {isChecked && (
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isChecked}
                                                    onChange={() => toggleRespuesta(item.id)}
                                                />
                                            </div>
                                            <span className={`text-sm md:text-base font-semibold transition-all duration-300 relative z-10
                                                ${isChecked ? 'text-[#10312B]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                {item.texto}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ChecklistIntervencion;
