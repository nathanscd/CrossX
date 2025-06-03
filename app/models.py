from app import db

class Aluno(db.Model):
    __tablename__ = 'aluno'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    cidade = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(2), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    data_matricula = db.Column(db.Date, nullable=True)
    data_desligamento = db.Column(db.Date, nullable=True)
    data_vencimento = db.Column(db.Date, nullable=True)
    pagamentos = db.relationship('Pagamento', backref='aluno', cascade="all, delete-orphan")

class Pagamento(db.Model):
    __tablename__ = 'pagamento'
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('aluno.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    valor = db.Column(db.Float, nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # dinheiro ou cartão
