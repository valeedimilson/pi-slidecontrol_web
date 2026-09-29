import { MongoClient } from "mongodb";

const options = {};

let client;
let clientPromise;

export function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI não foi configurada nas variáveis de ambiente (.env.local)."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

// Thenable para manter total compatibilidade com `await clientPromise` sem estourar no build
const clientPromiseProxy = {
  then(onFulfilled, onRejected) {
    return getMongoClientPromise().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getMongoClientPromise().catch(onRejected);
  },
  finally(onFinally) {
    return getMongoClientPromise().finally(onFinally);
  },
};

export default clientPromiseProxy;
