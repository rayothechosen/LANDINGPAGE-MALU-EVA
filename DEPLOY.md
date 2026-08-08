# Deploy separado das landing pages

O projeto possui duas builds independentes. Cada uma publica somente sua landing page na raiz do domínio e usa seu próprio pixel da UTMify.

## Desenvolvimento local

```bash
npm run dev:eva
npm run dev:malu
```

## Builds locais

```bash
npm run build:eva
npm run build:malu
```

Os resultados ficam em:

- `dist/eva`
- `dist/malu`

## Configuração na Vercel

Importe este mesmo repositório duas vezes, criando dois projetos.

### Projeto Eva

- Build Command: `npm run build:eva`
- Output Directory: `dist/eva`
- Install Command: `npm install`

### Projeto Malu

- Build Command: `npm run build:malu`
- Output Directory: `dist/malu`
- Install Command: `npm install`

Os arquivos `vercel.eva.json` e `vercel.malu.json` contêm as mesmas configurações caso o deploy seja automatizado por uma ferramenta que aceite um arquivo de configuração alternativo.

## Rotas de cada deploy

- `/` abre a landing page correspondente.
- `/obrigado` abre a página de obrigado correspondente.
- `/obrigado/eva` permanece disponível somente na build Eva.
- `/obrigado/malu` permanece disponível somente na build Malu.
- Qualquer rota antiga redireciona para `/`.
