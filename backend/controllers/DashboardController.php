<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/DashboardModel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class DashboardController extends BaseController
{

    public function __construct()
    {
        $this->model = new DashboardModel();
    }

    public function stats()
    {
        AuthMiddleware::require();
        try {
            $stats = $this->model->getStats();
            Response::success($stats);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function distribution()
    {
        AuthMiddleware::require();
        try {
            $distribution = $this->model->getDepartmentDistribution();
            Response::success($distribution);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }

    public function activities()
    {
        AuthMiddleware::require();
        try {
            $limit = $this->getParam('limit', 10);
            $activities = $this->model->getRecentActivities($limit);
            Response::success($activities);
        } catch (Exception $e) {
            Response::serverError($e->getMessage());
        }
    }
}
