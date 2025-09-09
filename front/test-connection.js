import mongoose from 'mongoose';

// ATENÇÃO: COLE A SUA STRING DE CONEXÃO COMPLETA E CORRETA AQUI DENTRO DAS ASPAS
const mongoUrl = "mongodb+srv://emillyvitoriamendeess:08052009m.@cluster0.7j9wwmq.mongodb.net/garagemDB?retryWrites=true&w=majority&appName=Cluster0";
console.log("Tentando conectar ao MongoDB Atlas...");

mongoose.connect(mongoUrl)
  .then(() => {
    console.log("✅ Conexão bem-sucedida! A sua string de conexão e o acesso de IP estão corretos.");
    mongoose.connection.close(); // Fecha a conexão após o teste
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ FALHA NA CONEXÃO. O problema está aqui. Verifique o erro abaixo:");
    console.error(error);
    process.exit(1);
  });