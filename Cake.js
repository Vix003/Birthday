(function () {

  const REDIRECT_URL = "Message.html";

  const BLOW_THRESHOLD = 0.10;

  const SUSTAIN_FRAMES = 3;

  const REDIRECT_DELAY_MS = 2600;

  const wishText = document.getElementById("wishText");
  const candlesEl = document.getElementById("candles");
  const micHint = document.getElementById("micHint");
  const manualBlowBtn = document.getElementById("manualBlow");

  let blown = false;
  let loudFrames = 0;

  // Fade the wish text in shortly after load
  window.addEventListener("load", () => {
    setTimeout(() => wishText.classList.add("show"), 300);
  });

  function blowOutCandles() {
    if (blown) return;
    blown = true;

    candlesEl.classList.add("blown");

    if (micHint) micHint.style.opacity = 0;
    if (manualBlowBtn) manualBlowBtn.style.display = "none";

    fireConfetti();

    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, REDIRECT_DELAY_MS);
  }

  function fireConfetti() {
    if (typeof confetti !== "function") return;

    // A big central burst
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.5 },
    });

    // Side cannons
    const end = Date.now() + 2000;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  if (candlesEl) candlesEl.addEventListener("click", blowOutCandles);
  if (manualBlowBtn) manualBlowBtn.addEventListener("click", blowOutCandles);

  async function setupMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);

      function checkVolume() {
        if (blown) return;

        analyser.getByteTimeDomainData(data);

        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / data.length);

        if (rms > BLOW_THRESHOLD) {
          loudFrames++;
          if (loudFrames >= SUSTAIN_FRAMES) blowOutCandles();
        } else {
          loudFrames = 0;
        }

        requestAnimationFrame(checkVolume);
      }

      checkVolume();
    } catch (err) {
    }
  }

  setupMic();

})();
