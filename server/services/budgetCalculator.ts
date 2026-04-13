/**
 * 预算估算和材料清单生成服务
 */

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface BudgetEstimate {
  totalMaterials: number;
  laborCost: number;
  contingency: number;
  totalCost: number;
  costPerSqm: number;
  materials: MaterialItem[];
}

/**
 * 预定义的材料库
 */
const MATERIAL_LIBRARY = [
  // 地面材料
  { name: "防滑地板", category: "地面", unit: "㎡", economyPrice: 80, standardPrice: 120, premiumPrice: 180 },
  { name: "地胶垫", category: "地面", unit: "㎡", economyPrice: 40, standardPrice: 60, premiumPrice: 100 },

  // 墙面材料
  { name: "隔音吸音板", category: "墙面", unit: "㎡", economyPrice: 60, standardPrice: 100, premiumPrice: 150 },
  { name: "装饰墙纸", category: "墙面", unit: "㎡", economyPrice: 50, standardPrice: 80, premiumPrice: 120 },
  { name: "黑色烤漆板", category: "墙面", unit: "㎡", economyPrice: 100, standardPrice: 150, premiumPrice: 220 },

  // 灯光系统
  { name: "RGB LED灯带", category: "灯光", unit: "米", economyPrice: 20, standardPrice: 35, premiumPrice: 60 },
  { name: "LED筒灯", category: "灯光", unit: "个", economyPrice: 30, standardPrice: 50, premiumPrice: 80 },
  { name: "灯光控制系统", category: "灯光", unit: "套", economyPrice: 2000, standardPrice: 4000, premiumPrice: 8000 },

  // 家具
  { name: "电竞椅", category: "家具", unit: "把", economyPrice: 300, standardPrice: 600, premiumPrice: 1200 },
  { name: "游戏桌", category: "家具", unit: "张", economyPrice: 400, standardPrice: 800, premiumPrice: 1500 },
  { name: "沙发", category: "家具", unit: "套", economyPrice: 1000, standardPrice: 2000, premiumPrice: 4000 },
  { name: "吧台", category: "家具", unit: "米", economyPrice: 800, standardPrice: 1500, premiumPrice: 2500 },

  // 显示设备
  { name: "电竞显示器", category: "设备", unit: "个", economyPrice: 1000, standardPrice: 1800, premiumPrice: 3000 },
  { name: "大屏幕", category: "设备", unit: "个", economyPrice: 3000, standardPrice: 6000, premiumPrice: 12000 },

  // 空调通风
  { name: "中央空调", category: "空调", unit: "套", economyPrice: 5000, standardPrice: 10000, premiumPrice: 20000 },
  { name: "通风系统", category: "空调", unit: "套", economyPrice: 2000, standardPrice: 4000, premiumPrice: 8000 },

  // 其他
  { name: "装修辅料", category: "其他", unit: "项", economyPrice: 1000, standardPrice: 2000, premiumPrice: 3000 },
  { name: "施工费", category: "其他", unit: "项", economyPrice: 5000, standardPrice: 10000, premiumPrice: 20000 },
];

/**
 * 根据设计参数和预算等级计算材料清单
 */
export function generateMaterialsList(
  totalArea: number,
  machineCount: number,
  privateRoomCount: number,
  budgetLevel: "economy" | "standard" | "premium"
): BudgetEstimate {
  const materials: MaterialItem[] = [];
  let totalMaterials = 0;

  // 地面材料
  const floorArea = totalArea;
  materials.push({
    id: "floor_1",
    name: "防滑地板",
    category: "地面",
    quantity: floorArea,
    unit: "㎡",
    unitPrice: getMaterialPrice("防滑地板", budgetLevel),
    totalPrice: floorArea * getMaterialPrice("防滑地板", budgetLevel),
  });

  // 墙面材料
  const wallArea = totalArea * 0.4; // 假设平均墙面高度3.5m
  materials.push({
    id: "wall_1",
    name: "隔音吸音板",
    category: "墙面",
    quantity: wallArea,
    unit: "㎡",
    unitPrice: getMaterialPrice("隔音吸音板", budgetLevel),
    totalPrice: wallArea * getMaterialPrice("隔音吸音板", budgetLevel),
  });

  // RGB灯带 - 根据密度计算
  const ledLength = totalArea * 0.8; // 假设每平方米0.8米灯带
  materials.push({
    id: "lighting_1",
    name: "RGB LED灯带",
    category: "灯光",
    quantity: ledLength,
    unit: "米",
    unitPrice: getMaterialPrice("RGB LED灯带", budgetLevel),
    totalPrice: ledLength * getMaterialPrice("RGB LED灯带", budgetLevel),
  });

  // 灯光控制系统
  materials.push({
    id: "lighting_2",
    name: "灯光控制系统",
    category: "灯光",
    quantity: 1,
    unit: "套",
    unitPrice: getMaterialPrice("灯光控制系统", budgetLevel),
    totalPrice: getMaterialPrice("灯光控制系统", budgetLevel),
  });

  // 电竞椅
  materials.push({
    id: "furniture_1",
    name: "电竞椅",
    category: "家具",
    quantity: machineCount,
    unit: "把",
    unitPrice: getMaterialPrice("电竞椅", budgetLevel),
    totalPrice: machineCount * getMaterialPrice("电竞椅", budgetLevel),
  });

  // 游戏桌
  materials.push({
    id: "furniture_2",
    name: "游戏桌",
    category: "家具",
    quantity: machineCount,
    unit: "张",
    unitPrice: getMaterialPrice("游戏桌", budgetLevel),
    totalPrice: machineCount * getMaterialPrice("游戏桌", budgetLevel),
  });

  // 沙发 - 用于VIP区域
  if (privateRoomCount > 0) {
    materials.push({
      id: "furniture_3",
      name: "沙发",
      category: "家具",
      quantity: privateRoomCount,
      unit: "套",
      unitPrice: getMaterialPrice("沙发", budgetLevel),
      totalPrice: privateRoomCount * getMaterialPrice("沙发", budgetLevel),
    });
  }

  // 吧台
  const barLength = Math.max(3, totalArea * 0.05); // 吧台长度
  materials.push({
    id: "furniture_4",
    name: "吧台",
    category: "家具",
    quantity: barLength,
    unit: "米",
    unitPrice: getMaterialPrice("吧台", budgetLevel),
    totalPrice: barLength * getMaterialPrice("吧台", budgetLevel),
  });

  // 显示设备
  materials.push({
    id: "device_1",
    name: "电竞显示器",
    category: "设备",
    quantity: machineCount,
    unit: "个",
    unitPrice: getMaterialPrice("电竞显示器", budgetLevel),
    totalPrice: machineCount * getMaterialPrice("电竞显示器", budgetLevel),
  });

  // 大屏幕 - 大厅用
  materials.push({
    id: "device_2",
    name: "大屏幕",
    category: "设备",
    quantity: 2,
    unit: "个",
    unitPrice: getMaterialPrice("大屏幕", budgetLevel),
    totalPrice: 2 * getMaterialPrice("大屏幕", budgetLevel),
  });

  // 空调系统
  materials.push({
    id: "hvac_1",
    name: "中央空调",
    category: "空调",
    quantity: 1,
    unit: "套",
    unitPrice: getMaterialPrice("中央空调", budgetLevel),
    totalPrice: getMaterialPrice("中央空调", budgetLevel),
  });

  // 其他辅料
  materials.push({
    id: "other_1",
    name: "装修辅料",
    category: "其他",
    quantity: 1,
    unit: "项",
    unitPrice: getMaterialPrice("装修辅料", budgetLevel),
    totalPrice: getMaterialPrice("装修辅料", budgetLevel),
  });

  // 计算总价
  totalMaterials = materials.reduce((sum, item) => sum + item.totalPrice, 0);

  // 计算其他费用
  const laborCost = totalMaterials * 0.3; // 人工费30%
  const contingency = totalMaterials * 0.1; // 预留10%
  const totalCost = totalMaterials + laborCost + contingency;

  return {
    totalMaterials,
    laborCost,
    contingency,
    totalCost,
    costPerSqm: totalCost / totalArea,
    materials,
  };
}

/**
 * 获取材料价格
 */
function getMaterialPrice(materialName: string, level: "economy" | "standard" | "premium"): number {
  const material = MATERIAL_LIBRARY.find((m) => m.name === materialName);
  if (!material) return 0;

  const priceKey = `${level}Price` as keyof typeof material;
  return material[priceKey] as number;
}

/**
 * 生成造价报表
 */
export function generateBudgetReport(estimate: BudgetEstimate): string {
  const lines: string[] = [
    "=".repeat(60),
    "电竞馆装修设计 - 造价估算报表",
    "=".repeat(60),
    "",
    "材料清单",
    "-".repeat(60),
  ];

  // 按分类分组
  const grouped = estimate.materials.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MaterialItem[]>
  );

  for (const [category, items] of Object.entries(grouped)) {
    lines.push(`\n${category}`);
    for (const item of items) {
      lines.push(
        `  ${item.name.padEnd(20)} ${item.quantity.toFixed(2).padStart(10)} ${item.unit.padEnd(4)} @ ¥${item.unitPrice.toFixed(2).padStart(10)} = ¥${item.totalPrice.toFixed(2).padStart(12)}`
      );
    }
  }

  lines.push("");
  lines.push("-".repeat(60));
  lines.push(`材料费用总计:        ¥${estimate.totalMaterials.toFixed(2).padStart(20)}`);
  lines.push(`人工费用 (30%):      ¥${estimate.laborCost.toFixed(2).padStart(20)}`);
  lines.push(`预留费用 (10%):      ¥${estimate.contingency.toFixed(2).padStart(20)}`);
  lines.push("-".repeat(60));
  lines.push(`总造价:              ¥${estimate.totalCost.toFixed(2).padStart(20)}`);
  lines.push(`单位面积造价:        ¥${estimate.costPerSqm.toFixed(2).padStart(18)}/㎡`);
  lines.push("=".repeat(60));

  return lines.join("\n");
}
