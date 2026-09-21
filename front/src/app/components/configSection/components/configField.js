

export default function Field({ label, sub, children }){ 
    return(
  <div style={{
    display:'grid', gridTemplateColumns:'260px 1fr', gap: 32,
    padding: '20px 0', borderBottom: '1px solid var(--line-2)',
    alignItems:'flex-start',
  }}>
    <div>
      <div style={{ font:'500 13px/1.2 var(--f-sans)', color:'var(--ink)' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
    <div>{children}</div>
  </div>)
};