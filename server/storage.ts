import { users, iconConversions, iconVariants, type User, type InsertUser, type IconConversion, type InsertIconConversion, type IconVariant, type InsertIconVariant } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createIconConversion(conversion: InsertIconConversion): Promise<IconConversion>;
  getIconConversion(id: number): Promise<IconConversion | undefined>;
  getRecentIconConversions(limit?: number): Promise<IconConversion[]>;
  createIconVariant(variant: InsertIconVariant): Promise<IconVariant>;
  getIconVariantsByConversion(conversionId: number): Promise<IconVariant[]>;
  getIconVariant(id: number): Promise<IconVariant | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private iconConversions: Map<number, IconConversion>;
  private iconVariants: Map<number, IconVariant>;
  currentUserId: number;
  currentIconId: number;
  currentVariantId: number;

  constructor() {
    this.users = new Map();
    this.iconConversions = new Map();
    this.iconVariants = new Map();
    this.currentUserId = 1;
    this.currentIconId = 1;
    this.currentVariantId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createIconConversion(insertConversion: InsertIconConversion): Promise<IconConversion> {
    const id = this.currentIconId++;
    const conversion: IconConversion = {
      ...insertConversion,
      id,
      createdAt: new Date(),
    };
    this.iconConversions.set(id, conversion);
    return conversion;
  }

  async getIconConversion(id: number): Promise<IconConversion | undefined> {
    return this.iconConversions.get(id);
  }

  async getRecentIconConversions(limit: number = 10): Promise<IconConversion[]> {
    const conversions = Array.from(this.iconConversions.values());
    return conversions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createIconVariant(insertVariant: InsertIconVariant): Promise<IconVariant> {
    const id = this.currentVariantId++;
    const variant: IconVariant = {
      ...insertVariant,
      id,
      createdAt: new Date(),
    };
    this.iconVariants.set(id, variant);
    return variant;
  }

  async getIconVariantsByConversion(conversionId: number): Promise<IconVariant[]> {
    return Array.from(this.iconVariants.values())
      .filter(variant => variant.conversionId === conversionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getIconVariant(id: number): Promise<IconVariant | undefined> {
    return this.iconVariants.get(id);
  }
}

export const storage = new MemStorage();
