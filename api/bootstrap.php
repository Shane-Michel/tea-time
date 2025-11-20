<?php
declare(strict_types=1);

// Basic bootstrap for SQLite + session-backed API.
$isCli = PHP_SAPI === 'cli';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

define('APP_LOG_DIR', __DIR__ . '/storage/logs');
if (!is_dir(APP_LOG_DIR)) {
    mkdir(APP_LOG_DIR, 0775, true);
}

if (!$isCli && $requestMethod === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    }
    exit;
}

if (!$isCli && isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Vary: Origin');
}

if (!$isCli) {
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');

    session_set_cookie_params([
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

set_error_handler(function (int $severity, string $message, string $file, int $line): void {
    app_log('error', 'PHP runtime error', [
        'severity' => $severity,
        'message' => $message,
        'file' => $file,
        'line' => $line,
    ]);

    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function (Throwable $exception): void {
    app_log('error', 'Unhandled exception', [
        'message' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString(),
    ]);

    if (getenv('APP_TESTING')) {
        throw $exception;
    }

    respond(['error' => 'Server error. Please try again later.'], 500);
});

$dbPath = getenv('DATABASE_PATH') ?: __DIR__ . '/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

/**
 * Run required migrations when the database is first created.
 */
function table_has_column(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare("PRAGMA table_info('" . $table . "')");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        if (($col['name'] ?? '') === $column) {
            return true;
        }
    }
    return false;
}

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
        testament TEXT,
        UNIQUE(book, chapter, verse)
    )');

    if (!table_has_column($pdo, 'bible', 'testament')) {
        $pdo->exec("ALTER TABLE bible ADD COLUMN testament TEXT");
    }

    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_bible_book_chapter ON bible(book, chapter)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_bible_testament ON bible(testament)');

    $pdo->exec("CREATE VIRTUAL TABLE IF NOT EXISTS bible_fts USING fts5(book, text, content='bible', content_rowid='id')");

    $pdo->exec('CREATE TRIGGER IF NOT EXISTS bible_ai_trigger AFTER INSERT ON bible BEGIN
        INSERT INTO bible_fts(rowid, book, text) VALUES (new.id, new.book, new.text);
    END;');
    $pdo->exec('CREATE TRIGGER IF NOT EXISTS bible_ad_trigger AFTER DELETE ON bible BEGIN
        INSERT INTO bible_fts(bible_fts, rowid, book, text) VALUES ("delete", old.id, old.book, old.text);
    END;');
    $pdo->exec('CREATE TRIGGER IF NOT EXISTS bible_au_trigger AFTER UPDATE ON bible BEGIN
        INSERT INTO bible_fts(bible_fts, rowid, book, text) VALUES ("delete", old.id, old.book, old.text);
        INSERT INTO bible_fts(rowid, book, text) VALUES (new.id, new.book, new.text);
    END;');

    $pdo->exec('CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT,
        filters TEXT
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS topic_passages (
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        bible_id INTEGER NOT NULL REFERENCES bible(id) ON DELETE CASCADE,
        note TEXT,
        PRIMARY KEY(topic_id, bible_id)
    )');

    seed_bible_with_niv($pdo);
    seed_topics($pdo);
}

function testament_for_book(string $book): string
{
    $ot = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
    return in_array($book, $ot, true) ? 'OT' : 'NT';
}

function seed_bible_with_niv(PDO $pdo): void
{
    $dataPath = __DIR__ . '/data/niv.json';
    $count = (int) $pdo->query('SELECT COUNT(*) FROM bible')->fetchColumn();
    if (!file_exists($dataPath)) {
        if ($count === 0) {
            $seed = [
                ['Matthew', 5, 9, 'Blessed are the peacemakers, for they will be called children of God.', 'NT'],
                ['Esther', 4, 14, 'And who knows but that you have come to your royal position for such a time as this?', 'OT'],
                ['Isaiah', 58, 6, 'Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke?', 'OT'],
            ];
            $stmt = $pdo->prepare('INSERT INTO bible (book, chapter, verse, text, testament) VALUES (?, ?, ?, ?, ?)');
            foreach ($seed as $row) {
                $stmt->execute($row);
            }
            $pdo->exec("INSERT INTO bible_fts(bible_fts) VALUES('rebuild')");
        }
        return;
    }

    $json = json_decode((string) file_get_contents($dataPath), true);
    if (!is_array($json)) {
        return;
    }

    if ($count < count($json)) {
        $pdo->exec('DELETE FROM topic_passages');
        $pdo->exec('DELETE FROM bible');
        $count = 0;
    }

    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO bible (book, chapter, verse, text, testament) VALUES (?, ?, ?, ?, ?)');
        foreach ($json as $row) {
            $testament = $row['testament'] ?? testament_for_book((string) $row['book']);
            $stmt->execute([
                $row['book'],
                (int) $row['chapter'],
                (int) $row['verse'],
                $row['text'],
                $testament,
            ]);
        }
        $pdo->exec("INSERT INTO bible_fts(bible_fts) VALUES('rebuild')");
    }
}

function parse_reference(string $reference): ?array
{
    $clean = trim($reference);
    if ($clean === '') {
        return null;
    }
    $pattern = '/^(?<book>[1-3]?\s?[A-Za-z ]+)\s+(?<chapter>\d+)(?::(?<verse>\d+)(?:-(?<end>\d+))?)?/';
    if (preg_match($pattern, $clean, $matches)) {
        return [
            'book' => trim($matches['book']),
            'chapter' => (int) $matches['chapter'],
            'verse' => isset($matches['verse']) ? (int) $matches['verse'] : null,
            'end' => isset($matches['end']) && $matches['end'] !== '' ? (int) $matches['end'] : null,
        ];
    }
    return null;
}

function expand_reference(string $reference): array
{
    $parsed = parse_reference($reference);
    if (!$parsed) {
        return [];
    }

    $book = $parsed['book'];
    $chapter = $parsed['chapter'];
    $verse = $parsed['verse'] ?? 1;
    $end = $parsed['end'] ?? $verse;
    $verses = [];
    for ($v = $verse; $v <= $end; $v++) {
        $verses[] = [$book, $chapter, $v];
    }
    return $verses;
}

function seed_topics(PDO $pdo): void
{
    $dataPath = __DIR__ . '/data/topics.json';
    if (!file_exists($dataPath)) {
        return;
    }

    $existing = (int) $pdo->query('SELECT COUNT(*) FROM topics')->fetchColumn();
    if ($existing > 0) {
        return;
    }

    $json = json_decode((string) file_get_contents($dataPath), true);
    if (!is_array($json)) {
        return;
    }

    $topicStmt = $pdo->prepare('INSERT INTO topics (slug, title, summary, filters) VALUES (?, ?, ?, ?)');
    $pivotStmt = $pdo->prepare('INSERT OR IGNORE INTO topic_passages (topic_id, bible_id, note) VALUES (?, ?, ?)');

    foreach ($json as $topic) {
        $filters = json_encode($topic['filters'] ?? []);
        $topicStmt->execute([
            $topic['slug'],
            $topic['title'],
            $topic['summary'] ?? null,
            $filters,
        ]);
        $topicId = (int) $pdo->lastInsertId();
        foreach ($topic['references'] ?? [] as $ref) {
            foreach (expand_reference((string) $ref) as $triple) {
                [$book, $chapter, $verse] = $triple;
                $lookup = $pdo->prepare('SELECT id FROM bible WHERE book = ? AND chapter = ? AND verse = ? LIMIT 1');
                $lookup->execute([$book, $chapter, $verse]);
                $bibleId = $lookup->fetchColumn();
                if ($bibleId) {
                    $pivotStmt->execute([$topicId, $bibleId, null]);
                }
            }
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

function app_log(string $level, string $message, array $context = []): void
{
    $destination = APP_LOG_DIR . '/app.log';
    $baseContext = [
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'cli',
        'path' => $_SERVER['REQUEST_URI'] ?? 'cli',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
    ];

    $entry = [
        'timestamp' => date(DATE_ATOM),
        'level' => $level,
        'message' => $message,
        'context' => array_merge($baseContext, $context),
    ];

    file_put_contents($destination, json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND);
}

function respond($data, int $status = 200): void
{
    http_response_code($status);

    if ($status >= 400) {
        app_log($status >= 500 ? 'error' : 'warning', 'API response', [
            'status' => $status,
            'payload' => $data,
        ]);
    }

    echo json_encode($data);
    if (getenv('APP_TESTING')) {
        return;
    }
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
