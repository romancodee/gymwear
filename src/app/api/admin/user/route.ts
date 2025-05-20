
export const runtime = "nodejs";
import User from '../../../model/User';
import connectDB from "../../../lib/dbconnect";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserDate } from "../../../../helper/getUserData";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value || "";

    if (!token) {
      return NextResponse.json({ message: "Token does not exist" }, { status: 401 });
    }

    await connectDB();
    console.log("Connected to DB");

    const decoded = getUserDate(token);

    if (!decoded ) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    console.log("Deleting user with ID:", params.id);

    const userDel = await User.findByIdAndDelete(params.id);

    if (!userDel) {
      console.log("No user found for deletion");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Server error:", error.message);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
){
  const cookieStore=await cookies();
  const token=cookieStore.get("token")?.value||""
  if(!token){
    return NextResponse.json({message:"No token Exist"
    },{status:401})
  }
  const decoded=await getUserDate(token)
  if(!decoded){
    return NextResponse.json({message:"invalid token"},{status:401})
  }
  try {
    // Fetch the user from the database
    await connectDB()
    const {id}=params
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while fetching user' }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
){
  const cookieStore=await cookies();
  const token=cookieStore.get("token")?.value||""
  if(!token){
    return NextResponse.json({message:"No token Exist"
    },{status:401})
  }
  const decoded=await getUserDate(token)
  if(!decoded){
    return NextResponse.json({message:"invalid token"},{status:401})
  }
  const currentadmin=await User.findById(decoded).select("-password")
 
  try{
    const { id } = await params;
    await connectDB();
  const {firstname,lastname,role,isActive,email}=await req.json()
  if(currentadmin.email==email){
    return NextResponse.json({message:"You are not authorized to perform this action"},{status:300})
  }
  const updatedUser=await User.findByIdAndUpdate(id,{firstname,lastname,role,isActive},{new:true})
  console.log("Updating role to:", role);
  if (!updatedUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { message: "User updated successfully", user: updatedUser },
    { status: 200 }
  );
} catch (error:any) {
  console.error("Update error:", error);
  return NextResponse.json(
    { message: "Failed to update user" },
    { status: 500 }
  );
}


}