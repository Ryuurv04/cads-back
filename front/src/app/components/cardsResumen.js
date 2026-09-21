'use client';

import { FaServer, FaUserCheck, FaBoxOpen, FaTrash, FaTools } from 'react-icons/fa';

const CARDS_CONFIG = [
    {
        key: 'total',
        title: 'Total Equipos',
        staticSubtitle: 'Equipos registrados',
        icon: FaServer,
        text: 'text-blue-500',
        bg: 'bg-blue-100',
        border: 'border-b-blue-500',
        pct: false,
    },
    {
        key: 'asignados',
        title: 'Asignados',
        icon: FaUserCheck,
        text: 'text-emerald-500',
        bg: 'bg-emerald-100',
        border: 'border-b-emerald-500',
        pct: true,
    },
    {
        key: 'disponibles',
        title: 'Disponibles',
        icon: FaBoxOpen,
        text: 'text-indigo-500',
        bg: 'bg-indigo-100',
        border: 'border-b-indigo-500',
        pct: true,
    },
    {
        key: 'mantenimiento',
        title: 'En Mantenimiento',
        icon: FaTools,
        text: 'text-amber-500',
        bg: 'bg-amber-100',
        border: 'border-b-amber-500',
        pct: true,
    },
    {
        key: 'descarte',
        title: 'Descarte',
        icon: FaTrash,
        text: 'text-red-500',
        bg: 'bg-red-100',
        border: 'border-b-red-500',
        pct: true,
    },
];

export default function CardsResumen({ stats, isLoading }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {CARDS_CONFIG.map((card) => {
                if (isLoading) return <CardSkeleton key={card.key} />;

                const Icon = card.icon;
                const value = stats?.[card.key] ?? 0;
                const total = stats?.total ?? 0;
                const subtitle = card.pct && total > 0
                    ? `${Math.round((value / total) * 100)}% del total`
                    : card.staticSubtitle ?? '—';

                return (
                    <div
                        key={card.key}
                        className={`bg-white p-6 rounded-2xl shadow-sm flex flex-col relative overflow-hidden border-b-8 ${card.border} hover:shadow-md transition-shadow`}
                    >
                        <div className="absolute top-5 right-5">
                            <div className={`p-2 rounded-xl h-10 w-10 flex justify-center items-center ${card.bg} ${card.text}`}>
                                <Icon size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-bold text-gray-700 mb-4 pr-12 leading-tight">{card.title}</h3>
                        <span className="text-3xl font-black text-gray-800">{value}</span>
                        <p className="text-gray-400 text-xs font-medium mt-1">{subtitle}</p>
                    </div>
                );
            })}
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col relative overflow-hidden border-b-8 border-b-gray-200 animate-pulse h-36">
            <div className="absolute top-5 right-5 bg-gray-200 h-10 w-10 rounded-xl" />
            <div className="h-4 bg-gray-200 rounded w-3/5 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-2/5 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
        </div>
    );
}
