// conexão com o banco de dados
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Frida123@kkk',
    database: 'devhub'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.message);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida');
});

//backend para o frontend
const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

//rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//rota para a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', { email, senha: senha ? '***' : 'undefined' });
    
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    connection.query(sql, [email, senha], (err, result) => {
        if (err) {
            console.error('Erro ao fazer login:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
        } else if (result.length === 0) {
            console.log('Login falhou: usuário não encontrado');
            res.status(401).json({ error: 'Email ou senha incorretos' });
        } else {
            console.log('Login bem-sucedido para:', email);
            const usuario = result[0];
            delete usuario.senha; // Remove a senha da resposta
            res.status(200).json({ 
                message: 'Login realizado com sucesso',
                usuario: usuario
            });
        }
    });
});

//rota para a página de registro (redireciona para login)
app.get('/registro', (req, res) => {
    res.redirect('/login');
});

//rota para a página de perfil
app.get('/perfil', (req, res) => {
    res.send('Perfil');
});

// endpoints
app.post('/usuarios', (req, res) => {
    const { nome, email, senha } = req.body;
    console.log('Tentativa de cadastro:', { nome, email, senha: senha ? '***' : 'undefined' });
    
    // Validar dados obrigatórios
    if (!nome || !email || !senha) {
        console.log('Cadastro falhou: dados obrigatórios ausentes');
        res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        return;
    }
    
    // Verificar se email já existe
    const checkSql = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(checkSql, [email], (err, result) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        
        if (result.length > 0) {
            console.log('Cadastro falhou: email já existe');
            res.status(400).json({ error: 'Email já cadastrado' });
            return;
        }
        
        // Criar usuário
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        connection.query(sql, [nome, email, senha], (err, result) => {
            if (err) {
                console.error('Erro ao criar usuário:', err);
                res.status(500).json({ error: 'Erro ao criar usuário' });
            } else {
                console.log('Usuário criado com sucesso:', email);
                res.status(201).json({ 
                    message: 'Usuário criado com sucesso',
                    id: result.insertId
                });
            }
        });
    });
});

app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).send('Erro ao buscar usuários');
        } else {
            res.status(200).json(result);
        }
    });
});

app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?';
    connection.query(sql, [nome, email, senha, id], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao atualizar usuário');
        } else {
            res.status(200).send('Usuário atualizado com sucesso');
        }
    });
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao deletar usuário');
        } else {
            res.status(200).send('Usuário deletado com sucesso');
        }
    });
});

// Endpoints para posts
app.post('/posts', (req, res) => {
    const { id_usuario, texto } = req.body;
    const sql = 'INSERT INTO posts (id_usuario, texto) VALUES (?, ?)';
    connection.query(sql, [id_usuario, texto], (err, result) => {
        if (err) {
            console.error('Erro ao criar post:', err);
            res.status(500).json({ error: 'Erro ao criar post' });
        } else {
            res.status(201).json({ 
                message: 'Post criado com sucesso',
                id: result.insertId 
            });
        }
    });
});

app.get('/posts', (req, res) => {
    const sql = `
        SELECT p.*, u.nome as autor_nome 
        FROM posts p 
        JOIN usuarios u ON p.id_usuario = u.id 
        ORDER BY p.created_at DESC
    `;
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao buscar posts:', err);
            res.status(500).json({ error: 'Erro ao buscar posts' });
        } else {
            res.status(200).json(result);
        }
    });
});

// Endpoints para comentários
app.post('/comentarios', (req, res) => {
    const { id_post, id_usuario, texto } = req.body;
    const sql = 'INSERT INTO comentarios (id_post, id_usuario, texto) VALUES (?, ?, ?)';
    connection.query(sql, [id_post, id_usuario, texto], (err, result) => {
        if (err) {
            console.error('Erro ao criar comentário:', err);
            res.status(500).json({ error: 'Erro ao criar comentário' });
        } else {
            // Criar notificação para o autor do post
            const notifSql = `
                INSERT INTO notificacoes (id_usuario, id_remetente, tipo, texto) 
                SELECT p.id_usuario, ?, 'comentario', CONCAT(?, ' comentou em seu post: "', SUBSTRING(?, 1, 50), '..."')
                FROM posts p 
                WHERE p.id = ? AND p.id_usuario != ?
            `;
            connection.query(notifSql, [id_usuario, req.body.nome_usuario || 'Alguém', texto, id_post, id_usuario], (err) => {
                if (err) console.error('Erro ao criar notificação de comentário:', err);
            });
            
            res.status(201).json({ 
                message: 'Comentário criado com sucesso',
                id: result.insertId 
            });
        }
    });
});

app.get('/comentarios/:id_post', (req, res) => {
    const { id_post } = req.params;
    const sql = `
        SELECT c.*, u.nome as autor_nome 
        FROM comentarios c 
        JOIN usuarios u ON c.id_usuario = u.id 
        WHERE c.id_post = ? 
        ORDER BY c.created_at ASC
    `;
    connection.query(sql, [id_post], (err, result) => {
        if (err) {
            console.error('Erro ao buscar comentários:', err);
            res.status(500).json({ error: 'Erro ao buscar comentários' });
        } else {
            res.status(200).json(result);
        }
    });
});

// Endpoints para curtidas
app.post('/curtidas', (req, res) => {
    const { id_post, id_usuario } = req.body;
    
    // Verificar se já curtiu
    const checkSql = 'SELECT * FROM curtidas WHERE id_post = ? AND id_usuario = ?';
    connection.query(checkSql, [id_post, id_usuario], (err, result) => {
        if (err) {
            console.error('Erro ao verificar curtida:', err);
            res.status(500).json({ error: 'Erro ao verificar curtida' });
            return;
        }
        
        if (result.length > 0) {
            // Remover curtida
            const deleteSql = 'DELETE FROM curtidas WHERE id_post = ? AND id_usuario = ?';
            connection.query(deleteSql, [id_post, id_usuario], (err, result) => {
                if (err) {
                    console.error('Erro ao remover curtida:', err);
                    res.status(500).json({ error: 'Erro ao remover curtida' });
                } else {
                    res.status(200).json({ message: 'Curtida removida', liked: false });
                }
            });
        } else {
            // Adicionar curtida
            const insertSql = 'INSERT INTO curtidas (id_post, id_usuario) VALUES (?, ?)';
            connection.query(insertSql, [id_post, id_usuario], (err, result) => {
                if (err) {
                    console.error('Erro ao adicionar curtida:', err);
                    res.status(500).json({ error: 'Erro ao adicionar curtida' });
                } else {
                    // Criar notificação para o autor do post
                    const notifSql = `
                        INSERT INTO notificacoes (id_usuario, id_remetente, tipo, texto) 
                        SELECT p.id_usuario, ?, 'curtida', CONCAT(?, ' curtiu seu post')
                        FROM posts p 
                        WHERE p.id = ? AND p.id_usuario != ?
                    `;
                    connection.query(notifSql, [id_usuario, req.body.nome_usuario || 'Alguém', id_post, id_usuario], (err) => {
                        if (err) console.error('Erro ao criar notificação de curtida:', err);
                    });
                    
                    res.status(201).json({ message: 'Curtida adicionada', liked: true });
                }
            });
        }
    });
});

app.get('/curtidas/:id_post', (req, res) => {
    const { id_post } = req.params;
    const sql = 'SELECT COUNT(*) as total FROM curtidas WHERE id_post = ?';
    connection.query(sql, [id_post], (err, result) => {
        if (err) {
            console.error('Erro ao buscar curtidas:', err);
            res.status(500).json({ error: 'Erro ao buscar curtidas' });
        } else {
            res.status(200).json({ count: result[0].total });
        }
    });
});

// Endpoints para notificações
app.post('/notificacoes', (req, res) => {
    const { id_usuario, texto } = req.body;
    const sql = 'INSERT INTO notificacoes (id_usuario, texto) VALUES (?, ?)';
    connection.query(sql, [id_usuario, texto], (err, result) => {
        if (err) {
            console.error('Erro ao criar notificação:', err);
            res.status(500).json({ error: 'Erro ao criar notificação' });
        } else {
            res.status(201).json({ 
                message: 'Notificação criada com sucesso',
                id: result.insertId 
            });
        }
    });
});

app.get('/notificacoes/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = `
        SELECT n.*, u.nome as remetente_nome 
        FROM notificacoes n 
        LEFT JOIN usuarios u ON n.id_remetente = u.id 
        WHERE n.id_usuario = ? 
        ORDER BY n.created_at DESC 
        LIMIT 20
    `;
    connection.query(sql, [id_usuario], (err, result) => {
        if (err) {
            console.error('Erro ao buscar notificações:', err);
            res.status(500).json({ error: 'Erro ao buscar notificações' });
        } else {
            res.status(200).json(result);
        }
    });
});

// Endpoints para seguidores
app.post('/seguir', (req, res) => {
    const { id_seguidor, id_seguido } = req.body;
    
    if (id_seguidor === id_seguido) {
        res.status(400).json({ error: 'Não é possível seguir a si mesmo' });
        return;
    }
    
    const sql = 'INSERT INTO seguidores (id_seguidor, id_seguido) VALUES (?, ?)';
    connection.query(sql, [id_seguidor, id_seguido], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Você já segue este usuário' });
            } else {
                console.error('Erro ao seguir usuário:', err);
                res.status(500).json({ error: 'Erro ao seguir usuário' });
            }
        } else {
            // Criar notificação para o usuário seguido
            const notifSql = `
                INSERT INTO notificacoes (id_usuario, id_remetente, tipo, texto) 
                VALUES (?, ?, 'seguidor', CONCAT(?, ' começou a seguir você'))
            `;
            connection.query(notifSql, [id_seguido, id_seguidor, req.body.nome_seguidor || 'Alguém'], (err) => {
                if (err) console.error('Erro ao criar notificação de seguidor:', err);
            });
            
            res.status(201).json({ message: 'Usuário seguido com sucesso' });
        }
    });
});

app.delete('/seguir', (req, res) => {
    const { id_seguidor, id_seguido } = req.body;
    const sql = 'DELETE FROM seguidores WHERE id_seguidor = ? AND id_seguido = ?';
    connection.query(sql, [id_seguidor, id_seguido], (err, result) => {
        if (err) {
            console.error('Erro ao deixar de seguir usuário:', err);
            res.status(500).json({ error: 'Erro ao deixar de seguir usuário' });
        } else {
            res.status(200).json({ message: 'Deixou de seguir o usuário' });
        }
    });
});

app.get('/seguidores/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = `
        SELECT s.*, u.nome, u.email 
        FROM seguidores s 
        JOIN usuarios u ON s.id_seguidor = u.id 
        WHERE s.id_seguido = ?
    `;
    connection.query(sql, [id_usuario], (err, result) => {
        if (err) {
            console.error('Erro ao buscar seguidores:', err);
            res.status(500).json({ error: 'Erro ao buscar seguidores' });
        } else {
            res.status(200).json(result);
        }
    });
});

app.get('/seguindo/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = `
        SELECT s.*, u.nome, u.email 
        FROM seguidores s 
        JOIN usuarios u ON s.id_seguido = u.id 
        WHERE s.id_seguidor = ?
    `;
    connection.query(sql, [id_usuario], (err, result) => {
        if (err) {
            console.error('Erro ao buscar seguindo:', err);
            res.status(500).json({ error: 'Erro ao buscar seguindo' });
        } else {
            res.status(200).json(result);
        }
    });
});

// Marcar notificação como lida
app.put('/notificacoes/:id/lida', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE notificacoes SET lida = TRUE WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao marcar notificação como lida:', err);
            res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
        } else {
            res.status(200).json({ message: 'Notificação marcada como lida' });
        }
    });
});

// Iniciar servidor apenas uma vez
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

