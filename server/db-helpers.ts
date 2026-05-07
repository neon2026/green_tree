import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  projects,
  designs,
  renderings,
  iterations,
  materials,
  constructions,
  materialLibrary,
  InsertProject,
  InsertDesign,
  InsertRendering,
  InsertIteration,
  InsertMaterial,
  InsertConstruction,
  Project,
  Design,
} from "../drizzle/schema";

/**
 * 项目相关查询
 */
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values(data);
  // Drizzle MySQL返回 { insertId: number }
  return [(result as any).insertId || 0];
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0];
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 只返回未删除的项目（status不是archived）
  return await db.select().from(projects).where(
    and(
      eq(projects.userId, userId),
      // 过滤掉已删除的项目
    )
  ).orderBy(desc(projects.createdAt));
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 真正删除项目
  return await db.delete(projects).where(eq(projects.id, projectId));
}

/**
 * 设计方案相关查询
 */
export async function createDesign(data: InsertDesign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(designs).values(data);
  const insertId = (result as any).insertId;
  
  if (insertId && insertId > 0) {
    return [insertId];
  }
  
  // 如果insertId不可用，从数据库查询最新记录
  const newDesign = await db
    .select()
    .from(designs)
    .where(eq(designs.projectId, data.projectId))
    .orderBy((t) => desc(t.id))
    .limit(1);
  
  if (newDesign.length > 0) {
    return [newDesign[0].id];
  }
  
  throw new Error("Failed to get inserted design ID");
}

export async function getDesignById(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(designs).where(eq(designs.id, designId)).limit(1);
  return result[0];
}

export async function getProjectDesigns(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(designs).where(eq(designs.projectId, projectId));
}

export async function updateDesign(designId: number, data: Partial<InsertDesign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(designs).set(data).where(eq(designs.id, designId));
}

/**
 * 效果图相关查询
 */
export async function createRendering(data: InsertRendering) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(renderings).values(data);
}

export async function getDesignRenderings(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(renderings).where(eq(renderings.designId, designId));
}

/**
 * 迭代记录相关查询
 */
export async function createIteration(data: InsertIteration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(iterations).values(data);
}

export async function getDesignIterations(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(iterations).where(eq(iterations.designId, designId));
}

/**
 * 材料清单相关查询
 */
export async function createMaterial(data: InsertMaterial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(materials).values(data);
}

export async function getDesignMaterials(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(materials).where(eq(materials.designId, designId));
}

/**
 * 施工图相关查询
 */
export async function createConstruction(data: InsertConstruction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(constructions).values(data);
}

export async function getDesignConstruction(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(constructions).where(eq(constructions.designId, designId)).limit(1);
  return result[0];
}

/**
 * 材料库相关查询
 */
export async function getMaterialLibrary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(materialLibrary);
}

export async function getMaterialByName(materialName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(materialLibrary).where(eq(materialLibrary.materialName, materialName)).limit(1);
  return result[0];
}


/**
 * 效果图相关查询
 */
export async function getRenderingHistory(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 按创建时间倒序获取所有效果图
  return await db.select().from(renderings)
    .where(eq(renderings.designId, designId))
    .orderBy(desc(renderings.createdAt));
}

export async function getLatestRenderingsByArea(designId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 获取每个区域的最新效果图
  const allRenderings = await db.select().from(renderings)
    .where(eq(renderings.designId, designId))
    .orderBy(desc(renderings.createdAt));
  
  // 按areaType分组，只保留最新的
  const latestByArea = new Map();
  for (const rendering of allRenderings) {
    if (!latestByArea.has(rendering.areaType)) {
      latestByArea.set(rendering.areaType, rendering);
    }
  }
  
  return Array.from(latestByArea.values());
}

export async function getProjectRenderingHistory(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      id: renderings.id,
      designId: renderings.designId,
      imageUrl: renderings.imageUrl,
      imageKey: renderings.imageKey,
      areaType: renderings.areaType,
      version: renderings.version,
      createdAt: renderings.createdAt,
      styleTheme: designs.styleTheme,
    })
    .from(renderings)
    .innerJoin(designs, eq(renderings.designId, designs.id))
    .where(eq(designs.projectId, projectId))
    .orderBy(desc(renderings.createdAt));
}
