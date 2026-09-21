'use client';
import React, { PureComponent } from 'react';
import { Cell, Pie, PieChart,  Tooltip, Legend, ResponsiveContainer } from 'recharts';




function GraficoDePie({ data, xAxisDataKey, barDataKey, barName, title }) {
    // Validaciones básicas de props, igual que antes
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                <p>No hay datos disponibles para la gráfica de {title || 'este tipo'}.</p>
            </div>
        );
    }
    const testData = [
  { cantidad: 7, sub_area: "Compras" },
  { cantidad: 12, sub_area: "TIC" },
  { cantidad: 9, sub_area: "MM" },
  { cantidad: 7, sub_area: "MEM" },
];
    console.log(data);
    const COLORS = ['#0088FE', '#00C49F',  '#FF8042', '#FF00FF'];

    return (
        <div style={{ marginBottom: '40px', border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            {title && <h2>{title}</h2>} {/* Muestra el título si se proporciona */}
            <ResponsiveContainer  height={300}>
                <PieChart>
                    <Pie
                        data={testData}
                        dataKey={'cantidad'} // La clave que contiene el valor numérico (ej. 'cantidad')
                        nameKey={'sub_area'} // La clave que contiene el nombre de la categoría (ej. 'descripcion' o 'area')
                        cx="50%" // Centro del pastel en X
                        cy="50%" // Centro del pastel en Y
                        outerRadius={80} // Radio exterior del pastel
                        fill="#8884d8"
                        labelLine={false} // Deshabilita las líneas que conectan el texto de la etiqueta
                       
                    >
                        {
                            // Asigna un color a cada sección del pastel
                            data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                        }
                    </Pie>
                    <Tooltip /> {/* Muestra información detallada al pasar el ratón */}
                    <Legend /> {/* Muestra la leyenda de colores y nombres */}
                </PieChart>
            </ResponsiveContainer>
           
        </div>
    );
}

export default GraficoDePie;