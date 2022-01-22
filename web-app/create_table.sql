SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS resp_maint;
DROP TABLE IF EXISTS ressources;
DROP TABLE IF EXISTS anomalies;
DROP TABLE IF EXISTS admin;

create table resp_maint (
id int auto_increment,
name varchar(255),
email varchar(255),
pwd varchar(255),
primary key (id)
);

create table ressources (
id int auto_increment,
name varchar(255),
description text,
localisation varchar(255),
resp_maint_id int,
primary key (id),
foreign key (resp_maint_id) 
references resp_maint (id)
ON DELETE CASCADE
);

create table anomalies (
id int auto_increment,
description text,
id_ressource int,
primary key (id),
foreign key (id_ressource)
references ressources (id)
ON DELETE CASCADE
);

create table admin (email varchar(255), pwd varchar(255));

insert into admin values ('admin', 'admin');

insert into resp_maint (name, email, pwd) 
values ('yacine', 'yacine@toto.com', 'yacine');

insert into resp_maint (name, email, pwd) 
values ('omar', 'omar@toto.com', 'omar');

insert into ressources (name, description, localisation, resp_maint_id)
values ('projecteur', 'Canon mx-250', 'amphi A', 1);

insert into ressources (name, description, localisation, resp_maint_id)
values ('lampe', 'lampe jaune', 'U.2.2.36', 1);

insert into ressources (name, description, localisation, resp_maint_id)
values ('clavier', 'clavier azerty très bon état', 'U.2.2.25', 1);

insert into ressources (name, description, localisation, resp_maint_id)
values ('souris', 'souris logitech parfait état', 'U.2.2.35', 1);

insert into anomalies (description, id_ressource) 
values ('ne sallume pas', 1);

insert into anomalies (description, id_ressource) 
values ('image noir', 1);

insert into anomalies (description, id_ressource) 
values ('elle est grillé', 2);

insert into anomalies (description, id_ressource) 
values ('clignote et fait du bruit', 2);

insert into anomalies (description, id_ressource) 
values ('flêche directionelle manquante', 3);

insert into anomalies (description, id_ressource) 
values ('les touches se coincent', 3);

insert into anomalies (description, id_ressource) 
values ('clic droit ne fonctionne pas toujours', 4);