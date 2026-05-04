const pool=require('./db');
const bcrypt=require('bcrypt');
const JWT=require('./middelware/JwtMake');
const {sendEmail}=require('./middelware/sendOtp');
const NodeCache = require("node-cache");
const crypto = require('crypto');
const QRCode = require("qrcode");
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pw) => typeof pw === 'string' && pw.length >= 8;
const isValidName = (name) => typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 50;



const otpCache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

const sendOTPEmail = async(req,res) => {
  try {
    console.log("Send OTP request received:", req.body);
    
    const {email} = req.body;
    
    if (!email ) {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }
    
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 ",
      [email]
    );
    
    const existing = result.rows;
    if (existing.length > 0) {
      return res.status(409).json({ 
        message: "Email already exists" 
      });
    }
    
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);
    
    otpCache.set(email, otp);
    
    await sendEmail(email, otp);
    console.log(`OTP sent successfully to ${email}`);
    
    return res.status(200).json({ 
      message: "OTP sent to your email successfully" 
    });
    
  } catch(err) {
    console.error("Error in sendOTPEmail:", err);
    
    // More specific error messages
    if (err.message.includes('connect ECONNREFUSED')) {
      return res.status(500).json({ 
        message: "Database connection failed" 
      });
    }
    
    if (err.message.includes('Invalid login')) {
      return res.status(500).json({ 
        message: "Email service configuration error" 
      });
    }
    
    return res.status(500).json({ 
      message: "Failed to send OTP. Please try again." 
    });
  }
};



const signup=async(req,res)=>
    {
            const client = await pool.connect();

        try
        {
            await client.query('BEGIN');
const {name,email,password,otp}=req.body;
 const storedOtp = otpCache.get(email);
 if (!storedOtp || storedOtp !== otp) {
  return res.status(400).send({ message: "Invalid or expired OTP" });
}
   otpCache.del(email);
console.log('Signup Request:', {name, email}); // Debug log

if (!name || !isValidName(name)) {
    await client.query('ROLLBACK');
    return res.status(400).json({message:'Name must be between 2 and 50 characters'});
}
if (!email || !isValidEmail(email)) {
    await client.query('ROLLBACK');
    return res.status(400).json({message:'Invalid email format'});
}
if (!password || !isStrongPassword(password)) {
    await client.query('ROLLBACK');
    return res.status(400).json({message:'Password must be at least 8 characters'});
}

const userExit=await client.query('SELECT email FROM users WHERE email=$1',[email.toLowerCase().trim()]);

if(userExit.rows.length>0)
{
    await client.query('ROLLBACK');
    return res.status(409).json({message:'User already exists'});
}
const hashedPassword=await bcrypt.hash(password.toString(),12);



const newUser=await client.query('INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id, name, email, created_at',[name.trim(),email.toLowerCase().trim(),hashedPassword]);

const makeNewWallet=await client.query('INSERT INTO wallets (user_id,balance) VALUES ($1,$2) RETURNING *',[newUser.rows[0].id,0.00]);

await client.query('COMMIT');
res.status(201).json({message:'User created successfully',user:newUser.rows[0],wallet:makeNewWallet.rows[0]});

        }catch(err)
        {
          await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({message:'Internal server error'});
        }
        finally
        {
          if (client) client.release();
        }
    };


    const  login=async(req,res)=>
    {
        try
        {
            const {email,password}=req.body;
            

            const user=await pool.query('SELECT email,password,id FROM users WHERE email=$1',[email]);
            if(user.rows.length===0)
            {
                return res.status(400).json({message:'Invalid email or password'});
            }
         
           

            const validPassword=await bcrypt.compare(password.toString(),user.rows[0].password);
            if(!validPassword)
            {
                return res.status(400).json({message:'Invalid email or password'});
            }

            const token=JWT.generateToken({id:user.rows[0].id,email:user.rows[0].email});

            // Never return password hash to client
            res.status(200).json({message:'Login successful',user:{id:user.rows[0].id,email:user.rows[0].email},token:token});

        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({message:'Internal server error'});
        }
    };




const profile=async(req,res)=>
{
    try
    {
        const userId=req.user.id;

        const user=await pool.query('SELECT u.id,u.name,u.email,w.balance,w.id as wallet_id,w.currency FROM users u JOIN wallets w ON u.id=w.user_id WHERE u.id=$1',[userId]);
        if(user.rows.length===0)
        {
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({user:user.rows[0]});

    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({message:'Internal server error'});
    }
}


const updateProfile=async(req,res)=>
    {
        try
        {
            const userId=req.user.id;
            const {name}=req.body;

            if (!name || !isValidName(name)) {
                return res.status(400).json({message:'Name must be between 2 and 50 characters'});
            }

            const updatedUser=await pool.query('UPDATE users SET name=$1 WHERE id=$2 RETURNING id, name, email',[name.trim(),userId]);
            if(updatedUser.rows.length===0)
            {
                return res.status(404).json({message:'User not found'});
            }

            res.status(200).json({message:'Profile updated successfully',user:updatedUser.rows[0]});
        }
        catch(err)
        {
            console.log(err);
            res.status(500).json({message:'Internal server error'});
        }
    } 


const ChangePassword=async(req,res)=>
{
    try
    {
        const userId=req.user.id;
        const {oldPassword,newPassword}=req.body;

        const user=await pool.query('SELECT password FROM users WHERE id=$1',[userId]);
        if(user.rows.length===0)
        {
            return res.status(404).json({message:'User not found'});
        }

        const validPassword=await bcrypt.compare(oldPassword.toString(),user.rows[0].password);
        if(!validPassword)
        {
            return res.status(400).json({message:'Invalid old password'});
        }

        if (!newPassword || !isStrongPassword(newPassword)) {
            return res.status(400).json({message:'New password must be at least 8 characters'});
        }

        const hashedNewPassword=await bcrypt.hash(newPassword.toString(),12);

        const updatedUser=await pool.query('UPDATE users SET password=$1 WHERE id=$2 RETURNING id, name, email',[hashedNewPassword,userId]);
        if(updatedUser.rows.length===0)
        {
            return res.status(404).json({message:'User not found'});
        }

        // Never return password hash
        res.status(200).json({message:'Password changed successfully'});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message:'Internal server error'});
    }
}

const walletsInfo=async(req,res)=>
    {
        try
        {
            const userId=req.user.id;
            const wallets=await pool.query('SELECT w.id,w.balance,w.currency,w.updated_at FROM wallets w WHERE w.user_id=$1',[userId]);
            res.status(200).json({wallets:wallets.rows});

        }
        catch(err)        {
            console.log(err);
            res.status(500).json({message:'Internal server error'});
        }

    }



    const makeLocalWallet=async(req,res)=>
        {
try
{

const userId=req.user.id;

const existingLocalWallet=await pool.query('SELECT id FROM local_wallets WHERE user_id=$1',[userId]);
if(existingLocalWallet.rows.length>0)
{
    return res.status(400).json({message:'Local wallet already exists for this user'});
}



const makeLocalWallet=await pool.query('INSERT INTO local_wallets (user_id,balance) VALUES ($1,$2) RETURNING *',[userId,0.00]);
res.status(201).json({message:'Local wallet created successfully',wallet:makeLocalWallet.rows[0]});

}
catch(err)
{
    console.log(err);
    res.status(500).json({message:'Internal server error'});
}

        }


        const getLocalWallets=async(req,res)=>
        {
            try
            {
                const userId=req.user.id;
                const localWallets=await pool.query('SELECT id,balance,updated_at FROM local_wallets WHERE user_id=$1',[userId]);
                res.status(200).json({localWallets:localWallets.rows});

            }
        catch(err)
        {
            console.log(err);
            res.status(500).json({message:'Internal server error'});
        }
    }


  const QrProfile = async (req, res) => {
    try {
        const email = req.user.email;

        QRCode.toDataURL(email, (err, url) => {
            if (err) {
                console.error("Error generating QR code:", err);
                return res.status(500).json({ message: "Failed to generate QR code" });
            }
            res.status(200).json({ 
                qrCode: url,
                email 
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
        

module.exports={signup,login,profile,updateProfile,ChangePassword, walletsInfo, makeLocalWallet, getLocalWallets,sendOTPEmail, QrProfile};