//-----Imports----
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { accountRouter } from "./routes/accountRouter.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/accounts", accountRouter);

//-----Conexão com MongoDB----
(async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("Conectado ao MongoDB!");
  } catch (error) {
    console.log("Erro na conexão ao MongoDB: " + error);
  }
})();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Api iniciada!"));
