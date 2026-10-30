import React from 'react';
import HeaderOficial from '../components/HeaderOficial';

function TarjetasInformativasPublicas() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative overflow-hidden">
      <HeaderOficial />

      {/* Marca de agua de fondo (Opcional, igual que en el home) */}
      <div className="absolute inset-0 pointer-events-none hidden md:flex items-center justify-center opacity-[0.03] z-0">
        <img
          src="/imss-bienestar-blanco.png"
          alt="Marca de agua"
          className="w-1/2 max-w-3xl"
          style={{ filter: 'invert(1)' }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-t-8 border-[#691C32] max-w-md w-full text-center relative overflow-hidden group">
          
          {/* Elemento decorativo sutil en la esquina */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-[#691C32]/10 to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          {/* Icono de Candado / Seguridad */}
          <div className="bg-[#10312B]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#10312B]/10 shadow-sm relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#10312B]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            {/* Pequeño punto indicador de estado */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#691C32] rounded-full border-2 border-white"></div>
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">
            Acceso Restringido
          </h2>
          
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Por motivos de seguridad institucional, <strong className="text-gray-800">se requiere usuario y contraseña</strong> para visualizar la información del Directorio de Unidades Médicas.
          </p>

          <div className="flex flex-col gap-5">
            {/* Botón hacia el SIBE */}
            <a 
              href="https://sibe.cusn.mx/login" 
              className="w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95 bg-gradient-to-r from-[#10312B] to-[#1e5c50] flex items-center justify-center gap-3 group-hover:from-[#0a201c] group-hover:to-[#10312B]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Iniciar Sesión en SIBE
            </a>

            {/* Separador y Contacto de Soporte */}
            <div className="mt-2 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">¿Necesitas solicitar acceso?</p>
              
              <a 
                href="mailto:irving.hernandez@imssbienestar.gob.mx?subject=Solicitud%20de%20acceso%20al%20Directorio%20SIBE" 
                className="inline-flex items-center justify-center gap-2 text-[#691C32] font-bold text-sm hover:underline hover:text-[#521526] transition-colors bg-[#691C32]/5 py-2.5 px-4 rounded-lg w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                Contactar a Soporte
              </a>
              <p className="text-[11px] text-gray-400 mt-2 font-mono">irving.hernandez@imssbienestar.gob.mx</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TarjetasInformativasPublicas;
