import AbstractQuery from 'candyjs/db/AbstractQuery';

/**
 * Mysql sql 查询生成器
 */
export default class Query extends AbstractQuery  {
    static OPERATE_QUERYALL = 1;
    static OPERATE_QUERYONE = 2;
    static OPERATE_COUNT = 3;
    static MAX_LIMIT = 2333;

    /**
     * @property {Number} op 当前的操作类型
     */
    public op: number = -1;

    /**
     * @property {String} sqlString 要执行的 sql 语句
     */
    public sqlString: string = '';

    /**
     * @property {any} command 数据库操作对象
     */
    private command: any = null;

    /**
     * 生成 select
     *
     * @return {String}
     */
    private buildSelect(): string {
        let select = 'SELECT';

        if('' === this.$select || '*' === this.$select) {
            return select + ' *';
        }

        return select + ' ' + this.$select;
    }

    /**
     * 生成 from
     *
     * @return {String}
     */
    private buildFrom(): string {
        if('' === this.$from) {
            return '';
        }

        return 'FROM ' + this.$from;
    }

    /**
     * 生成 where
     *
     * @return {String}
     */
    private buildWhere(): string {
        return '' === this.$where ? '' : 'WHERE ' + this.$where;
    }

    /**
     * 生成 group by
     *
     * @return {String}
     */
    private buildGroupBy(): string {
        if('' === this.$groupBy) {
            return '';
        }

        return 'GROUP BY ' + this.$groupBy;
    }

    /**
     * 生成 having
     *
     * @return {String}
     */
    private buildHaving(): string {
        if('' === this.$having) {
            return '';
        }

        return 'HAVING ' + this.$having;
    }

    /**
     * 生成 order by
     *
     * @return {String}
     */
    private buildOrderBy() {
        if('' === this.$orderBy) {
            return '';
        }

        return 'ORDER BY ' + this.$orderBy;
    }

    /**
     * 生成 limit
     *
     * @return {String}
     */
    private buildLimit() {
        if( !this.$options.has('limit') ) {
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
    public buildSql(): string {
        let sql = '';

        switch(this.op) {
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
    public getCommand(): any {
        return this.command;
    }

    /**
     * 设置数据库操作对象
     */
    public setCommand(command: any): void {
        this.command = command;
    }

    /**
     * @inheritdoc
     */
    public getAll(): Promise<any> {
        this.op = Query.OPERATE_QUERYALL;

        this.sqlString = this.buildSql();

        return this.getCommand().buildQuery(this).queryAll();
    }

    /**
     * @inheritdoc
     */
    public getOne(): Promise<any> {
        this.op = Query.OPERATE_QUERYONE;

        this.sqlString = this.buildSql();

        return this.getCommand().buildQuery(this).queryOne();
    }

    /**
     * @inheritdoc
     */
    public getColumn(): Promise<string> {
        this.op = Query.OPERATE_QUERYONE;

        this.sqlString = this.buildSql();

        return this.getCommand().buildQuery(this).queryColumn();
    }

    /**
     * @inheritdoc
     */
    public count(column = '*'): Promise<number> {
        this.op = Query.OPERATE_COUNT;

        this.$select = column;

        this.sqlString = this.buildSql();

        return this.getCommand().buildQuery(this).queryColumn();
    }

    /**
     * @inheritdoc
     */
    public select(columns): this {
        this.$select = columns;

        return this;
    }

    /**
     * @inheritdoc
     */
    public from(table): this {
        this.$from = table;

        return this;
    }

    /**
     * @inheritdoc
     */
    public where(condition, parameters = null): this {
        this.$where = condition;

        if(null !== parameters) {
            this.addParameters(parameters);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public groupBy(column): this {
        this.$groupBy = column;

        return this;
    }

    /**
     * @inheritdoc
     */
    public having(condition): this {
        this.$having = condition;

        return this;
    }

    /**
     * @inheritdoc
     */
    public orderBy(columns): this {
        this.$orderBy = columns;

        return this;
    }

    /**
     * 设置 limit 条件
     *
     * @param {String} limit
     */
    public limit(limit: string): this {
        this.$options.set('limit', limit);

        return this;
    }
}
