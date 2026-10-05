const pagina = document.body.dataset.page;
const $ = (id) => document.getElementById(id);
const Sessao = {
  usuarios: () => JSON.parse(localStorage.getItem("usuarios") || "[]"),
  salvarUsuarios: (lista) => localStorage.setItem("usuarios", JSON.stringify(lista)),
  atual: () => JSON.parse(localStorage.getItem("usuarioAtual") || "null"),
  entrar: (usuario) => localStorage.setItem("usuarioAtual", JSON.stringify(usuario)),
  sair: () => localStorage.removeItem("usuarioAtual"),
};
function mostrarAviso(texto) {
  document.querySelector(".toast")?.remove();
  const aviso = document.createElement("div");
  aviso.className = "toast";
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 1800);
}
function iniciarFooter() {
  $("dataAtual").textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function iniciarMenu() {
  const btnSobre = document.getElementById('btn-sobre');
  const menuVerticalSobre = document.getElementById('menu-vertical-sobre');
  const btnContato = document.getElementById('btn-contato');
  const menuVerticalContato = document.getElementById('menu-vertical-contato');
  btnSobre.addEventListener('click', function (event) {
    abreMenu(event, menuVerticalSobre);
  });
  btnContato.addEventListener('click', function (event) {
    abreMenu(event, menuVerticalContato);
  });
  function abreMenu(event, menu) {
    event.preventDefault(); // Evita que a página recarregue ao clicar no link
    menu.classList.toggle('active');
  }
  function fechaMenu(event, menu, btn) {
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.classList.remove('active');
    }
  }
  document.addEventListener('click', function (event) {
    fechaMenu(event, menuVerticalSobre, btnSobre);
    fechaMenu(event, menuVerticalContato, btnContato);
  });
  document.querySelectorAll("[data-protected]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (Sessao.atual()) mostrarAviso("teste concluído");
      else window.location.href = "login.html";
    });
  });
}
function iniciarCabecalho() {
  const usuario = Sessao.atual();
  if (pagina === "diario") {
    $("userName").textContent = usuario.nome;
    // No site logado, "Login" vira "Sair" e "Início" permanece no diário
    $("linkInicio").href = "final.html";
    const sair = $("itemLogin").querySelector("a");
    sair.textContent = "Sair";
    sair.href = "index.html";
    sair.addEventListener("click", () => Sessao.sair());
  }
}
function campoVazio(...ids) {
  return ids.some((id) => !$(id).value.trim());
}
function iniciarLogin() {
  $("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    if (campoVazio("email", "senha")) {
      $("mensagem").textContent = "preencha todos os campos";
      return;
    }
    const email = $("email").value.trim().toLowerCase();
    const cadastrado = Sessao.usuarios().find((u) => u.email === email);
    Sessao.entrar({ nome: cadastrado ? cadastrado.nome : email.split("@")[0], email });
    window.location.href = "final.html";
  });
}
function iniciarCadastro() {
  $("formCadastro").addEventListener("submit", (e) => {
    e.preventDefault();
    if (campoVazio("nome", "email", "senha")) {
      $("mensagem").textContent = "preencha todos os campos";
      return;
    }
    const usuario = {
      nome: $("nome").value.trim(),
      email: $("email").value.trim().toLowerCase(),
      senha: $("senha").value,
    };
    const lista = Sessao.usuarios().filter((u) => u.email !== usuario.email);
    lista.push(usuario);
    Sessao.salvarUsuarios(lista);
    Sessao.entrar({ nome: usuario.nome, email: usuario.email });
    window.location.href = "final.html";
  });
}
function iniciarDiario() {
  const chave = "notas_" + Sessao.atual().email;
  let humor = "";
  const lerNotas = () => JSON.parse(localStorage.getItem(chave) || "[]");
  function desenharNotas() {
    const lista = $("listaNotas");
    lista.innerHTML = "";
    const notas = lerNotas();
    if (!notas.length) {
      lista.innerHTML = "<li>Nenhuma nota ainda. Escreva a primeira acima.</li>";
      return;
    }
    notas.slice().reverse().forEach((n) => {
      const li = document.createElement("li");
      const data = document.createElement("small");
      data.textContent = `${n.humor} ${n.data}`;
      const texto = document.createElement("p");
      texto.textContent = n.texto;
      li.append(data, texto);
      lista.appendChild(li);
    });
  }
  $("moods").addEventListener("click", (e) => {
    const botao = e.target.closest(".mood");
    if (!botao) return;
    humor = botao.dataset.mood;
    document.querySelectorAll(".mood").forEach((b) => b.classList.toggle("ativo", b === botao));
  });
  $("btnSalvar").addEventListener("click", () => {
    const texto = $("nota").value.trim();
    if (!humor || !texto) {
      $("mensagem").textContent = "escolha um humor e escreva sua nota";
      return;
    }
    const notas = lerNotas();
    notas.push({ humor, texto, data: new Date().toLocaleString("pt-BR") });
    localStorage.setItem(chave, JSON.stringify(notas));
    $("nota").value = "";
    $("mensagem").textContent = "";
    mostrarAviso("Nota salva!");
    desenharNotas();
  });
  desenharNotas();
}
/* ===== Inicialização por página ===== */
if (pagina === "diario" && !Sessao.atual()) {
  window.location.href = "login.html"; // área protegida
} else {
  iniciarFooter();
  iniciarMenu();
  iniciarCabecalho();
  if (pagina === "login") iniciarLogin();
  if (pagina === "cadastro") iniciarCadastro();
  if (pagina === "diario") iniciarDiario();
}