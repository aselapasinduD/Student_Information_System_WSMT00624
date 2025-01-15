const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const csv = require('csv-parser');

const dataFile = 'test-file.xlsb';


function formatExcelDate(excelSerialDate) {
    const epoch = new Date(1899, 11, 30); // Excel's epoch date is Dec 30, 1899
    const days = Math.floor(excelSerialDate);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(epoch.getTime() + days * millisecondsPerDay);

    return date.toLocaleDateString('en-US');
}

/**
 * This class if for handle ever function for data bundle handling.
 * 
 * @since 1.1.0
 */
class DataBundleHandle{

    async processFile(filePath) {
        const resolvedPath = path.resolve(filePath);
        // console.log(resolvedPath);
        const ext = path.extname(resolvedPath).toLowerCase();
    
        if (ext === '.xlsx' || ext === '.xlsm' || ext === '.xlsb') {
            const result = await this.#readExcel(resolvedPath);
            if(result.error){
                console.error('Error reading Excel file:', result.message);
                return result.message;
            }
            console.log('Excel file successfully processed');
            return result;
        } else if (ext === '.csv') {
            const result = await this.#readCSV(resolvedPath);
            if(result.error){
                console.error('Error reading CSV file:', result.message);
                return result.message;
            }
            console.log('CSV file successfully processed');
            return result;
        } else {
            console.error('Unsupported file type. Please provide a CSV or Excel file.');
            return 'Unsupported file type. Please provide a CSV or Excel file.'
        }
    }

    // Function to read Excel files
    async #readExcel(file) {
        return new Promise((resolve, reject) => {
            try{
                const workbook = XLSX.readFile(file);

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
        
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // jsonData.forEach((row) => {
                //     if (row.date && typeof row.date === 'number') {
                //         row.date = formatExcelDate(row.date);
                //     }
                // });
        
                console.log('Excel file successfully processed');
                resolve(jsonData);
            } catch (error){
                reject({error: true, message: error.message});
            }
        });
    }

    // Function to read CSV files
    async #readCSV(file) {
        const results = [];

        return new Promise((resolve, reject) => {
            try {
                fs.createReadStream(file)
                    .pipe(csv())
                    .on('data', (row) => {
                        results.push(row);
                    })
                    .on('end', () => {
                        resolve(results);
                    })
                    .on('error', (error) => {
                        reject({error: true, message: error.message});
                    });
            } catch (error) {
                reject({error: true, message: error.message});
            }
        });
    }
}

module.exports= DataBundleHandle;