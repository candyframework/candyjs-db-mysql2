## candyjs-db-mysql2

database interface

## 使用说明

+ [安装](#安装)

+ [使用](#使用)

    + 配置

    + 使用 Command

    + 使用 Query builder

    + 使用 Transaction

+ [配合 candyjs 使用](#配合 candyjs 使用)



## 安装

`@candyjs/db-mysql2` 依赖 `candyjs`，所以需要同时安装 `candyjs`

> 担心安装 `candyjs` 增加很多额外依赖？不必担心，`candyjs` 默认没有依赖其他第三方库文件

```bash
$ npm install candyjs
$ npm install @candyjs/db-mysql2
```



## 使用

#### 配置

`@candyjs/db-mysql2` 使用主从架构操作数据库，按照一主多从进行数据库配置。

> 目前虽然可以实现主从配置，但是数据库 API 并不会自动进行主从切换，需要手动选择，具体用法参照使用章节。


```javascript
const Db = require('@candyjs/db-mysql2');

const db = new Db({
    // 主库配置
    main: {
        host: 'localhost',
        port: 3306,
        database: 'mydb',
        user: '',
        password: ''
    },
    // 多个从库配置
    slaves: [
        {
            host: 'localhost',
            port: 3306,
            database: 'mydb_slave1',
            user: '',
            password: ''
        }, {
            host: 'localhost',
            port: 3306,
            database: 'mydb_slave2',
            user: '',
            password: ''
        }
    ]
})
```



#### 使用 Command

API 汇总

```javascript
// 准备 sql 语句
prepareSql(sql: string): Command
// 准备预处理 sql 语句
prepareStatement(sql: string): Command
// 为预处理 sql 赋值
bindValues(arr: any[]): Command
// 获取多条记录
queryAll(): Promise<any>
// 获取单条记录
queryOne(): Promise<any>
// 获取一列记录
queryColumn(): Promise<any>
// 执行更新操作
execute(): Promise<number>
getLastSql(): string
```

一般情况下，应当使用从库进行读操作，使用主库进行写操作。

```javascript
// 获得一个从库链接
const comm = db.getSlave();

let data = null;
try {
    data = await comm.prepareSql('select * from t_users where id=1').queryOne();
} catch(e) {
    // todo
}

console.log(data);
```

为了避免 sql 注入问题（ SQL injection attacks ），建议使用预处理语句

```javascript
// 获得一个从库链接
const comm = db.getSlave();

let data = null;
try {
    data = await comm.prepareStatement('select * from t_users where id=?').bindValues([1]).queryOne();
} catch(e) {
    // todo
}

console.log(data);
```

使用主库进行修改操作

```javascript
// 获得一个主库链接
const comm = db.getMain();

let data = null;
try {
    data = await comm.prepareStatement('update t_users set age=? where id=?').bindValues([20, 1]).execute();
} catch(e) {
    // todo
}

console.log(data);
```



#### 使用 Query builder

Query builder 是对 sql 语句的函数封装，它只能进行查询操作，无法进行修改操作

API 汇总

```javascript
getAll(): Promise<any>
getOne(): Promise<any>
getColumn(): Promise<string>
count(column: string = '*'): Promise<number>
select(columns: string): Query
from(table: string): Query
where(condition: string, parameters: any[] = null): Query
groupBy(column: string): Query
having(condition: string): Query
orderBy(columns: string): Query
limit(limit: string): Query
```

使用

```javascript
let q = new Db.Query(command);
try {
    let data1 = await q.select('*').from('user').where('id=1').getOne();
    let data2 = await q.select('*').from('user').where('id=?', [2]).getOne();
    let data3 = await q.from('user').count('id');
} catch(e) {
    // todo
}
```

#### 使用 Transaction

使用事务需要借助 `mysql2` 的原生 API，目前本库中对外可以获取经 promise 包装的 mysql2 api


```
const db = new Db(someConfigs);

const internalDb = db.getMain().db;
let conn = null;

try {
    conn = await internalDb.getConnection();
    await conn.beginTransaction();

    await conn.execute(sql1, params);
    await conn.execute(sql2, params);

    await conn.commit();

} catch(e) {
    conn && conn.rollback();
}
```

## 配合 candyjs 使用

```javascript
const CandyJs = require('candyjs');
const App = require('candyjs/web/Application');
const Db = require('@candyjs/db-mysql2');

new CandyJs(new App({
    'id': 1,
    'appPath': __dirname + '/app',
    'db': new Db({
        main: {
            host: 'localhost',
            port: 3306,
            database: 'mydb',
            user: '',
            password: ''
        },
        slaves: [
            {
                host: 'localhost',
                port: 3306,
                database: 'mydb_slave1',
                user: '',
                password: ''
            }, {
                host: 'localhost',
                port: 3306,
                database: 'mydb_slave2',
                user: '',
                password: ''
            }
        ]
    })
})).listen(2333, function(){
    console.log('listen on 2333');
});



// in some business
const Db = require('@candyjs/db-mysql2');

module.exports = class IDao {
    constructor() {
        this.table = '';
    }

    /**
     * 获取 mysql 链接
     *
     * @private
     * @returns {Db}
     */
    getConnection() {
        return Candy.app.db;
    }

    /**
     * 统计表中记录数
     */
    async count(where = '1=1') {
        const conn = this.getConnection();
        const comm = conn.getSlave();

        let num = 0;

        try {
            num = await comm.prepareSql(`SELECT count(*) as c FROM ${this.table} WHERE ${where}`).queryColumn();

        } catch(err) {
            CandyJs.getLogger().error(err.message);
        }

        return num;
    }
}
```

