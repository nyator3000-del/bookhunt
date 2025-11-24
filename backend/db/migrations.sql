-- SQL миграция для Postgres (create tables)
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  year TEXT,
  atmosphere TEXT,
  pace TEXT,
  hero TEXT,
  style TEXT,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  username TEXT,
  text TEXT,
  rating INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  book_id INT REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, book_id)
);

INSERT INTO books(title,author,year,atmosphere,pace,hero,style,description) VALUES
('Тихие улицы','А. Иванов','2018','Уютная','Медленный','Обычный человек','Лирический','Нежная история о маленьком городе.');
