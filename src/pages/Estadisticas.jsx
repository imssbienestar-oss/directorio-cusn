import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HeaderOficial from '../components/HeaderOficial';
import cluesData from '../data/clues.json'; 
import { COLORS } from '../utils/constants';

function Estadisticas() {
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');

  // LISTA DE ENTIDADES ÚNICAS 
  const entidadesUnicas = [...new Set(cluesData.map(item => item.entidad))].sort();

  // FILTRAR DATOS
  const datosFiltrados = useMemo(() => {
    if (filtroEntidad === 'TODAS') return cluesData;
    return cluesData.filter(item => item.entidad === filtroEntidad);
  }, [filtroEntidad]);

  // Filtrado por Tipologia
  const dataTipologia = useMemo(() => {
    const conteo = {};
    datosFiltrados.forEach(item => {
      const tipo = item.tipologia || "NO ESPECIFICADO"; 
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    
    return Object.keys(conteo)
      .map(key => ({ name: key, value: conteo[key] }))
      .sort((a, b) => b.value - a.value); // <--- ESTO ORDENA LA LISTA
  }, [datosFiltrados]);

  const totalUnidadesFiltradas = dataTipologia.reduce((acc, item) => acc + item.value, 0);

  // 
  const dataNivel = useMemo(() => {
    const conteo = {};
    datosFiltrados.forEach(item => {
      const nivel = item.nivel || "Sin Nivel";
      conteo[nivel] = (conteo[nivel] || 0) + 1;
    });
    return Object.keys(conteo).map(key => ({ name: key, value: conteo[key] }));
  }, [datosFiltrados]);

  // Colores para las gráficas (Paleta Institucional + Complementarios)
  const PALETA_GRAFICAS = [COLORS.guinda, COLORS.verde, '#DDC9A3', '#2C3E50', '#E67E22', '#8E44AD'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />
      
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* ENCABEZADO Y FILTRO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tablero de Mando</h1>
            <p className="text-gray-500">Análisis estratégico de la infraestructura médica.</p>
          </div>

          {/* SELECTOR DE ENTIDAD (El control maestro) */}
          <div className="w-full md:w-64">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Filtrar por Entidad:</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-800 outline-none font-bold text-gray-700"
              value={filtroEntidad}
              onChange={(e) => setFiltroEntidad(e.target.value)}
            >
              <option value="TODAS">NIVEL NACIONAL (TODO)</option>
              {entidadesUnicas.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- TARJETAS KPI (INDICADORES CLAVE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-800">
            <p className="text-gray-400 font-bold uppercase text-xs">Universo Total</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{datosFiltrados.length}</p>
            <p className="text-sm text-gray-500 mt-2">Unidades Médicas</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-800">
             <p className="text-gray-400 font-bold uppercase text-xs">Entidad Seleccionada</p>
             <p className="text-2xl font-bold text-gray-800 mt-1 truncate">
               {filtroEntidad === 'TODAS' ? 'Nacional' : filtroEntidad}
             </p>
             <p className="text-sm text-gray-500 mt-2">Cobertura Actual</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8" style={{ borderColor: COLORS.dorado }}>
             <p className="text-gray-400 font-bold uppercase text-xs">Tipología Predominante</p>
             <p className="text-xl font-bold text-gray-800 mt-1 truncate">
                {dataTipologia.length > 0 ? dataTipologia.sort((a,b) => b.value - a.value)[0].name : "N/A"}
             </p>
             <p className="text-sm text-gray-500 mt-2">Mayor presencia</p>
          </div>
        </div>

        {/* --- SECCIÓN DE GRÁFICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* GRÁFICA 1: TIPOLOGÍA (PASTEL) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">Distribución por Tipo de Unidad</h3>
            <div className="h-[500px] w-full"> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataTipologia}
                    cx="50%"
                    cy="40%" // Subimos el pastel para dejar MUCHO espacio abajo a la lista
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    // Etiqueta interna limpia (solo % si cabe)
                    label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : null}
                  >
                    {dataTipologia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETA_GRAFICAS[index % PALETA_GRAFICAS.length]} />
                    ))}
                  </Pie>
                  
                  <Tooltip 
                    formatter={(value) => [value, "Unidades"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />

                  {/* AQUÍ ESTÁ EL TRUCO DEL FORMATO */}
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: "20px" }} // Separación del pastel
                    formatter={(value, entry) => {
                        // entry.payload.value es la cantidad (ej. 50)
                        // Calculamos el porcentaje real
                        const percent = ((entry.payload.value / totalUnidadesFiltradas) * 100).toFixed(0);
                        
                        // Retornamos: "36% - NOMBRE" en negritas el número
                        return (
                            <span className="text-gray-600 text-xs font-medium ml-1 mr-4">
                                <span className="font-bold text-gray-800">{percent}%</span> {value}
                            </span>
                        );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICA 2: NIVEL DE ATENCIÓN (BARRAS) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">Unidades por Nivel de Atención</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataNivel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill={COLORS.verde} radius={[4, 4, 0, 0]} name="Cantidad">
                    {/* Truco: Pintar cada barra de un color distinto si quieres */}
                     {dataNivel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.verde : COLORS.guinda} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* TABLA DE DETALLE RÁPIDO */}
        <div className="mt-10 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
            Desglose Numérico - {filtroEntidad === 'TODAS' ? 'Nacional' : filtroEntidad}
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
             {dataTipologia.map((item) => (
               <div key={item.name} className="flex justify-between items-center border-b border-gray-100 pb-2">
                 <span className="text-sm text-gray-600 font-medium">{item.name}</span>
                 <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">{item.value}</span>
               </div>
             ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default Estadisticas;