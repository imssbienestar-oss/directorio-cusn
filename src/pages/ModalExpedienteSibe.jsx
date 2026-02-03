import React, { useState, useEffect, useRef } from 'react';

// ==========================================================
// 1. DICCIONARIO DINÁMICO TOTAL (INCLUYE LAS 47 DE INFRA)
// ==========================================================
const CONFIG_EXPEDIENTE = {
    GENERAL: [
        {
            id: 'info_gral',
            titulo: 'Información General',
            variables: [
                { label: 'Nivel de atención', key: 'nivel' },
                { label: 'Tipología', key: 'tipologia' },
                { label: 'Subtipología', key: 'subtipologia' },
                { label: 'Establecimiento', key: 'tipo_establecimiento' },
                { label: 'Estrato', key: 'estrato' },
                { label: 'Estatus Operación', key: 'estatus_operacion' },
                { label: 'Región', key: 'region' },
                { label: 'Entidad', key: 'entidad' },
                { label: 'Municipio', key: 'municipio' },
                { label: 'Localidad', key: 'localidad' },
                { label: 'Código Postal', key: 'cp' },
                { label: 'Domicilio', key: 'direccion', fullWidth: true },
            ]
        },
        {
            id: 'geometria',
            titulo: 'Geolocalización y Fechas',
            variables: [
                { label: 'Latitud', key: 'latitud' },
                { label: 'Longitud', key: 'longitud' },
                { label: 'Fecha Construcción', key: 'fecha_construccion' },
                { label: 'Inicio Operación', key: 'fecha_inicio_operacion' },
                { label: 'Propiedad Inmueble', key: 'propiedad_inmueble' }
            ]
        }
    ],
    INFRAESTRUCTURA: [
        {
            id: 'suministros_basicos',
            titulo: 'Suministros Básicos (Agua, Energía, Gas)',
            tipo: 'status',
            variables: [
                { label: 'Agua Potable', key: 'srv_agua_potable' },
                { label: 'Red Municipal Agua', key: 'srv_agua_red' },
                { label: 'Pozo de Agua', key: 'srv_pozo_agua' },
                { label: 'Cisterna', key: 'srv_cisterna' },
                { label: 'Otra Fuente Agua', key: 'srv_otra_fuente_agua' },
                { label: 'Energía Eléctrica', key: 'srv_energia_electrica' },
                { label: 'Instalación Eléctrica', key: 'srv_instalacion_energia_electrica' },
                { label: 'Paneles Solares', key: 'srv_paneles_solares' },
                { label: 'Tierra Física', key: 'srv_tierra_fisica' },
                { label: 'Pararrayos', key: 'srv_pararayos' },
                { label: 'Sistema Drenaje', key: 'srv_drenaje' },
                { label: 'Fosa Séptica', key: 'srv_fosa_septica' },
                { label: 'Servicio de Gas', key: 'srv_gas' },
                { label: 'Radio Banda Civil', key: 'srv_radio_banda' }
            ]
        },
        {
            id: 'servicios_sanitarios',
            titulo: 'Servicios Sanitarios (Baños)',
            variables: [
                { label: 'Baños Públicos', key: 'srv_baño_publico' },
                { label: 'Baños Personal', key: 'srv_baño_personal' },
                { label: 'Baños Pacientes', key: 'srv_baño_paciente' },
                { label: 'Baños Discapacitados', key: 'srv_baño_discapacitados' }
            ]
        },
        {
            id: 'telesalud_expediente',
            titulo: 'Telesalud y Expediente Electrónico',
            variables: [
                { label: 'Área Telesalud', key: 'srv_area_telesalud', tipo: 'status' },
                { label: 'Estación Telemedicina', key: 'srv_estacion_telemedicina', tipo: 'status' },
                { label: 'Ancho Banda Telesalud', key: 'srv_ancho_banda_telesalud' },
                { label: 'Equipo Videoconf.', key: 'srv_equipo_videoconferencia', tipo: 'status' },
                { label: 'Cómputo Telesalud', key: 'srv_equipo_computo_telesalud', tipo: 'status' },
                { label: 'Software Telemedicina', key: 'srv_software_telemedicina', tipo: 'status' },
                { label: 'Expediente Electrónico', key: 'srv_expediente_electronico', tipo: 'status' },
                { label: 'Nombre Software Exp.', key: 'srv_nombre_expediente_electronico' }
            ]
        },
        {
            id: 'espacios_fisicos',
            titulo: 'Dimensiones de Infraestructura',
            variables: [
                { label: 'M2 Terreno', key: 'srv_infra_m2_terreno' },
                { label: 'M2 Construcción', key: 'srv_infra_m2_construccion' },
                { label: 'M2 Superficie Ext.', key: 'srv_infra_m2_superficie_exterior' },
                { label: 'M2 Jardines', key: 'srv_infra_m2_superficie_jardinada' },
                { label: 'Número Edificios', key: 'srv_infra_num_edificios' },
                { label: 'Número Niveles', key: 'srv_infra_num_niveles' }
            ]
        },
        {
            id: 'tecnologia_it',
            titulo: 'Equipamiento Tecnológico e Internet',
            variables: [
                { label: 'Computadoras Totales', key: 'srv_computadoras' },
                { label: 'Comp. Consultorios', key: 'srv_computadora_consultorios' },
                { label: 'Comp. Dirección', key: 'srv_computadora_direccion' },
                { label: 'Comp. Farmacia', key: 'srv_computadora_farmacia' },
                { label: 'Comp. Estadística', key: 'srv_computadora_estadistica' },
                { label: 'Comp. Informática', key: 'srv_computadora_informatica' },
                { label: 'Tipo Conexión Internet', key: 'srv_internet_tipo' },
                { label: 'Ancho de Banda Gral.', key: 'srv_internet_anchob' },
                { label: 'Usuarios Conectados', key: 'srv_internet_usuarios' },
                { label: 'Internet Pagado por', key: 'srv_internet_pagado' },
                { label: 'Internet Dirección', key: 'srv_internet_direccion', tipo: 'status' },
                { label: 'Internet Farmacia', key: 'srv_internet_farmacia', tipo: 'status' },
                { label: 'Internet Estadística', key: 'srv_internet_estadistica', tipo: 'status' },
                { label: 'Internet Informática', key: 'srv_internet_informatica', tipo: 'status' },
                { label: 'Consultorios con Internet', key: 'srv_internet_consultorios' }
            ]
        }
    ],
    'RECURSOS HUMANOS': [
        {
            id: 'medicos_especialistas',
            titulo: 'Cuerpo Médico Especializado',
            tipo: 'tabla',
            variables: [
                { label: 'Médicos Generales', key: 'rh_med_general' },
                { label: 'Pediatras', key: 'rh_med_pediatra' },
                { label: 'Ginecoobstretas', key: 'rh_med_ginecoobste' },
                { label: 'Cirujanos', key: 'rh_med_cirujano' },
                { label: 'Internistas', key: 'rh_med_internista' },
                { label: 'Otorrinolaringólogos', key: 'rh_med_otorrino' },
                { label: 'Traumatólogos', key: 'rh_med_traumatologo' },
                { label: 'Anestesiólogos', key: 'rh_med_anestesio' },
                { label: 'Psiquiátras', key: 'rh_med_psiquiatra' },
                { label: 'Endocrinólogos', key: 'rh_med_endocri' },
                { label: 'Urólogos', key: 'rh_med_utologo' },
                { label: 'Oncólogos', key: 'rh_med_oncologo' },
                { label: 'Hematólogos', key: 'rh_med_hemanotologo' },
                { label: 'Urgenciólogos', key: 'rh_med_urgenciologo' },
                { label: 'Nefrólogos', key: 'rh_med_nefrologo' },
                { label: 'Infectólogos', key: 'rh_med_infectologo' },
                { label: 'Radiólogos', key: 'rh_med_radiologo' }
            ]
        },
        {
            id: 'medicos_adiestramiento',
            titulo: 'Médicos en Adiestramiento y Otras Actividades',
            variables: [
                { label: 'Médicos Internos', key: 'rh_med_interno_pregrado' },
                { label: 'Médicos Residentes', key: 'rh_med_residentes' },
                { label: 'Médicos Administrativos', key: 'rh_med_admin' },
                { label: 'Enseñanza e Inv.', key: 'rh_med_enseñanza' },
                { label: 'Epidemiólogos', key: 'rh_med_epidemiologo' }
            ]
        },
        {
            id: 'enfermeria_seccion',
            titulo: 'Personal de Enfermería',
            variables: [
                { label: 'Enfermeras Generales', key: 'rh_enf_general' },
                { label: 'Enfermeras Especialistas', key: 'rh_enf_especialista' },
                { label: 'Enfermeras Pasantes', key: 'rh_enf_pasante' },
                { label: 'Enfermeras Auxiliares', key: 'rh_enf_auxiliar' },
                { label: 'Labores Administrativas', key: 'rh_enf_admin' },
                { label: 'Enseñanza/Investigación', key: 'rh_enf_enseñanza' }
            ]
        },
        {
            id: 'profesionales_tecnicos',
            titulo: 'Otros Profesionales y Técnicos',
            variables: [
                { label: 'Químicos', key: 'rh_otro_profesional_quimico' },
                { label: 'Biólogos', key: 'rh_otro_profesional_biologos' },
                { label: 'Farmacobiólogos', key: 'rh_otro_profesional_farmaco' },
                { label: 'Nutriólogos', key: 'rh_otro_profesional_nutriologos' },
                { label: 'Psicólogos', key: 'rh_otro_profesional_psicologos' },
                { label: 'Ing. Biomédicos', key: 'rh_otro_profesional_biomedicos' },
                { label: 'Trabajo Social', key: 'rh_otro_profesional_trabajosocial' },
                { label: 'Técnico Laboratorio', key: 'rh_tecnico_laboratorio' },
                { label: 'Técnico Estadística', key: 'rh_tecnico_estadistica' },
                { label: 'Técnico Radiología', key: 'rh_tecnico_radiologia' }
            ]
        },
        {
            id: 'personal_servicios',
            titulo: 'Personal de Servicios y Mantenimiento',
            variables: [
                { label: 'Administrativos', key: 'rh_otro_admin' },
                { label: 'Archivo Clínico', key: 'rh_otro_archivoclinico' },
                { label: 'Mantenimiento', key: 'rh_otro_cons_mant' },
                { label: 'Intendencia', key: 'rh_otro_intendencia' },
                { label: 'Otro Personal', key: 'rh_otro_personal' }
            ]
        }
    ],
    'CAPACIDAD OPERATIVA': [
        {
            id: 'sm_consulta_externa',
            titulo: 'Consulta Externa y Medicina Preventiva',
            variables: [
                { label: '¿Tiene C. Externa?', key: 'sm_ce_basica_bool', tipo: 'status' },
                { label: 'Consultorios Grales', key: 'sm_ce_med_gral' },
                { label: 'Consultorios Familiares', key: 'sm_ce_med_fam' },
                { label: '¿Servicio Preventivo?', key: 'sm_prev_bool', tipo: 'status' },
                { label: 'Salas de Espera', key: 'sm_prev_salas_espera' },
                { label: 'Capacidad Salas', key: 'sm_prev_cap_espera' },
                { label: 'Cons. Med. Preventiva', key: 'sm_prev_medicinapreventiva' },
                { label: 'Cons. Estomatología', key: 'sm_prev_estomatologia' }
            ]
        },
        {
            id: 'sm_especialidades',
            titulo: 'Consultorios de Especialidad',
            tipo: 'tabla',
            variables: [
                { label: 'Angiología', key: 'sm_cee_esp_angiologia' },
                { label: 'Cirugía General', key: 'sm_cee_esp_cirugiageneral' },
                { label: 'Endocrinología', key: 'sm_cee_esp_endocrino' },
                { label: 'Gineco-Obstetricia', key: 'sm_cee_esp_gineco' },
                { label: 'Hematología', key: 'sm_cee_esp_hematologia' },
                { label: 'Infectología', key: 'sm_cee_esp_infectologia' },
                { label: 'Medicina Interna', key: 'sm_cee_esp_med_int' },
                { label: 'Nefrología', key: 'sm_cee_esp_nefrologia' },
                { label: 'Oncología', key: 'sm_cee_esp_oncologia' },
                { label: 'Pediatría', key: 'sm_cee_esp_pediatria' },
                { label: 'Psicología', key: 'sm_cee_esp_psicologia' },
                { label: 'Psiquiatría', key: 'sm_cee_esp_psiquiatria' },
                { label: 'Urología', key: 'sm_cee_esp_urologia' },
                { label: 'Traumatología', key: 'sm_cee_esp_trauma' }
            ]
        },
        {
            id: 'sm_urgencias_seccion',
            titulo: 'Área de Urgencias y Choque',
            variables: [
                { label: '¿Tiene Urgencias?', key: 'sm_urg_area_urgencias', tipo: 'status' },
                { label: 'Camas Urgencias', key: 'sm_urg_camas_urgencias' },
                { label: 'Salas Operación Urg', key: 'sm_urg_salas_operacion' },
                { label: 'Salas de Choque', key: 'sm_urg_salas_choque' },
                { label: 'Camas Observación', key: 'sm_urg_camas_observacion' },
                { label: 'Salas Procedimientos', key: 'sm_urg_salas_proc' }
            ]
        },
        {
            id: 'sm_toco_neo_seccion',
            titulo: 'Tocología, Tococirugía y Neonatología',
            variables: [
                { label: '¿Tiene Tococirugía?', key: 'sm_toco_bool', tipo: 'status' },
                { label: 'Camas Labor Parto', key: 'sm_toco_camas_labor' },
                { label: 'Salas de Expulsión', key: 'sm_toco_salas_expulsion' },
                { label: 'Salas Operación Toco', key: 'sm_toco_salas_operacion' },
                { label: 'Camas Recup. Post-parto', key: 'sm_toco_camas_recup' },
                { label: 'Cunas Recién Nacido', key: 'sm_neo_cunas' },
                { label: '¿Banco de Leche?', key: 'sm_neo_banco_leche_bool', tipo: 'status' }
            ]
        },
        {
            id: 'sm_hospitalizacion_camas',
            titulo: 'Camas de Hospitalización (Sensables)',
            variables: [
                { label: 'Camas Aislados', key: 'sm_hosp_camas_aislados' },
                { label: 'Camas Cirugía Gral', key: 'sm_hosp_camas_cirugia' },
                { label: 'Camas Gineco-obstetricia', key: 'sm_hosp_camas_gineco' },
                { label: 'Camas Med. Interna', key: 'sm_hosp_camas_med_int' },
                { label: 'Camas Oncología', key: 'sm_hosp_camas_oncologia' },
                { label: 'Camas Pediatría', key: 'sm_hosp_camas_pediatria' }
            ]
        },
        {
            id: 'sm_criticos_qx',
            titulo: 'Unidad Quirúrgica y Cuidados Intensivos',
            variables: [
                { label: 'Salas Operación (QX)', key: 'sm_qx_salas_operacion' },
                { label: 'Camas Recup. Post-QX', key: 'sm_qx_recup_camas' },
                { label: 'UCI Adultos', key: 'sm_uci_camas_adultos' },
                { label: 'UCI Neonatales', key: 'sm_uci_camas_pediatricas' },
                { label: 'Camas Cuidados Intermedios', key: 'sm_cuidadosintermedios_camas' },
                { label: 'Camas Cuidados Coronarios', key: 'sm_cuidadoscoronarios_camas' }
            ]
        },
        {
            id: 'sm_terapias_ambulatoria',
            titulo: 'Terapias de Rehabilitación y Ambulatoria',
            variables: [
                { label: 'Inhaloterapia', key: 'sm_terap_inhaloterapia_bool', tipo: 'status' },
                { label: 'Rehabilitación Física', key: 'sm_terap_rehabilitacion_bool', tipo: 'status' },
                { label: 'Hidroterapia', key: 'sm_terap_hidroterapia_bool', tipo: 'status' },
                { label: 'Electroterapia', key: 'sm_terap_electroterapia_bool', tipo: 'status' },
                { label: 'Mecanoterapia', key: 'sm_terap_mecanoterapia_bool', tipo: 'status' },
                { label: 'Cirugía Ambulatoria', key: 'sm_c_ambulatoria_bool', tipo: 'status' },
                { label: 'Camas Recup. Ambulatoria', key: 'sm_c_ambulatoria_recup_camas' }
            ]
        }
    ]
};

const ModalExpedienteSibe = ({ unidadId, onClose }) => {
    const [activeTab, setActiveTab] = useState('GENERAL');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const target = document.getElementById(id);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // 'start' alineará respetando el scroll-margin-top que pusimos arriba
            });
        }
    };

    useEffect(() => {
        const fetchFullData = async () => {
            if (!unidadId) return;
            try {
                setLoading(true);
                const response = await fetch(`https://torre-control-production.up.railway.app/api/unidades/publico/${unidadId}`);
                if (!response.ok) throw new Error("Error en la consulta oficial.");
                const result = await response.json();
                const unidadData = Array.isArray(result) ? result[0] : result;
                setData(unidadData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFullData();
    }, [unidadId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorModal message={error} onClose={onClose} />;
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-fade-in">

                {/* HEADER */}
                <div className="relative bg-gradient-to-r from-[#1B4D3E] via-[#10312B] to-[#246350] p-6 text-white flex justify-between items-center shadow-2xl border-b-4 border-[#DDC9A3]">

                    {/* Decoración sutil de fondo (opcional para más estilo) */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                    <div className="flex items-center gap-5 relative z-10">
                        {/* Contenedor del Icono con Glow */}
                        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
                            <svg className="w-8 h-8 text-[#DDC9A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1 drop-shadow-md">
                                {data.nombre}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="bg-[#DDC9A3] text-[#1B4D3E] text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                                    EXPEDIENTE OFICIAL
                                </span>
                                <p className="text-xs text-white/70 font-bold tracking-widest">
                                    CLUES: <span className="text-white">{data.clues}</span> | {data.entidad_nombre || data.entidad}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botón de Cerrar Estilizado */}
                    <button
                        onClick={onClose}
                        className="group relative p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-full transition-all duration-300"
                    >
                        <span className="text-white/50 group-hover:text-white text-2xl font-light leading-none block w-8 h-8 items-center justify-center">
                            ✕
                        </span>
                    </button>
                </div>

                {/* NAVEGACIÓN TABS */}
                <div className="flex bg-slate-50 border-b overflow-x-auto scrollbar-hide">
                    {Object.keys(CONFIG_EXPEDIENTE).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                            }}
                            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-[#DDC9A3] text-[#1B4D3E] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* SUB-NAVEGACIÓN STICKY */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b flex gap-6 px-10 py-3 overflow-x-auto scrollbar-hide shadow-sm">
                    {CONFIG_EXPEDIENTE[activeTab].map(sec => (
                        <button
                            key={sec.id}
                            onClick={(e) => scrollToSection(e, sec.id)}
                            className="text-[10px] font-bold text-slate-400 hover:text-[#1B4D3E] uppercase tracking-wider whitespace-nowrap transition-colors"
                        >
                            {sec.titulo}
                        </button>
                    ))}
                </div>

                {/* CUERPO DINÁMICO */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-10 bg-white scroll-smooth custom-scrollbar">
                    {CONFIG_EXPEDIENTE[activeTab].map((seccion) => (
                        <div key={seccion.id} id={seccion.id} className="mb-14 last:mb-0 scroll-mt-32 transition-all">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-5 w-1 bg-[#DDC9A3] rounded-full"></div>
                                <h3 className="text-[13px] font-black text-[#1B4D3E] uppercase tracking-widest">{seccion.titulo}</h3>
                            </div>

                            {seccion.tipo === 'tabla' ? (
                                <div className="border rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                                            <tr><th className="px-4 py-3 text-left">Categoría</th><th className="text-center px-4">Valor Oficial</th></tr>
                                        </thead>
                                        <tbody className="divide-y bg-white">
                                            {seccion.variables.map(v => (
                                                <tr key={v.key} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-700 font-medium">{v.label}</td>
                                                    <td className="text-center px-4 font-bold text-[#1B4D3E]">{data[v.key] || '0'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {seccion.variables.map(v => (
                                        <div key={v.key} className={v.fullWidth ? "md:col-span-3" : ""}>
                                            {seccion.tipo === 'status' || v.tipo === 'status' ? (
                                                <StatusCard label={v.label} val={data[v.key]} />
                                            ) : (
                                                <DataBox label={v.label} value={data[v.key]} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="p-5 bg-gray-50 border-t flex justify-end px-10">
                    <button onClick={onClose} className="bg-[#1B4D3E] text-white px-10 py-2.5 rounded font-bold text-sm shadow-md transition-all">
                        Cerrar Expediente
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTES UI ---
const DataBox = ({ label, value }) => (
    <div className="bg-gray-50 p-3 rounded border border-gray-100 shadow-sm">
        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1 leading-tight">{label}</span>
        <span className="text-sm text-slate-700 font-semibold">{value || '---'}</span>
    </div>
);

const StatusCard = ({ label, val }) => {
    const norm = String(val).toUpperCase();
    const isPos = norm === 'SÍ' || norm === '1' || norm === 'TRUE';
    return (
        <div className="p-4 rounded border border-gray-100 flex flex-col items-center bg-white shadow-sm">
            <span className="text-[9px] font-bold text-gray-400 uppercase mb-2 text-center leading-tight">{label}</span>
            <span className={`text-[10px] font-black px-4 py-1 rounded-full ${isPos ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {isPos ? 'SÍ' : (!val || val === '---' ? 'N/D' : 'NO')}
            </span>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center">
            <div className="w-12 h-12 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consultando Datos Oficiales</p>
        </div>
    </div>
);

const ErrorModal = ({ message, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-sm">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <p className="text-sm font-bold text-gray-800 uppercase mb-4">{message}</p>
            <button onClick={onClose} className="bg-gray-800 text-white px-8 py-2 rounded-lg font-bold text-xs">CERRAR</button>
        </div>
    </div>
);

export default ModalExpedienteSibe;