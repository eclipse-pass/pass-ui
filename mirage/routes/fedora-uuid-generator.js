import faker from 'faker';

export default function () {
  return `${faker.random.alphaNumeric(2)}/${faker.random.alphaNumeric(2)}/${faker.random.alphaNumeric(
    2
  )}/${faker.random.alphaNumeric(2)}/${faker.random.uuid()}`;
}
