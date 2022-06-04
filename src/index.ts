import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cron from 'node-cron';
import { nanoid } from 'nanoid';
import 'dotenv/config';

import {
  readItems,
  addItem,
  removeItem,
  validateItem,
  updateItem,
  updateItems,
  userIsAuthenticated,
  removeCompleteAndUpdatePinned,
} from './helpers';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use((req, res, next) => {
  if (userIsAuthenticated(req)) {
    return next();
  }
  console.error('Unauthenticated user hit endpoint, will not continue');
  return res.sendStatus(401);
});

app.get('/todo', (req, res) => {
  readItems((err, items) => {
    if (err) {
      console.error('Error while reading from db: ', err);
      res.status(500).json(err);
    }
    res.json(items);
  });
});

app.post('/todo', (req, res) => {
  const payload = req.body;

  const newTodo = {
    id: nanoid(10),
    project: payload.project,
    description: payload.description,
    completed: false,
    pinned: false,
  };

  addItem(newTodo, (err) => {
    if (err) {
      console.error('Errorr while adding todo item: ', err);
      res.sendStatus(500);
    }
    res.json(newTodo);
  });
});

app.delete('/todo/:id', (req, res) => {
  const idToDelete = req.params.id;
  if (!idToDelete) res.status(500).json("ID param can't be null/undefined");

  removeItem(idToDelete, (err) => {
    if (err) {
      console.error(`Error while removing item ${idToDelete}: `, err);
      res.status(500).json(err);
    }
    res.sendStatus(200);
  });
});

app.put('/todo', (req, res) => {
  const payload = req.body;
  if (!validateItem(payload)) {
    console.error('Received invalid todo item to update');
    res.status(500).json('Received invalid todo item to update');
  }

  updateItem(payload, (err) => {
    // update server-side item to reflect "completed"
    if (err) {
      console.error('Error while updating todo item: ', err);
      res.status(500).json(err);
    }
    res.json(payload);
  });
});

app.listen(Number(process.env.PORT) || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});

cron.schedule('30 6 * * *', () => {
  updateItems(removeCompleteAndUpdatePinned, (err) => {
    if (err) {
      console.error('Error during nightly prune: ', err);
    }
  });
});
