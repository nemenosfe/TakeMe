INSERT INTO users VALUES (1, "provider", "Nom1", 2500, 3800, 2);
INSERT INTO users VALUES (2, "provider", "Nom2", 200, 200, 1);
INSERT INTO users VALUES (3, "provider", "Nom3", 60, 60, 1);

INSERT INTO tokens VALUES("b903e0f0b987fc22588f517c9df0274f", 1, "provider");
INSERT INTO tokens VALUES("526b0e737e7ad6e3344da44e56559ce5", 2, "provider");
INSERT INTO tokens VALUES("67bfd2aa446a1f125fed5d317dc254a5", 3, "provider");

INSERT INTO events VALUES ("E0-001-093720767-4", 0, "2017-02-27 00:00:00", "2017-03-02 00:00:00", 0, 10);
INSERT INTO events VALUES ("E0-001-000278174-6", 0, "2005-08-24 12:00:00", null, 0, 5);
INSERT INTO events VALUES ("E0-001-096844204-0@2016102500", 0, "2016-10-25 00:35:00", null, 0, 5);
INSERT INTO events VALUES("E0-001-095872589-2@2016102508", 2, null, null, 0, 10);

INSERT INTO attendances VALUES("E0-001-093720767-4", 1, "provider", false);
INSERT INTO attendances VALUES("E0-001-000278174-6", 1, "provider", true);
INSERT INTO attendances VALUES("E0-001-000278174-6", 2, "provider", true);
INSERT INTO attendances VALUES("E0-001-096844204-0@2016102500", 1, "provider", false);
INSERT INTO attendances VALUES("E0-001-095872589-2@2016102508", 1, "provider", false);

INSERT INTO userscategories VALUES(1, "provider", "music", 1);
INSERT INTO userscategories VALUES(2, "provider", "music", 1);
