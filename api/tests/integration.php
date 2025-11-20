<?php
declare(strict_types=1);

$testDb = sys_get_temp_dir() . '/tea-time-integration.sqlite';
@unlink($testDb);

$projectRoot = dirname(__DIR__, 2);
$port = 8123;
$baseUrl = 'http://127.0.0.1:' . $port;
$env = [
    'DATABASE_PATH' => $testDb,
];

$cmd = sprintf(
    '%s -S 127.0.0.1:%d -t %s %s',
    escapeshellarg(PHP_BINARY),
    $port,
    escapeshellarg($projectRoot . '/api'),
    escapeshellarg($projectRoot . '/api/index.php')
);
$descriptorspec = [
    0 => ['pipe', 'r'],
    1 => ['file', sys_get_temp_dir() . '/tea-time-server.log', 'w'],
    2 => ['file', sys_get_temp_dir() . '/tea-time-server-error.log', 'w'],
];
$process = proc_open($cmd, $descriptorspec, $pipes, $projectRoot, $env);
if (!is_resource($process)) {
    fwrite(STDERR, "Unable to start PHP built-in server.\n");
    exit(1);
}

register_shutdown_function(function () use ($process) {
    if (is_resource($process)) {
        proc_terminate($process);
        proc_close($process);
    }
});

$ready = false;
for ($i = 0; $i < 20; $i++) {
    $fp = @fsockopen('127.0.0.1', $port);
    if ($fp) {
        fclose($fp);
        $ready = true;
        break;
    }
    usleep(100000);
}

if (!$ready) {
    fwrite(STDERR, "Server failed to start.\n");
    exit(1);
}

function request(string $method, string $path, ?array $payload = null, array &$cookies = []): array
{
    global $baseUrl;

    $headers = ['Content-Type: application/json'];
    if ($cookies) {
        $cookieHeader = [];
        foreach ($cookies as $name => $value) {
            $cookieHeader[] = $name . '=' . $value;
        }
        $headers[] = 'Cookie: ' . implode('; ', $cookieHeader);
    }

    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $payload ? json_encode($payload) : null,
            'ignore_errors' => true,
        ],
    ]);

    $body = file_get_contents($baseUrl . $path, false, $context);
    $status = 0;
    $responseHeaders = $http_response_header ?? [];

    foreach ($responseHeaders as $header) {
        if (preg_match('#^HTTP/.*\s(\d{3})#', $header, $matches)) {
            $status = (int) $matches[1];
        }
        if (stripos($header, 'Set-Cookie:') === 0) {
            $cookiePair = explode(';', trim(substr($header, strlen('Set-Cookie: '))));
            [$key, $value] = array_pad(explode('=', $cookiePair[0], 2), 2, '');
            if ($key !== '') {
                $cookies[$key] = $value;
            }
        }
    }

    $json = json_decode($body ?: '', true);
    return [$status, is_array($json) ? $json : []];
}

function assert_status(int $expected, int $actual, string $message): void
{
    if ($expected !== $actual) {
        fwrite(STDERR, "Expected status {$expected} but received {$actual}: {$message}\n");
        exit(1);
    }
}

function assert_truthy($value, string $message, $context = null): void
{
    if (empty($value)) {
        fwrite(STDERR, "Assertion failed: {$message}\n");
        if ($context !== null) {
            fwrite(STDERR, json_encode($context, JSON_PRETTY_PRINT) . "\n");
        }
        exit(1);
    }
}

$cookies = [];
[$status, $data] = request('POST', '/api/auth/register', [
    'name' => 'Tester',
    'email' => 'tester@example.com',
    'password' => 'secret123',
], $cookies);
assert_status(200, $status, 'register should succeed');
assert_truthy($data['user']['id'] ?? null, 'register should return user');
assert_truthy(isset($cookies['PHPSESSID']), 'session cookie captured after registration', $cookies);

[$status, $data] = request('GET', '/api/auth/me', null, $cookies);
assert_status(200, $status, 'auth me should be ok');
assert_truthy($data['user']['email'] === 'tester@example.com', 'auth me returns same user');

[$status, $data] = request('GET', '/api/studies', null, $cookies);
assert_status(200, $status, 'studies endpoint reachable');
assert_truthy(count($data['studies'] ?? []) > 0, 'studies returned');

[$status, $data] = request('POST', '/api/notes', [
    'content' => 'Integration note',
    'study_id' => 'matthew',
    'reference' => 'Matthew 5:9',
], $cookies);
assert_status(201, $status, 'note created');
$noteId = $data['note']['id'] ?? null;
assert_truthy($noteId, 'note id returned');
assert_truthy(isset($cookies['PHPSESSID']), 'session cookie preserved through note creation', $cookies);

[$status, $data] = request('GET', '/api/notes', null, $cookies);
assert_status(200, $status, 'notes listed');
assert_truthy(count($data['notes'] ?? []) >= 1, 'notes present for user', ['data' => $data, 'cookies' => $cookies]);

[$status, $data] = request('POST', '/api/progress', [
    'study_id' => 'matthew',
    'day' => 1,
    'completed' => true,
], $cookies);
assert_status(200, $status, 'progress toggle ok');
assert_truthy(in_array(1, $data['days'] ?? [], true), 'progress includes day');

[$status, $data] = request('GET', '/api/bible/lookup?reference=John%203:16', null, $cookies);
assert_status(200, $status, 'bible lookup works');
assert_truthy(($data['verse']['book'] ?? null) === 'John', 'lookup returns verse');

fwrite(STDOUT, "Integration API tests passed.\n");
