let fs = require("fs");
let request = require('request')
// var http = require('http')
let http = require('https')
let express = require('express');
let app = express();
let path = require('path');
let ejs = require('ejs');
let bodyParser = require('body-parser');
let cheerio = require('cheerio');
var charset = require('superagent-charset');
var __superagent = require('superagent');
var superagent = charset(__superagent);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.set('views', './public');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
//npm i request express ejs body-parser cheerio superagent-charset superagent
//跨域访问设置
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  // console.log(JSON.stringify(req.body))
  // console.log(req.headers)
  // console.log(req.rawHeaders)
  // console.log(req.url)
  // console.log(req.method)
  if (req.method === 'post' || req.method === 'POST') {
    if (req.url === '/$setUrl$') {
      fs.writeFile('./$url.txt', req.body.url, function (err) {
        if (err) {
          res.send({'Msg': '配置应用失败'})
        } else {
          res.send({'Msg': '配置应用成功'})
        }
      })
      return
    }
    let _url = ''
    try {
      _url = fs.readFileSync('./$url.txt', 'utf8').replace(/www./, '')
      // console.log(_url)
    } catch (e) {
      res.send({'Msg': '读取url配置文件失败', 'error': e})
      return
    }
    if (JSON.stringify(req.body) === '{}') {
      superagent
        .post(_url + req.url)//请求页面地址
        .set(req.headers)
        .on('error', function (e) {
          res.send(e)
        })
        .end(function (err, sRes) {//页面获取到的数据
          if (err) {
            res.send(err.error)
            return
          }
          console.log(sRes.text)
          res.send(sRes.text)
        })
    } else {
      superagent
        .post(_url + req.url)//请求页面地址
        .set(req.headers)
        .type('form')
        .send(new evil(JSON.stringify(req.body)))
        .on('error', function (e) {
          res.send(e)
        })
        .end(function (err, sRes) {//页面获取到的数据
          if (err) {
            res.send(err.error)
            return
          }
          console.log(sRes.text)
          res.send(sRes.text)
        })
    }
  } else if (req.method === 'get' || req.method === 'GET') {
    let _url = ''
    try {
      _url = fs.readFileSync('./$url.txt', 'utf8').replace(/www./, '')
      // console.log(_url)
    } catch (e) {
      res.send({'Msg': '读取url配置文件失败', 'error': e})
      return
    }
    // console.log(req)
    superagent
      .get(_url + req.url)//请求页面地址
      .set(req.headers)
      .on('error', function (e) {
        console.log(e)
        res.send(e)
      })
      .end(function (err, sRes) {//页面获取到的数据
        if (err) {
          return
        }
        console.log(sRes)
        res.send(sRes.text)
      })
  } else if (req.method === 'options' || req.method === 'OPTIONS') {
    // console.log('options')
    res.end()
  } else {
    res.send({'Msg': '暂时仅支持post或者get请求'})
  }
});

function evil(fn) {//替代eval
  var Fn = Function; //一个变量指向Function，防止有些前端编译工具报错
  return new Fn('return ' + fn)();
}

app.listen(8880, function () {
  console.log('服务启动-----------8880')
});