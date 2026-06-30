const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const DRIVE_API_KEY = process.env.DRIVE_API_KEY;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

const meses = {
    "1-janeiro": 1, "2-fevereiro": 2, "3-marco": 3, "4-abril": 4,
    "5-maio": 5, "6-junho": 6, "7-julho": 7, "8-agosto": 8,
    "9-setembro": 9, "10-outubro": 10, "11-novembro": 11, "12-dezembro": 12
};

app.use(express.static('public'));

async function buscarCardapio(ano, numeroMes) {
    const nomeMes = Object.keys(meses).find(k => meses[k] === numeroMes);

    if (!nomeMes) return null;

    const urlAno = `https://www.googleapis.com/drive/v3/files`
        + `?q=name='${ano}' and '${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        + `&key=${DRIVE_API_KEY}`
        + `&fields=files(id,name)`;

    const resAno = await fetch(urlAno);
    const dataAno = await resAno.json();

    console.log("ANO BUSCADO:", ano);
    console.log("RESPOSTA ANO:", dataAno);

    if (!dataAno.files || dataAno.files.length === 0) return null;

    const anoId = dataAno.files[0].id;

    const urlPasta = `https://www.googleapis.com/drive/v3/files`
        + `?q=name='${nomeMes}' and '${anoId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        + `&key=${DRIVE_API_KEY}`
        + `&fields=files(id,name)`;

    const resPasta = await fetch(urlPasta);
    const dataPasta = await resPasta.json();

    console.log("MES BUSCADO:", nomeMes);
    console.log("RESPOSTA MES:", dataPasta);

    if (!dataPasta.files || dataPasta.files.length === 0) return null;

    const pastaId = dataPasta.files[0].id;

    const urlArquivo = `https://www.googleapis.com/drive/v3/files`
        + `?q='${pastaId}' in parents and mimeType='application/pdf' and trashed=false`
        + `&orderBy=createdTime desc`
        + `&key=${DRIVE_API_KEY}`
        + `&fields=files(id,name)`;

    const resArquivo = await fetch(urlArquivo);
    const dataArquivo = await resArquivo.json();

    console.log("PDF:", dataArquivo);

    if (!dataArquivo.files || dataArquivo.files.length === 0) return null;

    return dataArquivo.files[0].id;
}

app.get('/cardapio', async (req, res) => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const numeroMes = agora.getMonth() + 1;

    try {
        const fileId = await buscarCardapio(ano, numeroMes);

        if (!fileId) {
            return res.status(404).send('Cardápio deste mês ainda não disponível.');
        }

        res.redirect(`https://drive.google.com/uc?export=download&id=${fileId}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar cardápio.');
    }
});

app.get('/cardapio/:ano/:mes', async (req, res) => {
    const { ano, mes } = req.params;
    const numeroMes = meses[mes.toLowerCase()];

    if (!numeroMes) {
        return res.status(400).send('Mês inválido.');
    }

    try {
        const fileId = await buscarCardapio(ano, numeroMes);

        if (!fileId) {
            return res.status(404).send('Cardápio não encontrado.');
        }

        res.redirect(`https://drive.google.com/uc?export=download&id=${fileId}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar cardápio.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/contato', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contato.html'));
});

app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sobre.html'));
});

// app.get('/sofia', (req, res) => {
//     res.send('Olá, Sofia!');
// });

app.use((req, res) => {
    console.log('Rota não encontrada:', req.url);
    res.status(404).send('404');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});