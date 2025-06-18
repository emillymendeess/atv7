# Garagem Inteligente Conectada

Esta é uma versão evoluída da Garagem Inteligente, agora integrada com uma API simulada para detalhes extras de veículos e uma API real (OpenWeatherMap) para previsão do tempo em planejamentos de viagem.

## Funcionalidades Principais

*   Gerenciamento de veículos na garagem (Adicionar, Remover, Visualizar).
*   Registro e visualização de histórico de manutenção e agendamentos futuros.
*   Ações interativas com veículos (Ligar, Desligar, Acelerar, Buzinar, específicas por tipo).
*   Persistência de dados no LocalStorage.
*   **NOVO:** Exibição de detalhes extras do veículo (Valor FIPE, Recalls, Dicas) via API simulada (`dados_veiculos_api.json`).
*   **NOVO (Desafio Extra):** Planejador de Viagem com consulta à previsão do tempo atual da cidade de destino usando a API OpenWeatherMap.

---

## API Backend da Garagem Inteligente

O projeto inclui um servidor backend em Node.js (`server.js`) que fornece dados e serviços para o frontend.

### Como Executar o Backend (Localmente)

1.  Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2.  No terminal, navegue até a pasta do projeto.
3.  Instale as dependências: `npm install`
4.  Inicie o servidor: `npm run dev` (ou `node server.js`)
5.  O servidor estará rodando em `http://localhost:3000`.

### Endpoints da API

A seguir, a documentação dos endpoints disponíveis:

#### 1. Dicas de Manutenção Gerais

*   **Endpoint:** `GET /api/dicas-manutencao`
*   **Descrição:** Retorna uma lista de dicas de manutenção aplicáveis a qualquer veículo.
*   **Resposta (Exemplo):**
    ```json
    [
      { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
      { "id": 2, "dica": "Calibre os pneus semanalmente, incluindo o estepe." }
    ]
    ```

#### 2. Dicas de Manutenção por Tipo de Veículo

*   **Endpoint:** `GET /api/dicas-manutencao/:tipoVeiculo`
*   **Descrição:** Retorna dicas de manutenção específicas para o tipo de veículo informado.
*   **Parâmetros de URL:**
    *   `tipoVeiculo` (string): O tipo do veículo. Valores aceitos: `carro`, `carroesportivo`, `caminhao`.
*   **Resposta (Exemplo para `/api/dicas-manutencao/caminhao`):**
    ```json
    [
      { "id": 20, "dica": "Verifique a pressão dos pneus de carga antes de cada viagem." },
      { "id": 21, "dica": "Inspecione o sistema de freios a ar com frequência." }
    ]
    ```
*   **Resposta de Erro (404 Not Found):**
    ```json
    { "error": "Nenhuma dica encontrada para o tipo: moto" }
    ```

#### 3. Sugestões de Viagem Populares

*   **Endpoint:** `GET /api/viagens-populares`
*   **Descrição:** Retorna uma lista de destinos de viagem populares para inspirar os usuários.
*   **Resposta (Exemplo):**
    ```json
    [
      { "id": 1, "destino": "Serra Gaúcha, RS", "descricao": "Aproveite o clima frio, vinhos e paisagens deslumbrantes." },
      { "id": 2, "destino": "Litoral Nordestino, BR", "descricao": "Relaxe nas praias paradisíacas com sol o ano todo." }
    ]
    ```
    
#### 4. Próxima Revisão (Simulação)

*   **Endpoint:** `GET /api/veiculos/:placa/proxima-revisao`
*   **Descrição:** Simula a busca pela data e detalhes da próxima revisão de um veículo com base na placa.
*   **Parâmetros de URL:**
    *   `placa` (string): A placa do veículo (ex: `ABC-1234`).
*   **Resposta (Exemplo para `/api/veiculos/ABC-1234/proxima-revisao`):**
    ```json
    {
      "placa": "ABC-1234",
      "modelo": "Sedan",
      "proximaRevisao": "2024-12-15",
      "itensVerificar": ["Troca de óleo", "Filtro de ar", "Alinhamento"]
    }
    ```
*   **Resposta de Erro (404 Not Found):**
    ```json
    { "message": "Nenhum registro de revisão encontrado para a placa: XXX-0000" }
    ```

---
*(O restante da documentação sobre a API de clima e uso geral continua aqui...)*
# Garagem Inteligente Conectada

Esta é uma versão evoluída da Garagem Inteligente, agora integrada com uma API simulada para detalhes extras de veículos e uma API real (OpenWeatherMap) para previsão do tempo em planejamentos de viagem.

## Funcionalidades Principais

*   Gerenciamento de veículos na garagem (Adicionar, Remover, Visualizar).
*   Registro e visualização de histórico de manutenção e agendamentos futuros.
*   Ações interativas com veículos (Ligar, Desligar, Acelerar, Buzinar, específicas por tipo).
*   Persistência de dados no LocalStorage.
*   **NOVO:** Exibição de detalhes extras do veículo (Valor FIPE, Recalls, Dicas) via API simulada (`dados_veiculos_api.json`).
*   **NOVO (Desafio Extra):** Planejador de Viagem com consulta à previsão do tempo atual da cidade de destino usando a API OpenWeatherMap.

## Como Usar

1.  Clone ou baixe este repositório.
2.  Abra o arquivo `teste.html` em seu navegador.

## Parte 1: API Simulada (Detalhes Extras do Veículo)

*   Ao adicionar veículos, um ID único é gerado (ex: `veh-xxxx-yyyy`).
*   Edite o arquivo `dados_veiculos_api.json` e substitua os IDs de exemplo pelos IDs reais dos veículos que você adicionou (você pode encontrar os IDs inspecionando o LocalStorage no seu navegador).
*   Ao abrir os detalhes de um veículo no modal, o sistema buscará automaticamente informações extras neste arquivo JSON e as exibirá.
*   É possível simular erros renomeando ou excluindo o arquivo `dados_veiculos_api.json`.

## Parte 2: Desafio Extra (Previsão do Tempo Real)

Esta funcionalidade requer uma chave de API (API Key) gratuita do OpenWeatherMap.

### 1. Obtenha sua Chave de API OpenWeatherMap:

*   Acesse [https://openweathermap.org/](https://openweathermap.org/)
*   Crie uma conta gratuita (pode exigir confirmação por e-mail).
*   Após fazer login, vá para a seção "API keys" no seu painel de usuário.
*   Copie a sua chave de API padrão (Default Key).

### 2. Configure a Chave de API no Código:

*   Abra o arquivo `script.js`.
*   Encontre a linha que contém: `const apiKey = "SUA_CHAVE_API_AQUI";` (dentro da função `buscarPrevisaoTempo`).
*   **Substitua `"SUA_CHAVE_API_AQUI"` pela chave que você copiou no passo anterior.**

    ```javascript
    // Exemplo após substituir:
    const apiKey = "abcdef1234567890abcdef1234567890"; // Sua chave real aqui
    ```

*   **AVISO DE SEGURANÇA MUITO IMPORTANTE:** Colocar a chave de API diretamente no código JavaScript do lado do cliente (frontend) **NÃO é seguro** para aplicações reais ou públicas. Qualquer pessoa pode inspecionar o código e roubar sua chave. Para esta atividade de aprendizado, essa abordagem simplificada é aceitável, mas **NUNCA** faça isso em um projeto de produção. O método seguro envolve usar um servidor backend (um "proxy") que guarda a chave e faz a chamada à API externa em nome do cliente.

### 3. Use o Planejador:

*   Na seção "Planejar Viagem com Clima" da página principal (`teste.html`).
*   Digite o nome de uma cidade no campo "Cidade de Destino".
*   Clique no botão "Verificar Clima".
*   A previsão do tempo atual para a cidade será exibida (ou uma mensagem de erro se a cidade não for encontrada, a chave for inválida, etc.).

## Estrutura do Projeto

*   `teste.html`: Estrutura principal da página da garagem conectada.
*   `style.css`: Estilos visuais da aplicação.
*   `script.js`: Lógica principal da aplicação (classes, manipulação do DOM, localStorage, chamadas API).
*   `dados_veiculos_api.json`: Arquivo com dados simulados para a API local.
*   (Outros arquivos como `MOSTRAR.HTML`, `garagem.js`, etc., são de exemplos anteriores/separados).

## Documentação do Código

*   O código JavaScript (`script.js`) contém comentários JSDoc para as principais funções e classes.

## Limitações e Próximos Passos

*   A chave da API OpenWeatherMap está exposta no código do cliente (inseguro para produção).
*   A API simulada é um arquivo JSON local estático.
*   O tratamento de erros pode ser expandido.
*   Implementar um backend proxy para proteger a chave da API.
*   Usar uma API veicular real (exigiria cadastro e possivelmente custos).

## Parte 2: Planejador de Viagem com Previsão do Tempo Detalhada

Esta funcionalidade foi aprimorada para buscar uma previsão do tempo detalhada para os próximos dias, utilizando o endpoint "5 day / 3 hour forecast" da API OpenWeatherMap.

### 1. Obtenha sua Chave de API OpenWeatherMap:

*   Acesse [https://openweathermap.org/](https://openweathermap.org/)
*   Crie uma conta gratuita (pode exigir confirmação por e-mail).
*   Após fazer login, vá para a seção "API keys" no seu painel de usuário.
*   Copie a sua chave de API padrão (Default Key).

### 2. Configure a Chave de API no Código:

*   Abra o arquivo `script.js`.
*   Encontre a linha que contém:
    ```javascript
    // ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
    // Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
    // A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
    // Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
    const OPENWEATHER_API_KEY = "SUA_CHAVE_OPENWEATHERMAP_AQUI"; // <-- SUBSTITUA PELA SUA CHAVE
    ```
*   **Substitua `"SUA_CHAVE_OPENWEATHERMAP_AQUI"` pela chave que você copiou no passo anterior.**

    ```javascript
    // Exemplo após substituir:
    const OPENWEATHER_API_KEY = "abcdef1234567890abcdef1234567890"; // Sua chave real aqui
    ```

*   **ALERTA DE SEGURANÇA CRÍTICO E REITERADO:** Colocar a chave de API diretamente no código JavaScript do lado do cliente (frontend) **NÃO É SEGURO** para aplicações reais ou públicas. Qualquer pessoa pode inspecionar o código fonte do navegador e roubar sua chave, o que pode levar ao uso indevido da sua cota de API ou a custos inesperados.
    *   **Por que é inseguro?** A chave fica visível para qualquer um que acesse o site e inspecione os arquivos JavaScript.
    *   **Qual a solução correta?** A abordagem segura e profissional envolve a criação de um servidor backend (usando Node.js, Python/Flask, Java/Spring, PHP, etc.) ou uma Função Serverless (AWS Lambda, Google Cloud Functions, Azure Functions). Esse backend atuaria como um "proxy":
        1.  O frontend faria uma requisição para o SEU backend (ex: `/api/previsao?cidade=NOME_DA_CIDADE`).
        2.  O SEU backend, que armazena a chave da API OpenWeatherMap de forma segura (variável de ambiente, segredos), faria a chamada real para a API OpenWeatherMap.
        3.  O backend receberia a resposta da OpenWeatherMap e a repassaria para o frontend.
    *   **Simplificação Didática:** Para os fins desta atividade, a chave é mantida no frontend para simplificar o escopo e focar na manipulação da API e dos dados. **NUNCA utilize esta abordagem em um projeto de produção.**

### 3. Use o Planejador:

*   Na seção "Planejar Viagem com Clima" da página principal (`teste.html`).
*   Digite o nome de uma cidade no campo "Cidade de Destino".
*   Clique no botão "Verificar Clima".
*   A previsão do tempo para os próximos dias para a cidade será exibida (ou uma mensagem de erro se a cidade não for encontrada, a chave for inválida, etc.). A previsão inclui temperatura mínima e máxima, uma descrição geral e um ícone para cada dia.
*   Endpoint Utilizado: `https://api.openweathermap.org/data/2.5/forecast` com os parâmetros `q` (cidade), `appid` (sua chave), `units=metric` (Celsius) e `lang=pt_br` (português do Brasil).

