PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_paper_type` (
	`paper_type_id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_paper_type`("paper_type_id", "subject_id") SELECT "paper_type_id", "subject_id" FROM `paper_type`;--> statement-breakpoint
DROP TABLE `paper_type`;--> statement-breakpoint
ALTER TABLE `__new_paper_type` RENAME TO `paper_type`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_year` (
	`year_id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_year`("year_id", "subject_id") SELECT "year_id", "subject_id" FROM `year`;--> statement-breakpoint
DROP TABLE `year`;--> statement-breakpoint
ALTER TABLE `__new_year` RENAME TO `year`;