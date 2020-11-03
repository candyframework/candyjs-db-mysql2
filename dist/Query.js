"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractQuery_1 = require("candyjs/db/AbstractQuery");
/**
 * Mysql sql 查询生成器
 */
class Query extends AbstractQuery_1.default {
    constructor() {
        super(...arguments);
        /**
         * @property {Number} op 当前的操作类型
         */
        this.op = -1;
        /**
         * @property {String} sqlString 要执行的 sql 语句
         */
        this.sqlString = '';
        /**
         * @property {any} command 数据库操作对象
         */
        this.command = null;
    }
    /**
     * 生成 select
     *
     * @return {String}
     */
    buildSelect() {
        let select = 'SELECT';
        if ('' === this.$select || '*' === this.$select) {
            return select + ' *';
        }
        return select + ' ' + this.$select;
    }
    /**
     * 生成 from
     *
     * @return {String}
     */
    buildFrom() {
        if ('' === this.$from) {
            return '';
        }
        return 'FROM ' + this.$from;
    }
    /**
     * 生成 where
     *
     * @return {String}
     */
    buildWhere() {
        return '' === this.$where ? '' : 'WHERE ' + this.$where;
    }
    /**
     * 生成 group by
     *
     * @return {String}
     */
    buildGroupBy() {
        if ('' === this.$groupBy) {
            return '';
        }
        return 'GROUP BY ' + this.$groupBy;
    }
    /**
     * 生成 having
     *
     * @return {String}
     */
    buildHaving() {
        if ('' === this.$having) {
            return '';
        }
        return 'HAVING ' + this.$having;
    }
    /**
     * 生成 order by
     *
     * @return {String}
     */
    buildOrderBy() {
        if ('' === this.$orderBy) {
            return '';
        }
        return 'ORDER BY ' + this.$orderBy;
    }
    /**
     * 生成 limit
     *
     * @return {String}
     */
    buildLimit() {
        if (!this.$options.has('limit')) {
            return 'LIMIT 0, ' + Query.MAX_LIMIT;
        }
        return Query.OPERATE_QUERYONE === this.op
            ? 'LIMIT 0, 1'
            : 'LIMIT ' + this.$options.get('limit');
    }
    /**
     * 生成 sql 语句
     *
     * @return {String}
     */
    buildSql() {
        let sql = '';
        switch (this.op) {
            case Query.OPERATE_QUERYONE:
            case Query.OPERATE_QUERYALL:
                // select * from t
                // where x
                // group by x
                // having x
                // order by x
                // limit x
                let parts = [
                    this.buildSelect(),
                    this.buildFrom(),
                    this.buildWhere(),
                    this.buildGroupBy(),
                    this.buildHaving(),
                    this.buildOrderBy(),
                    this.buildLimit()
                ];
                sql = parts.join(' ');
                break;
            case Query.OPERATE_COUNT:
                let field = this.$select;
                let from = this.buildFrom();
                let where = this.buildWhere();
                sql = `SELECT COUNT('${field}') ${from} ${where}`;
                break;
            default:
                break;
        }
        return sql;
    }
    /**
     * 获取数据库操作对象
     */
    getCommand() {
        return this.command;
    }
    /**
     * 设置数据库操作对象
     */
    setCommand(command) {
        this.command = command;
    }
    /**
     * @inheritdoc
     */
    getAll() {
        this.op = Query.OPERATE_QUERYALL;
        this.sqlString = this.buildSql();
        return this.getCommand().buildQuery(this).queryAll();
    }
    /**
     * @inheritdoc
     */
    getOne() {
        this.op = Query.OPERATE_QUERYONE;
        this.sqlString = this.buildSql();
        return this.getCommand().buildQuery(this).queryOne();
    }
    /**
     * @inheritdoc
     */
    getColumn() {
        this.op = Query.OPERATE_QUERYONE;
        this.sqlString = this.buildSql();
        return this.getCommand().buildQuery(this).queryColumn();
    }
    /**
     * @inheritdoc
     */
    count(column = '*') {
        this.op = Query.OPERATE_COUNT;
        this.$select = column;
        this.sqlString = this.buildSql();
        return this.getCommand().buildQuery(this).queryColumn();
    }
    /**
     * @inheritdoc
     */
    select(columns) {
        this.$select = columns;
        return this;
    }
    /**
     * @inheritdoc
     */
    from(table) {
        this.$from = table;
        return this;
    }
    /**
     * @inheritdoc
     */
    where(condition, parameters = null) {
        this.$where = condition;
        if (null !== parameters) {
            this.addParameters(parameters);
        }
        return this;
    }
    /**
     * @inheritdoc
     */
    groupBy(column) {
        this.$groupBy = column;
        return this;
    }
    /**
     * @inheritdoc
     */
    having(condition) {
        this.$having = condition;
        return this;
    }
    /**
     * @inheritdoc
     */
    orderBy(columns) {
        this.$orderBy = columns;
        return this;
    }
    /**
     * 设置 limit 条件
     *
     * @param {String} limit
     */
    limit(limit) {
        this.$options.set('limit', limit);
        return this;
    }
}
exports.default = Query;
Query.OPERATE_QUERYALL = 1;
Query.OPERATE_QUERYONE = 2;
Query.OPERATE_COUNT = 3;
Query.MAX_LIMIT = 2333;
