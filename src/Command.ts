import AbstractCommand from 'candyjs/db/AbstractCommand';

/**
 * MySql 数据库操作类
 */
export default class Command extends AbstractCommand {
    /**
     * @property {any[]} 待绑定的参数列表
     */
    public bindingParameters: any[] = [];

    /**
     * @property {String} sqlString
     */
    public sqlString: string = '';

    /**
     * @property {any} db 数据库操作对象
     */
    public db: any/* = null*/;

    constructor(db: any) {
        super();

        this.db = db;
    }

    /**
     * @inheritdoc
     */
    public prepareSql(sql: string): Command {
        this.sqlString = sql;

        return this;
    }

    /**
     * @inheritdoc
     */
    public prepareStatement(sql: string): Command {
        this.sqlString = sql;

        return this;
    }

    /**
     * @inheritdoc
     */
    public bindValue(parameter: string, value: string): Command {
        throw new Error('bindValue is not supported');
    }

    /**
     * @inheritdoc
     */
    public bindValues(parameter: any[]): Command {
        this.bindingParameters = parameter;

        return this;
    }

    /**
     * @inheritdoc
     */
    public queryAll(): Promise<any> {
        this.trigger(AbstractCommand.EVENT_BEFORE_QUERY, this);

        let promise = this.bindingParameters.length > 0
            ? this.db.execute(this.sqlString, this.bindingParameters)
            : this.db.query(this.sqlString);

        this.bindingParameters = [];

        return promise.then(([rows]) => {
            this.trigger(AbstractCommand.EVENT_AFTER_QUERY, this);

            return rows;
        });
    }

    /**
     * @inheritdoc
     */
    public queryOne(): Promise<any> {
        return this.queryAll().then((rows) => {
            if(rows[0]) {
                return rows[0];
            }

            return null;
        });
    }

    /**
     * @inheritdoc
     */
    public queryColumn(): Promise<any> {
        return this.queryOne().then((row) => {
            if(null === row) {
                return null;
            }

            for(let k in row) {
                return row[k];
            }
        });
    }

    /**
     * @inheritdoc
     */
    public execute(): Promise<number> {
        this.trigger(AbstractCommand.EVENT_BEFORE_EXECUTE, this);

        let promise = this.bindingParameters.length > 0
            ? this.db.execute(this.sqlString, this.bindingParameters)
            : this.db.query(this.sqlString);

        this.bindingParameters = [];

        return promise.then(([rs]) => {
            this.trigger(AbstractCommand.EVENT_AFTER_EXECUTE, this);

            return rs;
        });
    }

    /**
     * Connection is automatically released when query resolves
     * @see https://github.com/sidorares/node-mysql2
     */
    public close(): void {}

    /**
     * @inheritdoc
     */
    public getLastSql(): string {
        return this.sqlString;
    }

    /**
     * @inheritdoc
     */
    public beginTransaction(): any {
        throw new Error('beginTransaction is not supported currently');
    }

    /**
     * @inheritdoc
     */
    public commitTransaction(): any {
        throw new Error('commitTransaction is not supported currently');
    }

    /**
     * @inheritdoc
     */
    public rollbackTransaction(): any {
        throw new Error('rollbackTransaction is not supported currently');
    }
}
