
import React from 'react';

const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#BC955C]';

const labelClass =
    'block text-sm font-semibold text-gray-800 mb-1';

export default function CamposDirector({
    form,
    setForm,
    foto,
    setFoto
}) {
    const cambiar = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const cambiarLista = (campo, index, valor) => {
        setForm(prev => ({
            ...prev,
            [campo]: prev[campo].map((item, i) =>
                i === index ? valor : item
            )
        }));
    };

    const agregar = campo => {
        setForm(prev => ({
            ...prev,
            [campo]: [...prev[campo], '']
        }));
    };

    const quitar = (campo, index) => {
        setForm(prev => ({
            ...prev,
            [campo]: prev[campo].filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            <section className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold text-[#691C32]">
                    1. Datos del director
                </h2>

                <div>
                    <label className={labelClass}>
                        Nombre completo *
                    </label>
                    <input
                        required
                        maxLength={200}
                        className={inputClass}
                        value={form.nombre_director}
                        onChange={e => cambiar(
                            'nombre_director', e.target.value
                        )}
                    />
                </div>

                <div>
                    <label className={labelClass}>Cargo *</label>
                    <input
                        required
                        className={inputClass}
                        value={form.cargo}
                        onChange={e => cambiar(
                            'cargo', e.target.value
                        )}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Fotografía actualizada
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={inputClass}
                        onChange={e => setFoto(
                            e.target.files?.[0] || null
                        )}
                    />
                    {foto && (
                        <p className="mt-2 text-xs text-gray-500">
                            Archivo seleccionado: {foto.name}
                        </p>
                    )}
                    {form.foto_url && !foto && (
                        <img
                            src={form.foto_url}
                            alt="Fotografía registrada del director"
                            className="mt-3 w-28 h-32 object-cover rounded-lg border"
                        />
                    )}
                </div>
            </section>

            <section className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold text-[#691C32]">
                    2. Información relevante del hospital
                </h2>

                <div>
                    <label className={labelClass}>
                        Acciones relevantes para IMSS-BIENESTAR
                    </label>

                    {form.acciones_relevantes.map((accion, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <textarea
                                rows={2}
                                maxLength={1000}
                                className={inputClass}
                                placeholder="Describa una acción relevante..."
                                value={accion}
                                onChange={e => cambiarLista(
                                    'acciones_relevantes',
                                    i,
                                    e.target.value
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => quitar(
                                    'acciones_relevantes', i
                                )}
                                className="px-3 text-red-700 border rounded-lg"
                                aria-label="Eliminar acción"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => agregar('acciones_relevantes')}
                        className="text-sm font-bold text-[#10312B]"
                    >
                        + Agregar acción
                    </button>
                </div>

                <div>
                    <label className={labelClass}>
                        Datos relevantes del hospital
                    </label>
                    <textarea
                        rows={4}
                        maxLength={4000}
                        className={inputClass}
                        placeholder="Logros, indicadores, necesidades o información estratégica..."
                        value={form.datos_relevantes}
                        onChange={e => cambiar(
                            'datos_relevantes', e.target.value
                        )}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Compromisos y proyectos del hospital
                    </label>

                    {form.compromisos_proyectos.map((proyecto, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <textarea
                                rows={2}
                                maxLength={1000}
                                className={inputClass}
                                placeholder="Describa un compromiso o proyecto..."
                                value={proyecto}
                                onChange={e => cambiarLista(
                                    'compromisos_proyectos',
                                    i,
                                    e.target.value
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => quitar(
                                    'compromisos_proyectos', i
                                )}
                                className="px-3 text-red-700 border rounded-lg"
                                aria-label="Eliminar proyecto"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => agregar('compromisos_proyectos')}
                        className="text-sm font-bold text-[#10312B]"
                    >
                        + Agregar proyecto
                    </button>
                </div>
            </section>

            <section className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 space-y-4">
                <h2 className="text-lg font-bold text-[#691C32]">
                    3. Datos de contacto
                </h2>

                <div>
                    <label className={labelClass}>
                        Correo institucional *
                    </label>
                    <input
                        type="email"
                        required
                        maxLength={200}
                        className={inputClass}
                        value={form.correo_institucional}
                        onChange={e => cambiar(
                            'correo_institucional', e.target.value
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="tel"
                            maxLength={30}
                            className={inputClass}
                            value={form.telefono}
                            onChange={e => cambiar(
                                'telefono', e.target.value
                            )}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Extensión</label>
                        <input
                            maxLength={15}
                            className={inputClass}
                            value={form.extension}
                            onChange={e => cambiar(
                                'extension', e.target.value
                            )}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
