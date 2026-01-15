import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderOficial from '../components/HeaderOficial';
import personalData from '../data/personal.json';
import { COLORS } from '../utils/constants';

function Directorio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPuesto, setFilterPuesto] = useState('');

  // --- Jerarquia Puestos ---
  const ordenJerarquia = [
    "Titular de la Coordinación de Unidades de Segundo Nivel",
    "Titular de División",
    "Subdirección de área",
    "Jefe de Área Médica",
    "Jefatura de departamento",
    "Lider de Proyecto",
    "Supervisor de Procesos"
  ];

  // --- 2. OBTENER Y ORDENAR PUESTOS ---
  const puestosUnicos = [...new Set(personalData.map(p => p.puesto))].sort((a, b) => {
    // Buscamos en qué posición de la lista maestra está cada puesto
    let indexA = ordenJerarquia.indexOf(a);
    let indexB = ordenJerarquia.indexOf(b);

    // Si un puesto no está en la lista (ej. uno nuevo), lo mandamos al final (999)
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;

    // Ordenamos de menor a mayor índice (0 es el más importante)
    return indexA - indexB;
  });

  // 3. LÓGICA DE FILTRADO (Igual que antes)
  const filteredPersonal = personalData.filter(person => {
    const fullName = `${person.nombre} ${person.apellidos}`.toLowerCase();
    const matchesText = fullName.includes(searchTerm.toLowerCase());
    const matchesPuesto = filterPuesto === '' || person.puesto === filterPuesto;
    return matchesText && matchesPuesto;
  });

  // --- 4. ORDENAR TAMBIÉN LAS TARJETAS (Opcional pero recomendado) ---
  // Esto hace que, si no buscas a nadie, las tarjetas aparezcan ordenadas por rango y no revueltas
  const personalOrdenado = [...filteredPersonal].sort((a, b) => {
    let indexA = ordenJerarquia.indexOf(a.puesto);
    let indexB = ordenJerarquia.indexOf(b.puesto);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.crema }}>
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Directorio Oficial CUSN</h1>
          <p className="text-gray-500">Consulta los contactos de la Coordinación de Unidades de Segundo Nivel.</p>
        </div>

        {/* --- BARRA DE CONTROL --- */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
                
                {/* Buscador */}
                <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all uppercase placeholder:normal-case"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                </div>

                {/* Filtro de Puesto */}
                <div className="flex-1 md:max-w-xs relative">
                    <select
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-800 focus:ring-1 focus:ring-green-800 bg-white text-gray-700 appearance-none cursor-pointer"
                        value={filterPuesto}
                        onChange={(e) => setFilterPuesto(e.target.value)}
                    >
                        <option value="">Todos los puestos</option>
                        {puestosUnicos.map((puesto) => (
                            <option key={puesto} value={puesto}>{puesto}</option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-4 text-gray-400 pointer-events-none text-xs">▼</span>
                </div>
            </div>

            {/* Contadores */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span>
                    Directorio Total: <span className="text-gray-600">{personalData.length} Personas</span>
                </span>
                
                {(searchTerm !== '' || filterPuesto !== '') && (
                    <span className={filteredPersonal.length > 0 ? "text-green-700" : "text-red-500"}>
                        {filteredPersonal.length} Resultados
                    </span>
                )}
            </div>
        </div>

        {/* --- GRID DE TARJETAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          {personalOrdenado.length === 0 && (
             <div className="col-span-full text-center py-10 opacity-50">
                <p className="text-xl font-bold">No se encontraron funcionarios</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
             </div>
          )}

          {/* OJO: Aquí cambié 'filteredPersonal' por 'personalOrdenado' para que las tarjetas salgan en orden */}
          {personalOrdenado.map((person) => (
            <Link 
              to={`/perfil/${person.slug}`} 
              key={person.id}
             className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group flex border border-gray-100 h-full relative"
            >
              <div className="w-3 shrink-0" style={{ backgroundColor: COLORS.verde }}></div>
              <div className="p-4 flex items-center gap-4 w-full overflow-hidden">
                <div className="shrink-0 relative"> 
                    <img 
                      src={person.foto} 
                      alt={person.nombre} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 group-hover:border-green-700 transition-colors bg-gray-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 -z-10 text-xs font-bold text-gray-400">
                        {person.nombre.charAt(0)}{person.apellidos.charAt(0)}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate text-base group-hover:text-green-800 transition-colors leading-tight">
                    {person.nombre} {person.apellidos}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-1 truncate" style={{ color: COLORS.guinda }}>
                    {person.puesto}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{person.area}</p>
                </div>
                
                <div className="text-gray-300 group-hover:text-green-700 transform group-hover:translate-x-1 transition-all shrink-0">
                  ➔
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Directorio;