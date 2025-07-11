// script.js

// — Usuários “hard-coded”
const usuarios = [
  { usuario: 'admin', senha: 'admin', papel: 'admin' },
  { usuario: 'func', senha: 'func', papel: 'func' }
];

// Recupera sessão e dados anteriores
let usuarioAtual = JSON.parse(sessionStorage.getItem('usuarioAtual'))
let recursos = JSON.parse(localStorage.getItem('recursos')) || []

// Elementos do DOM
const navegacao = document.getElementById('navegacao')
const visaoLogin = document.getElementById('visaoLogin')
const visaoPainel = document.getElementById('visaoPainel')
const visaoRecursos = document.getElementById('visaoRecursos')
const formularioLogin = document.getElementById('formularioLogin')
const erroLogin = document.getElementById('erroLogin')
const btnPainel = document.getElementById('btnPainel')
const btnRecursos = document.getElementById('btnRecursos')
const btnSair = document.getElementById('btnSair')
const totalRecursosSpan = document.getElementById('totalRecursos')
const totalQuantidadeSpan = document.getElementById('totalQuantidade')
const totalInvestimentoSpan = document.getElementById('totalInvestimento')
const mediaInvestimentoSpan = document.getElementById('mediaInvestimento')
const tabelaRecursos = document.getElementById('tabelaRecursos')
const formularioAdicionar = document.getElementById('formularioAdicionar')
const campoNomeRecurso = document.getElementById('campoNomeRecurso')
const campoTipoRecurso = document.getElementById('campoTipoRecurso')
const campoQuantidadeRecurso = document.getElementById('campoQuantidadeRecurso')
const campoValorRecurso = document.getElementById('campoValorRecurso')
const ctxGrafico = document.getElementById('grafico').getContext('2d')

let grafico;

// Mostra a visão solicitada
function mostrarVisao(visao) {
  visaoLogin.style.display = visao === 'login' ? 'block' : 'none'
  visaoPainel.style.display = visao === 'painel' ? 'block' : 'none'
  visaoRecursos.style.display = visao === 'recursos' ? 'block' : 'none'
}

// Processa login
function entrar(evento) {
  evento.preventDefault()
  const usu = document.getElementById('campoUsuario').value
  const sen = document.getElementById('campoSenha').value
  const achou = usuarios.find(u => u.usuario === usu && u.senha === sen)
  if (!achou) {
    erroLogin.textContent = 'Credenciais inválidas'
    return;
  }
  usuarioAtual = achou
  sessionStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual))
  inicializarApp()
}

// Processa logout
function sair() {
  sessionStorage.removeItem('usuarioAtual')
  usuarioAtual = null
  navegacao.style.display = 'none'
  mostrarVisao('login')
}

// Inicializa a aplicação
function inicializarApp() {
  if (usuarioAtual) {
    navegacao.style.display = 'block'
    if (usuarioAtual.papel !== 'admin') {
      btnRecursos.style.display = 'none'
    }
    mostrarVisao('painel')
    exibirPainel()
    exibirRecursos()
  } else {
    mostrarVisao('login')
  }
}

// Exibe o painel com total, quantidade, investimento e gráfico
function exibirPainel() {
  totalRecursosSpan.textContent = recursos.length

  // Quantidade total de unidades
  const totalQuantidade = recursos.reduce((soma, r) => soma + r.quantidade, 0);
  totalQuantidadeSpan.textContent = totalQuantidade

  // Valor total investido (quantidade * valor unitário)
  const totalInvestimento = recursos
    .reduce((soma, r) => soma + (r.quantidade * (r.valor ?? 0)), 0);
  totalInvestimentoSpan.textContent = totalInvestimento
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Média de investimento por recurso
  const mediaInvestimento = recursos.length
    ? totalInvestimento / recursos.length
    : 0;
  mediaInvestimentoSpan.textContent = mediaInvestimento
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Gráfico de pizza por tipo (soma de quantidades)
  const contagem = {};
  recursos.forEach(r => {
    contagem[r.tipo] = (contagem[r.tipo] || 0) + r.quantidade
  });
  const labels = Object.keys(contagem)
  const dados = Object.values(contagem)

  // if (grafico) grafico.destroy();
  // grafico = new Chart(ctxGrafico, {
  //   type: 'pie',
  //   data: {
  //     labels,
  //     datasets: [{ data: dados, backgroundColor:['#150072ff','#36a2eb','#815e00ff'] }]
  //   }
  // });
}

  // Renderiza tabela de recursos (admin)
  function exibirRecursos() {
    tabelaRecursos.innerHTML = ''
    recursos.forEach(r => {
      const linha = document.createElement('tr')
      linha.innerHTML = `
      <td>${r.id}</td>
      <td contenteditable>${r.nome}</td>
      <td contenteditable>${r.tipo}</td>
      <td contenteditable>${r.quantidade}</td>
      <td contenteditable>${r.valor ?? 0}</td>
      <td>
        <button data-id="${r.id}" class="btnSalvar">Salvar</button>
        <button data-id="${r.id}" class="btnExcluir">Excluir</button>
      </td>`;
      tabelaRecursos.appendChild(linha)
    });
    document.querySelectorAll('.btnSalvar').forEach(btn => btn.onclick = salvarRecurso)
    document.querySelectorAll('.btnExcluir').forEach(btn => btn.onclick = excluirRecurso)
  }

  // Salva um recurso editado
  function salvarRecurso(evento) {
    const id = +evento.target.dataset.id;
    const cols = evento.target.closest('tr').children
    const atual = {
      id,
      nome: cols[1].textContent.trim(),
      tipo: cols[2].textContent.trim(),
      quantidade: +cols[3].textContent.trim(),
      valor: +cols[4].textContent.trim()
    };
    recursos = recursos.map(r => r.id === id ? atual : r)
    localStorage.setItem('recursos', JSON.stringify(recursos))
    exibirRecursos()
    exibirPainel()
    alert('Recurso salvo!')
  }

  // Exclui um recurso
  function excluirRecurso(evento) {
    if (!confirm('Deseja realmente excluir este recurso?')) return
    const id = +evento.target.dataset.id
    recursos = recursos.filter(r => r.id !== id)
    localStorage.setItem('recursos', JSON.stringify(recursos))
    exibirRecursos()
    exibirPainel()
  }

  // Adiciona novo recurso
  function adicionarRecurso(evento) {
    evento.preventDefault()
    const novo = {
      id: recursos.length ? Math.max(...recursos.map(r => r.id)) + 1 : 1,
      nome: campoNomeRecurso.value,
      tipo: campoTipoRecurso.value,
      quantidade: +campoQuantidadeRecurso.value,
      valor: +campoValorRecurso.value
    };
    recursos.push(novo)
    localStorage.setItem('recursos', JSON.stringify(recursos))
    formularioAdicionar.reset()
    exibirRecursos()
    exibirPainel()
  }

  // Abre e fecha o modal de adicionar recurso
const btnAbrir  = document.getElementById('btnAbrirModal');
const modal     = document.getElementById('modalAdicionar');
const btnFechar = modal.querySelector('.fechar');

btnAbrir.addEventListener('click', () => {
  modal.style.display = 'flex';
});

btnFechar.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Fecha se clicar fora do conteúdo
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});



  // Liga eventos
  formularioLogin.addEventListener('submit', entrar)
  btnSair.onclick = sair;
  btnPainel.onclick = () => mostrarVisao('painel')
  btnRecursos.onclick = () => mostrarVisao('recursos')
  formularioAdicionar.addEventListener('submit', adicionarRecurso)

  // Inicia app
  inicializarApp()
