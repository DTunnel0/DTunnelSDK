# Exemplo CDN

Arquivo principal: `examples/cdn/index.html`

Este exemplo usa:
- `<script src="https://cdn.jsdelivr.net/npm/dtunnel-sdk@latest/sdk/dtunnel-sdk.js"></script>`
- API completa do SDK (`sdk.config`, `sdk.main`, `sdk.app`, `sdk.android`)
- monitoramento de eventos (`vpnState`, `nativeEvent`, `error`)
- formato final ja compativel com WebView: arquivo unico `index.html`

Como testar:
1. Abra `index.html` no WebView do app DTunnel para bridge real.
2. Em navegador desktop, a UI funciona para inspeção e os estados de bridge ficam parciais.
