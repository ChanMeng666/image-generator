import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ========== Business tables only ==========
// Users are managed by Neon Auth (neon_auth.user table)
// userId fields store the Neon Auth user ID (no FK constraint)

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'purchase' | 'generation' | 'refund' | 'signup_bonus'
  stripeSessionId: text("stripe_session_id"),
  imageId: text("image_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const generatedImages = pgTable("generated_images", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  prompt: text("prompt").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  width: integer("width"),
  height: integer("height"),
  model: text("model").notNull().default("@cf/black-forest-labs/flux-1-schnell"),
  creditsCost: integer("credits_cost").notNull().default(1),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stripeCustomers = pgTable(
  "stripe_customers",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    mode: text("mode").notNull(), // 'test' | 'live'
    stripeCustomerId: text("stripe_customer_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userMode: uniqueIndex("stripe_customers_user_mode_unique").on(t.userId, t.mode),
  }),
);
