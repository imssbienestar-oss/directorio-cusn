import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom'; // <--- IMPORTANTE: Asegúrate de importar NavLink arriba
import personalData from './data/personal.json';
import QRCode from "react-qr-code";

// --- PALETA DE COLORES OFICIAL (Extraída de tu imagen) ---
const COLORS = {
  guinda: '#691C32',    // Barra superior "Gobierno de México"
  verde: '#10312B',     // Barra navegación "IMSS Bienestar"
  dorado: '#DDC9A3',    // Detalles y separadores
  crema: '#FDFBF7',     // Fondo suave
  texto: '#333333'
};

// --- HEADER ---
const HeaderOficial = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para abrir/cerrar menú

  return (
    <header className="shadow-md sticky top-0 z-50 bg-white">

      {/* 1. Barra Superior: Gobierno (Guinda) */}
      <div className="py-2 px-4" style={{ backgroundColor: COLORS.guinda }}>
      <div className="container mx-auto flex items-center gap-3">
        <img
          src="/fotos/gobierno.png"
          alt="Escudo"
          className="h-10 md:h-12 object-contain" // Ajusta la altura (h-6 es pequeño, h-8 mediano)
        />
      </div>
    </div>

      {/* 2. Barra Principal: IMSS Bienestar (Verde) */}
      <div className="relative" style={{ backgroundColor: COLORS.verde }}>
        {/* Decoración fondo */}
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-white transform skew-x-12 pointer-events-none"></div>

        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center justify-between">

            {/* LADO IZQUIERDO: LOGO Y TEXTO */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="border-r border-white/20 pr-4 mr-2 shrink-0">
                <h1 className="text-white font-bold text-2xl leading-none tracking-tight group-hover:opacity-90 transition-opacity">IMSS</h1>
                <p className="text-white text-[10px] tracking-widest group-hover:opacity-90 transition-opacity">BIENESTAR</p>
              </div>
              <div>
                <h2 className="text-white text-sm md:text-lg font-light opacity-90">Coordinación de Unidades de Segundo Nivel</h2>
                <p className="text-yellow-100 text-xs">Servicios Públicos de Salud</p> </div>
            </Link>

            {/* --- MENÚ DE ESCRITORIO (Visible solo en md o superior) --- */}
            <nav className="hidden md:flex items-center gap-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all border ${isActive ? 'bg-white text-green-900 border-white shadow-md' : 'text-white border-transparent hover:bg-white/10'
                  }`
                }
              >
                Directorio
              </NavLink>
              <NavLink
                to="/informativas"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all border ${isActive ? 'bg-white text-green-900 border-white shadow-md' : 'text-white border-transparent hover:bg-white/10'
                  }`
                }
              >
                Avisos
              </NavLink>
            </nav>

            {/* --- BOTÓN HAMBURGUESA (Visible solo en celular) --- */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none"
            >
              {isMenuOpen ? (
                // Icono X (Cerrar)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icono Hamburguesa (Abrir)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

          {/* --- MENÚ DESPLEGABLE MÓVIL (Se muestra si isMenuOpen es true) --- */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-2 pb-2 animate-fade-in-down">
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer click
                className={({ isActive }) =>
                  `block w-full text-center px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${isActive ? 'bg-white text-green-900 shadow-md' : 'text-white bg-green-900/40 hover:bg-white/10'
                  }`
                }
              >
                Directorio
              </NavLink>

              <NavLink
                to="/informativas"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full text-center px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${isActive ? 'bg-white text-green-900 shadow-md' : 'text-white bg-green-900/40 hover:bg-white/10'
                  }`
                }
              >
                Avisos y Comunicados
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* 3. Línea Dorada */}
      <div className="h-1 w-full" style={{ backgroundColor: COLORS.dorado }}></div>
    </header>
  );
};

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
  const [showQr, setShowQr] = useState(false);

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

  const compartirPerfil = async () => {
    const shareData = {
      title: `Tarjeta Digital: ${person.nombre} ${person.apellidos}`,
      text: `Te comparto el contacto oficial de ${person.nombre} ${person.apellidos} - IMSS Bienestar`,
      url: window.location.href,
    };

    // Verificamos si el navegador soporta compartir nativo (Celulares)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Cancelado por el usuario');
      }
    } else {
      // Fallback para PC de escritorio: Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles (Tu dispositivo no tiene menú de compartir)");
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 relative">

      {/* Fondo verde */}
      <div className="absolute top-0 w-full h-64 z-0" style={{ backgroundColor: COLORS.verde }}></div>

      <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden z-10 relative animate-fade-in-up">

        {/* Cabecera */}
        <div className="relative overflow-hidden">

          {/* 1. Franja Guinda Superior (Para el Logo) */}
          <div className="w-full h-14 flex items-center justify-between px-4 relative z-20" style={{ backgroundColor: COLORS.guinda }}>
            {/* AQUÍ VA TU LOGO (Asegúrate de tener la imagen en public) */}
            <img
              src="/fotos/gobierno.png" /* <--- Cambia esto por la ruta de tu logo blanco */
              alt="Logo Institucional"
              className="h-10 md:h-12 object-contain"
            />

            {/* Botón Compartir (Ahora alineado en la franja) */}
            <button
              onClick={() => setShowQr(true)}
              className="text-white p-2 rounded-full hover:bg-white/10 transition-all"
              title="Compartir Tarjeta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </button>
          </div>

          {/* 2. Área Verde (Resto de la decoración) */}
          <div className="h-20 relative" style={{ backgroundColor: COLORS.verde }}>
            {/* Decoración dorada */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: COLORS.dorado }}></div>
          </div>
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

          {person.cv && (
            <a
              href={person.cv}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 hover:underline py-1"
            >
              📄 Ver Semblanza Curricular (PDF)
            </a>
          )}

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

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl"
            >✕</button>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Compartir Perfil</h3>
            <p className="text-sm text-gray-500 mb-6">Escanea para abrir el contacto</p>

            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6">
              {/* EL CÓDIGO QR SE GENERA AQUÍ AUTOMÁTICAMENTE */}
              <QRCode
                value={window.location.href}
                size={180}
                fgColor="#000000"
                bgColor="#FFFFFF"
                level="Q"
              />
            </div>

            <button
              onClick={compartirPerfil}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {/* Icono de compartir genérico */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir Tarjeta
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 opacity-50 grayscale flex gap-4">
        <span className="text-xs font-bold text-gray-500">IMSS BIENESTAR 2026</span>
      </div>

    </div>
  );
}

function TarjetasInformativas() {
  // Datos de ejemplo (Simulando tu JSON)
  const avisos = [
    {
      id: 1,
      titulo: "Campaña de Vacunación 2026",
      fecha: "14 Ene 2026",
      descripcion: "Se inicia la campaña de refuerzo contra la Influenza estacional en todas las unidades médicas.",
      tipo: "Aviso", // Etiqueta
      imagen: "https://images.unsplash.com/photo-1632053001852-6b9442082213?auto=format&fit=crop&q=80&w=500" // Foto genérica
    },
    {
      id: 2,
      titulo: "Mantenimiento de Servidores",
      fecha: "20 Ene 2026",
      descripcion: "El sistema de expediente clínico estará en mantenimiento de 02:00 a 04:00 AM.",
      tipo: "Sistemas",
      imagen: null // Sin imagen (solo texto)
    },
    {
      id: 3,
      titulo: "Nuevo Protocolo de Urgencias",
      fecha: "10 Ene 2026",
      descripcion: "Descarga el nuevo manual operativo para la clasificación de pacientes en Triage.",
      tipo: "Protocolo",
      link: "#", // Aquí podrías poner un PDF
      linkTexto: "Descargar PDF"
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* Reutilizamos el Header Oficial */}
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tablero Informativo</h1>
        <p className="text-gray-500 mb-8">Comunicados y avisos oficiales de la Coordinación.</p>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">

              {/* Imagen (Opcional) */}
              {aviso.imagen && (
                <div className="h-40 overflow-hidden">
                  <img src={aviso.imagen} alt={aviso.titulo} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {aviso.tipo}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{aviso.fecha}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{aviso.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{aviso.descripcion}</p>

                {/* Botón de acción (si tiene link) */}
                {aviso.link && (
                  <a href={aviso.link} className="text-sm font-bold text-red-800 hover:text-red-900 flex items-center gap-1 mt-auto">
                    {aviso.linkTexto || "Leer más"} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// --- RUTAS PRINCIPALES ---
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Directorio />} />
        <Route path="/informativas" element={<TarjetasInformativas />} />
        <Route path="/perfil/:slug" element={<PerfilFuncionario />} />
      </Routes>
    </HashRouter>
  );
}

export default App;