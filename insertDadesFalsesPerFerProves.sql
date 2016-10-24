INSERT INTO achievements VALUES ("logro 01", "random description 01");
INSERT INTO achievements VALUES ("logro 02", "random description 02");
INSERT INTO achievements VALUES ("logro 03", "random description 03");

INSERT INTO rewards VALUES ("recompensa 01", "Descripció de la primera recompensa", 100, 1);
INSERT INTO rewards VALUES ("recompensa 02", "Descripció de la segona recompensa", 200, 1);
INSERT INTO rewards VALUES ("recompensa 03", "Descripció de la tercera recompensa", 50, 2);
INSERT INTO rewards VALUES ("recompensa 04", "Descripció de la 4a recompensa", 10, 1);

INSERT INTO users VALUES (1, "provider", "Nom1", "Cognom1", "emailfals1@gmail.com", 500, 1800, 1);
INSERT INTO users VALUES (2, "provider", "Nom2", "Cognom2", "emailfals2@gmail.com", 200, 200, 1);
INSERT INTO users VALUES (3, "provider", "Nom3", "Cognom3", "emailfals3@gmail.com", 60, 60, 1);

INSERT INTO events VALUES ("E0-001-093720767-4", 0, "2017-02-27 00:00:00", "2017-03-02 00:00:00");
INSERT INTO events VALUES ("E0-001-000278174-6", 0, "2005-08-24 12:00:00", null);

INSERT INTO attendances VALUES("E0-001-093720767-4", 1, "provider", false);
INSERT INTO attendances VALUES("E0-001-000278174-6", 1, "provider", true);

INSERT INTO acquisitions VALUES(1, "provider", "logro 01");

INSERT INTO purchases VALUES (1, "provider", "recompensa 01", 3);
INSERT INTO purchases VALUES (1, "provider", "recompensa 02", 5);
