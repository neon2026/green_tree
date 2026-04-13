CREATE TABLE `constructions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designId` int NOT NULL,
	`dwgFileUrl` varchar(1024),
	`dwgFileKey` varchar(1024),
	`pdfFileUrl` varchar(1024),
	`pdfFileKey` varchar(1024),
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `constructions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`styleTheme` varchar(100),
	`colorScheme` varchar(100),
	`budgetRange` varchar(50),
	`parameters` text,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iterations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designId` int NOT NULL,
	`instruction` text,
	`parameterChanges` text,
	`imageUrl` varchar(1024),
	`imageKey` varchar(1024),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iterations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`materialName` varchar(255),
	`category` varchar(100),
	`unit` varchar(50),
	`economyPrice` decimal(10,2),
	`standardPrice` decimal(10,2),
	`premiumPrice` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `material_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designId` int NOT NULL,
	`materialName` varchar(255),
	`category` varchar(100),
	`quantity` decimal(10,2),
	`unit` varchar(50),
	`unitPrice` decimal(10,2),
	`totalPrice` decimal(12,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cadFileUrl` varchar(1024),
	`cadFileKey` varchar(1024),
	`cadParameters` text,
	`status` enum('draft','completed','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renderings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designId` int NOT NULL,
	`imageUrl` varchar(1024),
	`imageKey` varchar(1024),
	`areaType` varchar(50),
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `renderings_id` PRIMARY KEY(`id`)
);
