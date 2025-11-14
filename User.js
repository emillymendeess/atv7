// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true, // Garante que não haverá dois usuários com o mesmo e-mail
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Por favor, use um formato de e-mail válido.']
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres.']
    }
});

// Middleware (ou "hook") do Mongoose que é executado ANTES de salvar o usuário
// A função dele é criptografar a senha automaticamente.
userSchema.pre('save', async function(next) {
    // Só criptografa a senha se ela foi modificada (ou é nova)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Gera o "salt" e depois o "hash" (senha criptografada)
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

export default User;