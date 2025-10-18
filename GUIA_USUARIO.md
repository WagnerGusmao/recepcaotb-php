# 👤 Guia do Usuário - Sistema Terra do Bugio

Manual completo para utilização do Sistema de Recepção Terra do Bugio.

> **🎉 Versão 1.1.0**: Sistema com interface melhorada, formulários padronizados e base de dados limpa para melhor experiência do usuário!

## 📋 Índice

- [Primeiros Passos](#primeiros-passos)
- [Cadastro de Pessoas](#cadastro-de-pessoas)
- [Registro de Frequência](#registro-de-frequência)
- [Relatórios](#relatórios)
- [Gerenciamento de Usuários](#gerenciamento-de-usuários)
- [Sistema de Duplicatas](#sistema-de-duplicatas)
- [Configurações](#configurações)
- [Dicas e Truques](#dicas-e-truques)
- [Perguntas Frequentes](#perguntas-frequentes)

## 🚀 Primeiros Passos

### Acessando o Sistema
1. **Abra seu navegador** (Chrome, Firefox, Edge)
2. **Digite o endereço**: http://localhost:3000
3. **Você verá a página inicial** com o formulário de cadastro

### Fazendo Login no Painel Administrativo
1. **Na página inicial**, clique em **"Entrar no Sistema"**
2. **Digite suas credenciais**:
   - Email: seu email de usuário
   - Senha: sua senha
3. **Clique em "Entrar"**
4. **Você será direcionado** para o painel administrativo

### Credenciais Padrão (Administrador)
- **Email**: admin@terradobugio.com
- **Senha**: admin123

⚠️ **Importante**: Altere a senha padrão no primeiro acesso!

### Interface do Painel
O painel administrativo possui um menu com as seguintes opções:
- **🏠 Início**: Página principal
- **📊 Frequência**: Registro de presenças
- **👤 Cadastrar Pessoa**: Novo cadastro no painel
- **📈 Relatórios**: Visualização e exportação de dados
- **👥 Usuários**: Gerenciamento de usuários (apenas admins)
- **🔍 Duplicatas**: Sistema de detecção e mesclagem
- **⚙️ Configurações**: Perfil e configurações pessoais

## 👥 Cadastro de Pessoas

### Cadastro na Página Principal

#### Acessando o Formulário
1. **Acesse**: http://localhost:3000
2. **Você verá o formulário** de cadastro na página inicial

#### Preenchendo os Dados

##### Campos Obrigatórios
- **Nome Completo**: Digite o nome completo da pessoa
  - Mínimo 3 caracteres
  - Apenas letras e espaços

##### Campos Opcionais
- **CPF**: Digite apenas números (máscara automática)
  - Formato: 000.000.000-00
  - Validação automática do algoritmo
  - Deve ser único no sistema

- **Data de Nascimento**: Selecione no calendário
  - Formato: DD/MM/AAAA

- **Religião**: Digite a religião da pessoa
  - Campo texto livre

- **Cidade**: Digite a cidade
  - Campo texto livre

- **Estado**: Selecione no dropdown
  - Lista com todos os estados brasileiros

- **Telefone**: Digite o telefone (máscara automática)
  - Formato: (00) 00000-0000
  - Aceita celular e fixo

- **E-mail**: Digite o email
  - Validação de formato automática
  - Exemplo: nome@email.com

- **Indicação**: Como soube do local
  - Campo texto livre
  - Ex: "Amigo", "Internet", "Panfleto"

- **Observações**: Informações adicionais
  - Campo texto longo
  - Ex: "Primeira visita", "Tem dificuldade de locomoção"

#### Finalizando o Cadastro
1. **Preencha os campos** desejados
2. **Clique em "Cadastrar"**
3. **Aguarde a confirmação** (aparecerá mensagem verde)
4. **O formulário será limpo** automaticamente

### Cadastro no Painel Administrativo

#### Acessando o Formulário
1. **Faça login** no painel administrativo
2. **Clique em "👤 Cadastrar Pessoa"** no menu
3. **Preencha o formulário** (mesmos campos da página principal)
4. **Clique em "Cadastrar Pessoa"**

#### Vantagens do Cadastro no Painel
- ✅ **Não precisa sair** do painel administrativo
- ✅ **Mesmas validações** da página principal
- ✅ **Interface consistente** com o sistema
- ✅ **Disponível para todos** os usuários logados

### Editando Pessoas Cadastradas

#### Buscando a Pessoa
1. **No painel**, clique em **"📊 Frequência"**
2. **Digite o nome ou CPF** no campo de busca
3. **Clique em "Buscar"**
4. **Selecione a pessoa** na lista de resultados

#### Editando os Dados
1. **Os dados aparecerão** nos campos do formulário
2. **Altere as informações** desejadas
3. **Clique em "Atualizar Dados"**
4. **Confirme a atualização**

## 📊 Registro de Frequência

### Acessando o Sistema de Frequência
1. **No painel**, clique em **"📊 Frequência"**
2. **Você verá a interface** de registro de frequência

### Buscando uma Pessoa

#### Métodos de Busca
- **Por Nome**: Digite parte do nome
- **Por CPF**: Digite o CPF completo ou parcial
- **Por Cidade**: Digite a cidade

#### Realizando a Busca
1. **Digite o termo** no campo "Buscar pessoa"
2. **Clique em "Buscar"** ou pressione Enter
3. **Selecione a pessoa** na lista de resultados
4. **Os dados aparecerão** no formulário

### Registrando a Frequência

#### Tipos de Frequência Disponíveis
- **Geral**: Atendimento padrão
- **Hospital**: Atendimento hospitalar
- **Hospital Acompanhante**: Acompanhando alguém no hospital
- **Pet Tutor**: Tutor trazendo pet para atendimento
- **Pet**: Atendimento direto do pet

#### Preenchendo o Registro
1. **Selecione o tipo** de frequência
2. **Digite o número da senha** (obrigatório)
3. **Para tipo "Pet Tutor"**:
   - Digite também a senha do tutor
   - Digite a senha do pet
4. **A data** será preenchida automaticamente (hoje)
5. **Clique em "Registrar Frequência"**

#### Validações Automáticas
- ✅ **Pessoa deve existir** no sistema
- ✅ **Número da senha** é obrigatório
- ✅ **Não permite duplicatas** na mesma data
- ✅ **Senhas específicas** para pet tutor/pet

### Mensagens do Sistema
- **Verde**: Frequência registrada com sucesso
- **Amarelo**: Aviso (ex: pessoa já tem frequência hoje)
- **Vermelho**: Erro (ex: dados inválidos)

## 📈 Relatórios

### Acessando os Relatórios
1. **No painel**, clique em **"📈 Relatórios"**
2. **Escolha o tipo** de relatório desejado

### Tipos de Relatórios Disponíveis

#### 1. Relatório Geral
**Descrição**: Lista todas as frequências com filtros

**Filtros Disponíveis**:
- **Data Início**: Filtrar a partir de uma data
- **Data Fim**: Filtrar até uma data
- **Tipo de Frequência**: Filtrar por tipo específico
- **Pessoa**: Filtrar por pessoa específica

**Como Usar**:
1. **Selecione os filtros** desejados
2. **Clique em "Gerar Relatório"**
3. **Visualize os dados** na tela
4. **Exporte** se necessário

#### 2. Relatório Mensal
**Descrição**: Estatísticas agrupadas por mês

**Informações Mostradas**:
- Total de frequências por mês
- Distribuição por tipo de atendimento
- Gráficos de evolução mensal
- Comparativo entre meses

#### 3. Relatório de Contatos
**Descrição**: Lista pessoas com dados de contato

**Informações Incluídas**:
- Nome completo
- Telefone
- E-mail
- Cidade/Estado
- Data do último cadastro

**Utilidade**: Para campanhas de comunicação

#### 4. Relatório por Cidades
**Descrição**: Distribuição geográfica dos atendimentos

**Informações Mostradas**:
- Total de pessoas por cidade
- Total de frequências por região
- Ranking de cidades mais ativas
- Mapa de distribuição

#### 5. Relatório de Cadastros
**Descrição**: Estatísticas gerais do sistema

**Informações Incluídas**:
- Total de pessoas cadastradas
- Crescimento de cadastros por período
- Dados demográficos básicos
- Estatísticas de utilização

### Exportando Relatórios

#### Formatos Disponíveis
- **PDF**: Para impressão e apresentações
- **CSV**: Para planilhas (Excel, Google Sheets)
- **XLSX**: Formato Excel nativo

#### Como Exportar
1. **Gere o relatório** desejado
2. **Clique no botão** do formato desejado
3. **O arquivo será baixado** automaticamente
4. **Abra o arquivo** no programa apropriado

### Dicas para Relatórios
- 📊 **Use filtros** para relatórios mais específicos
- 📅 **Defina períodos** para análises temporais
- 💾 **Exporte regularmente** para backup
- 📈 **Compare períodos** para identificar tendências

## 👥 Gerenciamento de Usuários

> **Nota**: Esta funcionalidade está disponível apenas para **Administradores**

### Acessando o Gerenciamento
1. **Faça login** como administrador
2. **Clique em "👥 Usuários"** no menu
3. **Você verá a lista** de todos os usuários

### Visualizando Usuários

#### Informações Mostradas
- **Nome**: Nome completo do usuário
- **E-mail**: E-mail de login
- **Tipo**: Nível de permissão
- **Status**: Ativo/Inativo
- **Pessoa Vinculada**: Se vinculado a alguma pessoa
- **Data de Criação**: Quando foi criado
- **Ações**: Botões de ação disponíveis

#### Tipos de Usuário
- **Administrador**: Acesso total ao sistema
- **Responsável**: Gerenciamento de pessoas e frequências
- **Geral**: Operações básicas

### Criando Novos Usuários

#### Passo a Passo
1. **Clique em "Criar Usuário"**
2. **Preencha os dados**:
   - Nome completo
   - E-mail (deve ser único)
   - Tipo de usuário
   - Pessoa vinculada (opcional)
3. **Clique em "Salvar"**
4. **O sistema gerará** uma senha temporária
5. **Anote a senha** e repasse ao usuário

#### Senha Temporária
- O usuário **deve trocar** a senha no primeiro login
- A senha temporária é mostrada **apenas uma vez**
- Se perder, use a função "Reset de Senha"

### Gerenciando Usuários Existentes

#### Ativar/Desativar Usuário
1. **Localize o usuário** na lista
2. **Clique no botão** "Ativar" ou "Desativar"
3. **Confirme a ação**
4. **Usuários inativos** não conseguem fazer login

#### Reset de Senha
1. **Clique em "Reset Senha"** na linha do usuário
2. **Confirme a ação**
3. **Uma nova senha** será gerada
4. **Anote a senha** e repasse ao usuário
5. **O usuário deve trocar** no próximo login

#### Editar Usuário
1. **Clique em "Editar"** na linha do usuário
2. **Altere as informações** desejadas
3. **Não é possível alterar** o e-mail
4. **Clique em "Salvar"**

#### Excluir Usuário
1. **Clique em "Excluir"** na linha do usuário
2. **Confirme a exclusão** (ação irreversível)
3. **O usuário será removido** permanentemente

### Gerenciando Seu Próprio Perfil

#### Editando Perfil
1. **Clique em "⚙️ Configurações"** no menu
2. **Selecione "Editar Perfil"**
3. **Altere nome e e-mail**
4. **Clique em "Salvar"**

#### Alterando Senha
1. **Em Configurações**, clique **"Alterar Senha"**
2. **Digite a senha atual**
3. **Digite a nova senha** (duas vezes)
4. **Clique em "Alterar"**
5. **Faça login novamente** com a nova senha

## 🔍 Sistema de Duplicatas

### O que são Duplicatas?
Duplicatas são **pessoas cadastradas mais de uma vez** no sistema com pequenas variações nos dados (ex: "João Silva" e "Joao da Silva").

### Acessando o Sistema
1. **No painel**, clique em **"🔍 Duplicatas"**
2. **Você verá a interface** de análise de duplicatas

### Analisando Duplicatas

#### Iniciando a Análise
1. **Clique em "Analisar Duplicatas"**
2. **O sistema processará** todas as pessoas cadastradas
3. **Acompanhe o progresso** na tela
4. **Aguarde a conclusão** (pode levar alguns minutos)

#### Informações do Processamento
Durante a análise, você verá:
- **Progresso**: Percentual concluído
- **Tempo decorrido**: Quanto tempo já passou
- **Tempo estimado**: Previsão para conclusão
- **Velocidade**: Comparações por segundo
- **Pessoas analisadas**: Quantas já foram processadas

#### Resultados da Análise
Após a conclusão:
- **Grupos duplicados encontrados**: Quantos grupos de duplicatas
- **Total de pessoas duplicadas**: Quantas pessoas estão duplicadas
- **Estatísticas detalhadas**: Performance da análise
- **Cache**: Resultados ficam salvos por 10 minutos

### Visualizando Duplicatas Encontradas

#### Lista de Grupos
Cada grupo mostra:
- **Pessoas similares**: Lista das pessoas do grupo
- **Similaridade**: Percentual de semelhança
- **Frequências**: Quantas frequências cada pessoa tem
- **Dados**: Nome, CPF, cidade de cada pessoa

#### Ordenação
Os grupos são ordenados por:
1. **Maior similaridade** primeiro
2. **Mais frequências** em caso de empate

### Mesclando Duplicatas

#### Selecionando para Mesclagem
1. **Revise cada grupo** cuidadosamente
2. **Identifique a pessoa principal** (dados mais completos)
3. **Marque as pessoas** que são duplicatas
4. **Clique em "Mesclar Selecionadas"**

#### Processo de Mesclagem
O sistema irá:
1. **Manter a pessoa principal** com todos os dados
2. **Transferir todas as frequências** das duplicatas
3. **Mesclar informações** complementares (telefone, email)
4. **Remover as pessoas duplicadas**
5. **Manter histórico** das frequências

#### Validações de Segurança
- ✅ **Pessoa principal** não pode estar nas secundárias
- ✅ **Máximo 10 pessoas** por operação
- ✅ **Transações seguras** para integridade
- ✅ **Backup automático** antes da operação

### Mesclagem em Lote
Para **múltiplos grupos**:
1. **Selecione vários grupos**
2. **Defina pessoa principal** em cada um
3. **Clique em "Mesclar Lote"**
4. **Acompanhe o progresso** da operação

### Dicas Importantes
- 🔍 **Revise sempre** antes de mesclar
- 💾 **Faça backup** antes de operações grandes
- ⏰ **Use o cache** - não analise repetidamente
- 📊 **Verifique frequências** após mesclagem

## ⚙️ Configurações

### Acessando Configurações
1. **No painel**, clique em **"⚙️ Configurações"**
2. **Escolha a opção** desejada

### Opções Disponíveis

#### Editar Perfil
- **Alterar nome** de exibição
- **Alterar e-mail** de login
- **Visualizar informações** da conta

#### Alterar Senha
- **Trocar senha** atual
- **Definir nova senha** segura
- **Confirmação** obrigatória

#### Informações da Conta
- **Tipo de usuário** (administrador, responsável, geral)
- **Data de criação** da conta
- **Último login** realizado
- **Pessoa vinculada** (se houver)

## 💡 Dicas e Truques

### Cadastro Eficiente
- 📝 **Nome é obrigatório** - sempre preencha
- 🆔 **CPF evita duplicatas** - use quando possível
- 📱 **Telefone com DDD** - facilita contato
- 🏠 **Cidade completa** - melhora relatórios

### Busca Rápida
- 🔍 **Digite apenas parte** do nome para buscar
- 📋 **CPF sem pontos** também funciona
- 🏙️ **Busque por cidade** para filtrar região
- ⌨️ **Use Enter** para buscar rapidamente

### Frequência Eficiente
- 🎫 **Tenha a senha** em mãos antes de buscar
- 📅 **Data automática** - não precisa alterar
- 🐕 **Pet tutor** - preencha ambas as senhas
- ✅ **Confirme sempre** antes de registrar

### Relatórios Úteis
- 📊 **Use filtros** para dados específicos
- 📈 **Compare períodos** para análises
- 💾 **Exporte regularmente** para backup
- 📱 **CSV abre no Excel** facilmente

### Duplicatas
- 🔍 **Analise mensalmente** para manter limpo
- 👀 **Revise sempre** antes de mesclar
- 📊 **Pessoa com mais frequências** geralmente é principal
- 💾 **Faça backup** antes de operações grandes

### Segurança
- 🔐 **Troque senhas** regularmente
- 🚪 **Faça logout** ao sair
- 👥 **Não compartilhe** credenciais
- 📱 **Use senhas fortes** (8+ caracteres)

## ❓ Perguntas Frequentes

### Cadastro e Pessoas

**P: Posso cadastrar sem CPF?**
R: Sim, apenas o nome é obrigatório. Mas o CPF ajuda a evitar duplicatas.

**P: O que fazer se o CPF já existe?**
R: Verifique se a pessoa já está cadastrada. Se for duplicata, use o sistema de mesclagem.

**P: Como editar dados de uma pessoa?**
R: Busque a pessoa na tela de Frequência, altere os dados e clique em "Atualizar Dados".

**P: Posso excluir uma pessoa?**
R: Não há função de exclusão. Use o sistema de duplicatas para mesclar registros.

### Frequência

**P: Posso registrar frequência de dias anteriores?**
R: Sim, altere a data no formulário antes de registrar.

**P: O que fazer se registrei frequência errada?**
R: Não há função de exclusão de frequência. Contate o administrador.

**P: Por que não consigo registrar frequência duplicada?**
R: O sistema impede duplicatas na mesma data para evitar erros.

**P: Qual a diferença entre os tipos de frequência?**
R: Cada tipo representa um atendimento diferente (geral, hospital, pet, etc.).

### Relatórios

**P: Por que o relatório está vazio?**
R: Verifique os filtros de data e tipo. Pode não haver dados no período selecionado.

**P: Como exportar para Excel?**
R: Use a opção "CSV" ou "XLSX" nos botões de exportação.

**P: Os relatórios incluem todas as pessoas?**
R: Sim, os relatórios não têm limite. Apenas a busca é limitada a 50 resultados.

### Usuários

**P: Como criar um novo usuário?**
R: Apenas administradores podem criar usuários. Use o menu "Usuários".

**P: Esqueci minha senha, o que fazer?**
R: Peça para um administrador fazer o reset da sua senha.

**P: Posso alterar meu tipo de usuário?**
R: Não, apenas administradores podem alterar tipos de usuário.

### Duplicatas

**P: Com que frequência devo analisar duplicatas?**
R: Recomendamos mensalmente ou quando houver muitos cadastros novos.

**P: A mesclagem pode ser desfeita?**
R: Não, a mesclagem é permanente. Sempre revise antes de confirmar.

**P: Por que a análise demora tanto?**
R: O sistema compara cada pessoa com todas as outras. Muitas pessoas = mais tempo.

### Técnicas

**P: O sistema funciona offline?**
R: Não, é necessária conexão com o servidor local.

**P: Posso acessar de outros computadores?**
R: Sim, desde que estejam na mesma rede e acessem o IP correto.

**P: Como fazer backup dos dados?**
R: Use as ferramentas de backup do MySQL ou exporte relatórios regularmente.

**P: O sistema tem limite de pessoas?**
R: Não há limite técnico. O sistema foi testado com mais de 4.600 pessoas.

### Problemas Comuns

**P: A página não carrega, o que fazer?**
R: Verifique se o servidor PHP está rodando (`php -S localhost:8080`) e se a URL está correta.

**P: Erro "Token expirado", como resolver?**
R: Faça login novamente. Tokens expiram por segurança.

**P: Não consigo fazer login, o que fazer?**
R: Verifique usuário/senha. Se persistir, peça reset para administrador.

**P: O sistema está lento, é normal?**
R: Pode ser normal com muitos dados. Verifique conexão e recursos do servidor.

---

## 📞 Suporte

### Informações de Contato
- **Sistema**: Terra do Bugio v1.0.0
- **Suporte Técnico**: Administrador do sistema
- **Documentação**: Consulte os arquivos .md do projeto

### Recursos Adicionais
- **Manual Técnico**: DOCUMENTACAO_COMPLETA.md
- **API Reference**: API_REFERENCE.md
- **Guia de Instalação**: GUIA_INSTALACAO.md

---

**© 2024 Sistema de Recepção Terra do Bugio - Guia do Usuário v1.0.0**
