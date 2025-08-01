// models/Veiculo.js

// 1. Importa o Mongoose, que é a biblioteca para interagir com o MongoDB.
import mongoose from 'mongoose';

// 2. Define o Schema (a "planta" ou as "regras" para os documentos de veículos).
const veiculoSchema = new mongoose.Schema({
    // Campo 'placa'
    placa: { 
        type: String, // O tipo de dado é texto (String).
        required: [true, 'A placa é obrigatória.'], // É um campo obrigatório.
        unique: true, // Não pode haver duas placas iguais no banco de dados.
        uppercase: true, // Salva o texto sempre em letras maiúsculas.
        trim: true // Remove espaços em branco do início e do fim do texto.
    },
    // Campo 'marca'
    marca: { 
        type: String, 
        required: [true, 'A marca é obrigatória.'] 
    },
    // Campo 'modelo'
    modelo: { 
        type: String, 
        required: [true, 'O modelo é obrigatório.'] 
    },
    // Campo 'ano'
    ano: { 
        type: Number, // O tipo de dado é número.
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'], // Validação de valor mínimo.
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.'] // Validação de valor máximo.
    },
    // Campo 'cor' (não é obrigatório)
    cor: { 
        type: String 
    }
}, { 
    // Opções do Schema: Adiciona automaticamente os campos `createdAt` e `updatedAt`.
    timestamps: true 
});

// 3. Cria o Modelo a partir do Schema.
// O Modelo é a ferramenta que usaremos para criar, ler, atualizar e deletar veículos no banco.
// O Mongoose usará o nome 'Veiculo' para criar uma coleção chamada 'veiculos' (plural, minúsculo).
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

// 4. Exporta o Modelo para que ele possa ser usado em outros arquivos (como o server.js).
export default Veiculo;