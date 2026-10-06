import type { NextFunction,Request,Response } from 'express';import jwt from 'jsonwebtoken';import { config } from './config.js';
export interface AuthedRequest extends Request{userId?:string}
export function auth(req:AuthedRequest,res:Response,next:NextFunction){const token=req.headers.authorization?.replace('Bearer ','');if(!token)return res.status(401).json({message:'Authentication required'});try{const payload=jwt.verify(token,config.JWT_SECRET) as {sub:string};req.userId=payload.sub;next()}catch{return res.status(401).json({message:'Invalid or expired token'})}}
export function errors(error:unknown,_req:Request,res:Response,next:NextFunction){void next;console.error(error);res.status(500).json({message:'Something went wrong'})}
