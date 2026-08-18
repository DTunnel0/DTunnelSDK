# Referência Completa da API - DTunnel SDK

Esta é a documentação técnica detalhada e exaustiva de todas as funções, métodos, atributos, interfaces e bridges que compõem o **DTunnel SDK**.

---

## Índice de Módulos
- [DTunnelSDK (Classe Core)](#dtunnelsdk-classe-core)
- [sdk.main (VPN, Conexão e Anúncios)](#sdkmain-vpn-conexão-e-anúncios)
- [sdk.config (Categorias, Servidores e Importação)](#sdkconfig-categorias-servidores-e-importação)
- [sdk.android (Hardware e Sistema Android)](#sdkandroid-hardware-e-sistema-android)
- [sdk.app (Telas e Configurações Globais)](#sdkapp-telas-e-configurações-globais)
- [sdk.text (Internacionalização Dinâmica)](#sdktext-internacionalização-dinâmica)
- [Interfaces TypeScript & Schemas](#interfaces-typescript--schemas)

---

## DTunnelSDK (Classe Core)

### Construtor
```ts
new DTunnelSDK(options?: DTunnelSDKOptions): DTunnelSDK
```
Inicializa o SDK, conecta com os objetos `window.Dt...` e registra listeners de eventos globais.

**Parâmetros:**
| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `strict` | `boolean` | `false` | Se `true`, lança `DTunnelBridgeError` quando um método nativo não existir. Se `false`, retorna `null` e emite evento `'error'`. |
| `autoRegisterNativeEvents` | `boolean` | `true` | Se `true`, mapeia automaticamente todos os callbacks nativos no escopo global. |
| `window` | `DTunnelBridgeHost` | `window` | Host dos objetos de bridge (útil para testes unitários ou SSR). |
| `logger` | `Pick<Console, 'error'>` | `console` | Instância personalizada de logger. |

---

### Métodos Principais

#### `sdk.on(eventName, listener): () => void`
Inscreve um ouvinte para eventos semânticos, nativos ou erros.
- **Retorno:** Função que remove o listener quando executada.
- **Exemplo:**
  ```ts
  const unbind = sdk.on('vpnState', (event) => {
    console.log('Novo estado da VPN:', event.payload);
  });
  // Para cancelar:
  unbind();
  ```

#### `sdk.once(eventName, listener): () => void`
Executa o ouvinte apenas uma vez para o primeiro disparo do evento.

#### `sdk.off(eventName, listener): void`
Remove um ouvinte previamente registrado.

#### `sdk.getBridgeAvailability(): Record<DTunnelBridgeObjectName, boolean>`
Retorna um mapa booleano com a disponibilidade de cada um dos 53 objetos nativos de bridge no ambiente atual.

#### `sdk.isReady(requiredObjects?: readonly DTunnelBridgeObjectName[]): boolean`
Verifica se todos os objetos obrigatórios de bridge estão disponíveis na janela atual.

#### `sdk.createDebugSnapshot(): DTunnelDebugSnapshot`
Gera uma captura instantânea de diagnóstico com status da bridge, listeners e opções ativas.

---

## sdk.main (VPN, Conexão e Anúncios)

### `sdk.main.startVpn(): void`
- **Bridge nativa:** `window.DtExecuteVpnStart.execute()`
- **Descrição:** Inicia a conexão VPN utilizando a configuração e credenciais ativas.

### `sdk.main.stopVpn(): void`
- **Bridge nativa:** `window.DtExecuteVpnStop.execute()`
- **Descrição:** Interrompe a conexão VPN imediatamente.

### `sdk.main.getVpnState(): DTunnelVPNState | null`
- **Bridge nativa:** `window.DtGetVpnState.execute()`
- **Retorno:** `'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'STOPPING' | 'NO_NETWORK' | 'AUTH' | 'AUTH_FAILED' | null`
- **Descrição:** Consulta o status atual de conexão do túnel.

### `sdk.main.isVpnRunning(): boolean`
- **Bridge nativa:** `window.DtIsVpnRunning.execute()`
- **Retorno:** `boolean`
- **Descrição:** Retorna `true` se o serviço de VPN do Android estiver em execução.

### `sdk.main.showAdsRewardedDialog(): void`
- **Bridge nativa:** `window.DtShowDialogAdsRewarded.execute()`
- **Descrição:** Exibe o modal nativo de anúncio premiado para extensão de tempo de uso.

### `sdk.main.isAdsEnabled(): boolean`
- **Bridge nativa:** `window.DtIsAdsEnabled.execute()`
- **Retorno:** `boolean`
- **Descrição:** Informa se os anúncios estão habilitados no aplicativo.

### `sdk.main.getRemainingConnectionTime(): number | null`
- **Bridge nativa:** `window.DtGetRemainingConnectionTime.execute()`
- **Retorno:** `number | null` (tempo em segundos).

### `sdk.main.getRemainingConnectionTimerText(): string | null`
- **Bridge nativa:** `window.DtGetRemainingConnectionTimerText.execute()`
- **Retorno:** `string | null` (ex: `"02:45:10"`).

### `sdk.main.getLastVpnError(): string | null`
- **Bridge nativa:** `window.DtGetLastVpnError.execute()`
- **Retorno:** Mensagem do último erro ocorrido na conexão.

### `sdk.main.startCheckUser(): void`
- **Bridge nativa:** `window.DtStartCheckUser.execute()`
- **Descrição:** Dispara a checagem remota da conta SSH. O resultado chega pelo evento `checkUserResult`.

### `sdk.main.getLogs(): DTunnelLogEntry[] | null`
- **Bridge nativa:** `window.DtGetLogs.execute()`
- **Retorno:** Array de logs gerados pelo núcleo do túnel.

### `sdk.main.clearLogs(): void`
- **Bridge nativa:** `window.DtClearLogs.execute()`
- **Descrição:** Limpa a lista de logs no aplicativo.

---

## sdk.config (Categorias, Servidores e Importação)

### `sdk.config.getCategories(): DTunnelCategorySummary[] | null`
- **Bridge nativa:** `window.DtGetCategories.execute()`
- **Retorno:** Lista de categorias resumidas com contagem de configurações associadas.
- **Exemplo de Retorno:**
  ```json
  [
    { "id": 10, "name": "Brasil", "color": "#532e7d", "sorter": 1, "count": 8 },
    { "id": 20, "name": "EUA", "color": "#1a4480", "sorter": 2, "count": 4 }
  ]
  ```

### `sdk.config.getConfigsByCategory(categoryId: number): DTunnelConfigListItem[] | null`
- **Bridge nativa:** `window.DtGetConfigsByCategory.execute(categoryId)`
- **Parâmetros:** `categoryId: number` - ID da categoria.
- **Retorno:** Lista de servidores/configurações da categoria especificada.

### `sdk.config.getSelectedConfig(): DTunnelDefaultConfig | null`
- **Bridge nativa:** `window.DtGetSelectedConfig.execute()`
- **Retorno:** Objeto com a configuração selecionada atualmente para conexão.

### `sdk.config.setConfig(id: number): void`
- **Bridge nativa:** `window.DtSetConfig.execute(id)`
- **Parâmetros:** `id: number` - ID numérico da configuração a ser ativada.

### `sdk.config.getImportPublicKey(): string | null`
- **Bridge nativa:** `window.DtGetImportPublicKey.execute()`
- **Retorno:** Chave pública criptográfica do aplicativo para geração de payloads offline.

### `sdk.config.copyImportPublicKey(): void`
- **Bridge nativa:** `window.DtCopyImportPublicKey.execute()`
- **Descrição:** Copia a chave pública diretamente para a área de transferência do Android.

### `sdk.config.importConfig(payload: string): void`
- **Bridge nativa:** `window.DtImportConfig.execute(payload)`
- **Parâmetros:** `payload: string` - Envelope de configuração criptografado.

### `sdk.config.getUser(): DTunnelUserCredentials | null`
- **Bridge nativa:** `window.DtGetUser.execute()`
- **Retorno:** `{ username: string, password: string, uuid: string } | null`

---

## sdk.android (Hardware e Sistema Android)

### `sdk.android.copyToClipboard(text: string): void`
- **Bridge nativa:** `window.DtCopyToClipboard.execute(text)`
- **Descrição:** Salva o texto na área de transferência do dispositivo.

### `sdk.android.getClipboardText(): string | null`
- **Bridge nativa:** `window.DtGetClipboardText.execute()`
- **Retorno:** Texto atualmente presente no clipboard.

### `sdk.android.showToast(message: string): void`
- **Bridge nativa:** `window.DtShowToast.execute(message)`
- **Descrição:** Exibe mensagem Toast nativa flutuante.

### `sdk.android.vibrate(durationMillis?: number): void`
- **Bridge nativa:** `window.DtVibrate.execute(durationMillis)`
- **Parâmetros:** `durationMillis?: number` (Padrão: 50ms).

### `sdk.android.isDarkMode(): boolean`
- **Bridge nativa:** `window.DtIsDarkMode.execute()`
- **Retorno:** `true` se o sistema estiver no modo escuro.

### `sdk.android.getAppColors(): DTunnelAppColors | null`
- **Bridge nativa:** `window.DtGetAppColors.execute()`
- **Retorno:** Cores customizadas da identidade visual do app.

### `sdk.android.getDiagnosticReport(): string | null`
- **Bridge nativa:** `window.DtGetDiagnosticReport.execute()`
- **Retorno:** Relatório de suporte técnico e telemetria formatado em texto.

### `sdk.android.openExternalUrl(url: string): void`
- **Bridge nativa:** `window.DtOpenExternalUrl.execute(url)`
- **Descrição:** Abre o link no navegador externo padrão do Android.

---

## sdk.app (Telas e Configurações Globais)

### `sdk.app.getAppConfig<T>(name: string): DTunnelAppConfigValue<T> | null`
- **Bridge nativa:** `window.DtGetAppConfig.execute(name)`
- **Parâmetros:** `name: string` - Chave da configuração remota.

### `sdk.app.startApnActivity(): void`
- **Bridge nativa:** `window.DtStartApnActivity.execute()`
- **Descrição:** Abre a tela nativa de configurações de APN móvel.

### `sdk.app.startRadioInfoActivity(): void`
- **Bridge nativa:** `window.DtStartRadioInfoActivity.execute()`
- **Descrição:** Abre as opções de rádio e sinal móvel.

---

## sdk.text (Internacionalização Dinâmica)

### `sdk.text.translate(label: string | null): string | null`
- **Bridge nativa:** `window.DtTranslateText.execute(label)`
- **Descrição:** Retorna a tradução associada à chave `label`.

---

## Interfaces TypeScript & Schemas

```ts
export type DTunnelVPNState =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'STOPPING'
  | 'NO_NETWORK'
  | 'AUTH'
  | 'AUTH_FAILED';

export interface DTunnelCategorySummary {
  id: number;
  name: string;
  color: string;
  sorter: number;
  count: number;
}

export interface DTunnelDefaultConfig {
  id: number;
  category_id: number;
  name: string;
  description: string;
  mode: string;
  sorter: number;
  icon: string;
  requires_username?: boolean;
  requires_password?: boolean;
  requires_uuid?: boolean;
}

export interface DTunnelAppColors {
  backgroundColor: string;
  cardColor: string;
  cardStatusColor: string;
  cardConfigColor: string;
  dialogBackgroundColor: string;
  dialogLoggerColor: string;
  borderColor: string;
  inputColor: string;
  textColor: string;
  buttonColor: string;
  iconColor: string;
}

export interface DTunnelUserCredentials {
  username: string;
  password: string;
  uuid: string;
}

export interface DTunnelCheckUserResult {
  username?: string;
  count_connection?: number | string;
  limit_connection?: number | string;
  expiration_date?: string;
  expiration_days?: number | string;
  is_active?: boolean;
}
```
