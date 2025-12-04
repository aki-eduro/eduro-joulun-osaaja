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

const visitorNames = [
  'Eduro-vieras',
  'Joulun ystävä',
  'Pikkujoulun sankari',
  'Tonttukoneen sankari'
];

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

const printStatusEl = document.createElement('p');
printStatusEl.className = 'hint';
printStatusEl.id = 'print-status';

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
    const name = randomItem(visitorNames);
    const elfName = randomItem(tonttuNames);
    const title = randomItem(tonttuTitles);
    const jouluPower = randomItem(jouluvoimat);

    latestResult = prepareResultData({ name, elfName, title, jouluPower, imageDataUrl: imageData });
    displayResult(latestResult);
  }, 2000);
}

function prepareResultData(result) {
  // 🚧 Future AI API hook: replace local random generation with backend call
  // to fetch dynamic tonttunimi, titteli ja jouluvoima using the captured image.
  const description = `Tonttukone tunnistaa, että ${result.elfName} on ${result.title.toLowerCase()} ` +
    `ja levittää iloa kaikkialle minne kulkee. ${result.jouluPower}!`;

  return {
    ...result,
    description,
    createdAt: new Date().toISOString(),
  };
}

function displayResult(result) {
  if (!printStatusEl.parentElement) {
    printBtn?.parentElement?.appendChild(printStatusEl);
  }

  printStatusEl.textContent = '';
  resultPhoto.src = result.imageDataUrl || '';
  resultNameEl.textContent = result.elfName.toUpperCase();
  resultTitleEl.textContent = result.title;
  resultPowerEl.textContent = result.jouluPower;

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
  printStatusEl.textContent = '';
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

async function sendToPrinter() {
  if (!latestResult) return;

  printStatusEl.textContent = 'Lähetetään tulostimeen…';
  printStatusEl.style.color = '#1f6f43';

  try {
    const response = await fetch('http://localhost:8000/api/print-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eduro-print-secret',
      },
      body: JSON.stringify({
        name: latestResult.name,
        elfName: latestResult.elfName,
        title: latestResult.title,
        description: latestResult.description,
        jouluPower: latestResult.jouluPower,
        imageDataUrl: latestResult.imageDataUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tulostus epäonnistui: ${response.status}`);
    }

    printStatusEl.textContent = 'Todistus lähetetty tulostimeen';
    printStatusEl.style.color = '#1f6f43';
  } catch (error) {
    console.error('Tulostus epäonnistui', error);
    printStatusEl.textContent = 'Tulostus epäonnistui. Tarkista yhteys tai yritä uudelleen.';
    printStatusEl.style.color = '#b00020';
  }
}

printBtn?.addEventListener('click', () => {
  if (!latestResult) return;
  sendToPrinter();
});

nextBtn?.addEventListener('click', resetExperience);

// Keep the UI usable even if the camera never loads
if (!('mediaDevices' in navigator)) {
  cameraHint.textContent = 'Selain ei tue kameraa. Käytä päivitettyä selainta.';
}
