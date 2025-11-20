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

function handle_bible_lookup(PDO $pdo): void
{
    $reference = trim($_GET['reference'] ?? '');
    $book = $_GET['book'] ?? null;
    $chapter = isset($_GET['chapter']) ? (int) $_GET['chapter'] : null;
    $verse = isset($_GET['verse']) ? (int) $_GET['verse'] : null;

    if ($reference !== '') {
        $parsed = parse_reference($reference);
        if (!$parsed || !$parsed['verse']) {
            respond(['error' => 'reference must include book, chapter, and verse'], 422);
        }
        $book = $parsed['book'];
        $chapter = $parsed['chapter'];
        $verse = $parsed['verse'];
    }

    if (!$book || !$chapter || !$verse) {
        respond(['error' => 'reference, or book + chapter + verse are required'], 422);
    }

    $stmt = $pdo->prepare('SELECT id, book, chapter, verse, text, testament FROM bible WHERE book = ? AND chapter = ? AND verse = ?');
    $stmt->execute([$book, $chapter, $verse]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        respond(['error' => 'Verse not found'], 404);
    }

    $contextStart = max(1, $verse - 2);
    $contextEnd = $verse + 2;
    $contextStmt = $pdo->prepare('SELECT verse, text FROM bible WHERE book = ? AND chapter = ? AND verse BETWEEN ? AND ? ORDER BY verse');
    $contextStmt->execute([$book, $chapter, $contextStart, $contextEnd]);
    $context = $contextStmt->fetchAll(PDO::FETCH_ASSOC);

    $topicsStmt = $pdo->prepare('SELECT t.slug, t.title FROM topic_passages tp JOIN topics t ON t.id = tp.topic_id WHERE tp.bible_id = ?');
    $topicsStmt->execute([$row['id']]);
    $topics = $topicsStmt->fetchAll(PDO::FETCH_ASSOC);

    respond(['verse' => $row, 'context' => $context, 'topics' => $topics]);
}

function handle_bible_search(PDO $pdo): void
{
    $query = trim($_GET['q'] ?? '');
    if ($query === '') {
        respond(['error' => 'q is required'], 422);
    }

    $testament = $_GET['testament'] ?? null;
    $book = $_GET['book'] ?? null;
    $topicSlug = $_GET['topic'] ?? null;
    $focus = $_GET['filter'] ?? null;

    $sql = 'SELECT b.id, b.book, b.chapter, b.verse, b.text, b.testament, snippet(bible_fts, -1, "<mark>", "</mark>", " … ", 8) AS snippet
        FROM bible_fts
        JOIN bible b ON b.id = bible_fts.rowid';
    $conditions = ['bible_fts MATCH :query'];
    $params = [':query' => $query];

    if ($topicSlug || $focus) {
        $sql .= ' JOIN topic_passages tp ON tp.bible_id = b.id JOIN topics t ON t.id = tp.topic_id';
    }
    if ($testament) {
        $conditions[] = 'b.testament = :testament';
        $params[':testament'] = $testament;
    }
    if ($book) {
        $conditions[] = 'b.book = :book';
        $params[':book'] = $book;
    }
    if ($topicSlug) {
        $conditions[] = 't.slug = :topic';
        $params[':topic'] = $topicSlug;
    }
    if ($focus) {
        $conditions[] = 't.filters LIKE :focus';
        $params[':focus'] = '%' . $focus . '%';
    }

    $sql .= ' WHERE ' . implode(' AND ', $conditions) . ' ORDER BY b.book, b.chapter, b.verse LIMIT 50';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    respond(['results' => $results]);
}

function handle_topics(PDO $pdo): void
{
    $filter = $_GET['filter'] ?? null;
    $search = trim($_GET['q'] ?? '');

    $sql = 'SELECT id, slug, title, summary, filters FROM topics';
    $conditions = [];
    $params = [];
    if ($filter) {
        $conditions[] = 'filters LIKE :filter';
        $params[':filter'] = '%' . $filter . '%';
    }
    if ($search !== '') {
        $conditions[] = '(title LIKE :search OR summary LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    if ($conditions) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY title';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $topics = array_map(function ($topic) {
        $topic['filters'] = $topic['filters'] ? json_decode((string) $topic['filters'], true) : [];
        return $topic;
    }, $topics);

    respond(['topics' => $topics]);
}

function handle_client_log(): void
{
    $payload = json_body();
    $message = trim($payload['message'] ?? '');
    $details = $payload['details'] ?? [];

    if ($message === '') {
        respond(['error' => 'message is required'], 422);
    }

    app_log('client', $message, [
        'details' => is_array($details) ? $details : ['value' => $details],
        'user_id' => $_SESSION['user_id'] ?? null,
    ]);

    respond(['success' => true], 201);
}

function handle_topic_detail(PDO $pdo, string $slug): void
{
    $stmt = $pdo->prepare('SELECT id, slug, title, summary, filters FROM topics WHERE slug = ?');
    $stmt->execute([$slug]);
    $topic = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$topic) {
        respond(['error' => 'Topic not found'], 404);
    }
    $topic['filters'] = $topic['filters'] ? json_decode((string) $topic['filters'], true) : [];

    $passages = $pdo->prepare('SELECT b.book, b.chapter, b.verse, b.text, b.testament
        FROM topic_passages tp
        JOIN bible b ON b.id = tp.bible_id
        WHERE tp.topic_id = ?
        ORDER BY b.book, b.chapter, b.verse');
    $passages->execute([(int) $topic['id']]);

    respond(['topic' => $topic, 'passages' => $passages->fetchAll(PDO::FETCH_ASSOC)]);
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
    case $path === '/api/bible/lookup' && $method === 'GET':
        handle_bible_lookup($pdo);
        break;
    case $path === '/api/bible/search' && $method === 'GET':
        handle_bible_search($pdo);
        break;
    case $path === '/api/topics' && $method === 'GET':
        handle_topics($pdo);
        break;
    case preg_match('#^/api/topics/([^/]+)$#', $path, $matches) && $method === 'GET':
        handle_topic_detail($pdo, $matches[1]);
        break;
    case $path === '/api/logs' && $method === 'POST':
        handle_client_log();
        break;
    default:
        respond(['error' => 'Not found'], 404);
}
