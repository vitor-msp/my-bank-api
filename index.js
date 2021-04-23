import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRouter.js';
const app = express();
app.use(express.json());
app.use('/accounts', accountRouter);

(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://mongoUser:mongoPass@cluster0.r1s85.mongodb.net/my-bank-api?retryWrites=true&w=majority',
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

app.listen(3000, () => console.log('Api iniciada!'));
