class RouletteApp {
    constructor() {
        this.participants = [];
        this.selectedParticipants = [];
        this.remainingParticipants = [];
        this.isSpinning = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        this.participantInput = document.getElementById('participantInput');
        this.addParticipantBtn = document.getElementById('addParticipant');
        this.participantsList = document.getElementById('participantsList');
        this.rouletteWheel = document.getElementById('rouletteWheel');
        this.spinButton = document.getElementById('spinButton');
        this.resetButton = document.getElementById('resetButton');
        this.selectedParticipantsDiv = document.getElementById('selectedParticipants');
        this.remainingParticipantsDiv = document.getElementById('remainingParticipants');
        this.pointer1 = document.getElementById('pointer1');
        this.pointer2 = document.getElementById('pointer2');
    }

    bindEvents() {
        this.addParticipantBtn.addEventListener('click', () => this.addParticipant());
        this.participantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addParticipant();
        });
        this.spinButton.addEventListener('click', () => this.spinRoulette());
        this.resetButton.addEventListener('click', () => this.resetRoulette());
    }

    addParticipant() {
        const name = this.participantInput.value.trim();
        if (!name) return;
        
        if (this.participants.includes(name)) {
            alert('Este participante já foi adicionado!');
            return;
        }

        this.participants.push(name);
        this.remainingParticipants.push(name);
        this.participantInput.value = '';
        this.updateUI();
    }

    removeParticipant(name) {
        this.participants = this.participants.filter(p => p !== name);
        this.remainingParticipants = this.remainingParticipants.filter(p => p !== name);
        this.updateUI();
    }

    spinRoulette() {
        if (this.isSpinning || this.remainingParticipants.length < 2) return;

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.innerHTML = '<span class="btn-text">Girando...</span><span class="btn-icon">🎯</span>';

        // 🔀 Embaralha antes de desenhar (posições mudam a cada giro)
        this.remainingParticipants = [...this.remainingParticipants].sort(() => Math.random() - 0.5);
        this.updateRouletteWheel();

        // 🌀 Aplica rotação aleatória com transição suave
        const randomRotation = 720 + Math.floor(Math.random() * 360); // duas voltas + ângulo aleatório
        this.rouletteWheel.style.transition = 'transform 3s ease-out';
        this.rouletteWheel.style.transform = `rotate(${randomRotation}deg)`;

        // Aguarda o fim da rotação
        setTimeout(() => {
            this.rouletteWheel.style.transition = '';
            this.rouletteWheel.style.transform = '';
            
            this.selectParticipants();
            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.spinButton.innerHTML = '<span class="btn-text">Girar Novamente</span><span class="btn-icon">🎯</span>';
            this.updateUI();
        }, 3000);
    }

    selectParticipants() {
        const selected = this.getParticipantsAtPointerPositions();

        if (selected.length >= 2) {
            this.selectedParticipants.push({
                group: this.selectedParticipants.length + 1,
                participants: selected
            });

            this.remainingParticipants = this.remainingParticipants.filter(p => !selected.includes(p));
        }

        this.updateUI();
    }

    getParticipantsAtPointerPositions() {
        // Pega elementos visuais na roleta
        const participantElements = this.rouletteWheel.querySelectorAll('.participant-name');
        const selected = [];

        participantElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const wheelRect = this.rouletteWheel.getBoundingClientRect();

            const centerX = wheelRect.left + wheelRect.width / 2;
            const centerY = wheelRect.top + wheelRect.height / 2;
            const elementX = rect.left + rect.width / 2;
            const elementY = rect.top + rect.height / 2;

            const deltaX = elementX - centerX;
            const deltaY = elementY - centerY;
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            const normalizedAngle = ((angle + 90) + 360) % 360;

            const tolerance = 45;
            const isNearTop = normalizedAngle <= tolerance || normalizedAngle >= (360 - tolerance);
            const isNearBottom = normalizedAngle >= (180 - tolerance) && normalizedAngle <= (180 + tolerance);

            if (isNearTop || isNearBottom) {
                selected.push(element.textContent);
            }
        });

        // Caso nenhum seja encontrado exato, escolhe aleatoriamente
        if (selected.length < 2 && this.remainingParticipants.length >= 2) {
            const shuffled = [...this.remainingParticipants].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 2);
        }

        return selected.slice(0, 2);
    }

    resetRoulette() {
        this.selectedParticipants = [];
        this.remainingParticipants = [...this.participants];
        this.pointer1.classList.remove('hidden');
        this.pointer2.classList.remove('hidden');
        this.updateUI();
    }

    updateUI() {
        this.updateParticipantsList();
        this.updateRouletteWheel();
        this.updateSpinButton();
        this.updateResetButton();
        this.updateSelectedParticipants();
        this.updateRemainingParticipants();
    }

    updateParticipantsList() {
        if (this.participants.length === 0) {
            this.participantsList.innerHTML = '<p class="empty-message">Nenhum participante adicionado ainda</p>';
            return;
        }

        this.participantsList.innerHTML = this.participants.map(participant => `
            <div class="participant-tag">
                ${participant}
                <button class="remove" onclick="app.removeParticipant('${participant}')">×</button>
            </div>
        `).join('');
    }

    updateSpinButton() {
        const canSpin = this.remainingParticipants.length >= 2 && !this.isSpinning;
        this.spinButton.disabled = !canSpin;

        if (this.remainingParticipants.length < 2 && this.remainingParticipants.length > 0) {
            this.spinButton.innerHTML = '<span class="btn-text">Precisa de pelo menos 2 participantes</span><span class="btn-icon">⚠️</span>';
        } else if (this.remainingParticipants.length === 0) {
            this.spinButton.innerHTML = '<span class="btn-text">Todos foram sorteados!</span><span class="btn-icon">🎉</span>';
        } else {
            this.spinButton.innerHTML = '<span class="btn-text">Girar Roleta</span><span class="btn-icon">🎯</span>';
        }
    }

    updateResetButton() {
        this.resetButton.disabled = this.selectedParticipants.length === 0;
    }

    updateSelectedParticipants() {
        if (this.selectedParticipants.length === 0) {
            this.selectedParticipantsDiv.innerHTML = '<p class="empty-message">Nenhum sorteio realizado ainda</p>';
            return;
        }

        this.selectedParticipantsDiv.innerHTML = this.selectedParticipants.map(group => `
            <div class="selected-group">
                <h3>Grupo ${group.group}</h3>
                <div class="participants">
                    ${group.participants.map(p => `<div class="participant">${p}</div>`).join('')}
                </div>
            </div>
        `).join('');
    }

    updateRouletteWheel() {
        const existingNames = this.rouletteWheel.querySelectorAll('.participant-name');
        existingNames.forEach(name => name.remove());

        if (this.remainingParticipants.length === 0) return;

        const colors = ['#e2e8f0', '#cbd5e0', '#a0aec0', '#e2e8f0', '#cbd5e0', '#a0aec0'];
        const participants = [...this.remainingParticipants];

        participants.forEach((participant, index) => {
            const nameElement = document.createElement('div');
            nameElement.className = 'participant-name';
            nameElement.textContent = participant;

            const angle = (360 / participants.length) * index;
            const radius = 120;
            const colorIndex = Math.floor(angle / 60) % colors.length;
            const backgroundColor = colors[colorIndex];

            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

            nameElement.style.position = 'absolute';
            nameElement.style.left = `calc(50% + ${x}px)`;
            nameElement.style.top = `calc(50% + ${y}px)`;
            nameElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            nameElement.style.fontSize = participants.length > 8 ? '12px' : '14px';
            nameElement.style.backgroundColor = backgroundColor;
            nameElement.style.padding = '4px 8px';
            nameElement.style.borderRadius = '12px';
            nameElement.style.border = '2px solid #4a5568';
            nameElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            nameElement.style.color = '#2d3748';

            this.rouletteWheel.appendChild(nameElement);
        });
    }

    updateRemainingParticipants() {
        if (this.remainingParticipants.length === 0) {
            this.remainingParticipantsDiv.innerHTML = '<p class="empty-message">Todos os participantes foram sorteados!</p>';
            return;
        }

        this.remainingParticipantsDiv.innerHTML = this.remainingParticipants.map(p => `
            <div class="remaining-participant">${p}</div>
        `).join('');
    }
}

// Inicializa a aplicação
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RouletteApp();
    app.pointer1.classList.remove('hidden');
    app.pointer2.classList.remove('hidden');
    app.updateUI();
});
