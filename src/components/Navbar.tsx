import React from 'react';
import { FlaskConical, PlusCircle, Database, Sparkles, BookOpen } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface NavbarProps {
  totalRoteiros: number;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ totalRoteiros, onOpenUploadModal }) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo e Título */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
              <FlaskConical className="w-6 h-6 text-slate-950 font-bold stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Roteiros de Aula Prática
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Rápido & Inteligente
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Encontre, filtre e visualize seus materiais práticos instantaneamente
              </p>
            </div>
          </div>

          {/* Ações da direita & Status Supabase */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Status da Conexão */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              {isSupabaseConfigured ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Supabase Online
                </span>
              ) : (
                <span className="flex items-center text-amber-400 font-medium" title="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para sincronizar com o banco real">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                  Modo Demonstração
                </span>
              )}
            </div>

            {/* Contador de Roteiros */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{totalRoteiros} Roteiros</span>
            </div>

            {/* Botão Novo Upload */}
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300 hover:from-brand-300 hover:to-teal-200 shadow-md shadow-brand-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <PlusCircle className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>Cadastrar Roteiro</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
