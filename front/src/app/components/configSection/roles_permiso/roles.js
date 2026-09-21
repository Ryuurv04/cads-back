'use client'

import ConfigSection from '../components/configSection';
import BotonAgregar from '@/app/components/botonAgregar';
import ConfigSectionBtn from '../components/configSectionBtn';
import { useRoles } from './useRoles';
import Icon from '@/app/components/Icon'



export default function Roles() {
        const {
            roles,
            loading,
            rolSeleccionado,
            cantPermisos,
            MODULES,
            perms,
            seleccionarRol,
            cargarRoles,
            setLevel,
            abrirFormRol

        } = useRoles();
    
    return (
        <ConfigSectionBtn  title={'Roles y permisos'} desc={"Define qué puede ver y hacer cada rol en cada módulo. Los cambios aplican a todos los usuarios con ese rol."}
        onClick={abrirFormRol} txtoBtn={'Nuevo Rol'}>  

            <div className="grid grid-cols-[260px_1fr] gap-5 items-start">
                {/* left card rols */}
                <div className="overflow-hidden sticky top-4 card">
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)', font:'600 12px/1 var(--f-sans)', color:'var(--ink-3)' }}>
                        {roles?.length} roles definidos
                    </div>
                    {loading && <p className="text-center text-sm py-4">Cargando...</p>}
                    {!loading && roles.length === 0 && <p className="text-center text-sm text-[var(--ink-3)] py-4">No hay roles registrados.</p>}
                    {!loading && roles.map((rol)=>(
                        <div key={rol.cod_rol} onClick={() => { seleccionarRol(rol)}}  className={`
                            block w-full text-left cursor-pointer
                            px-[16px] py-[14px]
                            border-0 border-b border-[var(--line-2)]
                            border-l-[3px]
                            ${
                                rolSeleccionado?.cod_rol == rol.cod_rol
                                ? "border-l-[var(--accent)] bg-[var(--accent-tint)]"
                                : "border-l-transparent bg-transparent"
                            }`}> 
                            <div className='flex items-center justify-between gap-2'>
                                <span className=' [font-family:var(--f-sans)] font-semibold text-[13.5px] leading-[1.2] text-[var(--ink)]'>{rol?.nombre_rol}</span>
                            </div>
                            <span className=' [font-family:var(--f-sans)] font-normal text-[11.5px] leading-[1.4] text-[var(--ink-3)] mt-1'>{rol?.descripcion}</span>
                        </div>
                    ))}
                </div>
                {/* end left cards rol */}
                {/* detalles */}
                <div>
                    {/* Header detalles */}
                    <div className="card py-5 px-5 mb-4.5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[13px] bg-[var(--accent)] text-white grid place-items-center shrink-0`}><Icon name={'users'} size={24}/></div>
                        <div className='flex-1'>
                            <div className='font-semibold [font-family:var(--f-display)] tracking-[-0.02em] text-[22px]'>{rolSeleccionado?.nombre_rol}</div>
                        </div>
                        <div className='flex gap-4'>
                            {cantPermisos.map( permiso => (
                                <div key={permiso.nombre} className={`text-center`}>
                                    <div className='[font-family:var(--f-display)] font-semibold text-[24px] leading-none [lineHeight:1]' style={{ color:`var(--${permiso.tone})` }}>{permiso.valor}</div>
                                    <div className='font-semibold [font-family:var(--f-sans)] text-[10px] text-[var(--ink-4)] mt-1'>{permiso.nombre}</div>
                                </div>

                            ))}
                        </div>
                    </div>
                    {/* detalles */}
                    <div className=' card overflow-hidden mb-6'>
                              
            {MODULES.map(mod => (
              <div key={mod.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 20px', borderBottom:'1px solid var(--line-2)' }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'var(--paper-3)', color:'var(--ink-2)', display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Icon name={mod.ic} size={15}/>
                </div>
                <div style={{ flex:1, font:'600 13.5px/1 var(--f-sans)' }}>{mod.label}</div>
                <SegLevels value={perms[mod.id] ?? 0} onChange={(nivel) => setLevel(mod.id, nivel)} />
              </div>
            ))}
          </div>
                </div>




            </div>
        </ConfigSectionBtn>
    )
}
const LEVELS = [
  { nivel:0, label:'Sin acceso', tone:'plum' },
  { nivel:1, label:'Lectura',    tone:'amber' },
  { nivel:2, label:'Edición',    tone:'cobalt' },
  { nivel:3, label:'Total',      tone:'sage' },
];
const SegLevels = ({ value, onChange }) => (
  <div style={{ display:'flex', border:'1px solid var(--line-strong)', borderRadius:8, overflow:'hidden', flexShrink:0 }}>
    {LEVELS.map((l, i) => {
      const on = value === l.nivel;
      return (
        <button key={l.nivel} onClick={() => onChange(l.nivel)} style={{
          padding:'7px 12px', border:0, cursor:'pointer',
          borderLeft: i>0 ? '1px solid var(--line)' : 'none',
          background: on ? `var(--${l.tone})` : 'var(--paper-2)',
          color: on ? 'white' : 'var(--ink-3)',
          font:'600 11.5px/1 var(--f-sans)',
          transition:'all .12s ease',
          minWidth:78, textAlign:'center',
        }}>{l.label}</button>
      );
    })}
  </div>
);