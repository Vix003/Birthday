document.querySelectorAll(".cake-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const flavor = btn.dataset.flavor; // "chocolate" | "vanilla" | "redvelvet"

    localStorage.setItem("cakeFlavor", flavor);

    window.location.href = "Cake.html";
  });
});
