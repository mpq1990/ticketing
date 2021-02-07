import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

let mongo: MongoMemoryServer;

jest.mock('../nats-wrapper');

beforeAll(async () => {
  process.env.JWT_KEY = 'test';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const userJwt = jwt.sign(
    {
      id: mongoose.Types.ObjectId().toHexString(),
      password: 'password',
    },
    process.env.JWT_KEY!
  );

  const session = Buffer.from(JSON.stringify({ jwt: userJwt })).toString(
    'base64'
  );

  return [`express:sess=${session}`];
};
