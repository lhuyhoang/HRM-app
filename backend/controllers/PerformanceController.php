<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/PerformanceModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class PerformanceController extends BaseController
{

    public function __construct()
    {
        $this->model = new PerformanceModel();
    }

    public function index()
    {
        AuthMiddleware::require();
        try {
            $filters = [
                'department_id' => $this->getParam('department_id'),
                'position_id' => $this->getParam('position_id'),
                'employee_id' => $this->getParam('employee_id'),
                'period' => $this->getParam('period')
            ];

            $filters = array_filter($filters);
            // Get all performance reviews with details
            $reviews = $this->model->getAllWithDetails();

            // Apply filters if needed
            if (!empty($filters)) {
                $reviews = array_filter($reviews, function ($record) use ($filters) {
                    foreach ($filters as $key => $value) {
                        if (isset($record[$key]) && $record[$key] != $value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            Response::success($reviews);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function show($id)
    {
        AuthMiddleware::require();
        try {
            $review = $this->model->getById($id);
            if (!$review)
                Response::notFound('Performance review not found');
            Response::success($review);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function create()
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $errors = Validator::required($data, ['employee_id', 'review_period', 'rating', 'category']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::numeric($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
            Response::error('Rating must be between 1 and 5');
        }

        if (!Validator::enum($data['category'], ['excellent', 'good', 'average', 'poor'])) {
            Response::error('Invalid category value');
        }

        if ($this->model->existsForPeriod($data['employee_id'], $data['review_period'])) {
            Response::error('Review already exists for this period', 409);
        }

        $reviewData = [
            'employee_id' => (int) $data['employee_id'],
            'review_period' => $data['review_period'],
            'rating' => (float) $data['rating'],
            'category' => $data['category'],
            'comments' => isset($data['comments']) ? Validator::sanitize($data['comments']) : null,
            'created_at' => date('Y-m-d H:i:s')
        ];

        try {
            $id = $this->model->create($reviewData);
            $review = $this->model->getById($id);
            Response::created($review, 'Performance review created successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function update($id)
    {
        AuthMiddleware::require();
        $data = $this->getRequestData();

        $existing = $this->model->getById($id);
        if (!$existing)
            Response::notFound('Performance review not found');

        $errors = Validator::required($data, ['rating', 'category']);
        if ($errors)
            Response::validationError($errors);

        if (!Validator::numeric($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
            Response::error('Rating must be between 1 and 5');
        }

        $reviewData = [
            'rating' => (float) $data['rating'],
            'category' => $data['category'],
            'comments' => isset($data['comments']) ? Validator::sanitize($data['comments']) : $existing['comments'],
            'updated_at' => date('Y-m-d H:i:s')
        ];

        try {
            $this->model->update($id, $reviewData);
            $review = $this->model->getById($id);
            Response::success($review, 'Performance review updated successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function delete($id)
    {
        AuthMiddleware::require();

        $review = $this->model->getById($id);
        if (!$review)
            Response::notFound('Performance review not found');

        try {
            $this->model->delete($id);
            Response::success(null, 'Performance review deleted successfully');
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function averageRating($employeeId)
    {
        AuthMiddleware::require();
        try {
            $average = $this->model->getAverageRating($employeeId);
            Response::success(['average_rating' => $average]);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
