'use client'

import { useState } from 'react';
import { useConfig } from './useConfig';
import RolesSection from '@/app/components/configSection/roles_permiso/roles';
import EquiposSection from '@/app/components/configSection/equipos/equipos';
import Icon from  '@/app/components/Icon'
import Encabezado from '@/app/components/Encabezado';


export default function Configuracion() {
    const { 
        tabActiva,
        filteredTabs,
        setTabActiva
    } = useConfig();

    return(
        <div className='h-screen flex flex-col'>
            <Encabezado
                eyebrow="Configuración"
                title="Configuración"
                em='general'
                sub="Parámetros, catálogos, roles y flujos de Orbit."
            />
            <div className='lg:grid lg:grid-cols-[240px_1fr] flex-1 min-h-0 block'>
                <nav className='lg:border-r lg:border-[var(--line)] p-4.5 bg-[var(--paper-2)] lg:overflow-y-auto'>
                    {filteredTabs.map(secction => (
                        <button key={secction.id} onClick={()=> setTabActiva(secction.id)} className={`
                        flex items-center gap-[10px]
                        w-full text-left
                        px-3 h-[34px] mb-[2px]
                        border-0 rounded-md
                        cursor-pointer
                        font-medium text-[13px] leading-none
                        ${
                            tabActiva === secction.id
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : "bg-transparent text-[var(--ink-2)]"
                        }
                        `}>
                            <Icon name={secction.ic} size={14}/><span className='flex-1'>{secction.label}</span>
                        </button>
                    ))

                    }
                </nav>
                <div className=" pt-7 px-9 pb-16 lg:overflow-y-auto">
                {tabActiva === 'roles_permisos' && <RolesSection />}
                {tabActiva === 'equipos' && <EquiposSection />}
            </div>
            </div>
        </div>
    );
}
