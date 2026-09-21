
export default function SectionWrap ({ title, desc, children }) {
    return(
  <div className="max-w-[1040]">
    <div className="mb-5">
      <div className="[font-family:var(--f-display)] text-[28px] tracking-[-0.01em] font-semibold ">{title}</div>
      {desc && <div className="text-[var(--ink-3)] mt-[6px] text-[13px]">{desc}</div>}
    </div>
    {children}
  </div>)
};