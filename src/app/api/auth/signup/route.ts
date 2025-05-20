import connectDb from "../../../lib/dbconnect";
import User from "../../../model/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";



export async function POST(req: NextRequest) {
  try {
    await connectDb(); 

    const body = await req.json();
    const { firstname,lastname, email, password} = body;


  
    if (!firstname ||!lastname|| !email || !password)  {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json( { error: "Email already exists. Please use a different one." },{ status: 400 });
    }

  
    const hashedPassword = await bcryptjs.hash(password, 10);
   

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      createdAt:Date.now(),
      lastUpdate:Date.now(),
      role:"user",
      isActive:true
    });

    const result = await newUser.save();
    console.log("User saved:", result); 

    return NextResponse.json({ message: "User created successfully", result }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error); 
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
