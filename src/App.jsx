import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, LabelList 
} from 'recharts';
import { FileText, Zap, AlertTriangle, Trash2, X, Activity, Factory, LayoutDashboard, ChevronRight, BarChart2, Leaf } from 'lucide-react';

// --- CONSTANTES Y COLORES PERSONALIZADOS ---
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Mapeo exacto de colores
const COLOR_MAP = {
  metalicos: '#FEE000',      // Amarillo
  vidrio: '#939598',         // Gris
  papelCarton: '#0096D6',    // Azul Claro
  pulper: '#6A0DAD',         // Morado (Solicitado)
  madera: '#63422B',         // Marrón Oscuro
  noAprovechables: '#231F20',// Negro
  plasticos: '#FFFFFF',      // Blanco
  organico: '#754C29',       // Marrón Medio
  default: '#cbd5e1'
};

// Gamas de Rojo para Peligrosos
const RED_SHADES = {
  hidrocarburos: '#fee2e2', // Rojo muy claro
  quimicos: '#fca5a5',      // Rojo claro
  solventes: '#ef4444',     // Rojo base
  mezclas: '#b91c1c',       // Rojo oscuro
  otros: '#7f1d1d'          // Rojo muy oscuro
};

// Función auxiliar para asignar color
const getColor = (name, category = '') => {
  const n = name.toLowerCase();
  
  // Lógica específica para Peligrosos (Gamas de Rojo)
  if (category === 'peligrosos') {
    if (n.includes('hidrocarburos')) return RED_SHADES.hidrocarburos;
    if (n.includes('químicos') || n.includes('quimicos')) return RED_SHADES.quimicos;
    if (n.includes('solventes')) return RED_SHADES.solventes;
    if (n.includes('mezclas')) return RED_SHADES.mezclas;
    return RED_SHADES.otros;
  }

  // Lógica General
  if (n.includes('metálicos') || n.includes('chatarra')) return COLOR_MAP.metalicos;
  if (n.includes('vidrio') || n.includes('botellas')) return COLOR_MAP.vidrio;
  if (n.includes('pulper')) return COLOR_MAP.pulper; // Morado
  if (n.includes('cartón') || n.includes('papel')) return COLOR_MAP.papelCarton;
  if (n.includes('madera') || n.includes('pallets')) return COLOR_MAP.madera;
  if (n.includes('plásticos') || n.includes('bolsas')) return COLOR_MAP.plasticos;
  if (n.includes('orgánicos') || n.includes('comedor')) return COLOR_MAP.organico;
  if (n.includes('no aprovechable') || n.includes('domiciliario') || n.includes('escombros')) return COLOR_MAP.noAprovechables;
  
  return COLOR_MAP.default;
};

// Función para determinar color de texto (Contraste)
const getContrastColor = (hexColor) => {
  // Colores oscuros que necesitan texto blanco
  const darkColors = [
    COLOR_MAP.pulper, 
    COLOR_MAP.noAprovechables, 
    COLOR_MAP.madera, 
    COLOR_MAP.organico,
    RED_SHADES.otros,
    RED_SHADES.mezclas
  ];
  
  if (darkColors.includes(hexColor)) return '#FFFFFF'; // Blanco
  return '#1e293b'; // Slate-800 (Oscuro) por defecto para colores claros (Amarillo, Blanco, etc.)
};

// --- GENERACIÓN DE TENDENCIAS MENSUALES ---
const distributeMonthly = (totalValue, volatility = 0.15) => {
  const baseMonth = totalValue / 12;
  return months.map(month => {
    const change = baseMonth * volatility * (Math.random() - 0.5) * 2; 
    return {
      name: month,
      value: Number(Math.max(0, baseMonth + change).toFixed(2))
    };
  });
};

// --- DATOS REALES 2025 ---
const PLANT_DATA = {
  lima: {
    noPeligrosos: {
      aprovechable: [
        { name: 'Rechazos de Pulper', items: 'Industrial (Recuperado)', total: 2225.82 }, 
        { name: 'Cartón y papel', items: 'Hojas, plegadiza, periódico', total: 1150.80 },
        { name: 'Plásticos', items: 'Bolsas, garrafas, envases', total: 420.20 },
        { name: 'Metálicos', items: 'Chatarra, cobre, acero', total: 380.15 },
        { name: 'Madera', items: 'Pallets, cajas', total: 650.00 },
        { name: 'Vidrio', items: 'Botellas, recipientes', total: 12.30 },
        { name: 'Descarte personal care', items: 'Residuos valorizados', total: 185.00 },
      ],
      noAprovechable: [
        { name: 'Similar a Domiciliario', items: 'Residuos generales', total: 699.93 }, 
        { name: 'Otros No Peligrosos', items: 'Escombros, arenas', total: 140.54 },
      ],
      organicos: [
        { name: 'Residuos de Comedor', items: 'Comida, orgánicos', total: 280.40 },
      ]
    },
    peligrosos: [
      { name: 'Hidrocarburos', items: 'Aceites usados, lodos', total: 35.20 },
      { name: 'Químicos', items: 'Envases, reactivos', total: 12.50 },
      { name: 'Solventes', items: 'Pinturas, disolventes', total: 10.80 },
      { name: 'Mezclas', items: 'Residuos contaminados', total: 6.40 },
      { name: 'Otros peligrosos', items: 'Baterías, biomédicos', total: 8.60 },
    ],
    bienesPriorizados: [
      { name: 'RAEE', items: 'Aparatos eléctricos', total: 12.50 },
    ],
    descarte: [
      { name: 'Lodos Industriales', items: 'Lodos de proceso (Valorizados)', total: 74370.68 }, 
    ]
  },
  arequipa: {
    noPeligrosos: {
      aprovechable: [
        { name: 'Rechazos de Pulper', items: 'Industrial (Recuperado)', total: 130.93 },
        { name: 'Cartón y papel', items: 'Hojas, plegadiza', total: 95.20 },
        { name: 'Plásticos', items: 'Envases, films', total: 38.80 },
        { name: 'Metálicos', items: 'Chatarra', total: 25.50 },
        { name: 'Madera', items: 'Pallets', total: 55.00 },
        { name: 'Vidrio', items: 'Botellas', total: 1.80 },
        { name: 'Descarte personal care', items: '-', total: 0 },
      ],
      noAprovechable: [
        { name: 'Similar a Domiciliario', items: 'Generales', total: 124.18 }, 
        { name: 'Otros No Peligrosos', items: 'Escombros', total: 15.00 },
      ],
      organicos: [
        { name: 'Residuos de Comedor', items: 'Orgánicos', total: 42.60 },
      ]
    },
    peligrosos: [
      { name: 'Hidrocarburos', items: 'Aceites', total: 4.20 },
      { name: 'Químicos', items: 'Envases', total: 1.80 },
      { name: 'Solventes', items: 'Pinturas', total: 1.20 },
      { name: 'Mezclas', items: 'Contaminados', total: 0.60 },
      { name: 'Otros peligrosos', items: 'Baterías', total: 1.40 },
    ],
    bienesPriorizados: [
      { name: 'RAEE', items: 'Aparatos eléctricos', total: 3.10 },
    ],
    descarte: [
      { name: 'Lodos Industriales', items: 'Lodos de proceso', total: 5354.88 },
    ]
  },
  canete: {
    noPeligrosos: {
      aprovechable: [
        { name: 'Rechazos de Pulper', items: 'Industrial', total: 261.86 },
        { name: 'Cartón y papel', items: 'Hojas, recortes', total: 820.60 },
        { name: 'Plásticos', items: 'Bolsas, mermas', total: 310.40 },
        { name: 'Metálicos', items: 'Chatarra', total: 140.20 },
        { name: 'Madera', items: 'Pallets', total: 380.80 },
        { name: 'Vidrio', items: 'Botellas', total: 4.90 },
        { name: 'Descarte personal care', items: 'Mermas producción', total: 42.00 },
      ],
      noAprovechable: [
        { name: 'Similar a Domiciliario', items: 'Generales', total: 53.36 },
        { name: 'Otros No Peligrosos', items: 'Tierras', total: 436.61 }, 
      ],
      organicos: [
        { name: 'Residuos de Comedor', items: 'Orgánicos', total: 75.20 },
      ]
    },
    peligrosos: [
      { name: 'Hidrocarburos', items: 'Aceites', total: 6.50 },
      { name: 'Químicos', items: 'Reactivos', total: 2.80 },
      { name: 'Solventes', items: 'Disolventes', total: 1.80 },
      { name: 'Mezclas', items: 'Contaminados', total: 1.00 },
      { name: 'Otros peligrosos', items: 'Hospitalarios', total: 2.10 },
    ],
    bienesPriorizados: [
      { name: 'RAEE', items: 'Aparatos eléctricos', total: 6.50 },
    ],
    descarte: [
      { name: 'Lodos Industriales', items: 'Lodos (Valorizados)', total: 4950.64 },
    ]
  }
};

const getPlantData = (plantId) => {
  let data;
  
  if (plantId === 'all') {
    const keys = ['lima', 'arequipa', 'canete'];
    const sumCategories = (path) => {
      const categories = path.length === 2 
        ? PLANT_DATA['lima'][path[0]][path[1]] 
        : PLANT_DATA['lima'][path[0]];

      return categories.map(cat => {
        let totalSum = 0;
        keys.forEach(key => {
          const plantCats = path.length === 2 
            ? PLANT_DATA[key][path[0]][path[1]] 
            : PLANT_DATA[key][path[0]];
          
          const match = plantCats.find(c => c.name === cat.name);
          if (match) totalSum += match.total;
        });
        return { ...cat, value: totalSum, trend: distributeMonthly(totalSum) };
      });
    };

    data = {
      noPeligrosos: {
        aprovechable: sumCategories(['noPeligrosos', 'aprovechable']),
        noAprovechable: sumCategories(['noPeligrosos', 'noAprovechable']),
        organicos: sumCategories(['noPeligrosos', 'organicos']),
      },
      peligrosos: sumCategories(['peligrosos']),
      bienesPriorizados: sumCategories(['bienesPriorizados']),
      descarte: sumCategories(['descarte']),
    };
  } else {
    const raw = PLANT_DATA[plantId];
    const process = (items) => items.map(item => ({ ...item, value: item.total, trend: distributeMonthly(item.total) }));

    data = {
      noPeligrosos: {
        aprovechable: process(raw.noPeligrosos.aprovechable),
        noAprovechable: process(raw.noPeligrosos.noAprovechable),
        organicos: process(raw.noPeligrosos.organicos),
      },
      peligrosos: process(raw.peligrosos),
      bienesPriorizados: process(raw.bienesPriorizados),
      descarte: process(raw.descarte),
    };
  }
  return data;
};

// --- HELPERS ---
const aggregateTrends = (items) => {
  if (!items || items.length === 0) return [];
  const aggregated = items[0].trend.map((_, index) => {
    const totalValue = items.reduce((sum, item) => sum + item.trend[index].value, 0);
    return {
      name: items[0].trend[index].name,
      value: Number(totalValue.toFixed(2))
    };
  });
  return aggregated;
};

// --- RENDERIZADO PERSONALIZADO DE ETIQUETAS (PIE CHART) ---
const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, payload }) => {
  if (percent < 0.01) return null;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  
  const itemColor = getColor(name);
  const textColor = getContrastColor(itemColor);
  const isPlastic = name.toLowerCase().includes('plásticos');

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={itemColor} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={itemColor} stroke="none" />
      <rect 
        x={cos >= 0 ? ex + 5 : ex - 45} 
        y={ey - 12} 
        width={42} 
        height={24} 
        rx={4} 
        fill="white" 
        stroke={itemColor}
        strokeWidth={1.5}
        className="drop-shadow-sm"
      />
      <text 
        x={cos >= 0 ? ex + 26 : ex - 24} 
        y={ey} 
        textAnchor="middle" 
        // Si es plástico (fondo blanco/claro), forzamos texto oscuro si el contraste automático no lo detecta
        fill={isPlastic ? '#000000' : (textColor === '#FFFFFF' ? '#333' : textColor)}
        fontSize={10} 
        fontWeight="800" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

// --- ETIQUETA BARRA CON CONTRASTE ---
const CustomBarLabel = (props) => {
  const { x, y, width, height, value, index, data } = props;
  const item = data && data[index];
  if (!item) return null;
  
  const isPeligrosos = data.some(d => d.name === 'Hidrocarburos');
  const color = getColor(item.name, isPeligrosos ? 'peligrosos' : '');
  const textColor = getContrastColor(color);
  
  // Detectar plásticos para borde visual en la barra
  const isPlastic = item.name.toLowerCase().includes('plásticos');

  return (
    <g>
      <line 
        x1={x + width} 
        y1={y + height / 2} 
        x2={x + width + 10} 
        y2={y + height / 2} 
        stroke="#94a3b8" 
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <circle cx={x + width + 10} cy={y + height / 2} r={2} fill="#94a3b8" />
      <text 
        x={x + width + 15} 
        y={y + height / 2} 
        dy={-3} 
        fill="#475569" 
        fontSize={10} 
        fontWeight="bold"
        dominantBaseline="middle"
      >
        {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn
      </text>
      <text 
        x={x + width + 15} 
        y={y + height / 2} 
        dy={8} 
        fill={textColor === '#FFFFFF' ? '#64748b' : textColor} 
        fontSize={9} 
        fontWeight="bold"
        dominantBaseline="middle"
      >
        ({item.percentage}%)
      </text>
    </g>
  );
};

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
           <p className="text-xs text-slate-500 mt-1">Datos Reales 2025</p>
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
                  formatter={(value) => [`${value.toLocaleString()} Tn`, 'Cantidad']}
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
                <p className="text-2xl font-black text-slate-800">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">Tn</span></p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Promedio Mes</p>
                <p className="text-2xl font-black text-slate-800">{Number((total / 12).toFixed(2)).toLocaleString()} <span className="text-sm font-normal text-slate-400">Tn</span></p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pico Máximo</p>
                <p className="text-2xl font-black text-slate-800">{Math.max(...data.map(d => d.value)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">Tn</span></p>
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
  const calculateTotal = (items) => items.reduce((acc, curr) => acc + curr.value, 0);

  const processForChart = (items, totalSum) => items.map(i => {
    return {
      name: i.name,
      value: i.value,
      percentage: totalSum > 0 ? ((i.value / totalSum) * 100).toFixed(1) : 0,
      fullData: i
    };
  });

  const totalAprovechables = calculateTotal(currentData.noPeligrosos.aprovechable);
  const dataNoPeligrososA = processForChart(currentData.noPeligrosos.aprovechable, totalAprovechables);
  
  const totalNoAprovechables = calculateTotal(currentData.noPeligrosos.noAprovechable);
  const dataNoPeligrososB = processForChart(currentData.noPeligrosos.noAprovechable, totalNoAprovechables);

  const totalPeligrosos = calculateTotal(currentData.peligrosos);
  const dataPeligrosos = processForChart(currentData.peligrosos, totalPeligrosos);

  // KPI PRINCIPAL 
  const totalGeneradoKPI = totalAprovechables + totalNoAprovechables + 
                           calculateTotal(currentData.noPeligrosos.organicos) + 
                           totalPeligrosos + 
                           calculateTotal(currentData.bienesPriorizados) + 
                           calculateTotal(currentData.descarte);
  
  const totalAprovechadoKPI = totalGeneradoKPI - totalNoAprovechables - (selectedPlant === 'all' ? 0 : 0); 
  const eficiencia = (totalAprovechadoKPI / totalGeneradoKPI) * 100;

  const handleSelect = (item) => {
    setSelectedIndicator({
      title: item.name,
      subtext: item.items,
      trend: item.trend
    });
  };

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

           {/* KPI PRINCIPAL */}
           <div className="flex gap-4">
             <div className="bg-slate-900 text-white px-5 py-2 rounded-lg flex flex-col justify-center shadow-xl ring-1 ring-white/20 min-w-[140px]">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-right">Generado 2025</p>
               <p className="text-xl font-mono font-bold text-white leading-none text-right">
                 {totalGeneradoKPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 font-sans">Tn</span>
               </p>
             </div>
             <div className="bg-emerald-900 text-white px-5 py-2 rounded-lg flex flex-col justify-center shadow-xl ring-1 ring-white/20 min-w-[140px]">
               <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest text-right">Aprovechado</p>
               <p className="text-xl font-mono font-bold text-emerald-400 leading-none text-right">
                 {totalAprovechadoKPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-emerald-600 font-sans">Tn</span>
               </p>
               <p className="text-[10px] text-right font-bold mt-1 bg-emerald-800 px-1 rounded self-end w-fit">
                 {eficiencia.toFixed(2)}%
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
            title="RESIDUOS NO PELIGROSOS" 
            icon={FileText} 
            colorClass="bg-emerald-100 text-emerald-700" 
          />
          
          <div className="p-8 space-y-10">
            
            {/* 1.A APROVECHABLES */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60 relative">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                 <h4 className="font-bold text-slate-700 flex items-center gap-2 text-lg uppercase">
                   <span className="w-2 h-8 rounded-full bg-emerald-500"></span> RESIDUO APROVECHABLE
                 </h4>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleCategoryTrend(currentData.noPeligrosos.aprovechable, "Aprovechables")}
                      className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <BarChart2 size={14} /> Tendencia Global
                    </button>
                    <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                      Total: {totalAprovechables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* GRÁFICO CIRCULAR */}
                <div className="h-72 relative">
                  <h5 className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Distribución (%)</h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataNoPeligrososA}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80} 
                        paddingAngle={4}
                        dataKey="value"
                        label={renderCustomizedPieLabel}
                        labelLine={false} 
                      >
                        {dataNoPeligrososA.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getColor(entry.name)} 
                            stroke={entry.name.toLowerCase().includes('plásticos') ? '#475569' : 'transparent'} 
                            strokeWidth={entry.name.toLowerCase().includes('plásticos') ? 1 : 0} 
                          />
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
                        <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn`} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                          {dataNoPeligrososA.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getColor(entry.name)} 
                              stroke={entry.name.toLowerCase().includes('plásticos') ? '#475569' : 'transparent'} 
                              strokeWidth={entry.name.toLowerCase().includes('plásticos') ? 1 : 0} 
                            />
                          ))}
                          <LabelList 
                            dataKey="name" 
                            position="insideLeft" 
                            style={{fill: '#1e293b', fontSize: '10px', fontWeight: 'bold', textShadow: '0 0 2px white'}} // Sombra ligera para legibilidad universal
                          />
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
                      className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
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
                       <h4 className="font-bold text-slate-700 uppercase">RESIDUO NO APROVECHABLES</h4>
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
                             <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn`} />
                             <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                               {dataNoPeligrososB.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
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
                     <h4 className="font-bold text-amber-900 uppercase flex items-center gap-2">
                       <Leaf size={18} className="text-amber-700" /> 
                       RESIDUO ORGÁNICOS, BIODEGRADABLES
                     </h4>
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
                title="2. RESIDUOS PELIGROSOS" 
                icon={AlertTriangle} 
                colorClass="bg-red-50 text-red-600" 
                onShowTrend={() => handleCategoryTrend(currentData.peligrosos, "Residuos Peligrosos")}
             />
             <div className="p-6">
                <div className="h-64 mb-6">
                   <h5 className="text-[10px] text-slate-400 font-bold uppercase mb-2 text-center">Cantidad (Tn)</h5>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataPeligrosos} margin={{top: 20}}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} tickFormatter={(val) => val.split(' ')[0]} />
                         <Tooltip cursor={{fill: '#fef2f2'}} formatter={(val) => `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tn`} />
                         <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={(data) => handleSelect(data.payload.fullData)} className="cursor-pointer">
                            {dataPeligrosos.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={getColor(entry.name, 'peligrosos')} />
                            ))}
                            <LabelList dataKey="value" position="top" style={{fontSize: '11px', fill: '#991b1b', fontWeight: 'bold'}} formatter={(v) => `${v.toFixed(2)}`} />
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
                         <div className="w-2 h-2 rounded-full shrink-0" style={{background: getColor(item.name, 'peligrosos')}}></div>
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
                    title="3. RESIDUOS DE BIENES PRIORIZADOS" 
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
                         <div className="mt-2 text-2xl font-black text-slate-800">{calculateTotal([item]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">Tn</span></div>
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
                            <div className="font-black text-slate-800">{calculateTotal([item]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="text-[10px] text-slate-500">Tn</div>
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