drop table if exists help;

create table help(

    id serial primary key not null,
    country varchar(255),
    TotalConfirmed varchar(255),
    TotalDeaths varchar(255),
    TotalRecovered varchar(255),
    Date varchar(255)
);
select * from help;

