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
 `applied` integer DEFAULT 0 NOT NULL,
	`cost` integer NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lot_id`) REFERENCES `stock_lots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `moves_restaurant` ON `stock_moves` (`restaurant_id`);
