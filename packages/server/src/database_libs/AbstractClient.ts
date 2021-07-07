import { Connection } from '../SettingStore'
import log4js from 'log4js';

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

  abstract getTables(query: string): Promise<string[]>
  abstract getFields(query: string): Promise<RawField[]>
  abstract DefaultPort: number
  abstract DefaultHost: string
  abstract DefaultUser: string

  constructor(protected settings: Connection) {}

  async getSchema(input: string): Promise<Schema> {
    let schema: Schema = []
    try {
      /*
        Problem: In the default use case, each table is (naturally)
        associated with its relevant fields, and this is how the schema is populated.

        Solution: Associate each table (from result) with all fields (from result).
      */
      const tables = await this.getTables(input)
      const all_fields = await this.getFields(input)
      const col_from_raw = all_fields.map(v => this.toColumnFromRawField(v))
      schema = await Promise.all(
        tables.map((v) => ({
          database: this.settings.database,
          tableName: v,
          columns: col_from_raw // Each dataset in results associated with all field results
          }
        )))
    } catch (e) {
      logger.error(e)
      throw e
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
