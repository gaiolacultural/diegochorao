const targetDate = new Date("2026-06-27T12:00:00-03:00").getTime();

// Função que converte um número em marcações de "palitinho" (Tally Marks)
function getTallyHTML(num) {
    const bundles = Math.floor(num / 5);
    const singles = num % 5;
    let html = '';
    
    // SVG de 5 palitos (4 em pé e 1 cortando, desenhados "à mão" com curvas)
    const bundleSVG = `
        <svg viewBox="0 0 40 40" style="width: 2.5vh; height: 2.5vh; margin: 0.2vh;">
            <path d="M5,5 Q7,20 4,35 M15,4 Q13,20 16,36 M25,6 Q26,20 24,35 M35,5 Q34,20 36,36 M2,30 Q20,15 38,10" fill="none" stroke="#f4f4f4" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
        
    // SVG de 1 palito solto
    const singleSVG = `
        <svg viewBox="0 0 10 40" style="width: 0.6vh; height: 2.5vh; margin: 0.2vh;">
            <path d="M5,5 Q6,20 4,35" fill="none" stroke="#f4f4f4" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
        
    for (let i = 0; i < bundles; i++) html += bundleSVG;
    for (let i = 0; i < singles; i++) html += singleSVG;
    
    return html;
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById("countdown").innerHTML = "<h2>O ÁLBUM ESTÁ DISPONÍVEL!</h2>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = getTallyHTML(days);
    document.getElementById("hours").innerHTML = getTallyHTML(hours);
    document.getElementById("minutes").innerHTML = getTallyHTML(minutes);
    document.getElementById("seconds").innerHTML = getTallyHTML(seconds);
}

// Atualiza a cada segundo
setInterval(updateCountdown, 1000);

// Chamada inicial para evitar delay na tela
updateCountdown();


