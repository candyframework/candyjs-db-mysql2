import * as mysql from 'mysql2';
import AbstractDb from 'candyjs/db/AbstractDb';

import Command from './Command';

/**
 * mysql2 数据库操作入口
 *
 * ```
 * const Db = require('@candyjs/db-mysql2');
 * const conf = {
 *      'main': {
 *          'host': HOST,
 *          'port': 3306,
 *          'database': DBNAME,
 *          'user': '',
 *          'password': ''
 *      },
 *      'slaves': [
 *          { 'host': HOST, 'database': DBNAME, 'user': '', 'password': '' },
 *          { 'host': HOST, 'database': DBNAME, 'user': '', 'password': '' }
 *      ]
 * };
 *
 * const app = new App({
 *      'id': 1,
 *      'appPath': __dirname + '/app',
 *
 *      // register as application property
 *      'db': new Db(conf)
 * });
 *
 * // in some scene
 * const Candy = require('candyjs/Candy');
 *
 * let command = Candy.app.db.getMain();
 * let data = await command.prepareSql('select xx from t where id=1').queryOne();
 * let data2 = await command.prepareStatement('select xx from t where id=?').bindValues([1]).queryOne();
 * ```
 */
export default class Index extends AbstractDb {
    /**
     * @property {mysql.Pool} main the current active main db
     */
    static main: mysql.Pool = null;

    /**
     * @property {Map<String, mysql.Pool>} main the current active main db
     */
    static slave: Map<string, mysql.Pool> = new Map();

    constructor(configurations: any) {
        super(configurations);
    }

    public createConnectionPool(configurations: any): mysql.Pool {
        return mysql.createPool(Object.assign({
            host: '',
            port: 3306,
            database: '',
            user: '',
            password: '',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }, configurations));
    }

    public createConnection(configurations: any): mysql.Connection {
        return mysql.createConnection(Object.assign({
            host: '',
            port: 3306,
            database: '',
            user: '',
            password: ''
        }, configurations));
    }

    /**
     * 获取一个主库连接
     *
     * @returns {Command} 一个新的 Command 对象
     */
    public getMain(): Command {
        if(!this.configurations.main) {
            throw new Error('The main configurations are not found');
        }

        if(null === Index.main) {
            Index.main = this.createConnectionPool(this.configurations.main);
        }

        return new Command(Index.main.promise());
    }

    /**
     * 获取一个从库链接
     *
     * @returns {Command} 一个新的 Command 对象
     */
    public getSlave(): Command {
        if(!this.configurations.slaves) {
            throw new Error('The slave configurations are not found');
        }

        let item = this.configurations.slaves[
            Math.floor(Math.random() * this.configurations.slaves.length)
        ];
        let key = item.host + item.database;

        if(!Index.slave.has(key)) {
            Index.slave.set(key, this.createConnectionPool(item));
        }

        return new Command(Index.slave.get(key).promise());
    }
}
