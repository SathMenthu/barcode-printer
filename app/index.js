const Papa = require('papaparse')
const { readFile } = require('fs-extra') ;
const FILE_PATH = "../print.csv"

const dataLoader = async () => {
 const file =  await readFile(FILE_PATH, 'utf8');
 const data = await Papa.parse(file, {
  header: false,
  delimiter: ';',
  complete:  ( data ) => {
   return data;
  },
 });
 return data;
}

(async () => {
 const Data = await dataLoader();
 console.log(Data)
})()




