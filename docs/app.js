/**
 * DTunnel SDK - Interactive Documentation Portal Engine
 */

(function () {
  'use strict';

  // --- 1. Element References ---
  const searchInput = document.getElementById('docSearchInput');
  const searchResults = document.getElementById('docSearchResults');
  const sidebar = document.getElementById('docSidebar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const consoleOutput = document.getElementById('consoleOutput');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const toastContainer = document.getElementById('toastContainer');
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link'));

  // --- 2. Live Simulator & SDK Setup ---
  let sdk = null;
  let simulator = null;

  function initSdkSimulator() {
    if (typeof window.DTunnelSDK !== 'function' || typeof window.DTunnelSDKSimulator === 'undefined') {
      appendConsole('WARN', 'SDK ou Simulador nao carregados via script tag.');
      return;
    }

    try {
      simulator = window.DTunnelSDKSimulator.installDTunnelSDKSimulator({
        autoEvents: false,
        allowInWebView: true,
      });

      sdk = new window.DTunnelSDK({
        strict: false,
        autoRegisterNativeEvents: true,
      });

      window.__dtunnelSdk = sdk;
      window.__dtunnelSimulator = simulator;

      // Listen for semantic events
      sdk.on('vpnState', (e) => appendConsole('EVENT', `vpnState -> ${e.payload}`));
      sdk.on('newDefaultConfig', () => appendConsole('EVENT', 'newDefaultConfig triggered'));
      sdk.on('checkUserResult', (e) => appendConsole('EVENT', 'checkUserResult', e.payload));
      sdk.on('showSuccessToast', (e) => {
        appendConsole('EVENT', `showSuccessToast -> ${e.payload}`);
        showToast(String(e.payload));
      });
      sdk.on('notification', (e) => appendConsole('EVENT', 'notification', e.payload));

      appendConsole('INFO', `SDK v${sdk.version} & Simulador inicializados no Playground!`);
    } catch (err) {
      appendConsole('ERROR', `Erro ao inicializar SDK no browser: ${err}`);
    }
  }

  // --- 3. Interactive Playground Console Logger ---
  function appendConsole(type, message, data) {
    if (!consoleOutput) return;

    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'console-entry';

    let dataStr = '';
    if (data !== undefined) {
      try {
        dataStr = typeof data === 'string' ? `\n${data}` : `\n${JSON.stringify(data, null, 2)}`;
      } catch {
        dataStr = `\n${String(data)}`;
      }
    }

    entry.innerHTML = `
      <span class="console-time">[${time}]</span>
      <span class="console-type ${type}">[${type}]</span>
      <span class="console-text">${escapeHtml(message)}${dataStr ? `<pre style="color:#38bdf8;margin:4px 0 0;">${escapeHtml(dataStr)}</pre>` : ''}</span>
    `;

    consoleOutput.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Bind Clear Console
  if (clearConsoleBtn) {
    clearConsoleBtn.addEventListener('click', () => {
      if (consoleOutput) consoleOutput.innerHTML = '';
      appendConsole('INFO', 'Console limpo.');
    });
  }

  // --- 4. Playground Action Buttons ---
  document.querySelectorAll('[data-play-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-play-action');
      if (!action || !sdk) {
        showToast('SDK não inicializado');
        return;
      }

      try {
        switch (action) {
          case 'getVpnState': {
            const state = sdk.main.getVpnState();
            appendConsole('CALL', 'sdk.main.getVpnState()', state);
            break;
          }
          case 'startVpn':
            sdk.main.startVpn();
            appendConsole('CALL', 'sdk.main.startVpn()');
            showToast('VPN Iniciada (Simulador)');
            break;
          case 'stopVpn':
            sdk.main.stopVpn();
            appendConsole('CALL', 'sdk.main.stopVpn()');
            showToast('VPN Parada (Simulador)');
            break;
          case 'getCategories': {
            const categories = sdk.config.getCategories();
            appendConsole('CALL', 'sdk.config.getCategories()', categories);
            break;
          }
          case 'getSelectedCategory': {
            const cat = sdk.config.getSelectedCategory();
            appendConsole('CALL', 'sdk.config.getSelectedCategory()', cat);
            break;
          }
          case 'getConfigsByCategory': {
            const configs = sdk.config.getConfigsByCategory(1);
            appendConsole('CALL', 'sdk.config.getConfigsByCategory(1)', configs);
            break;
          }
          case 'getImportPublicKey': {
            const key = sdk.config.getImportPublicKey();
            appendConsole('CALL', 'sdk.config.getImportPublicKey()', key);
            break;
          }
          case 'getUser': {
            const user = sdk.config.getUser();
            appendConsole('CALL', 'sdk.config.getUser()', user);
            break;
          }
          case 'getRemainingTime': {
            const timer = sdk.main.getRemainingConnectionTimerText();
            appendConsole('CALL', 'sdk.main.getRemainingConnectionTimerText()', timer);
            break;
          }
          case 'showAdsRewarded':
            sdk.main.showAdsRewardedDialog();
            appendConsole('CALL', 'sdk.main.showAdsRewardedDialog()');
            showToast('Exibindo Anúncio Premiado');
            break;
          case 'isDarkMode': {
            const dark = sdk.android.isDarkMode();
            appendConsole('CALL', 'sdk.android.isDarkMode()', dark);
            break;
          }
          case 'getAppColors': {
            const colors = sdk.android.getAppColors();
            appendConsole('CALL', 'sdk.android.getAppColors()', colors);
            break;
          }
          case 'showToast':
            sdk.android.showToast('Olá do DTunnel SDK!');
            appendConsole('CALL', 'sdk.android.showToast("Olá do DTunnel SDK!")');
            showToast('Toast Nativo: Olá do DTunnel SDK!');
            break;
          case 'copyDiagnostic':
            sdk.android.copyDiagnosticReport();
            appendConsole('CALL', 'sdk.android.copyDiagnosticReport()');
            showToast('Relatório de Diagnóstico copiado!');
            break;
          case 'createSnapshot': {
            const snap = sdk.createDebugSnapshot();
            appendConsole('CALL', 'sdk.createDebugSnapshot()', snap);
            break;
          }
          default:
            appendConsole('WARN', `Ação não configurada: ${action}`);
        }
      } catch (err) {
        appendConsole('ERROR', `Falha ao executar ${action}: ${err}`);
      }
    });
  });

  // --- 5. Code Copy & Tabs ---
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const textToCopy = targetId
        ? document.getElementById(targetId)?.innerText
        : btn.closest('.code-container')?.querySelector('pre')?.innerText;

      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy.trim());
        btn.classList.add('copied');
        const origText = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copiado!
        `;
        showToast('Código copiado!');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = origText;
        }, 2000);
      } catch (err) {
        showToast('Erro ao copiar código');
      }
    });
  });

  // Tab Switcher
  document.querySelectorAll('.code-tabs').forEach((tabGroup) => {
    const tabs = tabGroup.querySelectorAll('.code-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const lang = tab.getAttribute('data-lang');
        const container = tab.closest('.code-container');
        if (!container || !lang) return;

        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        container.querySelectorAll('pre[data-lang]').forEach((pre) => {
          if (pre.getAttribute('data-lang') === lang) {
            pre.style.display = 'block';
          } else {
            pre.style.display = 'none';
          }
        });
      });
    });
  });

  // --- 6. Search Index & Filter ---
  const searchIndex = [
    { title: 'Instalação e Quickstart', section: 'Começando', hash: '#instalacao', keywords: 'install npm cdn template init setup' },
    { title: 'Inicializar com CLI (init)', section: 'Começando', hash: '#cli-init', keywords: 'init react typescript cdn template npx' },
    { title: 'sdk.main - Controle de VPN', section: 'API Reference', hash: '#modulo-main', keywords: 'startVpn stopVpn getVpnState isVpnRunning checkUser' },
    { title: 'sdk.main - Anúncios Premiados', section: 'API Reference', hash: '#modulo-main', keywords: 'showAdsRewardedDialog isAdsEnabled ads video premiado' },
    { title: 'sdk.main - Tempo Restante', section: 'API Reference', hash: '#modulo-main', keywords: 'getRemainingConnectionTime getRemainingConnectionTimerText timer' },
    { title: 'sdk.config - Categorias e Configs', section: 'API Reference', hash: '#modulo-config', keywords: 'getCategories getConfigs getConfigsByCategory getSelectedCategory' },
    { title: 'sdk.config - Importação Offline', section: 'API Reference', hash: '#modulo-config', keywords: 'getImportPublicKey copyImportPublicKey importConfig pending' },
    { title: 'sdk.config - Credenciais do Usuário', section: 'API Reference', hash: '#modulo-config', keywords: 'getUser username password uuid' },
    { title: 'sdk.android - Clipboard e Toast', section: 'API Reference', hash: '#modulo-android', keywords: 'copyToClipboard getClipboardText showToast vibrate' },
    { title: 'sdk.android - Modo Escuro e Cores', section: 'API Reference', hash: '#modulo-android', keywords: 'isDarkMode getAppColors tema cores background' },
    { title: 'sdk.android - Diagnóstico e Suporte', section: 'API Reference', hash: '#modulo-android', keywords: 'getDiagnosticReport copyDiagnosticReport isSafeMode safe' },
    { title: 'sdk.app - Configurações e Sistema', section: 'API Reference', hash: '#modulo-app', keywords: 'getAppConfig cleanApp startApnActivity webview' },
    { title: 'sdk.text - Tradução Dinâmica', section: 'API Reference', hash: '#modulo-text', keywords: 'translate i18n label texto' },
    { title: 'Eventos Semânticos (sdk.on)', section: 'Eventos', hash: '#eventos', keywords: 'on vpnState checkUserResult localIp networkName ping' },
    { title: 'React Hooks & Provider', section: 'Integrações', hash: '#react', keywords: 'DTunnelSDKProvider useDTunnelSDK useDTunnelEvent react hook' },
    { title: 'Simulador de Desenvolvimento', section: 'Ferramentas', hash: '#simulador', keywords: 'simulator mock browser test installDTunnelSDKSimulator' },
    { title: 'Consumo Direto (Sem SDK)', section: 'Avançado', hash: '#bridge-sem-sdk', keywords: 'window.Dt DtSetConfig DtGetConfigs direto bridge javascript' },
    { title: 'Playground Interativo', section: 'Experimente', hash: '#playground', keywords: 'testar console terminal live demo executar' },
  ];

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }

      const matches = searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResults.innerHTML = `
          <div style="padding: 1rem; color: #64748b; text-align: center; font-size: 0.88rem;">
            Nenhum resultado encontrado para "<strong>${escapeHtml(q)}</strong>"
          </div>
        `;
      } else {
        searchResults.innerHTML = matches
          .map(
            (item) => `
          <a href="${item.hash}" class="search-result-item" data-hash="${item.hash}">
            <div class="search-result-section">${escapeHtml(item.section)}</div>
            <div class="search-result-title">${escapeHtml(item.title)}</div>
          </a>
        `
          )
          .join('');
      }

      searchResults.classList.add('active');
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        searchResults.classList.remove('active');
      }
    });

    // Handle search item click
    searchResults.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        searchResults.classList.remove('active');
        searchInput.value = '';
      }
    });

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // --- 7. Mobile Navigation Drawer ---
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    });
  }

  // --- 8. Active Scroll Spying in Sidebar ---
  const sections = Array.from(document.querySelectorAll('section[id], h2[id]'));
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    let currentId = '';

    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= scrollPos) {
        currentId = sections[i].id;
        break;
      }
    }

    if (currentId) {
      sidebarLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  // --- 9. Toast Notification Helper ---
  function showToast(msg) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${escapeHtml(msg)}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // Initialize Simulator & SDK when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSdkSimulator);
  } else {
    initSdkSimulator();
  }
})();
