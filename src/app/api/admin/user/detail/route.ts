import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/dbconnect";
import User from "../../../../model/User";
import { getUserData } from "../../../../../helper/getUserData";
import { getUserDate } from "../../../../../helper/getUserData";
import { json } from "stream/consumers";
import { cookies } from "next/headers";
import { request } from "http";
import jwt from "jsonwebtoken";
import { console } from "inspector";

export async function GET(req:NextRequest) {

    try{
        const cookieStore =await cookies();
        const token = cookieStore.get("token")?.value || "";
       
        if (!token) {
            console.log('Token does not exist');
            return NextResponse.json({ message: 'Token does not exist' }, { status: 401 });
          }
          await connectDB()
        const decoded=getUserDate(token)
     if(!decoded||decoded.id){
        console.log('Token are not valid ');
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
     }
     const {searchParams}=new URL(req.url)
     const page=parseInt(searchParams.get("page")||"1");
     const limit=parseInt(searchParams.get("limit")||"5")
     const skip=(page-1)*limit
     const users=await User.find({role:{ $in: ["user", "admin"] }}).skip(skip).limit(limit).lean();

     const totalUsers = await User.countDocuments({ role: { $in: ["user", "admin"] } });
     const totalPages = Math.ceil(totalUsers / limit);
     
     const userss = await User.find({ role: { $in: ["user", "admin"] } }).lean();
     
     if (!users || users.length === 0) {
       console.log("No users exist");
       return NextResponse.json({ message: "No users found" }, { status: 404 });
     }
     
  
      // Return user list
      return NextResponse.json({ message: "List of users", users,totalPages }, { status: 200 });
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }