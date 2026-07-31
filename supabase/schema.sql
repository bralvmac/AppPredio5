-- ==============================================================================
-- SCHEMA SQL PARA SUPABASE - BUSCADOR DE ROTEIROS DE AULAS PRÁTICAS
-- ==============================================================================

-- 1. Criação da Tabela de Roteiros
CREATE TABLE IF NOT EXISTS public.roteiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tema TEXT NOT NULL,
    curso TEXT NOT NULL,
    tipo_curso TEXT NOT NULL CHECK (tipo_curso IN ('Presencial', 'Semi-presencial')),
    modelo_componente TEXT NOT NULL CHECK (modelo_componente IN ('Básico', 'Específico')),
    disciplina TEXT NOT NULL,
    docente TEXT NOT NULL,
    tutor TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    pdf_url TEXT NOT NULL,
    arquivo_path TEXT DEFAULT '',
    duracao_minutos INT DEFAULT 120,
    laboratorio_tipo TEXT DEFAULT 'Laboratório Multidisciplinar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices para Otimização de Buscas e Filtros
CREATE INDEX IF NOT EXISTS idx_roteiros_curso ON public.roteiros(curso);
CREATE INDEX IF NOT EXISTS idx_roteiros_tipo_curso ON public.roteiros(tipo_curso);
CREATE INDEX IF NOT EXISTS idx_roteiros_modelo ON public.roteiros(modelo_componente);
CREATE INDEX IF NOT EXISTS idx_roteiros_disciplina ON public.roteiros(disciplina);
CREATE INDEX IF NOT EXISTS idx_roteiros_docente ON public.roteiros(docente);
CREATE INDEX IF NOT EXISTS idx_roteiros_tutor ON public.roteiros(tutor);

-- 3. Habilita RLS (Row Level Security) com Acesso Público de Leitura
ALTER TABLE public.roteiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica de roteiros"
ON public.roteiros FOR SELECT
USING (true);

CREATE POLICY "Permitir insercao de roteiros"
ON public.roteiros FOR INSERT
WITH CHECK (true);

-- 4. Inserção de Dados Iniciais de Demonstração
INSERT INTO public.roteiros (titulo, tema, curso, tipo_curso, modelo_componente, disciplina, docente, tutor, descricao, pdf_url, duracao_minutos, laboratorio_tipo)
VALUES 
(
    'Dissecção e Identificação das Estruturas do Sistema Cardiorrespiratório',
    'Anatomia do Coração e Pulmões',
    'Medicina',
    'Presencial',
    'Básico',
    'Anatomia Humana I',
    'Prof. Dr. Ricardo Mendonça',
    'Dra. Camila Alencar',
    'Identificação prática das cavidades cardíacas, valvas, grandes vasos e lobos pulmonares em peças anatômicas preservadas.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    120,
    'Laboratório de Anatomia e Peças Úmidas'
),
(
    'Técnicas de Assepsia, Paramentação Cirúrgica e Punção Venosa Periférica',
    'Procedimentos Fundamentais de Enfermagem',
    'Enfermagem',
    'Presencial',
    'Específico',
    'Fundamentos de Enfermagem II',
    'Profª. Dra. Vanessa Santos',
    'Enf. Marcos Vinícius',
    'Treinamento prático em manequins simuladores para lavagem cirúrgica das mãos, calçamento de luvas estéreis e punção de acesso venoso.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    180,
    'Laboratório de Habilidades de Enfermagem'
),
(
    'Titulação Ácido-Base e Preparo de Soluções Tampão Biológicas',
    'Equilíbrio Ácido-Base em Sistemas Biológicos',
    'Biomedicina',
    'Semi-presencial',
    'Básico',
    'Bioquímica Geral e Humana',
    'Prof. Dr. Guilherme Silveira',
    'Bioquím. Juliana Paes',
    'Medição de pH com potenciômetro digital, curvas de titulação de aminoácidos e verificação do efeito tampão fosfato.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    90,
    'Laboratório de Química e Bioquímica'
);

-- ==============================================================================
-- 5. Configuração do Storage Bucket para PDFs
-- (Execute caso queira usar o armazenamento de arquivos no Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('roteiros-pdf', 'roteiros-pdf', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Acesso Publico de Leitura aos PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'roteiros-pdf');

CREATE POLICY "Permitir Upload de PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'roteiros-pdf');
