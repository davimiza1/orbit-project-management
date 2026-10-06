import { Router } from 'express';import { z } from 'zod';import { auth,type AuthedRequest } from '../middleware.js';import { Task } from '../models.js';
export const taskRouter=Router();taskRouter.use(auth);
const body=z.object({title:z.string().min(2).max(140),description:z.string().max(2000).default(''),status:z.enum(['backlog','in-progress','in-review','done']).default('backlog'),priority:z.enum(['Low','Medium','High']).default('Medium'),label:z.string().max(30).default('Product'),projectId:z.string(),assignee:z.string().optional(),dueDate:z.coerce.date().optional()});
taskRouter.get('/',async(req,res)=>{const filter=req.query.projectId?{project:req.query.projectId}:{};res.json(await Task.find(filter).populate('assignee','name avatar').sort({createdAt:-1}))});
taskRouter.post('/',async(req:AuthedRequest,res)=>{const data=body.parse(req.body);const task=await Task.create({...data,project:data.projectId,createdBy:req.userId});res.status(201).json(task)});
taskRouter.patch('/:id',async(req,res)=>{const task=await Task.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true});if(!task)return res.status(404).json({message:'Task not found'});res.json(task)});
taskRouter.delete('/:id',async(req,res)=>{const task=await Task.findByIdAndDelete(req.params.id);if(!task)return res.status(404).json({message:'Task not found'});res.status(204).end()});
