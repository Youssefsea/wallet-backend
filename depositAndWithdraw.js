const pool = require('./db');
const redisClient = require('./redisClient');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);


const deposit = async (req, res) => {
    const { idempotencyKey } = req.body;
    const amount = parseFloat(req.body.amount);
    const walletId = req.user.walletId; 
 
    if (isNaN(amount) || amount <= 0 || amount > 20000) {
        return res.status(400).json({ message: "Invalid amount. Must be between 0.01 and 20,000" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    const lockKey = `lock:wallet:${walletId}`;
    const requestId = idempotencyKey; 

    const acquiredLock = await redisClient.set(lockKey, requestId, { NX: true, EX: 10 });
    
    if (!acquiredLock) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

       
        const insertTxQuery = `
            INSERT INTO transactions (wallet_id, amount, type, idempotency_key) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (idempotency_key) DO NOTHING 
            RETURNING *;
        `;
        
        const txResult = await client.query(insertTxQuery, [walletId, amount, 'deposit', idempotencyKey]);

        if (txResult.rows.length === 0) {
            await client.query('ROLLBACK');
            
            const existingTx = await client.query(
                'SELECT * FROM transactions WHERE idempotency_key = $1', 
                [idempotencyKey]
            );
            
            const wallet = await client.query('SELECT balance FROM wallets WHERE id = $1', [walletId]);

            return res.status(200).json({
                message: "Transaction already processed",
                transaction: {
                    id: existingTx.rows[0].id,
                    amount: existingTx.rows[0].amount,
                    type: existingTx.rows[0].type,
                    new_balance: wallet.rows[0].balance,
                    created_at: existingTx.rows[0].created_at
                }
            });
        }

        const newTransaction = txResult.rows[0];

        const updateWalletQuery = `
            UPDATE wallets 
            SET balance = balance + $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING balance;
        `;
        const walletResult = await client.query(updateWalletQuery, [amount, walletId]);

        await client.query('COMMIT');

        res.status(201).json({
            transaction: {
                id: newTransaction.id,
                amount: newTransaction.amount,
                type: "deposit",
                new_balance: walletResult.rows[0].balance,
                created_at: newTransaction.created_at
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Deposit Error:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
        
       const currentLock = await redisClient.get(lockKey);
        if (currentLock === requestId) {
            await redisClient.del(lockKey);
        }
    }
};


const withdraw = async (req, res) => {
    const { idempotencyKey } = req.body;
    const amount = parseFloat(req.body.amount);
    const walletId = req.user.walletId;
const category_id = req.body.category_id||null;
    if (isNaN(amount) || amount <= 0 || amount > 100000) {
        return res.status(400).json({ message: "Invalid amount. Must be between 0.01 and 100,000" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    const lockKey = `lock:wallet:${walletId}`;
    const requestId = idempotencyKey;

    const acquiredLock = await redisClient.set(lockKey, requestId, { NX: true, EX: 10 });

    if (!acquiredLock) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

const walletCheck = await client.query('SELECT balance FROM wallets WHERE id = $1 FOR UPDATE', [walletId]);

if (walletCheck.rows.length === 0) {
    await client.query('ROLLBACK');
    return res.status(404).json({ message: "Wallet not found" });
}

const currentBalance = walletCheck.rows[0].balance;

if (currentBalance < amount) {
    await client.query('ROLLBACK');
    return res.status(409).json({ message: "Insufficient balance" });
}



        const insertTxQuery = `
            INSERT INTO transactions (wallet_id, amount, type, idempotency_key, category_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING *;
        `;

        const txResult = await client.query(insertTxQuery, [walletId, -amount, 'withdraw', idempotencyKey, category_id]);

        if (txResult.rows.length === 0) {
            await client.query('ROLLBACK');

            const existingTx = await client.query(
                'SELECT * FROM transactions WHERE idempotency_key = $1',
                [idempotencyKey]
            );

            const wallet = await client.query('SELECT balance FROM wallets WHERE id = $1', [walletId]);

            return res.status(200).json({
                message: "Transaction already processed",
                transaction: {
                    id: existingTx.rows[0].id,
                    amount: existingTx.rows[0].amount,
                    type: existingTx.rows[0].type,
                    new_balance: wallet.rows[0].balance,
                    created_at: existingTx.rows[0].created_at
                }
            });
        }

        const newTransaction = txResult.rows[0];

        const updateWalletQuery = `
            UPDATE wallets
            SET balance = balance - $1, updated_at = NOW()
            WHERE id = $2 AND balance - $1 >= 0
            RETURNING balance;
        `;
        const walletResult = await client.query(updateWalletQuery, [amount, walletId]);

        if (walletResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: "Insufficient balance" });
        }

        await client.query('COMMIT');

        res.status(201).json({
            transaction: {
                id: newTransaction.id,
                amount: newTransaction.amount,
                type: "withdraw",
                new_balance: walletResult.rows[0].balance,
                created_at: newTransaction.created_at
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Withdraw Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
     finally {
    client.release();
    try {
        const currentLock = await redisClient.get(lockKey);
        if (currentLock === requestId) {
            await redisClient.del(lockKey);
        }
    } catch (redisErr) {
        console.error("Failed to release Redis lock:", redisErr);
    }
}
};





const depositToLocalWallet = async (req, res) => {

 const { idempotencyKey } = req.body;
    const amount = parseFloat(req.body.amount);
    const walletId = req.user.localWalletId; 
 
    if (isNaN(amount) || amount <= 0 || amount > 20000) {
        return res.status(400).json({ message: "Invalid amount. Must be between 0.01 and 20,000" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    const lockKey = `lock:wallet:${walletId}`;
    const requestId = idempotencyKey; 

    const acquiredLock = await redisClient.set(lockKey, requestId, { NX: true, EX: 10 });
    
    if (!acquiredLock) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

       
        const insertTxQuery = `
            INSERT INTO transactions (local_wallet_id, amount, type, idempotency_key) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (idempotency_key) DO NOTHING 
            RETURNING *;
        `;
        
        const txResult = await client.query(insertTxQuery, [walletId, amount, 'deposit', idempotencyKey]);

        if (txResult.rows.length === 0) {
            await client.query('ROLLBACK');
            
            const existingTx = await client.query(
                'SELECT * FROM transactions WHERE idempotency_key = $1', 
                [idempotencyKey]
            );
            
            const wallet = await client.query('SELECT balance FROM local_wallets WHERE id = $1', [walletId]);

            return res.status(200).json({
                message: "Transaction already processed",
                transaction: {
                    id: existingTx.rows[0].id,
                    amount: existingTx.rows[0].amount,
                    type: existingTx.rows[0].type,
                    new_balance: wallet.rows[0].balance,
                    created_at: existingTx.rows[0].created_at
                }
            });
        }

        const newTransaction = txResult.rows[0];

        const updateWalletQuery = `
            UPDATE local_wallets 
            SET balance = balance + $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING balance;
        `;
        const walletResult = await client.query(updateWalletQuery, [amount, walletId]);

        await client.query('COMMIT');

        res.status(201).json({
            transaction: {
                id: newTransaction.id,
                amount: newTransaction.amount,
                type: "deposit",
                new_balance: walletResult.rows[0].balance,
                created_at: newTransaction.created_at
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Deposit Error:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
        
       const currentLock = await redisClient.get(lockKey);
        if (currentLock === requestId) {
            await redisClient.del(lockKey);
        }
    }

};






const transfer = async (req, res) => {
    const { toEmail, description, idempotencyKey } = req.body;
    const amount = parseFloat(req.body.amount);
    const senderWalletId = req.user.walletId;
    const senderId = req.user.id;

    if (isNaN(amount) || amount <= 0 || amount > 100000) {
        return res.status(400).json({ message: "Invalid amount. Must be between 0.01 and 100,000" });
    }
    if (!toEmail) {
        return res.status(400).json({ message: "Receiver email is required" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    const receiverUser = await pool.query(
        'SELECT u.id, u.name, w.id AS wallet_id FROM users u JOIN wallets w ON w.user_id = u.id WHERE u.email = $1',
        [toEmail]
    );

    if (receiverUser.rows.length === 0) {
        return res.status(404).json({ message: "Receiver not found" });
    }

    const receiverWalletId = receiverUser.rows[0].wallet_id;
    const receiverName = receiverUser.rows[0].name;

    if (receiverUser.rows[0].id === senderId) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    const [firstLockId, secondLockId] = senderWalletId < receiverWalletId
        ? [senderWalletId, receiverWalletId]
        : [receiverWalletId, senderWalletId];

    const lockKey1 = `lock:wallet:${firstLockId}`;
    const lockKey2 = `lock:wallet:${secondLockId}`;
    const requestId = idempotencyKey;

    const lock1 = await redisClient.set(lockKey1, requestId, { NX: true, EX: 10 });
    if (!lock1) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const lock2 = await redisClient.set(lockKey2, requestId, { NX: true, EX: 10 });
    if (!lock2) {
        await redisClient.del(lockKey1);
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        const insertSenderTxQuery = `
            INSERT INTO transactions (wallet_id, amount, type, idempotency_key, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING *;
        `;

        const senderTxResult = await client.query(insertSenderTxQuery, [
            senderWalletId, -amount, 'transfer', idempotencyKey, description || null
        ]);

        if (senderTxResult.rows.length === 0) {
            await client.query('ROLLBACK');

            const existingTx = await client.query(
                'SELECT * FROM transactions WHERE idempotency_key = $1',
                [idempotencyKey]
            );

            const senderWallet = await client.query(
                'SELECT balance FROM wallets WHERE id = $1',
                [senderWalletId]
            );

            const senderUser = await pool.query(
                'SELECT name FROM users WHERE id = $1',
                [senderId]
            );

            return res.status(200).json({
                message: "Transfer already processed",
                transfer: {
                    id: existingTx.rows[0].id,
                    from: {
                        name: senderUser.rows[0].name,
                        new_balance: senderWallet.rows[0].balance
                    },
                    to: {
                        name: receiverName,
                        email: toEmail
                    },
                    amount: existingTx.rows[0].amount,
                    created_at: existingTx.rows[0].created_at
                }
            });
        }

        const debitQuery = `
            UPDATE wallets
            SET balance = balance - $1, updated_at = NOW()
            WHERE id = $2 AND balance - $1 >= 0
            RETURNING balance;
        `;
        const debitResult = await client.query(debitQuery, [amount, senderWalletId]);

        if (debitResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: "Insufficient balance" });
        }

        const creditQuery = `
            UPDATE wallets
            SET balance = balance + $1, updated_at = NOW()
            WHERE id = $2
            RETURNING balance;
        `;
        await client.query(creditQuery, [amount, receiverWalletId]);

        const insertReceiverTxQuery = `
            INSERT INTO transactions (wallet_id, amount, type, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        await client.query(insertReceiverTxQuery, [
            receiverWalletId, amount, 'transfer', description || null
        ]);

        await client.query('COMMIT');

        const senderUser = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);

        res.status(201).json({
            transfer: {
                id: senderTxResult.rows[0].id,
                from: {
                    name: senderUser.rows[0].name,
                    email: req.user.email,
                    new_balance: debitResult.rows[0].balance
                },
                to: {
                    name: receiverName,
                    email: toEmail
                },
                amount: amount,
                created_at: senderTxResult.rows[0].created_at
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transfer Error:", err);

        if (err.code === '40001') {
            return res.status(409).json({ message: "Transaction conflict. Please retry." });
        }

        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();

        try {
            const currentLock1 = await redisClient.get(lockKey1);
            if (currentLock1 === requestId) await redisClient.del(lockKey1);

            const currentLock2 = await redisClient.get(lockKey2);
            if (currentLock2 === requestId) await redisClient.del(lockKey2);
        } catch (redisErr) {
            console.error("Failed to release Redis locks:", redisErr);
        }
    }
};



const transfersHistory=async(req,res)=>
{
    try
    {
        const walletId=req.user.walletId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        const type = req.query.type; // optional filter

        let query = 'SELECT id, wallet_id, category_id, amount, type, description, status, is_synced, ai_metadata, created_at FROM transactions WHERE wallet_id = $1';
        let countQuery = 'SELECT COUNT(*) FROM transactions WHERE wallet_id = $1';
        const params = [walletId];
        const countParams = [walletId];

        if (type) {
            query += ' AND type = $' + (params.length + 1);
            countQuery += ' AND type = $' + (countParams.length + 1);
            params.push(type);
            countParams.push(type);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [historyResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            transactions: historyResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    }
    catch(err)
    {
        console.error("Transfer History Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


const gettransferDetailsById=async(req,res)=>
{
    try
    {
        const transactionId=req.params.id;
        const walletId=req.user.walletId;

        if (!transactionId || !isValidUUID(transactionId)) {
            return res.status(400).json({ message: "Invalid transaction ID format" });
        }

        const txDetails=await pool.query(
            'SELECT id, wallet_id, category_id, amount, type, description, status, is_synced, ai_metadata, created_at FROM transactions WHERE id = $1 AND wallet_id = $2',
            [transactionId, walletId]
        );

        if(txDetails.rows.length === 0)
        {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({
            transaction: txDetails.rows[0]
        });

    }
    catch(err)
    {
        console.error("Get Transfer Details Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}



const transferHistoryForLocalWallet=async(req,res)=>
{
    try
    {
        const walletId=req.user.localWalletId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        const type = req.query.type; 

        let query = 'SELECT id, local_wallet_id, category_id, amount, type, description, status, is_synced, ai_metadata, created_at FROM transactions WHERE local_wallet_id = $1';
        let countQuery = 'SELECT COUNT(*) FROM transactions WHERE local_wallet_id = $1';
        const params = [walletId];
        const countParams = [walletId];

        if (type) {
            query += ' AND type = $' + (params.length + 1);
            countQuery += ' AND type = $' + (countParams.length + 1);
            params.push(type);
            countParams.push(type);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [historyResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            transactions: historyResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    }
    catch(err)
    {
        console.error("Transfer History Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getLocalWalletTransactionDetailsById=async(req,res)=>
{
    try
    {
        const transactionId=req.params.id;
        const walletId=req.user.localWalletId;

        if (!transactionId || !isValidUUID(transactionId)) {
            return res.status(400).json({ message: "Invalid transaction ID format" });
        }

        const txDetails=await pool.query(
            'SELECT id, local_wallet_id, category_id, amount, type, description, status, is_synced, ai_metadata, created_at FROM transactions WHERE id = $1 AND local_wallet_id = $2',
            [transactionId, walletId]
        );

        if(txDetails.rows.length === 0)
        {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({
            transaction: txDetails.rows[0]
        });

    }
    catch(err)
    {
        console.error("Get Transfer Details Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};




const manualTransaction = async (req, res) => {
    const { type, category_id, description, idempotencyKey } = req.body;
    const amount = parseFloat(req.body.amount);
    const walletId = req.user.localWalletId;
    const userId = req.user.id;

    // 1. Validation
    if (isNaN(amount) || amount <= 0 || amount > 100000) {
        return res.status(400).json({ message: "Invalid amount. Must be between 0.01 and 100,000" });
    }
    if (!type || !['manual_expense', 'manual_income'].includes(type)) {
        return res.status(400).json({ message: "Type must be 'manual_expense' or 'manual_income'" });
    }
    if (!category_id) {
        return res.status(400).json({ message: "category_id is required" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    // 2. Validate category exists
    const categoryResult = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id]);
    if (categoryResult.rows.length === 0) {
        return res.status(400).json({ message: "Invalid category_id" });
    }
    const categoryName = categoryResult.rows[0].name;

    // 3. Redis Lock
    const lockKey = `lock:wallet:${walletId}`;
    const requestId = idempotencyKey;

    const acquiredLock = await redisClient.set(lockKey, requestId, { NX: true, EX: 10 });
    if (!acquiredLock) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 4. Idempotency Check
        const isExpense = type === 'manual_expense';
        const txAmount = isExpense ? -amount : amount;

        const insertTxQuery = `
            INSERT INTO transactions (local_wallet_id, amount, type, category_id, description, idempotency_key)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING *;
        `;

        const txResult = await client.query(insertTxQuery, [
            walletId, txAmount, type, category_id, description || null, idempotencyKey
        ]);

        if (txResult.rows.length === 0) {
            await client.query('ROLLBACK');

            const existingTx = await client.query(
                'SELECT * FROM transactions WHERE idempotency_key = $1',
                [idempotencyKey]
            );

            const wallet = await client.query('SELECT balance FROM local_wallets WHERE id = $1', [walletId]);

            return res.status(200).json({
                message: "Transaction already processed",
                transaction: {
                    id: existingTx.rows[0].id,
                    amount: existingTx.rows[0].amount,
                    type: existingTx.rows[0].type,
                    category: categoryName,
                    new_balance: wallet.rows[0].balance,
                    created_at: existingTx.rows[0].created_at
                }
            });
        }

        const newTransaction = txResult.rows[0];

        // 5. Update Wallet Balance
        let walletResult;
        if (isExpense) {
            const debitQuery = `
                UPDATE local_wallets
                SET balance = balance - $1, updated_at = NOW()
                WHERE id = $2 AND balance - $1 >= 0
                RETURNING balance;
            `;
            walletResult = await client.query(debitQuery, [amount, walletId]);

            if (walletResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: "Insufficient balance" });
            }
        } else {
            const creditQuery = `
                UPDATE local_wallets
                SET balance = balance + $1, updated_at = NOW()
                WHERE id = $2
                RETURNING balance;
            `;
            walletResult = await client.query(creditQuery, [amount, walletId]);
        }

        // 6. Update Budget spent (calculated from transactions, no current_spent column)
        // Budget tracking is done via querying transactions - no direct update needed

        // 7. Commit
        await client.query('COMMIT');

        // 8. Response 201
        res.status(201).json({
            transaction: {
                id: newTransaction.id,
                amount: newTransaction.amount,
                type: newTransaction.type,
                category: categoryName,
                new_balance: walletResult.rows[0].balance,
                created_at: newTransaction.created_at
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Manual Transaction Error:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();

        try {
            const currentLock = await redisClient.get(lockKey);
            if (currentLock === requestId) await redisClient.del(lockKey);
        } catch (redisErr) {
            console.error("Failed to release Redis lock:", redisErr);
        }
    }
};



const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

 const parseExpense=async(text) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview" 
        });

    const systemPrompt = `
            Task: Extract ALL financial transactions from Arabic/English text.
            IMPORTANT: Return a JSON ARRAY even if there is only one transaction.
            Required JSON Format:
            [
              {"amount": number, "category": string, "label": string, "confidence": float, "type": "expense" or "income"}
            ]
            Categories: [Food, Transport, Bills & Utilities, Entertainment, Health, Shopping, Education, Salary, Freelance, Gift, Other]
            Examples:
            - "300 جنيه فراخ و 150 جنيه بطاطس" → [{"amount":300,"category":"Food","label":"فراخ",...}, {"amount":150,"category":"Food","label":"بطاطس",...}]
            - "اشتريت كتاب بـ 200" → [{"amount":200,"category":"Education","label":"كتاب",...}]
        `;

        const result = await model.generateContent(`${systemPrompt}\n\nInput: "${text}"`);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(jsonText);


       return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
        console.error("AI ERROR:", err.message);
        throw err;
    }
}



const CATEGORY_MAP = async () => {
    const result = await pool.query('SELECT id, name FROM categories');
    const map = {};
    result.rows.forEach(row => {
        map[row.name.toLowerCase()] = row.id;
    });
    return map;
}

const CATEGORY_TYPE = async () => {
    const result = await pool.query('SELECT id, type FROM categories');
    const map = {};
    result.rows.forEach(row => {
        map[row.id] = row.type;
    });
    return map;
}

const aiTransaction = async (req, res) => {
    const { text, idempotencyKey } = req.body;
    const walletId = req.user.localWalletId;
    const userId = req.user.id;

    // 1. Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required" });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: "Idempotency key is required" });
    }

    // 2. Call AI
    let aiResults;
    try {
        aiResults = await parseExpense(text);
    } catch (err) {
        return res.status(500).json({ message: "AI parsing failed. Please try again." });
    }

    // 3. Validate كل item
    for (const item of aiResults) {
        if (!item.amount || isNaN(item.amount) || item.amount <= 0) {
            return res.status(400).json({ 
                message: "AI could not extract a valid amount", 
                ai_result: item 
            });
        }
        if (item.confidence < 0.5) {
            return res.status(400).json({ 
                message: "AI confidence too low. Please be more specific.", 
                ai_result: item 
            });
        }
    }

    // 4. Category maps
    const categoryMap = await CATEGORY_MAP();
    const categoryTypeMap = await CATEGORY_TYPE();

    // 5. Redis Lock
    const lockKey = `lock:wallet:${walletId}`;
    const acquiredLock = await redisClient.set(lockKey, idempotencyKey, { NX: true, EX: 10 });
    if (!acquiredLock) {
        return res.status(409).json({ message: "Request already in progress. Please wait." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertedTransactions = [];
        let currentBalance = null;

        for (let i = 0; i < aiResults.length; i++) {
            const { amount, category, label, confidence, type } = aiResults[i];

            const categoryId = categoryMap[(category || 'other').toLowerCase()] || 11;
            const txType = categoryTypeMap[categoryId] || type;
            const isExpense = txType === 'expense';
            const txAmount = isExpense ? -amount : amount;

            // Unique idempotency key لكل transaction
            const itemIdempotencyKey = `${idempotencyKey}-${i}`;

            const aiMetadata = JSON.stringify({ 
                label, confidence, raw_text: text, category_ai: category 
            });

            // Insert مع idempotency
            const insertTxQuery = `
                INSERT INTO transactions 
                    (local_wallet_id, amount, type, category_id, description, ai_metadata, idempotency_key)
                VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
                ON CONFLICT (idempotency_key) DO NOTHING
                RETURNING *;
            `;

            const txResult = await client.query(insertTxQuery, [
                walletId,
                txAmount,
                isExpense ? 'ai_expense' : 'ai_income',
                categoryId,
                label || null,
                aiMetadata,
                itemIdempotencyKey
            ]);

            // لو duplicate — جيب الـ transaction القديمة
            if (txResult.rows.length === 0) {
                const existingTx = await client.query(
                    'SELECT * FROM transactions WHERE idempotency_key = $1',
                    [itemIdempotencyKey]
                );
                insertedTransactions.push({
                    ...existingTx.rows[0],
                    duplicate: true
                });
                continue;
            }

            // Update wallet balance
            let walletResult;
            if (isExpense) {
                walletResult = await client.query(`
                    UPDATE local_wallets
                    SET balance = balance - $1, updated_at = NOW()
                    WHERE id = $2 AND balance - $1 >= 0
                    RETURNING balance;
                `, [amount, walletId]);

                if (walletResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(409).json({ 
                        message: `Insufficient balance for: ${label || category}` 
                    });
                }
            } else {
                walletResult = await client.query(`
                    UPDATE local_wallets
                    SET balance = balance + $1, updated_at = NOW()
                    WHERE id = $2
                    RETURNING balance;
                `, [amount, walletId]);
            }

            currentBalance = walletResult.rows[0].balance;

            insertedTransactions.push({
                id: txResult.rows[0].id,
                amount: txResult.rows[0].amount,
                type: txResult.rows[0].type,
                category,
                description: label,
                confidence,
                created_at: txResult.rows[0].created_at
            });
        }

        await client.query('COMMIT');

        // لو مفيش balance اتحسب (كل الـ items كانت duplicates)
        if (!currentBalance) {
            const wallet = await client.query(
                'SELECT balance FROM local_wallets WHERE id = $1', [walletId]
            );
            currentBalance = wallet.rows[0].balance;
        }

        return res.status(201).json({
            transactions: insertedTransactions,
            new_balance: currentBalance,
            count: insertedTransactions.length
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("AI Transaction Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        client.release();
        try {
            const currentLock = await redisClient.get(lockKey);
            if (currentLock === idempotencyKey) await redisClient.del(lockKey);
        } catch (redisErr) {
            console.error("Failed to release Redis lock:", redisErr);
        }
    }
};



module.exports = { deposit, withdraw, transfer, transfersHistory, gettransferDetailsById,getLocalWalletTransactionDetailsById,transferHistoryForLocalWallet, manualTransaction, parseExpense, aiTransaction,depositToLocalWallet };