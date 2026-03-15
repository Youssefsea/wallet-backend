const pool=require('./db');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const getAllCategories=async(req,res)=>
{
    try
    {
        const categories=await pool.query('SELECT * FROM categories');
        res.status(200).json({categories:categories.rows});

    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
};

const addNewCategory=async(req,res)=>
{
    try
    {
const {name,type}=req.body;
if(!name || !type)
{
    return res.status(400).json({message:'Name and type are required'});
}
if(type !== 'income' && type !== 'expense')
{
    return res.status(400).json({message:'Type must be either income or expense'});
}
const newCategory=await pool.query('INSERT INTO categories (name,type) VALUES ($1,$2) RETURNING *',[name.trim(),type]);
res.status(201).json({message:'Category added successfully',category:newCategory.rows[0]});

    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
};



const getBudgetsMonthly=async(req,res)=>
{
    try
    {
        const userId=req.user.id;
const{month_year}=req.query;
if(!month_year || !/^\d{4}-\d{2}$/.test(month_year))
{
    return res.status(400).json({message:'month_year query parameter is required and must be in YYYY-MM format'});
}
const budgets=await pool.query(`SELECT b.id,b.monthly_limit,b.month_year,c.name as category_name,c.type as category_type 
FROM budgets b 
JOIN categories c ON b.category_id=c.id 
WHERE b.user_id=$1 AND b.month_year=$2`,[userId,month_year]);

res.status(200).json({budgets:budgets.rows});


    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
};


const creatBudgetMonthly=async(req,res)=>
{
    try
    {
const userId=req.user.id;
const{category_id,month_year,monthly_limit}=req.body;
if(!category_id || !month_year || !monthly_limit)
{
    return res.status(400).json({message:'category_id, month_year and monthly_limit are required'});
}
if(!/^\d{4}-\d{2}$/.test(month_year))
{
    return res.status(400).json({message:'month_year must be in YYYY-MM format'});
}
const category=await pool.query('SELECT * FROM categories WHERE id=$1',[category_id]);
if(category.rows.length===0)
{
    return res.status(404).json({message:'Category not found'});
}
const newBudget=await pool.query('INSERT INTO budgets (user_id,category_id,month_year,monthly_limit) VALUES ($1,$2,$3,$4) RETURNING *',[userId,category_id,month_year,monthly_limit]);
res.status(201).json({message:'Budget created successfully',budget:newBudget.rows[0]});




    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
}


const updateBudgetMonthly=async(req,res)=>
{
    try{
const userId=req.user.id;
const {monthly_limit}=req.body;
const budgetId=req.params.id;
if(!monthly_limit)
{
    return res.status(400).json({message:'monthly_limit is required'});
}
console.log("Updating budget with ID:", budgetId, "New monthly limit:", monthly_limit);
const updatedBudget=await pool.query('UPDATE budgets SET monthly_limit=$1 WHERE id=$2 AND user_id=$3 RETURNING *',[monthly_limit,budgetId,userId]);
if(updatedBudget.rows.length===0)
{
    return res.status(404).json({message:'Budget not found'});
}
res.status(200).json({message:'Budget updated successfully',budget:updatedBudget.rows[0]});


    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
}




const restOfTheBudgetOfRealWallet=async(req,res)=>
    {
try
{
const userId=req.user.id;
const{month_year}=req.query;
const walletId=req.user.walletId;
if(!month_year || !/^\d{4}-\d{2}$/.test(month_year))
{
    return res.status(400).json({message:'month_year query parameter is required and must be in YYYY-MM format'});


}
const query = `
SELECT 
    b.id,
    b.monthly_limit,
    b.month_year,
    c.name AS category_name,
    c.type AS category_type,
    COALESCE(SUM(t.amount), 0) AS spent_amount
FROM budgets b
JOIN categories c 
    ON b.category_id = c.id
LEFT JOIN transactions t 
    ON t.wallet_id = $3
    AND t.category_id = b.category_id
    AND t.status = 'completed'
    AND to_char(t.created_at, 'YYYY-MM') = $2
WHERE b.user_id = $1 
    AND b.month_year = $2
GROUP BY 
    b.id,
    b.monthly_limit,
    b.month_year,
    c.name,
    c.type
`;

const budgets = await pool.query(query, [userId, month_year, walletId]);

res.status(200).json({
  success: true,
  budgets: budgets.rows
});
}
catch(err)
{
    console.error(err);
    res.status(500).json({message:'Internal server error'});
}

    }




const restOfTheBudgetOfLocalWallet=async(req,res)=>

    {
 try {
    const userId = req.user.id;
    const { month_year } = req.query;
    const localWalletId = req.user.localWalletId;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({
        message: 'month_year query parameter is required and must be in YYYY-MM format'
      });
    }

    const query = `
      SELECT 
          b.id AS budget_id,
          b.monthly_limit,
          b.month_year,
          c.name AS category_name,
          c.type AS category_type,
          COALESCE(SUM(t.amount), 0) AS spent_amount,
          b.monthly_limit + COALESCE(SUM(t.amount), 0) AS remaining
      FROM budgets b
      JOIN categories c 
          ON b.category_id = c.id
      LEFT JOIN transactions t 
          ON t.local_wallet_id = $3
          AND t.category_id = b.category_id
          AND t.status = 'completed'
          AND to_char(t.created_at, 'YYYY-MM') = $2
      WHERE b.user_id = $1 
          AND b.month_year = $2
      GROUP BY 
          b.id,
          b.monthly_limit,
          b.month_year,
          c.name,
          c.type
    `;

    const budgets = await pool.query(query, [userId, month_year, localWalletId]);

    
    res.status(200).json({
      success: true,
      budgets: budgets.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }


    }


const transictionhistoryForLocalWalletAtBudgetID = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;
        const localWalletId = req.user.localWalletId;

        const budget = await pool.query(
            'SELECT category_id, month_year FROM budgets WHERE id=$1 AND user_id=$2',
            [budgetId, userId]
        );

        if (budget.rows.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const { category_id, month_year } = budget.rows[0];

        const transactions = await pool.query(`
            SELECT t.id, t.amount, t.created_at, t.description,
                   c.name AS category_name, c.type AS category_type
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.local_wallet_id = $1
              AND t.category_id = $2
              AND t.status = 'completed'
              AND to_char(t.created_at, 'YYYY-MM') = $3
            ORDER BY t.created_at DESC
        `, [localWalletId, category_id, month_year]);

        res.status(200).json({ transactions: transactions.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const transictionhistoryForRealWalletAtBudgetID = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;
        const walletId = req.user.walletId;

        const budget = await pool.query(
            'SELECT category_id, month_year FROM budgets WHERE id=$1 AND user_id=$2',
            [budgetId, userId]
        );

        if (budget.rows.length === 0) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const { category_id, month_year } = budget.rows[0];

        const transactions = await pool.query(`
            SELECT t.id, t.amount, t.created_at, t.description,
                   c.name AS category_name, c.type AS category_type
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.wallet_id = $1
              AND t.category_id = $2
              AND t.status = 'completed'
              AND to_char(t.created_at, 'YYYY-MM') = $3
            ORDER BY t.created_at DESC
        `, [walletId, category_id, month_year]);

        res.status(200).json({ transactions: transactions.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

 const haveAdviceAI=async(month_year,city,summary,categoriesNeedSearch) => {
    try {
        const model = genAI.getGenerativeModel({ 
           model: "gemini-3-flash-preview" 
        });
        const today = new Date();
const todayStr = today.toLocaleDateString('ar-EG', { 
    day: 'numeric', month: 'long', year: 'numeric' 
});
const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();


           const prompt = `
أنت مستشار مالي ذكي وعملي. بتتكلم مع مستخدم مصري في مدينة ${city}.
📅 تاريخ النهارده: ${todayStr} — باقي ${daysLeftInMonth} يوم على آخر الشهر.

📊 ملخص مصاريفه هذا الشهر (${month_year}):
${summary.map(b => `- ${b.category}: صرف ${b.spent} جنيه من أصل ${b.limit} جنيه (${b.percentage}%) الشرح بتاع اللي صرفه هو ${b.description} استخدم الai في اللي صرفه و قال كدا ${b.ai_metadata}`).join("\n")}

🔴 الكاتيجوريز اللي تجاوزت 80%: ${categoriesNeedSearch || "لا يوجد"}
قول النهارده يوم كام في الشهر و باقي كام يوم على نهاية الشهر.
المطلوب منك:
1. ابحث على الإنترنت عن أخبار اليوم المتعلقة بأسعار ${categoriesNeedSearch} في ${city} - مثلاً أماكن أرخص، عروض، أسواق شعبية.
2. اكتب نصيحة طبيعية وكأنك صديق بيكلمه - مش قائمة خطوات.
3. لو الكاتيجوري طعام → اقترح أماكن أو أسواق فيها أسعار أرخص في ${city} بناءً على أحدث الأخبار.
4. لو ترفيه → اقترح بدائل أرخص أو مجانية قريبة منه.
5. قوله بصراحة لو في كاتيجوري يقلل فيها وكاتيجوري تانية يزيد بادجتها - بس بطريقة محترمة وذكية.
6. الرد كله بالعربي، أسلوب عامي مصري خفيف.
7. النصيحة تكون فقرة واحدة أو اتنين - مش نقاط.

ابدأ الرد مباشرة بالنصيحة بدون مقدمات.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const advice = response.text();

    return advice;

  } catch (err) {
    console.error("AI Advice Error:", err.message);
  }
};


const getAdvice=async(req,res)=>
{
    try
    {
const userId=req.user.id;
const{month_year,city}=req.body;
const walletId=req.user.walletId;


    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ message: "month_year مطلوب بصيغة YYYY-MM" });
    }

    if (!city) {
      return res.status(400).json({ message: "city مطلوب" });
    }

    const budgetsResult = await pool.query(`
  SELECT 
    b.id, b.monthly_limit, b.month_year,
    c.name AS category_name, c.type AS category_type,
    COALESCE(SUM(t.amount), 0) AS spent_amount
  FROM budgets b
  JOIN categories c ON b.category_id = c.id
  LEFT JOIN transactions t
    ON t.category_id = b.category_id
    AND t.status = 'completed'
    AND to_char(t.created_at, 'YYYY-MM') = $2
    AND t.wallet_id = $3
  WHERE b.user_id = $1 AND b.month_year = $2
  GROUP BY b.id, b.monthly_limit, b.month_year, c.name, c.type
`, [userId, month_year, walletId]);



        const budgets = budgetsResult.rows;
    if (budgets.length === 0) {
      return res.status(404).json({ message: "مفيش بادجت للشهر ده" });
    }


        const summary = budgets.map(b => ({
      category: b.category_name,
      type: b.category_type,
      limit: parseFloat(b.monthly_limit),
      spent: parseFloat(b.spent_amount),
      remaining: parseFloat(b.monthly_limit) - parseFloat(b.spent_amount),
      percentage: Math.round((parseFloat(b.spent_amount*-1) / parseFloat(b.monthly_limit)) * 100),       

    }));

    const overBudget = summary.filter(b => b.percentage >= 80);
    const categoriesNeedSearch = overBudget.map(b => b.category).join(", ");

  
 
 
const advice = await haveAdviceAI(month_year, city, summary, categoriesNeedSearch);
return res.status(200).json({
  success: true,
  month_year,
  summary,
  advice
});




    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
}


const getAdviceForLocalWallet=async(req,res)=>
    {
    try
    {
const userId=req.user.id;
const{month_year,city}=req.body;
const localWalletId=req.user.localWalletId;

    if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
      return res.status(400).json({ message: "month_year مطلوب بصيغة YYYY-MM" });
    }

    if (!city) {
      return res.status(400).json({ message: "city مطلوب" });
    }

    const budgetsResult = await pool.query(`
  SELECT 
    b.id, b.monthly_limit, b.month_year,
    c.name AS category_name, c.type AS category_type,
    COALESCE(SUM(t.amount), 0) AS spent_amount,
    t.description AS description,
    t.ai_metadata AS ai_metadata
  FROM budgets b
  JOIN categories c ON b.category_id = c.id
  LEFT JOIN transactions t
    ON t.category_id = b.category_id
    AND t.status = 'completed'
    AND to_char(t.created_at, 'YYYY-MM') = $2
    AND t.local_wallet_id = $3
  WHERE b.user_id = $1 AND b.month_year = $2
  GROUP BY b.id, b.monthly_limit, b.month_year, c.name, c.type, t.description, t.ai_metadata
`, [userId, month_year, localWalletId]);


        const budgets = budgetsResult.rows;
    if (budgets.length === 0) {
      return res.status(404).json({ message: "مفيش بادجت للشهر ده" });
    }


        const summary = budgets.map(b => ({
      category: b.category_name,
      type: b.category_type,
      limit: parseFloat(b.monthly_limit),
      spent: parseFloat(b.spent_amount),
      remaining: parseFloat(b.monthly_limit) + parseFloat(b.spent_amount),
      percentage: Math.round((parseFloat(b.spent_amount*-1) / parseFloat(b.monthly_limit)) * 100),
      description: b.description||"لا يوجد وصف",
        ai_metadata: b.ai_metadata || "لا يوجد بيانات AI"

    }));

    const overBudget = summary.filter(b => b.percentage >= 80);
    const categoriesNeedSearch = overBudget.map(b => b.category).join(", ");

 
console.log("Summary for AIlocal Advice:", summary,"", "Categories needing search:", categoriesNeedSearch,"City:", city,"Month-Year:", month_year); 
const advice = await haveAdviceAI(month_year, city, summary, categoriesNeedSearch);
return res.status(200).json({
  success: true,
  month_year,
  summary,
  advice
});




    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
}










module.exports={getAllCategories,addNewCategory,getBudgetsMonthly,creatBudgetMonthly,updateBudgetMonthly,restOfTheBudgetOfRealWallet,restOfTheBudgetOfLocalWallet,getAdvice,getAdviceForLocalWallet,transictionhistoryForLocalWalletAtBudgetID,transictionhistoryForRealWalletAtBudgetID};