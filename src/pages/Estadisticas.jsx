import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import HeaderOficial from '../components/HeaderOficial';
import { COLORS } from '../utils/constants';

const limpiarTexto = (str) =>
  (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

function Estadisticas() {
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');
  const [cluesData, setCluesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CONFIGURACIÓN DE CONEXIONES ---
  const API_SIBE_URL = "https://torre-control-production.up.railway.app/api/unidades/publico";
  const LINKS_PDF_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmdYQBqZYY30hQt9hU2hzpVAsBwaSdpIg0LbbFCoJ5z3ouswU6lrnihg39CQPNd62J48H6D5mDzY6F/pub?gid=0&single=true&output=csv";

  //DescargaPDF
  const descargarReportePDF = async () => {
    try {
      const response = await fetch(`https://torre-control-production.up.railway.app/api/reportes/generar-pdf?entidad=${filtroEntidad}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("No se pudo generar el reporte");

      // Se convierte la respuesta en un archivo descargable 
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Unidades_${filtroEntidad}_${new Date().toLocaleDateString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      alert("Hubo un error al generar el PDF. Verifica que el servidor de reportes esté activo.");
    }
  };

  // --- Carga de datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuestaApi = await fetch(API_SIBE_URL);
        const dataBaseDatos = await respuestaApi.json();

        const promesaExcel = new Promise((resolve, reject) => {
          Papa.parse(LINKS_PDF_URL, {
            download: true, header: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
          });
        });
        const dataExcel = await promesaExcel;

        const mapaPDFs = {};
        dataExcel.forEach(row => {
          if (row.clues) mapaPDFs[row.clues.trim().toUpperCase()] = { link: row.link_pdf, fecha: row.fecha };
        });

        const datosFusionados = dataBaseDatos.map(unidad => ({
          ...unidad,
          link_pdf: mapaPDFs[unidad.clues?.trim().toUpperCase()]?.link || null
        }));

        setCluesData(datosFusionados);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const entidadesUnicas = useMemo(() => {
    return [...new Set(cluesData.map(item => item.entidad).filter(Boolean))].sort();
  }, [cluesData]);

  // Filtro por entidad
  const porEntidad = useMemo(() => {
    if (filtroEntidad === 'TODAS') return cluesData;
    return cluesData.filter(item => item.entidad === filtroEntidad);
  }, [filtroEntidad, cluesData]);

  // Filtro unidades en operación
  const unidadesOperativas = useMemo(() => {
    return porEntidad.filter(item => {
      const est = limpiarTexto(item.estatus_operacion);
      return est === 'ACTIVO' || est === 'EN OPERACION';
    });
  }, [porEntidad]);

  // Conteo de unidades
  const conteosGlobales = useMemo(() => {
    return porEntidad.reduce((acc, item) => {
      const est = limpiarTexto(item.estatus_operacion);
      if (est === 'ACTIVO' || est === 'EN OPERACION') acc.operativas++;
      else if (est.includes('CONSTRUC') || est.includes('PROCESO')) acc.enObra++;
      else acc.bajas++;
      return acc;
    }, { operativas: 0, enObra: 0, bajas: 0 });
  }, [porEntidad]);

  const fueraservicio = useMemo(() => {
  })

  // Totales de Infraestructura
  const totalesInfraestructura = useMemo(() => {
    return unidadesOperativas.reduce((acc, item) => {
      acc.ambulancias += parseInt(item.ambulancias) || 0;
      const f = parseInt(item.q_func) || 0;
      const nf = parseInt(item.q_no_func) || 0;
      acc.q_funcionales += f;
      acc.q_no_funcionales += nf;
      acc.q_total += (f + nf);
      return acc;
    }, { ambulancias: 0, q_funcionales: 0, q_no_funcionales: 0, q_total: 0 });
  }, [unidadesOperativas]);

  // Datos para Gráficas
  const dataTipologia = useMemo(() => {
    const conteo = {};
    unidadesOperativas.forEach(item => {
      const tipo = item.tipologia || "S/D";
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    return Object.keys(conteo).map(k => ({ name: k, value: conteo[k] })).sort((a, b) => b.value - a.value);
  }, [unidadesOperativas]);

  //Filtro por nivel
  const dataNivel = useMemo(() => {
    const conteo = {};
    unidadesOperativas.forEach(item => {
      const nivel = item.nivel || "S/D";
      conteo[nivel] = (conteo[nivel] || 0) + 1;
    });
    return Object.keys(conteo).map(k => ({ name: k, value: conteo[k] }));
  }, [unidadesOperativas]);

  const PALETA_GRAFICAS = [COLORS.guinda, COLORS.verde, '#DDC9A3', '#2C3E50', '#E67E22', '#8E44AD'];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl font-bold text-gray-500 animate-pulse">Cargando Estadísticas... 🏥</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderOficial />

      <main className="container mx-auto px-4 py-10 max-w-7xl">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Tablero de Control</h1>
            <p className="text-gray-500 font-medium">Capacidad Operativa Real</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Botón descarga reporte */}
            <button
              onClick={descargarReportePDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all transform active:scale-95 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Descargar PDF
            </button>

            {/* Selección de Entidad */}

            <select
              className="p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-800 outline-none font-bold text-gray-700 bg-white"
              value={filtroEntidad}
              onChange={(e) => setFiltroEntidad(e.target.value)}
            >
              <option value="TODAS">NIVEL NACIONAL</option>
              {entidadesUnicas.map(ent => <option key={ent} value={ent}>{ent}</option>)}
            </select>
          </div>
        </div>

        {/* --- Tarjetas KPI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-800">
            <p className="text-gray-400 font-bold uppercase text-xs">En Operación</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">{conteosGlobales.operativas}</p>
            <p className="text-sm text-gray-500 mt-2">Unidades Activas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-red-800">
            <p className="text-gray-400 font-bold uppercase text-xs">En Construcción</p>
            <p className="text-4xl font-bold text-gray-800 mt-1">
              {conteosGlobales.enObra}
            </p>
            <p className="text-sm text-gray-500 mt-2">Proyectos en proceso</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8" style={{ borderColor: COLORS.dorado }}>
            <p className="text-gray-400 font-bold uppercase text-xs">Tipología Predominante</p>
            <p className="text-xl font-bold text-gray-800 mt-1 truncate">
              {dataTipologia.length > 0 ? dataTipologia[0].name : "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-2">Mayor presencia</p>
          </div>
        </div>

        {/* --- Sección Infraestructura --- */}
        <h2 className="text-lg font-bold text-gray-700 mb-4 px-1">Capacidad Instalada</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up">

          {/* Tarjeta Ambulancias */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">Total Ambulancias</p>
              <p className="text-4xl font-bold text-gray-800 mt-1">{totalesInfraestructura.ambulancias}</p>
              <p className="text-sm text-gray-500 mt-2">Funcionales</p>
            </div>
          </div>

          {/* Tarjeta Consultorios */}
          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center opacity-60">
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">Consultorios</p>
              <p className="text-4xl font-extrabold text-gray-400 mt-1">{totalesInfraestructura.consultorios || "-"}</p>
              <p className="text-xs text-gray-400 mt-1">Total disponible</p>
            </div>
          </div>

          {/* Tarjeta Quirófanos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">Total Quirófanos</p>
              <p className="text-4xl font-bold text-gray-800 mt-1">
                {totalesInfraestructura.q_total}
              </p>

              {/* Desglose información */}
              <div className="flex gap-4 mt-2 text-xs font-medium">
                <span className="text-sm text-gray-500 mt-2">
                  Operativos: <b>{totalesInfraestructura.q_funcionales}</b>
                </span>
                <span className="text-sm text-gray-500 mt-2 ">
                  Fuera de servicio: <b>{totalesInfraestructura.q_no_funcionales}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* -------------------------------------------------------- */}

        {/* --- Sección de Gráficas --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

          {/* Grafica de Unidades por Nivel de Atención*/}
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

        {/* Tabla de Tipología */}
        <div className="mt-10 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
            Tipología - {filtroEntidad === 'TODAS' ? 'Nacional' : filtroEntidad}
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