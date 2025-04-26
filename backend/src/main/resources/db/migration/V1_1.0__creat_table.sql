CREATE TABLE IF NOT EXISTS word_groups (
    id serial PRIMARY KEY,
    group_name varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS WORDS (
    id serial primary key,
    foreign_word varchar(100) not null,
    translated_word varchar(100) not null,
    group_id INTEGER,
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES word_groups(id)
);