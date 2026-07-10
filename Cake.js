(function () {

  // ---------------------------------------------------------
  // SETTINGS — tweak these to taste
  // ---------------------------------------------------------

  // Where to send your friend once the candles are blown out.
  // Change this to whatever page you want next.
  const REDIRECT_URL = "Message.html";

  // How loud a "blow" needs to be to count, on a 0–1 scale.
  // Raise this if it triggers too easily (e.g. from talking),
  // lower it if it's hard to trigger.
  const BLOW_THRESHOLD = 0.10;

  // How many consecutive loud animation frames are needed
  // before we count it as a real blow (avoids false triggers).
  const SUSTAIN_FRAMES = 6;

  // How long to let the confetti play before redirecting.
  const REDIRECT_DELAY_MS = 2600;

  // ---------------------------------------------------------

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

    // Side cannons for a couple of seconds
    const end = Date.now() + 2000;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // Candles / manual button always work as a fallback,
  // in case the mic is unavailable or the person prefers to tap.
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

      //if (micHint) micHint.textContent = "Blow into your microphone 💨";

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
      // Mic blocked, unavailable, or unsupported — offer the fallback button instead.
      //if (micHint) {
      //  micHint.textContent = "Couldn't access your mic — tap the button below to blow out the candles!";
      //}
      //if (manualBlowBtn) manualBlowBtn.style.display = "inline-block";
    }
  }

  setupMic();

})();
