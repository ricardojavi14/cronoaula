import { useNavigate } from 'react-router';
import { useMemo } from 'react';

export default function CreateDefaultNotFoundPage() {
  const navigate = useNavigate();

  const missingPath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.pathname.replace(/^\//, '');
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Página no encontrada</h1>
        <p className="text-slate-600 mb-2">
          La ruta <span className="font-semibold">/{missingPath}</span> no existe en CronoAula.
        </p>
        <p className="text-slate-500 mb-6">
          Puedes volver al inicio para crear sesiones, revisar tus sesiones guardadas o abrir el modo clase.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
