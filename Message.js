document.getElementById("againBtn").addEventListener("click", () => {
    window.location.href = "Entry.html";
});

const duration = 3000;
const animationEnd = Date.now() + duration;

(function frame() {
    confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
    });

    confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
    });

    if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
    }
})();
