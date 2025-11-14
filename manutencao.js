import mongoose from 'mongoose';

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'],
        trim: true
    },
    data: {
        type: Date,
        required: true,
        default: Date.now
    },
    custo: {
        type: Number,
        required: [true, 'O custo da manutenção é obrigatório.'],
        min: [0, 'O custo não pode ser um valor negativo.']
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser um valor negativo.']
    },
    veiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veiculo',
        required: [true, 'Toda manutenção deve ser associada a um veículo.']
    }
}, {
    // Adiciona os campos createdAt e updatedAt automaticamente
    timestamps: true
});

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

export default Manutencao;