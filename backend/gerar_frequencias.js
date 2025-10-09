const db = require('./database');

console.log('Gerando 458 registros de frequência aleatórios...');

// Buscar todas as pessoas
db.all('SELECT id FROM pessoas', (err, pessoas) => {
    if (err) {
        console.error('Erro ao buscar pessoas:', err);
        return;
    }
    
    if (pessoas.length === 0) {
        console.log('Nenhuma pessoa encontrada no banco');
        return;
    }
    
    console.log(`Encontradas ${pessoas.length} pessoas`);
    
    const tipos = ['comum', 'hospital', 'hospital_acompanhante', 'crianca', 'pet_tutor', 'pet_animal'];
    const dataAtual = new Date().toISOString().split('T')[0];
    
    let contador = 0;
    
    for (let i = 0; i < 458; i++) {
        const pessoaAleatoria = pessoas[Math.floor(Math.random() * pessoas.length)];
        const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
        const senhaAleatoria = Math.floor(Math.random() * 999) + 1;
        
        const sql = 'INSERT INTO frequencias (pessoa_id, tipo, numero_senha, data) VALUES (?, ?, ?, ?)';
        
        db.run(sql, [pessoaAleatoria.id, tipoAleatorio, senhaAleatoria, dataAtual], function(err) {
            if (err) {
                console.error('Erro ao inserir:', err);
            } else {
                contador++;
                if (contador % 50 === 0) {
                    console.log(`${contador} registros inseridos...`);
                }
                
                if (contador === 458) {
                    console.log('✅ 458 registros de frequência gerados com sucesso!');
                    process.exit(0);
                }
            }
        });
    }
});