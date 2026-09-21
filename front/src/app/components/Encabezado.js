import React from 'react';


const Encabezado = ({ eyebrow, title, em, sub, actions, meta }) => (
    <div className="screen-header p-[36px_36px_28px] border-b border-[var(--line)] bg-[var(--paper-2)] flex items-end justify-between gap-6">
        <div>
        {eyebrow && <div className="h-eyebrow mb-3.5">{eyebrow}</div>}
        <h1 className="h-display text-[40px] m-0 font-semibold">
            {title}{em && <span className={'text-[var(--accent)]'}> {em}</span>}
        </h1>
        {sub && <div className="mt-3.5 text-[var(--ink-3)] text-[14.5px] max-w-[680px] leading-[1.55]">{sub}</div>}
        {meta && (
            <div className="flex gap-[28px] mt-[22px]" >
            {meta.map((m, i) => (
                <div key={i} className="flex flex-col gap-1">
                <span className="font-[family-name:var(--f-sans)] font-semibold text-[11px] leading-none text-[var(--ink-4)]">{m.k}</span>
                <span className="font-[family-name:var(--f-sans)] font-normal text-[14px] leading-[1.2] text-[var(--ink)]">{m.v}</span>
                </div>
            ))}
            </div>
        )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
);
export default Encabezado;