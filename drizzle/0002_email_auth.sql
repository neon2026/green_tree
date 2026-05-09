-- Migration: Add email/password authentication support
-- Adds passwordHash column and extends openId to support email addresses as identifiers

ALTER TABLE `users` MODIFY COLUMN `openId` varchar(320) NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255);
