import { rejects } from 'assert/strict';
import { resolve } from 'path/posix';
import { Connection } from '../SettingStore'
import AbstractClient, { RawField } from './AbstractClient'

// Import the Google Cloud client library using default credentials
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const axios = require('axios')

class BigqueryClient extends AbstractClient {

    constructor(settings /** type: Connection */) {
        super(settings)
    }

    get DefaultPort() { return 0 }  // Do I need this stuff? I really don't think so.
    get DefaultHost() { return '' }
    get DefaultUser() { return '' }
    
    async getDatasets(query) {
        /*
            Queries Lexikon elastic search with given query (user's typed characters)
        */
      if(!query || typeof query !== "string") {
        rejects(new Error(`${query} not a valid dataset query.`))
        return
      }

      const tables = await axios.post(`http://gew1-backstagesearch-a-62xc.gew1.spotify.net:9200/search-dataset/_search`, null, { params: {
                                        query
                                    }})
      console.log('Tables:');
      tables.forEach(table => console.log(table));
      resolve(tables)
    }

    async getFields(query) {
      if(!query || typeof query !== "string") {
          rejects(new Error(`${query} not a valid field query.`))
          return
      } 

      const fields = await axios.post(`http://gew1-backstagesearch-a-62xc.gew1.spotify.net:9200/search-schema-field/_search`, null, { params: {
                                        query
                                    }});
      const columns = fields.map((v) => ({
        field: v._source.name,
        type: v._source.fieldType,
        null: "No",
        default: "n/a",
        comment: v._source.datasetDescription
      }))
      console.log('Fields:');
      fields.forEach(field => console.log(field._source.name));
      resolve(columns)
    }
}

module.exports = {
    BigqueryClient
}