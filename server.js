'use strict'


// including - importing libraries
const express = require('express');
const superAgent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');



// setup and configuration
require('dotenv').config();
const app = express();
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
// const client = new pg.Client(process.env.DATABASE_URL);   // on your machine
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); // for heroku




app.get('/',homePage);
app.get('/search',search);
app.get('/all',allWorld);
app.post('/myList',myList);
app.get('/saved/:id',details);
app.delete('/saved/:id',deleteitem);
app.put('/saved/:id',updateitmes);
app.get('/mySavedList',mySavedList)




// functions

function updateitmes(req,res) {
    
    let id= req.params.id;
    let query=`update  help where id = $1;`;
    let safeValue = [id];

    client.query(query,safeValue).then(()=>{
        
        res.redirect('/');
    })
}
function deleteitem(req,res) {
    
    let id= req.params.id;
    let query=`delete from help where id = $1;`;
    let safeValue = [id];

    client.query(query,safeValue).then(()=>{
        
        res.redirect('/');
    })
}

function mySavedList(req,res) {
    
    let query=`select * from help;`;

    client.query(query).then(data =>{

        res.render('mylist',{mine : data.rows});

    }).catch(error =>{
        console.log('error getting the data from the database !! ',error);
    });
}
function details(req,res) {
    
    let id= req.params.id;
    let query = `select * from help where id = $1;`;
    let safeValue= [id];

    client.query(query,safeValue).then(data =>{

        console.log(data.rows[0]);
        res.render('saved',{element:data.rows[0]})
    })
}
function myList(req,res) {
    
    let body = req.body;
    let query= `insert into help (country,TotalConfirmed,TotalDeaths,TotalRecovered,Date) values ($1,$2,$3,$4,$5) returning *;`;
    let safeValue=[body.country,body.TotalConfirmed,body.TotalDeaths,body.TotalRecovered,body.Date];

    client.query(query,safeValue).then(data =>{

        let id = data.rows[0].id;

        res.redirect('/saved/'+id);


    }).catch(error =>{
        console.log('error while saving to database !! ',error);
    })

}

function allWorld(req, res) {

    let countrys = [];
    let url ='https://api.covid19api.com/summary';
    
    superAgent.get(url).then(data =>{
        let body = data.body.Countries;

        body.forEach(element => {
            
            let newCountry =new Country(element);
            countrys.push(newCountry);
        });

        res.render('allWorld',{country : countrys })

    })
}


function search(req, res) {
    
    
    let query={     
        from :req.query.from,
        to:req.query.to
    }

    // let value=[req.query.country]
    let url = 'https://api.covid19api.com/country/jordan/status/confirmed';

    superAgent.get(url).query(query).then(data =>{

        let body = data.body;

        res.render('search',{country : body})

    }).catch(error =>{
        console.log('error while getting the data from the database !!',error);
    })
}

function homePage(req,res) {
    
    let url= 'https://api.covid19api.com/world/total'
    
    superAgent.get(url).then(data =>{

        res.render('index',{day : data.body})
        
    }).catch(error =>{
        console.log('error ',error);
    });

}



function Country(data) {
    this.Country=data.Country || 'empty';
    this.TotalConfirmed=data.TotalConfirmed || 'empty';
    this.TotalDeaths=data.TotalDeaths || 'empty';
    this.TotalRecovered=data.TotalRecovered || 'empty';
    this.Date=data.Date || 'empty';

}

client.connect().then(() => {

    app.listen(PORT, () => {
        console.log('ready !!', PORT);
    })
}).catch(error => {
    console.log('error while connecting to the database !! ', error);
})

