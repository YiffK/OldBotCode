-- MySQL dump 10.13  Distrib 8.0.25, for macos11.3 (x86_64)
--
-- Host: localhost    Database: yiffycornerbot
-- ------------------------------------------------------
-- Server version	8.0.25

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
-- Table structure for table `cfg_permission`
--

DROP TABLE IF EXISTS `cfg_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cfg_permission` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cfg_permission`
--

LOCK TABLES `cfg_permission` WRITE;
/*!40000 ALTER TABLE `cfg_permission` DISABLE KEYS */;
INSERT INTO `cfg_permission` VALUES (1,'post');
/*!40000 ALTER TABLE `cfg_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cfg_role`
--

DROP TABLE IF EXISTS `cfg_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cfg_role` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cfg_role`
--

LOCK TABLES `cfg_role` WRITE;
/*!40000 ALTER TABLE `cfg_role` DISABLE KEYS */;
INSERT INTO `cfg_role` VALUES (1,'poster');
/*!40000 ALTER TABLE `cfg_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `con_role_permission`
--

DROP TABLE IF EXISTS `con_role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `con_role_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` tinyint unsigned NOT NULL,
  `permission_id` tinyint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `con_role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `cfg_role` (`id`),
  CONSTRAINT `con_role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `cfg_permission` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `con_role_permission`
--

LOCK TABLES `con_role_permission` WRITE;
/*!40000 ALTER TABLE `con_role_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `con_role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `submission_id` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `submission_id` (`submission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (26,'2227914'),(9,'28300180'),(3,'34437262'),(4,'39371045'),(7,'41329165'),(6,'41744601'),(29,'41839549'),(5,'41971012'),(1,'42130067'),(2,'42669680'),(8,'42681355'),(27,'42681450'),(28,'42681927');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usage_log`
--

DROP TABLE IF EXISTS `usage_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usage_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_internal_id` bigint unsigned NOT NULL COMMENT 'Not the user id from telegram, but the internal one.',
  `command` varchar(40) NOT NULL COMMENT 'The command used',
  `arguments` varchar(191) DEFAULT NULL COMMENT 'The arguments in the command',
  `success` tinyint(1) NOT NULL DEFAULT '0',
  `issued_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_internal_id` (`user_internal_id`),
  CONSTRAINT `usage_log_ibfk_1` FOREIGN KEY (`user_internal_id`) REFERENCES `usr_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usage_log`
--

LOCK TABLES `usage_log` WRITE;
/*!40000 ALTER TABLE `usage_log` DISABLE KEYS */;
INSERT INTO `usage_log` VALUES (1,1,'start',NULL,1,'2021-07-07 17:49:42'),(2,1,'start',NULL,1,'2021-07-07 17:49:42'),(3,1,'start',NULL,1,'2021-07-07 17:49:42'),(5,4,'start',NULL,1,'2021-07-07 17:52:26'),(7,1,'submit',NULL,0,'2021-07-07 20:47:17'),(8,1,'submit',NULL,0,'2021-07-07 20:48:54'),(9,6,'start',NULL,1,'2021-07-07 21:42:44'),(10,7,'start',NULL,1,'2021-07-07 22:29:31'),(11,8,'start',NULL,1,'2021-07-07 23:20:09'),(12,9,'start',NULL,1,'2021-07-07 23:41:02'),(13,9,'start',NULL,1,'2021-07-07 23:44:17');
/*!40000 ALTER TABLE `usage_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usr_role`
--

DROP TABLE IF EXISTS `usr_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usr_role` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` tinyint unsigned NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `usr_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usr_user` (`id`),
  CONSTRAINT `usr_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `cfg_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usr_role`
--

LOCK TABLES `usr_role` WRITE;
/*!40000 ALTER TABLE `usr_role` DISABLE KEYS */;
INSERT INTO `usr_role` VALUES (1,1),(5,1),(6,1),(8,1),(9,1);
/*!40000 ALTER TABLE `usr_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usr_user`
--

DROP TABLE IF EXISTS `usr_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usr_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(30) NOT NULL COMMENT 'Store as string to save space',
  `current_username` varchar(50) DEFAULT NULL COMMENT 'Must be updated accordingly',
  `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `current_username` (`current_username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usr_user`
--

LOCK TABLES `usr_user` WRITE;
/*!40000 ALTER TABLE `usr_user` DISABLE KEYS */;
INSERT INTO `usr_user` VALUES (1,'1402476143','Yagdrassyl','2021-07-07 17:49:42'),(4,'657177532','FloofyCatto','2021-07-07 17:50:36'),(5,'700377699','TheHorsey','2021-07-07 20:13:27'),(6,'1090536985','whenthecitysleeps','2021-07-07 21:42:44'),(7,'392105860','VinnieGoesCackle','2021-07-07 22:29:31'),(8,'760052860','mulipios_23','2021-07-07 23:20:09'),(9,'659118533','Ryndion','2021-07-07 23:41:02');
/*!40000 ALTER TABLE `usr_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-07-07 23:07:06
