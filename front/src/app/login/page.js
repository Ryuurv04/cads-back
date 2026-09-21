// src/app/login/page.js
'use client';

import Image from 'next/image';
import { useLogin } from './useLogin';
import FormLogin from './formularios/formLogin';

export default function LoginPage() {
    const {
        email, setEmail,
        password, setPassword,
        handleSubmit,
        requiereRoleSelection,
        roles,
        rolSeleccionado, setRolSeleccionado,
        atras,
        selectRole,
    } = useLogin();

    const version = process.env.NEXT_PUBLIC_VERSION;
    if (requiereRoleSelection === true) {
        return (
            <div className=' h-screen w-screen flex flex-col justify-center items-center gap-4 bg-linear-to-b from-yellow-400 to-yellow-900'>
                <div className='bg-white rounded-2xl p-10 w-auto '>
                    <div className='text-center p-4 text-black'>
                        <h1 className='text-xl font-bold'>Gestion de Inventario</h1>
                        <p className='text-sm text-gray-600'>Selecciona tu rol para continuar</p>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <select className='w-full border px-4 py-2 rounded-2xl '
                            value={rolSeleccionado}
                            onChange={(e) => setRolSeleccionado(e.target.value)}
                        >
                            <option value="" disabled>Selecciona un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.cod_rol} value={rol.cod_rol}>
                                    {rol.nombre_rol}
                                </option>
                            ))}
                        </select>
                        <div className='flex gap-4 justify-between'>
                            <button
                                onClick={atras}
                                className='w-full border p-2 rounded-2xl border-red-400 text-red-400 hover:text-white hover:bg-red-400' type="button"
                            >
                                Atras
                            </button>
                            <button
                                onClick={() => selectRole(rolSeleccionado)}
                                className='w-full border p-2 rounded-2xl border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400' type="button"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='grid min-h-screen bg-[var(--paper)] grid-cols-[1.05fr_1fr]'>
            <section className='left'>
                {/*brand*/}
                <div className='flex items-center gap-2.5 text-[22px] font-semibold
                [font-family:var(--f-display)] z-[2] tracking-[-0.02em] ' >
                    <Image src="/innvix-x-mark.svg" width={28} height={28} alt="" priority style={{ width: '28px', height: '28px' }} />
                    <span>INNVIX</span>
                </div>
                <svg className="orbit-deco" viewBox="0 0 460 460" fill="none" stroke="currentColor">
                    <circle cx="230" cy="230" r="60" strokeOpacity=".18" />
                    <circle cx="230" cy="230" r="120" strokeOpacity=".14" strokeDasharray="3 8" />
                    <circle cx="230" cy="230" r="190" strokeOpacity=".12" />
                    <circle cx="230" cy="230" r="220" strokeOpacity=".09" strokeDasharray="2 10" />
                    <circle className="dot" cx="118" cy="158" r="6" stroke="none" />
                    <circle className="dot" cx="350" cy="290" r="3.5" stroke="none" />
                    <circle className="dot" cx="280" cy="60" r="2.5" stroke="none" />
                    <circle className="dot" cx="118" cy="158" r="14" strokeOpacity=".25" fill="none" />
                </svg>
            <div className="hero">
                <h1>Tu institución,<br/><span className="accent">en una sola</span><br/>plataforma.</h1>
                <p>Una sola plataforma para digitalizar la operación de la institución: centraliza la información, agiliza los procesos de cada área y reemplaza el papel y las hojas de cálculo dispersas por un entorno único y trazable.</p>

                <div className="feat-list">
                <div className="feat">
                    <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></span>
                    <div className="tx"><h3>Procesos más ágiles</h3><p>Flujos digitales y aprobaciones que reducen tiempos y eliminan el papel.</p></div>
                </div>
                <div className="feat">
                    <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6.5a3 3 0 0 1 0 5"/><path d="M18 20a6 6 0 0 0-3-5.2"/></svg></span>
                    <div className="tx"><h3>Todas las áreas conectadas</h3><p>Cada equipo trabaja en un mismo lugar, con información compartida y al día.</p></div>
                </div>
                <div className="feat">
                    <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v9l6 4"/></svg></span>
                    <div className="tx"><h3>Visibilidad y control</h3><p>Datos centralizados y trazables para decidir con información confiable.</p></div>
                </div>
                </div>
            </div>

                <div className="footer">
                    <span>© 2026 · WEB-INNOVA STUDIO</span>
                    <span>{version}</span>
                </div>
            </section>
            <section className="right">
                <FormLogin
                    email={email} setEmail={setEmail}
                    password={password} setPassword={setPassword}
                    onSubmit={handleSubmit}
                />
            </section>
        </div>
    );
}
