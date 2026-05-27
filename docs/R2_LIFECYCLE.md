# R2 Lifecycle Rules — Kit Afiliada Shopee

Este documento descreve os prefixos do Cloudflare R2 que devem ter
regras de ciclo de vida (lifecycle) configuradas, e quais NAO devem
ser alterados.

---

## Prefixos com expiração recomendada

### `produto-videos/`
- **Origem**: Edge Function `produto-video-create`
- **Chave gerada**: `produto-videos/{user_id}/{job_id}/source.{ext}`
- **Expiração recomendada**: **2 dias**
- **Motivo**: Imagens de entrada para geração de vídeo de produto.
  O banco já marca `expires_at = now() + 2 dias` no job.
  O lifecycle do R2 deve corresponder a esse prazo.

### `ai-inputs/`
- **Origem**: Edge Function `ai-video-create`
- **Chave gerada**: `ai-inputs/{user_id}/{job_id}/input.{ext}`
- **Expiração recomendada**: **3 dias**
- **Motivo**: Imagens de entrada para geração de vídeo IA de criativo.
  O banco registra `expires_at = now() + 3 dias`.

---

## Prefixos que NÃO devem ter lifecycle (nunca expirar)

| Prefixo                    | Módulo               | Motivo                                           |
|----------------------------|----------------------|--------------------------------------------------|
| `creatives/carrosseis/`    | Carrosséis Prontos   | Biblioteca fixa — não expira                     |
| `creatives/stories/`       | Stories Prontos      | Biblioteca fixa — não expira                     |
| `pack-videos/`             | Pack de Vídeos       | Biblioteca fixa — não expira                     |
| `produtos-em-alta/`        | Produtos em Alta     | Biblioteca curada — não expira                   |

---

## Como configurar no Cloudflare R2

1. Acesse o dashboard do Cloudflare → R2 → seu bucket
2. Vá em **Settings** → **Object lifecycle rules**
3. Crie uma regra para cada prefixo com expiração:
   - Prefix: `produto-videos/` → Expire after: **2 days**
   - Prefix: `ai-inputs/`      → Expire after: **3 days**
4. NÃO aplique lifecycle rules nos prefixos de biblioteca listados acima.

---

## Observações

- O lifecycle do R2 opera de forma assíncrona (pode demorar algumas horas além do prazo).
- A coluna `expires_at` no banco é a fonte de verdade para o frontend.
- O frontend já filtra itens com `expires_at < now()` antes de exibir.
- Para limpeza do banco, criar um cron job ou função de banco que delete
  registros expirados após `now() > expires_at + 24h` (margem de segurança).
