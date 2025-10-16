-- ============================================================================
-- EXPORTAÇÃO COMPLETA DA BASE DE DADOS - SISTEMA TERRA DO BUGIO
-- ============================================================================
-- 
-- 📊 Database: recepcaotb
-- 🏠 Host: localhost:3306
-- 📅 Data da Exportação: 16/10/2025, 11:56:55
-- 🔧 Versão do Sistema: 1.1.0
-- 
-- ⚠️  INSTRUÇÕES PARA IMPORTAÇÃO NO PHPMYADMIN:
-- 1. Acesse o phpMyAdmin
-- 2. Crie uma nova base de dados com nome: recepcaotb
-- 3. Selecione a base criada
-- 4. Vá na aba "Importar"
-- 5. Selecione este arquivo SQL
-- 6. Clique em "Executar"
-- 
-- 📋 CONTEÚDO INCLUÍDO:
-- ✅ Estrutura completa das tabelas
-- ✅ Todos os dados existentes
-- ✅ Índices e chaves estrangeiras
-- ✅ Triggers e procedures (se existirem)
-- ✅ Configurações de charset (UTF8MB4)
-- 
-- 🔒 CREDENCIAIS PADRÃO APÓS IMPORTAÇÃO:
-- Email: admin@terradobugio.com
-- Senha: admin123
-- 
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: recepcaotb
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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
-- Table structure for table `frequencias`
--

DROP TABLE IF EXISTS `frequencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequencias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pessoa_id` int(10) unsigned NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `numero_senha` int(11) NOT NULL,
  `data` date NOT NULL,
  `numero_senha_tutor` int(11) DEFAULT NULL,
  `numero_senha_pet` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_frequencias_data` (`data`),
  KEY `idx_frequencias_pessoa_id` (`pessoa_id`),
  KEY `idx_frequencias_tipo` (`tipo`),
  CONSTRAINT `frequencias_pessoa_id_foreign` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequencias`
--

LOCK TABLES `frequencias` WRITE;
/*!40000 ALTER TABLE `frequencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `frequencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations`
--

DROP TABLE IF EXISTS `knex_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations`
--

LOCK TABLES `knex_migrations` WRITE;
/*!40000 ALTER TABLE `knex_migrations` DISABLE KEYS */;
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (1,'20231014140000_create_initial_tables.js',1,'2025-10-14 14:16:19'),(2,'20251014141602_create_initial_tables.js',1,'2025-10-14 14:16:19');
/*!40000 ALTER TABLE `knex_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations_lock`
--

DROP TABLE IF EXISTS `knex_migrations_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations_lock`
--

LOCK TABLES `knex_migrations_lock` WRITE;
/*!40000 ALTER TABLE `knex_migrations_lock` DISABLE KEYS */;
INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES (1,0);
/*!40000 ALTER TABLE `knex_migrations_lock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pessoas`
--

DROP TABLE IF EXISTS `pessoas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pessoas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `nascimento` date DEFAULT NULL,
  `religiao` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) NOT NULL,
  `estado` varchar(2) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `indicacao` varchar(255) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pessoas_nome` (`nome`),
  KEY `idx_pessoas_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=5516 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pessoas`
--

LOCK TABLES `pessoas` WRITE;
/*!40000 ALTER TABLE `pessoas` DISABLE KEYS */;
INSERT INTO `pessoas` (`id`, `nome`, `cpf`, `nascimento`, `religiao`, `cidade`, `estado`, `telefone`, `email`, `indicacao`, `observacao`, `created_at`) VALUES (5515,'Pessoa Teste','',NULL,'','São Paulo','SP','','teste@exemplo.com','','','2025-10-16 14:11:27');
/*!40000 ALTER TABLE `pessoas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessoes`
--

DROP TABLE IF EXISTS `sessoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessoes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessoes_token_unique` (`token`),
  KEY `sessoes_usuario_id_foreign` (`usuario_id`),
  KEY `idx_sessoes_token` (`token`),
  KEY `idx_sessoes_expires` (`expires_at`),
  CONSTRAINT `sessoes_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessoes`
--

LOCK TABLES `sessoes` WRITE;
/*!40000 ALTER TABLE `sessoes` DISABLE KEYS */;
INSERT INTO `sessoes` (`id`, `usuario_id`, `token`, `expires_at`, `created_at`, `user_agent`, `ip_address`) VALUES (176,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYWRtaW5AdGVycmFkb2J1Z2lvLmNvbSIsInR5cGUiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzYwNjIzODg3LCJleHAiOjE3NjA3MTAyODd9.aPfpRxQSCbi5jaG00jBBQOz_eVXl757I3JGAZ5U-_Nw','2025-10-17 17:11:27','2025-10-16 14:11:27','axios/1.12.2','::1');
/*!40000 ALTER TABLE `sessoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('geral','responsavel','administrador') NOT NULL,
  `pessoa_id` int(10) unsigned DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `deve_trocar_senha` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_unique` (`email`),
  KEY `usuarios_pessoa_id_foreign` (`pessoa_id`),
  KEY `idx_usuarios_email` (`email`),
  CONSTRAINT `usuarios_pessoa_id_foreign` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `tipo`, `pessoa_id`, `ativo`, `deve_trocar_senha`, `created_at`) VALUES (2,'ADM','admin@terradobugio.com','$2b$10$1onIw7QUD7b9SQCKuNUJweZwD6r58JFrAcnAyOJ4uPet3ctUovuWm','administrador',NULL,1,0,'2025-10-08 20:54:43');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'recepcaotb'
--

--
-- Dumping routines for database 'recepcaotb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 11:56:55

-- ============================================================================
-- FIM DA EXPORTAÇÃO
-- ============================================================================
-- 
-- ✅ Importação concluída com sucesso!
-- 🌐 Acesse: http://localhost/seu-projeto
-- 📧 Login: admin@terradobugio.com
-- 🔑 Senha: admin123
-- 
-- Para suporte: Consulte a documentação do projeto
-- 
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
