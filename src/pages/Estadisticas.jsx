import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import HeaderOficial from '../components/HeaderOficial';
import { COLORS } from '../utils/constants';

function Estadisticas() {
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');
  const [cluesData, setCluesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. CONFIGURACIÓN DE CONEXIONES ---

  const API_SIBE_URL = "https://torre-control-production.up.railway.app/api/unidades/publico";
  // B. TU EXCEL DE PDFS (El que ya tenías)
  const LINKS_PDF_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  // --- 2. CARGA DE DATOS HÍBRIDA (Backend + Excel) ---
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // PASO A: Pedir datos a tu Base de Datos (SIBE)
        const respuestaApi = await fetch(API_SIBE_URL);
        if (!respuestaApi.ok) {
          throw new Error(`Error en API SIBE: ${respuestaApi.statusText}`);
        }
        const dataBaseDatos = await respuestaApi.json();

        // PASO B: Pedir Links al Excel (CSV)
        const promesaExcel = new Promise((resolve, reject) => {
          Papa.parse(LINKS_PDF_URL, {
            download: true,
            header: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
          });
        });
        const dataExcel = await promesaExcel;

        // PASO C: LA FUSIÓN (Merge) 🧬
        // 1. Creamos un mapa rápido del Excel para buscar por CLUES
        const mapaPDFs = {};
        dataExcel.forEach(row => {
          if (row.clues) {
            mapaPDFs[row.clues.trim().toUpperCase()] = {
              link: row.link_pdf,
              fecha: row.fecha
            };
          }
        });

        // 2. Recorremos los datos de SIBE y les pegamos la info del Excel
        const datosFusionados = dataBaseDatos.map(unidad => {
          // Normalizamos la CLUES para asegurar que coincida (mayúsculas, sin espacios)
          const cluesLimpia = unidad.clues ? unidad.clues.trim().toUpperCase() : '';
          const infoExtra = mapaPDFs[cluesLimpia] || {};

          return {
            ...unidad, // Trae: nombre, municipio, tipologia, nivel, entidad
            link_pdf: infoExtra.link || null,
            fecha_pdf: infoExtra.fecha || null
          };
        });

        setCluesData(datosFusionados);
        setLoading(false);

      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // --- 3. FILTROS Y PROCESAMIENTO (Igual que antes) ---

  const entidadesUnicas = useMemo(() => {
    // Filtramos nulos por seguridad
    const lista = cluesData.map(item => item.entidad).filter(e => e);
    return [...new Set(lista)].sort();
  }, [cluesData]);

  const datosFiltrados = useMemo(() => {
    if (filtroEntidad === 'TODAS') return cluesData;
    return cluesData.filter(item => item.entidad === filtroEntidad);
  }, [filtroEntidad, cluesData]);

  const dataTipologia = useMemo(() => {
    const conteo = {};
    datosFiltrados.forEach(item => {
      // Usamos el campo que viene de tu DB
      const tipo = item.tipologia || "NO ESPECIFICADO";
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    return Object.keys(conteo)
      .map(key => ({ name: key, value: conteo[key] }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.value > 0);
  }, [datosFiltrados]);

  const totalUnidadesFiltradas = datosFiltrados.length;

  const dataNivel = useMemo(() => {
    const conteo = {};
    datosFiltrados.forEach(item => {
      const nivel = item.nivel || "Sin Nivel";
      conteo[nivel] = (conteo[nivel] || 0) + 1;
    });
    return Object.keys(conteo).map(key => ({ name: key, value: conteo[key] }));
  }, [datosFiltrados]);

  const PALETA_GRAFICAS = [COLORS.guinda, COLORS.verde, '#DDC9A3', '#2C3E50', '#E67E22', '#8E44AD'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-xl font-bold text-gray-500 animate-pulse">Cargando SIBE + Directorio... 🏥</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-7xl">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tablero de Control</h1>
            <p className="text-gray-500">Unidades de Segundo y Tercer Nivel.</p>
          </div>

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

        {/* --- TARJETAS KPI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-800">
            <p className="text-gray-400 font-bold uppercase text-xs">Universo Total</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{totalUnidadesFiltradas}</p>
            <p className="text-sm text-gray-500 mt-2">Unidades Activas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-800">
            <p className="text-gray-400 font-bold uppercase text-xs">Entidad Seleccionada</p>
            <p className="text-2xl font-bold text-gray-800 mt-1 truncate">
              {filtroEntidad === 'TODAS' ? 'Nacional' : filtroEntidad}
            </p>
            <p className="text-sm text-gray-500 mt-2">Zona Geográfica</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8" style={{ borderColor: COLORS.dorado }}>
            <p className="text-gray-400 font-bold uppercase text-xs">Tipología Predominante</p>
            <p className="text-xl font-bold text-gray-800 mt-1 truncate">
              {dataTipologia.length > 0 ? dataTipologia[0].name : "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-2">Mayor presencia</p>
          </div>
        </div>

        {/* --- SECCIÓN DE GRÁFICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* GRÁFICA 1: TIPOLOGÍA (PASTEL) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col min-w-0">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">Distribución por Tipo de Unidad</h3>
            <div className="h-[450px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
                <PieChart>
                  <Pie
                    data={dataTipologia}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : null}
                  >
                    {dataTipologia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETA_GRAFICAS[index % PALETA_GRAFICAS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICA 2: NIVEL (BARRAS) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 min-w-0">
            <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">Unidades por Nivel de Atención</h3>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={300}>
                <BarChart data={dataNivel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill={COLORS.verde} radius={[4, 4, 0, 0]}>
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