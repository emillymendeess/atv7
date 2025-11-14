import axios from 'axios';

// URL base da sua API
const API_URL = 'http://localhost:3001/api';

// Variáveis para guardar informações entre os passos
let tokenDono, tokenAmigo, veiculoId;

async function runTests() {
  try {
    console.log('--- INICIANDO TESTE DE PERMISSÕES DE MANUTENÇÃO ---');

// teste-permissions.js

// ... (código acima)
    // --- PASSO 1: Criar os dois usuários ---
    console.log('\n➡️ Passo 1: Criando usuário "dono" e "amigo"...');

    // <<< ALTERAÇÃO AQUI: Definimos os e-mails ANTES de usar >>>
    const timestamp = Date.now();
    const emailDono = `dono-${timestamp}@test.com`;
    const emailAmigo = `amigo-${timestamp}@test.com`;

    // Agora usamos as variáveis para registrar
    await axios.post(`${API_URL}/auth/register`, { email: emailDono, password: 'senha123' });
    await axios.post(`${API_URL}/auth/register`, { email: emailAmigo, password: 'senha456' });
    
    console.log('✅ SUCESSO: Usuários criados.');

    // --- PASSO 2: Fazer login e obter os tokens ---
    console.log('\n➡️ Passo 2: Fazendo login e guardando os tokens...');
    
    // O código de login já usava as variáveis, então agora vai funcionar
    let res = await axios.post(`${API_URL}/auth/login`, { email: emailDono, password: 'senha123' });
    tokenDono = res.data.token;
    res = await axios.post(`${API_URL}/auth/login`, { email: emailAmigo, password: 'senha456' });
    tokenAmigo = res.data.token;
// ... (código abaixo)
    
    // --- PASSO 3: Dono cria um veículo ---
    console.log('\n➡️ Passo 3: Dono está criando um veículo...');
    res = await axios.post(`${API_URL}/veiculos`, 
      { placa: `TEST-${Date.now()}`, marca: "Teste", modelo: "Veiculo", tipo: "Carro" },
      { headers: { 'Authorization': `Bearer ${tokenDono}` } }
    );
    veiculoId = res.data._id;
    console.log(`✅ SUCESSO: Veículo criado com ID: ${veiculoId}`);

    // --- PASSO 4: Dono compartilha o veículo com o amigo ---
    console.log('\n➡️ Passo 4: Dono está compartilhando o veículo...');
    await axios.post(`${API_URL}/veiculos/${veiculoId}/share`, 
      { email: emailAmigo },
      { headers: { 'Authorization': `Bearer ${tokenDono}` } }
    );
    console.log('✅ SUCESSO: Veículo compartilhado.');
    
    // --- PASSO 5: Amigo tenta ver o histórico de manutenções (que está vazio) ---
    console.log('\n➡️ Passo 5: Verificando se o amigo pode LER as manutenções...');
    await axios.get(`${API_URL}/veiculos/${veiculoId}/manutencoes`, 
      { headers: { 'Authorization': `Bearer ${tokenAmigo}` } }
    );
    console.log('✅ SUCESSO: Amigo conseguiu LER o histórico (mesmo vazio). A permissão está correta!');

    // --- PASSO 6: Amigo tenta ADICIONAR uma manutenção ---
    console.log('\n➡️ Passo 6: Verificando se o amigo pode CRIAR uma manutenção...');
    await axios.post(`${API_URL}/veiculos/${veiculoId}/manutencoes`,
      { descricaoServico: "Teste do amigo", custo: 50, quilometragem: 100 },
      { headers: { 'Authorization': `Bearer ${tokenAmigo}` } }
    );
    console.log('✅ SUCESSO: Amigo conseguiu ADICIONAR uma manutenção. A permissão está correta!');
    
    console.log('\n\n--- 🎉 TODOS OS TESTES PASSARAM COM SUCESSO! ---');

  } catch (error) {
    console.error('\n\n--- ❌ FALHA NO TESTE ---');
    console.error('Ocorreu um erro na etapa:', error.config.url);
    console.error('Mensagem de erro:', error.response ? error.response.data : error.message);
  }
}

runTests();