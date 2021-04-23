import express from 'express';
import { accountModel } from '../models/accountModel.js';
const router = express();

//----Patch----
router.patch('/', (req, res) => {
  res.send(req.body);
});

//------------Deposito-----------
router.put('/deposito', async (req, res) => {
  const { cc, ag, value } = req.body;
  try {
    const account = await accountModel.findOne({ conta: cc });
    if (!account) {
      res.status(404).send('Usuário não encontrado!');
    }
    account.balance += value;
    await accountModel.findByIdAndUpdate(
      { _id: account._id },
      {
        $set: { balance: account.balance },
      }
    );
    res.send('Saldo atual: ' + account.balance.toString());
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Saque-----------
router.put('/saque', async (req, res) => {
  const { cc, ag, value } = req.body;
  try {
    const account = await accountModel.findOne({ conta: cc });
    if (!account) {
      res.status(404).send('Usuário não encontrado!');
    }
    account.balance -= value + 1;
    if (account.balance < 0) {
      res.status(400).send('Saldo insuficiente!');
    } else {
      await accountModel.findByIdAndUpdate(
        { _id: account._id },
        {
          $set: { balance: account.balance },
        }
      );
      res.send('Saldo atual: ' + account.balance.toString());
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Saldo-----------
router.get('/saldo', async (req, res) => {
  const { cc, ag } = req.body;
  try {
    const account = await accountModel.findOne({ conta: cc });
    if (!account) {
      res.status(404).send('Usuário não encontrado!');
    }
    res.send('Saldo atual: ' + account.balance.toString());
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Delete-----------
router.delete('/', async (req, res) => {
  const { cc, ag } = req.body;
  try {
    const accounts = await accountModel.deleteOne({ conta: cc });
    if (accounts.deletedCount === 0) {
      res.status(404).send('Usuário não encontrado!');
    } else {
      const agCount = await accountModel.countDocuments({ agencia: ag });
      res.send(`Contas ativas na agência ${ag}: ${agCount}`);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Transferencia-----------
router.put('/transferencia', async (req, res) => {
  const { ccFrom, ccTo, value } = req.body;
  try {
    const accountFrom = await accountModel.findOne({ conta: ccFrom });
    if (!accountFrom) {
      res.status(404).send('Conta de origem não encontrada!');
    }

    const accountTo = await accountModel.findOne({ conta: ccTo });
    if (!accountTo) {
      res.status(404).send('Conta de destino não encontrada!');
    }

    accountFrom.balance -= value;
    if (accountTo.agencia !== accountFrom.agencia) {
      accountFrom.balance -= 8;
    }

    if (accountFrom.balance < 0) {
      res.status(400).send('Saldo insuficiente!');
    } else {
      accountTo.balance += value;
      await accountModel.findByIdAndUpdate(
        { _id: accountFrom._id },
        {
          $set: { balance: accountFrom.balance },
        }
      );

      await accountModel.findByIdAndUpdate(
        { _id: accountTo._id },
        {
          $set: { balance: accountTo.balance },
        }
      );

      res.send('Saldo atual: ' + accountFrom.balance.toString());
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Media-----------
router.get('/media', async (req, res) => {
  const { ag } = req.body;
  try {
    const accounts = await accountModel.aggregate([
      { $match: { agencia: ag } },
      { $group: { _id: '$agencia', media: { $avg: '$balance' } } },
      { $project: { _id: 0 } },
    ]);
    if (accounts.length === 0) {
      res.status(404).send('Agência não encontrada!');
    } else {
      res.send('Média: ' + accounts[0].media.toString());
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Menor saldo-----------
router.get('/menor-saldo', async (req, res) => {
  const { numClientes } = req.body;
  try {
    const accounts = await accountModel
      .find({}, { _id: 0, name: 0 })
      .sort({ balance: 1 })
      .limit(numClientes);
    res.send(accounts);
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Maior saldo-----------
router.get('/maior-saldo', async (req, res) => {
  const { numClientes } = req.body;
  try {
    const accounts = await accountModel
      .find({}, { _id: 0 })
      .sort({ balance: -1, name: 1 })
      .limit(numClientes);
    res.send(accounts);
  } catch (error) {
    res.status(400).send(error);
  }
});

//------------Agencia 99-----------
router.get('/agencia-99', async (_req, res) => {
  try {
    const ags = await accountModel.distinct('agencia');
    for (let i = 0; i < ags.length; i++) {
      const ag99 = await accountModel
        .find({ agencia: ags[i] })
        .sort({ balance: -1 })
        .limit(1);
      await accountModel.findOneAndUpdate(
        { _id: ag99[0]._id },
        { $set: { agencia: 99 } }
      );
    }
    const accounts = await accountModel.find({ agencia: 99 }, { _id: 0 });
    res.send(accounts);
  } catch (error) {
    res.status(400).send(error);
  }
});

export { router as accountRouter };
