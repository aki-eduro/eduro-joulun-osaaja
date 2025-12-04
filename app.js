const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const captureBtn = document.getElementById('capture-btn');
const nextBtn = document.getElementById('next-btn');
const printBtn = document.getElementById('print-btn');
const participantCountEl = document.getElementById('participant-count');
const videoEl = document.getElementById('camera-feed');
const canvasEl = document.getElementById('capture-canvas');
const cameraHint = document.getElementById('camera-hint');

const resultPhoto = document.getElementById('result-photo');
const resultNameEl = document.getElementById('result-name');
const resultTitleEl = document.getElementById('result-title');
const resultPowerEl = document.getElementById('result-power');

let mediaStream = null;
let participantCount = 0;
let latestResult = null;
let analysisTimeoutId = null;

const tonttuNames = [
  'Säihkysäde',
  'Piparinipsu',
  'Kuusenkoristelija',
  'Kanelitähti',
  'Lumisipaisu',
  'Tähtipolku',
  'Naururinkeli'
];

const tonttuTitles = [
  'Joulun osaaja – Lahjainspiraattori',
  'Joulun osaaja – Ilojen sytyttäjä',
  'Joulun osaaja – Kuusenkuningas',
  'Joulun osaaja – Piparimestari',
  'Joulun osaaja – Reen vauhdittaja'
];

const jouluvoimat = [
  '+10 % joulumieltä',
  '+25 % kanelintuoksua',
  '+40 % lahjailoa',
  '+15 % tontun taikapölyä',
  '+30 % naurua per minuutti'
];

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === id);
  });
}

async function initCamera() {
  if (mediaStream) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    videoEl.srcObject = mediaStream;
    cameraHint.textContent = 'Hymyile ja pidä kameran päällä!';
  } catch (error) {
    console.error('Kameran käynnistys epäonnistui', error);
    cameraHint.textContent = 'Kameran käyttö estetty. Tarkista selaimen luvat.';
  }
}

function capturePhoto() {
  if (!mediaStream) {
    cameraHint.textContent = 'Käynnistä kamera ensin.';
    return null;
  }

  const trackSettings = mediaStream.getVideoTracks()[0]?.getSettings();
  const width = trackSettings?.width || videoEl.videoWidth || 640;
  const height = trackSettings?.height || videoEl.videoHeight || 480;

  canvasEl.width = width;
  canvasEl.height = height;

  const context = canvasEl.getContext('2d');
  context.drawImage(videoEl, 0, 0, width, height);
  return canvasEl.toDataURL('image/png');
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function startAnalysis(imageData) {
  showScreen('screen-3');

  if (analysisTimeoutId) {
    clearTimeout(analysisTimeoutId);
  }

  analysisTimeoutId = setTimeout(() => {
    const name = randomItem(tonttuNames);
    const title = randomItem(tonttuTitles);
    const power = randomItem(jouluvoimat);

    latestResult = prepareResultData({ name, title, power, imageData });
    displayResult(latestResult);
  }, 2000);
}

function prepareResultData(result) {
  // 🚧 Future AI API hook: replace local random generation with backend call
  // to fetch dynamic tonttunimi, titteli ja jouluvoima using the captured image.
  return {
    ...result,
    createdAt: new Date().toISOString(),
  };
}

function displayResult(result) {
  resultPhoto.src = result.imageData;
  resultNameEl.textContent = result.name.toUpperCase();
  resultTitleEl.textContent = result.title;
  resultPowerEl.textContent = result.power;

  participantCount += 1;
  participantCountEl.textContent = participantCount;

  // Placeholder for backend payload construction
  console.log('Valmis lähetettävä data', result);

  showScreen('screen-4');
}

function resetExperience() {
  latestResult = null;
  resultPhoto.src = '';
  resultNameEl.textContent = 'TONTTUNIMI';
  resultTitleEl.textContent = '';
  resultPowerEl.textContent = '';
  showScreen('screen-1');
}

startBtn?.addEventListener('click', () => {
  showScreen('screen-2');
  initCamera();
});

captureBtn?.addEventListener('click', () => {
  const imageData = capturePhoto();
  if (!imageData) return;
  startAnalysis(imageData);
});

printBtn?.addEventListener('click', () => {
  // 🚧 Future print API hook: replace console.log with backend call that
  // sends `latestResult` to a PDF/tulostus-palvelu without user interaction.
  console.log('PRINT', latestResult);
});

nextBtn?.addEventListener('click', resetExperience);

// Keep the UI usable even if the camera never loads
if (!('mediaDevices' in navigator)) {
  cameraHint.textContent = 'Selain ei tue kameraa. Käytä päivitettyä selainta.';
}
