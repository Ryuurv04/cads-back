// src/app/login/formularios/formLogin.js
'use client';

import Input from '@/app/components/inputs';

export default function FormLogin({ email, setEmail, password, setPassword, onSubmit }) {
    return (
        <form className="form-wrap" onSubmit={onSubmit}>
            <h2 className="form-title">Hola de nuevo 👋</h2>
            <p className="form-sub">Inicia sesión con tu cuenta corporativa para continuar.</p>
            <div className="row">
                <div>
                    <Input
                        label="Correo"
                        id="email"
                        type="email"
                        placeholder="correo@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        required
                    />
                </div>
                <div>
                    <Input
                        label="Contraseña"
                        id="pwd"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        required
                    />
                </div>
            </div>
            <button className="submit" type="submit">
                Iniciar sesión
                <svg className="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
            <div className="alt">
                <span>¿Sin cuenta? <a className="link" href="/registro">Solicítala aquí</a>.</span>
            </div>
        </form>
    );
}
