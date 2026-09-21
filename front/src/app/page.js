'use client'; 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {// si no existe un token que se genera al iniciar sesion lo manda al login
      router.replace('/login');
    }else {     
      router.replace('/dashboard'); // si existe el token lo manda al dashboard
    }
  }, [router]); 


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
      Cargando...
    </div>
  );
}