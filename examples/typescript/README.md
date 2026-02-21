# Exemplo TypeScript (Vanilla)

Projeto completo usando `dtunnel-sdk` com TypeScript e Vite.

## Rodar

```bash
cd examples/typescript
npm install
npm run dev
```

## Gerar index unico para WebView

```bash
npm run build:webview
```

Saida:
- `examples/typescript/webview/index.html`

## Arquivos principais

- `src/main.ts`: integracao do SDK com tipagem forte
- `index.html`: estrutura da UI
- `src/style.css`: estilos

## Notas

- A dependencia `dtunnel-sdk` usa npm (`^1.1.0`).
- O SDK esta em `strict: false` para facilitar testes sem bridge Android.
- Com bridge real, as chamadas retornam os dados nativos; sem bridge, retornam `null`.
- Para publicacao no app WebView, use sempre o arquivo unico `webview/index.html`.
