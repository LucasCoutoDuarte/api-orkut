require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const validarUsuario = require('./validacao/usuarios');
const validarPost = require('./validacao/post');
const jwt = require('jsonwebtoken');
const auth = require('./auth/authLogin');

const app = express();
app.use(cors());
app.use(express.json());

function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    });
}

// Rota raiz
app.get('/', (req, res) => {
    res.send('<h1>API Orkut</h1>');
});

// Cadastro de usuário
app.post('/usuarios', validarUsuario, async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const resultado = await pool.query(
            `INSERT INTO usuarios (nome, email, senha)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email`,
            [nome, email, senha]
        );
        res.status(201).json({ mensagem: 'Usuário criado com sucesso', usuario: resultado.rows[0] });
    } catch (erro) {
        if (erro.code === '23505') {
            return res.status(409).json({ erro: 'E-mail já cadastrado' });
        }
        res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const resultado = await pool.query(
            `SELECT * FROM usuarios WHERE email = $1`, [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const usuario = resultado.rows[0];

        if (senha !== usuario.senha) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ mensagem: 'Login bem-sucedido', token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno no login' });
    }
});

// Listar usuários
app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, nome, email FROM usuarios`
        );
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar os usuários' });
    }
});

// Listar posts
app.get('/post', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                post.id,
                usuario_id,
                usuarios.nome,
                post.titulo,
                post.conteudo,
                post.criado_em
             FROM post
             JOIN usuarios ON post.usuario_id = usuarios.id
             ORDER BY post.criado_em DESC`
        );

        const dados = resultado.rows.map((post) => ({
            ...post,
            criado_em: formatarData(post.criado_em),
        }));

        res.json(dados);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar os posts' });
    }
});

// Criar post
app.post('/post', auth, validarPost, async (req, res) => {
    try {
        const { titulo, conteudo } = req.body;
        const resultado = await pool.query(
            `INSERT INTO post (titulo, conteudo, usuario_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [titulo, conteudo, req.usuario.id]
        );
        res.status(201).json({ mensagem: 'Post criado com sucesso', post: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar o post' });
    }
});

// Atualizar post
app.put('/post/:id', auth, validarPost, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, conteudo } = req.body;

        const resultado = await pool.query(
            `UPDATE post SET titulo = $1, conteudo = $2
             WHERE id = $3 AND usuario_id = $4
             RETURNING *`,
            [titulo, conteudo, id, req.usuario.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Post não encontrado ou sem permissão' });
        }

        res.status(200).json({ mensagem: 'Post atualizado com sucesso', post: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar o post' });
    }
});

// Excluir post
app.delete('/post/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM post WHERE id = $1 AND usuario_id = $2 RETURNING *`,
            [id, req.usuario.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Post não encontrado ou sem permissão' });
        }

        res.status(200).json({ mensagem: 'Post excluído com sucesso', post: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir o post' });
    }
});

module.exports = app;