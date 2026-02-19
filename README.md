# Guia de Integracao HTML com DTunnel SDK

## Objetivo

Guia pratico para integrar paginas HTML usando somente a API JavaScript do `DTunnelSDK`.

Referencias:
- API: `dtunnel-sdk-api-eventos.md`
- Sem SDK: `dtunnel-sdk-chamadas-sem-sdk.md`
- Exemplo bridge: `examples/dtunnel-sdk-bridge-example.html`
- Exemplo SDK: `examples/dtunnel-sdk-example.html`
- Runtime: `sdk/dtunnel-sdk.js`

## 1. Carregamento

```html
<script src="../sdk/dtunnel-sdk.js"></script>
<script>
  const sdk = new DTunnelSDK({
    strict: false,
    autoRegisterNativeEvents: true,
  });
</script>
```

## 2. Chamada de APIs

Use os wrappers dos modulos:

```js
const state = sdk.main.getVpnState();
sdk.main.startVpn();
const configs = sdk.config.getConfigs();
```

Chamadas dinamicas tambem sao suportadas:

```js
sdk.call("DtGetVpnState", "execute");
sdk.callJson("DtGetConfigs", "execute");
sdk.callVoid("DtExecuteVpnStart", "execute");
```

## 3. Eventos oficiais

Registre eventos semanticos:

```js
sdk.on("vpnState", (event) => {
  console.log(event.payload);
});

sdk.on("notification", (event) => {
  console.log(event.payload);
});
```

Callbacks globais oficiais:
- `DtVpnStateEvent`
- `DtVpnStartedSuccessEvent`
- `DtVpnStoppedSuccessEvent`
- `DtNewLogEvent`
- `DtNewDefaultConfigEvent`
- `DtCheckUserStartedEvent`
- `DtCheckUserResultEvent`
- `DtCheckUserErrorEvent`
- `DtMessageErrorEvent`
- `DtSuccessToastEvent`
- `DtErrorToastEvent`
- `DtNotificationEvent`

## 4. Parse de JSON

```js
function parseJsonOrRaw(payload) {
  if (payload == null) return null;
  if (typeof payload !== "string") return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}
```

## 5. Modo de erro

`strict: true`:
- lanca excecao em falhas de chamada.

`strict: false`:
- retorna `null`.
- dispara evento `error`.

```js
sdk.on("error", (event) => {
  console.error(event.error.code, event.error.message);
});
```

## 6. Boas praticas

- criar uma instancia global unica do SDK por pagina.
- registrar listeners antes de chamadas criticas.
- tratar `null` como resposta valida.
- usar `sdk.destroy()` no teardown da pagina.

## 7. Checklist

- [ ] `DTunnelSDK` carregado antes de usar.
- [ ] `autoRegisterNativeEvents: true` quando precisar eventos.
- [ ] payloads JSON com parse seguro.
- [ ] tratamento de erro com `sdk.on("error", ...)`.
- [ ] limpeza de listeners com `sdk.destroy()`.
