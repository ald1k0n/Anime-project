const express=require('express');
const bodyParser=require('body-parser');
const fs = require('fs');
const https=require('https');
const request=require('request');
const lodash=require('lodash');
const ejs=require('ejs');
const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs')

//Глобальные переменные
var commits=[];

app.get('/',function(req,res){
    res.render('index',{commits:commits});
});

app.get('/commit',function(req,res){
    res.render('commit');
});

app.post('/commit',function(req,res){
    var commitObj = {
        animeTitle:req.body.title,
        animeSynopsis:req.body.synopsis,
        animePoster:req.body.image
    };
    commits.push(commitObj);
    res.redirect('/');
});

app.get('/anime/:title',function(req,res){
    commits.forEach(function(commit){
        let getPar=req.params.title;
        let myPar=commit.animeTitle;
        if(lodash.lowerCase(getPar)===lodash.lowerCase(myPar)){
            res.render('animes',{
                animeTitle:commit.animeTitle,
                animePoster:commit.animePoster,
                animeSynopsis:commit.animeSynopsis
            });
        }
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

app.get('/anonces',function(req,res){
    res.send("Анонсы на сегодня");
});

app.get('/profile',function(req,res){
    res.send("Авторизация");
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

//API key for mailchimp e414c07b31d1df3c3182e3e7728d48d1-us14 
//Unique id for list id : a2aecfd4e2

app.get('/register.html',function(req,res){
    res.sendFile(__dirname+'/register.html');
});

app.post('/register',function(req,res){
    var nick=req.body.nick;
    var email=req.body.email;
    var pass=req.body.pass;

    var data={
        members:[
            {
                email_address:email,
                status:"subscribed",
                merge_fields:{
                    NNAME:nick,
                    PASS:pass
                }
            }
        ]
    }

    const jsonData=JSON.stringify(data);
    const url="https://us14.api.mailchimp.com/3.0/lists/a2aecfd4e2";
    const options = {
        method: "POST",
        auth: "ALD1K:e414c07b31d1df3c3182e3e7728d48d1-us14"
    }

    const request = https.request(url,options, function(response){
        if(response.statusCode===200){
            res.send("<h1>Success</h1>");
        }
        else{
            res.send("<h1>Failure</h1>");
        }
        response.on('data',function(data){
            console.log(JSON.parse(data));
        });
    });
        request.write(jsonData);
        request.end();
});


app.listen(3000,function(){
    console.log('localhost:3000');
});