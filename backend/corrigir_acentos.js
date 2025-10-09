const db = require('./database');

function corrigirAcentos(texto) {
    if (!texto) return texto;
    
    const correções = {
        'SO PAULO': 'SÃO PAULO',
        'SO ROQUE': 'SÃO ROQUE',
        'SO BERNARDO DO CAMPO': 'SÃO BERNARDO DO CAMPO',
        'SO CAETANO DO SUL': 'SÃO CAETANO DO SUL',
        'SO VICENTE': 'SÃO VICENTE',
        'SO JOSE DOS CAMPOS': 'SÃO JOSÉ DOS CAMPOS',
        'SO JOSE DO RIO PRETO': 'SÃO JOSÉ DO RIO PRETO',
        'SO CARLOS': 'SÃO CARLOS',
        'SO JOAO DE MERITI': 'SÃO JOÃO DE MERITI',
        'SO GONCALO': 'SÃO GONÇALO',
        'RIBEIRAO PRETO': 'RIBEIRÃO PRETO',
        'BRASILIA': 'BRASÍLIA',
        'GOIANIA': 'GOIÂNIA',
        'BELO HORIZONTE': 'BELO HORIZONTE',
        'CURITIBA': 'CURITIBA',
        'FLORIANOPOLIS': 'FLORIANÓPOLIS',
        'JOAO PESSOA': 'JOÃO PESSOA',
        'SAO LUIS': 'SÃO LUÍS',
        'MACEIO': 'MACEIÓ',
        'VITORIA': 'VITÓRIA',
        'CAMPO GRANDE': 'CAMPO GRANDE',
        'CUIABA': 'CUIABÁ',
        'PORTO ALEGRE': 'PORTO ALEGRE',
        'TERESINA': 'TERESINA',
        'NATAL': 'NATAL',
        'ARACAJU': 'ARACAJU',
        'PALMAS': 'PALMAS',
        'RIO BRANCO': 'RIO BRANCO',
        'BOA VISTA': 'BOA VISTA',
        'MACAPA': 'MACAPÁ',
        'PORTO VELHO': 'PORTO VELHO',
        'MANAUS': 'MANAUS',
        'BELEM': 'BELÉM'
    };
    
    let textoCorrigido = texto.toUpperCase();
    
    Object.keys(correções).forEach(erro => {
        textoCorrigido = textoCorrigido.replace(new RegExp(erro, 'g'), correções[erro]);
    });
    
    return textoCorrigido;
}

async function corrigirCidades() {
    return new Promise((resolve, reject) => {
        db.all('SELECT DISTINCT cidade FROM pessoas WHERE cidade IS NOT NULL', [], (err, cidades) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`📍 Corrigindo ${cidades.length} cidades únicas...`);
            
            let corrigidas = 0;
            
            cidades.forEach(async (row, index) => {
                const cidadeOriginal = row.cidade;
                const cidadeCorrigida = corrigirAcentos(cidadeOriginal);
                
                if (cidadeOriginal !== cidadeCorrigida) {
                    await new Promise((res, rej) => {
                        db.run('UPDATE pessoas SET cidade = ? WHERE cidade = ?', 
                               [cidadeCorrigida, cidadeOriginal], (err) => {
                            if (err) rej(err);
                            else {
                                console.log(`✅ ${cidadeOriginal} → ${cidadeCorrigida}`);
                                corrigidas++;
                                res();
                            }
                        });
                    });
                }
                
                if (index === cidades.length - 1) {
                    console.log(`🎯 ${corrigidas} cidades corrigidas`);
                    resolve(corrigidas);
                }
            });
        });
    });
}

async function corrigirNomes() {
    return new Promise((resolve, reject) => {
        // Correções específicas para nomes
        const correcoesNomes = [
            ['JOSE', 'JOSÉ'],
            ['JOAO', 'JOÃO'],
            ['ANTONIO', 'ANTÔNIO'],
            ['MARIA', 'MARIA'],
            ['ANA', 'ANA'],
            ['PAULO', 'PAULO'],
            ['CARLOS', 'CARLOS'],
            ['FRANCISCO', 'FRANCISCO'],
            ['PEDRO', 'PEDRO'],
            ['LUIS', 'LUÍS'],
            ['MARCOS', 'MARCOS'],
            ['RAFAEL', 'RAFAEL'],
            ['DANIEL', 'DANIEL'],
            ['BRUNO', 'BRUNO'],
            ['EDUARDO', 'EDUARDO'],
            ['FERNANDO', 'FERNANDO'],
            ['GABRIEL', 'GABRIEL'],
            ['GUSTAVO', 'GUSTAVO'],
            ['HENRIQUE', 'HENRIQUE'],
            ['LEONARDO', 'LEONARDO'],
            ['MARCELO', 'MARCELO'],
            ['RICARDO', 'RICARDO'],
            ['RODRIGO', 'RODRIGO'],
            ['THIAGO', 'THIAGO'],
            ['VINICIUS', 'VINÍCIUS'],
            ['ANDRE', 'ANDRÉ'],
            ['CESAR', 'CÉSAR'],
            ['FABIO', 'FÁBIO'],
            ['LUCIO', 'LÚCIO'],
            ['MARCIO', 'MÁRCIO'],
            ['SERGIO', 'SÉRGIO'],
            ['TARCISIO', 'TARCÍSIO'],
            ['VALERIA', 'VALÉRIA'],
            ['MONICA', 'MÔNICA'],
            ['ANDREA', 'ANDRÉA'],
            ['PATRICIA', 'PATRÍCIA'],
            ['CLAUDIA', 'CLÁUDIA'],
            ['LUCIANA', 'LUCIANA'],
            ['ADRIANA', 'ADRIANA'],
            ['JULIANA', 'JULIANA'],
            ['FERNANDA', 'FERNANDA'],
            ['CAROLINA', 'CAROLINA'],
            ['BEATRIZ', 'BEATRIZ'],
            ['LETICIA', 'LETÍCIA'],
            ['PRISCILA', 'PRISCILA'],
            ['VANESSA', 'VANESSA'],
            ['CRISTINA', 'CRISTINA'],
            ['SIMONE', 'SIMONE'],
            ['RENATA', 'RENATA'],
            ['SANDRA', 'SANDRA'],
            ['SILVIA', 'SÍLVIA'],
            ['TATIANA', 'TATIANA'],
            ['VIVIANE', 'VIVIANE']
        ];
        
        let totalCorrigidos = 0;
        
        const processarCorrecao = async (index) => {
            if (index >= correcoesNomes.length) {
                console.log(`🎯 ${totalCorrigidos} nomes corrigidos`);
                resolve(totalCorrigidos);
                return;
            }
            
            const [nomeErrado, nomeCorreto] = correcoesNomes[index];
            
            db.run(`UPDATE pessoas SET nome = REPLACE(nome, ?, ?) WHERE nome LIKE ?`, 
                   [nomeErrado, nomeCorreto, `%${nomeErrado}%`], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (this.changes > 0) {
                    console.log(`✅ ${nomeErrado} → ${nomeCorreto} (${this.changes} registros)`);
                    totalCorrigidos += this.changes;
                }
                
                processarCorrecao(index + 1);
            });
        };
        
        console.log('📝 Corrigindo nomes...');
        processarCorrecao(0);
    });
}

async function executar() {
    try {
        console.log('🔧 Iniciando correção de acentos...');
        
        await corrigirCidades();
        await corrigirNomes();
        
        console.log('✅ Correção de acentos concluída!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

if (require.main === module) {
    executar();
}

module.exports = { corrigirAcentos, corrigirCidades, corrigirNomes };