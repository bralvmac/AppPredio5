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
          curso: item.curso || 'Geral',
          tipoCurso: item.tipo_curso || 'Presencial',
          modeloComponente: item.modelo_componente || 'Básico',
          disciplina: item.disciplina || 'Geral',
          docente: item.docente || 'Não informado',
          tutor: item.tutor || item.docente || 'Não informado',
          descricao: item.descricao || '',
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

// Função utilitária para cadastrar 1 roteiro individual com PDF
export async function cadastrarRoteiro(
  novo: Omit<Roteiro, 'id' | 'dataCriacao'>,
  pdfArquivo?: File
): Promise<Roteiro> {
  const [criado] = await cadastrarRoteirosEmLote([{ dados: novo, pdfArquivo }]);
  return criado;
}

// Função utilitária para cadastrar MÚLTIPLOS roteiros em lote
export async function cadastrarRoteirosEmLote(
  itens: Array<{ dados: Omit<Roteiro, 'id' | 'dataCriacao'>; pdfArquivo?: File }>
): Promise<Roteiro[]> {
  const roteirosCriados: Roteiro[] = [];

  for (const item of itens) {
    let finalPdfUrl = item.dados.pdfUrl;
    let finalFilePath = '';

    // 1. Upload do arquivo PDF individual se houver Supabase
    if (isSupabaseConfigured && supabase && item.pdfArquivo) {
      try {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${item.pdfArquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('roteiros-pdf')
          .upload(fileName, item.pdfArquivo, {
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

    const objetoRoteiro: Roteiro = {
      ...item.dados,
      curso: item.dados.curso || 'Geral',
      tipoCurso: item.dados.tipoCurso || 'Presencial',
      modeloComponente: item.dados.modeloComponente || 'Básico',
      disciplina: item.dados.disciplina || 'Geral',
      docente: item.dados.docente || 'Não informado',
      id: `rot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pdfUrl: finalPdfUrl,
      arquivoPath: finalFilePath,
      dataCriacao: new Date().toISOString().split('T')[0]
    };

    // 2. Salva no banco de dados do Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('roteiros')
          .insert([
            {
              titulo: objetoRoteiro.titulo,
              tema: objetoRoteiro.tema,
              curso: objetoRoteiro.curso,
              tipo_curso: objetoRoteiro.tipoCurso,
              modelo_componente: objetoRoteiro.modeloComponente,
              disciplina: objetoRoteiro.disciplina,
              docente: objetoRoteiro.docente,
              tutor: objetoRoteiro.docente,
              descricao: objetoRoteiro.descricao || '',
              pdf_url: finalPdfUrl,
              arquivo_path: finalFilePath
            }
          ])
          .select()
          .single();

        if (!error && data) {
          objetoRoteiro.id = data.id;
        }
      } catch (err) {
        console.warn("Erro ao salvar registro individual no Supabase DB:", err);
      }
    }

    roteirosCriados.push(objetoRoteiro);
  }

  // 3. Atualiza LocalStorage como Fallback
  const locaisStr = localStorage.getItem(STORAGE_KEY);
  const locais = locaisStr ? JSON.parse(locaisStr) : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...roteirosCriados, ...locais]));

  return roteirosCriados;
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
