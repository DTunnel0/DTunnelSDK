(function () {
  'use strict';

  const searchInput = document.getElementById('docSearchInput');
  const searchResults = document.getElementById('docSearchResults');
  const sidebar = document.getElementById('docSidebar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const consoleOutput = document.getElementById('consoleOutput');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const toastContainer = document.getElementById('toastContainer');
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link'));

  const heroPowerBtn = document.getElementById('heroPowerBtn');
  const heroStatusBadge = document.getElementById('heroStatusBadge');
  const heroStatusText = document.getElementById('heroStatusText');
  const heroDownloadSpeed = document.getElementById('heroDownloadSpeed');
  const heroTimerText = document.getElementById('heroTimerText');
  const heroServerName = document.getElementById('heroServerName');

  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const currentLangFlag = document.getElementById('currentLangFlag');
  const currentLangName = document.getElementById('currentLangName');
  const langOptions = Array.from(document.querySelectorAll('.lang-option'));

  const DEFAULT_LANG = 'pt-BR';
  let currentLang = DEFAULT_LANG;

  function getNestedTranslation(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  }

  function applyTranslations(lang) {
    const dict = window.DTUNNEL_I18N && window.DTUNNEL_I18N[lang] ? window.DTUNNEL_I18N[lang] : window.DTUNNEL_I18N[DEFAULT_LANG];
    if (!dict) return;

    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const text = getNestedTranslation(dict, key);
      if (text !== null) {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const raw = el.getAttribute('data-i18n-attr');
      if (!raw) return;
      const parts = raw.split(':');
      if (parts.length === 2) {
        const [attr, key] = parts;
        const text = getNestedTranslation(dict, key);
        if (text !== null) {
          el.setAttribute(attr, text);
        }
      }
    });

    const meta = dict.meta || { flag: '🇧🇷', langName: 'PT-BR' };
    if (currentLangFlag) currentLangFlag.textContent = meta.flag;
    if (currentLangName) currentLangName.textContent = lang === 'pt-BR' ? 'PT' : lang.toUpperCase();

    langOptions.forEach((opt) => {
      if (opt.getAttribute('data-lang') === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    if (sdk) {
      updateHeroPhoneUI(sdk.main.getVpnState());
    }

    try {
      localStorage.setItem('dtunnel_docs_lang', lang);
    } catch (_e) {}
  }

  function initLanguage() {
    let saved = DEFAULT_LANG;
    try {
      saved = localStorage.getItem('dtunnel_docs_lang') || navigator.language || DEFAULT_LANG;
    } catch (_e) {}

    if (saved.startsWith('en')) saved = 'en';
    else if (saved.startsWith('es')) saved = 'es';
    else saved = 'pt-BR';

    applyTranslations(saved);

    if (langBtn && langDropdown) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-selector')) {
          langDropdown.classList.remove('open');
        }
      });

      langOptions.forEach((opt) => {
        opt.addEventListener('click', () => {
          const selected = opt.getAttribute('data-lang');
          if (selected) {
            applyTranslations(selected);
            langDropdown.classList.remove('open');
            showToast(`Idioma: ${opt.innerText.trim()}`);
          }
        });
      });
    }
  }

  let sdk = null;
  let simulator = null;
  let speedInterval = null;
  let timerSeconds = 3600;

  function initSdkSimulator() {
    if (typeof window.DTunnelSDK !== 'function' || typeof window.DTunnelSDKSimulator === 'undefined') {
      appendConsole('WARN', 'SDK ou Simulador não carregados.');
      return;
    }

    try {
      simulator = window.DTunnelSDKSimulator.installDTunnelSDKSimulator({
        autoEvents: true,
        allowInWebView: true,
      });

      sdk = new window.DTunnelSDK({
        strict: false,
        autoRegisterNativeEvents: true,
      });

      window.__dtunnelSdk = sdk;
      window.__dtunnelSimulator = simulator;

      updateHeroPhoneUI(sdk.main.getVpnState());

      sdk.on('vpnState', (e) => {
        appendConsole('EVENT', `vpnState -> ${e.payload}`);
        updateHeroPhoneUI(e.payload);
      });

      sdk.on('newDefaultConfig', () => {
        appendConsole('EVENT', 'newDefaultConfig triggered');
        const config = sdk.config.getSelectedConfig();
        if (heroServerName && config) {
          heroServerName.textContent = config.name;
        }
      });

      sdk.on('checkUserResult', (e) => appendConsole('EVENT', 'checkUserResult', e.payload));
      sdk.on('showSuccessToast', (e) => {
        appendConsole('EVENT', `showSuccessToast -> ${e.payload}`);
        showToast(String(e.payload));
      });
      sdk.on('notification', (e) => appendConsole('EVENT', 'notification', e.payload));

      appendConsole('INFO', `DTunnel SDK v${sdk.version} pronto.`);
    } catch (err) {
      appendConsole('ERROR', `Erro ao inicializar SDK: ${err}`);
    }
  }

  function updateHeroPhoneUI(state) {
    if (!heroStatusBadge || !heroStatusText || !heroPowerBtn) return;

    heroStatusBadge.classList.remove('connected', 'connecting');
    heroPowerBtn.classList.remove('active');

    if (state === 'CONNECTED') {
      heroStatusBadge.classList.add('connected');
      heroStatusText.textContent = currentLang === 'en' ? 'CONNECTED' : currentLang === 'es' ? 'CONECTADO' : 'CONECTADO';
      heroPowerBtn.classList.add('active');

      if (!speedInterval) {
        speedInterval = setInterval(() => {
          if (heroDownloadSpeed) {
            const down = (Math.random() * 8 + 3).toFixed(1);
            heroDownloadSpeed.textContent = `${down} MB/s`;
          }
          if (heroTimerText && timerSeconds > 0) {
            timerSeconds -= 1;
            const h = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(timerSeconds % 60).padStart(2, '0');
            heroTimerText.textContent = `${h}:${m}:${s}`;
          }
        }, 1000);
      }
    } else if (state === 'CONNECTING') {
      heroStatusBadge.classList.add('connecting');
      heroStatusText.textContent = currentLang === 'en' ? 'CONNECTING...' : currentLang === 'es' ? 'CONECTANDO...' : 'CONECTANDO...';
    } else {
      heroStatusText.textContent = currentLang === 'en' ? 'DISCONNECTED' : currentLang === 'es' ? 'DESCONECTADO' : 'DESCONECTADO';
      if (heroDownloadSpeed) heroDownloadSpeed.textContent = '0.0 KB/s';
      if (speedInterval) {
        clearInterval(speedInterval);
        speedInterval = null;
      }
    }
  }

  if (heroPowerBtn) {
    heroPowerBtn.addEventListener('click', () => {
      if (!sdk) return;
      const state = sdk.main.getVpnState();
      if (state === 'CONNECTED' || state === 'CONNECTING') {
        sdk.main.stopVpn();
      } else {
        sdk.main.startVpn();
      }
    });
  }

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

  if (clearConsoleBtn) {
    clearConsoleBtn.addEventListener('click', () => {
      if (consoleOutput) consoleOutput.innerHTML = '';
      appendConsole('INFO', 'Console limpo.');
    });
  }

  function executeAction(action) {
    if (!action || !sdk) {
      showToast('SDK não inicializado');
      return;
    }

    const dict = window.DTUNNEL_I18N && window.DTUNNEL_I18N[currentLang] ? window.DTUNNEL_I18N[currentLang].playground : {};

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
          showToast(dict.toastVpnStarted || 'VPN Iniciada');
          break;
        case 'stopVpn':
          sdk.main.stopVpn();
          appendConsole('CALL', 'sdk.main.stopVpn()');
          showToast(dict.toastVpnStopped || 'VPN Parada');
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
          showToast(dict.toastAds || 'Exibindo Anúncio Premiado');
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
          showToast(dict.toastMsg || 'Toast Nativo: Olá do DTunnel SDK!');
          break;
        case 'copyDiagnostic':
          sdk.android.copyDiagnosticReport();
          appendConsole('CALL', 'sdk.android.copyDiagnosticReport()');
          showToast(dict.toastCopiedDiag || 'Relatório de Diagnóstico copiado!');
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
  }

  document.querySelectorAll('[data-play-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-play-action');
      executeAction(action);
    });
  });

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
          ${currentLang === 'en' ? 'Copied!' : currentLang === 'es' ? '¡Copiado!' : 'Copiado!'}
        `;
        showToast(currentLang === 'en' ? 'Code copied!' : currentLang === 'es' ? '¡Código copiado!' : 'Código copiado!');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = origText;
        }, 2000);
      } catch (err) {
        showToast('Erro ao copiar código');
      }
    });
  });

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

  const searchIndex = [
    { title: 'Instalação e Quickstart', section: 'Começando', hash: '#instalacao', keywords: 'install npm cdn template init setup instalacion' },
    { title: 'Inicializar com CLI (init)', section: 'Começando', hash: '#cli-init', keywords: 'init react typescript cdn template npx generador' },
    { title: 'sdk.main - Controle de VPN', section: 'API Reference', hash: '#modulo-main', keywords: 'startVpn stopVpn getVpnState isVpnRunning checkUser control vpn' },
    { title: 'sdk.main - Anúncios Premiados', section: 'API Reference', hash: '#modulo-main', keywords: 'showAdsRewardedDialog isAdsEnabled ads video premiado rewarded' },
    { title: 'sdk.main - Tempo Restante', section: 'API Reference', hash: '#modulo-main', keywords: 'getRemainingConnectionTime getRemainingConnectionTimerText timer remaining tiempo' },
    { title: 'sdk.config - Categorias e Configs', section: 'API Reference', hash: '#modulo-config', keywords: 'getCategories getConfigs getConfigsByCategory getSelectedCategory categorias' },
    { title: 'sdk.config - Importação Offline', section: 'API Reference', hash: '#modulo-config', keywords: 'getImportPublicKey copyImportPublicKey importConfig pending importacion' },
    { title: 'sdk.config - Credenciais do Usuário', section: 'API Reference', hash: '#modulo-config', keywords: 'getUser username password uuid usuario credentials' },
    { title: 'sdk.android - Clipboard e Toast', section: 'API Reference', hash: '#modulo-android', keywords: 'copyToClipboard getClipboardText showToast vibrate portapapeles' },
    { title: 'sdk.android - Modo Escuro e Cores', section: 'API Reference', hash: '#modulo-android', keywords: 'isDarkMode getAppColors tema cores background dark mode colores' },
    { title: 'sdk.android - Diagnóstico e Suporte', section: 'API Reference', hash: '#modulo-android', keywords: 'getDiagnosticReport copyDiagnosticReport isSafeMode safe diagnostico' },
    { title: 'sdk.app - Configurações e Sistema', section: 'API Reference', hash: '#modulo-app', keywords: 'getAppConfig cleanApp startApnActivity webview' },
    { title: 'sdk.text - Tradução Dinâmica', section: 'API Reference', hash: '#modulo-text', keywords: 'translate i18n label texto traduccion' },
    { title: 'Eventos Semânticos (sdk.on)', section: 'Eventos', hash: '#eventos', keywords: 'on vpnState checkUserResult localIp networkName ping callbacks events' },
    { title: 'React Hooks & Provider', section: 'Integrações', hash: '#react', keywords: 'DTunnelSDKProvider useDTunnelSDK useDTunnelEvent react hook' },
    { title: 'Simulador de Desenvolvimento', section: 'Ferramentas', hash: '#simulador', keywords: 'simulator mock browser test installDTunnelSDKSimulator simulador' },
    { title: 'Consumo Direto (Sem SDK)', section: 'Avançado', hash: '#bridge-sem-sdk', keywords: 'window.Dt DtSetConfig DtGetConfigs direto bridge javascript directo' },
    { title: 'Playground Interativo', section: 'Experimente', hash: '#playground', keywords: 'testar console terminal live demo executar playground probar' },
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

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        searchResults.classList.remove('active');
      }
    });

    searchResults.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        searchResults.classList.remove('active');
        searchInput.value = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  function toggleMobileSidebar() {
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle('open');
    if (sidebarBackdrop) {
      if (isOpen) {
        sidebarBackdrop.classList.add('active');
      } else {
        sidebarBackdrop.classList.remove('active');
      }
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', closeMobileSidebar);
    });
  }

  const sections = Array.from(document.querySelectorAll('section[id], h2[id]'));
  
  function updateActiveSidebarLink() {
    const scrollPos = window.scrollY + 140;
    let currentId = '';

    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
      if (sections.length > 0) {
        currentId = sections[sections.length - 1].id;
      }
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPos) {
          currentId = sections[i].id;
          break;
        }
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
  }

  window.addEventListener('scroll', updateActiveSidebarLink, { passive: true });

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

  function init() {
    initLanguage();
    initSdkSimulator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
