const express = require('express');
const request = require('request');
const querystring = require('query-string');
const fetch = require("node-fetch");

let app = express()

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback'


app.get('/' , (req, res) => { 
  res.send('hello')
  
})

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      scope: 'user-read-private user-read-email',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token

    // var options = {
    //   url: 'https://api.spotify.com/v1/me',
    //   headers: { 'Authorization': 'Bearer ' + access_token },
    //   json: true
    // };
    // request.get(options, (error,response,body) => {
    //   console.log(body)
    // });

    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888

console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)
