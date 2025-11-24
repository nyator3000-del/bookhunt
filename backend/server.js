const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.PG_CONNECTION || 'postgres://user:pass@localhost:5432/bookhunt' });

const app = express();
app.use(cors());
app.use(bodyParser.json({limit:'5mb'}));

app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

app.get('/api/books', async (req, res) => {
  try{
    const result = await pool.query('SELECT id,title,author,year,atmosphere,pace,hero,style,description,cover_url FROM books ORDER BY created_at DESC LIMIT 100');
    return res.json(result.rows.map(r=>({ ...r, cover: r.cover_url || '/assets/covers/tihie.svg' })));
  }catch(e){
    console.warn('DB error:', e.message);
    const seed = JSON.parse(fs.readFileSync(path.join(__dirname,'../frontend/db/seed.json'),'utf8'));
    return res.json(seed);
  }
});

app.post('/api/admin/book', upload.single('cover'), async (req, res) => {
  try{
    const { title, author, year, atmosphere, pace, hero, style, description } = req.body;
    let cover_url = null;
    if(req.file){
      const updir = path.join(__dirname, 'uploads'); if(!fs.existsSync(updir)) fs.mkdirSync(updir);
      const fname = Date.now() + '_' + (req.file.originalname || 'cover.png');
      fs.writeFileSync(path.join(updir,fname), req.file.buffer);
      cover_url = '/uploads/' + fname;
      app.use('/uploads', express.static(path.join(__dirname,'uploads')));
    }
    try{
      const result = await pool.query('INSERT INTO books(title,author,year,atmosphere,pace,hero,style,description,cover_url,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) RETURNING id', [title,author,year,atmosphere,pace,hero,style,description,cover_url]);
      return res.json({ok:true, id: result.rows[0].id});
    }catch(err){
      console.warn('Insert error:', err.message);
      const seedPath = path.join(__dirname,'../frontend/db/seed.json');
      const seed = JSON.parse(fs.readFileSync(seedPath,'utf8'));
      const id = 'b' + (Math.floor(Math.random()*100000));
      seed.unshift({id,title,author,year,atmosphere,pace,hero,style,description,cover: cover_url || '/assets/covers/tihie.svg'});
      fs.writeFileSync(seedPath, JSON.stringify(seed,null,2),'utf8');
      return res.json({ok:true, id});
    }
  }catch(e){
    console.error(e); res.status(500).json({error:e.message});
  }
});

app.post('/api/book/:id/comment', async (req, res) => {
  const bookId = req.params.id;
  const { user, text, rating } = req.body;
  try{
    const result = await pool.query('INSERT INTO comments(book_id,username,text,rating,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id',[bookId,user,text,rating]);
    return res.json({ok:true,id: result.rows[0].id});
  }catch(err){
    const f = path.join(__dirname,'comments.json');
    const arr = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f,'utf8')) : [];
    const id = Date.now(); arr.push({id,bookId,user,text,rating,created_at: new Date().toISOString()}); fs.writeFileSync(f, JSON.stringify(arr,null,2),'utf8');
    return res.json({ok:true,id});
  }
});

app.listen(4000, ()=> console.log('BookHunt backend listening on 4000'))