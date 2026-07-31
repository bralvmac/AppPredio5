import { createClient } from '@supabase/supabase-js';
import { Roteiro } from '../types/roteiro';
import { MOCK_ROTEIROS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'sua-url-aqui' &&
  supabaseUrl.includes('supabase.co')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'app_roteiros_locais';

// Função utilitária para buscar todos os roteiros (Supabase DB ou Local/Mock)
export async function buscarRoteiros(): Promise<Roteiro[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('roteiros')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data !== null) {
        return data.map((item: any) => ({
          id: item.id,
          titulo: item.titulo,
          tema: item.tema,
          curso: item.curso,
          tipoCurso: item.tipo_curso,
          modeloComponente: item.modelo_componente,
          disciplina: item.disciplina,
          docente: item.docente,
          tutor: item.tutor || item.docente,
          descricao: item.descricao,
          pdfUrl: item.pdf_url,
          arquivoPath: item.arquivo_path,
          dataCriacao: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
      }
    } catch (err) {
      console.warn("Supabase com erro de consulta. Usando armazenamento local.", err);
    }
  }

  // Fallback se o Supabase não estiver configurado
  const locais = localStorage.getItem(STORAGE_KEY);
  if (locais) {
    try {
      const parsed = JSON.parse(locais);
      return [...parsed, ...MOCK_ROTEIROS];
    } catch (e) {
      return MOCK_ROTEIROS;
    }
  }

  return MOCK_ROTEIROS;
}

// Função utilitária para cadastrar novo roteiro com upload de PDF
export async function cadastrarRoteiro(
  novo: Omit<Roteiro, 'id' | 'dataCriacao'>,
  pdfArquivo?: File
): Promise<Roteiro> {
  let finalPdfUrl = novo.pdfUrl;
  let finalFilePath = '';

  // 1. Tenta upload no Supabase Storage se configurado e com arquivo
  if (isSupabaseConfigured && supabase && pdfArquivo) {
    try {
      const fileName = `${Date.now()}_${pdfArquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('roteiros-pdf')
        .upload(fileName, pdfArquivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Erro no upload do PDF para o Supabase Storage:", uploadError);
      } else if (uploadData) {
        finalFilePath = uploadData.path;
        const { data: publicUrlData } = supabase
          .storage
          .from('roteiros-pdf')
          .getPublicUrl(uploadData.path);
        
        if (publicUrlData?.publicUrl) {
          finalPdfUrl = publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Falha no upload do Supabase Storage, utilizando URL informada/fallback local.", err);
    }
  }

  const roteiroCriado: Roteiro = {
    ...novo,
    id: `rot-${Date.now()}`,
    pdfUrl: finalPdfUrl,
    arquivoPath: finalFilePath,
    dataCriacao: new Date().toISOString().split('T')[0]
  };

  // 2. Tenta salvar no Supabase DB se configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('roteiros')
        .insert([
          {
            titulo: novo.titulo,
            tema: novo.tema,
            curso: novo.curso,
            tipo_curso: novo.tipoCurso,
            modelo_componente: novo.modeloComponente,
            disciplina: novo.disciplina,
            docente: novo.docente,
            tutor: novo.docente,
            descricao: novo.descricao || '',
            pdf_url: finalPdfUrl,
            arquivo_path: finalFilePath
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar no banco Supabase:", error);
      } else if (data) {
        return {
          id: data.id,
          titulo: data.titulo,
          tema: data.tema,
          curso: data.curso,
          tipoCurso: data.tipo_curso,
          modeloComponente: data.modelo_componente,
          disciplina: data.disciplina,
          docente: data.docente,
          tutor: data.tutor,
          descricao: data.descricao,
          pdfUrl: data.pdf_url,
          arquivoPath: data.arquivo_path,
          dataCriacao: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      }
    } catch (err) {
      console.warn("Salvando localmente devido a falha de conexão com o banco.", err);
    }
  }

  // 3. Fallback Local Storage
  const locaisStr = localStorage.getItem(STORAGE_KEY);
  const locais = locaisStr ? JSON.parse(locaisStr) : [];
  locais.unshift(roteiroCriado);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locais));

  return roteiroCriado;
}

// Função utilitária para excluir roteiro (do Supabase DB, Storage e LocalStorage)
export async function deletarRoteiro(id: string, arquivoPath?: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: dbError } = await supabase
        .from('roteiros')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error("Erro ao excluir roteiro do banco Supabase:", dbError);
      }

      if (arquivoPath) {
        await supabase.storage.from('roteiros-pdf').remove([arquivoPath]);
      }
    } catch (err) {
      console.warn("Erro durante exclusão no Supabase:", err);
    }
  }

  const locaisStr = localStorage.getItem(STORAGE_KEY);
  if (locaisStr) {
    try {
      const locais: Roteiro[] = JSON.parse(locaisStr);
      const novosLocais = locais.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novosLocais));
    } catch (e) {
      console.error("Erro ao atualizar LocalStorage após deleção:", e);
    }
  }

  return true;
}
