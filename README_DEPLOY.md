# Deploy no Vercel - Sistema Terra do Bugio

## Passos para publicar:

### 1. Preparar o repositório GitHub
```bash
git add .
git commit -m "Preparado para deploy no Vercel"
git push origin main
```

### 2. No Vercel.com
1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione o repositório do Sistema_Frequencia
5. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (deixe vazio)
   - Output Directory: ./
   - Install Command: npm install

### 3. Variáveis de ambiente (se necessário)
- NODE_ENV=production

### 4. Limitações do SQLite no Vercel
⚠️ **IMPORTANTE**: O Vercel é serverless e não mantém arquivos entre execuções.
Para produção, recomenda-se:
- PostgreSQL (Supabase, Neon, etc.)
- MongoDB Atlas
- PlanetScale (MySQL)

### 5. Alternativa com banco em memória
O sistema funcionará, mas os dados serão perdidos a cada deploy.

## URLs após deploy:
- Frontend: https://seu-projeto.vercel.app
- API: https://seu-projeto.vercel.app/api

## Estrutura preparada:
- ✅ vercel.json configurado
- ✅ package.json na raiz
- ✅ API URL dinâmica
- ✅ .gitignore atualizado