import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
export const register =async (req,res)=>{
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.json({
                success:false,
                message:"Please fill all fields"
            })
        }
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.json({
                success:false,
                message:"Email already exists"
            })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashedPassword});
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:'7d'
        })
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000,
        })
        return res.json({
            success:true,
            user:{email:user.email,name:user.name},
            message:"User created successfully",
        })
    } catch (error) {
        console.log(error.message);
        
        res.json({
            success:false,
            message:error.message
        })
    }

}
export const 
login =async (req,res)=>{
    try {
       const {email,password}=req.body;
       if(!email || !password){
        return res.json({
            success:false,
            message:"Please fill all fields"
        })
       }
       const user=await User.findOne({email});
       if(!user){
        return res.json({
            success:false,
            message:"Invalid email or password"
        })
       }
       const isMatch=await bcrypt.compare(password,user.password)
       if(!isMatch){
        return res.json({
            success:false,
            message:"Invalid email or password"
        })
       }
       const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
    res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:process.env.NODE_ENV==='production'?'none':'strict',
        maxAge:7*24*60*60*1000,
    })
    return res.json({
        success:true,
        user:{email:user.email,name:user.name},
        message:"LoggedIn successfully",
    })

        
    } catch (error) {
        console.log(error.message);
        
        res.json({
            success:false,
            message:error.message
        })
    }
}

export const isAuth=async (req,res)=>{
    try {
        const {userId}=req;
        const user=await User.findById(userId).select("-password");
        return res.json({
            success:true,
            user:user
        })
        
    } catch (error) {
        console.log(error.message);
        
        res.json({
            success:false,
            message:error.message
        })
    }
} 
export const logout=async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',

        });
        return res.json({
            success:true,
            message:"Logged out successfully"
        })
    } catch (error) {
        console.log(error.message);
        
        res.json({
            success:false,
            message:error.message
        })
    }
}