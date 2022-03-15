/**
 * Function to count relative time difference
 * Source: https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
 * @param current Current time
 * @param previous Target time
 * @returns {string} Human-readable string that represents time difference
 */
const timeDifference = (current, previous) => {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return 'about ' + Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return 'about ' + Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return 'about ' + Math.round(elapsed / msPerYear) + ' years ago';
    }
}

module.exports = {
    timeDifference
}