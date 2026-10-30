import React, { useEffect, useMemo, useRef, useState } from 'react';
import HeaderOficial from '../components/HeaderOficial';
import Swal from 'sweetalert2';
import API_URL from '../config/api';
import { generarPDFDirectores } from '../utils/generarPDFDirectores';
import {
    Search, Building2, CheckCircle2, X, Plus, Trash2,
    Camera, Mail, Save, Loader2, ShieldCheck, RotateCcw
} from 'lucide-react';

// El backend permanece en SIBE (Railway); esta página pertenece a Directorio.
// Funciona tanto si API_URL termina en /api como si contiene solo el dominio.
const API_BASE = String(API_URL || '').replace(/\/+$/, '');
const API = `${API_BASE}${API_BASE.endsWith('/api') ? '' : '/api'}/formulario`;

const convertirMayusculas = (valor) =>
    String(valor || '').toLocaleUpperCase('es-MX');

// Permite únicamente letras, acentos y espacios.
const validarNombre = (valor) =>
    convertirMayusculas(valor)
        .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');

// Permite solamente números.
const soloNumeros = (valor, longitud = 10) =>
    String(valor || '')
        .replace(/\D/g, '')
        .slice(0, longitud);

const crearFormularioVacio = () => ({
    nombre_director: '',
    cargo: 'Director(a) de Unidad Médica',
    foto_url: '',
    acciones_relevantes: [''],
    datos_relevantes: '',
    compromisos_proyectos: [''],
    correo_institucional: '',
    telefono: '',
    extension: ''
});

const INPUT_CLASS = 'w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 outline-none transition-all focus:border-[#BC955C] focus:bg-white focus:ring-2 focus:ring-[#BC955C]/30';
const LABEL_CLASS = 'block text-sm font-bold text-gray-800 mb-2';
const SECTION_CLASS = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5 md:p-8';

export default function FormularioDirectores() {
    // 1. ESTADOS GENERALES
    const [modo, setModo] = useState('nuevo');
    const [hospitales, setHospitales] = useState([]);
    const [cargandoHospitales, setCargandoHospitales] = useState(true);
    const [clues, setClues] = useState('');
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [busquedaDebounce, setBusquedaDebounce] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [form, setForm] = useState(crearFormularioVacio);
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState('');
    const [codigo, setCodigo] = useState('');
    const [token, setToken] = useState('');
    const [cargando, setCargando] = useState(false);
    const buscadorRef = useRef(null);
    const consultaCluesRef = useRef(0);
    const [estadoClues, setEstadoClues] = useState('sin_seleccion'); // consultando, disponible, registrada, error

    // 2. CARGA DEL CATÁLOGO DE HOSPITALES (UNA SOLA CONSULTA)
    useEffect(() => {
        const controller = new AbortController();

        const cargarHospitales = async () => {
            try {
                const response = await fetch(`${API}/hospitales`, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error('No fue posible consultar el catálogo de hospitales.');
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('El catálogo devolvió un formato inválido.');
                }

                setHospitales(data);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error al cargar hospitales:', error);
                    Swal.fire('Error', error.message, 'error');
                }
            } finally {
                if (!controller.signal.aborted) setCargandoHospitales(false);
            }
        };

        cargarHospitales();
        return () => controller.abort();
    }, []);

    // 3. DEBOUNCE LOCAL: NO GENERA SOLICITUDES AL BACKEND POR CADA TECLA
    useEffect(() => {
        const timer = setTimeout(() => {
            setBusquedaDebounce(busqueda.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [busqueda]);

    // Cerrar sugerencias si se hace clic fuera del buscador.
    useEffect(() => {
        const cerrarFuera = (evento) => {
            if (buscadorRef.current && !buscadorRef.current.contains(evento.target)) {
                setMostrarSugerencias(false);
            }
        };

        document.addEventListener('mousedown', cerrarFuera);
        return () => document.removeEventListener('mousedown', cerrarFuera);
    }, []);

    // Vista previa de una fotografía nueva (libera URL temporal).
    useEffect(() => {
        if (!foto) {
            setFotoPreview('');
            return;
        }

        const objectURL = URL.createObjectURL(foto);
        setFotoPreview(objectURL);
        return () => URL.revokeObjectURL(objectURL);
    }, [foto]);

    // 4. FUNCIONES DE FORMULARIO
    const reiniciar = (nuevoModo) => {
        consultaCluesRef.current += 1;
        setEstadoClues('sin_seleccion');
        setModo(nuevoModo);
        setClues('');
        setHospitalSeleccionado(null);
        setBusqueda('');
        setBusquedaDebounce('');
        setMostrarSugerencias(false);
        setCodigo('');
        setToken('');
        setFoto(null);
        setForm(crearFormularioVacio());
    };

    const cambiarCampo = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const actualizarLista = (campo, indice, texto) => {
        setForm(prev => ({
            ...prev,
            [campo]: prev[campo].map((elemento, i) => i === indice ? texto : elemento)
        }));
    };

    const agregarElemento = (campo) => {
        setForm(prev => ({
            ...prev,
            [campo]: [...prev[campo], '']
        }));
    };

    const quitarElemento = (campo, indice) => {
        setForm(prev => ({
            ...prev,
            [campo]: prev[campo].filter((_, i) => i !== indice)
        }));
    };

    const mostrarError = (error) => {
        console.error(error);
        return Swal.fire('Error', error.message || 'No se pudo completar la operación.', 'error');
    };

    // 5. BUSCADOR DE HOSPITAL
    const hospitalesFiltrados = useMemo(() => {
        const termino = busquedaDebounce.toLocaleLowerCase('es-MX');
        if (termino.length < 2 || hospitalSeleccionado) return [];

        return hospitales.filter(hospital => {
            const texto = `${hospital.nombre || ''} ${hospital.clues || ''}`;
            return texto.toLocaleLowerCase('es-MX').includes(termino);
        }).slice(0, 8);
    }, [hospitales, busquedaDebounce, hospitalSeleccionado]);

    const seleccionarHospital = async (hospital) => {
        const idConsulta = ++consultaCluesRef.current;
        setClues(hospital.clues);
        setHospitalSeleccionado(hospital);
        setBusqueda(`${hospital.nombre} (${hospital.clues})`);
        setMostrarSugerencias(false);

        // Al actualizar solo se solicita el código; no hace falta consultar el estado.
        if (modo !== 'nuevo') return;

        setEstadoClues('consultando');
        try {
            const response = await fetch(`${API}/estado/${encodeURIComponent(hospital.clues)}`);
            if (!response.ok) throw new Error('No fue posible verificar si la unidad está registrada.');
            const data = await response.json();
            if (typeof data.registrado !== 'boolean') throw new Error('Respuesta inválida.');
            if (idConsulta !== consultaCluesRef.current) return;

            setEstadoClues(data.registrado ? 'registrada' : 'disponible');
            if (!data.registrado) return;

            const decision = await Swal.fire({
                icon: 'info',
                title: 'Esta unidad ya cuenta con un registro',
                text: 'Para modificar su información, utiliza Actualizar formulario e introduce el código enviado al correo registrado.',
                showCancelButton: true,
                confirmButtonText: 'Ir a Actualizar formulario',
                cancelButtonText: 'Elegir otro hospital',
                confirmButtonColor: '#10312B'
            });
            if (idConsulta !== consultaCluesRef.current) return;
            if (decision.isConfirmed) {
                setModo('actualizar');
                setCodigo('');
                setToken('');
                setFoto(null);
                setForm(crearFormularioVacio());
            } else {
                limpiarHospital();
            }
        } catch (error) {
            if (idConsulta !== consultaCluesRef.current) return;
            setEstadoClues('error');
            Swal.fire('No se pudo verificar', 'Intenta seleccionar el hospital nuevamente. No se enviará el registro sin comprobar su disponibilidad.', 'warning');
        }
    };

    const limpiarHospital = () => {
        consultaCluesRef.current += 1;
        setEstadoClues('sin_seleccion');
        setClues('');
        setHospitalSeleccionado(null);
        setBusqueda('');
        setBusquedaDebounce('');
        setMostrarSugerencias(false);
    };

    // 6. VERIFICAR CÓDIGO PARA CONFIRMAR O EDITAR
    const procesarAcceso = async (evento) => {
        evento.preventDefault();
        if (cargando || !clues || !codigo.trim()) return;

        setCargando(true);
        try {
            const response = await fetch(`${API}/acceso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clues, codigo: codigo.trim() })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Código incorrecto.');

            setCodigo('');
            setToken(data.token || '');

            if (data.formulario) {
                setForm({
                    ...crearFormularioVacio(),
                    ...data.formulario,
                    acciones_relevantes: Array.isArray(data.formulario.acciones_relevantes) && data.formulario.acciones_relevantes.length
                        ? data.formulario.acciones_relevantes : [''],
                    compromisos_proyectos: Array.isArray(data.formulario.compromisos_proyectos) && data.formulario.compromisos_proyectos.length
                        ? data.formulario.compromisos_proyectos : ['']
                });
                setModo('editar');
            } else {
                setModo('confirmado');
            }

            await Swal.fire('Verificación correcta', 'El código fue confirmado.', 'success');
        } catch (error) {
            mostrarError(error);
        } finally {
            setCargando(false);
        }
    };

    // 7. REGISTRO O ACTUALIZACIÓN DE INFORMACIÓN
    const enviarFormulario = async (evento) => {
        evento.preventDefault();
        if (cargando) return;

        if (!clues) {
            return Swal.fire('Falta hospital', 'Selecciona una unidad médica.', 'warning');
        }
        if (modo === 'nuevo' && estadoClues !== 'disponible') {
            return Swal.fire('Verifica el hospital', 'Selecciona una unidad sin registro previo y espera a que se confirme su disponibilidad.', 'warning');
        }
        if (modo === 'nuevo' && !foto) {
            return Swal.fire('Falta fotografía', 'Adjunta una fotografía actualizada del director.', 'warning');
        }
        if (foto && foto.size > 3 * 1024 * 1024) {
            return Swal.fire('Fotografía muy grande', 'El tamaño máximo es de 3 MB.', 'warning');
        }
        if (foto && !['image/jpeg', 'image/png', 'image/webp'].includes(foto.type)) {
            return Swal.fire('Formato inválido', 'Utiliza una imagen JPG, PNG o WebP.', 'warning');
        }

        setCargando(true);
        try {
            const datos = new FormData();
            datos.append('datos', JSON.stringify({ ...form, clues }));
            if (foto) datos.append('foto', foto);

            const { archivo, nombreArchivo } = await generarPDFDirectores({
                ...form,
                clues,
                nombre_hospital: hospitalSeleccionado?.nombre || busqueda,
                foto_nueva: foto
            });
            datos.append('archivoPdf', archivo, nombreArchivo);

            const esEdicion = modo === 'editar';
            const endpoint = esEdicion
                ? `${API}/registro/${encodeURIComponent(clues)}`
                : `${API}/registro`;

            const response = await fetch(endpoint, {
                method: esEdicion ? 'PUT' : 'POST',
                headers: esEdicion ? { Authorization: `Bearer ${token}` } : {},
                body: datos
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'No se pudo guardar la información.');

            setFoto(null);

            if (data.pdf_drive === false) {
                await Swal.fire('Registro guardado', 'La información se guardó, pero el PDF no pudo sincronizarse con Google Drive. Contacta al administrador para reintentar.', 'warning');
            }

            if (esEdicion) {
                await Swal.fire('Información actualizada', 'Los cambios fueron guardados correctamente.', 'success');
                reiniciar('actualizar');
            } else {
                setModo('confirmado');
            }
        } catch (error) {
            mostrarError(error);
        } finally {
            setCargando(false);
        }
    };

    // 8. RECUPERACIÓN DE CÓDIGO
    const recuperarCodigo = async () => {
        if (cargando || !clues) {
            if (!clues) Swal.fire('Selecciona un hospital', 'Debes seleccionar la CLUES correspondiente.', 'warning');
            return;
        }

        setCargando(true);
        try {
            const response = await fetch(`${API}/recuperar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clues })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'No fue posible solicitar la recuperación.');

            await Swal.fire('Solicitud recibida', data.message || 'Revisa el correo registrado.', 'info');
        } catch (error) {
            mostrarError(error);
        } finally {
            setCargando(false);
        }
    };

    // 9. COMPONENTE PARA CAMPOS DINÁMICOS
    const renderizarLista = (campo, titulo, ayuda) => (
        <div className="space-y-3">
            <label className={LABEL_CLASS}>{titulo}</label>

            {form[campo].map((valor, indice) => (
                <div key={indice} className="flex items-start gap-2">
                    <div className="flex-1">
                        <textarea
                            rows={2}
                            maxLength={1000}
                            required
                            className={INPUT_CLASS}
                            placeholder={ayuda}
                            value={valor}
                            onChange={(e) => actualizarLista(campo, indice, e.target.value)}
                        />
                        <p className="mt-1 text-right text-[11px] text-gray-400">
                            {valor.length}/1000 caracteres
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => quitarElemento(campo, indice)}
                        className="rounded-lg border border-red-200 p-3 text-red-600 transition-colors hover:bg-red-50"
                        title="Eliminar elemento"
                        aria-label={`Eliminar elemento ${indice + 1}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <button
                type="button"
                disabled={form[campo].length >= 15}
                onClick={() => agregarElemento(campo)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#10312B]/20 px-4 py-2 text-sm font-bold text-[#10312B] hover:bg-[#10312B]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Plus className="h-4 w-4" />
                Agregar otro
            </button>
        </div>
    );

    const hospitalBloqueado = ['editar', 'confirmar'].includes(modo);
    const esRegistro = ['nuevo', 'confirmar', 'confirmado'].includes(modo);

    return (
        <div className="min-h-screen bg-gray-100 pb-16 font-sans">
            <HeaderOficial />

            {/* ENCABEZADO INSTITUCIONAL */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-4 py-5 md:py-6">
                    <span className="inline-block rounded-md bg-[#691C32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#691C32]">
                        IMSS-BIENESTAR | Ciudad de México
                    </span>
                    <h1 className="mt-3 text-xl font-black leading-tight text-[#10312B] md:text-3xl">
                        Información Directiva Hospitalaria
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Registro y actualización de información institucional de hospitales.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-8">
                {/* SELECCIÓN DE MODALIDAD */}
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                    <button
                        type="button"
                        onClick={() => reiniciar('nuevo')}
                        className={`rounded-lg px-3 py-3 text-xs font-bold transition-colors sm:text-sm ${esRegistro ? 'bg-[#10312B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Nuevo registro
                    </button>
                    <button
                        type="button"
                        onClick={() => reiniciar('actualizar')}
                        className={`rounded-lg px-3 py-3 text-xs font-bold transition-colors sm:text-sm ${!esRegistro ? 'bg-[#10312B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Actualizar formulario
                    </button>
                </div>

                {/* HOSPITAL: AUTOCOMPLETADO CON DEBOUNCE */}
                {modo !== 'confirmado' && (
                    <section className={SECTION_CLASS}>
                        <h2 className="flex items-center gap-2 text-lg font-black text-[#691C32]">
                            <Building2 className="h-5 w-5" /> Hospital o unidad médica
                        </h2>

                        <div ref={buscadorRef} className="relative">
                            <label className={LABEL_CLASS} htmlFor="buscar-hospital">
                                Buscar hospital o CLUES *
                            </label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="buscar-hospital"
                                    type="text"
                                    autoComplete="off"
                                    className={`${INPUT_CLASS} pl-10 pr-10`}
                                    placeholder={cargandoHospitales ? 'Cargando hospitales...' : 'Escribe el nombre o la CLUES...'}
                                    value={busqueda}
                                    disabled={hospitalBloqueado || cargandoHospitales}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setClues('');
                                        setHospitalSeleccionado(null);
                                        consultaCluesRef.current += 1;
                                        setEstadoClues('sin_seleccion');
                                        setMostrarSugerencias(true);
                                    }}
                                    onFocus={() => {
                                        if (!hospitalSeleccionado) setMostrarSugerencias(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setMostrarSugerencias(false);
                                    }}
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-expanded={mostrarSugerencias && !hospitalSeleccionado && busquedaDebounce.length >= 2}
                                    aria-controls="opciones-hospitales"
                                />
                                {busqueda && !hospitalBloqueado && (
                                    <button
                                        type="button"
                                        onClick={limpiarHospital}
                                        aria-label="Limpiar hospital"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-[#691C32]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {mostrarSugerencias && !hospitalSeleccionado && busquedaDebounce.length >= 2 && !hospitalBloqueado && (
                                <div
                                    id="opciones-hospitales"
                                    role="listbox"
                                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
                                >
                                    {hospitalesFiltrados.length > 0 ? (
                                        hospitalesFiltrados.map((hospital) => (
                                            <button
                                                key={hospital.clues}
                                                type="button"
                                                role="option"
                                                aria-selected={false}
                                                onClick={() => seleccionarHospital(hospital)}
                                                className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#10312B]/5 focus:bg-[#10312B]/5 focus:outline-none"
                                            >
                                                <span className="block text-sm font-bold text-gray-800">
                                                    {hospital.nombre}
                                                </span>
                                                <span className="mt-1 block font-mono text-xs text-[#691C32]">
                                                    {hospital.clues}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-4 text-sm text-gray-500">
                                            No se encontraron hospitales con ese nombre o CLUES.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {hospitalSeleccionado && (
                            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-bold">Hospital seleccionado</p>
                                    <p className="text-xs">{hospitalSeleccionado.nombre} · {clues}</p>
                                </div>
                            </div>
                        )}
                        {modo === 'nuevo' && estadoClues === 'consultando' && (
                            <p role="status" className="text-sm text-gray-600">Verificando si esta unidad ya tiene un registro...</p>
                        )}
                        {modo === 'nuevo' && estadoClues === 'disponible' && (
                            <p role="status" className="text-sm text-green-700">Unidad disponible para nuevo registro.</p>
                        )}
                        {modo === 'nuevo' && estadoClues === 'error' && (
                            <p role="alert" className="text-sm text-red-700">No fue posible consultar el estado. Selecciona nuevamente la unidad.</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Escribe al menos 2 caracteres. Selecciona un resultado de la lista para continuar.
                        </p>
                    </section>
                )}

                {/* CONFIRMACIÓN DE REGISTRO / ACCESO A ACTUALIZACIÓN */}
                {['actualizar', 'confirmar'].includes(modo) && (
                    <form className={SECTION_CLASS} onSubmit={procesarAcceso}>
                        <h2 className="flex items-center gap-2 text-lg font-black text-[#691C32]">
                            <ShieldCheck className="h-5 w-5" />
                            {modo === 'confirmar' ? 'Confirmar correo institucional' : 'Acceso para actualización'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Introduce el código enviado al correo institucional registrado.
                        </p>
                        <div>
                            <label className={LABEL_CLASS} htmlFor="codigo-acceso">Código de verificación *</label>
                            <input
                                id="codigo-acceso"
                                type="text"
                                required
                                maxLength={20}
                                autoComplete="off"
                                className={`${INPUT_CLASS} font-mono uppercase tracking-wider`}
                                placeholder="Código de 12 caracteres"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={cargando || !clues || !codigo.trim()}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10312B] p-3 font-bold text-white transition-colors hover:bg-[#17483F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
                            {cargando ? 'Verificando...' : 'Verificar código'}
                        </button>
                        {modo === 'actualizar' && (
                            <button
                                type="button"
                                onClick={recuperarCodigo}
                                disabled={cargando || !clues || (modo === 'nuevo' && estadoClues !== 'disponible')}
                                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#691C32] underline disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Olvidé mi código (enviar uno nuevo al correo registrado)
                            </button>
                        )}
                    </form>
                )}

                {/* FORMULARIO PRINCIPAL */}
                {['nuevo', 'editar'].includes(modo) && (
                    <form onSubmit={enviarFormulario} className="space-y-6">
                        {/* SECCIÓN 1. IDENTIFICACIÓN */}
                        <section className={SECTION_CLASS}>
                            <h2 className="border-b border-gray-100 pb-3 text-lg font-black text-[#691C32]">
                                1. Identificación del director
                            </h2>
                            <div>
                                <label className={LABEL_CLASS} htmlFor="nombre-director">Nombre completo *</label>
                                <input
                                    id="nombre-director"
                                    type="text"
                                    required
                                    maxLength={200}
                                    className={INPUT_CLASS}
                                    value={form.nombre_director}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'nombre_director',
                                            validarNombre(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS} htmlFor="cargo-director">Cargo *</label>
                                <input
                                    id="cargo-director"
                                    type="text"
                                    required
                                    maxLength={150}
                                    className={INPUT_CLASS}
                                    value={form.cargo}
                                    onChange={(e) =>
                                        cambiarCampo(
                                            'cargo',
                                            convertirMayusculas(e.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS} htmlFor="foto-director">
                                    Fotografía actual del director(a) de la unidad médica {modo === 'nuevo' ? '*' : ''}
                                </label>
                                <p className="mb-2 text-xs text-gray-500">JPG, PNG o WebP · máximo 3 MB.</p>
                                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
                                    <div className="flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        {fotoPreview || form.foto_url ? (
                                            <img
                                                src={fotoPreview || form.foto_url}
                                                alt="Fotografía del director"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="h-8 w-8 text-gray-300" />
                                        )}
                                    </div>
                                    <input
                                        id="foto-director"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="block w-full min-w-0 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#10312B] file:px-4 file:py-2 file:font-semibold file:text-white"
                                        onChange={(e) => setFoto(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 2. ACCIONES, DATOS Y PROYECTOS */}
                        <section className={SECTION_CLASS}>
                            <h2 className="border-b border-gray-100 pb-3 text-lg font-black text-[#691C32]">
                                2. Información relevante del hospital
                            </h2>
                            {renderizarLista(
                                'acciones_relevantes',
                                'Acciones relevantes para IMSS-BIENESTAR',
                                'Describa la acción implementada y su resultado...'
                            )}
                            <div>
                                <label className={LABEL_CLASS} htmlFor="datos-relevantes">Datos relevantes</label>
                                <textarea
                                    id="datos-relevantes"
                                    rows={4}
                                    required
                                    maxLength={4000}
                                    className={INPUT_CLASS}
                                    placeholder="Indicadores, logros, necesidades o información institucional relevante..."
                                    value={form.datos_relevantes}
                                    onChange={(e) => cambiarCampo('datos_relevantes', e.target.value)}
                                />
                                <p className="mt-1 text-right text-[11px] text-gray-400">
                                    {form.datos_relevantes.length}/4000 caracteres
                                </p>
                            </div>
                            {renderizarLista(
                                'compromisos_proyectos',
                                'Compromisos y proyectos del hospital',
                                'Describa el compromiso o proyecto y su avance...'
                            )}
                        </section>

                        {/* SECCIÓN 3. CONTACTO */}
                        <section className={SECTION_CLASS}>
                            <h2 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-black text-[#691C32]">
                                <Mail className="h-5 w-5" /> 3. Datos de contacto
                            </h2>
                            <div>
                                <label className={LABEL_CLASS} htmlFor="correo-director">Correo institucional *</label>
                                <input
                                    id="correo-director"
                                    type="email"
                                    required
                                    maxLength={200}
                                    disabled={modo === 'editar'}
                                    className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:bg-gray-100`}
                                    value={form.correo_institucional}
                                    onChange={(e) => cambiarCampo('correo_institucional', e.target.value)}
                                />
                                {modo === 'editar' && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        El correo está vinculado al código de acceso y no puede modificarse aquí.
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={LABEL_CLASS} htmlFor="telefono-director">Teléfono</label>
                                    <input
                                        id="telefono-director"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]{10}"
                                        title="Introduce un número telefónico de 10 dígitos."
                                        maxLength={10}
                                        className={INPUT_CLASS}
                                        placeholder="Ej. 5512345678"
                                        value={form.telefono}
                                        onChange={(e) =>
                                            cambiarCampo(
                                                'telefono',
                                                soloNumeros(e.target.value, 10)
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS} htmlFor="extension-director">Extensión</label>

                                    <input
                                        id="extension-director"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]{1,6}"
                                        title="Introduce una extensión de hasta 6 dígitos."
                                        maxLength={6}
                                        className={INPUT_CLASS}
                                        placeholder="Ej. 1234"
                                        value={form.extension}
                                        onChange={(e) =>
                                            cambiarCampo(
                                                'extension',
                                                soloNumeros(e.target.value, 6)
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={cargando || !clues || (modo === 'nuevo' && estadoClues !== 'disponible')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10312B] px-6 py-4 font-bold text-white shadow-md transition-colors hover:bg-[#17483F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {cargando
                                ? 'Guardando información...'
                                : modo === 'editar' ? 'Guardar actualizaciones' : 'Registrar información'}
                        </button>
                    </form>
                )}

                {/* CONFIRMACIÓN FINAL */}
                {modo === 'confirmado' && (
                    <section className={`${SECTION_CLASS} text-center`}>

                        <CheckCircle2
                            className="mx-auto h-14 w-14 text-green-700"
                        />

                        <h2 className="text-xl font-black text-[#10312B]">
                            Registro recibido correctamente
                        </h2>

                        <p className="text-sm text-gray-600">
                            La información de la unidad médica se guardó
                            correctamente.
                        </p>

                        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-left">
                            <p className="text-sm text-green-900">
                                Hemos enviado un código de acceso al correo
                                electrónico registrado.
                            </p>

                            <p className="mt-3 text-sm font-semibold text-green-900">
                                Conserva este código, ya que será necesario
                                para realizar futuras actualizaciones.
                            </p>

                            <p className="mt-3 text-xs text-gray-600">
                                Si no encuentras el mensaje, revisa la carpeta
                                de Correo no deseado o Spam.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => reiniciar('actualizar')}
                            className="w-full rounded-lg bg-[#10312B] px-4 py-3 font-bold text-white hover:bg-[#17483F]"
                        >
                            Actualizar formulario
                        </button>

                    </section>
                )}
            </main>
        </div>
    );
}
