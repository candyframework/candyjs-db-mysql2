## candyjs-db

database interface

## 说明

尚未设计完成

此库是关系型数据库的接口层，设计该接口的目的是为了统一关系型数据库接口，使得切换数据库变得简单

我们打算将数据库设计成一主多从的架构，这样既可以满足小型公司需求，也可满足大型企业级需求

## 预想的使用方法如下 可能会随时变更

大致是所有查询使用 promise 返回，所有中间查询方法都是同步的

```javascript
var CandyJs = require('candyjs');
var App = require('candyjs/web/Application');
var Db = require('@candyjs/db-mysql2');

new CandyJs(new App({
    'id': 1,
    'appPath': __dirname + '/app',
    'db': new Db({
        main: {
            host: 'localhost',
            port: 3306,
            database: 'mydb',
            user: 'root',
            password: 'root'
        }
    })
})).listen(2333, function(){
    console.log('listen on 2333');
});


// use
let command = Candy.app.db.getMain();

let data1 = await command.prepareSql('select * from t_category where id=1').queryAll();
let data2 = await command.prepareStatement('select * from t_category where id=?')
    .bindValues([1]).queryOne();
```
