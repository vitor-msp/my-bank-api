//-----Imports----
import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';
require('dotenv').config();
const app = express();
app.use(express.json());
app.use('/accounts', accountRouter);

//-----Conexão com MongoDB----
(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PASSDB}@cluster0.r1s85.mongodb.net/${process.env.DBTOACCESS}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    console.log('Conectado ao MongoDB!');
  } catch (error) {
    console.log('Erro na conexão ao MongoDB: ' + error);
  }
})();

app.listen(process.env.PORT, () => console.log('Api iniciada!'));
