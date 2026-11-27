/* ===== Funções comuns a todas as páginas ===== */
const $ = (sel, el = document) => el.querySelector(sel);

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = (v) => v.toLocaleString('pt-BR');

// Tema claro/escuro (lembra a escolha)
function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  const icone = $('#temaBtn i');
  if (icone) icone.className = tema === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  try { localStorage.setItem('rn-tema', tema); } catch (e) {}
}
let temaSalvo = 'light';
try { temaSalvo = localStorage.getItem('rn-tema') || 'light'; } catch (e) {}
aplicarTema(temaSalvo);

$('#temaBtn')?.addEventListener('click', () => {
  aplicarTema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

// Menu lateral no celular
const sidebar = $('#sidebar');
$('#menuToggle')?.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (e) => {
  if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('#menuToggle')) {
    sidebar.classList.remove('open');
  }
});

// Busca: Enter leva para a página de produtos com o termo
$('#busca')?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.value.trim()) return;
  const raiz = location.pathname.includes('/pages/') ? '' : 'pages/';
  location.href = `${raiz}produtos.html?q=${encodeURIComponent(e.target.value.trim())}`;
});