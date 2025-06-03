document.addEventListener('DOMContentLoaded', function() {
    carregarAlunos();
    carregarPagamentos();

    document.getElementById('alunoForm').onsubmit = async function(e) {
        e.preventDefault();
        let data = Object.fromEntries(new FormData(this));
        await fetch('/api/alunos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        carregarAlunos();
        this.reset();
    };

    document.getElementById('pagamentoForm').onsubmit = async function(e) {
        e.preventDefault();
        let data = Object.fromEntries(new FormData(this));
        data.valor = parseFloat(data.valor);
        await fetch('/api/pagamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        carregarPagamentos();
        this.reset();
    };
});

async function carregarAlunos() {
    let ul = document.getElementById('alunosList');
    ul.innerHTML = '';
    let resp = await fetch('/api/alunos');
    let alunos = await resp.json();
    alunos.forEach(a => {
        let li = document.createElement('li');
        li.textContent = `ID: ${a.id} | Nome: ${a.nome} | Cidade: ${a.cidade} | Estado: ${a.estado} | Telefone: ${a.telefone} | Matrícula: ${a.data_matricula || '-'} | Desligamento: ${a.data_desligamento || '-'} | Vencimento: ${a.data_vencimento || '-'}`;
        ul.appendChild(li);
    });
}

async function carregarPagamentos() {
    let ul = document.getElementById('pagamentosList');
    ul.innerHTML = '';
    let resp = await fetch('/api/pagamentos');
    let pagamentos = await resp.json();
    pagamentos.forEach(p => {
        let li = document.createElement('li');
        li.textContent = `ID: ${p.id} | Aluno: ${p.aluno_id} | Data: ${p.data} | Valor: R$${p.valor.toFixed(2)} | Tipo: ${p.tipo}`;
        ul.appendChild(li);
    });
}
