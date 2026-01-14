import React from 'react';
import HeaderOficial from '../components/HeaderOficial';

function TarjetasInformativas() {
  const avisos = [
    {
      id: 1,
      titulo: "Campaña de Vacunación 2026",
      fecha: "14 Ene 2026",
      descripcion: "Se inicia la campaña de refuerzo contra la Influenza estacional en todas las unidades médicas.",
      tipo: "Aviso",
      imagen: "https://images.unsplash.com/photo-1632053001852-6b9442082213?auto=format&fit=crop&q=80&w=500"
    },
    {
      id: 2,
      titulo: "Mantenimiento de Servidores",
      fecha: "20 Ene 2026",
      descripcion: "El sistema de expediente clínico estará en mantenimiento de 02:00 a 04:00 AM.",
      tipo: "Sistemas",
      imagen: null
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <HeaderOficial />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tablero Informativo</h1>
        <p className="text-gray-500 mb-8">Comunicados y avisos oficiales de la Coordinación.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
              {aviso.imagen && (
                <div className="h-40 overflow-hidden">
                  <img src={aviso.imagen} alt={aviso.titulo} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{aviso.tipo}</span>
                  <span className="text-xs text-gray-400 font-medium">{aviso.fecha}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{aviso.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{aviso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default TarjetasInformativas;