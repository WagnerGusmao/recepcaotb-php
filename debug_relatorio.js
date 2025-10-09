// Teste direto da função de relatório
async function testarRelatorio() {
    const apiUrl = 'http://localhost:3000/api';
    
    try {
        console.log('Testando endpoint de frequências...');
        const response = await fetch(`${apiUrl}/frequencias`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const frequencias = await response.json();
        console.log('Frequências encontradas:', frequencias);
        
        if (frequencias.length === 0) {
            console.log('Nenhuma frequência encontrada');
        } else {
            console.log(`${frequencias.length} frequências encontradas`);
            frequencias.forEach((freq, index) => {
                console.log(`${index + 1}:`, {
                    nome: freq.nome,
                    tipo: freq.tipo,
                    senha: freq.numero_senha,
                    data: freq.data
                });
            });
        }
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Executar teste
testarRelatorio();