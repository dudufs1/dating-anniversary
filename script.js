gsap.registerPlugin(ScrollTrigger);

// Animação dos Cards
document.querySelectorAll(".card").forEach((card, index) => {
    gsap.to(card, {
        opacity: 1,
        y: -30,
        duration: 1,
        delay: index * 0.3,
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });
});
function parseYMDLocal(ymd) {
  // "AAAA-MM-DD" -> Date no fuso local, às 12:00
  const [Y, M, D] = ymd.split("-").map(Number);
  return new Date(Y, M - 1, D, 12, 0, 0, 0);
}
function toLocalNoon(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}
function addMonthsLocal(date, n) {
  // preserva o dia (se possível); se não, usa o último dia do mês alvo
  const Y = date.getFullYear();
  const M = date.getMonth();
  const D = date.getDate();
  const targetY = Y + Math.floor((M + n) / 12);
  const targetM = (M + n) % 12 < 0 ? (12 + ((M + n) % 12)) : ((M + n) % 12);
  const lastDay = new Date(targetY, targetM + 1, 0).getDate();
  const day = Math.min(D, lastDay);
  return new Date(targetY, targetM, day, 12, 0, 0, 0);
}
function diffYMD_exact(start, end) {
  // normaliza para meio-dia local para evitar dias de 23/25h
  const s = toLocalNoon(start);
  const e = toLocalNoon(end);
  if (e < s) return { years: 0, months: 0, days: 0 };

  // meses totais entre s e e (aprox), depois ajusta
  let totalMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  let anchor = addMonthsLocal(s, totalMonths);
  if (anchor > e) {
    totalMonths--;
    anchor = addMonthsLocal(s, totalMonths);
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // diferença de dias entre a âncora e a data final (em dias "calendário")
  const msPerDay = 24 * 60 * 60 * 1000;
  // usar arredondamento para neutralizar qualquer diferença residual de milissegundos
  const days = Math.round((toLocalNoon(e) - toLocalNoon(anchor)) / msPerDay);

  return { years, months, days };
}
function formatarMensagem({ years, months, days }, start, end) {
  // Mensagem especial quando é exatamente o dia do mesversário/aniversário
  if (days === 0 && (years > 0 || months > 0) && end.getDate() === start.getDate()) {
    const partes = [];
    if (years) partes.push(`${years} ano${years > 1 ? "s" : ""}`);
    if (months) partes.push(`${months} mês${months > 1 ? "es" : ""}`);
    return `Hoje completamos ${partes.join(" e ")} 💖`;
  }

  const partes = [];
  if (years) partes.push(`${years} ano${years > 1 ? "s" : ""}`);
  if (months) partes.push(`${months} mês${months > 1 ? "es" : ""}`);
  partes.push(`${days} dia${days === 1 ? "" : "s"}`);
  return `Estamos juntos há ${partes.join(" e ")} 💕`;
}

// ============ Renderização ============
function atualizarDateBirthLove() {
  const els = document.querySelectorAll("#dateBirthLove");
  if (!els.length) return;

  const agora = new Date();
  const hoje = toLocalNoon(agora);

  els.forEach(el => {
    // prioriza data no atributo data-start; se não houver, tenta texto ou cai fora
    const startAttr = el.getAttribute("data-start"); // formato "AAAA-MM-DD"
    let start = startAttr ? parseYMDLocal(startAttr) : null;

    if (!start) {
      el.textContent = "Defina data-start=\"AAAA-MM-DD\" na tag.";
      return;
    }

    const { years, months, days } = diffYMD_exact(start, hoje);
    el.textContent = formatarMensagem({ years, months, days }, start, hoje);
  });
}

// roda agora
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", atualizarDateBirthLove);
} else {
  atualizarDateBirthLove();
}

// atualiza todo dia após a meia-noite local
(function scheduleMidnightUpdate() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  setTimeout(() => { atualizarDateBirthLove(); scheduleMidnightUpdate(); }, next - now);
})();