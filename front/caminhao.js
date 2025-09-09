/**
 * @fileoverview Provides JavaScript logic for the caminhao.html page.
 * Defines Carro and Caminhao classes and handles button interactions.
 * NOTE: Contains a redundant basic Carro class definition.
 */

/**
 * Represents a basic Car (Example, potentially redundant if other scripts are used).
 * @class
 */
class Carro {
    /**
     * Creates an instance of Carro.
     * @param {string} modelo - The model of the car.
     * @param {string} cor - The color of the car.
     */
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    /** Turns the car on. */
    ligar() {
        this.ligado = true;
        console.log(`${this.modelo} ligado.`); // Log status to console
    }

    /** Turns the car off and resets speed. */
    desligar() {
        this.ligado = false;
        this.velocidade = 0;
        console.log(`${this.modelo} desligado.`); // Log status to console
    }

    /**
     * Increases the car's speed if it's turned on.
     * @param {number} incremento - The amount to increase the speed by.
     */
    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            console.log(`${this.modelo} acelerou para ${this.velocidade} km/h.`);
        } else {
            console.log(`${this.modelo} não pode acelerar. Está desligado.`);
        }
    }

    /**
     * Decreases the car's speed, ensuring it doesn't go below zero.
     * @param {number} decremento - The amount to decrease the speed by.
     */
    frear(decremento) {
        this.velocidade = Math.max(0, this.velocidade - decremento); // Prevent negative speed
        console.log(`${this.modelo} freou para ${this.velocidade} km/h.`);
    }
}

/**
 * Represents a Truck, inheriting basic properties from Car.
 * @class
 * @extends Carro
 */
class Caminhao extends Carro {
    /**
     * Creates an instance of Caminhao.
     * @param {string} modelo - The model of the truck.
     * @param {string} cor - The color of the truck.
     * @param {number} capacidadeCarga - The maximum cargo capacity in kg.
     */
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor); // Call the parent class constructor
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0; // Initial cargo is zero
    }

    /**
     * Adds cargo to the truck if capacity allows.
     * @param {number} peso - The weight of the cargo to add in kg.
     */
    carregar(peso) {
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            console.log(`${this.modelo} carregado com ${peso} kg. Carga atual: ${this.cargaAtual} kg.`);
        } else {
            console.log('Carga excedeu a capacidade máxima!');
        }
    }

    /** Simulates honking the truck's horn. */
    buzinar() {
        console.log('Fom fom!'); // Truck horn sound
    }
}

// --- Instance Creation ---
// Create a new truck object
const meuCaminhao = new Caminhao("Caminhãozão", "Vermelho", 10000); // 10-ton capacity

// --- DOM Interaction ---

/**
 * Updates the status paragraph on the HTML page with the truck's current state.
 */
function atualizarCaminhaoStatus() {
    const statusElement = document.getElementById('caminhaoStatus');
    if (statusElement) {
        statusElement.textContent = `Status: ${meuCaminhao.ligado ? 'Ligado' : 'Desligado'}, Velocidade: ${meuCaminhao.velocidade} km/h, Carga: ${meuCaminhao.cargaAtual} kg`;
    } else {
        console.error("Element with ID 'caminhaoStatus' not found!");
    }
}

// --- Event Listeners ---

// Listener for the 'Ligar' button
document.getElementById('ligarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.ligar();
    atualizarCaminhaoStatus();
});

// Listener for the 'Desligar' button
document.getElementById('desligarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.desligar();
    atualizarCaminhaoStatus();
});

// Listener for the 'Acelerar' button
document.getElementById('acelerarCaminhao')?.addEventListener('click', () => {
    meuCaminhao.acelerar(5); // Accelerate by 5 km/h
    atualizarCaminhaoStatus();
});

// Listener for the 'Frear' button
document.getElementById('frearCaminhao')?.addEventListener('click', () => {
    meuCaminhao.frear(5); // Brake by 5 km/h
    atualizarCaminhaoStatus();
});

// Listener for the 'Carregar' button
document.getElementById('carregar')?.addEventListener('click', () => {
    const cargaInput = document.getElementById('carga');
    const carga = parseInt(cargaInput.value); // Get value from input

    // Validate the input cargo value
    if (isNaN(carga) || carga <= 0) {
        alert("Por favor, insira um valor de carga válido (número positivo).");
        cargaInput.value = ""; // Clear the input field
        return; // Stop execution if invalid
    }

    meuCaminhao.carregar(carga); // Load the truck
    atualizarCaminhaoStatus(); // Update the status display
    cargaInput.value = ""; // Clear the input field after loading
});

// --- Initialization ---
// Set the initial status on page load
atualizarCaminhaoStatus();