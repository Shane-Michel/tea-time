<?php
declare(strict_types=1);

// Basic bootstrap for SQLite + session-backed API.

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    }
    exit;
}

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

session_set_cookie_params([
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$dbPath = __DIR__ . '/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

/**
 * Run required migrations when the database is first created.
 */
function migrate(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS study_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        study_id TEXT NOT NULL,
        day INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        UNIQUE(user_id, study_id, day)
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        study_id TEXT,
        reference TEXT,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');

    $pdo->exec('CREATE TRIGGER IF NOT EXISTS notes_updated_at_trigger
        AFTER UPDATE ON notes
        BEGIN
            UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;');

    $pdo->exec('CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        study_id TEXT,
        reference TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS bible (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        UNIQUE(book, chapter, verse)
    )');

    $count = (int) $pdo->query('SELECT COUNT(*) FROM bible')->fetchColumn();
    if ($count === 0) {
        $seed = [
            ['Matthew', 5, 9, 'Blessed are the peacemakers, for they will be called children of God.'],
            ['Esther', 4, 14, 'And who knows but that you have come to your royal position for such a time as this?'],
            ['Isaiah', 58, 6, "Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke?"],
        ];
        $stmt = $pdo->prepare('INSERT INTO bible (book, chapter, verse, text) VALUES (?, ?, ?, ?)');
        foreach ($seed as $row) {
            $stmt->execute($row);
        }
    }
}

migrate($pdo);

function json_body(): array
{
    $input = file_get_contents('php://input');
    if ($input === false || $input === '') {
        return [];
    }
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function current_user(PDO $pdo): ?array
{
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
}

function require_auth(PDO $pdo): array
{
    $user = current_user($pdo);
    if (!$user) {
        respond(['error' => 'Authentication required'], 401);
    }
    return $user;
}

function load_studies(): array
{
    $slugs = ['matthew', 'esther', 'fasting'];
    $plans = [];
    foreach ($slugs as $slug) {
        $path = __DIR__ . '/../src/data/studies/' . $slug . '.json';
        if (file_exists($path)) {
            $plan = json_decode((string) file_get_contents($path), true);
            if (is_array($plan)) {
                $plans[] = $plan;
            }
        }
    }
    return $plans;
}
