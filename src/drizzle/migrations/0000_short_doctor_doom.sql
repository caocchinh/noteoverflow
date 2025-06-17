CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `answer` (
	`question_id` text NOT NULL,
	`answer_image_src` text NOT NULL,
	`answer_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`question_id`, `answer_order`),
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `curriculum` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `curriculum_name_unique` ON `curriculum` (`name`);--> statement-breakpoint
CREATE TABLE `paper_type` (
	`paper_type` integer NOT NULL,
	`subject_id` text NOT NULL,
	PRIMARY KEY(`subject_id`, `paper_type`),
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `question` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`season` text NOT NULL,
	`paper_type` integer NOT NULL,
	`paper_variant` text NOT NULL,
	`topic` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`subject_id` text NOT NULL,
	`question_number` integer NOT NULL,
	`question_order` integer DEFAULT 0 NOT NULL,
	`question_image_src` text NOT NULL,
	`rating_sum` integer DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`subject_id`,`year`) REFERENCES `year`(`subject_id`,`year`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`,`season`) REFERENCES `season`(`subject_id`,`season`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`,`paper_type`) REFERENCES `paper_type`(`subject_id`,`paper_type`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`,`topic`) REFERENCES `topic`(`subject_id`,`topic`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_id_unique` ON `question` (`id`);--> statement-breakpoint
CREATE TABLE `question_rating` (
	`question_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	PRIMARY KEY(`question_id`, `user_id`),
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `season` (
	`season` text NOT NULL,
	`subject_id` text NOT NULL,
	PRIMARY KEY(`subject_id`, `season`),
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`impersonated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `subject` (
	`subject_id` text PRIMARY KEY NOT NULL,
	`curriculum_name` text NOT NULL,
	FOREIGN KEY (`curriculum_name`) REFERENCES `curriculum`(`name`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `topic` (
	`topic` text NOT NULL,
	`subject_id` text NOT NULL,
	PRIMARY KEY(`subject_id`, `topic`),
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer NOT NULL,
	`ban_reason` text,
	`ban_expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `year` (
	`year` integer NOT NULL,
	`subject_id` text NOT NULL,
	PRIMARY KEY(`subject_id`, `year`),
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE cascade
);
