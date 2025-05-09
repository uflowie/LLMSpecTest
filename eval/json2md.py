#!/usr/bin/env python3
import json
import sys
from pathlib import Path
from collections import defaultdict

def status_to_emoji(status):
    if status in ('passed', 'expected'):
        return '✅'
    if status == 'failed':
        return '❌'
    return '⚠️'

def walk_suites(suites, rows, projects):
    for suite in suites:
        # Process specs (leaf tests)
        for spec in suite.get('specs', []):
            title = spec.get('title', '')
            for test_run in spec.get('tests', []):
                proj = test_run.get('projectName', '')
                projects.add(proj)
                results = test_run.get('results', [])
                if not results:
                    continue
                last_run = results[-1]
                status = last_run.get('status', '') or test_run.get('status', '')
                rows[title][proj] = status_to_emoji(status)
        # Recurse into nested suites
        walk_suites(suite.get('suites', []), rows, projects)

def build_markdown(rows, projects):
    projects = sorted(projects)
    header = "| Test case | " + " | ".join(projects) + " |\n"
    sep    = "|---" * (len(projects) + 1) + "|\n"

    lines = [header, sep]
    for title, results in sorted(rows.items()):
        cells = [results.get(p, '') for p in projects]
        lines.append(f"| {title} | " + " | ".join(cells) + " |\n")
    return ''.join(lines)

def main(json_path, md_path):
    path = Path(json_path)
    if not path.exists():
        print(f"Error: input file '{json_path}' not found.")
        sys.exit(1)
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        sys.exit(1)

    rows = defaultdict(dict)
    projects = set()
    walk_suites(data.get('suites', []), rows, projects)

    # Split projects by framework and generate separate tables
    framework_models = defaultdict(set)
    for proj in projects:
        parts = proj.rsplit('-', 1)
        if len(parts) == 2:
            model, framework = parts
            framework_models[framework].add(model)
    md_lines = []
    for framework in sorted(framework_models):
        md_lines.append(f"## {framework.capitalize()} Tests\n\n")
        models = sorted(framework_models[framework])
        header = "| Test case | " + " | ".join(models) + " |\n"
        sep    = "|---" * (len(models) + 1) + "|\n"
        md_lines.append(header)
        md_lines.append(sep)
        for title, results in sorted(rows.items()):
            cells = [results.get(f"{model}-{framework}", '') for model in models]
            md_lines.append(f"| {title} | " + " | ".join(cells) + " |\n")
        md_lines.append("\n")
    md = ''.join(md_lines)
    Path(md_path).write_text(md, encoding='utf-8')
    print(f"Wrote {md_path}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('usage: python json2md.py <input.json> <output.md>')
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
