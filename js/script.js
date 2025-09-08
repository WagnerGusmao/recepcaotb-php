class SistemaFrequencia {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.pessoas = [];
        this.frequencias = [];
        this.pessoaSelecionada = null;
        this.init();
        this.carregarPessoas();
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
        const form = document.getElementById('formCadastro');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.cadastrarPessoa();
        });

        // Máscara para CPF
        document.getElementById('cpf').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });

        // Máscara para telefone
        document.getElementById('telefone').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });

        // Máscara para CEP e busca automática
        document.getElementById('cep').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
            
            if (value.length === 9) {
                this.buscarCEP(value.replace('-', ''));
            }
        });

        // Máscara para Estado (2 caracteres maiúsculos)
        document.getElementById('estado').addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
            if (value.length > 2) value = value.substring(0, 2);
            e.target.value = value;
        });

        // Validação em tempo real
        const campos = ['nome', 'cpf', 'nascimento', 'sexo', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'telefone', 'email'];
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
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
        });
    }

    async cadastrarPessoa() {
        if (!this.validarFormulario()) {
            return;
        }

        const pessoa = {
            nome: document.getElementById('nome').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            nascimento: document.getElementById('nascimento').value,
            sexo: document.getElementById('sexo').value,
            endereco: {
                cep: document.getElementById('cep').value.trim(),
                rua: document.getElementById('rua').value.trim(),
                numero: document.getElementById('numero').value.trim(),
                complemento: document.getElementById('complemento').value.trim(),
                bairro: document.getElementById('bairro').value.trim(),
                cidade: document.getElementById('cidade').value.trim(),
                estado: document.getElementById('estado').value.trim()
            },
            contato: {
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim()
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}/pessoas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pessoa)
            });
            
            if (response.ok) {
                this.mostrarMensagem('Pessoa cadastrada com sucesso!');
                document.getElementById('formCadastro').reset();
                this.limparErros();
                this.carregarPessoas();
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            alert('Erro ao cadastrar pessoa');
        }
    }

    setupFrequencia() {
        const buscaPessoa = document.getElementById('buscaPessoa');
        buscaPessoa.addEventListener('input', (e) => {
            this.buscarPessoa(e.target.value);
        });

        document.getElementById('marcarFrequencia').addEventListener('click', () => {
            this.marcarFrequencia();
        });

        // Definir data atual como padrão
        document.getElementById('dataFrequencia').value = new Date().toISOString().split('T')[0];
    }

    buscarPessoa(termo) {
        const resultado = document.getElementById('resultadoBusca');
        
        if (termo.length < 2) {
            resultado.innerHTML = '';
            return;
        }

        const pessoasEncontradas = this.pessoas.filter(pessoa => {
            const nomeMatch = pessoa.nome.toLowerCase().includes(termo.toLowerCase());
            const cpfLimpo = pessoa.cpf.replace(/[^\d]/g, '');
            const termoLimpo = termo.replace(/[^\d]/g, '');
            const cpfMatch = pessoa.cpf.includes(termo) || cpfLimpo.includes(termoLimpo);
            return nomeMatch || cpfMatch;
        });

        resultado.innerHTML = pessoasEncontradas.map(pessoa => 
            `<div class="pessoa-item" onclick="sistema.selecionarPessoa(${pessoa.id})">
                ${pessoa.nome} - ${pessoa.cpf}
            </div>`
        ).join('');
    }

    selecionarPessoa(id) {
        this.pessoaSelecionada = this.pessoas.find(p => p.id === id);
        document.getElementById('nomePessoa').textContent = this.pessoaSelecionada.nome;
        document.getElementById('formFrequencia').style.display = 'block';
        document.getElementById('resultadoBusca').innerHTML = '';
        document.getElementById('buscaPessoa').value = this.pessoaSelecionada.nome;
        
        // Definir data atual
        document.getElementById('dataFrequencia').value = new Date().toISOString().split('T')[0];
    }

    async marcarFrequencia() {
        const tipoPresenca = document.querySelector('input[name="tipoPresenca"]:checked');
        const numeroSenha = document.getElementById('numeroSenha').value;
        const dataFrequencia = document.getElementById('dataFrequencia').value;

        if (!tipoPresenca || !numeroSenha || !dataFrequencia || !this.pessoaSelecionada) {
            alert('Preencha todos os campos!');
            return;
        }

        const frequencia = {
            pessoaId: this.pessoaSelecionada.id,
            tipo: tipoPresenca.value,
            numeroSenha: parseInt(numeroSenha),
            data: dataFrequencia
        };

        try {
            const response = await fetch(`${this.apiUrl}/frequencias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(frequencia)
            });
            
            if (response.ok) {
                this.mostrarMensagem('Frequência marcada com sucesso!');
                
                // Limpar formulário
                document.querySelector('input[name="tipoPresenca"]:checked').checked = false;
                document.getElementById('numeroSenha').value = '';
                document.getElementById('formFrequencia').style.display = 'none';
                document.getElementById('buscaPessoa').value = '';
                this.pessoaSelecionada = null;
            } else {
                alert('Erro ao registrar frequência');
            }
        } catch (error) {
            alert('Erro ao registrar frequência');
        }
    }

    setupRelatorio() {
        document.getElementById('gerarRelatorio').addEventListener('click', () => {
            this.gerarRelatorio();
        });
    }

    async gerarRelatorio() {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const filtroTipo = document.getElementById('filtroTipo').value;

        const params = new URLSearchParams();
        if (dataInicio) params.append('dataInicio', dataInicio);
        if (dataFim) params.append('dataFim', dataFim);
        if (filtroTipo) params.append('tipo', filtroTipo);

        try {
            const response = await fetch(`${this.apiUrl}/frequencias?${params}`);
            const frequencias = await response.json();
            this.exibirRelatorio(frequencias);
        } catch (error) {
            alert('Erro ao gerar relatório');
        }
    }

    exibirRelatorio(frequencias) {
        const resultado = document.getElementById('relatorioResultado');
        
        if (frequencias.length === 0) {
            resultado.innerHTML = '<p>Nenhuma frequência encontrada para os filtros selecionados.</p>';
            return;
        }

        const tipoLabels = {
            comum: 'Comum',
            hospital: 'Hospital',
            hospital_acompanhante: 'Hospital Acompanhante',
            pet: 'Pet'
        };

        resultado.innerHTML = `
            <h3>Relatório de Frequência (${frequencias.length} registros)</h3>
            ${frequencias.map(freq => `
                <div class="relatorio-item tipo-${freq.tipo}">
                    <strong>${freq.nome}</strong><br>
                    Tipo: ${tipoLabels[freq.tipo]}<br>
                    Senha: ${freq.numero_senha || 'N/A'}<br>
                    Data: ${freq.data.split('-').reverse().join('/')}<br>
                    Registrado em: ${new Date(freq.created_at).toLocaleString('pt-BR')}
                </div>
            `).join('')}
        `;
    }

    validarFormulario() {
        this.limparErros();
        let valido = true;
        
        const campos = [
            { id: 'nome', nome: 'Nome' },
            { id: 'cpf', nome: 'CPF' },
            { id: 'nascimento', nome: 'Data de nascimento' },
            { id: 'sexo', nome: 'Sexo' },
            { id: 'cep', nome: 'CEP' },
            { id: 'rua', nome: 'Rua' },
            { id: 'numero', nome: 'Número' },
            { id: 'bairro', nome: 'Bairro' },
            { id: 'cidade', nome: 'Cidade' },
            { id: 'estado', nome: 'Estado' },
            { id: 'telefone', nome: 'Telefone' },
            { id: 'email', nome: 'E-mail' }
        ];

        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            const valor = elemento.value.trim();
            
            if (!valor) {
                this.mostrarErro(elemento, `${campo.nome} é obrigatório`);
                valido = false;
            } else {
                // Validação mínimo 3 caracteres para campos de texto
                if (['nome', 'rua', 'bairro', 'cidade'].includes(campo.id) && valor.length < 3) {
                    this.mostrarErro(elemento, `${campo.nome} deve ter pelo menos 3 caracteres`);
                    valido = false;
                }
                // Validação estado deve ter 2 caracteres
                if (campo.id === 'estado' && valor.length !== 2) {
                    this.mostrarErro(elemento, 'Estado deve ter exatamente 2 caracteres');
                    valido = false;
                }
                // Validação data não futura
                if (campo.id === 'nascimento' && new Date(valor) > new Date()) {
                    this.mostrarErro(elemento, 'Data de nascimento não pode ser futura');
                    valido = false;
                }
                // Validações específicas
                if (campo.id === 'cpf' && !this.validarCPF(valor)) {
                    this.mostrarErro(elemento, 'CPF inválido');
                    valido = false;
                }
                if (campo.id === 'email' && !this.validarEmail(valor)) {
                    this.mostrarErro(elemento, 'E-mail inválido');
                    valido = false;
                }
            }
        });

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
            sexo: 'Sexo',
            cep: 'CEP',
            rua: 'Rua',
            numero: 'Número',
            bairro: 'Bairro',
            cidade: 'Cidade',
            estado: 'Estado',
            telefone: 'Telefone',
            email: 'E-mail'
        };

        // Remove erro anterior
        elemento.classList.remove('error');
        const errorMsg = elemento.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();

        if (!valor) {
            this.mostrarErro(elemento, `${nomesCampos[elemento.id]} é obrigatório`);
            return false;
        }

        // Validação mínimo 3 caracteres
        if (['nome', 'rua', 'bairro', 'cidade'].includes(elemento.id) && valor.length < 3) {
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

        return true;
    }

    async carregarPessoas() {
        try {
            const response = await fetch(`${this.apiUrl}/pessoas`);
            this.pessoas = await response.json();
        } catch (error) {
            console.error('Erro ao carregar pessoas:', error);
        }
    }

    async buscarCEP(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('rua').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('estado').value = data.uf || '';
                
                // Focar no campo número
                document.getElementById('numero').focus();
            } else {
                alert('CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
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

    // Método removido - dados salvos no backend
}

// Inicializar sistema
const sistema = new SistemaFrequencia();