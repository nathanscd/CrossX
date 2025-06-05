from flask import current_app as app, request, jsonify, render_template
from datetime import datetime, timedelta
from app import db, Aluno, Pagamento

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/alunos', methods=['GET', 'POST'])
def handle_alunos():
    if request.method == 'GET':
        alunos = Aluno.query.all()
        return jsonify([aluno.to_dict() for aluno in alunos])
    
    if request.method == 'POST':
        def add_aluno():
            data = request.json
            hoje = datetime.utcnow().date()
            aluno = Aluno(
                nome=data['nome'],
                endereco=data['endereco'],
                cidade=data['cidade'],
                estado=data['estado'],
                telefone=data['telefone'],
                data_matricula=hoje,
                data_vencimento=hoje + timedelta(days=30)
            )
            db.session.add(aluno)
            db.session.commit()
            return jsonify({'message': 'Aluno criado', 'id': aluno.id}), 201

@app.route('/api/alunos/<int:id>', methods=['PUT'])
def update_aluno(id):
    aluno = Aluno.query.get_or_404(id)
    data = request.get_json()

    aluno.nome = data.get('nome', aluno.nome)
    aluno.endereco = data.get('endereco', aluno.endereco)
    aluno.cidade = data.get('cidade', aluno.cidade)
    aluno.estado = data.get('estado', aluno.estado)
    aluno.telefone = data.get('telefone', aluno.telefone)

    if 'data_desligamento' in data:
        aluno.data_desligamento = datetime.strptime(data['data_desligamento'], "%Y-%m-%d").date() if data['data_desligamento'] else None
    
    if 'data_matricula' in data:
        aluno.data_matricula = datetime.strptime(data['data_matricula'], "%Y-%m-%d").date() if data['data_matricula'] else None
    
    db.session.commit()
    return jsonify({'message': 'Aluno atualizado', 'data_desligamento': str(aluno.data_desligamento)})


@app.route('/api/pagamentos', methods=['GET', 'POST'])
def handle_pagamentos():
    if request.method == 'GET':
        def get_pagamentos():
            pagamentos = Pagamento.query.all()
            return jsonify([p.to_dict() for p in pagamentos])
    
    
    if request.method == 'POST':
        data = request.get_json()
        aluno = Aluno.query.get_or_404(data['aluno_id'])
        
        pagamento = Pagamento(
            aluno_id=aluno.id,
            aluno_nome=aluno.nome,
            data=datetime.strptime(data['data'], "%Y-%m-%d").date(),
            valor=data['valor'],
            tipo=data['tipo']
        )
        
        aluno.data_vencimento = pagamento.data + timedelta(days=30)
        aluno.data_desligamento = None
        if not aluno.data_matricula:
            aluno.data_matricula = pagamento.data
        
        db.session.add(pagamento)
        db.session.commit()
        return jsonify({"message": "Pagamento registrado", "id": pagamento.id}), 201

@app.route('/api/pagamentos/<int:id>', methods=['DELETE'])
def delete_pagamento(id):
    pagamento = Pagamento.query.get_or_404(id)
    db.session.delete(pagamento)
    db.session.commit()
    return jsonify({"message": "Pagamento excluído"})

@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def delete_aluno(id):
    aluno = Aluno.query.get_or_404(id)
    if aluno.data_desligamento is not None:
        return jsonify({'error': 'Não é permitido remover aluno ativo!'}), 400
    db.session.delete(aluno)
    db.session.commit()
    return jsonify({'message': 'Aluno removido com sucesso'})


