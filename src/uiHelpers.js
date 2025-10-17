/**
 * @param {string[]} headers
 * @param {Object[]} data
 * @param {function(Object): string} rowRenderer
 */
export const createTable = (headers, data, rowRenderer) => {
    const headerHTML = headers.map(h => `<th>${h}</th>`).join('');
    const bodyHTML = data.map(rowRenderer).join('');
    return `
        <table>
            <thead>
                <tr>${headerHTML}</tr>
            </thead>
            <tbody>
                ${bodyHTML}
            </tbody>
        </table>
    `;
};

/**
 * @param {string} message
 * @param {string} type
 */
export const showAlert = (message, type = `success`) => {
    alert(`[${type.toUpperCase()}] ${message}`);
};