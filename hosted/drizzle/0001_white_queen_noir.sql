CREATE TABLE `stock_lots` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`initial` integer NOT NULL,
	`remaining` integer NOT NULL,
	`total_cost` integer NOT NULL,
	`supplier` text NOT NULL,
	`expires` text,
	`location` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_restaurant` ON `stock_lots` (`restaurant_id`);--> statement-breakpoint
CREATE TABLE `stock_moves` (
	`id` text PRIMARY KEY NOT NULL,
	`restaurant_id` text NOT NULL,
	`lot_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`cost` integer NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `moves_restaurant` ON `stock_moves` (`restaurant_id`);
--> statement-breakpoint
CREATE TRIGGER stock_move_guard BEFORE INSERT ON stock_moves
WHEN NOT EXISTS(SELECT 1 FROM stock_moves WHERE id=NEW.id)
BEGIN
 SELECT CASE WHEN NEW.quantity<=0 OR NOT EXISTS(SELECT 1 FROM stock_lots WHERE id=NEW.lot_id AND restaurant_id=NEW.restaurant_id AND remaining>=NEW.quantity) THEN RAISE(ABORT,'insufficient_stock') END;
END;
--> statement-breakpoint
CREATE TRIGGER stock_move_apply AFTER INSERT ON stock_moves
BEGIN
 UPDATE stock_lots SET remaining=remaining-NEW.quantity WHERE id=NEW.lot_id AND restaurant_id=NEW.restaurant_id;
END;
