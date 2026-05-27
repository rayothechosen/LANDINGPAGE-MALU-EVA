# Kit Afiliada Shopee - Instruções do Projeto

Este projeto é um painel mobile-first chamado Kit Afiliada Shopee.

## Objetivo atual

Implementar os módulos do painel sem quebrar a home existente.

Prioridade atual:
1. Módulo Pack +10.000 Vídeos
2. Depois módulo Inteligência Artificial Vídeos
3. Depois Produtos em Alta

## Stack

Projeto vindo do Lovable.
Provavelmente usa React, Vite, TypeScript, Tailwind e shadcn/ui.

## Supabase

Usar apenas variáveis públicas no frontend:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Nunca usar service_role no frontend.

Tabela principal:

videos_achadinhos

Colunas:
- message_id
- nicho
- link_shopee
- link_video
- r2_key
- topico_original
- arquivo_local
- data_telegram

## Regras de desenvolvimento

- Não carregar todos os vídeos de uma vez.
- Buscar vídeos em lotes de 30 ou 50.
- A biblioteca precisa ser organizada por nicho.
- Primeiro mostrar nichos.
- Depois, ao clicar em um nicho, mostrar os vídeos daquele nicho.
- Manter o visual atual: mobile-first, laranja, cards arredondados, simples e premium.
- Antes de alterar muitos arquivos, explicar o plano.
- Evitar reescrever o projeto inteiro.
- Preferir alterações pequenas e seguras.
- Sempre rodar build ou dev server após alterações importantes.

## Comandos

Para instalar:
npm install

Para rodar local:
npm run dev

URL local esperada:
http://localhost:8080/