"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractCommand_1 = require("candyjs/db/AbstractCommand");
/**
 * MySql 数据库操作类
 */
class Command extends AbstractCommand_1.default {
    constructor(db) {
        super();
        /**
         * @property {any[]} 待绑定的参数列表
         */
        this.bindingParameters = [];
        /**
         * @property {String} sqlString
         */
        this.sqlString = '';
        this.db = db;
    }
    /**
     * @inheritdoc
     */
    prepareSql(sql) {
        this.sqlString = sql;
        return this;
    }
    /**
     * @inheritdoc
     */
    prepareStatement(sql) {
        this.sqlString = sql;
        return this;
    }
    /**
     * @inheritdoc
     */
    bindValue(parameter, value) {
        throw new Error('bindValue is not supported');
    }
    /**
     * @inheritdoc
     */
    bindValues(parameter) {
        this.bindingParameters = parameter;
        return this;
    }
    /**
     * @inheritdoc
     */
    queryAll() {
        this.trigger(AbstractCommand_1.default.EVENT_BEFORE_QUERY, this);
        let promise = this.bindingParameters.length > 0
            ? this.db.execute(this.sqlString, this.bindingParameters)
            : this.db.query(this.sqlString);
        this.bindingParameters = [];
        return promise.then(([rows]) => {
            this.trigger(AbstractCommand_1.default.EVENT_AFTER_QUERY, this);
            return rows;
        });
    }
    /**
     * @inheritdoc
     */
    queryOne() {
        return this.queryAll().then((rows) => {
            if (rows[0]) {
                return rows[0];
            }
            return null;
        });
    }
    /**
     * @inheritdoc
     */
    queryColumn() {
        return this.queryOne().then((row) => {
            if (null === row) {
                return null;
            }
            let ret = undefined;
            for (let k in row) {
                ret = row[k];
                break;
            }
            return ret;
        });
    }
    /**
     * @inheritdoc
     */
    execute() {
        this.trigger(AbstractCommand_1.default.EVENT_BEFORE_EXECUTE, this);
        let promise = this.bindingParameters.length > 0
            ? this.db.execute(this.sqlString, this.bindingParameters)
            : this.db.query(this.sqlString);
        this.bindingParameters = [];
        return promise.then(([rs]) => {
            this.trigger(AbstractCommand_1.default.EVENT_AFTER_EXECUTE, this);
            return rs;
        });
    }
    /**
     * Connection is automatically released when query resolves
     * @see https://github.com/sidorares/node-mysql2
     */
    close() { }
    /**
     * @inheritdoc
     */
    getLastSql() {
        return this.sqlString;
    }
    /**
     * @inheritdoc
     */
    beginTransaction() {
        throw new Error('beginTransaction is not supported currently');
    }
    /**
     * @inheritdoc
     */
    commitTransaction() {
        throw new Error('commitTransaction is not supported currently');
    }
    /**
     * @inheritdoc
     */
    rollbackTransaction() {
        throw new Error('rollbackTransaction is not supported currently');
    }
}
exports.default = Command;
