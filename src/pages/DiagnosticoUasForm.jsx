import React, { useState } from 'react';
import HeaderOficial from '../components/HeaderOficial';

export default function DiagnosticoUasForm({ user, onLogout }) {
    const [formData, setFormData] = useState({
        seccion_a: {
            a01: '',
            a01_otra: '',
            a02: '',
            a02_otra: '',
            a03: '',
            a03_otra: '',
            a04: '',
            a05: '',
            a05_otra: ''
        },
        seccion_b: {
            b01: '',
            b02: [
                { actividad: '', frecuencia: 'diaria' },
                { actividad: '', frecuencia: 'diaria' },
                { actividad: '', frecuencia: 'diaria' }
            ],
            b03: [{ producto: '' }, { producto: '' }],
            b04: '',
            b05: [],
            b06: [],
            b07: ''
        },
        seccion_c: {
            c01: '',
            c02: [],
            c03: [],
            c04: { insumo: '', fuente: '' },
            c05: [{ accion: '' }, { accion: '' }, { accion: '' }],
            c06: '',
            c07: '',
            c08: [],
            c09: '',
            c10: []
        },
        seccion_d: {
            d01: [],
            d02: [],
            d03: ''
        }
    });

    const handleChange = (seccion, campo, valor) => {
        setFormData(prev => ({
            ...prev,
            [seccion]: {
                ...prev[seccion],
                [campo]: valor
            }
        }));
    };

    // ✨ FUNCIÓN ACTUALIZADA: Sin alertas, solo ignora clics extra
    const handleMultiSelect = (seccion, campo, valor, limiteMax) => {
        setFormData(prev => {
            const actual = prev[seccion][campo];
            let nuevo;
            if (actual.includes(valor)) {
                nuevo = actual.filter(item => item !== valor); // Desmarcar
            } else {
                if (actual.length >= limiteMax) {
                    return prev; // Límite alcanzado, no hacer nada
                }
                nuevo = [...actual, valor]; // Marcar
            }
            return {
                ...prev,
                [seccion]: {
                    ...prev[seccion],
                    [campo]: nuevo
                }
            };
        });
    };

    const handleEstructuradaChange = (seccion, campo, index, subcampo, valor) => {
        setFormData(prev => {
            const lista = [...prev[seccion][campo]];
            lista[index][subcampo] = valor;
            return {
                ...prev,
                [seccion]: {
                    ...prev[seccion],
                    [campo]: lista
                }
            };
        });
    };

    const handleSubmit = e => {
        e.preventDefault();
        console.log('Enviando formulario de diagnóstico:', formData);
        alert('¡Diagnóstico guardado con éxito!');
    };

    // Estilos reutilizables
    const inputClases = "mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm p-3 border focus:ring-2 focus:ring-[#10312B] focus:bg-white focus:border-transparent outline-none transition-all text-sm text-gray-700";
    const labelClases = "block text-sm font-bold text-gray-800 mb-1";
    // Solo para radios (los checkboxes ahora tienen lógica dinámica)
    const cardRadioClases = "flex items-start space-x-3 text-sm text-gray-700 bg-gray-50 hover:bg-[#10312B]/5 border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors";

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-32">
            <HeaderOficial />

            <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <span className="text-[10px] font-black tracking-widest text-[#691C32] uppercase bg-[#691C32]/10 px-2.5 py-1 rounded-md">
                        IMSS-BIENESTAR | UNIDAD DE ATENCIÓN A LA SALUD
                    </span>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-2 leading-tight">
                        DIAGNÓSTICO RÁPIDO DE PUESTOS Y PROCEDIMIENTOS DE LA UAS
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Levantamiento de operación real para construir descripciones de puesto y documentar procedimientos.
                    </p>
                    <div className="bg-[#10312B]/5 p-3 rounded-lg mt-3 text-xs text-[#10312B] font-semibold flex flex-col sm:flex-row sm:justify-between gap-2 border border-[#10312B]/10">
                        <span className="flex items-center gap-1">⏱️ Tiempo estimado: 7 a 10 minutos</span>
                        <span className="flex items-center gap-1">📅 Periodo de referencia: Últimos 6 meses</span>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 mt-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* ================= SECCIÓN A ================= */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <h2 className="text-xl font-black text-[#691C32] border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                            <span className="bg-[#691C32] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">A</span>
                            Identificación y ubicación real
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className={labelClases}>A01. Coordinación a la que pertenece</label>
                                <select
                                    className={inputClases}
                                    value={formData.seccion_a.a01}
                                    onChange={e => handleChange('seccion_a', 'a01', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione una coordinación...</option>
                                    <option value="Unidad de Atención a la Salud">Unidad de Atención a la Salud</option>
                                    <option value="Coordinación de Unidades de Primer Nivel">Coordinación de Unidades de Primer Nivel</option>
                                    <option value="Coordinación de Unidades de Segundo Nivel">Coordinación de Unidades de Segundo Nivel</option>
                                    <option value="Coordinación de Hospitales de Alta Especialidad y Programas Especiales">Coordinación de Hospitales de Alta Especialidad y Programas Especiales</option>
                                    <option value="Coordinación de Enfermería">Coordinación de Enfermería</option>
                                    <option value="Coordinación de Supervisión">Coordinación de Supervisión</option>
                                    <option value="Coordinación de Epidemiología">Coordinación de Epidemiología</option>
                                    <option value="Coordinación de Educación e Investigación">Coordinación de Educación e Investigación</option>
                                    <option value="Coordinación de Programas Preventivos">Coordinación de Programas Preventivos</option>
                                    <option value="Coordinación de Normatividad y Planeación Médica">Coordinación de Normatividad y Planeación Médica</option>
                                    <option value="Coordinaciones de los Hospitales Regionales de Alta Especialidad">Coordinaciones de los Hospitales Regionales de Alta Especialidad</option>
                                    <option value="Otra">Otra</option>
                                </select>
                                {formData.seccion_a.a01 === 'Otra' && (
                                    <div className="mt-3 pl-4 border-l-2 border-[#BC955C] animate-fade-in">
                                        <input
                                            type="text"
                                            className={inputClases}
                                            placeholder="Especifique otra coordinación..."
                                            value={formData.seccion_a.a01_otra}
                                            onChange={e => handleChange('seccion_a', 'a01_otra', e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClases}>A02. División o área donde realiza actualmente sus funciones</label>
                                <select
                                    className={inputClases}
                                    value={formData.seccion_a.a02}
                                    onChange={e => handleChange('seccion_a', 'a02', e.target.value)}
                                    required
                                >

                                    <option value="">Seleccione el área o división...</option>
                                    <option value="División de Atención a la Salud de Primer Nivel">División de Atención a la Salud de Primer Nivel</option>
                                    <option value="División de Atención a la Salud de Segundo Nivel">División de Atención a la Salud de Segundo Nivel</option>
                                    <option value="División de Hospitales Regionales de Alta Especialidad y Tercer Nivel">División de Hospitales Regionales de Alta Especialidad y Tercer Nivel</option>
                                    <option value="División de Salud Mental y Adicciones">División de Salud Mental y Adicciones</option>
                                    <option value="División de Salud Materna y Perinatal">División de Salud Materna y Perinatal</option>
                                    <option value="División de Programas Médicos Prioritarios">División de Programas Médicos Prioritarios</option>
                                    <option value="División de Gestión y Operación de Servicios de Enfermería">División de Gestión y Operación de Servicios de Enfermería</option>
                                    <option value="División de Educación e Investigación en Enfermería">División de Educación e Investigación en Enfermería</option>
                                    <option value="División de Normatividad y Calidad de Enfermería">División de Normatividad y Calidad de Enfermería</option>
                                    <option value="División de Supervisión a Unidades Médicas">División de Supervisión a Unidades Médicas</option>
                                    <option value="División de Evaluación de Procesos y Calidad de la Atención">División de Evaluación de Procesos y Calidad de la Atención</option>
                                    <option value="División de Seguimiento a Planes de Mejora y Auditoría Médica">División de Seguimiento a Planes de Mejora y Auditoría Médica</option>
                                    <option value="División de Planeación de la Oferta y Demanda de Servicios">División de Planeación de la Oferta y Demanda de Servicios</option>
                                    <option value="División de Programación de Equipamiento e Insumos Médicos">División de Programación de Equipamiento e Insumos Médicos</option>
                                    <option value="División de Infraestructura y Mantenimiento de Unidades de Salud">División de Infraestructura y Mantenimiento de Unidades de Salud</option>
                                    <option value="División de Vigilancia Epidemiológica">División de Vigilancia Epidemiológica</option>
                                    <option value="División de Salud Pública y Prevención de Enfermedades">División de Salud Pública y Prevención de Enfermedades</option>
                                    <option value="División de Control de Brotes y Emergencias Sanitarias">División de Control de Brotes y Emergencias Sanitarias</option>
                                    <option value="División de Capacitación y Formación de Recursos Humanos en Salud">División de Capacitación y Formación de Recursos Humanos en Salud</option>
                                    <option value="División de Investigación Clínica y Salud Comunitaria">División de Investigación Clínica y Salud Comunitaria</option>
                                    <option value="División de Residencias Médicas e Internado de Pregrado">División de Residencias Médicas e Internado de Pregrado</option>
                                    <option value="Otra">Otra</option>
                                </select>
                                {formData.seccion_a.a02 === 'Otra' && (
                                    <div className="mt-3 pl-4 border-l-2 border-[#BC955C] animate-fade-in">
                                        <input
                                            type="text"
                                            className={inputClases}
                                            placeholder="Especifique otra división o área..."
                                            value={formData.seccion_a.a02_otra}
                                            onChange={e => handleChange('seccion_a', 'a02_otra', e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClases}>A03. Puesto nominal o plaza con la que aparece administrativamente</label>
                                <select
                                    className={inputClases}
                                    value={formData.seccion_a.a03}
                                    onChange={e => handleChange('seccion_a', 'a03', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione el puesto nominal...</option>
                                    <option value="Titular de Coordinación">Titular de Coordinación</option>
                                    <option value="Titular de Coordinación Técnica">Titular de Coordinación Técnica</option>
                                    <option value="Titular de División">Titular de División</option>
                                    <option value="Jefe Área Médica">Jefe Área Médica</option>
                                    <option value="Jefe Área Enfermería">Jefe Área Enfermería</option>
                                    <option value="Líder de Proyecto Médico">Líder de Proyecto Médico</option>
                                    <option value="Líder de Proyecto de Enfermería">Líder de Proyecto de Enfermería</option>
                                    <option value="Subdirección de Área">Subdirección de Área</option>
                                    <option value="Supervisor de Procesos">Supervisor de Procesos</option>
                                    <option value="Jefatura de Departamento">Jefatura de Departamento</option>
                                    <option value="Enlace">Enlace</option>
                                    <option value="Soporte Administrativo 'C'">Soporte Administrativo "C"</option>
                                    <option value="Otra">Otra</option>
                                </select>
                                {formData.seccion_a.a03 === 'Otra' && (
                                    <div className="mt-3 pl-4 border-l-2 border-[#BC955C] animate-fade-in">
                                        <input
                                            type="text"
                                            className={inputClases}
                                            placeholder="Especifique otro puesto nominal..."
                                            value={formData.seccion_a.a03_otra}
                                            onChange={e => handleChange('seccion_a', 'a03_otra', e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClases}>A04. ¿Su puesto/plaza coincide con la función que realmente desempeña?</label>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Sí, coincide sustancialmente', 'Coincide parcialmente', 'No coincide', 'No lo sé'].map(op => (
                                        <label key={op} className={cardRadioClases}>
                                            <input
                                                type="radio"
                                                name="a04"
                                                className="mt-0.5 text-[#10312B] focus:ring-[#10312B]"
                                                checked={formData.seccion_a.a04 === op}
                                                onChange={() => handleChange('seccion_a', 'a04', op)}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={labelClases}>A05. Situación de adscripción actual</label>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Adscrito(a) al área', 'Comisionado(a) desde otra área', 'Apoyo temporal', 'No lo sé'].map(op => (
                                        <label key={op} className={cardRadioClases}>
                                            <input
                                                type="radio"
                                                name="a05"
                                                className="mt-0.5 text-[#10312B] focus:ring-[#10312B]"
                                                checked={formData.seccion_a.a05 === op}
                                                onChange={() => handleChange('seccion_a', 'a05', op)}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    ))}
                                </div>
                                {formData.seccion_a.a05 === 'Comisionado(a) desde otra área' && (
                                    <div className="mt-3 pl-4 border-l-2 border-[#BC955C] animate-fade-in">
                                        <input
                                            type="text"
                                            className={inputClases}
                                            placeholder="¿Cuál área del IMSS-BIENESTAR (UNIDAD o Dirección General)?"
                                            value={formData.seccion_a.a05_otra}
                                            onChange={e => handleChange('seccion_a', 'a05_otra', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ================= SECCIÓN B ================= */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                        <h2 className="text-xl font-black text-[#691C32] border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                            <span className="bg-[#691C32] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">B</span>
                            Descripción real del puesto o función
                        </h2>

                        <div>
                            <label className={labelClases}>B01. En una frase, ¿para qué existe su función? Propósito principal</label>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[11px] text-gray-500">Máximo 180 caracteres.</p>
                                <span className={`text-[11px] font-bold ${(formData.seccion_b.b01 || '').length >= 170 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {(formData.seccion_b.b01 || '').length}/180
                                </span>
                            </div>
                            <textarea
                                maxLength={180}
                                rows={2}
                                className={`${inputClases} resize-none`}
                                value={formData.seccion_b.b01}
                                onChange={e => handleChange('seccion_b', 'b01', e.target.value)}
                                placeholder="Ej: Garantizar el funcionamiento de los sistemas informáticos..."
                            />
                        </div>

                        <div>
                            <label className={labelClases}>B02. Tres actividades prioritarias y su frecuencia</label>
                            <div className="mt-3 space-y-3">
                                {formData.seccion_b.b02.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded-md w-8 h-10 sm:h-auto">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Describa la actividad prioritaria ${index + 1}`}
                                            className="flex-1 rounded-md border-gray-300 p-2.5 text-sm outline-none border focus:ring-2 focus:ring-[#10312B]"
                                            value={item.actividad}
                                            onChange={e => handleEstructuradaChange('seccion_b', 'b02', index, 'actividad', e.target.value)}
                                        />
                                        <select
                                            className="sm:w-48 rounded-md border-gray-300 p-2.5 text-sm outline-none border focus:ring-2 focus:ring-[#10312B] bg-white cursor-pointer"
                                            value={item.frecuencia}
                                            onChange={e => handleEstructuradaChange('seccion_b', 'b02', index, 'frecuencia', e.target.value)}
                                        >
                                            <option value="diaria">Diaria</option>
                                            <option value="varias veces por semana">Varias veces / sem</option>
                                            <option value="semanal">Semanal</option>
                                            <option value="quincenal">Quincenal</option>
                                            <option value="mensual">Mensual</option>
                                            <option value="eventual">Eventual</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>B03. Dos principales productos o resultados que entrega</label>
                            <div className="mt-3 space-y-3">
                                {formData.seccion_b.b03.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <div className="flex items-center justify-center bg-[#10312B]/10 text-[#10312B] font-bold rounded-md w-8 h-[46px]">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Ej: Reporte semanal de incidencias...`}
                                            className={inputClases + " !mt-0"}
                                            value={item.producto}
                                            onChange={e => handleEstructuradaChange('seccion_b', 'b03', index, 'producto', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>B04. ¿A quién reporta funcionalmente su trabajo?</label>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Divisionario(a)', 'Jefe(a)/responsable de área', 'Coordinador(a)', 'Otro mando', 'Depende del asunto', 'No está claro'].map(op => (
                                    <label key={op} className={cardRadioClases}>
                                        <input
                                            type="radio"
                                            name="b04"
                                            className="mt-0.5 text-[#10312B] focus:ring-[#10312B]"
                                            checked={formData.seccion_b.b04 === op}
                                            onChange={() => handleChange('seccion_b', 'b04', op)}
                                        />
                                        <span className="font-medium">{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                B05. Nivel de autonomía
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 3 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Ejecuta instrucciones definidas',
                                    'Resuelve asuntos operativos dentro de reglas establecidas',
                                    'Propone y decide aspectos técnicos de su función de manera autónoma',
                                    'Coordina trabajo con otras personas o áreas',
                                    'Coordina trabajo de otras personas o áreas',
                                    'Autoriza o valida resultados',
                                    'No está claro'
                                ].map(op => {
                                    // ✨ Lógica Condicional para B05 ✨
                                    const estaSeleccionado = formData.seccion_b.b05.includes(op);
                                    const limiteAlcanzado = formData.seccion_b.b05.length >= 3;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_b', 'b05', op, 3)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                B06. Conocimientos indispensables
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 4 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Especialidad técnica del área',
                                    'Normatividad',
                                    'Análisis de información o datos',
                                    'Gestión de procesos',
                                    'Gestión de proyectos',
                                    'Conocimiento sobre los procesos de atención y operación en salud',
                                    'Coordinación entre áreas',
                                    'Utilización de sistemas y recursos informáticos y digitales',
                                    'Otro'
                                ].map(op => {
                                    // ✨ Lógica Condicional para B06 ✨
                                    const estaSeleccionado = formData.seccion_b.b06.includes(op);
                                    const limiteAlcanzado = formData.seccion_b.b06.length >= 4; // Límite de 4
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_b', 'b06', op, 4)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>B07. Si usted se ausentara una semana, ¿otra persona podría continuar funciones críticas?</label>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {['Sí, completamente', 'Sí, parcialmente', 'No', 'No aplica / No lo sé'].map(op => (
                                    <label key={op} className={cardRadioClases}>
                                        <input
                                            type="radio"
                                            name="b07"
                                            className="mt-0.5 text-[#10312B] focus:ring-[#10312B]"
                                            checked={formData.seccion_b.b07 === op}
                                            onChange={() => handleChange('seccion_b', 'b07', op)}
                                        />
                                        <span className="font-medium">{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ================= SECCIÓN C ================= */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                        <h2 className="text-xl font-black text-[#691C32] border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                            <span className="bg-[#691C32] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">C</span>
                            Procedimiento principal en el que participa
                        </h2>

                        <div>
                            <label className={labelClases}>C01. Nombre del procedimiento principal</label>
                            <input
                                type="text"
                                placeholder="Ej. Integración de información, validación de solicitudes..."
                                className={inputClases}
                                value={formData.seccion_c.c01}
                                onChange={e => handleChange('seccion_c', 'c01', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                C02. Su papel principal en este procedimiento
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 3 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Responsable de inicio a fin', 'Ejecuta una parte', 'Revisa o valida', 'Autoriza', 'Aporta información o insumos', 'Da seguimiento', 'Otro'].map(op => {
                                    // ✨ Lógica Condicional para C02 ✨
                                    const estaSeleccionado = formData.seccion_c.c02.includes(op);
                                    const limiteAlcanzado = formData.seccion_c.c02.length >= 3;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_c', 'c02', op, 3)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                C03. ¿Qué inicia normalmente ese procedimiento?
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 3 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Solicitud de otra área institucional', 'Solicitud externa', 'Calendario o periodicidad', 'Instrucción de un mando', 'Evento o incidencia', 'Sistema o registro', 'Otro'].map(op => {
                                    // ✨ Lógica Condicional para C03 ✨
                                    const estaSeleccionado = formData.seccion_c.c03.includes(op);
                                    const limiteAlcanzado = formData.seccion_c.c03.length >= 3;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_c', 'c03', op, 3)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-4 md:p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClases}>C04. Principal insumo o entrada</label>
                                <input
                                    type="text"
                                    className={inputClases}
                                    placeholder="Ej: Base de datos en Excel"
                                    value={formData.seccion_c.c04.insumo}
                                    onChange={e => setFormData(prev => ({ ...prev, seccion_c: { ...prev.seccion_c, c04: { ...prev.seccion_c.c04, insumo: e.target.value } } }))}
                                />
                            </div>
                            <div>
                                <label className={labelClases}>Área, puesto o fuente que lo proporciona</label>
                                <input
                                    type="text"
                                    className={inputClases}
                                    placeholder="Ej: Coordinación Estatal"
                                    value={formData.seccion_c.c04.fuente}
                                    onChange={e => setFormData(prev => ({ ...prev, seccion_c: { ...prev.seccion_c, c04: { ...prev.seccion_c.c04, fuente: e.target.value } } }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>C05. Tres acciones breves que realiza con el insumo</label>
                            <div className="mt-3 space-y-3">
                                {formData.seccion_c.c05.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <div className="flex items-center justify-center bg-[#10312B]/10 text-[#10312B] font-bold rounded-md w-8 h-[46px]">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Describa la acción ${index + 1}`}
                                            className={inputClases + " !mt-0"}
                                            value={item.accion}
                                            onChange={e => handleEstructuradaChange('seccion_c', 'c05', index, 'accion', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-4 md:p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClases}>C06. ¿Qué entrega al terminar?</label>
                                <input
                                    type="text"
                                    className={inputClases}
                                    placeholder="Ej: Reporte validado"
                                    value={formData.seccion_c.c06}
                                    onChange={e => handleChange('seccion_c', 'c06', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClases}>C07. ¿A quién le entrega ese resultado?</label>
                                <input
                                    type="text"
                                    className={inputClases}
                                    placeholder="Ej: Dirección Médica"
                                    value={formData.seccion_c.c07}
                                    onChange={e => handleChange('seccion_c', 'c07', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                C08. Herramientas principales utilizadas
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 4 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {['Sistema institucional', 'Hoja de cálculo', 'Correo electrónico', 'Procesador de textos', 'Formato o plantilla', 'Manual o guía', 'Otra'].map(op => {
                                    // ✨ Lógica Condicional para C08 ✨
                                    const estaSeleccionado = formData.seccion_c.c08.includes(op);
                                    const limiteAlcanzado = formData.seccion_c.c08.length >= 4;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_c', 'c08', op, 4)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>C09. Grado de documentación actual del procedimiento</label>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {['Existe y está vigente', 'Existe, pero está incompleto', 'Existe, vigente pero no es normativa', 'Existe, pero está desactualizado', 'No existe procedimiento', 'No lo sé'].map(op => (
                                    <label key={op} className={cardRadioClases}>
                                        <input
                                            type="radio"
                                            name="c09"
                                            className="mt-0.5 text-[#10312B] focus:ring-[#10312B]"
                                            checked={formData.seccion_c.c09 === op}
                                            onChange={() => handleChange('seccion_c', 'c09', op)}
                                        />
                                        <span className="font-medium">{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                C10. Principales obstáculos para este procedimiento
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 4 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'No están claras las responsabilidades',
                                    'La información llega tarde o incompleta',
                                    'Hay demasiadas autorizaciones',
                                    'Existen actividades duplicadas',
                                    'Depende de una sola persona',
                                    'Falta documentación del procedimiento',
                                    'Falta coordinación con otra área',
                                    'Las herramientas o sistemas son insuficientes',
                                    'No identifico un obstáculo relevante',
                                    'Otro'
                                ].map(op => {
                                    // ✨ Lógica Condicional para C10 ✨
                                    const estaSeleccionado = formData.seccion_c.c10.includes(op);
                                    const limiteAlcanzado = formData.seccion_c.c10.length >= 4;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_c', 'c10', op, 4)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ================= SECCIÓN D ================= */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                        <h2 className="text-xl font-black text-[#691C32] border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                            <span className="bg-[#691C32] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">D</span>
                            Prioridad de formalización y mejora
                        </h2>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                D01. ¿Qué debería formalizarse primero?
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 3 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Descripción de puestos y responsabilidades',
                                    'Procedimientos de trabajo',
                                    'Límites entre áreas y responsabilidades',
                                    'Niveles de autorización y decisión',
                                    'Mecanismos de respaldo y protección documental',
                                    'No identifico una prioridad urgente'
                                ].map(op => {
                                    // ✨ Lógica Condicional para D01 ✨
                                    const estaSeleccionado = formData.seccion_d.d01.includes(op);
                                    const limiteAlcanzado = formData.seccion_d.d01.length >= 3;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_d', 'd01', op, 3)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="items-center gap-2 block text-sm font-bold text-gray-800 mb-1">
                                D02. Cambio de mayor impacto inmediato
                                <span className="bg-[#BC955C] text-white text-[10px] px-2 py-0.5 rounded uppercase">Máx 3 opciones</span>
                            </label>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    'Aclarar responsabilidades',
                                    'Simplificar un procedimiento',
                                    'Documentar un procedimiento',
                                    'Redistribuir carga de trabajo',
                                    'Automatizar una actividad',
                                    'Fortalecer capacidades o capacitación',
                                    'Mejorar coordinación entre áreas',
                                    'Definir perfiles de puesto',
                                    'Otro'
                                ].map(op => {
                                    // ✨ Lógica Condicional para D02 ✨
                                    const estaSeleccionado = formData.seccion_d.d02.includes(op);
                                    const limiteAlcanzado = formData.seccion_d.d02.length >= 3;
                                    const estaDeshabilitado = !estaSeleccionado && limiteAlcanzado;
                                    return (
                                        <label
                                            key={op}
                                            className={`flex items-start space-x-3 text-sm p-3 rounded-lg border transition-colors 
                                                ${estaDeshabilitado
                                                    ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#10312B]/5 cursor-pointer'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`mt-0.5 rounded text-[#10312B] focus:ring-[#10312B] ${estaDeshabilitado ? 'cursor-not-allowed' : ''}`}
                                                checked={estaSeleccionado}
                                                onChange={() => handleMultiSelect('seccion_d', 'd02', op, 3)}
                                                disabled={estaDeshabilitado}
                                            />
                                            <span className="font-medium">{op}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className={labelClases}>D03. Situación futura mejorada</label>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[11px] text-gray-500">Máximo 180 caracteres.</p>
                                <span className={`text-[11px] font-bold ${(formData.seccion_d.d03 || '').length >= 170 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {(formData.seccion_d.d03 || '').length}/180
                                </span>
                            </div>
                            <textarea
                                maxLength={180}
                                rows={3}
                                className={`${inputClases} resize-none`}
                                value={formData.seccion_d.d03}
                                onChange={e => handleChange('seccion_d', 'd03', e.target.value)}
                                placeholder="Describa brevemente qué debería cambiar primero en su función o en el área para mejorar los resultados..."
                            />
                        </div>
                    </section>

                    {/* ================= BOTÓN DE ENVÍO ================= */}
                    <div className="pt-6 pb-10 flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#10312B] hover:bg-[#0a201c] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full md:w-auto text-center flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                            </svg>
                            Enviar Diagnóstico UAS
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
