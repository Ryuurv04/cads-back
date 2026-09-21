// src/components/GraficoDeBarras.jsx
'use client';
import React, { PureComponent } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function GraficoDeBarras({ data, xAxisDataKey, barDataKey, barName, title }) {
    // Validaciones básicas de props, igual que antes
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                <p>No hay datos disponibles para la gráfica de {title || 'este tipo'}.</p>
            </div>
        );
    }
    return (        
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={20}>
                    <CartesianGrid vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey={xAxisDataKey} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }}/>                    
                    <Tooltip cursor={{ fill: 'transparent' }}  />                    
                    <Bar dataKey={barDataKey}  fill="#8884d8" radius={[0, 0, 4, 4]} name="Total" />                
                </BarChart>
            </ResponsiveContainer>
    );
}

export default GraficoDeBarras;