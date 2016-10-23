-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`events`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`events` ;

CREATE TABLE IF NOT EXISTS `mydb`.`events` (
  `id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`users` ;

CREATE TABLE IF NOT EXISTS `mydb`.`users` (
  `uid` INT NOT NULL,
  `provider` VARCHAR(30) NOT NULL,
  `name` VARCHAR(30) NULL,
  `surname` VARCHAR(30) NULL,
  `email` VARCHAR(50) NULL,
  `takes` INT NULL,
  `experience` INT NULL,
  `level` INT NULL,
  PRIMARY KEY (`uid`, `provider`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`attendances`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`attendances` ;

CREATE TABLE IF NOT EXISTS `mydb`.`attendances` (
  `events_id` VARCHAR(255) NOT NULL,
  `users_uid` INT NOT NULL,
  `users_provider` VARCHAR(30) NOT NULL,
  `checkin_done` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`events_id`, `users_uid`, `users_provider`),
  INDEX `fk_events_has_users_users1_idx` (`users_uid` ASC, `users_provider` ASC),
  INDEX `fk_events_has_users_events_idx` (`events_id` ASC),
  CONSTRAINT `fk_events_has_users_events`
    FOREIGN KEY (`events_id`)
    REFERENCES `mydb`.`events` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_has_users_users1`
    FOREIGN KEY (`users_uid` , `users_provider`)
    REFERENCES `mydb`.`users` (`uid` , `provider`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`rewards`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`rewards` ;

CREATE TABLE IF NOT EXISTS `mydb`.`rewards` (
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NULL,
  `takes` INT NULL,
  `level` INT NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`purchases`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`purchases` ;

CREATE TABLE IF NOT EXISTS `mydb`.`purchases` (
  `users_uid` INT NOT NULL,
  `users_provider` VARCHAR(30) NOT NULL,
  `rewards_name` VARCHAR(100) NOT NULL,
  `amount` INT NOT NULL,
  PRIMARY KEY (`users_uid`, `users_provider`, `rewards_name`),
  INDEX `fk_users_has_rewards_rewards1_idx` (`rewards_name` ASC),
  INDEX `fk_users_has_rewards_users1_idx` (`users_uid` ASC, `users_provider` ASC),
  CONSTRAINT `fk_users_has_rewards_users1`
    FOREIGN KEY (`users_uid` , `users_provider`)
    REFERENCES `mydb`.`users` (`uid` , `provider`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_rewards_rewards1`
    FOREIGN KEY (`rewards_name`)
    REFERENCES `mydb`.`rewards` (`name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`achievements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`achievements` ;

CREATE TABLE IF NOT EXISTS `mydb`.`achievements` (
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`acquisitions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`acquisitions` ;

CREATE TABLE IF NOT EXISTS `mydb`.`acquisitions` (
  `users_uid` INT NOT NULL,
  `users_provider` VARCHAR(30) NOT NULL,
  `achievements_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`users_uid`, `users_provider`, `achievements_name`),
  INDEX `fk_users_has_achievements_achievements1_idx` (`achievements_name` ASC),
  INDEX `fk_users_has_achievements_users1_idx` (`users_uid` ASC, `users_provider` ASC),
  CONSTRAINT `fk_users_has_achievements_users1`
    FOREIGN KEY (`users_uid` , `users_provider`)
    REFERENCES `mydb`.`users` (`uid` , `provider`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_achievements_achievements1`
    FOREIGN KEY (`achievements_name`)
    REFERENCES `mydb`.`achievements` (`name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
