//importing Express
const express = require("express");

//creating instance
const app = express();

//importing sqlite,sqlite3 and path
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//use of json in script
app.use(express.json());

//creating path
const dataPath = path.join(__dirname, "todoApplication.db");

//initialize database
let dataBase = null;

//initialize database and server
const initializeDataBaseAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at 3000 port");
    });
  } catch (error) {
    console.log("error");
    process.exit(1);
  }
};
initializeDataBaseAndServer();

//checking the invalid statements
const validStatus = (requestQuery) => {
  let listElement = ["TO DO", "IN PROGRESS", "DONE"];
  return listElement.some((element) => element === requestQuery.status);
};

const validPriority = (requestQuery) => {
  let list = ["HIGH", "MEDIUM", "LOW"];
  return list.some((eachElement) => eachElement === requestQuery.priority);
};

const validCategory = (requestQuery) => {
  let list = ["WORK", "HOME", "LEARNING"];
  return list.some((eachElement) => eachElement === requestQuery.category);
};

/*validate function
function validate(request, response, next) {
  const requestQuery = request.query;
  if (requestQuery !== undefined) {
    next();
  }
}
*/
//functions
const possibleFunction1 = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const possibleFunction2 = (requestQuery) => {
  return (
    requestQuery.category === undefined &&
    requestQuery.priority !== undefined &&
    requestQuery.status === undefined
  );
};

const possibleFunction3 = (requestQuery) => {
  return (
    requestQuery.category === undefined &&
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined
  );
};

const possibleFunction4 = (requestQuery) => {
  return (
    requestQuery.category !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.status === undefined
  );
};

const possibleFunction5 = (requestQuery) => {
  return (
    requestQuery.category !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.status !== undefined
  );
};

const possibleFunction6 = (requestQuery) => {
  return (
    requestQuery.category !== undefined &&
    requestQuery.priority !== undefined &&
    requestQuery.status === undefined
  );
};

const possibleFunction7 = (requestQuery) => {
  return (
    requestQuery.category !== undefined &&
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined
  );
};

//creating output Format
const outputFormat = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

//creating API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", category, priority, status, dueDate } = request.query;
  console.log(request.query);
  let getQuery = null;
  switch (true) {
    case possibleFunction1(request.query):
      if (validStatus(request.query)) {
        getQuery = `select * from todo where
                todo like '%${search_q}%' and
                status='${status}'`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case possibleFunction2(request.query):
      if (validPriority(request.query)) {
        getQuery = `select * from todo where
            todo like '%${search_q}%' and 
            priority='${priority}'`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case possibleFunction3(request.query):
      if (validStatus(request.query)) {
        if (validPriority(request.query)) {
          getQuery = `select * from todo where
                    todo like '%${search_q}%' and 
                    priority='${priority}' and 
                    status='${status}'`;
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case possibleFunction4(request.query):
      if (validCategory(request.query)) {
        getQuery = `select * from todo where
                todo like '%${search_q}%' and
                category='${category}'`;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case possibleFunction5(request.query):
      if (validStatus(request.query)) {
        if (validCategory(request.query)) {
          getQuery = `select * from todo where
                    todo like '%${search_q}%' and 
                    category='${category}' and
                    status='${status}'`;
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case possibleFunction6(request.query):
      if (validCategory(request.query)) {
        if (validPriority(request.query)) {
          getQuery = `select * from todo where
                    todo like '%${search_q}%' and 
                    category='${category}' and
                    priority='${priority}'`;
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case possibleFunction7(request.query):
      if (validCategory(request.query)) {
        if (validPriority(request.query)) {
          if (validStatus(request.query)) {
            getQuery = `select * from todo where
                        todo like '%${search_q}%' and
                        category='${category}' and
                        priority='${priority}' and
                        status='${status}'`;
          } else {
            response.status(400);
            response.send("Invalid Todo Status");
          }
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getQuery = `select from todo where
            todo like '%${search_q}%'`;
      break;
  }

  let getResponse = await dataBase.all(getQuery);
  response.send(getResponse.map((eachElement) => outputFormat(eachElement)));
});

//creating API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    select * from todo where
    id=${todoId}
    `;
  const getResponse = await dataBase.get(getQuery);
  response.send(outputFormat(getResponse));
});

//creating API 3
app.get("/agenda/", async (request, response) => {
  const { dueDate } = request.query;
  const getQuery = `
    select * from todo where
    due_date= '${request.query}'
    `;
  const getResponse = await dataBase.get(getQuery);
  response.send(outputFormat(getResponse));
});

//creating API 4
app.post("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category, dueDate } = request.body;
  const postQuery = `
    insert into todo(todo,priority,status,category,due_date)
    values(
        '${search_q}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
    )
    `;
  await dataBase.run(postQuery);
  response.send("Todo Successfully Added");
});

//creating API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateWord = null;
  const { todo, category, priority, status, due_date } = request.body;
  if (status !== undefined) {
    updateWord = "Status";
  } else if (priority !== undefined) {
    updateWord = "Priority";
  } else if (category !== undefined) {
    updateWord = "Category";
  } else if (due_date !== undefined) {
    updateWord = "Due Date";
  } else if (todo !== undefined) {
    updateWord = "Todo";
  }
  const givenTodoQuery = `
  select * from todo where id=${todoId}
  `;
  const givenTodo = await dataBase.get(givenTodoQuery);
  const {
    search_q = givenTodo.todo,
    new_category = givenTodo.category,
    new_priority = givenTodo.priority,
    new_status = givenTodo.status,
    new_dueDate = givenTodo.due_date,
  } = request.body;
  const updateQuery = `
  update todo
  set 
    todo='${search_q}',
    category='${new_category}',
    priority='${new_priority}',
    status='${new_status}',
    due_date='${new_dueDate}'
    where
    id=${todoId}
  `;
  await dataBase.run(updateQuery);
  response.send(`${updateWord} Updated`);
});

//creating API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
  delete from todo
  where id=${todoId}
  `;
  await dataBase.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
