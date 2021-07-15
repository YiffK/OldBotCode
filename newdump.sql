-- MySQL dump 10.13  Distrib 8.0.25, for macos11.3 (x86_64)
--
-- Host: yiffycornerbot.cy9h3lacqhei.us-east-2.rds.amazonaws.com    Database: yiffycornerbot
-- ------------------------------------------------------
-- Server version	8.0.23

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

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
  `source_id` tinyint NOT NULL DEFAULT '1',
  `submission_id` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `submission_id` (`submission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'42130067'),(2,1,'42669680'),(3,1,'34437262'),(4,1,'39371045'),(5,1,'41971012'),(6,1,'41744601'),(7,1,'41329165'),(8,1,'42681355'),(9,1,'28300180'),(26,1,'2227914'),(27,1,'42681450'),(28,1,'42681927'),(29,1,'41839549'),(30,1,'41376249'),(31,1,'24462220'),(32,1,'39662529'),(33,1,'33301972'),(34,1,'25606887'),(35,1,'37861626'),(36,1,'37105165'),(37,1,'39708982'),(38,1,'42279660'),(39,1,'41955077'),(40,1,'20433094'),(41,1,'42689189'),(42,1,'42691097'),(43,1,'42691521'),(44,1,'39887152'),(45,1,'37652914'),(46,1,'38411255'),(47,1,'40103371'),(48,1,'42556024'),(49,3,'1413269082'),(53,3,'1413275126'),(54,3,'1413252688'),(55,3,'1413288004'),(56,3,'1413277889'),(57,3,'1413310375'),(58,3,'1413166221'),(59,3,'1410727754'),(60,3,'1413323811'),(61,3,'1413247387'),(62,3,'1412761892'),(63,3,'1412869550'),(64,3,'1413293362'),(65,3,'1413192307'),(66,3,'1413256185'),(67,3,'1413205205'),(68,3,'1413247127'),(69,3,'1413012508'),(70,3,'1407046502'),(71,3,'1413328000'),(72,3,'1411332279'),(73,3,'1409166299'),(74,1,'42693743'),(75,1,'29051447'),(76,3,'1413089678'),(77,1,'28972955'),(78,1,'28961939'),(79,1,'42691325'),(80,1,'42689819'),(81,1,'41796551'),(82,1,'42698957'),(84,3,'1387041105'),(85,3,'1385328470'),(88,3,'1412482734'),(89,1,'36439562'),(90,1,'29048638'),(91,1,'42620255'),(92,3,'1388933385'),(93,3,'1407416058'),(95,3,'1413255868'),(96,3,'1409904557'),(97,3,'1400844956'),(98,3,'1397221051'),(99,3,'1394322020'),(100,1,'38986944'),(102,1,'42695256'),(103,3,'1413241483'),(104,1,'39882797'),(105,1,'34328875'),(106,1,'42179804'),(107,3,'1412774599'),(108,1,'33373610'),(109,1,'31539506'),(110,1,'36105466'),(111,3,'1408098457'),(112,1,'42009676'),(113,1,'42657336'),(114,3,'1409993419'),(115,1,'40266141'),(116,1,'42603389'),(117,1,'41329434'),(118,1,'41106877'),(119,3,'1412469146'),(120,1,'42696313'),(121,1,'42697454'),(122,1,'42561856'),(123,3,'1412893484'),(124,3,'1412459337'),(125,1,'38107567'),(126,3,'1310762736'),(127,1,'34828559'),(128,1,'28829784'),(129,1,'42709361'),(130,1,'42706474'),(131,1,'42706438'),(132,1,'42706379'),(133,1,'42701448'),(134,1,'42711131'),(135,1,'42085826'),(136,1,'42619165'),(137,3,'1413627166'),(138,3,'1413147217'),(139,3,'1413624127'),(140,3,'1412928672'),(141,3,'1413538242'),(142,1,'30770139'),(143,3,'1410712576'),(144,3,'1391778723'),(145,3,'1352019243'),(146,1,'22074671'),(147,3,'1409574307'),(148,3,'1413548754'),(149,3,'1408466844'),(151,3,'1413535874'),(152,3,'1413588888'),(153,3,'1413563420'),(154,3,'1413573684'),(155,3,'1413541555'),(156,3,'1413529074'),(157,3,'1413210928'),(158,3,'1411106164'),(159,3,'1406427678'),(160,3,'1406362901'),(161,3,'1398610580'),(162,3,'1396890986'),(163,3,'1390722891'),(165,3,'1413669109'),(166,3,'1413658108'),(168,3,'1413542340'),(169,3,'1406682794'),(170,3,'1406330516'),(171,3,'1405940872'),(172,3,'1405229228'),(173,3,'1413679155'),(174,3,'1397673002'),(175,3,'1407827882'),(176,3,'1407114315'),(177,3,'1404585074'),(178,3,'1125368629'),(179,3,'1411396139'),(180,3,'1402010560'),(181,3,'1407081573'),(182,3,'1277386783'),(183,3,'1097710096'),(184,3,'1413464282'),(185,3,'1410059361'),(188,1,'42610101'),(189,1,'39741336'),(190,3,'1330651890'),(191,3,'1409686678'),(192,3,'1413662906'),(193,1,'42713153'),(194,1,'42711531'),(195,3,'1290814827'),(196,3,'1403849447'),(197,3,'1364059331'),(198,3,'1413489786'),(199,1,'19052008'),(200,1,'24536851'),(201,1,'39023676'),(202,1,'39023816'),(203,1,'39841959'),(204,1,'38252626'),(205,1,'40624960'),(206,1,'34355044'),(207,1,'40085291'),(208,1,'25768335'),(209,1,'34622241'),(210,1,'42390816'),(211,1,'42266746'),(212,1,'42219580'),(213,1,'25775724'),(214,1,'42281947'),(215,1,'39689647'),(216,1,'36285598'),(217,1,'30763522'),(218,1,'42531743'),(219,1,'40432571'),(220,1,'23844744'),(221,1,'34230608'),(222,1,'41889222'),(223,1,'25291815'),(224,3,'1413945755'),(225,1,'42722063'),(226,1,'42721541'),(227,1,'42714374'),(228,1,'41592064'),(229,1,'42723704?u'),(230,1,'39610612'),(231,1,'36335995'),(232,1,'38284089'),(233,3,'1413556599'),(234,3,'1391836173'),(235,1,'40616615'),(236,3,'1411716506'),(237,1,'42728230'),(238,3,'1414062483'),(239,1,'33240179'),(240,3,'1413953175'),(242,1,'42738624'),(243,3,'1414345537'),(244,3,'1413999654'),(245,3,'1414268790'),(246,1,'42742315'),(247,1,'42741658'),(248,1,'42739956'),(249,1,'42739583'),(250,1,'42739461'),(251,1,'42738100'),(252,1,'42738083'),(253,1,'42735737'),(254,1,'42736166'),(255,1,'42730085'),(256,1,'42727834'),(257,1,'42725816'),(258,3,'1413752718'),(259,3,'1388870898'),(260,1,'42742483'),(261,1,'42742458'),(262,3,'1414402012'),(263,3,'1414402006'),(264,3,'1302852179'),(265,3,'1414351670'),(266,3,'1414027267'),(267,3,'1414361629'),(268,3,'1414325983'),(269,3,'1414305416'),(270,3,'1414162169'),(271,3,'1414349141'),(272,3,'1414333201'),(273,1,'42085674'),(274,1,'42692096'),(275,1,'21921115'),(276,3,'1414219591'),(277,1,'34571861'),(278,1,'42603678'),(279,1,'35162966'),(280,1,'42626643'),(281,1,'42589105'),(282,1,'42564516'),(283,1,'42671869'),(284,3,'1414374817'),(285,1,'24317329'),(286,1,'42684508'),(287,3,'1414659284'),(288,3,'1344346653'),(289,1,'42567804'),(290,1,'42567838'),(291,1,'42738334'),(292,1,'42746513'),(293,1,'42759686'),(294,1,'42758638'),(295,1,'42758543'),(296,1,'42757483'),(297,1,'42759725'),(298,3,'1414665583'),(299,3,'1414561027'),(300,3,'1346554980'),(301,3,'1414662992'),(302,3,'1414589464'),(303,3,'1414513797'),(304,3,'1414669702'),(305,3,'1414758967'),(306,3,'1414744896'),(307,3,'1414709820'),(308,3,'1414723720'),(309,3,'1312243089'),(310,3,'1414723112'),(311,3,'1414706097'),(312,1,'42747224'),(313,1,'42762078'),(314,1,'38760395'),(315,1,'38761176'),(316,1,'42765557'),(317,1,'42771449'),(318,1,'42771427'),(319,3,'1415024373'),(320,3,'1415058167'),(321,3,'1414367662'),(322,3,'1413236554'),(323,1,'36965586'),(324,1,'41224846'),(325,1,'42789906'),(326,1,'42790096'),(327,1,'42788918'),(328,1,'42786427'),(329,1,'42786137'),(330,1,'42783930'),(331,1,'42772936'),(332,1,'42772970'),(333,1,'42771766'),(334,1,'42768844'),(335,1,'42768716'),(336,1,'42766795'),(337,1,'42766047'),(338,1,'42766132'),(339,1,'42766007'),(340,1,'42765862'),(341,1,'42765946'),(342,3,'1415293532'),(343,3,'1415241336'),(344,3,'1415499023'),(345,3,'1415363516'),(346,3,'1415361666'),(347,3,'1415439076'),(348,3,'1415130041'),(349,3,'1415526485'),(350,3,'1415367459');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sources`
--

DROP TABLE IF EXISTS `sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sources` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `source_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sources`
--

LOCK TABLES `sources` WRITE;
/*!40000 ALTER TABLE `sources` DISABLE KEYS */;
/*!40000 ALTER TABLE `sources` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usage_log`
--

LOCK TABLES `usage_log` WRITE;
/*!40000 ALTER TABLE `usage_log` DISABLE KEYS */;
INSERT INTO `usage_log` VALUES (1,1,'start',NULL,1,'2021-07-07 17:49:42'),(2,1,'start',NULL,1,'2021-07-07 17:49:42'),(3,1,'start',NULL,1,'2021-07-07 17:49:42'),(5,4,'start',NULL,1,'2021-07-07 17:52:26'),(7,1,'submit',NULL,0,'2021-07-07 20:47:17'),(8,1,'submit',NULL,0,'2021-07-07 20:48:54'),(10,7,'start',NULL,1,'2021-07-07 22:29:31'),(11,8,'start',NULL,1,'2021-07-07 23:20:09'),(12,9,'start',NULL,1,'2021-07-07 23:41:02'),(13,9,'start',NULL,1,'2021-07-07 23:44:17'),(17,1,'start',NULL,1,'2021-07-09 03:43:02'),(19,13,'extract',NULL,0,'2021-07-10 20:28:24'),(20,13,'extract',NULL,0,'2021-07-10 20:28:46'),(21,14,'extract',NULL,0,'2021-07-11 08:35:53'),(22,14,'extract',NULL,0,'2021-07-11 08:36:13'),(23,8,'extract',NULL,0,'2021-07-12 12:34:16'),(24,15,'extract',NULL,0,'2021-07-15 04:45:34');
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
INSERT INTO `usr_role` VALUES (1,1),(5,1),(8,1),(9,1),(12,1),(13,1),(14,1),(15,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usr_user`
--

LOCK TABLES `usr_user` WRITE;
/*!40000 ALTER TABLE `usr_user` DISABLE KEYS */;
INSERT INTO `usr_user` VALUES (1,'1402476143','Yagdrassyl','2021-07-07 17:49:42'),(4,'657177532','FloofyCatto','2021-07-07 17:50:36'),(5,'700377699','TheHorsey','2021-07-07 20:13:27'),(7,'392105860','VinnieGoesCackle','2021-07-07 22:29:31'),(8,'760052860','mulipios_23','2021-07-07 23:20:09'),(9,'659118533','Ryndion','2021-07-07 23:41:02'),(11,'1090536985','whenthecitysleeps','2021-07-09 04:00:56'),(12,'660078140','raccoonvocalist','2021-07-09 04:02:27'),(13,'166843532','YaegerArts','2021-07-10 20:27:48'),(14,'468509838','NightstalkerTheWolfdragon','2021-07-10 21:25:20'),(15,'359205382','DigREEEEEE','2021-07-15 04:45:23');
/*!40000 ALTER TABLE `usr_user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-07-14 23:09:09
