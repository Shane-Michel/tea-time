<?php
declare(strict_types=1);

putenv('APP_TESTING=1');
putenv('DATABASE_PATH=' . sys_get_temp_dir() . '/tea-time-unit.sqlite');
@unlink(getenv('DATABASE_PATH'));

require __DIR__ . '/../bootstrap.php';

function assert_true(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "Assertion failed: {$message}\n");
        exit(1);
    }
}

$reference = parse_reference('John 3:16-17');
assert_true($reference['book'] === 'John', 'book should be parsed');
assert_true($reference['chapter'] === 3 && $reference['verse'] === 16 && $reference['end'] === 17, 'chapter, verse, and end parsed');

$expanded = expand_reference('Psalm 23:1-3');
assert_true(count($expanded) === 3, 'expand_reference should include each verse in range');
assert_true($expanded[0] === ['Psalm', 23, 1] && $expanded[2] === ['Psalm', 23, 3], 'expand_reference maintains order');

$studyPlans = load_studies();
assert_true(count($studyPlans) >= 1, 'studies should load from JSON seed');

fwrite(STDOUT, "PHP unit tests passed.\n");
