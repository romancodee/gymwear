import User from "../../../../../model/User"
import connectDB from "../../../../../lib/dbconnect"
import { cookies } from "next/headers"
import { NextResponse } from "next/server";
import { getUserDate } from "../../../../../../helper/getUserData";

export async function PATCH(req:Request,{params}:{params:{id:string}}) {
    try{

        const {isActive}=await req.json();
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
            if(decoded==params.id){
             
       return NextResponse.json({ message: 'You can not change status your own account' }, {status:402})
            }
      const user=await  User.findByIdAndUpdate(params.id,{isActive},{new:true}).select("-password")
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });

      return Response.json({ message: "Status updated", user });
    }
    catch(error:any){
        console.log(error ," failed api")

    }
    
}