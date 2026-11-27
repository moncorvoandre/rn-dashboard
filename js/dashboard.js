/* ===== Dashboard =====
   Os dados abaixo são de exemplo. Quando tiver um back-end ou
   localStorage, troque este objeto pelos dados reais. */
const dados = {
  periodos: {
    7:  { vendas: 3120.5,  vendasVar: 4,  produtos: 560,  produtosVar: 3,  estoque: 1250, estoqueVar: -1, ticket: 51.8,  ticketVar: 2,
          series: [[3, 5, 4, 6, 5, 7, 8], [10, 12, 11, 13, 12, 14, 15], [9, 8, 9, 7, 8, 7, 7], [4, 5, 4, 6, 5, 6, 7]] },
    30: { vendas: 12450,   vendasVar: 12, produtos: 2340, produtosVar: 8,  estoque: 1250, estoqueVar: -3, ticket: 53.21, ticketVar: 5,
          series: [[3, 4, 3, 5, 4, 6, 7], [8, 10, 9, 11, 10, 12, 13], [10, 9, 9, 8, 8, 7, 6], [3, 4, 5, 4, 6, 6, 7]] },
    90: { vendas: 36890.9, vendasVar: 9,  produtos: 6710, produtosVar: 6,  estoque: 1250, estoqueVar: -5, ticket: 54.9,  ticketVar: 7,
          series: [[4, 5, 6, 5, 7, 8, 9], [9, 10, 12, 11, 13, 14, 15], [11, 10, 9, 9, 8, 7, 6], [5, 4, 6, 6, 7, 8, 9]] }
  },
  vendasDia: [650, 1020, 1200, 880, 1160, 960, 1370],
  maisVendidos: [
    { nome: 'Caderno Universitário', qtd: 320, emoji: '📓', cor: '#4F46E5' },
    { nome: 'Caneta Azul',           qtd: 280, emoji: '🖊️', cor: '#3B82F6' },
    { nome: 'Garrafa Térmica',       qtd: 210, emoji: '🧴', cor: '#EC4899' },
    { nome: 'Mochila Escolar',       qtd: 180, emoji: '🎒', cor: '#10B981' },
    { nome: 'Papel A4',              qtd: 150, emoji: '📄', cor: '#F97316' }
  ],
  ultimasVendas: [
    { data: '23/11/2025 - 16:45', itens: 'Caderno + Caneta', valor: 42.9,  pgto: 'PIX' },
    { data: '23/11/2025 - 16:40', itens: 'Garrafa Térmica',  valor: 89.9,  pgto: 'Cartão' },
    { data: '23/11/2025 - 16:35', itens: 'Mochila Escolar',  valor: 129.9, pgto: 'Dinheiro' }
  ]
};

/* ---------- KPIs ---------- */
function sparkline(pontos, cor) {
  const max = Math.max(...pontos), min = Math.min(...pontos);
  const coords = pontos.map((p, i) => {
    const x = (i / (pontos.length - 1)) * 100;
    const y = 28 - ((p - min) / (max - min || 1)) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${coords}" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}

function renderKpis(dias) {
  const d = dados.periodos[dias];
  const itens = [
    { cls: 'kpi-roxo',    icone: 'fa-cart-shopping', titulo: 'Total de Vendas',    valor: moeda(d.vendas),    v: d.vendasVar,    cor: '#6366F1' },
    { cls: 'kpi-verde',   icone: 'fa-box',           titulo: 'Produtos Vendidos',  valor: numero(d.produtos), v: d.produtosVar,  cor: '#10B981' },
    { cls: 'kpi-laranja', icone: 'fa-boxes-stacked', titulo: 'Itens em Estoque',   valor: numero(d.estoque),  v: d.estoqueVar,   cor: '#F97316' },
    { cls: 'kpi-azul',    icone: 'fa-dollar-sign',   titulo: 'Ticket Médio',       valor: moeda(d.ticket),    v: d.ticketVar,    cor: '#3B82F6' }
  ];
  $('#kpis').innerHTML = itens.map((k, i) => `
    <article class="kpi ${k.cls}">
      <span class="kpi-icon"><i class="fa-solid ${k.icone}"></i></span>
      <div>
        <small>${k.titulo}</small>
        <strong>${k.valor}</strong>
        <span class="var ${k.v >= 0 ? 'up' : 'down'}">
          <i class="fa-solid fa-arrow-${k.v >= 0 ? 'up' : 'down'}"></i> ${k.v >= 0 ? '+' : ''}${k.v}%
        </span>
      </div>
      ${sparkline(d.series[i], k.cor)}
    </article>`).join('');
}

/* ---------- Gráfico de linha (SVG) ---------- */
function renderGrafico() {
  const W = 640, H = 270, L = 48, R = 20, T = 16, B = 44;
  const v = dados.vendasDia, max = 1500;
  const x = (i) => L + (i / (v.length - 1)) * (W - L - R);
  const y = (val) => T + (1 - val / max) * (H - T - B);

  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const labels = v.map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (v.length - 1 - i));
    return { dia: dias[dt.getDay()], data: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
  });

  const grade = [0, 500, 1000, 1500].map(g => `
    <line class="grade" x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}"/>
    <text x="${L - 10}" y="${y(g) + 4}" text-anchor="end">${g === 0 ? '0' : numero(g)}</text>`).join('');
  const pontos = v.map((val, i) => `${x(i)},${y(val)}`).join(' ');
  const area = `${L},${y(0)} ${pontos} ${x(v.length - 1)},${y(0)}`;

  $('#grafico').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de vendas dos últimos 7 dias">
      <defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6366F1" stop-opacity=".28"/><stop offset="1" stop-color="#6366F1" stop-opacity=".02"/>
      </linearGradient></defs>
      ${grade}
      <polygon points="${area}" fill="url(#gArea)"/>
      <polyline points="${pontos}" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linejoin="round"/>
      ${v.map((val, i) => `
        <circle cx="${x(i)}" cy="${y(val)}" r="5" fill="#fff" stroke="#4F46E5" stroke-width="2.5">
          <title>${labels[i].data}: ${moeda(val)}</title></circle>
        <text x="${x(i)}" y="${H - 22}" text-anchor="middle">${labels[i].dia}</text>
        <text x="${x(i)}" y="${H - 6}" text-anchor="middle">${labels[i].data}</text>`).join('')}
    </svg>`;
}

/* ---------- Mais vendidos ---------- */
function renderTop() {
  const max = Math.max(...dados.maisVendidos.map(p => p.qtd));
  $('#topProdutos').innerHTML = dados.maisVendidos.map((p, i) => `
    <li>
      <span class="pos">${i + 1}</span>
      <span class="thumb" aria-hidden="true">${p.emoji}</span>
      <div>
        <div class="linha"><span>${p.nome}</span><span>${p.qtd} un.</span></div>
        <div class="barra"><i style="width:${(p.qtd / max) * 100}%;background:${p.cor}"></i></div>
      </div>
    </li>`).join('');
}

/* ---------- Últimas vendas ---------- */
function renderVendas() {
  const corpo = $('#ultimasVendas');
  if (!dados.ultimasVendas.length) {
    corpo.innerHTML = '<tr><td colspan="4" class="vazio">Nenhuma venda ainda. Clique em Nova Venda para começar.</td></tr>';
    return;
  }
  corpo.innerHTML = dados.ultimasVendas.map(s => `
    <tr>
      <td>${s.data}</td><td>${s.itens}</td><td>${moeda(s.valor)}</td>
      <td><span class="badge ${s.pgto.toLowerCase().replace('ã', 'a')}">${s.pgto}</span></td>
    </tr>`).join('');
}

/* ---------- Inicialização ---------- */
$('#periodo').addEventListener('change', (e) => renderKpis(e.target.value));
renderKpis($('#periodo').value);
renderGrafico();
renderTop();
renderVendas();