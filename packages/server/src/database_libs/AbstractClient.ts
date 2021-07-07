import { Connection } from '../SettingStore'
import log4js from 'log4js';
import { SSHConnection } from 'node-ssh-forward'
import { readFileSync } from 'fs'

const logger = log4js.getLogger()

export type RawField = {
  field: string,
  type: string,
  null: 'Yes' | 'No',
  default: any,
  comment: string
}
export type Column = {
  columnName: string,
  description: string
}
export type Table = {
  database: string | null,
  tableName: string,
  columns: Column[]
}
export type Schema = Table[]
export default abstract class AbstractClient {
  connection: any

  constructor(protected settings: Connection) {}

  async getSchema(input: String): Promise<Schema> {
    let schema: Schema = []
    try {
      /*
        Problem: In the default use case, each table is (naturally)
        associated with its relevant fields, and this is how the schema is populated.

        Solution: Associate each table (from result) with all fields (from result).
      */
      const tables = await this.getTables(input)
      const all_fields = await this.getFields(input)
      const col_from_raw = columns.map(v => this.toColumnFromRawField(v))
      schema = await Promise.all(
        tables.map((v) => this.getColumns(v).then(columns => ({
          database: this.settings.database,
          tableName: v,
          columns: columns.map(v => this.toColumnFromRawField(v)) }
        )))
      )
    } catch (e) {
      logger.error(e)
      throw e
    } finally {
      this.disconnect()
      if (sshConnection) {
        sshConnection.shutdown()
      }
    }
    return schema
  }

  private toColumnFromRawField(field: RawField): Column {
    return {
      columnName: field.field,
      description: `${field.field}(Type: ${field.type}, Null: ${field.null}, Default: ${field.default})`
    }
  }
}
