const express = require('express');

const app = express();
const port = 3000;

// definir uma página public para as páginas estáticas
app.use(express.static('public'));


app.get('/cardapio', (requisicao, resposta) => {

    const agora = new Date();
    const ano = agora.getFullYear();
    const numeroMes = agora.getMonth() + 1; 
    const nomeArquivo = `/uploads/cardapio-${ano}${numeroMes}.pdf`;
    
    resposta.sendFile(__dirname + nomeArquivo);
});


''
app.get('/', (requisicao, resposta) => {
    resposta.sendFile(__dirname + '/index.html');
});

app.get('/contato', (requisicao, resposta) => {
    resposta.sendFile(__dirname + '/public/contato.html');
});

app.get('/sobre', (requisicao, resposta) => {
    resposta.sendFile(__dirname + '/public/sobre.html');
});


app.get('/sofia', (requisicao, resposta) => {
    resposta.send('Olá, Sofia!');
})



app.use((req, res) => {
    console.log('Rota não encontrada:', req.url);
    res.status(404).send('404');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});