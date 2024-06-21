const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');
const cors = require("cors");
const { ok } = require('assert');

const server = jsonServer.create();

const router = jsonServer.router(path.resolve(__dirname, 'db.json'));

const corsOptions = {
  origin: "https://tarasova-frontend-project.netlify.app", // замените на ваш фронтенд домен
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // если вам нужно передавать куки или авторизационные данные
  optionsSuccessStatus: 200, // для старых браузеров, которые возвращают 204
  status: ok
};

server.use(jsonServer.defaults({}));
server.use(jsonServer.bodyParser);
server.use(cors(corsOptions));
// Включаем поддержку OPTIONS-запросов для всех маршрутов
server.options('*', cors(corsOptions));

// Эндпоинт для логина
server.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'UTF-8'));
        const { users = [] } = db;

        const userFromBd = users.find(
            (user) => user.username === username && user.password === password,
        );

        if (userFromBd) {
            return res.json(userFromBd);
        }

        return res.status(403).json({ message: 'User not found' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
});

// проверяем, авторизован ли пользователь
// eslint-disable-next-line
server.use((req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ message: 'AUTH ERROR' });
    }

    next();
});

server.use(router);

// запуск сервера
server.listen(8000, () => {
    console.log('server is running on 8000 port');
});
