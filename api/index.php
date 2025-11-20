<?php
require __DIR__ . '/bootstrap.php';

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function handle_auth_register(PDO $pdo): void
{
    $payload = json_body();
    $email = trim($payload['email'] ?? '');
    $name = trim($payload['name'] ?? '');
    $password = $payload['password'] ?? '';

    if ($email === '' || $name === '' || $password === '') {
        respond(['error' => 'Name, email, and password are required'], 422);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ((int) $stmt->fetchColumn() > 0) {
        respond(['error' => 'Email already registered'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    $insert->execute([$name, $email, $hash]);

    $_SESSION['user_id'] = (int) $pdo->lastInsertId();

    respond(['user' => current_user($pdo)]);
}

function handle_auth_login(PDO $pdo): void
{
    $payload = json_body();
    $email = trim($payload['email'] ?? '');
    $password = $payload['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !password_verify($password, (string) $row['password_hash'])) {
        respond(['error' => 'Invalid credentials'], 401);
    }

    $_SESSION['user_id'] = (int) $row['id'];
    respond(['user' => current_user($pdo)]);
}

function handle_auth_logout(): void
{
    session_destroy();
    respond(['success' => true]);
}

function handle_studies(): void
{
    $plans = load_studies();
    respond(['studies' => $plans]);
}

function handle_study_detail(string $id): void
{
    $plans = load_studies();
    foreach ($plans as $plan) {
        if (($plan['id'] ?? '') === $id) {
            respond(['study' => $plan]);
        }
    }
    respond(['error' => 'Study not found'], 404);
}

function handle_progress(PDO $pdo, array $user): void
{
    global $method;
    if ($method === 'GET') {
        $studyId = $_GET['study_id'] ?? null;
        if (!$studyId) {
            respond(['error' => 'study_id is required'], 422);
        }
        $stmt = $pdo->prepare('SELECT day FROM study_progress WHERE user_id = ? AND study_id = ? ORDER BY day');
        $stmt->execute([$user['id'], $studyId]);
        $days = $stmt->fetchAll(PDO::FETCH_COLUMN);
        respond(['days' => array_map('intval', $days)]);
    }

    $payload = json_body();
    $studyId = $payload['study_id'] ?? null;
    $day = isset($payload['day']) ? (int) $payload['day'] : null;
    $completed = (bool) ($payload['completed'] ?? false);
    if (!$studyId || !$day) {
        respond(['error' => 'study_id and day are required'], 422);
    }

    if ($completed) {
        $stmt = $pdo->prepare('INSERT OR IGNORE INTO study_progress (user_id, study_id, day, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');
        $stmt->execute([$user['id'], $studyId, $day]);
    } else {
        $stmt = $pdo->prepare('DELETE FROM study_progress WHERE user_id = ? AND study_id = ? AND day = ?');
        $stmt->execute([$user['id'], $studyId, $day]);
    }

    $refresh = $pdo->prepare('SELECT day FROM study_progress WHERE user_id = ? AND study_id = ? ORDER BY day');
    $refresh->execute([$user['id'], $studyId]);
    $days = $refresh->fetchAll(PDO::FETCH_COLUMN);
    respond(['days' => array_map('intval', $days)]);
}

function handle_notes_collection(PDO $pdo, array $user): void
{
    global $method;
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT id, study_id, reference, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$user['id']]);
        respond(['notes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    $payload = json_body();
    $content = trim($payload['content'] ?? '');
    if ($content === '') {
        respond(['error' => 'Note content is required'], 422);
    }
    $studyId = $payload['study_id'] ?? null;
    $reference = $payload['reference'] ?? null;
    $stmt = $pdo->prepare('INSERT INTO notes (user_id, study_id, reference, content) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user['id'], $studyId, $reference, $content]);
    respond(['note' => [
        'id' => (int) $pdo->lastInsertId(),
        'study_id' => $studyId,
        'reference' => $reference,
        'content' => $content,
        'created_at' => date('c'),
        'updated_at' => date('c'),
    ]], 201);
}

function handle_note_item(PDO $pdo, array $user, int $noteId): void
{
    global $method;
    if ($method === 'DELETE') {
        $stmt = $pdo->prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
        $stmt->execute([$noteId, $user['id']]);
        respond(['success' => true]);
    }

    $payload = json_body();
    $content = trim($payload['content'] ?? '');
    $studyId = $payload['study_id'] ?? null;
    $reference = $payload['reference'] ?? null;
    if ($content === '') {
        respond(['error' => 'Note content is required'], 422);
    }
    $stmt = $pdo->prepare('UPDATE notes SET content = ?, study_id = ?, reference = ? WHERE id = ? AND user_id = ?');
    $stmt->execute([$content, $studyId, $reference, $noteId, $user['id']]);
    respond(['note' => [
        'id' => $noteId,
        'study_id' => $studyId,
        'reference' => $reference,
        'content' => $content,
    ]]);
}

function handle_bookmarks(PDO $pdo, array $user): void
{
    global $method;
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT id, study_id, reference, note, created_at FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$user['id']]);
        respond(['bookmarks' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    $payload = json_body();
    $reference = trim($payload['reference'] ?? '');
    if ($reference === '') {
        respond(['error' => 'Reference is required'], 422);
    }
    $studyId = $payload['study_id'] ?? null;
    $note = $payload['note'] ?? null;
    $stmt = $pdo->prepare('INSERT INTO bookmarks (user_id, study_id, reference, note) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user['id'], $studyId, $reference, $note]);
    respond(['bookmark' => [
        'id' => (int) $pdo->lastInsertId(),
        'study_id' => $studyId,
        'reference' => $reference,
        'note' => $note,
        'created_at' => date('c'),
    ]], 201);
}

function handle_bookmark_item(PDO $pdo, array $user, int $bookmarkId): void
{
    $stmt = $pdo->prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?');
    $stmt->execute([$bookmarkId, $user['id']]);
    respond(['success' => true]);
}

switch (true) {
    case $path === '/api/auth/register' && $method === 'POST':
        handle_auth_register($pdo);
        break;
    case $path === '/api/auth/login' && $method === 'POST':
        handle_auth_login($pdo);
        break;
    case $path === '/api/auth/logout' && $method === 'POST':
        handle_auth_logout();
        break;
    case $path === '/api/auth/me' && $method === 'GET':
        respond(['user' => current_user($pdo)]);
        break;
    case $path === '/api/studies' && $method === 'GET':
        handle_studies();
        break;
    case preg_match('#^/api/studies/([^/]+)$#', $path, $matches):
        handle_study_detail($matches[1]);
        break;
    case $path === '/api/progress':
        $user = require_auth($pdo);
        handle_progress($pdo, $user);
        break;
    case $path === '/api/notes':
        $user = require_auth($pdo);
        handle_notes_collection($pdo, $user);
        break;
    case preg_match('#^/api/notes/(\d+)$#', $path, $matches):
        $user = require_auth($pdo);
        handle_note_item($pdo, $user, (int) $matches[1]);
        break;
    case $path === '/api/bookmarks':
        $user = require_auth($pdo);
        handle_bookmarks($pdo, $user);
        break;
    case preg_match('#^/api/bookmarks/(\d+)$#', $path, $matches):
        $user = require_auth($pdo);
        handle_bookmark_item($pdo, $user, (int) $matches[1]);
        break;
    default:
        respond(['error' => 'Not found'], 404);
}
