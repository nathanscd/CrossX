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

    function formatarDataBR(dataISO) {
        if (!dataISO) return '-';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    async function carregarAlunos() {
        const ul = document.getElementById('alunosList');
        if (!ul) {
            console.error('Elemento alunosList não encontrado no HTML');
            return;
        }
        ul.innerHTML = '';

        const resp = await fetch('/api/alunos');
        if (!resp.ok) {
            ul.textContent = 'Erro ao carregar alunos.';
            return;
        }

        const alunos = await resp.json();
        if (alunos.length === 0) {
            ul.textContent = 'Nenhum aluno cadastrado.';
            return;
        }

        alunos.forEach(a => {
            const li = document.createElement('li');
            li.innerHTML = `
                ID: ${a.id} <br>
                Nome: ${a.nome} <br>
                Cidade: ${a.cidade} <br>
                Estado: ${a.estado} <br>
                Telefone: ${a.telefone} <br>
                Matrícula: ${formatarDataBR(a.data_matricula)} <br>
                Vencimento: ${formatarDataBR(a.data_vencimento)} <br>
                Desligamento: ${formatarDataBR(a.data_desligamento)}
            `;
            ul.appendChild(li);
        });
    }

    const alunoSelect = document.getElementById('alunoSelect');
    const updateForm = document.getElementById('updateAlunoForm');
    const deleteBtn = document.getElementById('deleteAlunoBtn');
    async function carregarAlunosSelect() {
      const resp = await fetch('/api/alunos');
      const alunos = await resp.json();

      alunoSelect.innerHTML = '<option value="" disabled selected>Escolha um aluno</option>';

      alunos.forEach(aluno => {
        const option = document.createElement('option');
        option.value = aluno.id;
        option.textContent = aluno.nome;
        alunoSelect.appendChild(option);
      });
    }

    alunoSelect.addEventListener('change', async () => {
      const id = alunoSelect.value;
      if (!id) return;

      const resp = await fetch(`/api/alunos`);
      const alunos = await resp.json();
      const aluno = alunos.find(a => a.id == id);
      if (!aluno) return;

      updateForm.nome.value = aluno.nome || '';
      updateForm.endereco.value = aluno.endereco || '';
      updateForm.cidade.value = aluno.cidade || '';
      updateForm.estado.value = aluno.estado || '';
      updateForm.telefone.value = aluno.telefone || '';
      updateForm.data_matricula.value = aluno.data_matricula || '';
      updateForm.data_desligamento.value = aluno.data_desligamento || '';
      updateForm.data_vencimento.value = aluno.data_vencimento || '';
    });

    updateForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = alunoSelect.value;
      if (!id) {
        alert('Selecione um aluno para atualizar');
        return;
      }

      const data = {
        nome: updateForm.nome.value,
        endereco: updateForm.endereco.value,
        cidade: updateForm.cidade.value,
        estado: updateForm.estado.value,
        telefone: updateForm.telefone.value,
        data_matricula: updateForm.data_matricula.value || null,
        data_desligamento: updateForm.data_desligamento.value || null,
        data_vencimento: updateForm.data_vencimento.value || null
      };

      const resp = await fetch(`/api/alunos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!resp.ok) {
        const erro = await resp.json();
        alert(`Erro ao atualizar: ${erro.error || 'Erro desconhecido'}`);
        return;
      }

      alert('Aluno atualizado com sucesso!');
      carregarAlunosSelect();
      carregarAlunos(); 
    };

    deleteBtn.onclick = async () => {
      const id = alunoSelect.value;
      if (!id) {
        alert('Selecione um aluno para deletar');
        return;
      }

      if (!confirm('Tem certeza que deseja deletar este aluno?')) return;

      const resp = await fetch(`/api/alunos/${id}`, {
        method: 'DELETE'
      });

      if (!resp.ok) {
        const erro = await resp.json();
        alert(`Erro ao deletar: ${erro.error || 'Erro desconhecido'}`);
        return;
      }

      alert('Aluno deletado com sucesso!');
      carregarAlunosSelect();
      carregarAlunos();
      updateForm.reset();
    };
    carregarAlunosSelect();

    const alunoPagamentoSelect = document.getElementById('alunoPagamentoSelect');
    const pagamentoForm = document.getElementById('pagamentoForm');
    async function carregarAlunosPagamento() {
      const resp = await fetch('/api/alunos');
      const alunos = await resp.json();
      alunoPagamentoSelect.innerHTML = '<option value="" disabled selected>Escolha um aluno</option>';
      alunos.forEach(aluno => {
        const option = document.createElement('option');
        option.value = aluno.id; 
        option.textContent = aluno.nome;
        alunoPagamentoSelect.appendChild(option);
      });
    }
    pagamentoForm.onsubmit = async (e) => {
      e.preventDefault();
      let data = Object.fromEntries(new FormData(pagamentoForm));
      data.valor = parseFloat(data.valor);
      const resp = await fetch('/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!resp.ok) {
        const erro = await resp.json();
        alert(`Erro ao registrar pagamento: ${erro.error || 'Erro desconhecido'}`);
        return;
      }
      alert('Pagamento registrado com sucesso!');
      pagamentoForm.reset();
      carregarAlunos();
      carregarPagamentos();
    };
    carregarAlunosPagamento();


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
            li.innerHTML = `
                ID: ${p.id} <br>
                Aluno: ${p.aluno_id} <br>
                Data: ${p.data} <br>
                Valor: R$${p.valor.toFixed(2)} <br>
                Tipo: ${p.tipo} <br>
            `;
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
});
