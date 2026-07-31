import React from 'react';
import { Roteiro } from '../types/roteiro';
import { GraduationCap, BookCheck, Building2, Layers } from 'lucide-react';

interface StatsBannerProps {
  roteiros: Roteiro[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ roteiros }) => {
  const totalCursos = new Set(roteiros.map(r => r.curso)).size;
  const presenciais = roteiros.filter(r => r.tipoCurso === 'Presencial').length;
  const semiPresenciais = roteiros.filter(r => r.tipoCurso === 'Semi-presencial').length;
  const especificos = roteiros.filter(r => r.modeloComponente === 'Específico').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <BookCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-black text-white">{roteiros.length}</div>
          <div className="text-[11px] font-medium text-slate-400">Roteiros Práticos</div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-black text-white">{totalCursos}</div>
          <div className="text-[11px] font-medium text-slate-400">Cursos Cadastrados</div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-black text-white">{presenciais} <span className="text-xs font-normal text-slate-500">/ {semiPresenciais}</span></div>
          <div className="text-[11px] font-medium text-slate-400">Presencial / Semi</div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-black text-white">{especificos}</div>
          <div className="text-[11px] font-medium text-slate-400">Modelo Específico</div>
        </div>
      </div>

    </div>
  );
};
