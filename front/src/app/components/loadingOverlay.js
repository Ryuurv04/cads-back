'use client';

const LoadingOverlay = ({ mensaje = 'Cargando...' }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl">
                {/* Spinner */}
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium text-sm">{mensaje}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
