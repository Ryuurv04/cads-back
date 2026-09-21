import React from 'react';

const TONES = {
    sage: { fg: 'var(--sage)', bg: 'var(--sage-soft)' },
    amber: { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
    'amber-soft': { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
    accent: { fg: 'var(--accent)', bg: 'var(--accent-soft)' },
};

export const Kpi = ({ label, value, chip }) => {
    const tone = TONES[chip?.tone] || TONES.accent;
    return (
        <div className="p-5 rounded-2xl border bg-[var(--paper-2)]" style={{ borderColor: 'var(--line)' }}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-4)]">{label}</div>
            <div className="text-[32px] font-semibold text-[var(--ink)] leading-tight mt-1">{value}</div>
            {chip && (
                <span
                    className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ color: tone.fg, background: tone.bg }}
                >
                    {chip.label}
                </span>
            )}
        </div>
    );
};
