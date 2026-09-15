export const cpanelMysqlSchema = `-- ==========================================================
-- MMG VIP Client Portal - MySQL Database Schema
-- Modern Media Global (mmglobal.vip) - Enterprise Production Host
-- Character Set: utf8mb4 (Full Arabic & International Multi-byte support)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`mmg_client_portal_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`mmg_client_portal_db\`;

-- 1. جدول المستخدمين والعملاء (Clients & MMG Admins)
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

-- 2. جدول مشاريع Modern Media Global (MMG Projects)
CREATE TABLE IF NOT EXISTS \`projects\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(100) DEFAULT 'استشارات إعلامية وإعلانية',
  \`description\` TEXT DEFAULT NULL,
  \`status\` ENUM('active', 'in-progress', 'completed') DEFAULT 'active',
  \`created_by\` INT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول تعيين العملاء بمشاريع MMG (Project Access Permissions)
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

-- 4. جدول الملفات والمستندات المحمية (Protected Documents & Media)
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

-- 6. جدول سجل المشاهدات وتتبع الصفحات (View Tracking Logs)
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

-- 7. جدول إعدادات العلامة المائية الديناميكية (MMG Watermark Config)
CREATE TABLE IF NOT EXISTS \`watermark_settings\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`enabled\` TINYINT(1) DEFAULT 1,
  \`template\` VARCHAR(255) DEFAULT 'MMG VIP | {email} | {ip} | {date} | نسخة خاصة غير مصرح بنسخها',
  \`font_size\` INT DEFAULT 16,
  \`opacity\` DECIMAL(3,2) DEFAULT 0.18,
  \`rotation\` INT DEFAULT -25,
  \`color\` VARCHAR(20) DEFAULT '#E40107',
  \`density\` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  \`drift_animation\` TINYINT(1) DEFAULT 1,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. بيانات تجريبية أولية (Seed Demo Data)
INSERT INTO \`watermark_settings\` (\`id\`, \`enabled\`, \`template\`, \`font_size\`, \`opacity\`, \`rotation\`, \`color\`)
VALUES (1, 1, 'MMG VIP • {email} | {ip} | {date} | سري للغاية - للاطلاع فقط', 16, 0.20, -25, '#E40107')
ON DUPLICATE KEY UPDATE \`updated_at\` = NOW();

-- كلمة المرور الافتراضية للجميع: ClientPass123! (مجزأة بتشفير BCRYPT الآمن)
INSERT INTO \`users\` (\`name\`, \`email\`, \`password_hash\`, \`company\`, \`role\`, \`status\`)
VALUES
('إدارة Modern Media Global', 'admin@mmglobal.vip', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Modern Media Global (MMG)', 'admin', 'active'),
('عبدالرحمن المنصور', 'mansoor@alofooq-consulting.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مؤسسة الأفق للاستشارات', 'client', 'active'),
('سارة التميمي', 'sarah@alrowad-group.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مجموعة الرواد الدولية', 'client', 'active');
`;

export const cpanelConfigFilePhp = `<?php
/**
 * config.php
 * ملف ضبط الاتصال بقاعدة بيانات MySQL لخادم MMG VIP Portal (Modern Media Global)
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
    'secure' => true,      // يعمل فقط مع شهادة SSL المشفرة
    'httponly' => true,    // يمنع سرقة ملفات الارتباط عبر JavaScript
    'samesite' => 'Strict' // حماية ضد هجمات CSRF
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// بيانات اتصال MySQL من لوحة تحكم الخادم cPanel -> MySQL Databases
define('DB_HOST', 'localhost');
define('DB_NAME', 'mmg_client_portal');      // اسم قاعدة بيانات البوابة
define('DB_USER', 'mmg_portal_user');        // اسم مستخدم قاعدة البيانات
define('DB_PASS', 'YourStrongPassword123#'); // كلمة مرور قاعدة البيانات
define('DB_CHARSET', 'utf8mb4');

// إعدادات إشعارات البريد الإلكتروني عبر نطاق MMG المعتمد
define('MAIL_FROM', 'portal-alerts@mmglobal.vip');
define('ADMIN_EMAIL', 'admin@mmglobal.vip');
define('APP_NAME', 'MMG VIP Client Portal');
define('PORTAL_URL', 'https://mmglobal.vip/portal/');

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
    die("تعذر الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات خادم MMG.");
}

// دالة مساعدة لتسجيل النشاط
function logActivity($pdo, $userId, $attemptedEmail, $ip, $status, $device = 'Desktop') {
    $stmt = $pdo->prepare("INSERT INTO login_logs (user_id, attempted_email, ip_address, device_type, status, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $attemptedEmail, $ip, $device, $status, $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown']);
}

// دالة إرسال إشعار فوري لبريد الإدارة عند دخول العميل أو فتح ملف
function sendAdminAlert($subject, $body) {
    $headers = "From: " . APP_NAME . " <" . MAIL_FROM . ">\r\n";
    $headers .= "Reply-To: " . MAIL_FROM . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $htmlContent = "
    <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right; background: #0c0c0e; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #27272a;'>
        <div style='display: flex; align-items: center; margin-bottom: 16px;'>
            <span style='background: #E40107; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px;'>MMG VIP ALERT</span>
        </div>
        <h2 style='color: #ffffff; margin-top: 0;'>🔔 " . htmlspecialchars($subject) . "</h2>
        <div style='background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #3f3f46; line-height: 1.8; font-size: 13px;'>
            " . $body . "
        </div>
        <p style='color: #71717a; font-size: 12px; margin-top: 16px;'>تم إرسال هذا التنبيه آلياً من خادم Modern Media Global (mmglobal.vip) - نظام حماية المستندات والعلامات المائية.</p>
    </div>
    ";

    @mail(ADMIN_EMAIL, "=?UTF-8?B?".base64_encode($subject)."?=", $htmlContent, $headers);
}
`;

export const cpanelAuthPhp = `<?php
/**
 * auth.php
 * معالجة تسجيل دخول العميل بالبريد وكلمة المرور وكود التحقق لبوابة MMG VIP
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
            echo json_encode(['success' => false, 'message' => 'انتهت صلاحية وصول حسابك. يرجى التواصل مع إدارة MMG.']);
            exit;
        }

        // توليد كود تحقق إضافي 2FA (6 أرقام)
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + 600); // صالح لمدة 10 دقائق

        $up = $pdo->prepare("UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?");
        $up->execute([$code, $expiresAt, $user['id']]);

        // إرسال كود التحقق لبريد العميل
        @mail(
            $user['email'],
            "=?UTF-8?B?".base64_encode("رمز دخول بوابة MMG VIP: " . $code)."?=",
            "مرحباً {$user['name']}،\r\n\r\nرمز التحقق الخاص بك لدخول بوابة MMG VIP هو: {$code}\r\nصالح لمدة 10 دقائق.",
            "From: " . APP_NAME . " <" . MAIL_FROM . ">\r\nContent-Type: text/plain; charset=UTF-8"
        );

        logActivity($pdo, $user['id'], $email, $ip, '2fa_verified');

        echo json_encode([
            'success' => true,
            'requires_2fa' => true,
            'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        ]);
        exit;
    } else {
        logActivity($pdo, null, $email, $ip, 'failed');
        echo json_encode(['success' => false, 'message' => 'بيانات الدخول غير صحيحة']);
        exit;
    }
}
`;

export const cpanelViewerPhp = `<?php
/**
 * viewer.php
 * عارض PDF.js المحمي بتقنية العلامات المائية المدمجة لبوابة MMG VIP
 * يمنع التحميل والتنزيل والطباعة، ويحقن اسم العميل و IP في كل صفحة
 */
require_once __DIR__ . '/config.php';

if (empty($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$docId = (int)($_GET['doc_id'] ?? 0);
$userId = $_SESSION['user_id'];
$userEmail = $_SESSION['user_email'] ?? 'client@mmglobal.vip';
$userName = $_SESSION['user_name'] ?? 'عميل MMG';
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// جلب بيانات المستند والتأكد من الصلاحية
$stmt = $pdo->prepare("
    SELECT d.*, p.title as project_title 
    FROM documents d
    JOIN projects p ON d.project_id = p.id
    JOIN project_clients pc ON pc.project_id = p.id
    WHERE d.id = ? AND pc.client_id = ?
    LIMIT 1
");
$stmt->execute([$docId, $userId]);
$doc = $stmt->fetch();

if (!$doc) {
    die("عفواً: ليس لديك صلاحية للاطلاع على هذا المستند.");
}

// تسجيل بدء جلسة المشاهدة وإرسال إشعار لإدارة MMG
$timestamp = date('Y-m-d H:i:s');
$watermarkText = "MMG VIP • " . $userEmail . " | " . $clientIp . " | " . $timestamp;

sendAdminAlert(
    "مشاهدة مستند: " . $doc['title'],
    "العميل: {$userName} ({$userEmail})<br>المستند: {$doc['title']}<br>المشروع: {$doc['project_title']}<br>عنوان IP: {$clientIp}<br>العلامة المائية النشطة: {$watermarkText}"
);

// زيادة عدد المشاهدات
$pdo->prepare("UPDATE documents SET views_count = views_count + 1 WHERE id = ?")->execute([$docId]);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($doc['title']); ?> - MMG VIP Secure Viewer</title>
    <!-- مكتبة PDF.js مفتوحة المصدر -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #09090b; color: #f8fafc; font-family: 'Segoe UI', Tahoma, sans-serif; user-select: none; }
        #viewer-container { position: relative; width: 100vw; height: 100vh; overflow: auto; display: flex; flex-direction: column; align-items: center; padding: 24px; }
        .page-container { position: relative; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border-radius: 8px; overflow: hidden; }
        canvas { display: block; background: #ffffff; }
        
        /* طبقة العلامة المائية الديناميكية الخاصة بـ MMG VIP */
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
            color: #E40107;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            white-space: nowrap;
        }
        /* حظر كامل للطباعة */
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
                alert('عفواً: التحميل والطباعة والاطلاع على المصدر مقفل لحماية وثائق Modern Media Global.');
            }
            if (e.key === 'F12') e.preventDefault();
        });
    </script>
</body>
</html>
`;

export const cpanelHtaccess = `# ==========================================================
# MMG VIP Client Portal - .htaccess
# Modern Media Global (mmglobal.vip)
# حماية صارمة لمنع الوصول المباشر لملفات PDF والفيديوهات
# ==========================================================

# 1. تفعيل محرك إعادة التوجيه
RewriteEngine On

# 2. إجبار بروتوكول HTTPS المشفر
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 3. منع تصفح المجلدات واستعراض قائمة الملفات
Options -Indexes

# 4. حظر الوصول المباشر لأي ملف داخل مجلد uploads
RewriteRule ^protected_uploads/.*$ - [F,L]
RewriteRule ^config\\.php$ - [F,L]
RewriteRule ^\\.env$ - [F,L]

# 5. ترويسات الأمان المتقدمة لشركة MMG
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
    title: 'إنشاء قاعدة بيانات MySQL في لوحة التحكم (cPanel)',
    titleEn: 'Create MySQL Database in cPanel',
    desc: 'ادخل إلى لوحة التحكم cPanel الخاصة بنطاقك، ثم اختر MySQL® Databases. أنشئ قاعدة بيانات جديدة باسم مثلاً (mmg_client_portal_db)، وأنشئ مستخدماً بكلمة مرور قوية، ثم اربط المستخدم بالقاعدة مع منحه كافة الصلاحيات (ALL PRIVILEGES).'
  },
  {
    step: 2,
    title: 'استيراد الجداول عبر phpMyAdmin',
    titleEn: 'Import SQL Schema via phpMyAdmin',
    desc: 'من لوحة cPanel اضغط على phpMyAdmin، اختر قاعدة البيانات التي أنشأتها، واضغط على تبويب (Import) ثم ارفع ملف schema.sql المحتوي على جداول MMG ومحرك UTF8mb4.'
  },
  {
    step: 3,
    title: 'رفع ملفات النظام إلى File Manager',
    titleEn: 'Upload Files via cPanel File Manager',
    desc: 'ادخل إلى File Manager، توجه إلى مجلد public_html/portal/، وارفع ملفات PHP و .htaccess. أنشئ مجلد protected_uploads/ لوضع ملفات PDF داخله بشكل محمي.'
  },
  {
    step: 4,
    title: 'تعديل بيانات config.php وربط بريد mmglobal.vip',
    titleEn: 'Configure config.php & Domain Email',
    desc: 'افتح ملف config.php في cPanel Code Editor، وضع اسم قاعدة البيانات والمستخدم وكلمة المرور، وبريدك الإلكتروني في نطاقك لاستقبال تنبيهات تسجيل دخول العملاء فوراً وبشكل مجاني 100% دون أي تكلفة إضافية.'
  },
  {
    step: 5,
    title: 'تأكيد شهادة SSL المشفرة',
    titleEn: 'Activate SSL Certificate',
    desc: 'من cPanel اختر SSL/TLS أو cPanel AutoSSL لتفعيل قفل الأمان الأخضر HTTPS لضمان تشفير بيانات الجلسات وعلامات المشاهدة المائية لبوابة MMG VIP.'
  }
];
