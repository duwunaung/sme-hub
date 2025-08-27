CREATE TABLE `db_finance`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `orgId` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `registered` DATETIME NOT NULL,
  `remark` VARCHAR(255) NULL,
  PRIMARY KEY (`id`));


ALTER TABLE `db_finance`.`users` 
ADD COLUMN `expired` DATETIME NULL AFTER `remark`;
