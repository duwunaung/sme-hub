CREATE TABLE `db_finance`.`orgs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(145) NOT NULL,
  `address` VARCHAR(145) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `expiredDate` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));
