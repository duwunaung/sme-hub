-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: db_finance
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `expcats`
--

DROP TABLE IF EXISTS `expcats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expcats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `orgId` int NOT NULL,
  `createdBy` int NOT NULL,
  `status` varchar(45) NOT NULL,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name_per_org` (`orgId`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expcats`
--

LOCK TABLES `expcats` WRITE;
/*!40000 ALTER TABLE `expcats` DISABLE KEYS */;
INSERT INTO `expcats` VALUES (7,'tax',4,87,'active',NULL),(15,'rental fee',4,88,'active',NULL),(16,'tax',9,89,'active',NULL),(18,'kkk',4,87,'active',2),(19,'purchase',4,87,'active',2),(20,'Purchase of goods',14,0,'active',2),(21,'Purchase of raw materials',14,0,'active',2),(22,'Purchase of goods(external)',14,0,'active',0),(23,'Purchase of raw materials(external)',14,0,'active',0),(24,'Purchase of office furniture',14,0,'active',0),(25,'Purchase of office device',14,0,'active',0),(26,'Purchase of office stationery',14,0,'active',0),(27,'Purchase of other office accessory',14,0,'active',0),(28,'Transportation costs',14,0,'active',0),(29,'Electric bills',14,0,'active',0),(30,'Water bills',14,0,'active',0),(31,'Office Rent',14,0,'active',0),(32,'Employee salary',14,0,'active',0),(33,'Labour day meal',14,0,'active',0),(34,'Costs for freelancer',14,0,'active',0),(35,'The costs of office software',14,0,'active',0),(36,'The costs of advertising',14,0,'active',0),(37,'The costs for social media',14,0,'active',0),(38,'The costs for license and permit',14,0,'active',0),(39,'Office equipment maintenance costs',14,0,'active',0),(40,'Taxs',14,0,'active',0),(41,'Audit and annual closing costs',14,0,'active',0),(42,'Sale commission',14,0,'active',0),(43,'Loan interest',14,0,'active',0),(44,'Loan repayment',14,0,'active',0),(45,'Purchase of goods',15,0,'active',2),(46,'Purchase of raw materials',15,0,'active',2),(47,'Purchase of goods(external)',15,0,'active',0),(48,'Purchase of raw materials(external)',15,0,'active',0),(49,'Purchase of office furniture',15,0,'active',0),(50,'Purchase of office device',15,0,'active',0),(51,'Purchase of office stationery',15,0,'active',0),(52,'Purchase of other office accessory',15,0,'active',0),(53,'Transportation costs',15,0,'active',0),(54,'Electric bills',15,0,'active',0),(55,'Water bills',15,0,'active',0),(56,'Office Rent',15,0,'active',0),(57,'Employee salary',15,0,'active',0),(58,'Labour day meal',15,0,'active',0),(59,'Costs for freelancer',15,0,'active',0),(60,'The costs of office software',15,0,'active',0),(61,'The costs of advertising',15,0,'active',0),(62,'The costs for social media',15,0,'active',0),(63,'The costs for license and permit',15,0,'active',0),(64,'Office equipment maintenance costs',15,0,'active',0),(65,'Taxs',15,0,'active',0),(66,'Audit and annual closing costs',15,0,'active',0),(67,'Sale commission',15,0,'active',0),(68,'Loan interest',15,0,'active',0),(69,'Loan repayment',15,0,'active',0),(70,'tt',15,91,'active',NULL),(71,'Purchase of goods',16,0,'active',2),(72,'Purchase of raw materials',16,0,'active',2),(73,'Purchase of goods(external)',16,0,'active',0),(74,'Purchase of raw materials(external)',16,0,'active',0),(75,'Purchase of office furniture',16,0,'active',0),(76,'Purchase of office device',16,0,'active',0),(77,'Purchase of office stationery',16,0,'active',0),(78,'Purchase of other office accessory',16,0,'active',0),(79,'Transportation costs',16,0,'active',0),(80,'Electric bills',16,0,'active',0),(81,'Water bills',16,0,'active',0),(82,'Office Rent',16,0,'active',0),(83,'Employee salary',16,0,'active',0),(84,'Labour day meal',16,0,'active',0),(85,'Costs for freelancer',16,0,'active',0),(86,'The costs of office software',16,0,'active',0),(87,'The costs of advertising',16,0,'active',0),(88,'The costs for social media',16,0,'active',0),(89,'The costs for license and permit',16,0,'active',0),(90,'Office equipment maintenance costs',16,0,'active',0),(91,'Taxs',16,0,'active',0),(92,'Audit and annual closing costs',16,0,'active',0),(93,'Sale commission',16,0,'active',0),(94,'Loan interest',16,0,'active',0),(95,'Loan repayment',16,0,'active',0),(96,'Purchase of goods',17,0,'active',2),(97,'Purchase of raw materials',17,0,'active',2),(98,'Purchase of goods(external)',17,0,'active',0),(99,'Purchase of raw materials(external)',17,0,'active',0),(100,'Purchase of office furniture',17,0,'active',0),(101,'Purchase of office device',17,0,'active',0),(102,'Purchase of office stationery',17,0,'active',0),(103,'Purchase of other office accessory',17,0,'active',0),(104,'Transportation costs',17,0,'active',0),(105,'Electric bills',17,0,'active',0),(106,'Water bills',17,0,'active',0),(107,'Office Rent',17,0,'active',0),(108,'Employee salary',17,0,'active',0),(109,'Labour day meal',17,0,'active',0),(110,'Costs for freelancer',17,0,'active',0),(111,'The costs of office software',17,0,'active',0),(112,'The costs of advertising',17,0,'active',0),(113,'The costs for social media',17,0,'active',0),(114,'The costs for license and permit',17,0,'active',0),(115,'Office equipment maintenance costs',17,0,'active',0),(116,'Taxs',17,0,'active',0),(117,'Audit and annual closing costs',17,0,'active',0),(118,'Sale commission',17,0,'active',0),(119,'Loan interest',17,0,'active',0),(120,'Loan repayment',17,0,'active',0),(121,'asdfc',15,91,'active',NULL),(122,'Purchase of goods',18,0,'active',2),(123,'Purchase of raw materials',18,0,'active',2),(124,'Purchase of goods(external)',18,0,'active',0),(125,'Purchase of raw materials(external)',18,0,'active',0),(126,'Purchase of office furniture',18,0,'active',0),(127,'Purchase of office device',18,0,'active',0),(128,'Purchase of office stationery',18,0,'active',0),(129,'Purchase of other office accessory',18,0,'active',0),(130,'Transportation costs',18,0,'active',0),(131,'Electric bills',18,0,'active',0),(132,'Water bills',18,0,'active',0),(133,'Office Rent',18,0,'active',0),(134,'Employee salary',18,0,'active',0),(135,'Labour day meal',18,0,'active',0),(136,'Costs for freelancer',18,0,'active',0),(137,'The costs of office software',18,0,'active',0),(138,'The costs of advertising',18,0,'active',0),(139,'The costs for social media',18,0,'active',0),(140,'The costs for license and permit',18,0,'active',0),(141,'Office equipment maintenance costs',18,0,'active',0),(142,'Taxs',18,0,'active',0),(143,'Audit and annual closing costs',18,0,'active',0),(144,'Sale commission',18,0,'active',0),(145,'Loan interest',18,0,'active',0),(146,'Loan repayment',18,0,'active',0),(147,'Purchase of goods',19,0,'active',2),(148,'Purchase of raw materials',19,0,'active',2),(149,'Purchase of goods(external)',19,0,'active',0),(150,'Purchase of raw materials(external)',19,0,'active',0),(151,'Purchase of office furniture',19,0,'active',0),(152,'Purchase of office device',19,0,'active',0),(153,'Purchase of office stationery',19,0,'active',0),(154,'Purchase of other office accessory',19,0,'active',0),(155,'Transportation costs',19,0,'active',0),(156,'Electric bills',19,0,'active',0),(157,'Water bills',19,0,'active',0),(158,'Office Rent',19,0,'active',0),(159,'Employee salary',19,0,'active',0),(160,'Labour day meal',19,0,'active',0),(161,'Costs for freelancer',19,0,'active',0),(162,'The costs of office software',19,0,'active',0),(163,'The costs of advertising',19,0,'active',0),(164,'The costs for social media',19,0,'active',0),(165,'The costs for license and permit',19,0,'active',0),(166,'Office equipment maintenance costs',19,0,'active',0),(167,'Taxs',19,0,'active',0),(168,'Audit and annual closing costs',19,0,'active',0),(169,'Sale commission',19,0,'active',0),(170,'Loan interest',19,0,'active',0),(171,'Loan repayment',19,0,'active',0),(172,'Purchase of goods',20,0,'active',2),(173,'Purchase of raw materials',20,0,'active',2),(174,'Purchase of goods(external)',20,0,'active',0),(175,'Purchase of raw materials(external)',20,0,'active',0),(176,'Purchase of office furniture',20,0,'active',0),(177,'Purchase of office device',20,0,'active',0),(178,'Purchase of office stationery',20,0,'active',0),(179,'Purchase of other office accessory',20,0,'active',0),(180,'Transportation costs',20,0,'active',0),(181,'Electric bills',20,0,'active',0),(182,'Water bills',20,0,'active',0),(183,'Office Rent',20,0,'active',0),(184,'Employee salary',20,0,'active',0),(185,'Labour day meal',20,0,'active',0),(186,'Costs for freelancer',20,0,'active',0),(187,'The costs of office software',20,0,'active',0),(188,'The costs of advertising',20,0,'active',0),(189,'The costs for social media',20,0,'active',0),(190,'The costs for license and permit',20,0,'active',0),(191,'Office equipment maintenance costs',20,0,'active',0),(192,'Taxs',20,0,'active',0),(193,'Audit and annual closing costs',20,0,'active',0),(194,'Sale commission',20,0,'active',0),(195,'Loan interest',20,0,'active',0),(196,'Loan repayment',20,0,'active',0),(197,'Purchase of goods',21,0,'active',2),(198,'Purchase of raw materials',21,0,'active',2),(199,'Purchase of goods(external)',21,0,'active',0),(200,'Purchase of raw materials(external)',21,0,'active',0),(201,'Purchase of office furniture',21,0,'active',0),(202,'Purchase of office device',21,0,'active',0),(203,'Purchase of office stationery',21,0,'active',0),(204,'Purchase of other office accessory',21,0,'active',0),(205,'Transportation costs',21,0,'active',0),(206,'Electric bills',21,0,'active',0),(207,'Water bills',21,0,'active',0),(208,'Office Rent',21,0,'active',0),(209,'Employee salary',21,0,'active',0),(210,'Labour day meal',21,0,'active',0),(211,'Costs for freelancer',21,0,'active',0),(212,'The costs of office software',21,0,'active',0),(213,'The costs of advertising',21,0,'active',0),(214,'The costs for social media',21,0,'active',0),(215,'The costs for license and permit',21,0,'active',0),(216,'Office equipment maintenance costs',21,0,'active',0),(217,'Taxs',21,0,'active',0),(218,'Audit and annual closing costs',21,0,'active',0),(219,'Sale commission',21,0,'active',0),(220,'Loan interest',21,0,'active',0),(221,'Loan repayment',21,0,'active',0),(222,'Purchase of goods',22,0,'active',2),(223,'Purchase of raw materials',22,0,'active',2),(224,'Purchase of goods(external)',22,0,'active',0),(225,'Purchase of raw materials(external)',22,0,'active',0),(226,'Purchase of office furniture',22,0,'active',0),(227,'Purchase of office device',22,0,'active',0),(228,'Purchase of office stationery',22,0,'active',0),(229,'Purchase of other office accessory',22,0,'active',0),(230,'Transportation costs',22,0,'active',0),(231,'Electric bills',22,0,'active',0),(232,'Water bills',22,0,'active',0),(233,'Office Rent',22,0,'active',0),(234,'Employee salary',22,0,'active',0),(235,'Labour day meal',22,0,'active',0),(236,'Costs for freelancer',22,0,'active',0),(237,'The costs of office software',22,0,'active',0),(238,'The costs of advertising',22,0,'active',0),(239,'The costs for social media',22,0,'active',0),(240,'The costs for license and permit',22,0,'active',0),(241,'Office equipment maintenance costs',22,0,'active',0),(242,'Taxs',22,0,'active',0),(243,'Audit and annual closing costs',22,0,'active',0),(244,'Sale commission',22,0,'active',0),(245,'Loan interest',22,0,'active',0),(246,'Loan repayment',22,0,'active',0),(247,'Purchase of goods',23,0,'active',2),(248,'Purchase of raw materials',23,0,'active',2),(249,'Purchase of goods(external)',23,0,'active',0),(250,'Purchase of raw materials(external)',23,0,'active',0),(251,'Purchase of office furniture',23,0,'active',0),(252,'Purchase of office device',23,0,'active',0),(253,'Purchase of office stationery',23,0,'active',0),(254,'Purchase of other office accessory',23,0,'active',0),(255,'Transportation costs',23,0,'active',0),(256,'Electric bills',23,0,'active',0),(257,'Water bills',23,0,'active',0),(258,'Office Rent',23,0,'active',0),(259,'Employee salary',23,0,'active',0),(260,'Labour day meal',23,0,'active',0),(261,'Costs for freelancer',23,0,'active',0),(262,'The costs of office software',23,0,'active',0),(263,'The costs of advertising',23,0,'active',0),(264,'The costs for social media',23,0,'active',0),(265,'The costs for license and permit',23,0,'active',0),(266,'Office equipment maintenance costs',23,0,'active',0),(267,'Taxs',23,0,'active',0),(268,'Audit and annual closing costs',23,0,'active',0),(269,'Sale commission',23,0,'active',0),(270,'Loan interest',23,0,'active',0),(271,'Loan repayment',23,0,'active',0),(272,'Purchase of goods',24,0,'active',2),(273,'Purchase of raw materials',24,0,'active',2),(274,'Purchase of goods(external)',24,0,'active',0),(275,'Purchase of raw materials(external)',24,0,'active',0),(276,'Purchase of office furniture',24,0,'active',0),(277,'Purchase of office device',24,0,'active',0),(278,'Purchase of office stationery',24,0,'active',0),(279,'Purchase of other office accessory',24,0,'active',0),(280,'Transportation costs',24,0,'active',0),(281,'Electric bills',24,0,'active',0),(282,'Water bills',24,0,'active',0),(283,'Office Rent',24,0,'active',0),(284,'Employee salary',24,0,'active',0),(285,'Labour day meal',24,0,'active',0),(286,'Costs for freelancer',24,0,'active',0),(287,'The costs of office software',24,0,'active',0),(288,'The costs of advertising',24,0,'active',0),(289,'The costs for social media',24,0,'active',0),(290,'The costs for license and permit',24,0,'active',0),(291,'Office equipment maintenance costs',24,0,'active',0),(292,'Taxs',24,0,'active',0),(293,'Audit and annual closing costs',24,0,'active',0),(294,'Sale commission',24,0,'active',0),(295,'Loan interest',24,0,'active',0),(296,'Loan repayment',24,0,'active',0);
/*!40000 ALTER TABLE `expcats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exps`
--

DROP TABLE IF EXISTS `exps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  `amount` int NOT NULL,
  `expenseDate` datetime NOT NULL,
  `catId` int NOT NULL,
  `orgId` int NOT NULL,
  `createdBy` int NOT NULL,
  `receipt` varchar(255) DEFAULT NULL,
  `vendorName` varchar(100) DEFAULT NULL,
  `itemName` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exps`
--

LOCK TABLES `exps` WRITE;
/*!40000 ALTER TABLE `exps` DISABLE KEYS */;
INSERT INTO `exps` VALUES (22,'asfda',1234,'2025-02-20 00:32:00',7,4,87,'null',NULL,NULL,NULL,NULL),(23,'s',1,'2025-02-20 15:10:00',15,4,87,'null',NULL,NULL,NULL,NULL),(24,'dddd',12,'2025-02-20 15:31:00',15,4,87,'null',NULL,NULL,NULL,NULL),(25,'Purchased 3 raw materials from U Kyaw Gyi',105000,'2025-02-20 21:27:00',19,4,87,NULL,'U Kyaw Gyi','raw materials',3,35000),(26,'Purchased 50 orange from Daw Khin Pa Pa',50000,'2025-02-20 21:35:00',19,4,87,NULL,'Daw Khin Pa Pa','orange',50,1000),(27,'Purchased 2 wood from U Baw ka ',24000,'2025-03-09 20:10:00',20,14,90,NULL,'U Baw ka ','wood',2,12000),(28,'Purchased 1 Engine',12340000,'2025-03-15 10:48:00',45,15,91,NULL,'','Engine',1,12340000),(29,'fda',234,'2025-03-15 11:33:00',66,15,91,NULL,NULL,NULL,NULL,NULL),(30,'Purchased 70 tomatoesfrom Daw Khin Pa Pa',7000,'2025-03-16 10:14:00',71,16,92,NULL,'Daw Khin Pa Pa','tomatoes',70,100),(31,'Daily taxs',10000,'2025-03-16 10:14:00',91,16,92,NULL,NULL,NULL,NULL,NULL),(32,'bought a bag',10000,'2025-03-23 20:12:00',66,15,91,NULL,NULL,NULL,NULL,NULL),(33,'Purchased 4 asdfafrom asdff',48000,'2025-03-24 14:22:00',45,15,91,NULL,'asdff','asdfa',4,12000),(34,'hello',1200,'2025-03-24 15:41:00',66,15,91,NULL,NULL,NULL,NULL,NULL),(36,'asdfa',1000000,'2025-03-28 21:10:00',58,15,91,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `exps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inccats`
--

DROP TABLE IF EXISTS `inccats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inccats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `orgId` int NOT NULL,
  `createdBy` int NOT NULL,
  `status` varchar(45) NOT NULL,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name_per_org` (`orgId`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inccats`
--

LOCK TABLES `inccats` WRITE;
/*!40000 ALTER TABLE `inccats` DISABLE KEYS */;
INSERT INTO `inccats` VALUES (39,'sale',4,87,'active',1),(114,'products',4,88,'active',NULL),(121,'sale',9,89,'active',NULL),(125,'hhhhh',4,87,'active',NULL),(126,'jju',4,87,'active',NULL),(127,'jrac',4,87,'active',1),(128,'hello world this category is very very important and has a really long name',4,87,'active',NULL),(129,'Product sales',14,0,'active',1),(130,'Service sales',14,0,'active',1),(131,'Product sales(external)',14,0,'active',0),(132,'Service sales(external)',14,0,'active',0),(133,'Office furniture sales',14,0,'active',0),(134,'Office device sales',14,0,'active',0),(135,'Obtaining a loan',14,0,'deleted',0),(136,'Product sales',15,0,'active',1),(137,'Service sales',15,0,'active',1),(138,'Product sales(external)',15,0,'active',0),(139,'Service sales(external)',15,0,'active',0),(140,'Office furniture sales',15,0,'active',0),(141,'Office device sales',15,0,'active',0),(142,'Obtaining a loan',15,0,'active',0),(143,'sale htun',15,91,'active',1),(144,'Sale one',14,90,'active',1),(146,'temp cat',15,91,'active',NULL),(147,'tmp',15,91,'active',NULL),(148,'hh',15,91,'active',0),(149,'Product sales',16,0,'active',1),(150,'Service sales',16,0,'active',1),(151,'Product sales(external)',16,0,'active',0),(152,'Service sales(external)',16,0,'active',0),(153,'Office furniture sales',16,0,'active',0),(154,'Office device sales',16,0,'active',0),(155,'Obtaining a loan',16,0,'active',0),(156,'Retail Product Sales',16,92,'active',0),(157,'Product sales',17,0,'active',1),(158,'Service sales',17,0,'active',1),(159,'Product sales(external)',17,0,'active',0),(160,'Service sales(external)',17,0,'active',0),(161,'Office furniture sales',17,0,'active',0),(162,'Office device sales',17,0,'active',0),(163,'Obtaining a loan',17,0,'active',0),(164,'asdfa',15,91,'active',0),(165,'Product sales',18,0,'active',1),(166,'Service sales',18,0,'active',1),(167,'Product sales(external)',18,0,'active',0),(168,'Service sales(external)',18,0,'active',0),(169,'Office furniture sales',18,0,'active',0),(170,'Office device sales',18,0,'active',0),(171,'Obtaining a loan',18,0,'active',0),(172,'Product sales',19,0,'active',1),(173,'Service sales',19,0,'active',1),(174,'Product sales(external)',19,0,'active',0),(175,'Service sales(external)',19,0,'active',0),(176,'Office furniture sales',19,0,'active',0),(177,'Office device sales',19,0,'active',0),(178,'Obtaining a loan',19,0,'active',0),(179,'Product sales',20,0,'active',1),(180,'Service sales',20,0,'active',1),(181,'Product sales(external)',20,0,'active',0),(182,'Service sales(external)',20,0,'active',0),(183,'Office furniture sales',20,0,'active',0),(184,'Office device sales',20,0,'active',0),(185,'Obtaining a loan',20,0,'active',0),(186,'Product sales',21,0,'active',1),(187,'Service sales',21,0,'active',1),(188,'Product sales(external)',21,0,'active',0),(189,'Service sales(external)',21,0,'active',0),(190,'Office furniture sales',21,0,'active',0),(191,'Office device sales',21,0,'active',0),(192,'Obtaining a loan',21,0,'active',0),(193,'Product sales',22,0,'active',1),(194,'Service sales',22,0,'active',1),(195,'Product sales(external)',22,0,'active',0),(196,'Service sales(external)',22,0,'active',0),(197,'Office furniture sales',22,0,'active',0),(198,'Office device sales',22,0,'active',0),(199,'Obtaining a loan',22,0,'active',0),(200,'Product sales',23,0,'active',1),(201,'Service sales',23,0,'active',1),(202,'Product sales(external)',23,0,'active',0),(203,'Service sales(external)',23,0,'active',0),(204,'Office furniture sales',23,0,'active',0),(205,'Office device sales',23,0,'active',0),(206,'Obtaining a loan',23,0,'active',0),(207,'Product sales',24,0,'active',1),(208,'Service sales',24,0,'active',1),(209,'Product sales(external)',24,0,'active',0),(210,'Service sales(external)',24,0,'active',0),(211,'Office furniture sales',24,0,'active',0),(212,'Office device sales',24,0,'active',0),(213,'Obtaining a loan',24,0,'active',0);
/*!40000 ALTER TABLE `inccats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incs`
--

DROP TABLE IF EXISTS `incs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  `amount` int NOT NULL,
  `incomeDate` datetime NOT NULL,
  `catId` int NOT NULL,
  `orgId` int NOT NULL,
  `createdBy` int NOT NULL,
  `receipt` varchar(255) DEFAULT NULL,
  `salespersonId` int DEFAULT NULL,
  `customerName` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  `itemName` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incs`
--

LOCK TABLES `incs` WRITE;
/*!40000 ALTER TABLE `incs` DISABLE KEYS */;
INSERT INTO `incs` VALUES (34,'hello',2300,'2025-02-14 21:56:00',39,4,87,'1739545158579-931349537.png',NULL,NULL,NULL,NULL,NULL),(35,'hello world hi tauk lin',1234,'2025-02-19 17:30:00',39,4,87,NULL,NULL,NULL,NULL,NULL,NULL),(36,'fad',1324,'2025-02-20 00:25:00',125,4,87,NULL,NULL,NULL,NULL,NULL,NULL),(37,'Hein Thura Soe has sold 2 Phone to Zaw Zaw',240000,'2025-02-20 16:29:00',39,4,87,NULL,3,'Zaw Zaw',2,120000,'Phone'),(38,'Tauk has sold 5 apple to Mg Kyaw',25000,'2025-02-20 17:00:00',39,4,87,NULL,10,'Mg Kyaw',5,5000,'apple'),(39,'Tauk has sold 3 Battery to Htay Lwin',3600,'2025-02-21 14:19:00',39,4,87,NULL,10,'Htay Lwin',3,1200,'Battery'),(40,'Tauk has sold 2 Kyay Ooe to Hla Hla',10000,'2025-02-21 14:24:00',39,4,87,'1740122704306-715578159.png',10,'Hla Hla',2,5000,'Kyay Ooe'),(41,'Tauk has sold 1 asssdddd to hhh',123,'2025-03-05 19:00:00',39,4,87,NULL,10,'hhh',1,123,'asssdddd'),(42,'Tauk has sold 5 apple to zaw zaw',6000,'2025-03-05 19:02:00',39,4,87,NULL,10,'zaw zaw',5,1200,'apple'),(43,'Tauk has sold 10 adsf to ss',100000,'2025-03-05 22:39:00',39,4,87,NULL,10,'ss',10,10000,'adsf'),(44,'Oo Oo has sold 4 or to uu',80000,'2025-03-07 21:57:00',39,4,87,NULL,17,'uu',4,20000,'or'),(45,'Htay has sold 5 yy to tt',61500,'2025-03-07 21:58:00',39,4,87,NULL,16,'tt',5,12300,'yy'),(46,'Htun  has sold 21 oo to tt',94500,'2025-03-07 21:58:00',39,4,87,NULL,15,'tt',21,4500,'oo'),(47,'Khin Htay Aung has sold 5 hh to r4',234000,'2025-03-07 21:59:00',39,4,87,NULL,2,'r4',10,23400,'hh'),(48,'Hein Thura Soe has sold 2 ui to rt',113400,'2025-03-07 21:59:00',39,4,87,NULL,3,'rt',2,56700,'ui'),(49,'undefined has sold 10 apple to hla hla',12000,'2025-03-09 14:44:00',143,15,91,NULL,3,'hla hla',10,1200,'apple'),(50,'kyaw kyaw htay has sold 4 organge to hla min',48000,'2025-03-09 15:06:00',143,15,91,NULL,23,'hla min',4,12000,'organge'),(51,'Kyaw Kyaw Aye has sold 2 organge to Htay Lwin',2400,'2025-03-09 20:09:00',130,14,90,NULL,24,'Htay Lwin',2,1200,'organge'),(52,'loan from bank',1200000,'2025-03-09 20:10:00',135,14,90,NULL,NULL,NULL,NULL,NULL,NULL),(53,'kyaw kyaw htay has sold 4 umbrella',60000,'2025-03-15 10:47:00',143,15,91,NULL,23,'',4,15000,'umbrella'),(54,'asdfasd1',12312,'2025-03-15 11:19:00',142,15,91,NULL,NULL,NULL,NULL,NULL,NULL),(55,'Maung Maung Zaw has sold 5 apple',5000,'2025-03-16 10:02:00',149,16,92,NULL,26,'',5,1000,'apple'),(56,'Selling unused furnitures',150000,'2025-03-16 10:04:00',151,16,92,NULL,NULL,NULL,NULL,NULL,NULL),(57,'Getting loan from the bank',200000,'2025-03-16 10:07:00',155,16,92,'1742094437304-28234206.png',NULL,NULL,NULL,NULL,NULL),(58,'sold a bag',10000,'2025-03-23 19:54:00',142,15,91,NULL,NULL,NULL,NULL,NULL,NULL),(59,'another trans',10000000,'2025-03-23 19:56:00',164,15,91,NULL,NULL,NULL,NULL,NULL,NULL),(60,'asdfas',1234,'2025-03-24 20:22:00',164,15,91,NULL,NULL,NULL,NULL,NULL,NULL),(61,'hhh',123,'2025-03-24 20:40:00',164,15,91,NULL,NULL,NULL,NULL,NULL,NULL),(62,'hhh',1235,'2025-03-24 20:40:00',164,15,91,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `incs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orgs`
--

DROP TABLE IF EXISTS `orgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orgs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(145) NOT NULL,
  `address` varchar(145) NOT NULL,
  `phone` varchar(45) NOT NULL,
  `expiredDate` datetime NOT NULL,
  `status` varchar(45) NOT NULL,
  `baseCurrency` varchar(3) NOT NULL DEFAULT 'MMK',
  `logo` varchar(255) DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `registeredDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `baseCountry` varchar(45) NOT NULL DEFAULT 'Myanmar',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orgs`
--

LOCK TABLES `orgs` WRITE;
/*!40000 ALTER TABLE `orgs` DISABLE KEYS */;
INSERT INTO `orgs` VALUES (1,'SwanOat Technology (aka Dat Tech)','Yangon','09 770 529 154','2025-02-20 11:03:13','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(2,'Pacasikha Pte Ltd','Singapore','+65 9224 5754','2025-01-28 18:48:43','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(3,'Glorious Online Shop','Yangon','09770529154','2025-02-04 20:40:05','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(4,'ABC','madaya','094567887654','2025-12-09 22:07:14','active','MMK','1740408647621-157070375.png',NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(5,'asdfkljasldkfjalksdjflkasjdflkajsfdlkjasdl;kfjaslk;ddfjalksdjdflkasjdf;lklasjdfl;kasjsddfl;kjasl;kdfjaslk;fasalkdfjasdldkfjaslkdfjasad','madaya','1234123412341234','2025-03-22 22:07:40','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(6,'tiger','pol','1234','2025-01-21 22:18:09','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(7,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq','qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq','qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq','2025-01-29 12:38:30','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(8,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','2025-03-22 00:47:03','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(9,'Tiger','Mandalay','094567887654','2025-03-16 22:19:56','active','MMK','1739881063828-93017730.png',NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(10,'UUU','adflj','123499','2025-03-22 11:43:50','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(11,'jjjjj','clqkjdl','1234','2025-03-22 11:45:01','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(12,'fff','qwerc','1564','2025-03-22 11:49:48','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(13,'lll','nnn','666','2025-03-22 11:50:15','active','MMK',NULL,NULL,NULL,'2025-03-24 18:13:15','Myanmar'),(14,'Super','Bangkok','092342123','2025-04-07 17:35:38','active','USD',NULL,1,'2025-03-08 17:35:38','2025-03-24 18:13:15','Myanmar'),(15,'Bo Htun','Mandalay','135345','2025-04-08 09:35:00','active','MMK',NULL,1,'2025-03-09 09:35:00','2025-03-24 18:13:15','Mexico'),(16,'7 Eleven','Mandalay','0923341234','2025-04-15 09:57:11','active','MMK',NULL,1,'2025-03-23 09:36:30','2025-03-24 18:13:15','Myanmar'),(17,'GG','mandalay','01354532345','2025-04-23 14:35:05','active','MMK',NULL,1,'2025-03-24 14:35:05','2025-03-24 18:13:15','Myanmar'),(18,'Blah','aa','0912341522','2025-04-24 14:18:46','active','MMK',NULL,1,'2025-03-25 14:18:46','2025-03-25 14:18:46','Myanmar'),(19,'asdfasf','aasldfj','0912341','2025-04-24 14:19:37','active','MMK',NULL,1,'2025-03-25 14:19:37','2025-03-25 14:19:37','Myanmar'),(20,'asdf','sadf','a0','2025-04-24 14:31:37','active','MMK',NULL,1,'2025-03-25 14:31:37','2025-03-25 14:31:36','Myanmar'),(21,'gg','saaad','512','2025-04-24 14:39:41','active','MMK',NULL,1,'2025-03-25 16:20:04','2025-03-25 14:39:41','Montenegro'),(22,'adads','asdflj','0123424','2025-04-24 15:06:14','active','MMK',NULL,1,'2025-03-25 15:06:14','2025-03-25 15:06:14','Myanmar'),(23,'adf','ladslj','091234','2025-04-24 15:07:30','active','MMK',NULL,1,'2025-03-25 15:07:30','2025-03-25 15:07:29','Myanmar'),(24,'sample','main road','0912345','2025-03-26 22:26:02','active','MMK',NULL,1,'2025-03-26 22:27:11','2025-03-25 15:13:46','Antigua and Barbuda');
/*!40000 ALTER TABLE `orgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parentcat`
--

DROP TABLE IF EXISTS `parentcat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parentcat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parentcat`
--

LOCK TABLES `parentcat` WRITE;
/*!40000 ALTER TABLE `parentcat` DISABLE KEYS */;
INSERT INTO `parentcat` VALUES (2,'purchase'),(1,'sale');
/*!40000 ALTER TABLE `parentcat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salesperson`
--

DROP TABLE IF EXISTS `salesperson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salesperson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `orgId` int NOT NULL,
  `createdBy` int NOT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`orgId`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salesperson`
--

LOCK TABLES `salesperson` WRITE;
/*!40000 ALTER TABLE `salesperson` DISABLE KEYS */;
INSERT INTO `salesperson` VALUES (1,'Kyaw Gyi',4,1,'active'),(2,'Khin Htay Aung',4,87,'active'),(3,'Hein Thura Soe',4,87,'active'),(10,'Tauk Tauk Lin',4,87,'active'),(15,'Htun ',4,87,'active'),(16,'Htay',4,87,'active'),(17,'Oo Oo',4,87,'active'),(18,'kyaw gyi',15,91,'deleted'),(19,'khin myaung',15,91,'deleted'),(20,'hein',15,91,'deleted'),(21,'hla htun',15,91,'deleted'),(22,'khin htay',15,91,'deleted'),(23,'kyaw kyaw htay',15,91,'active'),(24,'Kyaw Kyaw Aye',14,90,'active'),(25,'Aye Aye',14,90,'active'),(26,'Maung Maung Zaw',16,92,'active'),(27,'Myo Thandar',16,92,'active'),(28,'Khin Mg Toe',15,91,'active');
/*!40000 ALTER TABLE `salesperson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(45) NOT NULL,
  `role` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `orgId` int NOT NULL,
  `status` varchar(45) NOT NULL,
  `registered` datetime NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `expired` datetime DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Du Wun Aung','$2a$10$OsABIG17mRv7KWYBwGOs3O/fIRv4GVkGAYukYS7xOO9QSY4lUx6p.','09770529154','superadmin','duwunaung@gmail.com',0,'active','2024-12-26 10:59:21','','2026-02-25 10:59:21',1,'2025-03-25 16:25:29'),(16,'Du Wun Aung','$2a$10$BZUGAyPf1GYPtGo0BMwY4uGnQSg9Rjh8ChpsHk6gX2lNJ9l.nYM5W','92245754','superadmin','duwunaung.v2@gmail.com',0,'active','2025-01-03 12:01:08',NULL,'2025-02-02 12:01:08',NULL,NULL),(17,'rick','$2a$10$oCE/QqgqDiP8GNN0ARMigOd/JWfnWlgxrscI0xvo8prR0rBqCn/O6','092345678123','superadmin','rick@gmail.com',0,'active','2025-01-05 12:00:43',NULL,'2025-02-04 12:00:43',NULL,NULL),(18,'tommy','$2a$10$88IqecxzaAlefyrBoUF1O.wEw.WZuiLV9VsC./2ut8OAw2S4t.hLu','09345678','admin','tommy@gmail.com',1,'active','2025-01-06 23:17:13',NULL,NULL,NULL,NULL),(19,'hello','$2a$10$WUDCgvS8HtA351LlQb5Xhe1AnlZc6WvkO7KBzHzRDp1WUdPwcznrG','02341234','admin','hello@gmail.com',1,'active','2025-01-09 22:34:27',NULL,NULL,NULL,NULL),(20,'tauk','$2a$10$EUSvTpdqzisV5RExn8dICOzbFG/CiI3DlbHoN6/7jQodL7Kqqwgma','+91234892134','superadmin','tauk@gmail.com',0,'active','2025-01-09 22:48:06',NULL,'2025-02-08 22:48:06',NULL,NULL),(44,'asdfasdxcvcz','$2a$10$RRGoVPL.mTayQW./6W8seeJTbqF7N2dOcBJMAP.YQ.epa/9yn4aBm','12341234123','superadmin','cjajjasldfj@gmail.com',0,'active','2025-01-10 21:38:04',NULL,'2025-02-09 21:38:04',NULL,NULL),(45,'haslkdflksacn','$2a$10$/5mjOCJFwOrtqZy1sU0q2.bNFv748kUaBYeRySOAAsAlCN8eZ1W2a','13415134531451','admin','asdfjlasdjlfk@gmail.com',1,'active','2025-01-10 21:41:37',NULL,NULL,NULL,NULL),(48,'adslk;fjaslkdf','$2a$10$S4WICTF9V4aWcHjQoK6gr.rte9MRlBs2QCeLSBwLFYYw3c6qlbHRy','12341234','superadmin','1234sdsdfdf@gmail.com',0,'active','2025-01-10 21:51:45',NULL,'2025-02-09 21:51:45',NULL,NULL),(49,'tauk1','$2a$10$iIiwxiYWT4aA5.FqZmUZ6.Ja0UVcqtoaJHX3Q5vYAFfCpKWGoSDRe','123412342134','admin','dfasdfasldj1234@gmail.com',6,'pending','2025-01-10 22:53:12',NULL,NULL,NULL,NULL),(62,'hello rick','$2a$10$SUHJBqBHK3tbxNVaBWe/WOROAVtUMRTwBD26ui/38fiFoPVOO8uLS','12341','superadmin','hello123rick@gmail.com',0,'active','2025-01-11 14:01:40',NULL,'2025-02-10 14:01:40',NULL,NULL),(67,'ahhhasdf','$2a$10$qht9aUcuTyfxd/tnzvr7IOED2RKW5RyDyug1GSDCA1I0DbrAgbtAm','12341234adc','admin','asdfasdf1234@gmail.com',1,'active','2025-01-11 14:38:45',NULL,NULL,NULL,NULL),(68,'asdfadf132','$2a$10$0N51JyxmX6U9AQXslaG.suWvgh8IUlp.AxQcmkZhgdi2Fg/.lLX/G','aasdf12341','admin','12cqdvfda@gmail.com',1,'active','2025-01-11 14:39:38',NULL,NULL,NULL,NULL),(69,'adfas','$2a$10$2kqIC7VUZdlYBDtMw0qM1.Y08kR1a4fmlIzWewONIpBZ2QsYmL8Ku','123423adfaca','admin','asdf1234cad@gmail.com',1,'deleted','2025-01-11 14:41:20',NULL,NULL,NULL,NULL),(71,'asdfascljljzfasdfascljljzfasdfascljljzfasdfascljljzfasdfascljljzfasdfascljljzfasdfascljljzfasdfascl','$2a$10$vQagdQrk4yiw0DqQsa/WBuLtmzzmEONDVVOYRzmL.uL6K6dEB5kA2','123412344123asdfascljljzfasdfascljljzfasdfas','superadmin','asdfascljljzf12@gmail.comasdfascljljzfasdfas',0,'active','2025-01-12 13:32:39',NULL,'2025-02-11 13:32:39',NULL,NULL),(72,'asdfascljljzf1234','$2a$10$7m34V60PBtixf5UTuHBtge52oRnHLzExtGW9Sf1llBXC4hFwTgab.','123412512','superadmin','1234asdfascljljzf@gmail.com',0,'active','2025-01-12 13:33:08',NULL,'2025-02-11 13:33:08',NULL,NULL),(73,'1234daasdfascljljzf','$2a$10$ys2h3YuiuSLWYM3dlHuLwOY8jrCSKtpP//.vDpfEf7OBt2Ij/WOx.','12341234','superadmin','1234daasdfascljljzf1234@gmail.com',0,'active','2025-01-12 13:33:26',NULL,'2025-02-11 13:33:26',NULL,NULL),(74,'123412ljlcjvljsldfalk','$2a$10$b0odRPxYRmhuv8yg2f9Vb.eTqC7p/0l1lkn/FAanlGLZ9yBZjNY3O','62345135','superadmin','123412ljlcjvljsldfalk@gmail.com',0,'active','2025-01-12 13:33:46',NULL,'2025-02-11 13:33:46',NULL,NULL),(75,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','$2a$10$nzORylvF5OaGrx5Q92tdweoJtlkiOb1zZ9jesvVfJ9ae7/k5ulZ6W','111111111111111111111111111111111111111111111','manager','ddddddddddddddddddddddddddddddddddd@gmail.com',1,'active','2025-01-13 12:24:47',NULL,NULL,NULL,NULL),(76,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','$2a$10$umCXGpVjYo1B4HdtKDvaNeCGpHc8fKOTmMCHSDD2tu8BOVjLg/iDO','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','superadmin','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@gmail.com',0,'active','2025-01-13 12:41:24',NULL,'2025-02-12 12:41:24',NULL,NULL),(77,'adsfasdf','$2a$10$uQ9MOtTSn1Z.i8acMG5eFOv4q5.JcFOHoGDW.9lbyK1mNnEw8o5R.','123412','superadmin','adfasdfas@gmail.com',0,'active','2025-01-21 23:37:15',NULL,'2025-02-20 23:37:15',NULL,NULL),(82,'1cca1c','$2a$10$glr46YmxxvIk.uT65u8L5.moBLdtekkTUn.Hx3//4OscsOKLp/JGe','12341234','admin','1cca1c@gmail.com',1,'pending','2025-01-22 00:00:56',NULL,NULL,NULL,NULL),(86,'tauk','$2a$10$dhogngHu4HtInb38Z5G3o.yhwhqsPUjR.8uqVp//eG0ZHzhwIwp06','123748901','admin','tauk211@gmail.com',4,'pending','2025-01-23 19:37:45',NULL,NULL,NULL,NULL),(87,'Htin Lin','$2a$10$FLI7aRjQru.FJs3b0g9dlOPD9V33x5CzFWtOXNzGBiIHlpEg6CDUa','091234','admin','htinlin@gmail.com',4,'active','2025-01-23 19:49:09',NULL,'2026-12-22 19:49:09',NULL,NULL),(88,'Kyaw Gyi','$2a$10$Xm4.L7Sq9Axb7Hsz8kr0quCod6jbWvRqNQrOiAwX1lpFZv9j/yosq','01234','admin','kyawgyi@gmail.com',4,'active','2025-02-10 13:11:37',NULL,'2025-03-12 13:11:37',NULL,NULL),(89,'Maung Myo','$2a$10$iYyiExlVW44cxmTJt1S/COJtcAco79xZvcaab6CPQfOyrFGRPcXYa','098765432234','admin','maungmyo@gmail.com',9,'active','2025-02-14 22:20:35',NULL,'2025-03-16 22:20:35',NULL,NULL),(90,'Ko Lin Lin','$2a$10$q1UE.4.nPc5Jxvj/lj3yI.vE4IyHsyXt7SSVbJRIdk8lf7RHEv.qu','09123421234','admin','linlin@gmail.com',14,'active','2025-03-08 17:36:51',NULL,'2025-04-07 17:36:51',1,'2025-03-08 17:36:51'),(91,'Bo Htun','$2a$10$lrXKtM8wuoC1VtvxeJ3IhO6YVrvZojbCK/.EWHOyG08D/R83sIhCC','0191234123','admin','bohtun@gmail.com',15,'active','2025-03-09 09:35:35',NULL,'2025-04-08 09:35:35',1,'2025-03-09 09:35:35'),(92,'Zaw Hein','$2a$10$7RPrjMheTP48EEMbi41hxeNbe/2xUGHVyAlwaXKB5y6xf96IIZoce','0912331522','admin','zawhein@gmail.com',16,'active','2025-03-16 09:58:08',NULL,'2025-04-15 09:58:08',1,'2025-03-16 09:58:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-04  0:19:04
