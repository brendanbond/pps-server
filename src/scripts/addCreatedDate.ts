import { updateItems } from '../helpers';

const today = new Date();

updateItems(
  (items) =>
    items.map((item) => ({ ...item, createdDate: today.toISOString() })),
  (err) => {
    if (err) {
      console.error('Error during add createdDate: ', err);
    }
  }
);
