require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const fs = require('fs');
const https=require('https');
const lodash=require('lodash');
const ejs=require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { log } = require('console');
const app=express();

const secret = process.env.SECRET;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

app.use(session({
    secret: 'AnimeDB.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://ald1k0n:test123@cluster0.ssglm.mongodb.net/AnimeDB",{useNewUrlParser:true});

const accountSchema = new mongoose.Schema({
    nick:String,
    pass:String,
});

const commentSchema = new mongoose.Schema({
    name:String,
    comment:String,
    date:String,
    title:String
});

const favSchema = new mongoose.Schema({
    url:String,
    user:String
});

const newsSchema = new mongoose.Schema({
    title:String,
    content:String,
    image:String
});

const Favorite = new mongoose.model("fav",favSchema);
const News = new mongoose.model('new',newsSchema);
const Coms = new mongoose.model("com",commentSchema);

accountSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",accountSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//Глобальные переменные
var commits=[];
var news=[];
const newsApiKey ="7a9514e3fe8441638685129d340a555b";
const urlNews = "https://newsapi.org/v2/";
const jikanApi = "https://api.jikan.moe/v4/top/anime?filter=airing";
const finish = "https://api.jikan.moe/v4/top/anime?filter=bypopularity";
const queryAPI = "https://api.jikan.moe/v4/anime?q=";


app.get('/',function(req,res){
    let apiUrl = urlNews + "everything?apiKey=" + newsApiKey +"&q=anime";
    https.get(apiUrl,function(response){
        let data = [];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            var animeNews = JSON.parse(Buffer.concat(data).toString());
            // console.log(animeNews);
            News.find({},function(err,news){
                if(!err){
                    res.render('index',{news:news,animeNews:animeNews});
                }
            });
            
        });
    });
    
    
});

app.get('/anonces',function(req,res){
    https.get(jikanApi,function(response){
        let data = [];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            var angoing = JSON.parse(Buffer.concat(data).toString());
            res.render('angoing',{angoing:angoing});
        });
    });
    
});

app.get('/commit',function(req,res){
    if(req.isAuthenticated() && req.session.passport.user ==="aldik"){
        res.render('commit');
    }
    else{
        res.redirect('/');
    }
    
});

app.get('/finished',function(req,res){
    https.get(finish,function(response){
        let data =[];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            var angoing = JSON.parse(Buffer.concat(data).toString());
            var sLink = "https://api.jikan.moe/v4/anime?q=";
            var animeOBJ={
                angoing:angoing,
                sLink:sLink,
                https:https,
                lodash:lodash
            };
            res.render('finished',{
                animeOBJ:animeOBJ
            });
        });
    });
});

app.post('/commit',function(req,res){
    const news = new News({
        title:req.body.newsTitle,
        content:req.body.newsText,
        image:req.body.image
    });
    news.save();
    res.redirect('/');
});

app.get('/news/:id',function(req,res){
    News.findOne({_id:req.params.id},function(err,anime){
        if(!err){
            res.render('novosty',{
                anime:anime
            })
        }
    });
});

app.get('/finished/:title',function(req,res){
    var urls= queryAPI + req.params.title;
    https.get(urls,function(response){
        let data = [];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            let isAuth = false;
            let nick="some";
            var descr = JSON.parse(Buffer.concat(data).toString());
            if(req.isAuthenticated()){
                isAuth=true;
                nick=req.session.passport.user;
            }
            Coms.find({title:req.params.title},function(err,comms){
                if(!err){
                    res.render('animes',{
                        descr:descr,
                        trailer:descr.data[0].trailer.embed_url,
                        comms:comms,
                        isAuth:isAuth,
                        nick:nick
                     });
                }
            })
        });
    });
});

app.get('/finished/title/:id',function(req,res){
    const animeID=req.params.id;
    const genre = "https://api.jikan.moe/v4/anime?genres="+animeID+"&order_by=start_date&sort=desc";
    https.get(genre,function(response){
        let data=[];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            var info = JSON.parse(Buffer.concat(data).toString());
            var sLink = "https://api.jikan.moe/v4/anime?q=";
            var animeOBJ ={
                angoing:info,
                sLink:sLink,
                
            };
            res.render('genres',{
               animeOBJ:animeOBJ 
            });
        });
    });
});

app.get('/finished/title/anime/:title',function(req,res){
    const animeTitle = req.params.title;
    const urls = queryAPI + animeTitle;
    https.get(urls,function(response){
        let data = [];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            let isAuth = false;
            let nick="some";
            var descr = JSON.parse(Buffer.concat(data).toString());
            if(req.isAuthenticated()){
                isAuth=true;
                nick=req.session.passport.user;
            }
            Coms.find({title:req.params.title},function(err,comms){
                if(!err){
                    res.render('animes',{
                        descr:descr,
                        trailer:descr.data[0].trailer.embed_url,
                        comms:comms,
                        isAuth:isAuth,
                        nick:nick
                     });
                }
            })
            
            
        });
    });
});

app.post('/search',function(req,res){
    const searchLine  = req.body.search;
    const searchQuery = queryAPI + searchLine;
    https.get(searchQuery,function(response){
        let data=[];
        response.on('data',function(chunk){
            data.push(chunk);
        });
        response.on('end',function(){
            var searched = JSON.parse(Buffer.concat(data).toString());
            res.render('search',{
                animeTitle:searched
            });
        });
    });
    
});

app.get('/popular',function(req,res){
    res.sendFile(__dirname+'/ongoing.html');
})

app.get('/bunnyGirl.html',function(req,res){
    res.sendFile(__dirname+'/bunnyGirl.html');
});

app.get('/finished',function(req,res){
    res.sendFile(__dirname + '/finished.html');
});

app.get('/opm.html',function(req,res){
    res.sendFile(__dirname+'/opm.html');
});

app.get('/sao.html',function(req,res){
    res.sendFile(__dirname+'/sao.html');
});

app.get('/krd.html',function(req,res){
    res.sendFile(__dirname+'/krd.html');
});

app.get('/shield.html',function(req,res){
    res.sendFile(__dirname+'/shield.html');
});

app.get('/aot.html',function(req,res){
    res.sendFile(__dirname+'/aot.html');
});

app.get('/bleach.html',function(req,res){
    res.sendFile(__dirname+'/bleach.html');
});

app.get('/kykla.html',function(req,res){
    res.sendFile(__dirname+'/kykla.html');
});

app.get('/onepiece.html',function(req,res){
    res.sendFile(__dirname+'/onepiece.html');
});

app.get('/bezRab.html',function(req,res){
    res.sendFile(__dirname+'/bezRab.html');
});

app.get('/profile',function(req,res){
    if(!req.isAuthenticated()){
        res.render('profile',{nick:true});
    }else{
        Favorite.find({user:req.session.passport.user},function(err,item){
            if(!err){
                // console.log(item.length);
                res.render('account',{name:req.session.passport.user,item:item});
            }
        });
    }
});

app.post('/profile',function(req,res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
       });
    
       req.login(user,function(err){
           if(err){
               console.log(err);
           }
           else{
               passport.authenticate('local')(req,res,function(err){
                   if(!err){
                    res.redirect('/profile');
                   }
                   else{
                       res.render('login',{error:"Login or password isn't defined"})
                   }
               });
           }
       })
});

app.post('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

app.get('/account',function(req,res){
    if(req.isAuthenticated()){
        res.render('account',{name:req.session.passport.user});
    }
    else{
        res.redirect('/profile');
    }
});

app.get('/register',function(req,res){
    res.render('register');
});

app.get('/admin',function(req,res){
    if(req.isAuthenticated() && req.session.passport.user ==="aldik"){
        News.find({},function(err,news){
            if(!err){
                res.render('admin',{
                    news:news
                });
            }
        });
        
    }
    else{
        res.redirect('/');
    }
});

app.post('/register',function(req,res){
    User.register({username:req.body.username}, req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect('/register');
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('/profile');
            });
        }
    });
});

app.post('/delNews',function(req,res){
    News.findByIdAndRemove(req.body.del,function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/admin');
        }
    })
});

app.post('/finished/:coms',function(req,res){
    const date = new Date().toLocaleString();

    const comment = new Coms({
        name:req.session.passport.user,
        comment:req.body.comment,
        date:date,
        title:req.params.coms
    });

    comment.save();
    res.redirect('/finished/' + req.params.coms);
});

app.post('/remove/:name',function(req,res){
    Coms.findByIdAndRemove(req.body.delBtn,function(){
        res.redirect('/finished/' + req.params.name );
    });

});

app.post('/fav',function(req,res){
    if(req.isAuthenticated()){
        console.log(req.body.fav);
        const fav = new Favorite({
            url:"/finished/" + req.body.fav,
            user:req.session.passport.user
        });
        fav.save();
        res.redirect('/finished/' + req.body.fav);
    }
    else{
        res.redirect('/profile');
    }

});


//dfdg
app.get('/sdf',function(req,res){
    res.send("help");
    const options = {
        "method": "GET",
        "hostname": "animenewsnetwork.p.rapidapi.com",
        "port": null,
        "path": "/reports.xml?id=155&nskip=50&nlist=50",
        "headers": {
            "X-RapidAPI-Host": "animenewsnetwork.p.rapidapi.com",
            "X-RapidAPI-Key": "531b747faemshe6812b12ca07561p176de1jsn412041e5f57c",
            "useQueryString": true
        }
    };
    const requ = https.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function () {
            const d = Buffer.concat(chunks);
            console.log(d);
        });
    });
});

app.listen(process.env.PORT || 3000,function(){
    console.log('localhost:3000');
});