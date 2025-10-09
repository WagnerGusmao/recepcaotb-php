const fetch = require('node-fetch');

async function testarServidor() {
    console.log('🔍 Testando servidor...\n');
    
    try {
        // Testar rota de pessoas
        const response = await fetch('http://localhost:3000/api/pessoas?busca=MARIA');
        console.log('Status:', response.status);
        console.log('Headers:', response.headers.raw());
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dados recebidos:', data.length, 'pessoas');
            console.log('Primeiras 3:', data.slice(0, 3));
        } else {
            console.log('Erro na resposta:', await response.text());
        }
    } catch (error) {
        console.error('Erro de conexão:', error.message);
    }
}

testarServidor();