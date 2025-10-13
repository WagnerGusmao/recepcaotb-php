// Classe para gerenciar temporizadores de progresso
class ProgressTimer {
    constructor() {
        this.activeTimers = new Map();
        this.currentOverlay = null;
    }

    // Criar um novo temporizador de progresso
    create(options = {}) {
        const config = {
            title: options.title || 'Processando...',
            message: options.message || 'Aguarde enquanto processamos sua solicitação',
            steps: options.steps || [],
            showTimer: options.showTimer !== false,
            showProgressBar: options.showProgressBar !== false,
            showSpinner: options.showSpinner !== false,
            cancelable: options.cancelable || false,
            onCancel: options.onCancel || null,
            estimatedTime: options.estimatedTime || 30, // segundos
            ...options
        };

        const timerId = this.generateId();
        const timer = {
            id: timerId,
            config,
            startTime: Date.now(),
            currentStep: 0,
            progress: 0,
            element: null,
            intervalId: null,
            cancelled: false
        };

        this.activeTimers.set(timerId, timer);
        this.createProgressElement(timer);
        this.startTimer(timer);

        return timerId;
    }

    // Atualizar progresso
    update(timerId, options = {}) {
        const timer = this.activeTimers.get(timerId);
        if (!timer || timer.cancelled) return;

        if (options.message) {
            const messageEl = timer.element.querySelector('.progress-message');
            if (messageEl) messageEl.textContent = options.message;
        }

        if (options.progress !== undefined) {
            timer.progress = Math.max(0, Math.min(100, options.progress));
            this.updateProgressBar(timer);
        }

        if (options.currentStep !== undefined) {
            timer.currentStep = options.currentStep;
            this.updateSteps(timer);
        }

        if (options.nextStep) {
            this.nextStep(timerId, options.nextStep);
        }
    }

    // Avançar para próximo passo
    nextStep(timerId, stepMessage = null) {
        const timer = this.activeTimers.get(timerId);
        if (!timer || timer.cancelled) return;

        if (timer.config.steps.length > 0) {
            // Marcar passo atual como concluído
            if (timer.currentStep < timer.config.steps.length) {
                timer.config.steps[timer.currentStep].status = 'completed';
            }

            // Avançar para próximo passo
            timer.currentStep++;
            if (timer.currentStep < timer.config.steps.length) {
                timer.config.steps[timer.currentStep].status = 'active';
                if (stepMessage) {
                    timer.config.steps[timer.currentStep].text = stepMessage;
                }
            }

            this.updateSteps(timer);
        }

        // Calcular progresso baseado nos passos
        if (timer.config.steps.length > 0) {
            timer.progress = (timer.currentStep / timer.config.steps.length) * 100;
            this.updateProgressBar(timer);
        }
    }

    // Finalizar temporizador
    complete(timerId, options = {}) {
        const timer = this.activeTimers.get(timerId);
        if (!timer) return;

        // Marcar todos os passos como concluídos
        timer.config.steps.forEach(step => step.status = 'completed');
        timer.progress = 100;
        this.updateSteps(timer);
        this.updateProgressBar(timer);

        // Mostrar mensagem de sucesso
        const messageEl = timer.element.querySelector('.progress-message');
        if (messageEl) {
            messageEl.textContent = options.message || 'Concluído com sucesso!';
            messageEl.style.color = '#27ae60';
        }

        // Remover após delay
        setTimeout(() => {
            this.remove(timerId);
        }, options.delay || 1500);
    }

    // Remover temporizador
    remove(timerId) {
        const timer = this.activeTimers.get(timerId);
        if (!timer) return;

        if (timer.intervalId) {
            clearInterval(timer.intervalId);
        }

        if (timer.element && timer.element.parentNode) {
            timer.element.parentNode.removeChild(timer.element);
        }

        if (this.currentOverlay === timer.element) {
            this.currentOverlay = null;
        }

        this.activeTimers.delete(timerId);
    }

    // Cancelar temporizador
    cancel(timerId) {
        const timer = this.activeTimers.get(timerId);
        if (!timer) return;

        timer.cancelled = true;
        
        if (timer.config.onCancel) {
            timer.config.onCancel();
        }

        this.remove(timerId);
    }

    // Criar elemento visual do progresso
    createProgressElement(timer) {
        const overlay = document.createElement('div');
        overlay.className = 'progress-overlay';

        const container = document.createElement('div');
        container.className = 'progress-container';

        let html = `
            <div class="progress-title">${timer.config.title}</div>
            <div class="progress-message">${timer.config.message}</div>
        `;

        if (timer.config.showSpinner) {
            html += '<div class="progress-spinner"></div>';
        }

        if (timer.config.showProgressBar) {
            html += `
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${timer.progress}%"></div>
                </div>
            `;
        }

        if (timer.config.showTimer) {
            html += '<div class="progress-timer">Tempo estimado: <span class="timer-display">--:--</span></div>';
        }

        if (timer.config.steps.length > 0) {
            html += '<div class="progress-steps">';
            timer.config.steps.forEach((step, index) => {
                const status = index === 0 ? 'active' : 'pending';
                step.status = status;
                html += `
                    <div class="progress-step ${status}" data-step="${index}">
                        <div class="progress-step-icon">${index + 1}</div>
                        <span>${step.text}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (timer.config.cancelable) {
            html += `<button class="progress-cancel-btn" onclick="progressTimer.cancel('${timer.id}')">Cancelar</button>`;
        }

        container.innerHTML = html;
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        timer.element = overlay;
        this.currentOverlay = overlay;
    }

    // Iniciar cronômetro
    startTimer(timer) {
        if (!timer.config.showTimer) return;

        timer.intervalId = setInterval(() => {
            if (timer.cancelled) {
                clearInterval(timer.intervalId);
                return;
            }

            const elapsed = (Date.now() - timer.startTime) / 1000;
            const remaining = Math.max(0, timer.config.estimatedTime - elapsed);
            
            const minutes = Math.floor(remaining / 60);
            const seconds = Math.floor(remaining % 60);
            const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const timerEl = timer.element.querySelector('.timer-display');
            if (timerEl) {
                timerEl.textContent = timeDisplay;
            }

            // Auto-incrementar progresso baseado no tempo se não houver passos
            if (timer.config.steps.length === 0 && timer.config.showProgressBar) {
                const timeProgress = (elapsed / timer.config.estimatedTime) * 100;
                timer.progress = Math.min(95, timeProgress); // Não chegar a 100% automaticamente
                this.updateProgressBar(timer);
            }
        }, 1000);
    }

    // Atualizar barra de progresso
    updateProgressBar(timer) {
        const progressBar = timer.element.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${timer.progress}%`;
        }
    }

    // Atualizar passos
    updateSteps(timer) {
        timer.config.steps.forEach((step, index) => {
            const stepEl = timer.element.querySelector(`[data-step="${index}"]`);
            if (stepEl) {
                stepEl.className = `progress-step ${step.status}`;
                const icon = stepEl.querySelector('.progress-step-icon');
                if (step.status === 'completed' && icon) {
                    icon.innerHTML = '✓';
                }
            }
        });
    }

    // Gerar ID único
    generateId() {
        return 'progress_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Criar progresso inline (para operações menores)
    createInline(element, message = 'Carregando...') {
        const progressEl = document.createElement('div');
        progressEl.className = 'inline-progress';
        progressEl.innerHTML = `
            <div class="spinner-small"></div>
            <span>${message}</span>
        `;
        
        if (element.parentNode) {
            element.parentNode.insertBefore(progressEl, element.nextSibling);
        }
        
        return progressEl;
    }

    // Remover progresso inline
    removeInline(progressElement) {
        if (progressElement && progressElement.parentNode) {
            progressElement.parentNode.removeChild(progressElement);
        }
    }
}

// Instância global do gerenciador de progresso
const progressTimer = new ProgressTimer();

class SistemaFrequencia {
    constructor() {
        // Usar API relativa para funcionar em produção
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
        this.pessoas = [];
        this.pessoasEncontradas = [];
        this.frequencias = [];
        this.pessoaSelecionada = null;
        this.init();
        this.carregarPessoas();
    }

    // Obter headers com token de autenticação
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    init() {
        this.setupNavigation();
        this.setupCadastro();
        this.setupFrequencia();
        this.setupRelatorio();
    }

    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const secoes = document.querySelectorAll('.secao');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                secoes.forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                const secaoId = 'secao' + btn.id.replace('btn', '');
                document.getElementById(secaoId).classList.add('active');
            });
        });
    }

    setupCadastro() {
        // Elementos do formulário
        const form = document.getElementById('formCadastro');
        const cpfInput = document.getElementById('cpf');
        const telefoneInput = document.getElementById('telefone');
        const estadoInput = document.getElementById('estado');
        
        // Verificar se o formulário existe antes de adicionar o event listener
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cadastrarPessoa();
            });
        }

        // Verificar se o campo CPF existe antes de adicionar a máscara
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }

        // Máscara para telefone (se o elemento existir)
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        }

        // Máscara para Estado (2 caracteres maiúsculos) - se o elemento existir
        if (estadoInput) {
            estadoInput.addEventListener('input', (e) => {
                let value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                if (value.length > 2) value = value.substring(0, 2);
                e.target.value = value;
            });
        }

        // Controle de estados e cidades
        this.setupEstadosCidades();
        
        // Definir São Paulo como padrão
        if (estadoInput) {
            estadoInput.value = 'SP';
            this.carregarCidades('cidade', 'SP', estadosCidades);
        }

        // Validação em tempo real
        const campos = ['nome', 'cpf', 'nascimento', 'religiao', 'cidade', 'estado', 'telefone', 'email'];
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('blur', () => {
                    this.validarCampo(campo);
                });
                campo.addEventListener('input', () => {
                    if (campo.classList.contains('error')) {
                        campo.classList.remove('error');
                        const errorMsg = campo.parentNode.querySelector('.error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                });
            }
        });
    }

    async cadastrarPessoa() {
        if (!this.validarFormulario()) {
            return;
        }

        const pessoa = {
            nome: document.getElementById('nome').value.trim(),
            cpf: document.getElementById('cpf').value.trim() || null,
            nascimento: document.getElementById('nascimento').value || null,
            religiao: document.getElementById('religiao').value || null,
            cidade: document.getElementById('cidade').value.trim() || null,
            estado: document.getElementById('estado').value.trim() || null,
            telefone: document.getElementById('telefone').value.trim() || null,
            email: document.getElementById('email').value.trim() || null,
            indicacao: document.getElementById('indicacao').value || null
        };

        // Criar temporizador de progresso para cadastro
        const timerId = progressTimer.create({
            title: 'Cadastrando Pessoa',
            message: 'Validando e salvando dados...',
            estimatedTime: 5,
            steps: [
                { text: 'Validando dados' },
                { text: 'Enviando para servidor' },
                { text: 'Salvando no banco de dados' }
            ]
        });

        try {
            // Simular progresso de validação
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 500));

            progressTimer.update(timerId, { message: 'Enviando dados para o servidor...' });
            progressTimer.nextStep(timerId);

            const response = await fetch(`${this.apiUrl}/pessoas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoa)
            });
            
            if (response.ok) {
                progressTimer.update(timerId, { message: 'Finalizando cadastro...' });
                progressTimer.nextStep(timerId);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                progressTimer.complete(timerId, { 
                    message: 'Pessoa cadastrada com sucesso!' 
                });
                
                document.getElementById('formCadastro').reset();
                this.limparErros();
                this.carregarPessoas();
            } else {
                const error = await response.json();
                progressTimer.remove(timerId);
                alert(error.error);
            }
        } catch (error) {
            progressTimer.remove(timerId);
            alert('Erro ao cadastrar pessoa');
        }
    }

    setupFrequencia() {
        // Verificar e configurar campo de busca de pessoa
        const buscaPessoa = document.getElementById('buscaPessoa');
        if (buscaPessoa) {
            const buscarHandler = (e) => this.buscarPessoa(e.target.value);
            buscaPessoa.addEventListener('input', buscarHandler);
            buscaPessoa.addEventListener('keyup', buscarHandler);
        } else {
            console.warn('Elemento #buscaPessoa não encontrado na página');
        }

        // Verificar e configurar botão de marcar frequência
        const btnMarcarFrequencia = document.getElementById('marcarFrequencia');
        if (btnMarcarFrequencia) {
            btnMarcarFrequencia.addEventListener('click', () => this.marcarFrequencia());
        } else {
            console.warn('Elemento #marcarFrequencia não encontrado na página');
        }

        // Verificar e configurar botão de atualizar pessoa
        const btnAtualizarPessoa = document.getElementById('atualizarPessoa');
        if (btnAtualizarPessoa) {
            btnAtualizarPessoa.addEventListener('click', () => this.atualizarPessoa());
        } else {
            console.warn('Elemento #atualizarPessoa não encontrado na página');
        }



        // Controlar exibição de campos de senha baseado no tipo
        const radiosTipoPresenca = document.querySelectorAll('input[name="tipoPresenca"]');
        if (radiosTipoPresenca.length > 0) {
            const senhasNormais = document.getElementById('senhasNormais');
            const senhasPet = document.getElementById('senhasPet');
            
            // Função para atualizar a exibição baseada no tipo selecionado
            const atualizarExibicao = (tipo) => {
                if (!senhasNormais || !senhasPet) return;
                
                if (tipo === 'pet') {
                    senhasNormais.style.display = 'none';
                    senhasPet.style.display = 'block';
                } else {
                    senhasNormais.style.display = 'block';
                    senhasPet.style.display = 'none';
                }
            };
            
            // Adicionar evento de mudança para cada radio button
            radiosTipoPresenca.forEach(radio => {
                radio.addEventListener('change', (e) => atualizarExibicao(e.target.value));
                
                // Inicializar estado baseado no radio marcado por padrão
                if (radio.checked) {
                    atualizarExibicao(radio.value);
                }
            });
        }

        // Definir data atual como padrão
        const dataFrequencia = document.getElementById('dataFrequencia');
        if (dataFrequencia) {
            dataFrequencia.value = new Date().toISOString().split('T')[0];
        }
    }

    async buscarPessoa(termo) {
        const resultado = document.getElementById('resultadoBusca');
        
        if (!termo.trim()) {
            resultado.innerHTML = '';
            return;
        }
        
        // Mostrar indicador inline de carregamento
        const loadingEl = progressTimer.createInline(resultado, 'Buscando pessoas...');
        resultado.innerHTML = '';
        resultado.appendChild(loadingEl);
        
        try {
            const response = await fetch(`${this.apiUrl}/pessoas?busca=${encodeURIComponent(termo)}`);
            this.pessoasEncontradas = await response.json();
            
            // Remover indicador de carregamento
            progressTimer.removeInline(loadingEl);
            
            resultado.innerHTML = this.pessoasEncontradas.slice(0, 10).map(pessoa => 
                `<div class="pessoa-item" onclick="sistema.selecionarPessoa(${pessoa.id})">
                    ${pessoa.nome} - ${pessoa.cpf || 'Sem CPF'}
                </div>`
            ).join('');
        } catch (error) {
            progressTimer.removeInline(loadingEl);
            resultado.innerHTML = '<div class="pessoa-item">Erro na busca</div>';
        }
    }

    selecionarPessoa(id) {
        this.pessoaSelecionada = this.pessoasEncontradas.find(p => p.id === id);
        
        if (this.pessoaSelecionada) {
            // Preencher campos editáveis
            document.getElementById('editNome').value = this.pessoaSelecionada.nome || '';
            document.getElementById('editCpf').value = this.pessoaSelecionada.cpf || '';
            document.getElementById('editNascimento').value = this.pessoaSelecionada.nascimento || '';
            document.getElementById('editReligiao').value = this.pessoaSelecionada.religiao || '';
            // Configurar estado e cidade
            const estadoAtual = this.pessoaSelecionada.estado || '';
            const cidadeAtual = this.pessoaSelecionada.cidade || '';
            
            document.getElementById('editEstado').value = estadoAtual;
            if (estadoAtual) {
                this.carregarCidades('editCidade', estadoAtual, estadosCidades);
                setTimeout(() => {
                    document.getElementById('editCidade').value = cidadeAtual;
                }, 100);
            }
            document.getElementById('editTelefone').value = this.pessoaSelecionada.telefone || '';
            document.getElementById('editEmail').value = this.pessoaSelecionada.email || '';
            
            document.getElementById('formFrequencia').style.display = 'block';
            document.getElementById('resultadoBusca').innerHTML = '';
            document.getElementById('buscaPessoa').value = this.pessoaSelecionada.nome;
            document.getElementById('dataFrequencia').value = new Date().toISOString().split('T')[0];
        }
    }

    async marcarFrequencia() {
        const tipoPresenca = document.querySelector('input[name="tipoPresenca"]:checked');
        const dataFrequencia = document.getElementById('dataFrequencia').value;

        if (!tipoPresenca || !dataFrequencia || !this.pessoaSelecionada) {
            alert('Preencha todos os campos!');
            return;
        }

        let frequencias = [];

        if (tipoPresenca.value === 'pet') {
            const senhaTutor = document.getElementById('senhaTutor').value;
            const senhaPet = document.getElementById('senhaPet').value;
            
            if (!senhaTutor || !senhaPet) {
                alert('Preencha as senhas do tutor e do pet!');
                return;
            }

            // Criar duas frequências para pet
            frequencias = [
                {
                    pessoaId: this.pessoaSelecionada.id,
                    tipo: 'pet_tutor',
                    numeroSenha: parseInt(senhaTutor),
                    data: dataFrequencia
                },
                {
                    pessoaId: this.pessoaSelecionada.id,
                    tipo: 'pet_animal',
                    numeroSenha: parseInt(senhaPet),
                    data: dataFrequencia
                }
            ];
        } else {
            const numeroSenha = document.getElementById('numeroSenha').value;
            
            if (!numeroSenha) {
                alert('Preencha o número da senha!');
                return;
            }

            frequencias = [{
                pessoaId: this.pessoaSelecionada.id,
                tipo: tipoPresenca.value,
                numeroSenha: parseInt(numeroSenha),
                data: dataFrequencia
            }];
        }

        // Criar temporizador de progresso para marcar frequência
        const timerId = progressTimer.create({
            title: 'Marcando Frequência',
            message: `Registrando presença de ${this.pessoaSelecionada.nome}...`,
            estimatedTime: 3,
            steps: [
                { text: 'Validando dados' },
                { text: 'Registrando frequência' },
                { text: 'Finalizando' }
            ]
        });

        try {
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 300));

            progressTimer.update(timerId, { message: 'Enviando dados para o servidor...' });
            progressTimer.nextStep(timerId);

            // Registrar todas as frequências com token de autenticação
            for (const freq of frequencias) {
                const response = await fetch(`${this.apiUrl}/frequencias`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(freq)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao registrar frequência');
                }
            }
            
            progressTimer.update(timerId, { message: 'Limpando formulário...' });
            progressTimer.nextStep(timerId);
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            progressTimer.complete(timerId, { 
                message: 'Frequência registrada com sucesso!' 
            });
            
            // Limpar formulário
            document.querySelector('input[name="tipoPresenca"]:checked').checked = false;
            document.getElementById('numeroSenha').value = '';
            document.getElementById('senhaTutor').value = '';
            document.getElementById('senhaPet').value = '';
            document.getElementById('senhasNormais').style.display = 'block';
            document.getElementById('senhasPet').style.display = 'none';
            document.getElementById('formFrequencia').style.display = 'none';
            document.getElementById('buscaPessoa').value = '';
            this.pessoaSelecionada = null;
        } catch (error) {
            progressTimer.remove(timerId);
            alert('Erro ao registrar frequência: ' + error.message);
        }
    }

    setupRelatorio() {
        const btnGerar = document.getElementById('gerarRelatorio');
        if (btnGerar) {
            console.log('Botão gerar relatório encontrado');
            btnGerar.addEventListener('click', () => {
                console.log('Botão gerar relatório clicado');
                this.gerarRelatorio();
            });
        } else {
            console.error('Botão gerar relatório não encontrado!');
        }

        const btnCidades = document.getElementById('relatorioCidades');
        if (btnCidades) {
            btnCidades.addEventListener('click', () => {
                this.gerarRelatorioCidades();
            });
        }

        const btnMensal = document.getElementById('relatorioMensal');
        if (btnMensal) {
            btnMensal.addEventListener('click', () => {
                this.gerarRelatorioMensal();
            });
        }

        document.getElementById('exportarCidadesPDF').addEventListener('click', () => {
            this.exportarCidadesPDF();
        });

        document.getElementById('exportarMensalPDF').addEventListener('click', () => {
            this.exportarMensalPDF();
        });

        document.getElementById('exportarCSV').addEventListener('click', () => {
            this.exportarCSV();
        });

        document.getElementById('exportarXLS').addEventListener('click', () => {
            this.exportarXLS();
        });

        document.getElementById('exportarPDF').addEventListener('click', () => {
            this.exportarPDF();
        });
    }

    async gerarRelatorio() {
        const resultado = document.getElementById('relatorioResultado');
        
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const filtroTipo = document.getElementById('filtroTipo').value;

        // Criar temporizador de progresso para geração de relatório
        const timerId = progressTimer.create({
            title: 'Gerando Relatório',
            message: 'Buscando dados de frequência...',
            estimatedTime: 8,
            steps: [
                { text: 'Preparando filtros' },
                { text: 'Consultando banco de dados' },
                { text: 'Processando dados' },
                { text: 'Formatando relatório' },
                { text: 'Exibindo resultados' }
            ]
        });

        try {
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 300));

            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (filtroTipo) params.append('tipo', filtroTipo);

            const url = `${this.apiUrl}/frequencias?${params}`;

            progressTimer.update(timerId, { message: 'Enviando consulta ao servidor...' });
            progressTimer.nextStep(timerId);

            const response = await fetch(url, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar relatório');
            }
            
            progressTimer.update(timerId, { message: 'Processando dados recebidos...' });
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const frequencias = await response.json();
            
            progressTimer.update(timerId, { message: 'Formatando relatório...' });
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            this.exibirRelatorio(frequencias);
            this.dadosRelatorio = frequencias;
            
            progressTimer.update(timerId, { message: 'Configurando opções de exportação...' });
            progressTimer.nextStep(timerId);
            
            // Mostrar botões de exportação com verificação de null
            const exportCSVBtn = document.getElementById('exportarCSV');
            const exportXLSBtn = document.getElementById('exportarXLS');
            const exportPDFBtn = document.getElementById('exportarPDF');
            
            if (exportCSVBtn) exportCSVBtn.style.display = 'inline-block';
            if (exportXLSBtn) exportXLSBtn.style.display = 'inline-block';
            if (exportPDFBtn) exportPDFBtn.style.display = 'inline-block';
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            progressTimer.complete(timerId, { 
                message: `Relatório gerado com ${frequencias.length} registros!` 
            });
            
        } catch (error) {
            console.error('ERRO COMPLETO:', error);
            progressTimer.remove(timerId);
            resultado.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
            alert('Erro ao gerar relatório: ' + error.message);
        }
    }

    exibirRelatorio(frequencias) {
        const resultado = document.getElementById('relatorioResultado');
        
        console.log('Exibindo relatório com', frequencias.length, 'registros');
        
        if (!frequencias || frequencias.length === 0) {
            resultado.innerHTML = '<p>Nenhuma frequência encontrada para os filtros selecionados.</p>';
            return;
        }

        const tipoLabels = {
            comum: 'Comum',
            hospital: 'Hospital',
            hospital_acompanhante: 'Hospital Acompanhante',
            crianca: 'Criança',
            pet: 'Pet',
            pet_tutor: 'Pet - Tutor',
            pet_animal: 'Pet - Animal'
        };

        // Contar senhas por tipo
        const contadores = {
            comum: 0,
            hospital: 0,
            hospital_acompanhante: 0,
            crianca: 0,
            pet_tutor: 0,
            pet_animal: 0
        };

        frequencias.forEach(freq => {
            const tipoLower = freq.tipo.toLowerCase();
            if (contadores.hasOwnProperty(tipoLower)) {
                contadores[tipoLower]++;
            }
        });

        const resumo = `
            <div style="background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                <h4>Resumo por Tipo:</h4>
                <p><strong>Comum:</strong> ${contadores.comum} senhas</p>
                <p><strong>Hospital:</strong> ${contadores.hospital} senhas</p>
                <p><strong>Hospital Acompanhante:</strong> ${contadores.hospital_acompanhante} senhas</p>
                <p><strong>Criança:</strong> ${contadores.crianca} senhas</p>
                <p><strong>Pet - Tutor:</strong> ${contadores.pet_tutor} senhas</p>
                <p><strong>Pet - Animal:</strong> ${contadores.pet_animal} senhas</p>
            </div>
        `;

        resultado.innerHTML = `
            <h3>Relatório de Frequência (${frequencias.length} registros)</h3>
            ${resumo}
            ${frequencias.map(freq => {
                const dataFormatada = freq.data ? freq.data.split('-').reverse().join('/') : 'N/A';
                const dataRegistro = freq.created_at ? new Date(freq.created_at).toLocaleString('pt-BR') : 'N/A';
                
                return `
                    <div class="relatorio-item tipo-${freq.tipo}">
                        <strong>${freq.nome || 'Nome não encontrado'}</strong><br>
                        Tipo: ${tipoLabels[freq.tipo] || freq.tipo}<br>
                        Senha: ${freq.numero_senha || 'N/A'}<br>
                        Data: ${dataFormatada}<br>
                        Registrado em: ${dataRegistro}
                    </div>
                `;
            }).join('')}
        `;
    }

    validarFormulario() {
        this.limparErros();
        let valido = true;
        
        // Apenas nome é obrigatório
        const nome = document.getElementById('nome').value.trim();
        if (!nome) {
            this.mostrarErro(document.getElementById('nome'), 'Nome é obrigatório');
            valido = false;
        } else if (nome.length < 3) {
            this.mostrarErro(document.getElementById('nome'), 'Nome deve ter pelo menos 3 caracteres');
            valido = false;
        }

        // Validações opcionais
        const cpf = document.getElementById('cpf').value.trim();
        if (cpf && !this.validarCPF(cpf)) {
            this.mostrarErro(document.getElementById('cpf'), 'CPF inválido');
            valido = false;
        }

        const email = document.getElementById('email').value.trim();
        if (email && !this.validarEmail(email)) {
            this.mostrarErro(document.getElementById('email'), 'E-mail inválido');
            valido = false;
        }

        const nascimento = document.getElementById('nascimento').value;
        if (nascimento && new Date(nascimento) > new Date()) {
            this.mostrarErro(document.getElementById('nascimento'), 'Data de nascimento não pode ser futura');
            valido = false;
        }

        const estado = document.getElementById('estado').value.trim();
        if (estado && estado.length !== 2) {
            this.mostrarErro(document.getElementById('estado'), 'Estado deve ter exatamente 2 caracteres');
            valido = false;
        }

        return valido;
    }

    mostrarErro(elemento, mensagem) {
        elemento.classList.add('error');
        const errorDiv = document.createElement('span');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensagem;
        elemento.parentNode.insertBefore(errorDiv, elemento.nextSibling);
    }

    limparErros() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(cpf.charAt(10));
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarCampo(elemento) {
        const valor = elemento.value.trim();
        const nomesCampos = {
            nome: 'Nome',
            cpf: 'CPF',
            nascimento: 'Data de nascimento',
            religiao: 'Religião',
            cidade: 'Cidade',
            estado: 'Estado',
            telefone: 'Telefone',
            email: 'E-mail'
        };

        // Remove erro anterior
        elemento.classList.remove('error');
        const errorMsg = elemento.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();

        // Apenas nome é obrigatório
        if (elemento.id === 'nome' && !valor) {
            this.mostrarErro(elemento, 'Nome é obrigatório');
            return false;
        }

        // Validações apenas se campo preenchido
        if (valor) {
            // Validação mínimo 3 caracteres
            if (['nome', 'cidade'].includes(elemento.id) && valor.length < 3) {
                this.mostrarErro(elemento, `${nomesCampos[elemento.id]} deve ter pelo menos 3 caracteres`);
                return false;
            }

            // Validação estado deve ter 2 caracteres
            if (elemento.id === 'estado' && valor.length !== 2) {
                this.mostrarErro(elemento, 'Estado deve ter exatamente 2 caracteres');
                return false;
            }

            // Validação data não futura
            if (elemento.id === 'nascimento' && new Date(valor) > new Date()) {
                this.mostrarErro(elemento, 'Data de nascimento não pode ser futura');
                return false;
            }

            // Validações específicas
            if (elemento.id === 'cpf' && !this.validarCPF(valor)) {
                this.mostrarErro(elemento, 'CPF inválido');
                return false;
            }
            if (elemento.id === 'email' && !this.validarEmail(valor)) {
                this.mostrarErro(elemento, 'E-mail inválido');
                return false;
            }
        }

        return true;
    }

    async carregarPessoas() {
        try {
            console.log('Carregando pessoas...');
            const response = await fetch(`${this.apiUrl}/pessoas`);
            this.pessoas = await response.json();
            console.log('Pessoas carregadas:', this.pessoas.length);
        } catch (error) {
            console.error('Erro ao carregar pessoas:', error);
        }
    }



    mostrarMensagem(texto) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-sucesso';
        mensagem.textContent = texto;
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }

    async gerarRelatorioCidades() {
        const resultado = document.getElementById('relatorioResultado');
        
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const filtroTipo = document.getElementById('filtroTipo').value;

        // Criar temporizador de progresso para relatório por cidades
        const timerId = progressTimer.create({
            title: 'Relatório por Cidades',
            message: 'Analisando distribuição geográfica...',
            estimatedTime: 6,
            steps: [
                { text: 'Preparando consulta' },
                { text: 'Buscando frequências' },
                { text: 'Agrupando por cidades' },
                { text: 'Criando gráficos' },
                { text: 'Finalizando relatório' }
            ]
        });

        try {
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 300));

            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (filtroTipo) params.append('tipo', filtroTipo);
            
            progressTimer.update(timerId, { message: 'Consultando banco de dados...' });
            progressTimer.nextStep(timerId);

            const response = await fetch(`${this.apiUrl}/frequencias?${params}`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar frequências');
            }
            
            const frequencias = await response.json();
            
            progressTimer.update(timerId, { message: 'Processando dados por cidade...' });
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Usar dados já retornados pela API (cidade e estado já vêm no JOIN)
            const pessoasUnicas = new Map();
            const cidades = {};
            
            for (const freq of frequencias) {
                if (!pessoasUnicas.has(freq.pessoa_id)) {
                    pessoasUnicas.set(freq.pessoa_id, true);
                    const cidade = freq.cidade || 'Não informado';
                    cidades[cidade] = (cidades[cidade] || 0) + 1;
                }
            }
            
            const cidadesOrdenadas = Object.entries(cidades)
                .sort(([,a], [,b]) => b - a);
            
            const top10 = cidadesOrdenadas.slice(0, 10);
            
            progressTimer.update(timerId, { message: 'Formatando relatório...' });
            progressTimer.nextStep(timerId);
            
            resultado.innerHTML = `
                <h3>Relatório por Cidades - Pessoas com Frequência (${pessoasUnicas.size} pessoas)</h3>
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; background: #f5f5f5; padding: 15px; border-radius: 5px;">
                        <h4>Top 10 Cidades:</h4>
                        ${top10.map(([cidade, quantidade]) => 
                            `<p>${quantidade} ${cidade}</p>`
                        ).join('')}
                    </div>
                    <div style="flex: 1;">
                        <canvas id="graficoCidades" width="400" height="400"></canvas>
                    </div>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <h4>Todas as Cidades:</h4>
                    ${cidadesOrdenadas.map(([cidade, quantidade]) => 
                        `<p>${quantidade} ${cidade}</p>`
                    ).join('')}
                </div>
            `;
            
            progressTimer.update(timerId, { message: 'Criando gráfico...' });
            progressTimer.nextStep(timerId);
            
            // Criar gráfico de pizza
            setTimeout(() => {
                const canvasElement = document.getElementById('graficoCidades');
                if (canvasElement) {
                    const ctx = canvasElement.getContext('2d');
                        new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: top10.map(([cidade]) => cidade),
                                datasets: [{
                                    data: top10.map(([, quantidade]) => quantidade),
                                    backgroundColor: [
                                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                                        '#4BC0C0', '#FF6384'
                                    ]
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    },
                                    title: {
                                        display: true,
                                        text: 'Top 10 Cidades'
                                    }
                                }
                            }
                        });
                    }
                }, 100);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Salvar dados para exportação
            this.dadosCidades = cidadesOrdenadas;
            const exportBtn = document.getElementById('exportarCidadesPDF');
            if (exportBtn) {
                exportBtn.style.display = 'inline-block';
            }
            
            progressTimer.complete(timerId, { 
                message: `Relatório gerado com ${pessoasUnicas.size} pessoas de ${cidadesOrdenadas.length} cidades!` 
            });
            
        } catch (error) {
            progressTimer.remove(timerId);
            resultado.innerHTML = '<p style="color: red;">Erro ao gerar relatório por cidades</p>';
        }
    }

    exportarCSV() {
        if (!this.dadosRelatorio) return;
        
        const tipoLabels = {
            comum: 'Comum',
            hospital: 'Hospital',
            hospital_acompanhante: 'Hospital Acompanhante',
            pet_tutor: 'Pet - Tutor',
            pet_animal: 'Pet - Animal'
        };
        
        let csv = 'Nome,Tipo,Senha,Data,Registrado em\n';
        
        this.dadosRelatorio.forEach(freq => {
            const dataFormatada = freq.data ? freq.data.split('-').reverse().join('/') : 'N/A';
            const dataRegistro = freq.created_at ? new Date(freq.created_at).toLocaleString('pt-BR') : 'N/A';
            
            csv += `"${freq.nome}","${tipoLabels[freq.tipo]}","${freq.numero_senha}","${dataFormatada}","${dataRegistro}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_frequencia.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    exportarXLS() {
        if (!this.dadosRelatorio) return;
        
        const tipoLabels = {
            comum: 'Comum',
            hospital: 'Hospital',
            hospital_acompanhante: 'Hospital Acompanhante',
            crianca: 'Criança',
            pet_tutor: 'Pet - Tutor',
            pet_animal: 'Pet - Animal'
        };
        
        const dados = this.dadosRelatorio.map(freq => ({
            'Nome': freq.nome,
            'Tipo': tipoLabels[freq.tipo],
            'Senha': freq.numero_senha,
            'Data': freq.data ? freq.data.split('-').reverse().join('/') : 'N/A',
            'Registrado em': freq.created_at ? new Date(freq.created_at).toLocaleString('pt-BR') : 'N/A'
        }));
        
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
        XLSX.writeFile(wb, 'relatorio_frequencia.xlsx');
    }

    /**
     * Exporta os dados para PDF usando jsPDF com formatação aprimorada
     * @returns {Promise<void>}
     */
    async exportarPDF() {
        // Configuração do indicador de carregamento
        const timerId = progressTimer.create({
            title: 'Gerando PDF',
            message: 'Preparando documento...',
            estimatedTime: 10,
            steps: [
                { text: 'Verificando dependências' },
                { text: 'Coletando dados' },
                { text: 'Formatando documento' },
                { text: 'Adicionando conteúdo' },
                { text: 'Finalizando' }
            ]
        });

        try {
            progressTimer.nextStep(timerId, 'Verificando dependências...');
            
            // Verificar se o jsPDF está disponível
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                console.error('jsPDF não encontrado. Tentando carregar...');
                
                // Tentar carregar o jsPDF dinamicamente
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script.onload = () => {
                        window.jspdf = window.jspdf || {};
                        window.jspdf.jsPDF = window.jspdf.jsPDF || {};
                        console.log('jsPDF carregado com sucesso!');
                        resolve();
                    };
                    script.onerror = () => {
                        reject(new Error('Falha ao carregar a biblioteca jsPDF'));
                    };
                    document.head.appendChild(script);
                });
            }
            
            // Verificar novamente após tentativa de carregamento
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                throw new Error('Não foi possível carregar a biblioteca jsPDF. Verifique sua conexão com a internet.');
            }
            
            // Obter os dados do formulário
            progressTimer.nextStep(timerId, 'Coletando dados...');
            const tipo = document.getElementById('tipoRelatorio')?.value || 'Relatório de Frequência';
            const dataInicio = document.getElementById('dataInicio')?.value || '';
            const dataFim = document.getElementById('dataFim')?.value || '';
            const tipoFrequencia = document.getElementById('tipoFrequencia')?.value || '';
            
            progressTimer.nextStep(timerId, 'Buscando dados do relatório...');
            
            // Buscar os dados do relatório
            const response = await fetch(`${this.apiUrl}/exportacao/dados-relatorio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ 
                    tipo, 
                    filtros: {
                        dataInicio: dataInicio || undefined,
                        dataFim: dataFim || undefined,
                        tipo: tipoFrequencia || undefined
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao buscar dados para o relatório');
            }

            const relatorio = await response.json();
            
            progressTimer.nextStep(timerId, 'Criando documento PDF...');
            
            // Usar a biblioteca jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Configurações do documento
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const lineHeight = 7;
            let y = 20;
            
            /**
             * Função auxiliar para adicionar texto com formatação
             * @param {string} text - Texto a ser adicionado
             * @param {number} x - Posição X
             * @param {number} y - Posição Y
             * @param {Object} options - Opções de formatação
             * @returns {number} Nova posição Y após adicionar o texto
             */
            const addText = (text, x, y, options = {}) => {
                const { 
                    maxWidth = pageWidth - 2 * margin, 
                    align = 'left', 
                    fontSize = 12, 
                    fontStyle = 'normal',
                    color = [0, 0, 0]
                } = options;
                
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', fontStyle);
                doc.setTextColor(...color);
                
                // Se o texto for muito grande, dividir em múltiplas linhas
                const splitText = doc.splitTextToSize(String(text), maxWidth);
                doc.text(splitText, x, y, { align, maxWidth });
                
                // Calcular a altura total do texto
                const lineHeight = doc.getTextDimensions('M', { fontSize }).h * 1.2;
                return y + (splitText.length * lineHeight);
            };
            
            /**
             * Adiciona um cabeçalho à página atual
             */
            const addHeader = () => {
                // Adicionar logo (se existir)
                try {
                    const img = document.querySelector('.logo');
                    if (img && img.complete) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const maxWidth = 40;
                        const maxHeight = 20;
                        
                        // Manter a proporção da imagem
                        let width = img.naturalWidth;
                        let height = img.naturalHeight;
                        
                        if (width > maxWidth) {
                            height = (maxWidth / width) * height;
                            width = maxWidth;
                        }
                        
                        if (height > maxHeight) {
                            width = (maxHeight / height) * width;
                            height = maxHeight;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        const imgData = canvas.toDataURL('image/png');
                        doc.addImage(imgData, 'PNG', margin, 10, width, height);
                        return height + 15; // Retorna a posição Y após a imagem
                    }
                } catch (e) {
                    console.warn('Não foi possível adicionar o logo ao PDF:', e);
                }
                
                // Se não houver logo, retorna a posição Y padrão
                return 20;
            };
            
            /**
             * Adiciona o rodapé à página atual
             * @param {number} currentPage - Número da página atual
             * @param {number} totalPages - Total de páginas
             */
            const addFooter = (currentPage, totalPages) => {
                const footerY = pageHeight - 15;
                
                // Linha divisória
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.2);
                doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                
                // Texto do rodapé
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(
                    `Página ${currentPage} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`, 
                    pageWidth / 2, 
                    footerY,
                    { align: 'center' }
                );
                
                doc.text(
                    'Sistema de Frequência - Terra do Bugio',
                    margin,
                    footerY,
                    { align: 'left' }
                );
                
                doc.text(
                    `Relatório: ${tipo}`,
                    pageWidth - margin,
                    footerY,
                    { align: 'right' }
                );
            };
            
            /**
             * Adiciona uma nova página e configura cabeçalho
             * @returns {number} Nova posição Y
             */
            const addNewPage = () => {
                doc.addPage();
                return addHeader();
            };
            
            // Configuração inicial da primeira página
            y = addHeader();
            
            // Título do relatório
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            y = addText(tipo, pageWidth / 2, y, { 
                align: 'center',
                fontSize: 16
            }) + 10;
            
            // Informações do período
            doc.setFontSize(10);
            let periodoTexto = 'Período: ';
            
            if (dataInicio && dataFim) {
                periodoTexto += `De ${new Date(dataInicio).toLocaleDateString('pt-BR')} `;
                periodoTexto += `até ${new Date(dataFim).toLocaleDateString('pt-BR')}`;
            } else if (dataInicio) {
                periodoTexto += `A partir de ${new Date(dataInicio).toLocaleDateString('pt-BR')}`;
            } else if (dataFim) {
                periodoTexto += `Até ${new Date(dataFim).toLocaleDateString('pt-BR')}`;
            } else {
                periodoTexto += 'Período não especificado';
            }
            
            y = addText(periodoTexto, margin, y) + 5;
            
            // Filtros adicionais
            if (tipoFrequencia) {
                y = addText(`Filtro: ${tipoFrequencia}`, margin, y) + 5;
            }
            
            // Linha divisória
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;
            
            progressTimer.nextStep(timerId, 'Adicionando conteúdo ao PDF...');
            
            // Adicionar dados do relatório
            if (relatorio.itens && relatorio.itens.length > 0) {
                // Configuração da tabela
                const colWidths = {
                    nome: (pageWidth - 2 * margin) * 0.4,
                    data: (pageWidth - 2 * margin) * 0.2,
                    tipo: (pageWidth - 2 * margin) * 0.2,
                    cidade: (pageWidth - 2 * margin) * 0.2
                };
                
                // Cabeçalho da tabela
                const drawTableHeader = () => {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(255, 255, 255);
                    
                    // Fundo do cabeçalho
                    doc.setFillColor(51, 122, 183);
                    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
                    
                    // Textos do cabeçalho
                    let x = margin + 5;
                    doc.text('Nome', x, y + 6);
                    x += colWidths.nome;
                    doc.text('Data', x, y + 6);
                    x += colWidths.data;
                    doc.text('Tipo', x, y + 6);
                    x += colWidths.tipo;
                    doc.text('Cidade', x, y + 6);
                    
                    y += 10; // Altura do cabeçalho
                    doc.setTextColor(0, 0, 0); // Voltar cor padrão
                };
                
                // Desenhar o cabeçalho na primeira página
                drawTableHeader();
                
                // Processar itens
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                
                relatorio.itens.forEach((item, index) => {
                    // Verificar se precisa de nova página
                    if (y > pageHeight - 30) {
                        addFooter(doc.internal.getNumberOfPages(), 0); // Páginas totais serão atualizadas depois
                        y = addNewPage();
                        drawTableHeader();
                    }
                    
                    // Linha com fundo alternado para melhor legibilidade
                    if (index % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                        doc.rect(margin, y - 2, pageWidth - 2 * margin, 8, 'F');
                    }
                    
                    // Adicionar célula de nome
                    let x = margin + 5;
                    y = addText(item.nome || 'Não informado', x, y + 6, {
                        maxWidth: colWidths.nome - 5,
                        fontSize: 9
                    }) - 6; // Ajuste para alinhar com as outras células
                    
                    // Adicionar célula de data
                    x += colWidths.nome;
                    const data = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'N/D';
                    doc.text(data, x, y + 6);
                    
                    // Adicionar célula de tipo
                    x += colWidths.data;
                    const tipoLabel = {
                        'comum': 'Comum',
                        'hospital': 'Hospital',
                        'hospital_acompanhante': 'Acompanhante',
                        'crianca': 'Criança',
                        'pet_tutor': 'Pet - Tutor',
                        'pet_animal': 'Pet - Animal'
                    }[item.tipo] || item.tipo || 'Não informado';
                    doc.text(tipoLabel, x, y + 6);
                    
                    // Adicionar célula de cidade
                    x += colWidths.tipo;
                    doc.text(item.cidade || 'Não informado', x, y + 6);
                    
                    y += 8; // Altura da linha
                });
                
                // Adicionar totais
                if (y > pageHeight - 30) {
                    addFooter(doc.internal.getNumberOfPages(), 0);
                    y = addNewPage();
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                y += 10;
                doc.text(`Total de registros: ${relatorio.itens.length}`, margin, y);
                
                // Adicionar resumo se disponível
                if (relatorio.resumo) {
                    y += 10;
                    doc.setFontSize(11);
                    doc.text('Resumo:', margin, y);
                    y += 7;
                    
                    doc.setFontSize(10);
                    Object.entries(relatorio.resumo).forEach(([key, value]) => {
                        y = addText(`• ${key}: ${value}`, margin + 5, y + 5) + 2;
                    });
                }
            } else {
                // Mensagem quando não há dados
                doc.setFontSize(12);
                doc.setFont('helvetica', 'italic');
                y = addText(
                    'Nenhum dado encontrado para os filtros selecionados.', 
                    pageWidth / 2, 
                    y + 20,
                    { align: 'center' }
                );
            }
            
            // Adicionar rodapé em todas as páginas
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                addFooter(i, totalPages);
            }
            
            // Gerar nome do arquivo com data e hora
            const now = new Date();
            const timestamp = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0'),
                String(now.getHours()).padStart(2, '0'),
                String(now.getMinutes()).padStart(2, '0')
            ].join('');
            
            const fileName = `relatorio_${tipo.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.pdf`;
            
            // Salvar o PDF
            progressTimer.nextStep(timerId, 'Finalizando...');
            doc.save(fileName);
            
            progressTimer.complete(timerId, { 
                message: 'Relatório gerado com sucesso!',
                type: 'success'
            });
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            progressTimer.complete(timerId, {
                message: `Erro ao gerar o PDF: ${error.message || 'Erro desconhecido'}`,
                type: 'error'
            });
        }
    }

    async atualizarPessoa() {
        if (!this.pessoaSelecionada) return;
        
        const dadosAtualizados = {
            nome: document.getElementById('editNome').value.trim(),
            cpf: document.getElementById('editCpf').value.trim() || null,
            nascimento: document.getElementById('editNascimento').value || null,
            religiao: document.getElementById('editReligiao').value || null,
            cidade: document.getElementById('editCidade').value.trim() || null,
            estado: document.getElementById('editEstado').value.trim() || null,
            telefone: document.getElementById('editTelefone').value.trim() || null,
            email: document.getElementById('editEmail').value.trim() || null,
            observacao: this.pessoaSelecionada.observacao || null
        };
        
        // Criar temporizador de progresso para atualização
        const timerId = progressTimer.create({
            title: 'Atualizando Dados',
            message: `Salvando alterações de ${this.pessoaSelecionada.nome}...`,
            estimatedTime: 3,
            steps: [
                { text: 'Validando alterações' },
                { text: 'Enviando para servidor' },
                { text: 'Salvando no banco' }
            ]
        });
        
        try {
            progressTimer.nextStep(timerId);
            await new Promise(resolve => setTimeout(resolve, 300));

            progressTimer.update(timerId, { message: 'Enviando dados atualizados...' });
            progressTimer.nextStep(timerId);

            const response = await fetch(`${this.apiUrl}/pessoas/${this.pessoaSelecionada.id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(dadosAtualizados)
            });
            
            if (response.ok) {
                progressTimer.update(timerId, { message: 'Finalizando atualização...' });
                progressTimer.nextStep(timerId);
                
                await new Promise(resolve => setTimeout(resolve, 200));
                
                progressTimer.complete(timerId, { 
                    message: 'Dados atualizados com sucesso!' 
                });
                
                // Atualizar dados locais
                Object.assign(this.pessoaSelecionada, dadosAtualizados);
            } else {
                const errorData = await response.json();
                progressTimer.remove(timerId);
                alert(errorData.error || 'Erro ao atualizar dados');
            }
        } catch (error) {
            console.error('Erro ao atualizar pessoa:', error);
            progressTimer.remove(timerId);
            alert('Erro ao atualizar dados');
        }
    }

    async gerarRelatorioMensal() {
        const resultado = document.getElementById('relatorioResultado');
        resultado.innerHTML = '<p>Carregando...</p>';
        
        try {
            const response = await fetch(`${this.apiUrl}/frequencias`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar frequências');
            }
            
            const frequencias = await response.json();
            
            // Contar frequências por mês
            const meses = {
                '01': { nome: 'Janeiro', count: 0 },
                '02': { nome: 'Fevereiro', count: 0 },
                '03': { nome: 'Março', count: 0 },
                '04': { nome: 'Abril', count: 0 },
                '05': { nome: 'Maio', count: 0 },
                '06': { nome: 'Junho', count: 0 },
                '07': { nome: 'Julho', count: 0 },
                '08': { nome: 'Agosto', count: 0 },
                '09': { nome: 'Setembro', count: 0 },
                '10': { nome: 'Outubro', count: 0 },
                '11': { nome: 'Novembro', count: 0 },
                '12': { nome: 'Dezembro', count: 0 }
            };
            
            frequencias.forEach(freq => {
                if (freq.data) {
                    const mes = freq.data.substring(5, 7); // Extrai o mês da data YYYY-MM-DD
                    if (meses[mes]) {
                        meses[mes].count++;
                    }
                }
            });
            
            const dadosMeses = Object.entries(meses).map(([num, dados]) => [dados.nome, dados.count]);
            
            resultado.innerHTML = `
                <h3>Relatório Mensal - Frequências por Mês (${frequencias.length} registros)</h3>
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; background: #f5f5f5; padding: 15px; border-radius: 5px;">
                        <h4>Frequências por Mês:</h4>
                        ${dadosMeses.map(([mes, quantidade]) => 
                            `<p><strong>${mes}:</strong> ${quantidade} frequências</p>`
                        ).join('')}
                    </div>
                    <div style="flex: 1;">
                        <canvas id="graficoMensal" width="400" height="400"></canvas>
                    </div>
                </div>
            `;
            
            // Criar gráfico de pizza
            setTimeout(() => {
                const canvasElement = document.getElementById('graficoMensal');
                if (canvasElement) {
                    const ctx = canvasElement.getContext('2d');
                        new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: dadosMeses.map(([mes]) => mes),
                                datasets: [{
                                    data: dadosMeses.map(([, quantidade]) => quantidade),
                                    backgroundColor: [
                                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
                                    ]
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    },
                                    title: {
                                        display: true,
                                        text: 'Frequências por Mês do Ano'
                                    }
                                }
                            }
                        });
                    }
                }, 100);
            
            // Salvar dados para exportação
            this.dadosMensal = dadosMeses;
            const exportMensalBtn = document.getElementById('exportarMensalPDF');
            if (exportMensalBtn) {
                exportMensalBtn.style.display = 'inline-block';
            }
        } catch (error) {
            resultado.innerHTML = '<p style="color: red;">Erro ao gerar relatório mensal</p>';
        }
    }

    exportarMensalPDF() {
        if (!this.dadosMensal) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Logo
        try {
            const img = document.querySelector('.logo');
            if (img && img.complete) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                doc.addImage(imgData, 'JPEG', 160, 10, 30, 15);
            }
        } catch (e) {
            console.log('Logo não pôde ser adicionado');
        }
        
        // Título
        doc.setFontSize(16);
        doc.text('Relatório Mensal', 20, 20);
        doc.setFontSize(10);
        doc.text('Terra do Bugio', 20, 30);
        
        // Cabeçalho da tabela
        let y = 45;
        doc.text('Mês', 20, y);
        doc.text('Frequências', 120, y);
        doc.line(20, y + 2, 150, y + 2);
        y += 10;
        
        // Dados
        this.dadosMensal.forEach(([mes, quantidade]) => {
            doc.text(mes, 20, y);
            doc.text(quantidade.toString(), 120, y);
            y += 8;
        });
        
        doc.save('relatorio_mensal.pdf');
    }

    exportarCidadesPDF() {
        if (!this.dadosCidades) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Logo
        try {
            const img = document.querySelector('.logo');
            if (img && img.complete) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                doc.addImage(imgData, 'JPEG', 160, 10, 30, 15);
            }
        } catch (e) {
            console.log('Logo não pôde ser adicionado');
        }
        
        // Título
        doc.setFontSize(16);
        doc.text('Relatório por Cidades', 20, 20);
        doc.setFontSize(10);
        doc.text('Terra do Bugio', 20, 30);
        
        // Cabeçalho da tabela
        let y = 45;
        doc.text('Cidade', 20, y);
        doc.text('Quantidade', 120, y);
        doc.line(20, y + 2, 150, y + 2);
        y += 10;
        
        // Dados
        this.dadosCidades.forEach(([cidade, quantidade]) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
                doc.text('Cidade', 20, y);
                doc.text('Quantidade', 120, y);
                doc.line(20, y + 2, 150, y + 2);
                y += 10;
            }
            
            doc.text(cidade, 20, y);
            doc.text(quantidade.toString(), 120, y);
            y += 8;
        });
        
        doc.save('relatorio_cidades.pdf');
    }

    setupEstadosCidades() {
        // Evento para o select de estado no cadastro
        const estadoSelect = document.getElementById('estado');
        if (estadoSelect) {
            estadoSelect.addEventListener('change', (e) => {
                this.carregarCidades('cidade', e.target.value, estadosCidades);
            });
        }

        // Evento para o select de estado na edição (se existir)
        const editEstadoSelect = document.getElementById('editEstado');
        if (editEstadoSelect) {
            editEstadoSelect.addEventListener('change', (e) => {
                this.carregarCidades('editCidade', e.target.value, estadosCidades);
            });
        }
    }

    carregarCidades(selectId, estado, cidades) {
        const selectCidade = document.getElementById(selectId);
        
        // Verificar se o select existe antes de manipulá-lo
        if (!selectCidade) {
            console.warn(`Elemento com ID '${selectId}' não encontrado.`);
            return;
        }
        
        // Limpar o select e adicionar a opção padrão
        selectCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
        
        // Adicionar as cidades do estado selecionado, se houver
        if (estado && cidades[estado]) {
            cidades[estado].forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade;
                option.textContent = cidade;
                selectCidade.appendChild(option);
            });
        }
    }
}

// Inicializar sistema
const sistema = new SistemaFrequencia();