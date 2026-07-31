# 🧪 Buscador de Roteiros de Aula Prática

Aplicação web moderna, ultra-rápida e totalmente responsiva ("na palma da mão") desenvolvida para permitir a busca, filtragem e visualização instantânea de roteiros de aulas práticas para cursos universitários (Presencial e Semi-presencial, modelo Básico e Específico).

---

## ✨ Funcionalidades Principais

- 🔍 **Busca Inteligente & Filtros Combináveis**:
  - Filtro por **Curso** (Enfermagem, Biomedicina, Medicina, Farmácia, Fisioterapia, Nutrição, etc.)
  - Filtro por **Tipo de Curso** (*Presencial* vs *Semi-presencial*)
  - Filtro por **Modelo do Componente** (*Básico* vs *Específico*)
  - Filtro por **Docente** e **Tutor**
  - Filtro por **Disciplina/Matéria** e **Tema da Aula Prática**
  - Busca por palavra-chave genérica em tempo real.

- 📄 **Leitor de PDF Embutido (Modal)**:
  - Leitura rápida do roteiro em PDF sem sair da aplicação.
  - Opções para abrir em nova aba, download e compartilhamento de link.

- 📤 **Painel de Upload & Associação de Metadados**:
  - Formulário simples para envio de novos PDFs.
  - Associação automática com cursos, docentes, tutores e matérias.
  - Suporte a upload no **Supabase Storage** e sincronização com PostgreSQL.

- ⚡ **Modo Demonstração Híbrido**:
  - Se o Supabase ainda não estiver configurado no arquivo `.env`, o aplicativo funciona perfeitamente com dados demonstrativos pré-carregados e armazenamento local.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, TypeScript
- **Estilização**: Tailwind CSS, Glassmorphism UI, Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL, Storage Buckets, RLS)
- **Deploy**: Vercel

---

## 🚀 Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em `http://localhost:3000`.

---

## 🗄️ Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do Supabase e cole todo o conteúdo do arquivo [`supabase/schema.sql`](file:///c:/AppPredio5/supabase/schema.sql).
3. Obtenha a `URL` e `Anon Key` em **Project Settings > API**.
4. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

---

## 🌐 Deploy na Vercel

1. Suba o código para o GitHub/GitLab.
2. Conecte o repositório na [Vercel](https://vercel.com).
3. Adicione as Variáveis de Ambiente na Vercel (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
4. Clique em **Deploy**!
