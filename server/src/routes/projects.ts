import { Router } from "express";
import { z } from "zod";
import { auth, type AuthedRequest } from "../middleware.js";
import { Project, Workspace } from "../models.js";
export const projectRouter = Router();
projectRouter.use(auth);
projectRouter.get("/", async (req: AuthedRequest, res) => {
  const workspaces = await Workspace.find({
    "members.user": req.userId,
  }).select("_id");
  res.json(
    await Project.find({
      workspace: { $in: workspaces.map((item) => item._id) },
    }).sort({ createdAt: 1 }),
  );
});
projectRouter.post("/", async (req: AuthedRequest, res) => {
  const data = z
    .object({
      name: z.string().min(2).max(80),
      color: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i)
        .default("#1463e9"),
    })
    .parse(req.body);
  let workspace = await Workspace.findOne({ "members.user": req.userId });
  if (!workspace)
    workspace = await Workspace.create({
      name: "My workspace",
      slug: `workspace-${req.userId}`,
      members: [{ user: req.userId, role: "owner" }],
    });
  const key =
    data.name
      .replace(/[^a-z]/gi, "")
      .slice(0, 4)
      .toUpperCase() || "PROJ";
  res
    .status(201)
    .json(await Project.create({ ...data, key, workspace: workspace.id }));
});
projectRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const data = z
    .object({
      name: z.string().min(2).max(80).optional(),
      color: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i)
        .optional(),
    })
    .parse(req.body);
  const workspaces = await Workspace.find({
    "members.user": req.userId,
  }).select("_id");
  const project = await Project.findOneAndUpdate(
    {
      _id: req.params.id,
      workspace: { $in: workspaces.map((item) => item._id) },
    },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});
