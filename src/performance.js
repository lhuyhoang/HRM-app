import * as EmployeeDB from './employeeDb.js';
import { createTable, showAlert } from './uiHelpers.js';
const STORAGE_KEY = 'hrm_performance_reviews';
const readReviews = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error('Failed to parse performance reviews', error);
        return [];
    }
};
const writeReviews = (reviews) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};
export const init = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        writeReviews([]);
    }
};
export const getAllReviews = () => readReviews();
export const addReview = ({ employeeId, period, rating, comments }) => {
    const reviews = readReviews();
    const newReview = {
        id: Date.now(),
        employeeId,
        period,
        rating,
        comments,
    };
    reviews.push(newReview);
    writeReviews(reviews);
    return newReview;
};
export const deleteReview = (id) => {
    const reviews = readReviews();
    const next = reviews.filter((review) => review.id !== id);
    writeReviews(next);
};
const RATINGS = [
    { value: 'excellent', label: 'Xuất sắc' },
    { value: 'good', label: 'Tốt' },
    { value: 'average', label: 'Trung bình' },
    { value: 'poor', label: 'Cần cải thiện' },
];
export const render = (container) => {
    init();
    const employees = EmployeeDB.getAllEmployees();
    if (employees.length === 0) {
        container.innerHTML = `
            <h2>Đánh giá hiệu suất</h2>
            <p>Vui lòng thêm nhân viên trước khi thực hiện đánh giá.</p>
        `;
        return;
    }
    const employeeOptions = employees
        .map((emp) => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`)
        .join('');
    const ratingOptions = RATINGS
        .map((item) => `<option value="${item.value}">${item.label}</option>`)
        .join('');
    container.innerHTML = `
        <h2>Đánh giá hiệu suất</h2>
        <form id="performance-form" class="form-group">
            <label for="performance-employee">Nhân viên</label>
            <select id="performance-employee" required>
                <option value="">-- Chọn nhân viên --</option>
                ${employeeOptions}
            </select>
            <label for="performance-period">Kỳ đánh giá</label>
            <input type="month" id="performance-period" required>
            <label for="performance-rating">Xếp loại</label>
            <select id="performance-rating" required>
                ${ratingOptions}
            </select>
            <label for="performance-comments">Nhận xét</label>
            <textarea id="performance-comments" rows="3" placeholder="Ghi chú"></textarea>
            <button type="submit">Lưu đánh giá</button>
        </form>
        <div id="performance-table"></div>
    `;
    const form = container.querySelector('#performance-form');
    const tableWrapper = container.querySelector('#performance-table');
    const renderTable = () => {
        const reviews = getAllReviews();
        const currentEmployees = EmployeeDB.getAllEmployees();
        if (reviews.length === 0) {
            tableWrapper.innerHTML = '<p>Chưa có đánh giá nào.</p>';
            return;
        }
        const tableHtml = createTable(
            ['Nhân viên', 'Kỳ đánh giá', 'Xếp loại', 'Nhận xét', 'Hành động'],
            reviews,
            (review) => {
                const employee = currentEmployees.find((emp) => emp.id === review.employeeId);
                const ratingLabel = RATINGS.find((item) => item.value === review.rating)?.label || review.rating;
                return `
                    <tr>
                        <td>${employee ? employee.name : 'N/A'} (${review.employeeId})</td>
                        <td>${review.period}</td>
                        <td>${ratingLabel}</td>
                        <td>${review.comments || ''}</td>
                        <td><button class="danger" data-id="${review.id}">Xóa</button></td>
                    </tr>
                `;
            }
        );
        tableWrapper.innerHTML = tableHtml;
    };
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const employeeId = form.querySelector('#performance-employee').value;
        const period = form.querySelector('#performance-period').value;
        const rating = form.querySelector('#performance-rating').value;
        const comments = form.querySelector('#performance-comments').value.trim();
        if (!employeeId || !period || !rating) {
            showAlert('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        addReview({ employeeId, period, rating, comments });
        form.reset();
        showAlert('Đã lưu đánh giá');
        renderTable();
    });
    tableWrapper.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.id);
        if (Number.isNaN(id)) {
            return;
        }
        const confirmed = window.confirm('Xóa đánh giá này?');
        if (!confirmed) {
            return;
        }
        deleteReview(id);
        showAlert('Đã xóa đánh giá');
        renderTable();
    });
    renderTable();
};
