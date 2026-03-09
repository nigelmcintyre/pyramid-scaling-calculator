import React, { useState, useEffect, useMemo } from 'react';
import { Download, AlertCircle, Info, TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DipBuyingCalculator() {
  // --- State: Core Parameters ---
  const [assetName, setAssetName] = useState('Nasdaq 100');
  const [positionType, setPositionType] = useState('long'); // 'long' or 'short'
  const [initialPrice, setInitialPrice] = useState(24500);
  const [finalPrice, setFinalPrice] = useState(15000);
  const [priceInterval, setPriceInterval] = useState(500);
  const [leverage, setLeverage] = useState(20);
  const [initialMargin, setInitialMargin] = useState(25);
  const [marginIncrement, setMarginIncrement] = useState(12.50);
  const [totalCapital, setTotalCapital] = useState(5000);

  // --- Calculations ---
  const calculationData = useMemo(() => {
    let rows = [];
    let currentPrice = Number(initialPrice);
    let count = 0;
    
    let runningMargin = 0;
    let runningExposure = 0;
    let weightedPriceNumerator = 0;
    let totalUnits = 0;

    const isLong = positionType === 'long';

    // Safety break to prevent infinite loops if user enters 0 or negative interval
    const validInterval = Math.max(1, Number(priceInterval));
    
    // Determine the valid boundary based on position type
    const validFinal = isLong 
      ? Math.min(Number(initialPrice), Number(finalPrice)) 
      : Math.max(Number(initialPrice), Number(finalPrice));

    // Loop until we pass the final price target
    const condition = () => isLong 
      ? currentPrice >= validFinal - 0.01 
      : currentPrice <= validFinal + 0.01;

    while (condition()) {
      // 1. Margin Used at Interval N
      const marginUsed = Number(initialMargin) + (count * Number(marginIncrement));
      
      // 2. Leveraged Position Size
      const leveragedSize = marginUsed * Number(leverage);
      
      // 3. Calculate Units Bought/Shorted (Size / Price)
      const units = leveragedSize / currentPrice;
      totalUnits += units;

      // 4. Update Totals
      runningMargin += marginUsed;
      runningExposure += leveragedSize;
      
      // Weighted Average Calc: Price * Exposure
      weightedPriceNumerator += (currentPrice * leveragedSize);

      rows.push({
        interval: count,
        price: currentPrice,
        marginUsed: marginUsed,
        leveragedSize: leveragedSize,
        cumulativeMargin: runningMargin,
        cumulativeExposure: runningExposure,
      });

      // Step price up or down based on position type
      if (isLong) {
        currentPrice -= validInterval;
      } else {
        currentPrice += validInterval;
      }
      count++;
    }

    const totalIntervals = rows.length;
    const weightedAvgPrice = runningExposure > 0 ? weightedPriceNumerator / runningExposure : 0;
    const remainingCapital = Number(totalCapital) - runningMargin;
    const isOverBudget = remainingCapital < 0;

    // --- Estimated Equity at Worst Price ---
    // The worst price is the price of the last row reached
    const terminalPrice = rows.length > 0 ? rows[rows.length - 1].price : Number(initialPrice);
    
    // Value of all units held at that worst price
    const positionValueAtTerminal = totalUnits * terminalPrice;
    
    // Unrealized PnL = (Current Value - Cost Basis) for longs, (Cost Basis - Current Value) for shorts
    const unrealizedPnL = isLong 
      ? (positionValueAtTerminal - runningExposure)
      : (runningExposure - positionValueAtTerminal);
    
    // Projected Equity = Starting Capital + Unrealized PnL
    const projectedEquity = Number(totalCapital) + unrealizedPnL;

    return { 
      rows, 
      totalIntervals, 
      totalMargin: runningMargin, 
      totalExposure: runningExposure, 
      weightedAvgPrice, 
      remainingCapital, 
      isOverBudget,
      projectedEquity,
      terminalPrice
    };
  }, [positionType, initialPrice, finalPrice, priceInterval, leverage, initialMargin, marginIncrement, totalCapital]);

  // --- Handlers ---
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  const handleStepsChange = (e) => {
    const steps = Number(e.target.value);
    if (steps > 0) {
      const range = Math.abs(Number(initialPrice) - Number(finalPrice));
      const newInterval = range / steps;
      setPriceInterval(newInterval);
    }
  };

  // Calculate current derived steps for display
  const currentDerivedSteps = Math.abs(Number(initialPrice) - Number(finalPrice)) / Number(priceInterval);

  const downloadCSV = () => {
    const headers = ["Interval", "Price Level", "Margin Used", "Leveraged Size", "Cumulative Margin", "Cumulative Exposure"];
    const csvContent = [
      headers.join(","),
      ...calculationData.rows.map(row => 
        `${row.interval},${row.price},${row.marginUsed},${row.leveragedSize},${row.cumulativeMargin},${row.cumulativeExposure}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${assetName.replace(/\s+/g, '_').toLowerCase()}_pyramid_strategy.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const isLong = positionType === 'long';
  const themeColor = isLong ? '#2563eb' : '#dc2626'; // Blue for long, Red for short
  const themeClass = isLong ? 'text-blue-600' : 'text-red-600';
  const bgThemeClass = isLong ? 'bg-blue-600' : 'bg-red-600';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {isLong ? <TrendingDown className={themeClass} /> : <TrendingUp className={themeClass} />}
              Pyramid Scaling Calculator
            </h1>
            <p className="text-gray-500 text-sm mt-1">{assetName} {isLong ? 'Averaging Down' : 'Averaging Up'} Strategy</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-gray-400" /> Configuration
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Asset Name</label>
                    <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Direction</label>
                    <select value={positionType} onChange={(e) => setPositionType(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="long">Long (Buy Dips)</option>
                      <option value="short">Short (Sell Rips)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Price</label>
                    <input type="number" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Price</label>
                    <input type="number" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Steps</label>
                    <input 
                      type="number" 
                      value={Math.round(currentDerivedSteps)} 
                      onChange={handleStepsChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price Interval ($)</label>
                    <input 
                      type="number" 
                      value={Number(priceInterval).toFixed(2)} 
                      onChange={(e) => setPriceInterval(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Leverage (x)</label>
                    <input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Capital</label>
                    <input type="number" value={totalCapital} onChange={(e) => setTotalCapital(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">Margin Scaling</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Initial Margin</label>
                    <input type="number" value={initialMargin} onChange={(e) => setInitialMargin(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Increment ($)</label>
                    <input type="number" value={marginIncrement} onChange={(e) => setMarginIncrement(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Card */}
            <div className={`p-6 rounded-xl shadow-sm border ${calculationData.isOverBudget ? 'bg-orange-50 border-orange-200' : `${bgThemeClass} text-white`}`}>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>Weighted Avg Entry</p>
                  <p className={`text-3xl font-bold ${calculationData.isOverBudget ? 'text-orange-700' : 'text-white'}`}>{formatNumber(calculationData.weightedAvgPrice.toFixed(2))}</p>
                </div>

                {/* Projected Equity Section */}
                 <div>
                    <p className={`text-xs ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>Est. Equity at Worst Price ({formatNumber(calculationData.terminalPrice)})</p>
                    <p className={`text-xl font-bold ${calculationData.projectedEquity < 0 ? (isLong ? 'text-blue-200' : 'text-red-200') : (calculationData.isOverBudget ? 'text-orange-700' : 'text-white')}`}>
                        {formatCurrency(calculationData.projectedEquity)}
                    </p>
                    {calculationData.projectedEquity < 0 && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/90'}`}>
                            <AlertCircle size={12} /> Risk of Liquidation
                        </p>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-opacity-20 border-white">
                   <div>
                    <p className={`text-xs ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>Total Exposure</p>
                    <p className={`text-lg font-semibold ${calculationData.isOverBudget ? 'text-orange-700' : 'text-white'}`}>{formatCurrency(calculationData.totalExposure)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>Margin Used</p>
                    <p className={`text-lg font-semibold ${calculationData.isOverBudget ? 'text-orange-700' : 'text-white'}`}>{formatCurrency(calculationData.totalMargin)}</p>
                  </div>
                </div>

                 <div>
                    <div className="flex justify-between items-center mb-1">
                       <p className={`text-xs ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>Capital Utilization</p>
                       <p className={`text-xs ${calculationData.isOverBudget ? 'text-orange-600' : 'text-white/80'}`}>{((calculationData.totalMargin / totalCapital) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-black bg-opacity-20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${calculationData.isOverBudget ? 'bg-orange-500' : 'bg-white'}`} 
                        style={{width: `${Math.min(100, (calculationData.totalMargin / totalCapital) * 100)}%`}}
                      ></div>
                    </div>
                     {calculationData.isOverBudget && (
                      <div className="flex items-center gap-2 mt-2 text-orange-600 text-xs font-bold">
                        <AlertCircle size={14} /> 
                        Over Budget by {formatCurrency(Math.abs(calculationData.remainingCapital))}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* Visualization & Table Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Capital Deployment Pyramid</h3>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={calculationData.rows} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="price" 
                    reversed={isLong} 
                    label={{ value: `Asset Price (${isLong ? 'Descending' : 'Ascending'})`, position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis label={{ value: 'Exposure ($)', angle: -90, position: 'insideLeft' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name === 'leveragedSize' ? 'Position Size' : name]}
                    labelFormatter={(label) => `Price Level: ${label}`}
                  />
                  <Area type="monotone" dataKey="leveragedSize" stroke={themeColor} fillOpacity={1} fill="url(#colorExposure)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-gray-700">Interval Breakdown</h3>
                 <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{calculationData.totalIntervals} {isLong ? 'Buys' : 'Sells'}</span>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Step</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Margin Used</th>
                      <th className="px-6 py-3">Lev. Size</th>
                      <th className="px-6 py-3 text-right">Cum. Exposure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationData.rows.map((row) => (
                      <tr key={row.interval} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{row.interval}</td>
                        <td className="px-6 py-3">{formatNumber(row.price)}</td>
                        <td className={`px-6 py-3 font-medium ${themeClass}`}>{formatCurrency(row.marginUsed)}</td>
                        <td className="px-6 py-3">{formatCurrency(row.leveragedSize)}</td>
                        <td className="px-6 py-3 text-right text-gray-500">{formatCurrency(row.cumulativeExposure)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}