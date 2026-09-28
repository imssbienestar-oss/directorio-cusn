import React, { useState } from 'react';
import MainLayout from '../../MainLayout';

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

    // Manejador genérico para inputs de texto y selects únicos
    const handleChange = (seccion, campo, valor) => {
        setFormData(prev => ({
            ...prev,
            [seccion]: {
                ...prev[seccion],
                [campo]: valor
            }
        }));
    };

    // Manejador para selecciones múltiples con límite máximo
    const handleMultiSelect = (seccion, campo, valor, limiteMax) => {
        setFormData(prev => {
            const actual = prev[seccion][campo];
            let nuevo;
            if (actual.includes(valor)) {
                nuevo = actual.filter(item => item !== valor);
            } else {
                if (actual.length >= limiteMax) {
                    alert(`Solo puedes seleccionar un máximo de ${limiteMax} opciones.`);
                    return prev;
                }
                nuevo = [...actual, valor];
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

    // Manejador para tablas estructuradas (como actividades o acciones)
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

    return (
        <MainLayout user={user} onLogout={onLogout}>
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8 border border-gray-100 font-sans">
                <div className="border-b pb-4 mb-6">
                    <span className="text-xs font-bold tracking-wider text-burgundy-700 uppercase bg-red-50 px-2 py-1 rounded">
                        IMSS-BIENESTAR | UNIDAD DE ATENCIÓN A LA SALUD
                    </span>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">
                        DIAGNÓSTICO RÁPIDO DE PUESTOS Y PROCEDIMIENTOS DE LA UAS
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Levantamiento de operación real para construir descripciones de puesto y documentar procedimientos.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg mt-3 text-xs text-gray-500 flex justify-between">
                        <span>⏱️ Tiempo estimado: 7 a 10 minutos</span>
                        <span>📅 Periodo de referencia: Últimos 6 meses</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* SECCIÓN A */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 border-l-4 border-burgundy-600 pl-2">
                            A. Identificación y ubicación real
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">A01. Coordinación a la que pertenece</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.seccion_a.a01}
                                onChange={e => handleChange('seccion_a', 'a01', e.target.value)}
                                required
                            >
                                <option value="">Seleccione una coordinación...</option>
                                <option value="Coordinación de Unidades de Segundo Nivel">Coordinación de Unidades de Segundo Nivel</option>
                                <option value="Coordinación Médica">Coordinación Médica</option>
                                <option value="Otra">Otra</option>
                            </select>
                            {formData.seccion_a.a01 === 'Otra' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                        placeholder="Especifique otra coordinación..."
                                        value={formData.seccion_a.a01_otra}
                                        onChange={e => handleChange('seccion_a', 'a01_otra', e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">A02. División o área donde realiza actualmente sus funciones</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.seccion_a.a02}
                                onChange={e => handleChange('seccion_a', 'a02', e.target.value)}
                                required
                            >
                                <option value="">Seleccione el área o división...</option>
                                <option value="Sistemas y Estadística">Sistemas y Estadística</option>
                                <option value="Recursos Humanos">Recursos Humanos</option>
                                <option value="Operación y Mejora Continua">Operación y Mejora Continua</option>
                                <option value="Otra">Otra</option>
                            </select>
                            {formData.seccion_a.a02 === 'Otra' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                        placeholder="Especifique otra división o área..."
                                        value={formData.seccion_a.a02_otra}
                                        onChange={e => handleChange('seccion_a', 'a02_otra', e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">A03. Puesto nominal o plaza con la que aparece administrativamente</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.seccion_a.a03}
                                onChange={e => handleChange('seccion_a', 'a03', e.target.value)}
                                required
                            >
                                <option value="">Seleccione el puesto nominal...</option>
                                <option value="Analista de Sistemas">Analista de Sistemas</option>
                                <option value="Supervisor de Procesos">Supervisor de Procesos</option>
                                <option value="Administrador de Base de Datos">Administrador de Base de Datos</option>
                                <option value="Otra">Otra</option>
                            </select>
                            {formData.seccion_a.a03 === 'Otra' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                        placeholder="Especifique otro puesto nominal..."
                                        value={formData.seccion_a.a03_otra}
                                        onChange={e => handleChange('seccion_a', 'a03_otra', e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">A04. ¿Su puesto/plaza coincide con la función que realmente desempeña?</label>
                            <div className="mt-2 space-y-2">
                                {['Sí, coincide sustancialmente', 'Coincide parcialmente', 'No coincide', 'No lo sé'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="a04"
                                            checked={formData.seccion_a.a04 === op}
                                            onChange={() => handleChange('seccion_a', 'a04', op)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">A05. Situación de adscripción actual</label>
                            <div className="mt-2 space-y-2">
                                {['Adscrito(a) al área', 'Comisionado(a) desde otra área', 'Apoyo temporal', 'Otra', 'No lo sé'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="a05"
                                            checked={formData.seccion_a.a05 === op}
                                            onChange={() => handleChange('seccion_a', 'a05', op)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.seccion_a.a05 === 'Comisionado(a) desde otra área' && (
                                <div className="mt-2 pl-6">
                                    <input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                        placeholder="¿Cuál área del IMSS-BIENESTAR (UNIDAD o Dirección General)?"
                                        value={formData.seccion_a.a05_otra}
                                        onChange={e => handleChange('seccion_a', 'a05_otra', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SECCIÓN B */}
                    <section className="space-y-4 pt-4 border-t">
                        <h2 className="text-lg font-semibold text-gray-700 border-l-4 border-burgundy-600 pl-2">
                            B. Descripción real del puesto o función
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">B01. En una frase, ¿para qué existe su función? Propósito principal (Máx. 180 caracteres)</label>
                            <textarea
                                maxLength={180}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                value={formData.seccion_b.b01}
                                onChange={e => handleChange('seccion_b', 'b01', e.target.value)}
                                placeholder="Describa brevemente..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">B02. Tres actividades prioritarias y su frecuencia</label>
                            {formData.seccion_b.b02.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder={`Actividad ${index + 1}`}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                        value={item.actividad}
                                        onChange={e => handleEstructuradaChange('seccion_b', 'b02', index, 'actividad', e.target.value)}
                                    />
                                    <select
                                        className="w-40 rounded-md border-gray-300 shadow-sm p-2 border text-sm"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">B03. Dos principales productos o resultados que entrega</label>
                            {formData.seccion_b.b03.map((item, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Producto o resultado ${index + 1}`}
                                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm mb-2"
                                    value={item.producto}
                                    onChange={e => handleEstructuradaChange('seccion_b', 'b03', index, 'producto', e.target.value)}
                                />
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">B04. ¿A quién reporta funcionalmente su trabajo?</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {['Divisionario(a)', 'Jefe(a)/responsable de área', 'Coordinador(a)', 'Otro mando', 'Depende del asunto', 'No está claro'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="b04"
                                            checked={formData.seccion_b.b04 === op}
                                            onChange={() => handleChange('seccion_b', 'b04', op)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">B05. Nivel de autonomía (Selección múltiple: máximo 3)</label>
                            <div className="mt-2 space-y-2">
                                {[
                                    'Ejecuta instrucciones definidas',
                                    'Resuelve asuntos operativos dentro de reglas establecidas',
                                    'Propone y decide aspectos técnicos de su función de manera autónoma',
                                    'Coordina trabajo con otras personas o áreas',
                                    'Coordina trabajo de otras personas o áreas',
                                    'Autoriza o valida resultados',
                                    'No está claro'
                                ].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_b.b05.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_b', 'b05', op, 3)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">B06. Conocimientos indispensables (Selección múltiple: máximo 4)</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
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
                                ].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_b.b06.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_b', 'b06', op, 4)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">B07. Si usted se ausentara una semana, ¿otra persona podría continuar funciones críticas?</label>
                            <div className="mt-2 space-y-2">
                                {['Sí, completamente', 'Sí, parcialmente', 'No', 'No aplica / No lo sé'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="b07"
                                            checked={formData.seccion_b.b07 === op}
                                            onChange={() => handleChange('seccion_b', 'b07', op)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN C */}
                    <section className="space-y-4 pt-4 border-t">
                        <h2 className="text-lg font-semibold text-gray-700 border-l-4 border-burgundy-600 pl-2">
                            C. Procedimiento principal en el que participa
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C01. Nombre del procedimiento principal</label>
                            <input
                                type="text"
                                placeholder="Ej. Integración de información, validación de solicitudes..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                value={formData.seccion_c.c01}
                                onChange={e => handleChange('seccion_c', 'c01', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C02. Papel principal (Selección múltiple: máximo 3)</label>
                            <div className="mt-2 space-y-2">
                                {['Responsable de inicio a fin', 'Ejecuta una parte', 'Revisa o valida', 'Autoriza', 'Aporta información o insumos', 'Da seguimiento', 'Otro'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_c.c02.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_c', 'c02', op, 3)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C03. ¿Qué inicia normalmente ese procedimiento? (Máx. 3)</label>
                            <div className="mt-2 space-y-2">
                                {['Solicitud de otra área institucional', 'Solicitud externa', 'Calendario o periodicidad', 'Instrucción de un mando', 'Evento o incidencia', 'Sistema o registro', 'Otro'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_c.c03.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_c', 'c03', op, 3)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">C04. Principal insumo o entrada</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                    value={formData.seccion_c.c04.insumo}
                                    onChange={e => setFormData(prev => ({ ...prev, seccion_c: { ...prev.seccion_c, c04: { ...prev.seccion_c.c04, insumo: e.target.value } } }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Área, puesto o fuente que lo proporciona</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                    value={formData.seccion_c.c04.fuente}
                                    onChange={e => setFormData(prev => ({ ...prev, seccion_c: { ...prev.seccion_c, c04: { ...prev.seccion_c.c04, fuente: e.target.value } } }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">C05. Tres acciones breves con el insumo</label>
                            {formData.seccion_c.c05.map((item, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Acción ${index + 1}`}
                                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm mb-2"
                                    value={item.accion}
                                    onChange={e => handleEstructuradaChange('seccion_c', 'c05', index, 'accion', e.target.value)}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">C06. ¿Qué entrega al terminar?</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                    value={formData.seccion_c.c06}
                                    onChange={e => handleChange('seccion_c', 'c06', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">C07. ¿A quién entrega ese resultado?</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                    value={formData.seccion_c.c07}
                                    onChange={e => handleChange('seccion_c', 'c07', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C08. Herramientas principales (Selección múltiple: máximo 4)</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {['Sistema institucional', 'Hoja de cálculo', 'Correo electrónico', 'Procesador de textos', 'Formato o plantilla', 'Manual o guía', 'Otra'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_c.c08.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_c', 'c08', op, 4)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C09. Grado de documentación</label>
                            <div className="mt-2 space-y-2">
                                {['Existe y está vigente', 'Existe, pero está incompleto', 'Existe, está vigente pero no forma parte de la normatividad', 'Existe, pero está desactualizado', 'No existe procedimiento', 'No lo sé'].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="radio"
                                            name="c09"
                                            checked={formData.seccion_c.c09 === op}
                                            onChange={() => handleChange('seccion_c', 'c09', op)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">C10. Principal obstáculo (Selección múltiple: máximo 4)</label>
                            <div className="mt-2 space-y-2">
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
                                ].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_c.c10.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_c', 'c10', op, 4)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN D */}
                    <section className="space-y-4 pt-4 border-t">
                        <h2 className="text-lg font-semibold text-gray-700 border-l-4 border-burgundy-600 pl-2">
                            D. Prioridad de formalización y mejora
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">D01. ¿Qué debería formalizarse primero? (Selección múltiple: máximo 3)</label>
                            <div className="mt-2 space-y-2">
                                {[
                                    'Descripción de puestos y responsabilidades',
                                    'Procedimientos de trabajo',
                                    'Límites entre áreas y responsabilidades',
                                    'Niveles de autorización y decisión',
                                    'Mecanismos de respaldo y protección documental',
                                    'No identifico una prioridad urgente'
                                ].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_d.d01.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_d', 'd01', op, 3)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">D02. Cambio de mayor impacto inmediato (Selección múltiple: máximo 3)</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
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
                                ].map(op => (
                                    <label key={op} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formData.seccion_d.d02.includes(op)}
                                            onChange={() => handleMultiSelect('seccion_d', 'd02', op, 3)}
                                        />
                                        <span>{op}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">D03. Situación futura mejorada (Máx. 180 caracteres)</label>
                            <textarea
                                maxLength={180}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                value={formData.seccion_d.d03}
                                onChange={e => handleChange('seccion_d', 'd03', e.target.value)}
                                placeholder="¿Qué debería cambiar primero en su función..."
                            />
                        </div>
                    </section>

                    {/* Botón de Envío */}
                    <div className="pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#10312B] hover:bg-burgundy-800 text-white font-medium py-2.5 px-6 rounded-md shadow transition text-sm"
                        >
                            Guardar Diagnóstico UAS
                        </button>
                    </div>

                </form>
            </div>
        </MainLayout>
    );
}
