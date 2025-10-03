class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;
        this.ligado = false;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            exibirMensagem("Carro ligado!");
            console.log("Carro ligado!");
        } else {
            console.log("O carro já está ligado.");
        }
        atualizarEstadoCarroNaTela();
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            atualizarVelocidadeNaTela();
            exibirMensagem("Carro desligado!");
            console.log("Carro desligado!");
        } else {
            console.log("O carro já está desligado.");
        }
        atualizarEstadoCarroNaTela();
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 30;
            atualizarVelocidadeNaTela();
            exibirMensagem("Acelerando!");
            console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
        } else {
            exibirMensagem("O carro precisa estar ligado para acelerar.");
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    turbo() { // Novo método para ativar o Turbo
        if (this.ligado) {
            this.velocidade += 50; // Aumenta a velocidade em 50 km/h
            atualizarVelocidadeNaTela();
            exibirMensagem("Turbo ligado!");
            console.log("TURBO! Velocidade: " + this.velocidade + " km/h");
        } else {
            exibirMensagem("O carro precisa estar ligado para usar o turbo.");
            console.log("O carro precisa estar ligado para usar o turbo.");
        }
    }
}

// ... (seu código existente) ...

// Adicionando evento ao botão Turbo
const turboBotao = document.getElementById("turbo");
if (turboBotao) {
    turboBotao.addEventListener("click", function() {
        meuCarro.turbo();
    });
} else {
    console.error("Botão 'turbo' não encontrado!");
}






// Criação de um objeto Carro
const meuCarro = new Carro("Sedan", "Vermelho");

// Exibição das informações do carro na página
document.getElementById("modelo").textContent = meuCarro.modelo;
document.getElementById("cor").textContent = meuCarro.cor;

// Funções para atualizar a velocidade e o estado do carro na tela
function atualizarVelocidadeNaTela() {
    document.getElementById("velocidade").textContent = meuCarro.velocidade;
}

function atualizarEstadoCarroNaTela() {
  const estado = meuCarro.ligado ? "Ligado" : "Desligado";
  //document.getElementById("estadoCarro").textContent = estado;
}

function exibirMensagem(mensagem) {
    console.log("exibirMensagem chamada com: " + mensagem); // Verificação!
    const elementoMensagem = document.getElementById("mensagem");
    if (elementoMensagem) {
        elementoMensagem.textContent = mensagem;
    } else {
        console.error("Elemento com ID 'mensagem' não encontrado no HTML!");
    }
}

// Adicionando eventos aos botões
const ligarBotao = document.getElementById("ligar");
const desligarBotao = document.getElementById("desligar");
const acelerarBotao = document.getElementById("acelerar");

if (ligarBotao) {
    ligarBotao.addEventListener("click", function() {
        meuCarro.ligar();
    });
} else {
    console.error("Botão 'ligar' não encontrado!");
}

if (desligarBotao) {
    desligarBotao.addEventListener("click", function() {
        meuCarro.desligar();
    });
} else {
    console.error("Botão 'desligar' não encontrado!");
}

if (acelerarBotao) {
    acelerarBotao.addEventListener("click", function() {
        meuCarro.acelerar();
    });
} else {
    console.error("Botão 'acelerar' não encontrado!");
}


// Inicializa a velocidade na tela
atualizarVelocidadeNaTela();



class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            console.log(`${this.modelo} carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
        } else {
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    buzinar() {
        console.log('Fom fom!');
    }

 
}