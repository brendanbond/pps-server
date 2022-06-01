import { Request } from 'express';
import fs from 'fs';
import { Item } from './types';

export function readItems(
  callback: (err: NodeJS.ErrnoException | null, items: Item[]) => void
) {
  return fs.readFile('db/data.json', (err, data) => {
    if (err) {
      console.error('Error while reading database: ', err);
      callback(err, []);
      return;
    }
    const items = JSON.parse(data.toString());
    callback(null, items);
  });
}

export function updateItems(
  updateFn: (items: Item[]) => Item[],
  onComplete: (err: NodeJS.ErrnoException | null) => void
) {
  readItems((err, items) => {
    if (err) {
      onComplete(err);
      return;
    }

    const updatedItems = updateFn(items);
    fs.writeFile('db/data.json', JSON.stringify(updatedItems), (err) =>
      onComplete(err)
    );
  });
}

export function addItem(
  item: Item,
  callback: (err: NodeJS.ErrnoException | null) => void
) {
  readItems((err, items) => {
    if (err) {
      callback(err);
      return;
    }
    items.push(item);
    fs.writeFile('db/data.json', JSON.stringify(items), (err) => {
      callback(err);
    });
  });
}

export function removeItem(
  itemId: string,
  callback: (err: NodeJS.ErrnoException | null) => void
) {
  readItems((err, items) => {
    if (err) {
      callback(err);
      return;
    }
    const matchedIndex = items.findIndex((item) => item.id === itemId);
    if (matchedIndex > -1) {
      const updatedItems = [
        ...items.slice(0, matchedIndex),
        ...items.slice(matchedIndex + 1),
      ];
      fs.writeFile('db/data.json', JSON.stringify(updatedItems), (err) => {
        callback(err);
      });
    } else {
      callback(new Error(`couldn't find item id ${itemId}`));
    }
  });
}

export function updateItem(
  updatedItem: Item,
  callback: (err: NodeJS.ErrnoException | null) => void
) {
  readItems((err, items) => {
    if (err) {
      callback(err);
      return;
    }
    const matchedIndex = items.findIndex((item) => item.id === updatedItem.id);
    if (matchedIndex > -1) {
      const updatedItems = [
        ...items.slice(0, matchedIndex),
        updatedItem,
        ...items.slice(matchedIndex + 1),
      ];
      fs.writeFile('db/data.json', JSON.stringify(updatedItems), (err) => {
        callback(err);
      });
    } else {
      callback(new Error(`couldn't find item id ${updatedItem.id}`));
    }
  });
}

export function validateItem(item: any): item is Item {
  return (
    item.id &&
    item.description &&
    (item.project === 'personal' ||
      item.project === 'financial' ||
      item.project === 'development' ||
      item.project === 'music') &&
    typeof item.completed === 'boolean' &&
    typeof item.pinned === 'boolean'
  );
}

export function removeCompleteAndUpdatePinned(items: Item[]) {
  console.log('removing completed items and updating pinned items....');
  return items
    .filter((item) => !item.completed || item.pinned)
    .map((item) => ({ ...item, completed: false }));
}

export function userIsAuthenticated(req: Request) {
  if (req.header('X-Auth') === process.env.AUTHTOKEN) {
    return true;
  }
  return false;
}
