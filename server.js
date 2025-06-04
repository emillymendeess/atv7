// Importações
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001; // Porta para o servidor backend
                                    // Use uma porta diferente do frontend se rodar ambos localmente
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware para permitir que o frontend (rodando em outra porta) acesse este backend
// (CORS - Cross-Origin Resource Sharing)
// Para desenvolvimento, '*' é aceitável. Em produção, restrinja para o seu domínio frontend.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Em um ambiente de desenvolvimento, pode ser útil permitir múltiplas origens ou '*'
    // Ex: if (['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'].includes(origin)) {
    // Para este exemplo, vamos usar '*' mas com a ressalva de segurança para produção.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
/**
 * @route GET /api/previsao/:cidade
 * @description Retorna a previsão do tempo para a cidade especificada, atuando como proxy para a OpenWeatherMap API.
 * @param {string} :cidade - O nome da cidade para a qual a previsão é solicitada.
 * @returns {JSON} Os dados da previsão do tempo da OpenWeatherMap ou um objeto de erro.
 */
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params; // Pega o parâmetro :cidade da URL

    if (!apiKey) {
        console.error('[Servidor] Chave da API OpenWeatherMap não configurada no servidor.');
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        console.warn('[Servidor] Requisição recebida sem nome da cidade.');
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade} na URL: ${weatherAPIUrl.replace(apiKey, 'SUA_CHAVE_OCULTA')}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log(`[Servidor] Dados recebidos da OpenWeatherMap para ${cidade}. Status: ${apiResponse.status}`);
        
        // Enviamos a resposta da API OpenWeatherMap diretamente para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        console.error(`[Servidor] Erro ao buscar previsão para ${cidade}:`, error.response?.data || error.message);
        const status = error.response?.status || 500;
        let message = 'Erro ao buscar previsão do tempo no servidor.';

        if (error.response) { // Erro vindo da API OpenWeatherMap
            message = error.response.data?.message || `A API OpenWeatherMap retornou um erro ${status}.`;
            if (status === 401) {
                message = 'Chave da API OpenWeatherMap inválida ou não autorizada no servidor.';
            } else if (status === 404) {
                message = `Cidade "${cidade}" não encontrada pela API OpenWeatherMap.`;
            }
        } else if (error.request) { // A requisição foi feita mas não houve resposta
            message = 'Não foi possível conectar à API OpenWeatherMap. Verifique a conexão do servidor.';
        } else { // Algum outro erro ao configurar a requisição
            message = `Erro interno no servidor ao tentar buscar previsão: ${error.message}`;
        }
        
        res.status(status).json({ error: message });
    }
});

// Rota raiz para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Inteligente está funcionando!');
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey) {
        console.warn('**************************************************************************************');
        console.warn('* ATENÇÃO: A variável de ambiente OPENWEATHER_API_KEY não está definida no arquivo .env *');
        console.warn('* O endpoint de previsão do tempo não funcionará corretamente.                        *');
        console.warn('**************************************************************************************');
    }
});