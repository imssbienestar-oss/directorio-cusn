import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/constants';
import HeaderOficial from '../components/HeaderOficial';

const Home = () => {
  const navigate = useNavigate();

  const handleIniciarDiagnostico = () => {
    const sesionActiva = localStorage.getItem('temp_diagnostico_unidad');
    if (sesionActiva) {
      navigate('/intervencion/formulario');
      return;
    }

    navigate('/intervencion/formulario');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      <HeaderOficial />

      <main className="flex-1 w-full flex items-center justify-center p-4 lg:p-8 relative">
        
        {/* Marca de agua institucional de fondo (visible solo en pantallas grandes) */}
        <div className="absolute inset-0 pointer-events-none hidden md:flex items-center justify-center opacity-[0.03]">
          <img
            src="/imss-bienestar-blanco.png" // Asegúrate de que esta imagen exista en tu carpeta public
            alt="Marca de agua"
            className="w-2/3 max-w-5xl"
            style={{ filter: 'invert(1)' }}
          />
        </div>

        {/* Contenedor Principal */}
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">

          {/* Columna Izquierda: Información y Propósito */}
          <div className="hidden md:flex flex-col gap-6 text-left pr-4">
            <div>
              <div className="inline-block px-3 py-1 bg-[#691C32]/10 rounded-md mb-4">
                <span className="text-xs font-black tracking-widest text-[#691C32] uppercase">
                  Unidad de Atención a la Salud
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 text-[#10312B] leading-[1.1]">
                Diagnóstico de Puestos y Procedimientos 
              </h1>
              <h2 className="text-xl text-gray-500 font-medium border-l-4 pl-4 border-[#BC955C]">
                IMSS-BIENESTAR
              </h2>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              Herramienta tecnológica para el levantamiento de operación real, construcción de descripciones de puestos y documentación de procedimientos en unidades médicas.
            </p>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-[#10312B] font-bold bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                <svg className="w-5 h-5 text-[#BC955C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Digitalización Segura
              </div>
              <div className="flex items-center gap-2 text-sm text-[#10312B] font-bold bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                <svg className="w-5 h-5 text-[#BC955C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Sincronización SIBE
              </div>
              <div className="flex items-center gap-2 text-sm text-[#10312B] font-bold bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                <svg className="w-5 h-5 text-[#BC955C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                Modo Offline Activo
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Ingreso de Inspector */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-[#10312B] relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              
              {/* Elemento decorativo */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#10312B]/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="text-center mb-8 relative z-10">
                <div className="bg-[#10312B]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10312B]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#691C32]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">
                  Iniciar Diagnóstico
                </h2>
                <p className="text-gray-500 text-sm">
                  Ingrese al portal para registrar una nueva unidad o continuar un levantamiento pendiente.
                </p>
              </div>

              <div className="relative z-10">
                <button
                  onClick={handleIniciarDiagnostico}
                  className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95 bg-gradient-to-r from-[#10312B] to-[#1e5c50] flex items-center justify-center gap-2 group-hover:from-[#0a201c] group-hover:to-[#10312B]"
                >
                  Configurar Inspección
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Home;
