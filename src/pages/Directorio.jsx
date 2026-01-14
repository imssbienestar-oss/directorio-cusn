import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderOficial from '../components/HeaderOficial'; // Importamos el componente Header
import personalData from '../data/personal.json';
import { COLORS } from '../utils/constants';

function Directorio() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersonal = personalData.filter(person => {
    const fullName = `${person.nombre} ${person.apellidos}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: COLORS.crema }}>
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10 max-w-2xl mx-auto">
          <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Buscar personal:</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Escribe el nombre o apellido..."
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none transition-colors text-lg"
              style={{ caretColor: COLORS.verde }}
              onFocus={(e) => e.target.style.borderColor = COLORS.verde}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-4 text-gray-400 text-xl">🔍</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPersonal.map((person) => (
            <Link 
              to={`/perfil/${person.slug}`} 
              key={person.id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group flex border border-gray-100"
            >
              <div className="w-2" style={{ backgroundColor: COLORS.verde }}></div>
              <div className="p-5 flex items-center gap-4 w-full">
                <img 
                  src={person.foto} 
                  alt="Foto" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-green-700 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate text-lg group-hover:text-green-800 transition-colors">
                    {person.nombre} {person.apellidos}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wide mt-1" style={{ color: COLORS.guinda }}>
                    {person.puesto}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{person.area}</p>
                </div>
                <div className="text-gray-300 group-hover:text-green-700 transform group-hover:translate-x-1 transition-all">
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