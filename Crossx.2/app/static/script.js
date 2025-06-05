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
        li.textContent = `ID: ${a.id} | Nome: ${a.nome} | Cidade: ${a.cidade} | Estado: ${a.estado} | Telefone: ${a.telefone} | Matrícula: ${a.data_matricula || '-'} | Vencimento: ${a.data_vencimento || '-'} | Desligamento: ${a.data_desligamento || '-'}`;
        ul.appendChild(li);
    });
}


async function carregarPagamentos() {
    let ul = document.getElementById('pagamentosList');
    ul.innerHTML = '';
    let resp = await fetch('/api/pagamentos');
    if (!resp.ok) {
        ul.textContent = 'Erro ao carregar pagamentos.';
        return;
    }
    let pagamentos = await resp.json();
    pagamentos.forEach(p => {
        let li = document.createElement('li');
        li.textContent = `ID: ${p.id} | Aluno: ${p.aluno_id} | Data: ${p.data} | Valor: R$${p.valor.toFixed(2)} | Tipo: ${p.tipo}`;
        ul.appendChild(li);
    });
}


document.getElementById('updateAlunoForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    await fetch(`/api/alunos/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    carregarAlunos();
    this.reset();
};

// Desligar Aluno
document.getElementById('desligarForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = {
        id: formData.get('id'),
        data_desligamento: formData.get('data_desligamento')
    };

    await fetch(`/api/alunos/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_desligamento: data.data_desligamento })
    });

    carregarAlunos();
    this.reset();
};
