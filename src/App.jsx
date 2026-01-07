import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import personalData from './data/personal.json';

// --- PALETA DE COLORES OFICIAL (Extraída de tu imagen) ---
const COLORS = {
  guinda: '#691C32',    // Barra superior "Gobierno de México"
  verde: '#10312B',     // Barra navegación "IMSS Bienestar"
  dorado: '#DDC9A3',    // Detalles y separadores
  crema: '#FDFBF7',     // Fondo suave
  texto: '#333333'
};

// --- HEADER ---
const HeaderOficial = () => (
  <header className="shadow-md">
    {/* LOGO */}
    <div className="py-2 px-4" style={{ backgroundColor: COLORS.guinda }}>
      <div className="container mx-auto flex items-center gap-3">
        <img
          src="/fotos/gobierno.png"
          alt="Escudo"
          className="h-10 md:h-12 object-contain" // Ajusta la altura (h-6 es pequeño, h-8 mediano)
        />
      </div>
    </div>

    {/* Barra Inferior: IMSS Bienestar (Verde Institucional) */}
    <div className="py-4 px-4 relative overflow-hidden" style={{ backgroundColor: COLORS.verde }}>
      {/* Decoración curva dorada sutil en el fondo */}
      <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-white transform skew-x-12"></div>

      <div className="container mx-auto flex items-center gap-4">
        {/* Logo Simulado (Texto por ahora) */}
        <div className="border-r border-white/20 pr-4 mr-2">
          <h1 className="text-white font-bold text-2xl leading-none tracking-tight">IMSS</h1>
          <p className="text-white text-[10px] tracking-widest">BIENESTAR</p>
        </div>
        <div>
          <h2 className="text-white text-sm md:text-lg font-light opacity-90">Coordinación de Unidades de Segundo Nivel</h2>
          <p className="text-yellow-100 text-xs">Servicios Públicos de Salud</p>
        </div>
      </div>
    </div>

    {/* Línea Dorada Final */}
    <div className="h-2 w-full" style={{ backgroundColor: COLORS.dorado }}></div>
  </header>
);

// --- COMPONENTE 2: EL DIRECTORIO (PÁGINA PRINCIPAL) ---
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
        {/* Buscador Estilizado */}
        <div className="mb-10 max-w-2xl mx-auto">
          <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Buscar personal:</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Escribe el nombre o apellido..."
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none transition-colors text-lg"
              style={{ caretColor: COLORS.verde }} // Cursor verde
              // Truco para cambiar el color del borde al enfocar usando style dinámico
              onFocus={(e) => e.target.style.borderColor = COLORS.verde}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-4 text-gray-400 text-xl">🔍</span>
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPersonal.map((person) => (
            <Link
              to={`/perfil/${person.slug}`}
              key={person.id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group flex border border-gray-100"
            >
              {/* Barra lateral de color según área (Decorativo) */}
              <div className="w-2" style={{ backgroundColor: COLORS.verde }}></div>

              <div className="p-5 flex items-center gap-4 w-full">
                <img
                  src={person.foto}
                  alt="Foto"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-green-700 transition-colors"
                />
                <div className="flex-1 min-w-0"> {/* min-w-0 evita que el texto rompa el flex */}
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

// --- COMPONENTE 3: LA TARJETA DEL QR (PERFIL INDIVIDUAL) ---
function PerfilFuncionario() {
  const { slug } = useParams();
  const person = personalData.find(p => p.slug === slug);

  if (!person) return <div className="p-10 text-center text-red-800 font-bold">Funcionario no encontrado.</div>;

  // --- FUNCIÓN MÁGICA PARA GUARDAR CONTACTO ---
  const descargarVCard = () => {
    // Estructura estándar vCard
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${person.nombre} ${person.apellidos}
ORG:IMSS Bienestar;${person.area}
TITLE:${person.puesto}
TEL;TYPE=CELL:${person.telefono}
EMAIL:${person.correo}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${person.nombre}_${person.apellidos}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 relative">

      {/* Fondo verde */}
      <div className="absolute top-0 w-full h-64 z-0" style={{ backgroundColor: COLORS.verde }}></div>

      <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden z-10 relative animate-fade-in-up">

        {/* Cabecera */}
        <div className="h-32 relative overflow-hidden" style={{ backgroundColor: COLORS.verde }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: COLORS.dorado }}></div>
          <div className="absolute left-4 top-4 text-white/90 text-sm font-light tracking-widest">TARJETA DIGITAL</div>
        </div>

        {/* Foto y Nombre */}
        <div className="px-6 flex flex-col items-center">
          <div className="-mt-16 mb-4 p-1 bg-white rounded-full shadow-lg relative z-10">
            <img
              src={person.foto}
              alt={person.nombre}
              className="w-32 h-32 rounded-full object-cover bg-gray-200"
            />
          </div>

          <div className="text-center w-full pb-6">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {person.nombre} <br /> {person.apellidos}
            </h1>
            <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wider shadow-sm" style={{ backgroundColor: COLORS.guinda }}>
              {person.puesto}
            </span>
            <p className="text-sm text-gray-500 mt-3 font-medium">{person.area}</p>

            {/* NUEVO: Horario de Atención */}
            <div className="mt-3 text-xs text-gray-400 bg-gray-50 py-1 px-3 rounded-full inline-flex items-center gap-1">
              🕒 Lun-Vie: 09:00 - 19:00 hrs
            </div>
          </div>
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="p-6 space-y-3 bg-gray-50 border-t border-gray-100">

          {/* 1. BOTÓN ESTRELLA: GUARDAR CONTACTO */}
          <button
            onClick={descargarVCard}
            className="w-full py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 font-bold transform hover:-translate-y-1"
          >
            💾 Guardar Contacto
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* 2. WHATSAPP (Si tienes el dato en el JSON) */}
            <a href={`https://wa.me/52${person.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 transition-all shadow-sm">
              <span className="text-2xl mb-1">💬</span>
              <span className="text-[10px] font-bold uppercase">WhatsApp</span>
            </a>

            {/* LLAMAR */}
            <a href={`tel:${person.telefono}`} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
              <span className="text-2xl mb-1">📞</span>
              <span className="text-[10px] font-bold uppercase">Llamar</span>
            </a>
          </div>

          {/* CORREO (Barra completa) */}
          <a href={`mailto:${person.correo}`} className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-red-800 transition-all group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 shadow-sm shrink-0" style={{ backgroundColor: COLORS.guinda }}>
              ✉️
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Correo Institucional</p>
              <p className="text-gray-800 font-medium truncate group-hover:text-red-900 text-sm">{person.correo}</p>
            </div>
          </a>

          {/* UBICACIÓN */}
          <a
            href={person.link_mapa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.ubicacion)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              📍
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold group-hover:text-blue-600 transition-colors">Ubicación (Ver Mapa)</p>
              <p className="text-gray-800 font-medium text-sm group-hover:text-blue-800 transition-colors">
                {person.ubicacion}
              </p>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
          <Link to="/" className="text-xs font-bold text-gray-500 hover:text-green-800 transition-colors">
            ← Volver al Directorio
          </Link>
        </div>
      </div>

      <div className="mt-8 opacity-50 grayscale flex gap-4">
        <span className="text-xs font-bold text-gray-500">IMSS BIENESTAR 2026</span>
      </div>

    </div>
  );
}

// --- RUTAS PRINCIPALES ---
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Directorio />} />
        <Route path="/perfil/:slug" element={<PerfilFuncionario />} />
      </Routes>
    </HashRouter>
  );
}

export default App;