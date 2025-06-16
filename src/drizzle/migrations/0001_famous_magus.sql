ALTER TABLE `question` ADD `uploaded_by` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `question` ADD `uploaded_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `question` ADD `updated_at` integer NOT NULL;