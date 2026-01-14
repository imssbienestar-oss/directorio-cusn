import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from "react-qr-code";
import personalData from '../data/personal.json';
import { COLORS } from '../utils/constants';

function PerfilFuncionario() {
  const { slug } = useParams();
  const person = personalData.find(p => p.slug === slug);
  const [showQr, setShowQr] = useState(false);

  if (!person) return <div className="p-10 text-center text-red-800 font-bold">Funcionario no encontrado.</div>;

  const descargarVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${person.nombre} ${person.apellidos}
ORG:IMSS Bienestar;${person.area}
TITLE:${person.puesto}
TEL;TYPE=CELL:${person.telefono}
EMAIL:${person.correo}
URL:${window.location.href}
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
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Cancelado'); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 relative">
      <div className="absolute top-0 w-full h-64 z-0" style={{ backgroundColor: COLORS.verde }}></div>

      <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden z-10 relative animate-fade-in-up">

        {/* CABECERA */}
        <div className="relative overflow-hidden">
          <div className="w-full h-14 flex items-center justify-between px-4 relative z-20" style={{ backgroundColor: COLORS.guinda }}>
            <img src="/fotos/gobierno.png" alt="Logo Institucional" className="h-8 object-contain" />
            <button onClick={() => setShowQr(true)} className="text-white p-2 rounded-full hover:bg-white/10 transition-all" title="Compartir Tarjeta">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            </button>
          </div>
          <div className="h-20 relative" style={{ backgroundColor: COLORS.verde }}>
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: COLORS.dorado }}></div>
          </div>
        </div>

        {/* INFO PERSONA */}
        <div className="px-6 flex flex-col items-center">
          <div className="-mt-16 mb-4 p-2 bg-white rounded-full shadow-lg relative z-10">
            <img src={person.foto} alt={person.nombre} className="w-32 h-32 rounded-full object-cover bg-gray-200" />
          </div>

          <div className="text-center w-full border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {person.nombre} <br />
              <span className="inline-flex items-center gap-1">
                {person.apellidos}
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </span>
            </h1>
            <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full uppercase tracking-wider shadow-sm" style={{ backgroundColor: COLORS.guinda }}>
              {person.puesto}
            </span>
            <p className="text-sm text-gray-500 mt-3 font-medium">{person.area}</p>
            {person.cv && (
              <a href={person.cv} target="_blank" rel="noreferrer" className="block w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 hover:underline py-1 mt-1">
                📄 Ver Semblanza Curricular (PDF)
              </a>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="p-6 space-y-3 bg-gray-50">
          <button onClick={descargarVCard} className="w-full py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 font-bold transform hover:-translate-y-1">
            💾 Guardar Contacto
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <a href={`https://wa.me/52${person.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 transition-all shadow-sm">
              <span className="text-2xl mb-1">💬</span><span className="text-[10px] font-bold uppercase">WhatsApp</span>
            </a>
            <a href={`tel:${person.telefono}`} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
              <span className="text-2xl mb-1">📞</span><span className="text-[10px] font-bold uppercase">Llamar</span>
            </a>
          </div>

          <a href={`mailto:${person.correo}`} className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-red-800 transition-all group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 shadow-sm shrink-0" style={{ backgroundColor: COLORS.guinda }}>✉️</div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Correo Institucional</p>
              <p className="text-gray-800 font-medium truncate group-hover:text-red-900 text-sm">{person.correo}</p>
            </div>
          </a>

          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.ubicacion)}`} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 transition-all group">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600">📍</div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold group-hover:text-blue-600">Ubicación</p>
              <p className="text-gray-800 font-medium text-sm group-hover:text-blue-800">{person.ubicacion}</p>
            </div>
          </a>
        </div>

        <div className="p-4 bg-gray-100 text-center border-t border-gray-200">
          <Link to="/" className="text-xs font-bold text-gray-500 hover:text-green-800 transition-colors">← Volver al Directorio</Link>
        </div>
      </div>

      {/* MODAL QR */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl">✕</button>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Compartir Perfil</h3>
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-6 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <QRCode value={window.location.href} size={180} fgColor="#000000" bgColor="#FFFFFF" level="Q" />
            </div>
            <button onClick={compartirPerfil} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
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

export default PerfilFuncionario;