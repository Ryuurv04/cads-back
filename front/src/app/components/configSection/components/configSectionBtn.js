
import BotonAgregar from '@/app/components/botonAgregar';
export default function SectionWrapBtn ({ title, desc, children, onClick,txtoBtn }) {
    
    return(
        <div className="max-w-[1040px]">  
            <div className='flex items-end justify-between mb-5.5' >
                <div>
                <div className='[font-family:var(--f-display)] text-[28px]  tracking-[-0.02em]  font-semibold'>{title}</div>
                {desc && <div className="text-[var(--ink-3)] mt-[6px] text-[13px]">{desc}</div>}
                </div>
                <BotonAgregar texto={txtoBtn?txtoBtn:'Agregar'} onClick={onClick}/>
            </div>
            {children}
        </div>
    )
};