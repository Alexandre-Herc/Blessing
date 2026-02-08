let colaboradores = [];
let escalaAtual = [];
let ultimoColaborador = null;
let edicaoManual = false;

//Preencher os meses automaticamente 

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const selecionarMes = document.getElementById("mes");

meses.forEach((m, i) => {
    selecionarMes.innerHTML += `<option value="${i}">${m}</option>`;
});

// Adicionar colaboradores

function addColaborador() {
  const input = document.getElementById("nomeColaborador");
  const nome = input.value.trim();
  if (!nome) return;

  colaboradores.push(nome);
  input.value = "";
  atualizarLista();
}

// Atualizar lista de colaboradores tela
function atualizarLista() {
  const ul = document.getElementById("listaColaborador");
  ul.innerHTML = "";

  colaboradores.forEach((colaborador, index) => {
    const li = document.createElement("li");
    
    li.innerHTML = `
      ${colaborador} 
      <button class="btn-pequeno" onclick="editarColaborador(${index})">Editar</button>
      <button class="btn-pequeno" onclick="excluirColaborador(${index})">Excluir</button>
    `;
    
    ul.appendChild(li);
  });
}

// Editar colaborador
function editarColaborador(index) {
  const novoNome = prompt("Edite o nome do colaborador:", colaboradores[index]);
  if (novoNome !== null && novoNome.trim() !== "") {
    colaboradores[index] = novoNome.trim();
    atualizarLista();
  }
}

// Excluir colaborador
function excluirColaborador(index) {
  if (confirm(`Deseja realmente excluir ${colaboradores[index]}?`)) {
    colaboradores.splice(index, 1);
    atualizarLista();
  }
}

// Atalho Enter para adicionar colaborador
const inputColaborador = document.getElementById("nomeColaborador");
inputColaborador.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addColaborador();
  }
});

// Dias do mês

function diasdoMes(ano, mes) {
    return new Date(ano, mes + 1, 0).getDate();
}

// Fim de semana 

function fimdeSemana(ano, mes, dia) {
    const d = new Date(ano, mes, dia).getDay();
    return d === 0 || d === 6;
}

function formatarDataCompleta(dia, mes, ano) {
  const dataObj = new Date(ano, mes, dia);
  
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diaSemana = diasSemana[dataObj.getDay()];
  
  const dd = String(dia).padStart(2, "0");
  const mm = String(mes + 1).padStart(2, "0");
  const yy = String(ano).slice(-2);
  
  return `${dd}/${mm}/${yy} ${diaSemana}`;
}

// Arquivo anterior - regra

document.getElementById("escalaArquivo").addEventListener("change", lerArquivo);

function lerArquivo(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = evt => {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const linhas = XLSX.utils.sheet_to_json(ws, { header: 1 });

        ultimoColaborador = linhas[linhas.length - 1][1];
        alert("Últio colaborador localizado" + ultimoColaborador);
    };

    reader.readAsArrayBuffer(file);
}

//Gerar 

function gerar() {
  if (colaboradores.length === 0) {
    alert("Adicione funcionários.");
    return;
  }

  const mes = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const totalDias = diasdoMes(ano, mes);

  let index = colaboradores.indexOf(ultimoColaborador);
  if (index === -1) index = -1;

  escalaAtual = [];
  let atual = (index + 1) % colaboradores.length;

  for (let dia = 1; dia <= totalDias; dia++) {
    escalaAtual.push({
      dia,
      colaborador: colaboradores[atual],
      fimSemana: fimdeSemana(ano, mes, dia)
    });
    atual = (atual + 1) % colaboradores.length;
  }

  edicaoManual = false;
  desenharTabela();
}

//Mostrar 

function desenharTabela() {
  const tbody = document.getElementById("tabelaEscala");
  tbody.innerHTML = "";

  const mesIndex = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const nomeMes = meses[mesIndex];
  const cliente = document.getElementById("nomeCliente").value || "Cliente";

  const tabela = document.querySelector("table");
  tabela.querySelector("thead").innerHTML = `
    <tr>
      <th colspan="3" style="text-align:center;">
        Escala de ${cliente} – ${nomeMes} – Plantão de 24h
      </th>
    </tr>
    <tr>
      <th>Data</th>
      <th>Colaborador</th>
      <th>Ação</th>
    </tr>
  `;

  escalaAtual.forEach((item, index) => {
    const data = formatarDataCompleta(item.dia, mesIndex, ano);

    tbody.innerHTML += `
      <tr class="${item.fimSemana ? "fim-semana" : ""}">
        <td>${data}</td>
        <td>
          <select onchange="editarEscala(${index}, this.value)">
            <option value="">A definir</option>
            ${colaboradores.map(c =>
              `<option value="${c}" ${c === item.colaborador ? "selected" : ""}>${c}</option>`
            ).join("")}
          </select>
        </td>
        <td>
          <button class="btn-pequeno" onclick="limparDia(${index})">Limpar</button>
        </td>
      </tr>
    `;
  });
}


// funções da tabela

function editarEscala(index, novoColaborador) {
  escalaAtual[index].colaborador = novoColaborador;
  edicaoManual = true;
}

function limparDia(index) {
  escalaAtual[index].colaborador = "";
  edicaoManual = true;
  desenharTabela();
}

/*function desenharTabela() {
  const tbody = document.getElementById("tabelaEscala");
  tbody.innerHTML = "";

  const mesIndex = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const nomeMes = meses[mesIndex];
  const cliente = document.getElementById("nomeCliente").value || "Cliente";

  // Cabeçalho fixo do mês + cliente
  const tabela = document.querySelector("table");
  tabela.querySelector("thead").innerHTML = `
    <tr>
      <th colspan="2" style="text-align:center;">Escala de ${cliente} – ${nomeMes} – Plantão de 24h</th>
    </tr>
    <tr>
      <th>Data</th>
      <th>Colaborador</th>
    </tr>
  `;

  escalaAtual.forEach(item => {
    const data = formatarDataCompleta(item.dia, mesIndex, ano);
    tbody.innerHTML += `
      <tr class="${item.fimSemana ? "fim-semana" : ""}">
        <td>${data}</td>
        <td>${item.colaborador}</td>
      </tr>
    `;
  });
}

*/ 


// Exportar para Excel 

function exportar() {
  if (escalaAtual.length === 0) return;

  const cliente = document.getElementById("nomeCliente").value || "Cliente";
  const mesIndex = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const nomeMes = meses[mesIndex];

  const dados = [
    [`Escala de ${cliente} - Plantão de 24hrs`], // linha 1: cabeçalho
    ["Data", "Colaborador", "Mês"]              // linha 2: colunas
  ];

  escalaAtual.forEach(item => {
    const data = formatarDataCompleta(item.dia, mesIndex, ano); // usar função nova
    dados.push([data, item.colaborador, nomeMes]);
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);

  // Mesclar primeira linha para ficar igual no PDF
  ws["!merges"] = [{ s: { r:0, c:0 }, e: { r:0, c:2 } }]; 

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Escala");
  XLSX.writeFile(wb, "escala.xlsx");
}

function prepararTabelaPdf() {
  const cliente = document.getElementById("nomeCliente").value || "Cliente";
  const mesIndex = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const nomeMes = meses[mesIndex];

  const tabelaPdf = document.getElementById("tabelaPdf");
  tabelaPdf.innerHTML = `
    <thead>
      <tr>
        <th colspan="2" style="text-align:center;">Escala de ${cliente} – ${nomeMes} – Plantão de 24horas</th>
      </tr>
      <tr>
        <th>Data</th>
        <th>Colaborador</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabelaPdf.querySelector("tbody");

  escalaAtual.forEach(item => {
    const data = formatarDataCompleta(item.dia, mesIndex, ano);
    tbody.innerHTML += `
      <tr>
        <td>${data}</td>
        <td>${item.colaborador}</td>
      </tr>
    `;
  });
}

function exportarPdf() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const mesIndex = Number(document.getElementById("mes").value);
  const ano = Number(document.getElementById("ano").value);
  const nomeMes = meses[mesIndex];
  const cliente = document.getElementById("nomeCliente").value || "Cliente";

  const titulo = `Escala de ${cliente} – ${nomeMes} – Plantão de 24 horas`;

  // Preparar dados da tabela
  const dados = escalaAtual.map(item => {
    const data = formatarDataCompleta(item.dia, mesIndex, ano);
    return [data, item.colaborador];
  });

  // Adicionar título centralizado
  pdf.setFontSize(14);
  pdf.text(titulo, 105, 10, { align: "center" });

  // Gerar tabela com AutoTable
  pdf.autoTable({
    startY: 20,
    head: [['Data', 'Colaborador']],
    body: dados,
    theme: 'grid', // bordas como tabela
    styles: {
      fontSize: 10,
      cellPadding: 2,
      halign: 'left'
    },
    headStyles: {
      fillColor: [41, 128, 185], // azul
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240] // linhas alternadas cinza
    }
  });

  pdf.save("escala.pdf");
}
