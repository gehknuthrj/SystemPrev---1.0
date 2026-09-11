# Guia de Deploy na Vercel e Conexão com Supabase - PrevConsult

Este documento detalha passo a passo como fazer o deploy da aplicação **PrevConsult** na plataforma **Vercel** e conectar com o banco de dados **Supabase**.

---

## 1. Arquivos de Configuração Criados

Para garantir o funcionamento correto na Vercel e a conexão com o Supabase, foram preparados os seguintes arquivos no projeto:

* **`.env`**: Arquivo de ambiente local já preenchido com suas credenciais do Supabase.
* **`.env.example`**: Modelo de exemplo com as chaves necessárias documentadas.
* **`vercel.json`**: Configurações de build e reescrita de rotas SPA (Single Page Application) para evitar erros 404 ao atualizar páginas.
* **`src/vite-env.d.ts`**: Tipagem TypeScript para as variáveis de ambiente com prefixo `VITE_`.

---

## 2. Variáveis de Ambiente do Supabase

No Vite, qualquer variável que precise ser acessada no navegador deve começar obrigatoriamente com o prefixo **`VITE_`**.

As duas variáveis necessárias são:

| Nome da Variável | Valor Configurado |
| :--- | :--- |
| **`VITE_SUPABASE_URL`** | `https://vacvjkkkvexcaokbvdrq.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhY3Zqa2trdmV4Y2Fva2J2ZHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMzAzOTQsImV4cCI6MjEwNDcwNjM5NH0.v3nzkIb5nRQNNmYuLJJ-ZrcsCfagoFVTCEJHd9zAcjs` |

> [!NOTE]
> O arquivo `.env` local nunca deve ser enviado para o repositório Git público por segurança (ele já está listado no `.gitignore`). Portanto, você deve adicioná-lo diretamente no painel da Vercel durante ou após o deploy.

---

## 3. Passo a Passo para Deploy na Vercel

### Opção A: Deploy pelo Painel Web da Vercel (Recomendado)

1. **Suba seu projeto para o GitHub**:
   * Crie um repositório no GitHub (ex: `prevconsult` ou `systemprev`).
   * No terminal do seu projeto:
     ```bash
     git add .
     git commit -m "feat: preparar configuracao de deploy vercel e supabase"
     git branch -M main
     git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
     git push -u origin main
     ```

2. **Acesse a Vercel**:
   * Entre em [vercel.com](https://vercel.com) e faça login.
   * Clique no botão **"Add New..."** > **"Project"**.
   * Conecte sua conta do GitHub e selecione o repositório do projeto.

3. **Configurações do Projeto (Configure Project)**:
   * **Framework Preset**: Selecione `Vite` (a Vercel normalmente detecta automaticamente).
   * **Root Directory**: `./` (padrão).
   * **Build Command**: `npm run build` (ou padrão).
   * **Output Directory**: `dist` (padrão do Vite, já definido no `vercel.json`).

4. **Cadastrar as Variáveis de Ambiente na Vercel**:
   * Na mesma tela de importação, expanda a seção **"Environment Variables"**.
   * Adicione as duas variáveis:
     * **Key**: `VITE_SUPABASE_URL`
       * **Value**: `https://vacvjkkkvexcaokbvdrq.supabase.co`
     * **Key**: `VITE_SUPABASE_ANON_KEY`
       * **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhY3Zqa2trdmV4Y2Fva2J2ZHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMzAzOTQsImV4cCI6MjEwNDcwNjM5NH0.v3nzkIb5nRQNNmYuLJJ-ZrcsCfagoFVTCEJHd9zAcjs`
   * Certifique-se de marcar os ambientes: **Production**, **Preview** e **Development**.

5. **Finalizar Deploy**:
   * Clique em **"Deploy"**.
   * Aguarde cerca de 1 a 2 minutos até a conclusão. Ao finalizar, a Vercel fornecerá o domínio público (ex: `https://prevconsult.vercel.app`).

---

### Opção B: Deploy via Vercel CLI (Linha de Comando)

Se preferir usar o terminal com o Vercel CLI:

```bash
# 1. Instale o CLI da Vercel globalmente caso não tenha
npm i -g vercel

# 2. Faça login na sua conta Vercel
vercel login

# 3. Realize o deploy em produção
vercel --prod
```

O CLI perguntará as opções de build (aceite as opções padrão sugeridas, que lerão seu `vercel.json`).

---

## 4. Configuração do Banco de Dados no Supabase

Para que o PrevConsult funcione com todas as funcionalidades (clientes, processos, prazos, checklists e financeiro persistidos na nuvem):

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com/dashboard).
2. No menu lateral esquerdo, clique em **SQL Editor**.
3. Clique em **New Query**.
4. Copie o conteúdo do arquivo localizado em `supabase/schema.sql` (ou acesse no próprio sistema em **Configurações > Banco de Dados & SQL Supabase**).
5. Cole no editor do Supabase e clique no botão verde **Run** (Executar).
6. Todas as tabelas, políticas de segurança (RLS), índices e tipos enums serão criados com sucesso.

---

## 5. Testando a Conexão no Aplicativo

Após abrir o sistema (seja localmente ou no link da Vercel):

1. Faça login no sistema (as credenciais de demonstração padrão do sistema ou suas credenciais de usuário).
2. Acesse o menu **Configurações** na barra lateral.
3. Role até a seção **Banco de Dados & SQL Supabase**.
4. Clique em **Testar Conexão**.
   * O sistema executará uma verificação de conectividade com a API REST do Supabase e validará o acesso às tabelas.
5. Se desejar enviar os dados cadastrais iniciais para o banco na nuvem, clique no botão **Sincronizar com Supabase**.
