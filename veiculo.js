import mongoose from 'mongoose';

// Definição do schema (a "planta" do documento do veículo)
const veiculoSchema = new mongoose.Schema({
    // Campos que vêm do frontend (baseado no seu código)
    placa: { type: String, required: true, unique: true, trim: true },
    modelo: { type: String, required: true },
    marca: { type: String, required: true },
    cor: { type: String },
    ano: { type: Number },
    tipo: { type: String, required: true, enum: ['Carro', 'Moto', 'Caminhao'] }, // Exemplo de tipos

    // Campo que define o proprietário do veículo
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo 'User'
        required: true
    },

    // <<< ADICIONE ESTE CAMPO PARA O COMPARTILHAMENTO >>>
    // Um array que guardará os IDs dos usuários com quem o veículo foi compartilhado
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Também referencia o modelo 'User'
    }]
}, {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// Cria o modelo 'Veiculo' a partir do schema
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// Exporta o modelo para ser usado em outros arquivos (como o server.js)
export default Veiculo;