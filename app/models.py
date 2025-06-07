from . import db
from datetime import datetime

class Aluno(db.Model):
    __tablename__ = 'aluno'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200))
    cidade = db.Column(db.String(100))
    estado = db.Column(db.String(2))
    telefone = db.Column(db.String(20))
    data_matricula = db.Column(db.Date, nullable=False, default=datetime.utcnow) 
    data_vencimento = db.Column(db.Date, nullable=False)
    data_desligamento = db.Column(db.Date, nullable=True)

    pagamentos = db.relationship(
        'Pagamento',
        backref='aluno',
        lazy=True,
        cascade='all, delete-orphan'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'endereco': self.endereco,
            'cidade': self.cidade,
            'estado': self.estado,
            'telefone': self.telefone,
            'data_matricula': self.data_matricula.isoformat() if self.data_matricula else None,
            'data_desligamento': self.data_desligamento.isoformat() if self.data_desligamento else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None
        }

class Pagamento(db.Model):
    __tablename__ = 'pagamento'
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('aluno.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    valor = db.Column(db.Float, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'aluno_id': self.aluno_id,
            'data': self.data.strftime("%d/%m/%Y") if self.data else None,
            'valor': self.valor,
            'tipo': self.tipo
        }
