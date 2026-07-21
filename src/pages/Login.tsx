import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const ALLOWED_EMAILS = [
    'brisasofc@gmail.com',
    'isaacbomfim.00@gmail.com',
    'lucaswelglys@gmail.com'
  ];

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      
      if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
        await auth.signOut();
        alert('Acesso negado. Apenas administradores autorizados podem logar no sistema.');
        return;
      }
      
      navigate('/');
    } catch (error) {
      console.error('Login Error:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
          <Layers className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo ao organiZE</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          A plataforma definitiva para gerenciar seus fluxogramas de atividades, checklists e demandas.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continuar com o Google
        </button>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Pronto para produção
        </div>
      </div>
    </div>
  );
}
