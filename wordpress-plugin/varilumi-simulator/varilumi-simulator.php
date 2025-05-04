<?php
/*
Plugin Name: Varilumi 燈光模擬器
Description: 整合 React 應用的燈光功能模擬器
Version: 1.0
Author: 您的名字
*/

// 防止直接訪問
if (!defined('ABSPATH')) exit;

// 插件設定選項
define('VARILUMI_DEV_MODE', true); // 設為 true 開啟開發模式
define('VARILUMI_DEV_URL', 'http://localhost:5173'); // Vite 開發服務器地址

// 註冊短代碼
function varilumi_simulator_shortcode() {
    // 添加唯一的容器
    $output = '<div id="root" class="varilumi-simulator-container"></div>';
    
    // 檢查是否在開發模式
    if (VARILUMI_DEV_MODE && varilumi_dev_server_running()) {
        // 開發模式 - 使用 Vite 開發服務器
        $output .= '<script type="module" src="' . VARILUMI_DEV_URL . '/@vite/client"></script>';
        $output .= '<script type="module" src="' . VARILUMI_DEV_URL . '/src/main.tsx"></script>';
    } else {
        // 生產模式 - 使用打包後的文件
        // 獲取插件資源路徑前綴
        $plugin_url = plugin_dir_url(__FILE__);
        
        // 定義基本路徑變數，用於 JavaScript 全局變數
        $output .= '<script type="text/javascript">
            var VARILUMI_ASSETS_URL = "' . esc_url($plugin_url . 'assets/') . '";
        </script>';
        
        // 註冊腳本和樣式
        wp_enqueue_style('varilumi-simulator-styles', $plugin_url . 'assets/varilumi-index-Bgki6Hio.css');
        wp_enqueue_script('varilumi-simulator-js', $plugin_url . 'assets/varilumi-index-DYH8DsRU.js', array(), '1.0', true);
    }
    
    return $output;
}
add_shortcode('varilumi_simulator', 'varilumi_simulator_shortcode');

// 檢查開發服務器是否運行中
function varilumi_dev_server_running() {
    // 嘗試連接開發服務器
    $connection = @fsockopen(parse_url(VARILUMI_DEV_URL, PHP_URL_HOST), parse_url(VARILUMI_DEV_URL, PHP_URL_PORT), $errno, $errstr, 1);
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    return false;
}

// 註冊需要的資源文件路徑
function varilumi_simulator_register_assets() {
    // 如果在開發模式且開發服務器運行中，不需要註冊生產資源
    if (VARILUMI_DEV_MODE && varilumi_dev_server_running()) {
        return;
    }
    
    // 獲取插件資源路徑前綴
    $plugin_url = plugin_dir_url(__FILE__);
    
    // 註冊資源文件目錄，確保 WordPress 可以找到
    wp_register_style('varilumi-simulator-styles', $plugin_url . 'assets/varilumi-index-Bgki6Hio.css');
    wp_register_script('varilumi-simulator-js', $plugin_url . 'assets/varilumi-index-DYH8DsRU.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'varilumi_simulator_register_assets');

// 添加自定義API端點，用於獲取插件資源URL
function varilumi_simulator_add_api_routes() {
    register_rest_route('varilumi/v1', '/assets-url', array(
        'methods' => 'GET',
        'callback' => 'varilumi_get_assets_url',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'varilumi_simulator_add_api_routes');

// API回調函數，返回資源URL
function varilumi_get_assets_url() {
    return rest_ensure_response(array(
        'success' => true,
        'assets_url' => plugin_dir_url(__FILE__) . 'assets/'
    ));
}

// 新增插件管理頁面
function varilumi_simulator_add_admin_menu() {
    add_menu_page(
        'Varilumi 燈光模擬器設定',
        'Varilumi 模擬器',
        'manage_options',
        'varilumi-simulator',
        'varilumi_simulator_settings_page',
        'dashicons-admin-generic',
        30
    );
}
add_action('admin_menu', 'varilumi_simulator_add_admin_menu');

// 插件設定頁面內容
function varilumi_simulator_settings_page() {
    ?>
    <div class="wrap">
        <h1>Varilumi 燈光模擬器設定</h1>
        
        <div class="card">
            <h2>開發模式狀態</h2>
            <p>目前開發模式: <strong><?php echo VARILUMI_DEV_MODE ? '啟用' : '停用'; ?></strong></p>
            <p>開發服務器: <strong><?php echo varilumi_dev_server_running() ? '運行中' : '未運行'; ?></strong></p>
            <p>開發服務器網址: <?php echo VARILUMI_DEV_URL; ?></p>
            
            <div class="notice notice-info">
                <p>要啟用開發模式，請編輯插件文件 <code>varilumi-simulator.php</code> 並設置 <code>VARILUMI_DEV_MODE</code> 為 <code>true</code></p>
                <p>在開發模式中，請確保 Vite 開發服務器正在運行，並且可以從 WordPress 網站訪問。</p>
            </div>
            
            <h3>使用方法</h3>
            <p>1. 在開發環境中啟動 Vite 開發服務器:</p>
            <pre>npm run dev</pre>
            
            <p>2. 在任何頁面或文章中使用短代碼嵌入模擬器:</p>
            <pre>[varilumi_simulator]</pre>
            
            <h3>調試信息</h3>
            <p>當開發模式啟用並且開發服務器運行中時，模擬器將使用 Vite 開發服務器提供的資源，支持熱重載功能。</p>
        </div>
    </div>
    <?php
} 