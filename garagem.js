class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        this.ligado = true;
        this.exibirMensagem(`${this.modelo} ligado.`);
        console.log(`${this.modelo} ligado.`);
        atualizarInformacoes();
    }

    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        this.exibirMensagem(`${this.modelo} desligado.`);
        console.log(`${this.modelo} desligado.`);
        atualizarInformacoes();
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            this.exibirMensagem(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
            atualizarInformacoes();
        } else {
            this.exibirMensagem(`${this.modelo} não pode acelerar. Está desligado.`);
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    buzinar() {
        this.exibirMensagem('Beep beep!');
        console.log('Beep beep!');
    }

    exibirInformacoes() {
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
    }

     // Função para exibir mensagens na tela
     exibirMensagem(mensagem) {
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.textContent = mensagem;
    }
}

// Classe CarroEsportivo (Herda de Veiculo)
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor, turbo = false) {
        super(modelo, cor);
        this.turbo = turbo;
    }

    ativarTurbo() {
        this.turbo = true;
        this.exibirMensagem('Turbo ativado!');
        console.log('Turbo ativado!');
        atualizarInformacoes();
    }

    desativarTurbo() {
        this.turbo = false;
        this.exibirMensagem('Turbo desativado!');
        console.log('Turbo desativado!');
        atualizarInformacoes();
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Turbo: ${this.turbo ? 'Ativado' : 'Desativado'}`;
    }
}

// Classe Caminhao (Herda de Veiculo)
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga, cargaAtual = 0) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = cargaAtual;
    }

    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            this.exibirMensagem(`Caminhão carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
            console.log(`Caminhão carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
            atualizarInformacoes();
        } else {
            this.exibirMensagem('Carga excedeu a capacidade máxima!');
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
    }
}

// Instâncias dos veículos
const meuCarro = new Veiculo('Sedan', 'Prata');
const meuCarroEsportivo = new CarroEsportivo('Super Carro', 'Vermelho');
const meuCaminhao = new Caminhao('Caminhão', 'iron man', 10000);

// Funções para mostrar/esconder telas
function mostrarTela(telaId) {
    document.getElementById('telaPrincipal').style.display = 'none';
    document.getElementById('telaCarro').style.display = 'none';
    document.getElementById('telaEsportivo').style.display = 'none';
    document.getElementById('telaCaminhao').style.display = 'none';
    document.getElementById(telaId).style.display = 'block';
}

// Funções para atualizar as informações dos veículos
function atualizarInfoCarro() {
    const carroInfoDiv = document.getElementById('infoCarro');
    carroInfoDiv.innerHTML = `
        <p><strong>Modelo:</strong> ${meuCarro.modelo}</p>
        <p><strong>Cor:</strong> ${meuCarro.cor}</p>
        <p><strong>Ligado:</strong> ${meuCarro.ligado ? 'Sim' : 'Não'}</p>
        <p><strong>Velocidade:</strong> ${meuCarro.velocidade} km/h</p>
    `;
}

function atualizarInfoEsportivo() {
    const esportivoInfoDiv = document.getElementById('infoEsportivo');
    esportivoInfoDiv.innerHTML = `
        <p><strong>Modelo:</strong> ${meuCarroEsportivo.modelo}</p>
        <p><strong>Cor:</strong> ${meuCarroEsportivo.cor}</p>
        <p><strong>Ligado:</strong> ${meuCarroEsportivo.ligado ? 'Sim' : 'Não'}</p>
        <p><strong>Velocidade:</strong> ${meuCarroEsportivo.velocidade} km/h</p>
        <p><strong>Turbo:</strong> ${meuCarroEsportivo.turbo ? 'Ativado' : 'Desativado'}</p>
    `;
}

function atualizarInfoCaminhao() {
    const caminhaoInfoDiv = document.getElementById('infoCaminhao');
    caminhaoInfoDiv.innerHTML = `
        <p><strong>Modelo:</strong> ${meuCaminhao.modelo}</p>
        <p><strong>Cor:</strong> ${meuCaminhao.cor}</p>
        <p><strong>Ligado:</strong> ${meuCaminhao.ligado ? 'Sim' : 'Não'}</p>
        <p><strong>Velocidade:</strong> ${meuCaminhao.velocidade} km/h</p>
        <p><strong>Capacidade de Carga:</strong> ${meuCaminhao.capacidadeCarga} kg</p>
        <p><strong>Carga Atual:</strong> ${meuCaminhao.cargaAtual} kg</p>
    `;
}

// Event Listeners para navegar entre as telas
document.getElementById('irParaCarro').addEventListener('click', () => {
    mostrarTela('telaCarro');
    atualizarInfoCarro();
});

document.getElementById('irParaEsportivo').addEventListener('click', () => {
    mostrarTela('telaEsportivo');
    atualizarInfoEsportivo();
});

document.getElementById('irParaCaminhao').addEventListener('click', () => {
    mostrarTela('telaCaminhao');
    atualizarInfoCaminhao();
});

document.getElementById('voltarParaGaragemCarro').addEventListener('click', () => {
    mostrarTela('telaPrincipal');
});

document.getElementById('voltarParaGaragemEsportivo').addEventListener('click', () => {
    mostrarTela('telaPrincipal');
});

document.getElementById('voltarParaGaragemCaminhao').addEventListener('click', () => {
    mostrarTela('telaPrincipal');
});

// Event Listeners para os botões de ação dos veículos
document.getElementById('ligarCarro').addEventListener('click', () => {
    meuCarro.ligar();
    atualizarInfoCarro();
});

document.getElementById('desligarCarro').addEventListener('click', () => {
    meuCarro.desligar();
    atualizarInfoCarro();
});

document.getElementById('acelerarCarro').addEventListener('click', () => {
    meuCarro.acelerar(10);
    atualizarInfoCarro();
});

document.getElementById('buzinarCarro').addEventListener('click', () => {
    meuCarro.buzinar();
});

document.getElementById('ligarEsportivo').addEventListener('click', () => {
    meuCarroEsportivo.ligar();
    atualizarInfoEsportivo();
});

document.getElementById('desligarEsportivo').addEventListener('click', () => {
    meuCarroEsportivo.desligar();
    atualizarInfoEsportivo();
});

document.getElementById('acelerarEsportivo').addEventListener('click', () => {
    meuCarroEsportivo.acelerar(10);
    atualizarInfoEsportivo();
});

document.getElementById('buzinarEsportivo').addEventListener('click', () => {
    meuCarroEsportivo.buzinar();
});

document.getElementById('ativarTurbo').addEventListener('click', () => {
    meuCarroEsportivo.ativarTurbo();
    atualizarInfoEsportivo();
});

document.getElementById('desativarTurbo').addEventListener('click', () => {
    meuCarroEsportivo.desativarTurbo();
    atualizarInfoEsportivo();
});

document.getElementById('ligarCaminhao').addEventListener('click', () => {
    meuCaminhao.ligar();
    atualizarInfoCaminhao();
});

document.getElementById('desligarCaminhao').addEventListener('click', () => {
    meuCaminhao.desligar();
    atualizarInfoCaminhao();
});

document.getElementById('acelerarCaminhao').addEventListener('click', () => {
    meuCaminhao.acelerar(10);
    atualizarInfoCaminhao();
});

document.getElementById('buzinarCaminhao').addEventListener('click', () => {
    meuCaminhao.buzinar();
});

document.getElementById('carregarCaminhao').addEventListener('click', () => {
    const pesoCarga = document.getElementById('pesoCarga').value;
    if (pesoCarga) {
        meuCaminhao.carregar(parseInt(pesoCarga));
        atualizarInfoCaminhao();
    }
});

// Função genérica para atualizar as informações do veículo
function atualizarInformacoes() {
    atualizarInfoCarro();
    atualizarInfoEsportivo();
    atualizarInfoCaminhao();
}

// Inicialização: Mostra a tela principal
mostrarTela('telaPrincipal');