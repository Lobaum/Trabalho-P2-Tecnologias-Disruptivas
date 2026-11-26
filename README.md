# P2: Atlas das Nuvens (Site Estático em Docker)

Projeto desenvolvido por **Pedro Henrique Nascimento da Silva** ([@Lobaum](https://github.com/Lobaum)) para a avaliação P2 da disciplina, com o objetivo de containerizar um site estático sobre **nuvens e atmosfera** (HTML, CSS, JavaScript, fontes e imagens) usando Docker e Nginx.

## Sobre o site

O **Atlas das Nuvens** é um guia visual e interativo sobre os principais gêneros de nuvens classificados pela Organização Meteorológica Mundial (OMM):

- vitrine filtrável por altitude (**Baixas**, **Médias**, **Altas**, **Desenvolvimento Vertical**);
- modal de ficha técnica para `Cumulonimbus`, `Cumulus`, `Cirrus` e `Altocumulus`;
- comparador interativo entre nuvens de gotículas líquidas e cristais de gelo;
- identificador rápido de nuvens baseado em altura aparente, formato e sinais visuais;
- diário de observação do céu com validação local em JavaScript e alternância entre modo claro e escuro.

## Estrutura do repositório

```text
.
├── assets/
│   ├── fonts/         # Fontes Plus Jakarta Sans e JetBrains Mono hospedadas localmente
│   ├── icons/         # Favicon SVG usado na aba do navegador
│   └── images/        # Fotografias de nuvens servidas diretamente pelo Nginx
├── css/
│   └── styles.css     # Folha de estilos com tema claro/escuro e layout responsivo
├── js/
│   └── main.js        # Filtros, modal, identificador de nuvens e diário local
├── .dockerignore      # Evita copiar documentação e arquivos auxiliares para a imagem
├── .gitignore
├── Dockerfile         # Receita da imagem baseada em nginx:1.27-alpine
├── index.html         # Página principal do Atlas das Nuvens
└── README.md          # Documentação de uso e entrega do trabalho
```

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução na máquina.

## Como fazer o build da imagem

Na raiz do projeto (onde está localizado o `Dockerfile`), execute:

```bash
docker build -t atlas-nuvens-p2 .
```

Esse comando lê as instruções do `Dockerfile` e gera a imagem local chamada `atlas-nuvens-p2`.

## Como executar o container

Após concluir o build, inicie o container mapeando a porta `8080` da máquina para a porta `80` do Nginx:

```bash
docker run -d --name atlas-nuvens-web -p 8080:80 atlas-nuvens-p2
```

Depois, abra o navegador e acesse:

```text
http://localhost:8080
```

### Comandos úteis para gerenciar o container

Conferir se o container está ativo:

```bash
docker ps
```

Visualizar os logs de acesso do Nginx:

```bash
docker logs atlas-nuvens-web
```

Parar e remover o container quando terminar os testes:

```bash
docker stop atlas-nuvens-web
docker rm atlas-nuvens-web
```

## Diferença entre imagem e container

Uma **imagem** funciona como um molde pronto e imutável. No caso deste trabalho, ela reúne o servidor Nginx junto com o arquivo `index.html`, o CSS, o JavaScript, as fontes e as imagens de nuvens, exatamente como descrito no `Dockerfile`. Depois de criada, a imagem fica salva no disco e não executa nada sozinha.

O **container** é a instância em execução criada a partir dessa imagem. Quando rodamos `docker run`, o Docker inicia um processo isolado baseado na imagem, sobe o Nginx e libera o acesso na porta mapeada (`8080:80`). Mesmo que o container seja parado ou removido depois, a imagem original continua intacta para gerar novos containers a qualquer momento.

## Evidência de funcionamento

> **Nota para entrega:** Após subir o container com o Docker Desktop aberto e confirmar que `http://localhost:8080` carrega corretamente no navegador, grave um vídeo curto mostrando o terminal com `docker ps`, a URL `http://localhost:8080` aberta e a interação na página. Salve o vídeo em `evidencias/funcionamento.mp4` ou adicione aqui o link antes do envio.

## Auxílio de LLM no desenvolvimento

Este trabalho foi desenvolvido com o auxílio da LLM **Google Gemini**, utilizada como apoio na criação do site estático sobre nuvens (HTML, CSS e JavaScript), na configuração do `Dockerfile` com Nginx Alpine e na revisão desta documentação.
