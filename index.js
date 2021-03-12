const express = require('express');
const cors = require('cors');
// const mysql = require('mysql');
const mysql = require('promise-mysql');

const app = express();
app.use(cors())
const port = 3030;

const createTcpPool = async config => {
    // Extract host and port from socket address
    // const dbSocketAddr = process.env.DB_HOST.split(':');
  
    // Establish a connection to the database
    return await mysql.createPool({
      user: "<>", // e.g. 'my-db-user'
      password: "<>", // e.g. 'my-db-password'
      database: "<>", // e.g. 'my-database'
      host: "<>", // e.g. '127.0.0.1'
      port: "<>", // e.g. '3306'
      // ... Specify additional properties here.
      ...config,
    });
  };
  // [END cloud_sql_mysql_mysql_create_tcp]
  
  // [START cloud_sql_mysql_mysql_create_socket]
  const createUnixSocketPool = async config => {
    const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
  
    // Establish a connection to the database
    return await mysql.createPool({
      user: 'todos_user', // e.g. 'my-db-user'
      password: '8eac9667', // e.g. 'my-db-password'
      database: 'todoapp', // e.g. 'my-database'
      // If connecting via unix domain socket, specify the path
      socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
      // Specify additional properties here.
      ...config,
    });
  };
  // [END cloud_sql_mysql_mysql_create_socket]
  
  const createPool = async () => {
    const config = {
      // [START cloud_sql_mysql_mysql_limit]
      // 'connectionLimit' is the maximum number of connections the pool is allowed
      // to keep at once.
      connectionLimit: 5,
      // [END cloud_sql_mysql_mysql_limit]
  
      // [START cloud_sql_mysql_mysql_timeout]
      // 'connectTimeout' is the maximum number of milliseconds before a timeout
      // occurs during the initial connection to the database.
      connectTimeout: 10000, // 10 seconds
      // 'acquireTimeout' is the maximum number of milliseconds to wait when
      // checking out a connection from the pool before a timeout error occurs.
      acquireTimeout: 10000, // 10 seconds
      // 'waitForConnections' determines the pool's action when no connections are
      // free. If true, the request will queued and a connection will be presented
      // when ready. If false, the pool will call back with an error.
      waitForConnections: true, // Default: true
      // 'queueLimit' is the maximum number of requests for connections the pool
      // will queue at once before returning an error. If 0, there is no limit.
      queueLimit: 0, // Default: 0
      // [END cloud_sql_mysql_mysql_timeout]
  
      // [START cloud_sql_mysql_mysql_backoff]
      // The mysql module automatically uses exponential delays between failed
      // connection attempts.
      // [END cloud_sql_mysql_mysql_backoff]
    };
    if (true) {
      return await createTcpPool(config);
    } else {
      console.log('fuck');
    }
  };

let pool;

const createPoolAndEnsureSchema = async () =>
  await createPool()
    .then(async pool => {
      return pool;
    })
    .catch(err => {
      throw err;
      
    });

app.use(async (req, res, next) => {
    if (pool) {
        return next();
    }
    try {
        pool = await createPoolAndEnsureSchema();
        next();
    } catch (err) {
       
        return next(err);
    }
    });

app.get('/Test',(req,res)=>{
    res.send("Hello");
});


app.get('/GetTodos', async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    const { title } = req.query;
    try{
        const todosQuery = pool.query(`select * from todos where Title=${title}`);
        const todos = await todosQuery;
        return res.json({
            data: todos
        });
    } catch (err){
        return res.send(err);
    }
});

app.get('/GetTitles', async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    const { title } = req.query;
    try{
        const titlesQuery = pool.query('select DISTINCT  Title from todos');
        const titles = await titlesQuery;
        return res.json({
            data: titles
        });
    } catch (err){
        return res.send(err);
    }
});

app.get('/DeleteTodo', async (req, res) => {
    
    pool = pool || (await createPoolAndEnsureSchema());
    const { id } = req.query;
    try{
        const deleteTodoQuery = pool.query(`delete from todos where ID=${id}`);
        const deleteTodo = await deleteTodoQuery;
        return res.json({
        data: deleteTodo
    });
    } catch (err){
        return res.send(err);
    }
});

app.get('/MarkTodoCompleted', async (req, res) => {
    
    pool = pool || (await createPoolAndEnsureSchema());
    const { id,IsCompleted } = req.query;
    try{
        const markCompleteQuery = pool.query(`update todos set IsCompleted=${IsCompleted} where ID=${id}`);
        const markComplete = await markCompleteQuery;
        return res.json({
        data: markComplete
    });
    } catch (err){
        return res.send(err);
    }
});

app.get('/DeleteTitle', async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    const { title } = req.query;
    try{
        const deleteTitleQuery = pool.query(`delete from todos where Title=${title}`);
        const deleteTitle = await deleteTitleQuery;
        return res.json({
        data: deleteTitle
    });
    } catch (err){
        return res.send(err);
    }
});

app.get('/AddTodo', async (req, res) => {

    pool = pool || (await createPoolAndEnsureSchema());
    const { todo,title } = req.query;
    try{
        const addTodoQuery = pool.query(`insert into todos (Value,Title) values (${todo},${title})`);
        const addTodo = await addTodoQuery;
        return res.send("todo added!");
    } catch (err){
        return res.send(err);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));