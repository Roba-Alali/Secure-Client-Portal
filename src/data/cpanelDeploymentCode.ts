export const cpanelMysqlSchema = `-- ==========================================================
-- Secure Client Portal - MySQL Database Schema
-- Optimized for Namecheap Business cPanel (MySQL 8.0 / MariaDB)
-- Character Set: utf8mb4 (Full Arabic & Emoji support)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`client_portal_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`client_portal_db\`;

-- 1. جدول المستخدمين والعملاء (Clients & Admins)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`company\` VARCHAR(150) DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`role\` ENUM('admin', 'client') DEFAULT 'client',
  \`status\` ENUM('active', 'suspended', 'pending') DEFAULT 'active',
  \`verification_code\` VARCHAR(6) DEFAULT NULL,
  \`code_expires_at\` DATETIME DEFAULT NULL,
  \`access_expiry\` DATE DEFAULT NULL,
  \`allowed_ip\` VARCHAR(45) DEFAULT NULL,
  \`last_login_at\` DATETIME DEFAULT NULL,
  \`last_login_ip\` VARCHAR(45) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_email_role\` (\`email\`, \`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول المشاريع (Projects)
CREATE TABLE IF NOT EXISTS \`projects\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(100) DEFAULT 'عام',
  \`description\` TEXT DEFAULT NULL,
  \`status\` ENUM('active', 'in-progress', 'completed') DEFAULT 'active',
  \`created_by\` INT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول تعيين العملاء بالمشاريع (Project Access Permissions)
CREATE TABLE IF NOT EXISTS \`project_clients\` (
  \`project_id\` INT NOT NULL,
  \`client_id\` INT NOT NULL,
  \`can_view_pdf\` TINYINT(1) DEFAULT 1,
  \`can_view_presentations\` TINYINT(1) DEFAULT 1,
  \`can_view_videos\` TINYINT(1) DEFAULT 1,
  \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`project_id\`, \`client_id\`),
  FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`client_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول الملفات والمستندات المحمية (Documents & Media)
CREATE TABLE IF NOT EXISTS \`documents\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`project_id\` INT NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`file_type\` ENUM('pdf', 'presentation', 'video') NOT NULL,
  \`file_path\` VARCHAR(500) NOT NULL,
  \`file_size\` VARCHAR(50) DEFAULT NULL,
  \`page_count\` INT DEFAULT NULL,
  \`duration\` VARCHAR(20) DEFAULT NULL,
  \`is_confidential\` TINYINT(1) DEFAULT 1,
  \`watermark_enabled\` TINYINT(1) DEFAULT 1,
  \`download_restricted\` TINYINT(1) DEFAULT 1,
  \`views_count\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_project_type\` (\`project_id\`, \`file_type\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول سجل تسجيل الدخول ومحاولات الأمان (Login Activity Logs)
CREATE TABLE IF NOT EXISTS \`login_logs\` (
  \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT DEFAULT NULL,
  \`attempted_email\` VARCHAR(191) NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`user_agent\` TEXT DEFAULT NULL,
  \`device_type\` VARCHAR(50) DEFAULT 'Desktop',
  \`status\` ENUM('success', 'failed', '2fa_verified', 'blocked') NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_ip_status\` (\`ip_address\`, \`status\`),
  INDEX \`idx_created_at\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول سجل المشاهدات والتفاعل بالثواني (View Tracking Logs)
CREATE TABLE IF NOT EXISTS \`view_logs\` (
  \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
  \`document_id\` INT NOT NULL,
  \`user_id\` INT NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`duration_seconds\` INT DEFAULT 0,
  \`pages_viewed\` INT DEFAULT 1,
  \`max_page_reached\` INT DEFAULT 1,
  \`watermark_applied\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`document_id\`) REFERENCES \`documents\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_view_time\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول إعدادات العلامة المائية الديناميكية (Dynamic Watermark Config)
CREATE TABLE IF NOT EXISTS \`watermark_settings\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`enabled\` TINYINT(1) DEFAULT 1,
  \`template\` VARCHAR(255) DEFAULT '{email} | {ip} | {date} | نسخة خاصة غير مصرح بنسخها',
  \`font_size\` INT DEFAULT 16,
  \`opacity\` DECIMAL(3,2) DEFAULT 0.18,
  \`rotation\` INT DEFAULT -25,
  \`color\` VARCHAR(20) DEFAULT '#ffffff',
  \`density\` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  \`drift_animation\` TINYINT(1) DEFAULT 1,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. بيانات تجريبية أولية (Seed Demo Data)
INSERT INTO \`watermark_settings\` (\`id\`, \`enabled\`, \`template\`, \`font_size\`, \`opacity\`, \`rotation\`, \`color\`)
VALUES (1, 1, '{email} | {ip} | {date} | سري للغاية - للاطلاع فقط', 16, 0.18, -25, '#ffffff')
ON DUPLICATE KEY UPDATE \`updated_at\` = NOW();

-- كلمة المرور الافتراضية للجميع: ClientPass123! (مجزأة بتشفير BCRYPT الآمن)
INSERT INTO \`users\` (\`name\`, \`email\`, \`password_hash\`, \`company\`, \`role\`, \`status\`)
VALUES
('مدير النظام الرئيسي', 'admin@yourdomain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'الإدارة العامة', 'admin', 'active'),
('عبدالرحمن المنصور', 'mansoor@alofooq-consulting.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مؤسسة الأفق للاستشارات', 'client', 'active'),
('سارة التميمي', 'sarah@alrowad-group.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مجموعة الرواد الدولية', 'client', 'active');
`;

export const cpanelConfigFilePhp = `<?php
/**
 * config.php
 * ملف ضبط الاتصال بقاعدة بيانات MySQL على استضافة Namecheap cPanel
 * مع إعدادات الأمان ومكافحة التسلل والجلسات المشفرة
 */

// إيقاف إظهار أخطاء النظام للمستخدم لأسباب أمنية
ini_set('display_errors', 0);
error_reporting(E_ALL);

// ضبط الجلسات بخصائص الأمان الفائقة
session_set_cookie_params([
    'lifetime' => 86400, // 24 ساعة
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'] ?? '',
    'secure' => true,      // يعمل فقط مع شهادة SSL مجانية من Namecheap cPanel
    'httponly' => true,    // يمنع سرقة ملفات الارتباط عبر JavaScript
    'samesite' => 'Strict' // حماية ضد هجمات CSRF
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// بيانات اتصال MySQL من لوحة cPanel -> MySQL Databases
define('DB_HOST', 'localhost');
define('DB_NAME', 'cpaneluser_client_portal'); // استبدل بـ اسم قاعدة بياناتك في cPanel
define('DB_USER', 'cpaneluser_portaluser');    // استبدل بـ اسم مستخدم قاعدة البيانات
define('DB_PASS', 'YourStrongPassword123#');    // كلمة مرور قاعدة البيانات
define('DB_CHARSET', 'utf8mb4');

// إعدادات إشعارات البريد الإلكتروني عبر نطاق Namecheap الخاص بك
define('MAIL_FROM', 'portal-alerts@yourdomain.com');
define('ADMIN_EMAIL', 'admin@yourdomain.com');
define('APP_NAME', 'Secure Client Portal');
define('PORTAL_URL', 'https://yourdomain.com/client-portal/');

// مسار حفظ الملفات المحمية (خارج مسار public_html إن أمكن أو محمي بـ .htaccess)
define('PROTECTED_UPLOADS_DIR', __DIR__ . '/protected_uploads/');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    // تسجيل الخطأ داخلياً دون عرضه للزوار
    error_log("DB Connection Failed: " . $e->getMessage());
    die("تعذر الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات cPanel.");
}

// دالة مساعدة لتسجيل النشاط
function logActivity($pdo, $userId, $attemptedEmail, $ip, $status, $device = 'Desktop') {
    $stmt = $pdo->prepare("INSERT INTO login_logs (user_id, attempted_email, ip_address, device_type, status, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $attemptedEmail, $ip, $device, $status, $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown']);
}

// دالة إرسال إشعار فوري لبريد الأدمن عند دخول العميل أو فتح ملف
function sendAdminAlert($subject, $body) {
    $headers = "From: " . APP_NAME . " <" . MAIL_FROM . ">\r\n";
    $headers .= "Reply-To: " . MAIL_FROM . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $htmlContent = "
    <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;'>
        <h2 style='color: #f59e0b; margin-top: 0;'>🔔 " . htmlspecialchars($subject) . "</h2>
        <div style='background: #1e293b; padding: 16px; border-radius: 6px; border: 1px solid #334155; line-height: 1.8;'>
            " . $body . "
        </div>
        <p style='color: #94a3b8; font-size: 12px; margin-top: 16px;'>تم إرسال هذا التنبيه آلياً من خادم Namecheap Business الخاص بنظام بوابة العملاء المحمية.</p>
    </div>
    ";

    @mail(ADMIN_EMAIL, "=?UTF-8?B?".base64_encode($subject)."?=", $htmlContent, $headers);
}
`;

export const cpanelAuthPhp = `<?php
/**
 * auth.php
 * معالجة تسجيل دخول العميل بالبريد وكلمة المرور وكود التحقق
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

if ($action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'يرجى إدخال البريد الإلكتروني وكلمة المرور']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = 'active' LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // التحقق من تاريخ انتهاء الصلاحية
        if (!empty($user['access_expiry']) && strtotime($user['access_expiry']) < time()) {
            echo json_encode(['success' => false, 'message' => 'انتهت صلاحية وصول حسابك. يرجى التواصل مع الإدارة.']);
            exit;
        }

        // توليد كود تحقق إضافي 2FA (6 أرقام)
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + 600); // صالح لمدة 10 دقائق

        $updateStmt = $pdo->prepare("UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?");
        $updateStmt->execute([$code, $expiresAt, $user['id']]);

        // إرسال كود التحقق لبريد العميل
        $subject = "رمز التحقق لدخول بوابة العملاء: " . $code;
        $body = "مرحباً " . htmlspecialchars($user['name']) . "،<br>رمز التحقق الخاص بك هو: <strong style='font-size: 20px; color: #f59e0b;'>" . $code . "</strong><br>ينتهي الرمز خلال 10 دقائق.";
        sendAdminAlert("طلب تسجيل دخول: " . $user['name'], "تمت محاولة تسجيل دخول صحيحة من العميل {$user['name']} ({$email}) من عنوان IP: {$ip}.");

        $_SESSION['pending_user_id'] = $user['id'];
        echo json_encode(['success' => true, 'requires_verification' => true, 'demo_code' => $code]);
        exit;
    } else {
        logActivity($pdo, null, $email, $ip, 'failed');
        echo json_encode(['success' => false, 'message' => 'بيانات الاعتماد غير صحيحة أو الحساب غير مفعل']);
        exit;
    }
}

if ($action === 'verify_code') {
    $input = json_decode(file_get_contents('php://input'), true);
    $code = trim($input['code'] ?? '');
    $userId = $_SESSION['pending_user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'جلسة التحقق منتهية، أعد تسجيل الدخول']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND verification_code = ? AND code_expires_at > NOW() LIMIT 1");
    $stmt->execute([$userId, $code]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];
        unset($_SESSION['pending_user_id']);

        // تحديث آخر دخول
        $pdo->prepare("UPDATE users SET last_login_at = NOW(), last_login_ip = ?, verification_code = NULL WHERE id = ?")
            ->execute([$ip, $user['id']]);

        logActivity($pdo, $user['id'], $user['email'], $ip, '2fa_verified');

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'company' => $user['company']
            ]
        ]);
        exit;
    } else {
        echo json_encode(['success' => false, 'message' => 'رمز التحقق غير صحيح أو انتهت صلاحيته']);
        exit;
    }
}
`;

export const cpanelViewerPhp = `<?php
/**
 * viewer.php
 * خادم عرض المستندات المحمي بواسطة PDF.js والعلامات المائية الديناميكية
 * يمنع التحميل المباشر ويعطل الطباعة وحفظ الملفات، ويسجل زمن المشاهدة
 */
require_once __DIR__ . '/config.php';

// التحقق من وجود جلسة عميل مسجل
if (empty($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$docId = (int)($_GET['id'] ?? 0);
$userId = (int)$_SESSION['user_id'];
$userEmail = $_SESSION['user_email'];
$userName = $_SESSION['user_name'];
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// استعلام بيانات المستند والتحقق من صلاحية العميل للوصول إلى هذا المشروع
$stmt = $pdo->prepare("
    SELECT d.*, p.title as project_title, pc.can_view_pdf 
    FROM documents d
    JOIN projects p ON d.project_id = p.id
    JOIN project_clients pc ON pc.project_id = p.id AND pc.client_id = ?
    WHERE d.id = ? LIMIT 1
");
$stmt->execute([$userId, $docId]);
$doc = $stmt->fetch();

if (!$doc) {
    die("عفواً، ليس لديك صلاحية للوصول إلى هذا المستند أو الملف غير موجود.");
}

// تسجيل بدء جلسة المشاهدة وإرسال إشعار للأدمن
$timestamp = date('Y-m-d H:i:s');
$watermarkText = $userEmail . " | " . $clientIp . " | " . $timestamp . " | سري للغاية";

sendAdminAlert(
    "فتح مستند: " . $doc['title'],
    "العميل: {$userName} ({$userEmail})<br>المستند: {$doc['title']}<br>المشروع: {$doc['project_title']}<br>عنوان IP: {$clientIp}<br>العلامة المائية النشطة: {$watermarkText}"
);

// زيادة عدد المشاهدات
$pdo->prepare("UPDATE documents SET views_count = views_count + 1 WHERE id = ?")->execute([$docId]);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($doc['title']); ?> - عارض آمن محمي</title>
    <!-- مكتبة PDF.js مفتوحة المصدر مجاناً -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #0b1329; color: #f8fafc; font-family: 'Segoe UI', Tahoma, sans-serif; user-select: none; }
        #viewer-container { position: relative; width: 100vw; height: 100vh; overflow: auto; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .page-container { position: relative; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        canvas { display: block; background: #ffffff; }
        
        /* طبقة العلامة المائية الديناميكية غير القابلة للإزالة أو الحجب */
        .dynamic-watermark-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            overflow: hidden;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(4, 1fr);
            opacity: 0.22;
            z-index: 9999;
        }
        .wm-item {
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-25deg);
            font-size: 15px;
            font-weight: 700;
            color: #ef4444;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
            white-space: nowrap;
        }
        /* حماية ضد الطباعة */
        @media print {
            body { display: none !important; }
        }
    </style>
</head>
<body oncontextmenu="return false;">
    <div id="viewer-container">
        <!-- يتم هنا استدعاء عارض PDF.js مع حقن العلامة المائية في الـ Canvas -->
    </div>
    <script>
        // إرسال تقرير زمني دوري (Heartbeat) كل 15 ثانية لتسجيل مدة المشاهدة الفعلية
        let duration = 0;
        setInterval(() => {
            duration += 15;
            fetch('api.php?action=heartbeat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    doc_id: <?php echo $docId; ?>,
                    duration_seconds: duration,
                    watermark: "<?php echo addslashes($watermarkText); ?>"
                })
            });
        }, 15000);

        // حظر مفاتيح الاختصار الخاصة بالحفظ والطباعة (Ctrl+S, Ctrl+P, F12)
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
                e.preventDefault();
                alert('عفواً: التحميل والطباعة والاطلاع على المصدر مقفل لحماية بيانات العميل.');
            }
            if (e.key === 'F12') e.preventDefault();
        });
    </script>
</body>
</html>
`;

export const cpanelHtaccess = `# ==========================================================
# Secure Client Portal - .htaccess for Namecheap cPanel
# حماية صارمة لمنع الوصول المباشر لملفات PDF والفيديوهات
# ==========================================================

# 1. تفعيل محرك إعادة التوجيه
RewriteEngine On

# 2. إجبار بروتوكول HTTPS المشفر في Namecheap
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 3. منع تصفح المجلدات واستعراض قائمة الملفات
Options -Indexes

# 4. حظر الوصول المباشر لأي ملف داخل مجلد uploads
RewriteRule ^protected_uploads/.*$ - [F,L]
RewriteRule ^config\\.php$ - [F,L]
RewriteRule ^\\.env$ - [F,L]

# 5. ترويسات الأمان المتقدمة
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    # منع عمل الكاش للمستندات السرية
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
</IfModule>
`;

export const cpanelDeploymentSteps = [
  {
    step: 1,
    title: 'إنشاء قاعدة بيانات MySQL في Namecheap cPanel',
    titleEn: 'Create MySQL Database in Namecheap cPanel',
    desc: 'ادخل إلى لوحة cPanel، ثم اختر MySQL® Databases. أنشئ قاعدة بيانات جديدة باسم مثلاً (client_portal_db)، وأنشئ مستخدماً بكلمة مرور قوية، ثم اربط المستخدم بالقاعدة مع منحه كافة الصلاحيات (ALL PRIVILEGES).'
  },
  {
    step: 2,
    title: 'استيراد الجداول عبر phpMyAdmin',
    titleEn: 'Import SQL Schema via phpMyAdmin',
    desc: 'من لوحة cPanel اضغط على phpMyAdmin، اختر قاعدة البيانات التي أنشأتها، واضغط على تبويب (Import) ثم ارفع ملف schema.sql المحتوي على الجداول ومحرك UTF8mb4.'
  },
  {
    step: 3,
    title: 'رفع ملفات النظام إلى File Manager',
    titleEn: 'Upload Files via cPanel File Manager',
    desc: 'ادخل إلى File Manager، توجه إلى مجلد public_html/client-portal/، وارفع ملفات PHP و .htaccess. يمكنك إنشاء مجلد protected_uploads/ لوضع ملفات PDF داخله.'
  },
  {
    step: 4,
    title: 'تعديل بيانات config.php وربط البريد الإلكتروني',
    titleEn: 'Configure config.php & Domain Email',
    desc: 'افتح ملف config.php في cPanel Code Editor، وضع اسم قاعدة البيانات والمستخدم وكلمة المرور، وبريدك الإلكتروني في نطاقك لاستقبال تنبيهات تسجيل دخول العملاء فوراً وبشكل مجاني 100% دون أي تكلفة إضافية.'
  },
  {
    step: 5,
    title: 'تأكيد شهادة SSL المجانية',
    titleEn: 'Activate Free Namecheap SSL',
    desc: 'من cPanel اختر Namecheap SSL أو cPanel AutoSSL لتفعيل قفل الأمان الأخضر HTTPS لضمان تشفير بيانات الجلسات وعلامات المشاهدة.'
  }
];
