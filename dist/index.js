"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql2");
const Db_1 = require("candyjs/db/Db");
const Command_1 = require("./Command");
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
 * let db = Candy.app.db.getMain();
 * let promise = db.prepareSql('select xx from t where id=1').queryOne();
 * ```
 */
class Index extends Db_1.default {
    constructor(configurations) {
        super(configurations);
    }
    createConnectionPool(configurations) {
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
    createConnection(configurations) {
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
     * @returns {Command}
     */
    getMain() {
        if (null === Index.main) {
            Index.main = this.createConnectionPool(this.configurations.main);
        }
        return new Command_1.default(Index.main.promise());
    }
    /**
     * 获取一个从库链接
     *
     * @returns {Command}
     */
    getSlave() {
        return null;
    }
}
exports.default = Index;
/**
 * @property {any} main the current active main db
 */
Index.main = null;
