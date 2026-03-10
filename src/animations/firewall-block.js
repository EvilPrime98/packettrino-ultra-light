export function igniteFire(networkObjectId) {
    const $networkObject = document.getElementById(networkObjectId);
    const $fire = document.createElement("div");
    $fire.classList.add("fire-container");
    $fire.innerHTML = `
        <div class="heat-haze"></div>
        <img src="/fire.svg" class="fire-img" alt="Animated fire">
    `;
    $networkObject.appendChild($fire);

    setTimeout(() => {
        $fire.remove();
    }, 2000);
}