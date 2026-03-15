const JWT=require('jsonwebtoken');
const pool=require('../db');
const sureTockentoken=(req,res,next)=>
{
    const authHeader=req.headers['authorization']||req.headers['Authorization'];
    const token=authHeader && authHeader.split(' ')[1];

    if(token==null)
    {
        return res.status(401).json({message:'No token provided'});
    }
    JWT.verify(token,process.env.JWT_SECRET,(err,user)=>
    {
        if(err)        {
            return res.status(403).json({message:'Invalid token'});
        }
        req.user=user;
        next();
    });
};

const walletFound=async (req,res,next)=>
{
    try
    {
const userId=req.user.id;
const wallet=await pool.query('SELECT id FROM wallets WHERE user_id=$1',[userId]);

        if(wallet.rows.length === 0) {
            return res.status(404).json({message:'Wallet not found for user'});
        }
        req.user.walletId = wallet.rows[0].id;
        next();
    } catch (err) {
        return res.status(500).json({message:'Internal server error'});
    }
};



const LocalWalletFound=async (req,res,next)=>
{
    try
    {
const userId=req.user.id;
const localWallet=await pool.query('SELECT id FROM local_wallets WHERE user_id=$1',[userId]);
        if(localWallet.rows.length === 0) {
            return res.status(404).json({message:'Local wallet not found for user'});
        }
        req.user.localWalletId = localWallet.rows[0].id;
        next();
    } catch (err) {
        return res.status(500).json({message:'Internal server error'});
    }
}

module.exports={sureTockentoken,walletFound,LocalWalletFound};