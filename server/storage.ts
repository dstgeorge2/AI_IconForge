import { users, iconConversions, type User, type InsertUser, type IconConversion, type InsertIconConversion } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createIconConversion(conversion: InsertIconConversion): Promise<IconConversion>;
  getIconConversion(id: number): Promise<IconConversion | undefined>;
  getRecentIconConversions(limit?: number): Promise<IconConversion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private iconConversions: Map<number, IconConversion>;
  currentUserId: number;
  currentIconId: number;

  constructor() {
    this.users = new Map();
    this.iconConversions = new Map();
    this.currentUserId = 1;
    this.currentIconId = 1;
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
}

export const storage = new MemStorage();
