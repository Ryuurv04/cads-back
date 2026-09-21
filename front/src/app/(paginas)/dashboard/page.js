'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
//import { equiposService } from '@/services/equiposServices';
import Encabezado from '@/app/components/Encabezado';
import { Kpi } from '@/app/components/widgets';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);


    if (!user) return null;

    return (
        <div>
            <Encabezado
                eyebrow="Resumen General"
                title="Dashboard"
                em={user.nombre_empresa}
                sub="Vista general del estado actual de tus equipos, solicitudes."
            />

            <div style={{ padding: '28px 36px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: 'span 3' }}>
                    <Kpi
                        label="Total equipos"
                        value={5}
                        chip={{ label: 'Equipos Registradoss', tone: 'sage' }}
                    />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                    <Kpi
                        label="Total solicitudes"
                        value={3}
                        chip={{ label: 'Solicitudes del mes', tone: 'amber-soft' }}
                    />
                </div>
            </div>
        </div>
    );
}
