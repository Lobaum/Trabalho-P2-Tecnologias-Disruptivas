(() => {
  const root = document.documentElement;
  root.classList.add("js-ready");

  /* ------------------------------------------------------------------------
     1. Theme toggle (Light default / system preference, persisted choice)
     ------------------------------------------------------------------------ */
  const THEME_KEY = "atlas-nuvens-theme";
  const themeToggle = document.getElementById("theme-toggle");

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (_) {
      // Ignore storage errors
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      const nextLabel = theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";
      themeToggle.setAttribute("aria-label", nextLabel);
      themeToggle.setAttribute("title", nextLabel);
    }
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (_) {
        // Ignore storage errors
      }
    }
  }

  applyTheme(getInitialTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark", true);
    });
  }

  /* ------------------------------------------------------------------------
     2. Mobile navigation drawer
     ------------------------------------------------------------------------ */
  const menuBtn = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-drawer");

  function setDrawerOpen(open) {
    if (!menuBtn || !drawer) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    drawer.hidden = !open;
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      setDrawerOpen(!isOpen);
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setDrawerOpen(false));
    });
  }

  /* ------------------------------------------------------------------------
     3. Cloud Altitude Filters
     ------------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const cloudCards = document.querySelectorAll("[data-layer]");
  const cloudsGrid = document.getElementById("clouds-grid");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-filter");
      filterButtons.forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      if (cloudsGrid) {
        cloudsGrid.classList.toggle("is-filtered", selected !== "all");
      }

      cloudCards.forEach((card) => {
        const layers = (card.getAttribute("data-layer") || "").split(" ");
        const visible = selected === "all" || layers.includes(selected);
        card.hidden = !visible;
      });
    });
  });

  /* ------------------------------------------------------------------------
     4. Interactive Composition Switcher (Gotículas vs Cristais de Gelo)
     ------------------------------------------------------------------------ */
  const phaseData = {
    water: {
      title: "Gotículas líquidas (baixas e médias altitudes)",
      text: "Formam nuvens densas e de contornos nítidos como Cumulus, Stratus e Altocumulus, refletindo bastante luz solar."
    },
    ice: {
      title: "Cristais de gelo (altas altitudes acima de 6 km)",
      text: "Geram nuvens translúcidas e fibrosas como Cirrus e Cirrostratus, capazes de produzir halos ao redor do Sol ou da Lua."
    }
  };

  const phaseButtons = document.querySelectorAll("[data-phase]");
  const phaseTitle = document.getElementById("phase-title");
  const phaseText = document.getElementById("phase-text");

  phaseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-phase");
      const entry = phaseData[key];
      if (!entry) return;

      phaseButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === btn));
      });
      if (phaseTitle) phaseTitle.textContent = entry.title;
      if (phaseText) phaseText.textContent = entry.text;
    });
  });

  /* ------------------------------------------------------------------------
     5. Interactive Cloud Identifier
     ------------------------------------------------------------------------ */
  const idAltitude = document.getElementById("id-altitude");
  const idShape = document.getElementById("id-shape");
  const idSignal = document.getElementById("id-signal");

  const idGenusName = document.getElementById("id-genus-name");
  const idGenusDesc = document.getElementById("id-genus-desc");
  const idOutAltitude = document.getElementById("id-out-altitude");
  const idOutWeather = document.getElementById("id-out-weather");
  const idUseBtn = document.getElementById("id-use-btn");

  const classifierMatrix = {
    "baixa|fofa": {
      name: "Cumulus (Cu)",
      desc: "Nuvens isoladas com base plana e topo em couve-flor, comuns em dias ensolarados com correntes térmicas.",
      altitude: "600 m a 2.000 m",
      weather: "Bom tempo (Cumulus humilis)"
    },
    "baixa|lencol": {
      name: "Stratus (St)",
      desc: "Camada baixa, uniforme e acinzentada que pode encobrir topos de morros e gerar garoa fina.",
      altitude: "Superfície a 1.200 m",
      weather: "Céu encoberto e chuvisco"
    },
    "media|fofa": {
      name: "Altocumulus (Ac)",
      desc: "Conjunto de blocos ou ondas brancas e cinzentas agrupadas em fileiras no andar médio da troposfera.",
      altitude: "2.000 m a 6.000 m",
      weather: "Tempo estável ou transição"
    },
    "media|lencol": {
      name: "Altostratus / Nimbostratus",
      desc: "Manto contínuo que filtra o Sol como vidro fosco (Altostratus) ou escurece trazendo chuva persistente (Nimbostratus).",
      altitude: "1.500 m a 5.500 m",
      weather: "Chuva contínua ou frente fria"
    },
    "alta|fios": {
      name: "Cirrus (Ci)",
      desc: "Filamentos delicados e esbranquiçados formados exclusivamente por cristais de gelo levados por ventos de altitude.",
      altitude: "6.000 m a 12.000 m",
      weather: "Tempo firme ou aproximação de frente"
    },
    "alta|veu": {
      name: "Cirrostratus (Cs)",
      desc: "Véu esbranquiçado quase transparente que cobre o céu alto e frequentemente cria um halo circular ao redor do Sol.",
      altitude: "6.000 m a 12.000 m",
      weather: "Mudança de tempo em 12h a 24h"
    },
    "vertical|torre": {
      name: "Cumulonimbus (Cb)",
      desc: "Coluna convectiva de grande desenvolvimento vertical, topo em formato de bigorna e forte carga elétrica.",
      altitude: "Base a 800 m até 12+ km",
      weather: "Tempestade, rajadas e raios"
    }
  };

  let currentIdentifiedGenus = "Cumulus (Cu)";

  function updateIdentifier() {
    if (!idAltitude || !idShape || !idSignal) return;
    const alt = idAltitude.value;
    const shape = idShape.value;
    const signal = idSignal.value;

    let match = classifierMatrix[`${alt}|${shape}`];

    if (!match) {
      if (alt === "vertical" || signal === "trovoada") {
        match = classifierMatrix["vertical|torre"];
      } else if (alt === "alta" && signal === "halo") {
        match = classifierMatrix["alta|veu"];
      } else if (alt === "alta") {
        match = classifierMatrix["alta|fios"];
      } else if (signal === "chuva") {
        match = classifierMatrix["media|lencol"];
      } else if (alt === "media") {
        match = classifierMatrix["media|fofa"];
      } else {
        match = shape === "lencol" ? classifierMatrix["baixa|lencol"] : classifierMatrix["baixa|fofa"];
      }
    } else if (signal === "halo" && alt === "alta") {
      match = classifierMatrix["alta|veu"];
    } else if (signal === "trovoada") {
      match = classifierMatrix["vertical|torre"];
    }

    currentIdentifiedGenus = match.name;
    if (idGenusName) idGenusName.textContent = match.name;
    if (idGenusDesc) idGenusDesc.textContent = match.desc;
    if (idOutAltitude) idOutAltitude.textContent = match.altitude;
    if (idOutWeather) idOutWeather.textContent = match.weather;
  }

  [idAltitude, idShape, idSignal].forEach((el) => {
    if (el) el.addEventListener("change", updateIdentifier);
  });
  updateIdentifier();

  /* ------------------------------------------------------------------------
     6. Cloud Detail Modal
     ------------------------------------------------------------------------ */
  const cloudsCatalog = {
    "cumulonimbus": {
      title: "Cumulonimbus (Cb)",
      meta: "Desenvolvimento vertical · Base ~800 m até 12+ km",
      summary: "Nuvem densa e imponente associada a tempestades convectivas. Seu topo frequentemente se espalha contra a tropopausa formando uma bigorna.",
      facts: [
        "Composição mista: gotículas de água na base e cristais de gelo no topo congelado.",
        "Correntes internas ascendentes e descendentes superam facilmente dezenas de km/h.",
        "Responsável por chuvas intensas, trovoadas, rajadas de vento e eventual granizo."
      ],
      selectValue: "Cumulonimbus (Cb)"
    },
    "cumulus": {
      title: "Cumulus (Cu)",
      meta: "Andar baixo · 600 m a 2.000 m",
      summary: "Nuvem isolada de contornos bem definidos, base plana escurecida e topo branco brilhante sob iluminação solar direta.",
      facts: [
        "Formada pelo aquecimento do solo e subida de bolsões de ar úmido durante o dia.",
        "Na variedade humilis, costuma indicar estabilidade atmosférica e bom tempo.",
        "Pode evoluir verticalmente para Cumulus congestus quando há muita umidade disponível."
      ],
      selectValue: "Cumulus (Cu)"
    },
    "cirrus": {
      title: "Cirrus (Ci)",
      meta: "Andar alto · 6.000 m a 12.000 m",
      summary: "Filamentos brancos e sedosos sem sombra própria, moldados pelos ventos fortes das camadas superiores da troposfera.",
      facts: [
        "Composta integralmente por cristais de gelo devido às baixas temperaturas em altitude.",
        "Não gera chuva que atinja o solo (precipitação evapora antes, fenômeno conhecido como virga).",
        "Aumento gradual de Cirrus seguidas por Cirrostratus pode anteceder uma frente fria."
      ],
      selectValue: "Cirrus (Ci)"
    },
    "altocumulus": {
      title: "Altocumulus (Ac)",
      meta: "Andar médio · 2.000 m a 6.000 m",
      summary: "Lençóis ou conjuntos de glóbulos brancos e acinzentados em ondas regulares, popularmente chamados de céu encarneirado.",
      facts: [
        "Formada principalmente por gotículas de água super-resfriadas.",
        "Diferencia-se do Cirrocumulus pelo tamanho aparente maior dos elementos e presença de sombras.",
        "Altocumulus castellanus pela manhã frequentemente sinaliza instabilidade atmosférica à tarde."
      ],
      selectValue: "Altocumulus (Ac)"
    }
  };

  const modalBackdrop = document.getElementById("cloud-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalSummary = document.getElementById("modal-summary");
  const modalFacts = document.getElementById("modal-facts");
  const modalLogBtn = document.getElementById("modal-log-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const logCloudSelect = document.getElementById("obs-cloud");
  const logNotesInput = document.getElementById("obs-notes");
  let activeCloud = null;
  let lastFocusedTrigger = null;

  function openModal(id, trigger) {
    const item = cloudsCatalog[id];
    if (!item || !modalBackdrop) return;
    activeCloud = item;
    lastFocusedTrigger = trigger || document.activeElement;

    if (modalTitle) modalTitle.textContent = item.title;
    if (modalMeta) modalMeta.textContent = item.meta;
    if (modalSummary) modalSummary.textContent = item.summary;
    if (modalFacts) {
      modalFacts.innerHTML = "";
      item.facts.forEach((fact) => {
        const li = document.createElement("li");
        li.textContent = fact;
        modalFacts.appendChild(li);
      });
    }

    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modalBackdrop || modalBackdrop.hidden) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
      lastFocusedTrigger.focus();
    }
  }

  document.querySelectorAll("[data-open-cloud]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.getAttribute("data-open-cloud"), btn);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (event) => {
      if (event.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  function routeToLog(cloudLabel, presetNote) {
    if (logCloudSelect) {
      const optionExists = Array.from(logCloudSelect.options).some((opt) => opt.value === cloudLabel);
      if (optionExists) {
        logCloudSelect.value = cloudLabel;
      }
    }
    if (logNotesInput && presetNote && !logNotesInput.value.trim()) {
      logNotesInput.value = presetNote;
    }
    const logSection = document.getElementById("diario");
    if (logSection) logSection.scrollIntoView({ behavior: "smooth" });
  }

  if (modalLogBtn) {
    modalLogBtn.addEventListener("click", () => {
      const label = activeCloud ? activeCloud.selectValue : "Cumulus (Cu)";
      closeModal();
      routeToLog(label, "");
    });
  }

  if (idUseBtn) {
    idUseBtn.addEventListener("click", () => {
      routeToLog(currentIdentifiedGenus, `Identificação feita pelo guia: ${currentIdentifiedGenus}.`);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      setDrawerOpen(false);
    }
  });

  /* ------------------------------------------------------------------------
     7. Sky Observation Log Form (Static client-side list + validation)
     ------------------------------------------------------------------------ */
  const obsForm = document.getElementById("obs-form");
  const placeInput = document.getElementById("obs-place");
  const placeError = document.getElementById("place-error");
  const notesError = document.getElementById("notes-error");
  const formFeedback = document.getElementById("form-feedback");
  const savedLogs = document.getElementById("saved-logs");

  if (obsForm && placeInput && logNotesInput) {
    obsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;

      const placeVal = placeInput.value.trim();
      const notesVal = logNotesInput.value.trim();
      const cloudVal = logCloudSelect ? logCloudSelect.value : "Cumulus (Cu)";

      if (placeError) {
        if (placeVal.length < 2) {
          placeError.hidden = false;
          placeInput.setAttribute("aria-invalid", "true");
          valid = false;
        } else {
          placeError.hidden = true;
          placeInput.removeAttribute("aria-invalid");
        }
      }

      if (notesError) {
        if (notesVal.length < 8) {
          notesError.hidden = false;
          logNotesInput.setAttribute("aria-invalid", "true");
          valid = false;
        } else {
          notesError.hidden = true;
          logNotesInput.removeAttribute("aria-invalid");
        }
      }

      if (!formFeedback) return;

      if (valid) {
        formFeedback.hidden = false;
        formFeedback.classList.add("is-success");
        formFeedback.textContent = `Observação de ${cloudVal} registrada localmente para ${placeVal}. Nenhum dado sai do navegador nesta página estática.`;

        if (savedLogs) {
          const card = document.createElement("div");
          card.className = "saved-log-item";

          const head = document.createElement("div");
          head.className = "saved-log-head";
          const titleSpan = document.createElement("span");
          titleSpan.textContent = `${cloudVal} (${placeVal})`;
          const timeSpan = document.createElement("span");
          timeSpan.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

          const bodyP = document.createElement("p");
          bodyP.textContent = notesVal;

          head.appendChild(titleSpan);
          head.appendChild(timeSpan);
          card.appendChild(head);
          card.appendChild(bodyP);
          savedLogs.prepend(card);
        }

        obsForm.reset();
      } else {
        formFeedback.hidden = true;
        formFeedback.classList.remove("is-success");
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. Runtime Info Panel (Shows live browser origin)
     ------------------------------------------------------------------------ */
  const hostValue = document.getElementById("runtime-origin");
  if (hostValue) {
    hostValue.textContent = window.location.origin || "http://localhost:8080";
  }

  /* ------------------------------------------------------------------------
     9. Scroll Reveal via IntersectionObserver (Never window scroll listener)
     ------------------------------------------------------------------------ */
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    reveals.forEach((el) => observer.observe(el));
  }
})();
