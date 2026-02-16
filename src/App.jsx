import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, LabelList 
} from 'recharts';
import { FileText, Zap, AlertTriangle, Trash2, X, Activity, Factory, LayoutDashboard, ChevronRight, BarChart2 } from 'lucide-react';

// --- CONSTANTES Y COLORES ---
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const COLORS = {
  green: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d', '#86efac'], 
  gray: ['#94a3b8', '#64748b', '#475569'],
  brown: ['#d97706'],
  red: ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  blue: ['#3b82f6'],
  black: ['#1e293b'] 
};

// --- GENERACIÓN DE DATOS SIMULADOS ---
const generateTrendData = (baseValue, volatility, factor = 1) => {
  const adjustedBase = Math.floor(baseValue * factor);
  const adjustedVol = Math.floor(volatility * factor);
  return months.map(month => ({
    name: month,
    value: Math.max(0, Math.floor(adjustedBase + (Math.random() * adjustedVol) - (adjustedVol / 2)))
  }));
};

// --- ESTRUCTURA DE DATOS BASE ---
const BASE_DATA_CONFIG = {
  noPeligrosos: {
    aprovechable: [
      { name: 'Cartón y papel', items: 'Hojas, plegadiza, periódico', base: 1200 },
      { name: 'Vidrio', items: 'Botellas, recipientes', base: 400 },
      { name: 'Plásticos', items: 'Bolsas, garrafas, envases', base: 850 },
      { name: 'Metálicos', items: 'Cobre, aluminio, acero', base: 600 },
      { name: 'Madera', items: 'Aserrín, palos, cajas', base: 500 },
      { name: 'Descarte Personal', items: 'Pañales y toallitas', base: 300 },
    ],
    noAprovechable: [
      { name: 'Rechazos de Pulper', items: 'Industrial', base: 2000 },
      { name: 'Similar a Domiciliario', items: 'Residuos generales', base: 900 },
      { name: 'Otros No Peligrosos', items: 'Arenas, escombros', base: 450 },
    ],
    organicos: [
      { name: 'Residuos de Comedor', items: 'Comida, orgánicos', base: 1500 },
    ]
  },
  peligrosos: [
    { name: 'Hidrocarburos', items: 'Contaminados con químicos', base: 200 },
    { name: 'Químicos', items: 'Viales DQO, reactivos', base: 150 },
    { name: 'Solventes', items: 'Pinturas, aerosoles', base: 300 },
    { name: 'Mezclas', items: 'Solventes con metales', base: 100 },
    { name: 'Otros Peligrosos', items: 'Baterías, hospitalarios', base: 250 },
  ],
  bienesPriorizados: [
    { name: 'RAEE', items: 'Aparatos eléctricos', base: 120 },
  ],
  descarte: [
    { name: 'Lodos Industriales', items: 'Lodos de proceso', base: 3000 },
  ]
};

const getPlantData = (plantId) => {
  let factor = 1;
  if (plantId === 'lima') factor = 1.0;
  if (plantId === 'canete') factor = 0.4;
  if (plantId === 'arequipa') factor = 0.6;
  if (plantId === 'all') factor = 2.0;

  const processCategory = (items) => items.map(item => ({
    ...item,
    trend: generateTrendData(item.base, item.base * 0.2, factor)
  }));

  return {
    noPeligrosos: {
      aprovechable: processCategory(BASE_DATA_CONFIG.noPeligrosos.aprovechable),
      noAprovechable: processCategory(BASE_DATA_CONFIG.noPeligrosos.noAprovechable),
      organicos: processCategory(BASE_DATA_CONFIG.noPeligrosos.organicos),
    },
    peligrosos: processCategory(BASE_DATA_CONFIG.peligrosos),
    bienesPriorizados: processCategory(BASE_DATA_CONFIG.bienesPriorizados),
    descarte: processCategory(BASE_DATA_CONFIG.descarte),
  };
};

// --- HELPERS ---
const aggregateTrends = (items) => {
  if (!items || items.length === 0) return [];
  
  const aggregated = items[0].trend.map((_, index) => {
    const totalValue = items.reduce((sum, item) => sum + item.trend[index].value, 0);
    return {
      name: items[0].trend[index].name,
      value: totalValue
    };
  });
  
  return aggregated;
};

// --- RENDERIZADO PERSONALIZADO DE ETIQUETAS (PIE CHART) ---
const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const color = COLORS.green[index % COLORS.green.length];

  return (
    <g>
      {/* Línea conectora */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={color} stroke="none" />
      
      {/* Caja de porcentaje estilo Sticker */}
      <rect 
        x={cos >= 0 ? ex + 5 : ex - 45} 
        y={ey - 12} 
        width={40} 
        height={24} 
        rx={6} 
        fill="white" 
        stroke={color}
        strokeWidth={1.5}
        className="drop-shadow-sm"
      />
      <text 
        x={cos >= 0 ? ex + 25 : ex - 25} 
        y={ey} 
        textAnchor="middle" 
        fill={color} 
        fontSize={11} 
        fontWeight="900" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

// --- COMPONENTES AUXILIARES ---

// Etiqueta personalizada para barras con línea conectora
const CustomBarLabel = (props) => {
  const { x, y, width, height, value, index, data } = props;
  const item = data && data[index];
  if (!item) return null;

  return (
    <g>
      <line 
        x1={x + width} 
        y1={y + height / 2} 
        x2={x + width + 20} 
        y2={y + height / 2} 
        stroke="#94a3b8" 
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <circle cx={x + width + 20} cy={y + height / 2} r={2} fill="#94a3b8" />
      <text 
        x={x + width + 26} 
        y={y + height / 2} 
        dy={-3} 
        fill="#475569" 
        fontSize={10} 
        fontWeight="bold"
        dominantBaseline="middle"
      >
        {value.toLocaleString()} kg
      </text>
      <text 
        x={x + width + 26} 
        y={y + height / 2} 
        dy={8} 
        fill="#059669" 
        fontSize={9} 
        fontWeight="bold"
        dominantBaseline="middle"
      >
        ({item.percentage}%)
      </text>
    </g>
  );
};

// Cabecera de Tarjeta
const CardHeader = ({ title, icon: Icon, colorClass, onShowTrend }) => (
  <div className={`flex items-center justify-between p-4 border-b border-slate-100 ${colorClass} bg-opacity-10`}>
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">{title}</h3>
    </div>
    {onShowTrend && (
      <button 
        onClick={onShowTrend}
        className="flex items-center gap-1 text-[10px] font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors uppercase tracking-tight"
      >
        <BarChart2 size={12} /> Ver Tendencia Total
      </button>
    )}
  </div>
);

// --- COMPONENTE SELECTOR DE PLANTA ---
const PlantSelector = ({ selectedPlant, onSelect }) => {
  const plants = [
    { id: 'lima', label: 'Lima', color: '#ef4444' },
    { id: 'canete', label: 'Cañete', color: '#f59e0b' },
    { id: 'arequipa', label: 'Arequipa', color: '#3b82f6' }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-10 relative">
      <div className="flex items-center gap-3 shrink-0">
        <div className="bg-blue-600 p-3 rounded-lg text-white">
          <Factory size={24} />
        </div>
        <div>
           <h2 className="text-lg font-bold text-slate-800 uppercase leading-none">Selector de Operación</h2>
           <p className="text-xs text-slate-500 mt-1">Filtrar indicadores por sede</p>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        <button 
          onClick={() => onSelect('all')}
          className={`px-6 py-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wide border whitespace-nowrap ${selectedPlant === 'all' ? 'bg-slate-800 border-slate-800 text-white shadow-md scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
        >
          Reporte Total
        </button>
        {plants.map(p => (
           <button 
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-6 py-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wide flex items-center gap-2 border whitespace-nowrap ${selectedPlant === p.id ? 'bg-white border-blue-500 ring-2 ring-blue-100 text-slate-800 shadow-md transform -translate-y-1' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MODAL DRILL-DOWN ---
const TrendModal = ({ isOpen, onClose, data, title, subtext }) => {
  if (!isOpen || !data) return null;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-600" size={20} /> {title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{subtext || 'Análisis de comportamiento anual'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm border border-transparent hover:border-slate-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="h-72 w-full bg-white rounded-xl p-4 shadow-inner border border-slate-100 mb-6 relative">
            <div className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">Últimos 12 Meses</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  formatter={(value) => [`${value.toLocaleString()} kg`, 'Cantidad']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3b82f6' }}
                  activeDot={{ r: 7, fill: '#2563eb', strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Total Acumulado</p>
                <p className="text-2xl font-black text-slate-800">{total.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span></p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Promedio Mes</p>
                <p className="text-2xl font-black text-slate-800">{Math.round(total / 12).toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span></p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pico Máximo</p>
                <p className="text-2xl font-black text-slate-800">{Math.max(...data.map(d => d.value)).toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span></p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedPlant, setSelectedPlant] = useState('all'); 
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const currentData = useMemo(() => getPlantData(selectedPlant), [selectedPlant]);
  const calculateTotal = (trend) => trend.reduce((a, b) => a + b.value, 0);

  // Procesamiento de datos para gráficos
  const processForChart = (items, totalSum) => items.map(i => {
    const val = calculateTotal(i.trend);
    return {
      name: i.name,
      value: val,
      percentage: totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : 0,
      fullData: i
    };
  });

  const totalAprovechables = currentData.noPeligrosos.aprovechable.reduce((acc, curr) => acc + calculateTotal(curr.trend), 0);
  const dataNoPeligrososA = processForChart(currentData.noPeligrosos.aprovechable, totalAprovechables);
  
  const totalNoAprovechables = currentData.noPeligrosos.noAprovechable.reduce((acc, curr) => acc + calculateTotal(curr.trend), 0);
  const dataNoPeligrososB = processForChart(currentData.noPeligrosos.noAprovechable, totalNoAprovechables);

  const totalPeligrosos = currentData.peligrosos.reduce((acc, curr) => acc + calculateTotal(curr.trend), 0);
  const dataPeligrosos = processForChart(currentData.peligrosos, totalPeligrosos);

  const grandTotal = totalAprovechables + totalNoAprovechables + 
                     currentData.noPeligrosos.organicos.reduce((acc, i) => acc + calculateTotal(i.trend), 0) + 
                     totalPeligrosos + 
                     currentData.bienesPriorizados.reduce((acc, i) => acc + calculateTotal(i.trend), 0) + 
                     currentData.descarte.reduce((acc, i) => acc + calculateTotal(i.trend), 0);

  // Manejador para abrir modal de un ítem individual
  const handleSelect = (item) => {
    setSelectedIndicator({
      title: item.name,
      subtext: item.items,
      trend: item.trend
    });
  };

  // Manejador para abrir modal de TENDENCIA TOTAL DE CATEGORÍA
  const handleCategoryTrend = (categoryItems, categoryTitle) => {
    const aggregatedTrend = aggregateTrends(categoryItems);
    setSelectedIndicator({
      title: `Tendencia Global: ${categoryTitle}`,
      subtext: `Consolidado de todos los residuos de la categoría ${categoryTitle}`,
      trend: aggregatedTrend
    });
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-12 relative bg-slate-50">
      
      {/* FONDO CORPORATIVO SIMULADO */}
      <div 
        className="absolute top-0 left-0 w-full h-96 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-slate-50/100"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-serif italic text-lg shadow-lg border border-white/20">S</div>
              <div>
                 <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Gestión de Basura Cero</h1>
                 <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Dashboard Corporativo Softys</p>
              </div>
           </div>

           <div className="bg-slate-900 text-white px-5 py-2 rounded-lg flex items-center gap-4 shadow-xl ring-1 ring-white/20">
             <LayoutDashboard className="text-slate-400" size={20} />
             <div className="text-right">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Generación Total</p>
               <p className="text-xl font-mono font-bold text-emerald-400 leading-none">
                 {grandTotal.toLocaleString()} <span className="text-xs text-slate-500 font-sans">kg</span>
               </p>
             </div>
           </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* SELECTOR DE PLANTAS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <PlantSelector selectedPlant={selectedPlant} onSelect={setSelectedPlant} />
        </section>

        {/* 1. RESIDUOS NO PELIGROSOS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader 
            title="1. Residuos No Peligrosos" 
            icon={FileText} 
            colorClass="bg-emerald-100 text-emerald-700" 
          />
          
          <div className="p-8 space-y-10">
            
            {/* 1.A APROVECHABLES */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60 relative">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                   <span className="w-2 h-8 rounded-full bg-emerald-500"></span> A. Aprovechables
                 </h4>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleCategoryTrend(currentData.noPeligrosos.aprovechable.map(i => i.fullData || i), "Aprovechables")}
                      className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <BarChart2 size={14} /> Tendencia Global
                    </button>
                    <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                      Total: {totalAprovechables.toLocaleString()} kg
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* GRÁFICO CIRCULAR: ETIQUETAS EXTERNAS ESTILO FIGURA 2 */}
                <div className="h-72 relative">
                  <h5 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Distribución (%)</h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataNoPeligrososA}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80} // Radio reducido para espacio de etiquetas
                        paddingAngle={4}
                        dataKey="value"
                        label={renderCustomizedPieLabel} // Etiqueta personalizada aplicada
                        labelLine={false} // Desactivamos la línea por defecto para usar la nuestra
                      >
                        {dataNoPeligrososA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.green[index % COLORS.green.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* GRÁFICO DE BARRAS */}
                <div className="h-72">
                   <h5 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Detalle por Residuo</h5>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart layout="vertical" data={dataNoPeligrososA} margin={{left: 0, right: 60}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value.toLocaleString()} kg`} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                          {dataNoPeligrososA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.green[index % COLORS.green.length]} />
                          ))}
                          <LabelList dataKey="name" position="insideLeft" style={{fill: '#fff', fontSize: '10px', fontWeight: 'bold'}} />
                          <LabelList data={dataNoPeligrososA} content={<CustomBarLabel />} />
                        </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>

              {/* BOTONES INTERACTIVOS PARA TENDENCIA */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 mb-3 text-center italic">Selecciona un residuo para ver su tendencia anual específica:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {dataNoPeligrososA.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelect(item.fullData)}
                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md transition-all active:scale-95"
                    >
                      {item.name} <span className="font-bold text-emerald-500 ml-1">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* B (NO APROVECHABLES) & C (ORGÁNICOS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1.B */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-bold text-slate-700">B. No Aprovechables</h4>
                       <button 
                          onClick={() => handleCategoryTrend(currentData.noPeligrosos.noAprovechable, "No Aprovechables")}
                          className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm hover:text-blue-600 flex items-center gap-1"
                        >
                          <BarChart2 size={10} /> Tendencia Total
                       </button>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="h-40 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dataNoPeligrososB} layout="vertical" margin={{right: 60}}>
                             <XAxis type="number" hide />
                             <YAxis type="category" dataKey="name" width={110} tick={{fontSize: 10}} />
                             <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => `${val.toLocaleString()} kg`} />
                             <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                               {dataNoPeligrososB.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS.gray[index % COLORS.gray.length]} />
                               ))}
                               <LabelList data={dataNoPeligrososB} content={<CustomBarLabel />} />
                             </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {dataNoPeligrososB.map((item, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleSelect(item.fullData)}
                          className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all group"
                        >
                          <span className="text-xs font-medium text-slate-600">{item.name}</span>
                          <Activity size={14} className="text-slate-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                </div>

                {/* 1.C */}
                <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/60 flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="font-bold text-amber-900">C. Orgánicos</h4>
                      <button 
                          onClick={() => handleCategoryTrend(currentData.noPeligrosos.organicos, "Orgánicos")}
                          className="text-[10px] bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded shadow-sm hover:bg-amber-50 flex items-center gap-1"
                        >
                          <BarChart2 size={10} /> Tendencia Total
                       </button>
                   </div>
                   <div className="flex-1 flex flex-col justify-center items-center">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                         <div className="absolute inset-0 border-8 border-amber-200 rounded-full opacity-30"></div>
                         <div className="absolute inset-0 border-8 border-amber-500 rounded-full border-t-transparent animate-spin-slow"></div>
                         <span className="text-2xl font-black text-amber-700">100%</span>
                      </div>
                      
                      {currentData.noPeligrosos.organicos.map((item, idx) => (
                        <button 
                           key={idx}
                           onClick={() => handleSelect(item)}
                           className="mt-8 bg-white px-6 py-3 rounded-xl shadow-sm border border-amber-200 text-amber-800 font-bold text-sm hover:bg-amber-50 transition-colors flex items-center gap-2"
                        >
                           Ver Tendencia Específica <ChevronRight size={16} />
                        </button>
                      ))}
                   </div>
                </div>

            </div>
          </div>
        </section>

        {/* 2. PELIGROSOS & 3. PRIORIZADOS & 4. DESCARTE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* 2. RESIDUOS PELIGROSOS */}
           <section className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <CardHeader 
                title="2. Residuos Peligrosos" 
                icon={AlertTriangle} 
                colorClass="bg-red-50 text-red-600" 
                onShowTrend={() => handleCategoryTrend(currentData.peligrosos, "Residuos Peligrosos")}
             />
             <div className="p-6">
                <div className="h-64 mb-6">
                   <h5 className="text-[10px] text-slate-400 font-bold uppercase mb-2 text-center">Cantidad (kg)</h5>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataPeligrosos} margin={{top: 20}}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} tickFormatter={(val) => val.split(' ')[0]} />
                         <Tooltip cursor={{fill: '#fef2f2'}} formatter={(val) => `${val.toLocaleString()} kg`} />
                         <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={(data) => handleSelect(data.payload.fullData)} className="cursor-pointer">
                            {dataPeligrosos.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS.red[index % COLORS.red.length]} />
                            ))}
                            <LabelList dataKey="value" position="top" style={{fontSize: '11px', fill: '#991b1b', fontWeight: 'bold'}} formatter={(v) => `${v}`} />
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   {dataPeligrosos.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelect(item.fullData)}
                        className="text-left text-[11px] p-2 rounded hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors flex items-center gap-2 border border-transparent hover:border-red-100"
                      >
                         <div className="w-2 h-2 rounded-full shrink-0" style={{background: COLORS.red[idx % COLORS.red.length]}}></div>
                         <span className="truncate">{item.name}</span>
                      </button>
                   ))}
                </div>
             </div>
           </section>

           {/* PANEL LATERAL: 3 & 4 */}
           <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* 3. BIENES PRIORIZADOS */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden group">
                 <CardHeader 
                    title="3. Bienes Priorizados" 
                    icon={Zap} 
                    colorClass="bg-blue-50 text-blue-600" 
                    onShowTrend={() => handleCategoryTrend(currentData.bienesPriorizados, "Bienes Priorizados")}
                 />
                 <div className="p-6 h-full flex flex-col items-center justify-center">
                    {currentData.bienesPriorizados.map((item, idx) => (
                      <button 
                         key={idx} 
                         onClick={() => handleSelect(item)}
                         className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl hover:bg-blue-50/50 transition-all"
                      >
                         <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                           <Zap size={32} />
                         </div>
                         <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                         <div className="mt-2 text-2xl font-black text-slate-800">{calculateTotal(item.trend).toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span></div>
                         <span className="text-xs text-blue-500 mt-2 font-medium flex items-center gap-1">Ver Detalle <Activity size={12}/></span>
                      </button>
                    ))}
                 </div>
              </section>

              {/* 4. RESIDUOS DE DESCARTE */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1">
                 <CardHeader 
                    title="4. Residuos de Descarte" 
                    icon={Trash2} 
                    colorClass="bg-slate-100 text-slate-600" 
                    onShowTrend={() => handleCategoryTrend(currentData.descarte, "Residuos de Descarte")}
                 />
                 <div className="p-6">
                    {currentData.descarte.map((item, idx) => (
                      <button 
                         key={idx} 
                         onClick={() => handleSelect(item)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 transition-all hover:shadow-md group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center group-hover:bg-slate-700">
                               <Trash2 size={18} />
                            </div>
                            <div className="text-left">
                               <div className="font-bold text-slate-700">{item.name}</div>
                               <div className="text-[10px] text-slate-400 uppercase">Gestión Final</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="font-black text-slate-800">{calculateTotal(item.trend).toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500">kg</div>
                         </div>
                      </button>
                    ))}
                 </div>
              </section>

           </div>

        </div>
      </main>

      {/* MODAL GLOBAL */}
      <TrendModal 
        isOpen={!!selectedIndicator} 
        onClose={() => setSelectedIndicator(null)}
        data={selectedIndicator?.trend}
        title={selectedIndicator?.title}
        subtext={selectedIndicator?.subtext}
      />
    </div>
  );
}