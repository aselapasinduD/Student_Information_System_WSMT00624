/**
 * This function help to format dates to local time zone
 * 
 * @param {string} date - format DateTime to local time zone.
 * @returns {string} - formated local DateTime
 * @since 1.1.0
 */
export const formatDateTime = (date: string) => {
    const utcDate = new Date(date); // Convert to local time zone
    const options = {
        year: 'numeric' as 'numeric',
        month: 'short' as 'short',
        day: '2-digit' as '2-digit',
        hour: '2-digit' as '2-digit',
        minute: '2-digit' as '2-digit',
        timeZone: 'Asia/Colombo',
    };
    const localDate = utcDate.toLocaleString('en-US', options);
    return localDate;
}