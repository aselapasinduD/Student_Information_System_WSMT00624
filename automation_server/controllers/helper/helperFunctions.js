
class Helper{
    constructor(){

    }
    formatTimestamp(dateString){
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const date = new Date(dateString);

        // Format of the Date - YYYY-MM-DD HH:MM:SS
        let fromattedDate = date.toLocaleDateString('en-GB', options).replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, '$3-$2-$1 $4');

        return `${fromattedDate}`;
    }
}

module.exports = Helper;