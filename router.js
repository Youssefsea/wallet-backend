const express=require('express');
const router=express.Router();
const pool=require('./db');
const auth=require('./auth');
const middelware=require('./middelware/sureTocken');
const depositAndWithdraw=require('./depositAndWithdraw');
const categoriesAndBudgets=require('./categories&Budgets');
// Auth (public)
router.post('/auth/signup',auth.signup);
router.post('/auth/login',auth.login);

// User (protected)
router.get('/user/profile',middelware.sureTockentoken,auth.profile);
router.put('/user/profile',middelware.sureTockentoken,auth.updateProfile);
router.put('/user/password',middelware.sureTockentoken,auth.ChangePassword);
router.post('/user/local-wallet',middelware.sureTockentoken,auth.makeLocalWallet);
router.get('/user/local-wallet',middelware.sureTockentoken,auth.getLocalWallets);


// Wallets (protected)
router.get('/wallets',middelware.sureTockentoken,auth.walletsInfo);
router.post('/wallets/deposit', middelware.sureTockentoken,middelware.walletFound,depositAndWithdraw.deposit);
router.post('/wallets/withdraw', middelware.sureTockentoken,middelware.walletFound,depositAndWithdraw.withdraw);


// Local Wallets (protected)
router.post('/local-wallets/deposit', middelware.sureTockentoken,middelware.LocalWalletFound,depositAndWithdraw.depositToLocalWallet);

router.post('/transactions/manual', middelware.sureTockentoken,middelware.LocalWalletFound,depositAndWithdraw.manualTransaction);
router.post('/transactions/ai', middelware.sureTockentoken,middelware.LocalWalletFound,depositAndWithdraw.aiTransaction);



// Transfers (protected)
router.post('/transfers', middelware.sureTockentoken,middelware.walletFound,depositAndWithdraw.transfer);

// Transactions (protected)
router.get('/transactions', middelware.sureTockentoken,middelware.walletFound,depositAndWithdraw.transfersHistory);
router.get('/transactions/:id', middelware.sureTockentoken,middelware.walletFound,depositAndWithdraw.gettransferDetailsById);
router.get('/local-transactions', middelware.sureTockentoken,middelware.LocalWalletFound,depositAndWithdraw.transferHistoryForLocalWallet);
router.get('/local-transactions/:id', middelware.sureTockentoken,middelware.LocalWalletFound,depositAndWithdraw.getLocalWalletTransactionDetailsById);



 
// Categories & Budgets (protected)
router.get('/categories', middelware.sureTockentoken,categoriesAndBudgets.getAllCategories);
router.post('/categories', middelware.sureTockentoken,categoriesAndBudgets.addNewCategory);
router.get('/budgets', middelware.sureTockentoken,categoriesAndBudgets.getBudgetsMonthly);
router.post('/budgets', middelware.sureTockentoken,categoriesAndBudgets.creatBudgetMonthly);
router.put('/budgets/:id', middelware.sureTockentoken,categoriesAndBudgets.updateBudgetMonthly);
router.get('/budgets/rest/:month_year', middelware.sureTockentoken,middelware.walletFound,categoriesAndBudgets.restOfTheBudgetOfRealWallet);
router.get('/budgetsLocal/rest/:month_year', middelware.sureTockentoken,middelware.LocalWalletFound,categoriesAndBudgets.restOfTheBudgetOfLocalWallet);
router.get('/budgets/transactions/:id', middelware.sureTockentoken,middelware.walletFound,categoriesAndBudgets.transictionhistoryForRealWalletAtBudgetID);
router.get('/budgetsLocal/transactions/:id', middelware.sureTockentoken,middelware.LocalWalletFound,categoriesAndBudgets.transictionhistoryForLocalWalletAtBudgetID);



//AI Advice (protected)
router.post('/budgets/advice', middelware.sureTockentoken,middelware.walletFound,categoriesAndBudgets.getAdvice);
router.post('/budgets/local-advice', middelware.sureTockentoken,middelware.LocalWalletFound,categoriesAndBudgets.getAdviceForLocalWallet);




module.exports=router;