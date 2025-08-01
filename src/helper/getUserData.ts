// helper/getUserData.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
// export const getUserData = (req: NextRequest) => {
//   const authHeader = req.headers.get("authorization");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new Error("No token provided");
//   }

//   const token = authHeader.split(" ")[1];

//   const decoded = jwt.verify(token, process.env.Token_Secret_key!) as { id: string };
//   return decoded.id;
// };
export const getUserDate = (token: string) => {
  try {
    const decoded: any = jwt.verify(token, process.env.Token_Secret_key!);
    return  decoded.id; // Ensure that you're checking for the correct field in your JWT
  } catch (error) {
    throw new Error("Invalid token");
  }
};