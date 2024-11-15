//Importamos las librarías requeridas
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json()


// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Servicio listo.');
        }
    });
});


// *************************************************************
// Crear un endpoint llamado "agrega_todo" que reciba datos usando POST.

app.post('/agrega_todo', jsonParser, function (req, res) {
    //Imprime el contenido del dato todo y dato_extra recibidos.
    const { todo } = req.body;
    const { dato_extra } = req.body;

    // Obtener el timestamp en segundos:
    const unixTimestamp = Math.floor(Date.now() / 1000);

    // Imprime en consola los datos obtenidos
    console.log("Petición recibida por el endpoint: agrega_todo.");
    console.log("todo recibido: " + todo);
    console.log("Dato extra recibido: " + dato_extra);

    // Imprimir el unix timestamp en consola para validar
    console.log("Unix timestamp: " + unixTimestamp);

    // Especificando el encabezado
    res.setHeader('Content-Type', 'application/json');
    
    // Manejo de excepción
    if (!todo) {
        res.status(400).send('Falta información necesaria');
        return;
    }

    //  Insertar el "todo" obtenido y el unix timestamp en la tabla todos
    //  ? y ? son sustituidos por los valores especificados todo y unixTimestamp
    const stmt  =  db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');

    // todo contiene el texto recibido en la petición hecha por Postman. 
    // Se podría usar también CURRENT_TIMESTAMP
    stmt.run(todo, unixTimestamp, (err) => {
        if (err) {
          console.error("Error al ejecutar smt:", err);
          res.status(500).send(err);
          return;

        } else {
          console.log("Los datos se guardaron con éxito.");
        }
    });

    // Obtiene todas las filas de la tabla todso y los imprime en la consola
    db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) {
        throw err;
    }

    // Procesar los resultados
    console.log("Datos en la tabla todos:")
    rows.forEach((row) => {
        console.log(row);
    });
});

    stmt.finalize();
    
    // Respuesta en JSON con un estado HTTP 201
    res.setHeader('Content-Type', 'application/json');
    res.status(201).send();
})


// Fin de código para endpoint "agrega_todo"
// *************************************************************

app.get('/', function (req, res) {
    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'Operación exitosa' }));
})


// Devuelve los elementos usando el comando SELECT.
app.get('/listaJSON', function (req, res) {
    // Realiza la consulta a la tabla SQLite todos.
    db.all('SELECT * FROM todos', [], (err, elementos) => {
    if (err) {
        throw err;
    }
    //Establece el encabezado para un tipo de respuesta JSON
    res.setHeader('Content-Type', 'application/json');
    // Convierte y responde el resultado anterior en formato JSON
    res.end(JSON.stringify(elementos));
    });
})

//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
    //Imprimimos el contenido del body
    console.log(req.body);

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'Aplicación y tunel funcionando...' }));
})

//Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})