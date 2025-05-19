import * as fs from 'fs';
import * as path from 'path';
import {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult,
    FullResult,
} from '@playwright/test/reporter';

class MarkdownReporter implements Reporter {
    private options: { outputFile?: string };
    private outputFile: string;
    private _rows: Map<string, Map<string, string>>; // test_title -> { project_name: emoji }
    private _config!: FullConfig; // Initialized in onBegin

    constructor(options: { outputFile?: string } = {}) {
        this.options = options;
        this.outputFile = this.options.outputFile || 'playwright-report.md';
        this._rows = new Map<string, Map<string, string>>();
    }

    private _statusToEmoji(status: TestResult['status']): string {
        if (status === 'passed') {
            return '✅';
        }
        if (status === 'failed' || status === 'timedOut') {
            return '❌';
        }
        // Covers 'timedOut', 'skipped', 'interrupted'
        return '⚠️';
    }

    onBegin(config: FullConfig, suite: Suite): void {
        this._config = config;
        // The `suite` parameter (root suite) is not used in this reporter's logic.
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const title = test.title;
        let resolvedProjectName: string | undefined;

        // Find the project name by traversing up the suite hierarchy from the test's parent suite
        let currentSuite: Suite | undefined = test.parent;
        while (currentSuite) {
            const project = currentSuite.project();
            if (project) {
                resolvedProjectName = project.name;
                break;
            }
            currentSuite = currentSuite.parent;
        }

        const projectName = resolvedProjectName || "unknown_project";

        if (projectName === "unknown_project" && resolvedProjectName === undefined) {
             console.warn(
                `Warning: Project name could not be determined for test '${title}'. ` +
                `This test will be listed under "unknown_project". Check suite structure.`
            );
        }

        let projectMap = this._rows.get(title);
        if (!projectMap) {
            projectMap = new Map<string, string>();
            this._rows.set(title, projectMap);
        }
        projectMap.set(projectName, this._statusToEmoji(result.status));
    }

    async onEnd(result: FullResult): Promise<void> { // result parameter (FullResult) is not used here
        const mdLines: string[] = [];

        // Step 1: Identify all unique project names from the collected test results.
        const allProjectNamesFound = new Set<string>();
        for (const titleResults of this._rows.values()) {
            for (const projName of titleResults.keys()) {
                allProjectNamesFound.add(projName);
            }
        }

        // Step 2: Parse project names to define frameworks and their associated models.
        // frameworkDefinitions stores { framework_name: Set<model_name> }
        const frameworkDefinitions = new Map<string, Set<string>>();
        for (const projName of allProjectNamesFound) {
            if (projName === "unknown_project") {
                console.info(
                    `Info: Some tests were associated with '${projName}'. ` +
                    "This might indicate an issue with project name resolution or the project is literally named 'unknown_project'. " +
                    `If '${projName}' is a literal project name, it will be processed like any other.`
                );
            }

            // Equivalent of Python's rsplit('-', 1)
            // This regex captures (everything before the last hyphen)-(everything after the last hyphen)
            const match = projName.match(/^(.*)-([^-]+)$/);
            if (match) {
                const model = match[1];      // Part before the last hyphen
                const framework = match[2];  // Part after the last hyphen

                let models = frameworkDefinitions.get(framework);
                if (!models) {
                    models = new Set<string>();
                    frameworkDefinitions.set(framework, models);
                }
                models.add(model);
            }
            // Projects not matching "name-name" (e.g., "singlenameproject")
            // will not contribute to frameworkDefinitions.
        }

        if (frameworkDefinitions.size === 0 && allProjectNamesFound.size > 0) {
            console.info(
                "Info: No project names found matching the 'model-framework' naming convention (e.g., 'chrome-desktop'). " +
                "As a result, no Markdown tables will be generated based on that structure."
            );
        }

        // Step 3: Generate Markdown tables for each identified framework.
        const sortedFrameworkNames = Array.from(frameworkDefinitions.keys()).sort();

        for (const frameworkName of sortedFrameworkNames) {
            const modelsSet = frameworkDefinitions.get(frameworkName);
            if (!modelsSet) continue;

            const sortedModelsForFramework = Array.from(modelsSet).sort();

            mdLines.push(`## ${frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1)} Tests\n\n`);

            const header = `| Test case | ${sortedModelsForFramework.join(" | ")} |\n`;
            const separator = `|---${"|---".repeat(sortedModelsForFramework.length)}|\n`;

            mdLines.push(header);
            mdLines.push(separator);

            const sortedTestTitles = Array.from(this._rows.keys()).sort();

            for (const title of sortedTestTitles) {
                const projectEmojisForTitle = this._rows.get(title);
                if (!projectEmojisForTitle) continue;

                const cells: string[] = [];
                for (const modelName of sortedModelsForFramework) {
                    const fullProjectNameToLookup = `${modelName}-${frameworkName}`;
                    const emoji = projectEmojisForTitle.get(fullProjectNameToLookup) || '';
                    cells.push(emoji);
                }
                mdLines.push(`| ${title} | ${cells.join(" | ")} |\n`);
            }
            mdLines.push("\n"); // Blank line after each table
        }

        const mdContent = mdLines.join("");

        // Step 4: Write the generated Markdown content to the specified output file.
        const absoluteOutputFile = path.resolve(this.outputFile);
        try {
            const outputDir = path.dirname(absoluteOutputFile);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            fs.writeFileSync(absoluteOutputFile, mdContent, { encoding: 'utf-8' });
            console.log(`Markdown report successfully generated: ${absoluteOutputFile}`);
        } catch (error) {
            console.error(`Error: Failed to write Markdown report to ${absoluteOutputFile}. Reason: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    printsToStdio(): boolean {
        // This reporter's primary output is a file.
        // Returning false allows other reporters (like 'list') or Playwright's default summary to print to stdio.
        return false;
    }
}

export default MarkdownReporter;