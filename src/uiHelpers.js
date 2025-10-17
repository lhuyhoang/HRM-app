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
export const showAlert = (message, type = 'success') => {
    if (typeof document === 'undefined') {
        return;
    }
    const normalizedType = ['success', 'error', 'info'].includes(type) ? type : 'info';
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${normalizedType}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    const displayDuration = 1500;
    const transitionDuration = 300;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (!container.hasChildNodes()) {
                container.remove();
            }
        }, transitionDuration);
    }, displayDuration);
};