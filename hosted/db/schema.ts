import {sqliteTable,text,integer,index} from "drizzle-orm/sqlite-core";
export const restaurants=sqliteTable("restaurants",{id:text("id").primaryKey(),owner:text("owner").notNull().unique(),name:text("name").notNull(),city:text("city").notNull(),created:text("created").notNull()});
export const records=sqliteTable("records",{id:text("id").primaryKey(),restaurantId:text("restaurant_id").notNull().references(()=>restaurants.id),kind:text("kind").notNull(),data:text("data").notNull(),created:text("created").notNull()},t=>[index("records_restaurant_kind").on(t.restaurantId,t.kind)]);

