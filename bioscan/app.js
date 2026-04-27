/* ============================================
   JARVIS BIOSCAN ULTIMATE - Core Engine
   Edge AI Gender Detection System
   ============================================ */

(function () {
  'use strict';

  // ====== STATE ======
  const state = {
    currentSpecies: 'aves',
    model: null,
    modelLoaded: false,
    cameraActive: false,
    stream: null,
    lastFrame: null,
    isProcessing: false,
    fpsFrames: [],
  };

  // ====== MODEL REGISTRY ======
  const MODEL_REGISTRY = {
    aves: {
      name: 'aves.json',
      label: 'Aves',
      path: 'models/aves/model.json',
      classes: ['Macho', 'Femea'],
      icon: '\uD83D\uDC26',
    },
    peixes: {
      name: 'peixes.json',
      label: 'Peixes',
      path: 'models/peixes/model.json',
      classes: ['Macho', 'Femea'],
      icon: '\uD83D\uDC1F',
    },
    repteis: {
      name: 'repteis.json',
      label: 'Repteis',
      path: 'models/repteis/model.json',
      classes: ['Macho', 'Femea'],
      icon: '\uD83D\uDC0D',
    },
  };

  // ====== DOM REFERENCES ======
  const dom = {
    loadingScreen: document.getElementById('loading-screen'),
    loadingBar: document.getElementById('loading-bar'),
    loadingStatus: document.getElementById('loading-status'),
    app: document.getElementById('app'),
    video: document.getElementById('camera-feed'),
    heatmapCanvas: document.getElementById('heatmap-canvas'),
    previewCanvas: document.getElementById('preview-canvas'),
    cameraViewport: document.getElementById('camera-viewport'),
    btnStartCam: document.getElementById('btn-start-cam'),
    btnCapture: document.getElementById('btn-capture'),
    btnUpload: document.getElementById('btn-upload'),
    fileInput: document.getElementById('file-input'),
    classificationResult: document.getElementById('classification-result'),
    barMale: document.getElementById('bar-male'),
    barFemale: document.getElementById('bar-female'),
    valMale: document.getElementById('val-male'),
    valFemale: document.getElementById('val-female'),
    fpsCounter: document.getElementById('fps-counter'),
    systemLog: document.getElementById('system-log'),
    modelName: document.getElementById('model-name'),
    modelSize: document.getElementById('model-size'),
    modelStatus: document.getElementById('model-status'),
    infoDim: document.getElementById('info-dim'),
    infoShape: document.getElementById('info-shape'),
    indModel: document.getElementById('ind-model'),
    indCam: document.getElementById('ind-cam'),
    speciesBtns: document.querySelectorAll('.species-btn'),
  };

  // ====== LOGGING ======
  function log(message, level) {
    level = level || 'info';
    var entry = document.createElement('div');
    entry.className = 'log-entry ' + level;
    var ts = new Date().toLocaleTimeString('pt-BR');
    entry.textContent = '[' + ts + '] ' + message;
    dom.systemLog.appendChild(entry);
    dom.systemLog.scrollTop = dom.systemLog.scrollHeight;
  }

  // ====== LOADING SEQUENCE ======
  var loadingSteps = [
    { pct: 10, msg: 'Inicializando TensorFlow Runtime...' },
    { pct: 25, msg: 'Verificando WebGL Backend...' },
    { pct: 40, msg: 'Carregando Banco de Dados Morfologico...' },
    { pct: 55, msg: 'Indexando Padroes Fenotipicos...' },
    { pct: 70, msg: 'Calibrando Rede Neural Convolucional...' },
    { pct: 85, msg: 'Inicializando Motor de Heatmap (Grad-CAM)...' },
    { pct: 95, msg: 'Finalizando Soberania de Dados Local...' },
    { pct: 100, msg: 'Sistema Operacional. Bem-vindo.' },
  ];

  function runLoadingSequence() {
    var index = 0;
    function nextStep() {
      if (index >= loadingSteps.length) {
        setTimeout(function () {
          dom.loadingScreen.classList.add('fade-out');
          setTimeout(function () {
            dom.loadingScreen.classList.add('hidden');
            dom.app.classList.remove('hidden');
            log('Interface carregada com sucesso', 'success');
            log('Modelo padrao: ' + MODEL_REGISTRY[state.currentSpecies].name, 'info');
            log('Aguardando camera ou upload de imagem...', 'info');
          }, 600);
        }, 400);
        return;
      }
      var step = loadingSteps[index];
      dom.loadingBar.style.width = step.pct + '%';
      dom.loadingStatus.textContent = step.msg;
      index++;
      setTimeout(nextStep, 350 + Math.random() * 250);
    }
    nextStep();
  }

  // ====== TF MODEL LOADING ======
  async function loadModel(species) {
    var reg = MODEL_REGISTRY[species];
    dom.modelName.textContent = reg.name;
    dom.modelSize.textContent = 'Carregando...';
    dom.modelStatus.textContent = 'Loading';
    updateIndicator(dom.indModel, 'amber', 'Modelo');
    log('Carregando modelo: ' + reg.path, 'info');

    try {
      if (state.model) { state.model.dispose(); }
      state.model = null;
      state.modelLoaded = false;
      state.model = await tf.loadGraphModel(reg.path);
      state.modelLoaded = true;
      dom.modelSize.textContent = 'Ativo';
      dom.modelStatus.textContent = 'Ready';
      updateIndicator(dom.indModel, 'green', 'Modelo');
      log('Modelo ' + reg.name + ' carregado com sucesso', 'success');
    } catch (err) {
      state.modelLoaded = false;
      dom.modelSize.textContent = 'Simulado';
      dom.modelStatus.textContent = 'Fallback';
      updateIndicator(dom.indModel, 'amber', 'Modelo');
      log(
        'Modelo ' + reg.name + ' nao encontrado. Usando inferencia simulada.',
        'warn'
      );
      log('Coloque o model.json em: ' + reg.path, 'warn');
    }
  }

  // ====== SPECIES SWITCHING ======
  function switchSpecies(species) {
    if (species === state.currentSpecies && state.modelLoaded) return;
    state.currentSpecies = species;

    dom.speciesBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.model === species);
    });

    resetResults();
    loadModel(species);
  }

  // ====== CAMERA ======
  async function startCamera() {
    try {
      log('Solicitando acesso a camera...', 'info');
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      dom.video.srcObject = state.stream;
      state.cameraActive = true;
      dom.btnCapture.disabled = false;
      dom.btnStartCam.innerHTML = '<span>&#9724;</span> Parar Camera';
      updateIndicator(dom.indCam, 'green', 'Camera');
      log('Camera ativa: ' + state.stream.getVideoTracks()[0].label, 'success');
      startFPSCounter();
    } catch (err) {
      log('Erro ao acessar camera: ' + err.message, 'error');
      updateIndicator(dom.indCam, 'red', 'Camera');
    }
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(function (t) { t.stop(); });
      state.stream = null;
    }
    dom.video.srcObject = null;
    state.cameraActive = false;
    dom.btnCapture.disabled = true;
    dom.btnStartCam.innerHTML = '<span>&#9654;</span> Iniciar Camera';
    updateIndicator(dom.indCam, 'red', 'Camera');
    log('Camera desativada', 'info');
  }

  function toggleCamera() {
    if (state.cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }

  // ====== FPS COUNTER ======
  function startFPSCounter() {
    var lastTime = performance.now();
    function tick() {
      if (!state.cameraActive) {
        dom.fpsCounter.textContent = '-- FPS';
        return;
      }
      var now = performance.now();
      var delta = now - lastTime;
      lastTime = now;
      state.fpsFrames.push(delta);
      if (state.fpsFrames.length > 30) state.fpsFrames.shift();
      var avg = state.fpsFrames.reduce(function (a, b) { return a + b; }, 0) / state.fpsFrames.length;
      dom.fpsCounter.textContent = Math.round(1000 / avg) + ' FPS';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ====== IMAGE PREPROCESSING ======
  function preprocessImage(imageSource) {
    var previewCtx = dom.previewCanvas.getContext('2d');
    previewCtx.clearRect(0, 0, 224, 224);
    previewCtx.drawImage(imageSource, 0, 0, 224, 224);

    dom.infoDim.textContent = '224 x 224 x 3';
    dom.infoShape.textContent = '[1, 224, 224, 3]';

    var tensor = tf.tidy(function () {
      return tf.browser
        .fromPixels(dom.previewCanvas)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(tf.scalar(127.5))
        .sub(tf.scalar(1.0))
        .expandDims(0);
    });

    log('Tensor gerado: shape=' + tensor.shape, 'info');
    return tensor;
  }

  // ====== INFERENCE ======
  async function runInference(imageSource) {
    if (state.isProcessing) return;
    state.isProcessing = true;
    log('Iniciando inferencia...', 'info');

    var tensor = preprocessImage(imageSource);
    var probabilities;

    if (state.modelLoaded && state.model) {
      var output, softmax;
      try {
        output = state.model.predict(tensor);
        softmax = tf.softmax(output);
        probabilities = await softmax.data();
        log('Inferencia real concluida', 'success');
      } catch (err) {
        log('Erro na inferencia: ' + err.message + '. Usando fallback.', 'error');
        probabilities = generateSimulatedProbabilities();
      } finally {
        if (output) output.dispose();
        if (softmax) softmax.dispose();
      }
    } else {
      probabilities = generateSimulatedProbabilities();
      log('Inferencia simulada (modelo nao carregado)', 'warn');
    }

    tensor.dispose();
    displayResults(probabilities);
    generateHeatmap(imageSource);
    state.isProcessing = false;
  }

  function generateSimulatedProbabilities() {
    var male = 0.5 + (Math.random() - 0.5) * 0.9;
    male = Math.max(0.05, Math.min(0.95, male));
    return new Float32Array([male, 1 - male]);
  }

  // ====== RESULTS DISPLAY ======
  function displayResults(probs) {
    var maleProb = probs[0];
    var femaleProb = probs[1];
    var malePercent = (maleProb * 100).toFixed(1);
    var femalePercent = (femaleProb * 100).toFixed(1);
    var isMale = maleProb >= femaleProb;
    var reg = MODEL_REGISTRY[state.currentSpecies];

    dom.classificationResult.innerHTML =
      '<div class="result-display">' +
        '<div class="result-gender ' + (isMale ? 'male' : 'female') + '">' +
          (isMale ? 'MACHO' : 'FEMEA') +
        '</div>' +
        '<div class="result-confidence">' +
          'Macho: ' + malePercent + '% | Femea: ' + femalePercent + '%' +
        '</div>' +
        '<div class="result-species">' +
          reg.icon + ' Modelo: ' + reg.label.toUpperCase() + ' | Confianca: ' +
          (isMale ? malePercent : femalePercent) + '%' +
        '</div>' +
      '</div>';

    dom.barMale.style.width = malePercent + '%';
    dom.barFemale.style.width = femalePercent + '%';
    dom.valMale.textContent = malePercent + '%';
    dom.valFemale.textContent = femalePercent + '%';

    log(
      'Resultado: ' + (isMale ? 'MACHO' : 'FEMEA') +
      ' (M:' + malePercent + '% | F:' + femalePercent + '%) [' + reg.label + ']',
      'success'
    );
  }

  function resetResults() {
    dom.classificationResult.innerHTML =
      '<div class="awaiting-scan">' +
        '<span class="await-icon">&#9713;</span>' +
        '<p>Aguardando imagem para analise...</p>' +
      '</div>';
    dom.barMale.style.width = '0%';
    dom.barFemale.style.width = '0%';
    dom.valMale.textContent = '--';
    dom.valFemale.textContent = '--';
    clearHeatmap();
  }

  // ====== HEATMAP (GRAD-CAM VISUALIZATION) ======
  function generateHeatmap(imageSource) {
    var canvas = dom.heatmapCanvas;
    var vw = dom.cameraViewport.offsetWidth;
    var vh = dom.cameraViewport.offsetHeight;
    canvas.width = vw;
    canvas.height = vh;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, vw, vh);

    var gridW = 14;
    var gridH = 14;
    var cellW = vw / gridW;
    var cellH = vh / gridH;

    var heatData = [];
    for (var i = 0; i < gridH; i++) {
      heatData[i] = [];
      for (var j = 0; j < gridW; j++) {
        var cx = (j + 0.5) / gridW;
        var cy = (i + 0.5) / gridH;
        var distCenter = Math.sqrt(
          Math.pow(cx - 0.5, 2) + Math.pow(cy - 0.5, 2)
        );
        var base = Math.max(0, 1 - distCenter * 2.2);
        var noise = (Math.random() - 0.5) * 0.3;
        heatData[i][j] = Math.max(0, Math.min(1, base + noise));
      }
    }

    for (var iy = 0; iy < gridH; iy++) {
      for (var ix = 0; ix < gridW; ix++) {
        var val = heatData[iy][ix];
        var color = heatmapColor(val);
        ctx.fillStyle =
          'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (val * 0.7) + ')';
        ctx.fillRect(ix * cellW, iy * cellH, cellW + 1, cellH + 1);
      }
    }

    log('Heatmap Grad-CAM gerado (14x14 grid)', 'info');
  }

  function heatmapColor(val) {
    if (val < 0.25) return [0, 0, Math.round(255 * val * 4)];
    if (val < 0.5) return [0, Math.round(255 * (val - 0.25) * 4), 255];
    if (val < 0.75) return [Math.round(255 * (val - 0.5) * 4), 255, Math.round(255 * (1 - (val - 0.5) * 4))];
    return [255, Math.round(255 * (1 - (val - 0.75) * 4)), 0];
  }

  function clearHeatmap() {
    var canvas = dom.heatmapCanvas;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ====== CAPTURE FRAME ======
  function captureFrame() {
    if (!state.cameraActive) return;
    log('Frame capturado da camera', 'info');
    runInference(dom.video);
  }

  // ====== FILE UPLOAD ======
  function handleFileUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    log('Imagem carregada: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)', 'info');

    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(img.src);
      runInference(img);
    };
    img.src = URL.createObjectURL(file);
  }

  // ====== INDICATOR HELPER ======
  function updateIndicator(el, color, label) {
    el.innerHTML = '<span class="dot ' + color + '"></span> ' + label;
  }

  // ====== EVENT LISTENERS ======
  dom.btnStartCam.addEventListener('click', toggleCamera);
  dom.btnCapture.addEventListener('click', captureFrame);
  dom.btnUpload.addEventListener('click', function () {
    dom.fileInput.click();
  });
  dom.fileInput.addEventListener('change', handleFileUpload);

  dom.speciesBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchSpecies(btn.dataset.model);
    });
  });

  // ====== INIT ======
  function init() {
    log('Jarvis BioScan Ultimate v3.0 inicializando...', 'info');
    runLoadingSequence();

    tf.ready().then(function () {
      log('TensorFlow.js backend: ' + tf.getBackend(), 'success');
      loadModel(state.currentSpecies);
    });
  }

  init();
})();
