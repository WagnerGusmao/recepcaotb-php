const express = require('express');
const { verificarAuth } = require('./auth');
const db = require('./database');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Função auxiliar para buscar frequências com filtros
function buscarFrequencias(filtros) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT f.*, p.telefone, p.email, p.nome, p.cidade, p.estado 
                   FROM frequencias f 
                   JOIN pessoas p ON f.pessoa_id = p.id`;
        let params = [];
        let conditions = [];

        if (filtros.dataInicio) {
            conditions.push('f.data >= ?');
            params.push(filtros.dataInicio);
        }
        
        if (filtros.dataFim) {
            conditions.push('f.data <= ?');
            params.push(filtros.dataFim);
        }
        
        if (filtros.tipo) {
            conditions.push('f.tipo = ?');
            params.push(filtros.tipo);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY f.data DESC, f.numero_senha';

        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Função para gerar HTML do relatório
function gerarHTMLRelatorio(tipo, dados, filtros) {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    let periodo = 'Período completo';
    
    if (filtros.dataInicio && filtros.dataFim) {
        const dataInicioFormatada = new Date(filtros.dataInicio).toLocaleDateString('pt-BR');
        const dataFimFormatada = new Date(filtros.dataFim).toLocaleDateString('pt-BR');
        periodo = `${dataInicioFormatada} a ${dataFimFormatada}`;
    } else if (filtros.dataInicio) {
        const dataInicioFormatada = new Date(filtros.dataInicio).toLocaleDateString('pt-BR');
        periodo = `A partir de ${dataInicioFormatada}`;
    } else if (filtros.dataFim) {
        const dataFimFormatada = new Date(filtros.dataFim).toLocaleDateString('pt-BR');
        periodo = `Até ${dataFimFormatada}`;
    }

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${tipo}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin-bottom: 5px; }
            .header p { color: #666; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .summary h3 { margin-top: 0; color: #007bff; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${tipo}</h1>
            <p><strong>Período:</strong> ${periodo}</p>
            <p><strong>Gerado em:</strong> ${dataAtual}</p>
        </div>
    `;

    if (tipo === 'Relatório Geral') {
        const stats = calcularEstatisticas(dados);
        html += `
        <div class="summary">
            <h3>Resumo Estatístico</h3>
            <p><strong>Total de Frequências:</strong> ${dados.length}</p>
            <p><strong>Pessoas Únicas:</strong> ${stats.pessoasUnicas}</p>
            <p><strong>Cidades:</strong> ${stats.cidades}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Nº Senha</th>
                    <th>Cidade</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
        `;
        dados.forEach(f => {
            html += `
                <tr>
                    <td>${new Date(f.data).toLocaleDateString('pt-BR')}</td>
                    <td>${f.nome}</td>
                    <td>${f.tipo.toUpperCase().replace('_', ' ')}</td>
                    <td>${f.numero_senha}</td>
                    <td>${f.cidade || 'N/A'}</td>
                    <td>${f.estado || 'N/A'}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    } else if (tipo === 'Relatório de Contatos') {
        const pessoasUnicas = agruparPorPessoa(dados);
        html += `
        <div class="summary">
            <h3>Resumo Estatístico</h3>
            <p><strong>Pessoas Únicas:</strong> ${pessoasUnicas.length}</p>
            <p><strong>Com Telefone:</strong> ${pessoasUnicas.filter(p => p.telefone !== 'Não informado').length}</p>
            <p><strong>Com E-mail:</strong> ${pessoasUnicas.filter(p => p.email !== 'Não informado').length}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Tipos de Atendimento</th>
                </tr>
            </thead>
            <tbody>
        `;
        pessoasUnicas.forEach((p, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.nome}</td>
                    <td>${p.telefone}</td>
                    <td>${p.email}</td>
                    <td>${p.tiposAtendimento}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    } else if (tipo === 'Relatório de Cidades') {
        const cidadeStats = agruparPorCidade(dados);
        html += `
        <div class="summary">
            <h3>Resumo Estatístico</h3>
            <p><strong>Total de Cidades:</strong> ${cidadeStats.length}</p>
            <p><strong>Total de Frequências:</strong> ${dados.length}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Cidade</th>
                    <th>Estado</th>
                    <th>Frequências</th>
                    <th>Pessoas Únicas</th>
                    <th>%</th>
                </tr>
            </thead>
            <tbody>
        `;
        cidadeStats.forEach((c, index) => {
            const percentual = ((c.total / dados.length) * 100).toFixed(1);
            html += `
                <tr>
                    <td>${index + 1}º</td>
                    <td>${c.cidade}</td>
                    <td>${c.estado || 'N/A'}</td>
                    <td>${c.total}</td>
                    <td>${c.pessoas}</td>
                    <td>${percentual}%</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    }

    html += `
        <div class="footer">
            <p>Sistema de Frequência - Relatório gerado automaticamente</p>
        </div>
    </body>
    </html>
    `;

    return html;
}

// Funções auxiliares
function calcularEstatisticas(dados) {
    const pessoasUnicas = new Set(dados.map(f => f.pessoa_id)).size;
    const cidades = new Set(dados.map(f => f.cidade).filter(c => c)).size;
    return { pessoasUnicas, cidades };
}

function agruparPorPessoa(dados) {
    const pessoasMap = new Map();
    
    dados.forEach(f => {
        if (!pessoasMap.has(f.pessoa_id)) {
            pessoasMap.set(f.pessoa_id, {
                nome: f.nome,
                telefone: f.telefone || 'Não informado',
                email: f.email || 'Não informado',
                tipos: new Set()
            });
        }
        pessoasMap.get(f.pessoa_id).tipos.add(f.tipo);
    });
    
    return Array.from(pessoasMap.values())
        .map(p => ({
            ...p,
            tiposAtendimento: Array.from(p.tipos).join(', ')
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
}

function agruparPorCidade(dados) {
    const cidadeStats = {};
    
    dados.forEach(f => {
        const cidade = f.cidade || 'Não informado';
        if (!cidadeStats[cidade]) {
            cidadeStats[cidade] = {
                cidade,
                estado: f.estado,
                total: 0,
                pessoas: new Set()
            };
        }
        cidadeStats[cidade].total++;
        cidadeStats[cidade].pessoas.add(f.pessoa_id);
    });
    
    return Object.values(cidadeStats)
        .map(c => ({
            ...c,
            pessoas: c.pessoas.size
        }))
        .sort((a, b) => b.total - a.total);
}

// Rota para exportar PDF
router.post('/pdf', verificarAuth, async (req, res) => {
    try {
        const { tipo, filtros } = req.body;
        
        const dados = await buscarFrequencias(filtros);
        const html = gerarHTMLRelatorio(tipo, dados, filtros);
        
        // Para desenvolvimento, vamos usar uma alternativa mais simples ao puppeteer
        // Retornar o HTML para o frontend converter
        res.json({ 
            success: true, 
            html: html,
            message: 'HTML gerado para conversão no frontend'
        });
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

// Rota para exportar XLSX
router.post('/xlsx', verificarAuth, async (req, res) => {
    try {
        const { tipo, filtros } = req.body;
        
        const dados = await buscarFrequencias(filtros);
        
        let worksheetData = [];
        let filename = '';
        
        if (tipo === 'Relatório Geral') {
            filename = 'relatorio_geral.xlsx';
            worksheetData = dados.map(f => ({
                'Data': new Date(f.data).toLocaleDateString('pt-BR'),
                'Nome': f.nome,
                'Tipo': f.tipo.toUpperCase().replace('_', ' '),
                'Nº Senha': f.numero_senha,
                'Cidade': f.cidade || 'N/A',
                'Estado': f.estado || 'N/A',
                'Telefone': f.telefone || 'N/A',
                'E-mail': f.email || 'N/A'
            }));
        } else if (tipo === 'Relatório de Contatos') {
            filename = 'relatorio_contatos.xlsx';
            const pessoasUnicas = agruparPorPessoa(dados);
            worksheetData = pessoasUnicas.map((p, index) => ({
                '#': index + 1,
                'Nome': p.nome,
                'Telefone': p.telefone,
                'E-mail': p.email,
                'Tipos de Atendimento': p.tiposAtendimento
            }));
        } else if (tipo === 'Relatório de Cidades') {
            filename = 'relatorio_cidades.xlsx';
            const cidadeStats = agruparPorCidade(dados);
            worksheetData = cidadeStats.map((c, index) => ({
                'Posição': `${index + 1}º`,
                'Cidade': c.cidade,
                'Estado': c.estado || 'N/A',
                'Frequências': c.total,
                'Pessoas Únicas': c.pessoas,
                'Percentual': `${((c.total / dados.length) * 100).toFixed(1)}%`
            }));
        }
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        
        // Ajustar largura das colunas
        const colWidths = [];
        if (worksheetData.length > 0) {
            Object.keys(worksheetData[0]).forEach(key => {
                const maxLength = Math.max(
                    key.length,
                    ...worksheetData.map(row => String(row[key] || '').length)
                );
                colWidths.push({ width: Math.min(maxLength + 2, 50) });
            });
        }
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
        
        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        // Configurar headers para download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        res.send(buffer);
        
    } catch (error) {
        console.error('Erro ao gerar XLSX:', error);
        res.status(500).json({ error: 'Erro ao gerar XLSX' });
    }
});

module.exports = router;
