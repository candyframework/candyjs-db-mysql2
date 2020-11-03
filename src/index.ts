import mysql = require('mysql2');
import Db from 'candyjs/db/Db';

import Command from './Command';

/**
 * mysql2 数据库操作入口
 *
 * ```
 * const conf = {
 *      'main': {
 *          'host': HOST,
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
 *      'db': new Db(conf)
 * });
 *
 * // some scene
 * const Candy = require('candyjs/Candy');
 *
 * let command = Candy.app.db.getMain();
 * let promise = command.prepareSql('select xx from t where id=1').queryOne();
 * ```
 */
export default abstract class Index extends Db {
    /**
     * @property {any} main the current active main db
     */
    static main: any = null;

    /**
     * @property {Map<String, any>} main the current active main db
     */
    static slave: Map<string, any> = new Map();

    constructor(configurations: any) {
        super(configurations);
    }

    private createConnectionPool(configurations: any): any {
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

    private createConnection(configurations: any): any {
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
