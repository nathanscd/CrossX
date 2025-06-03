from flask import current_app as app
from flask import request, jsonify
from datetime import datetime, timedelta
from app import db, Aluno, Pagamento
from flask import render_template
from flask import current_app as app

@app.route('/')
def index():
    return render_template('index.html')
 

@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    alunos = Aluno.query.all()
    return jsonify([{
        'id': a.id,
        'nome': a.nome,
        'endereco': a.endereco,
        'cidade': a.cidade,
        'estado': a.estado,
        'telefone': a.telefone,
        'data_matricula': a.data_matricula.isoformat() if a.data_matricula else None,
        'data_desligamento': a.data_desligamento.isoformat() if a.data_desligamento else None,
        'data_vencimento': a.data_vencimento.isoformat() if a.data_vencimento else None
    } for a in alunos])

@app.route('/api/alunos', methods=['POST'])
def add_aluno():
    data = request.json
    aluno = Aluno(
        nome=data['nome'],
        endereco=data['endereco'],
        cidade=data['cidade'],
        estado=data['estado'],
        telefone=data['telefone']
    )
    db.session.add(aluno)
    db.session.commit()
    return jsonify({'message': 'Aluno criado', 'id': aluno.id}), 201

@app.route('/api/alunos/<int:id>', methods=['PUT'])
def update_aluno(id):
    aluno = Aluno.query.get_or_404(id)
    data = request.json
    aluno.nome = data.get('nome', aluno.nome)
    aluno.endereco = data.get('endereco', aluno.endereco)
    aluno.cidade = data.get('cidade', aluno.cidade)
    aluno.estado = data.get('estado', aluno.estado)
    aluno.telefone = data.get('telefone', aluno.telefone)
    if data.get('data_matricula'):
        aluno.data_matricula = datetime.strptime(data['data_matricula'], "%Y-%m-%d").date()
    if data.get('data_desligamento'):
        aluno.data_desligamento = datetime.strptime(data['data_desligamento'], "%Y-%m-%d").date()
    if data.get('data_vencimento'):
        aluno.data_vencimento = datetime.strptime(data['data_vencimento'], "%Y-%m-%d").date()
    db.session.commit()
    return jsonify({'message': 'Aluno atualizado'})

@app.route('/api/alunos/<int:id>', methods=['DELETE'])
def delete_aluno(id):
    aluno = Aluno.query.get_or_404(id)
    if aluno.data_desligamento is None:
        return jsonify({'error': 'Não é permitido remover aluno ativo!'}), 400
    db.session.delete(aluno)
    db.session.commit()
    return jsonify({'message': 'Aluno removido'})

@app.route('/api/pagamentos', methods=['GET'])
def get_pagamentos():
    pagamentos = Pagamento.query.all()
    return jsonify([{
        'id': p.id,
        'aluno_id': p.aluno_id,
        'data': p.data.isoformat(),
        'valor': p.valor,
        'tipo': p.tipo
    } for p in pagamentos])

@app.route('/api/pagamentos', methods=['POST'])
def add_pagamento():
    data = request.json
    aluno = Aluno.query.get_or_404(data['aluno_id'])
    pagamento = Pagamento(
        aluno_id=aluno.id,
        data=datetime.strptime(data['data'], "%Y-%m-%d").date(),
        valor=data['valor'],
        tipo=data['tipo']
    )
    # Atualiza vencimento e status do aluno
    aluno.data_vencimento = pagamento.data + timedelta(days=30)
    aluno.data_desligamento = None
    if aluno.data_matricula is None:
        aluno.data_matricula = pagamento.data
    db.session.add(pagamento)
    db.session.commit()
    return jsonify({'message': 'Pagamento registrado', 'id': pagamento.id}), 201

@app.route('/api/pagamentos/<int:id>', methods=['DELETE'])
def delete_pagamento(id):
    pagamento = Pagamento.query.get_or_404(id)
    db.session.delete(pagamento)
    db.session.commit()
    return jsonify({'message': 'Pagamento removido'})
