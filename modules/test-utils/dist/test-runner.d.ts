import { Deck, DeckProps } from '@deck.gl/core';
export type TestCase = {
    name: string;
    /** milliseconds to wait before aborting */
    timeout?: number;
};
type TestOptions<TestCaseT extends TestCase, ResultT> = {
    /** Called when a test case starts */
    onTestStart: (testCase: TestCaseT) => void;
    /** Called when a test case passes */
    onTestPass: (testCase: TestCaseT, result: ResultT) => void;
    /** Called when a test case fails */
    onTestFail: (testCase: TestCaseT, result: ResultT | {
        error: string;
    }) => void;
    /** milliseconds to wait for each test case before aborting */
    timeout: number;
};
export declare abstract class TestRunner<TestCaseT extends TestCase, ResultT, ExtraOptions = {}> {
    deck: Deck<any> | null;
    props: DeckProps<any>;
    isHeadless: boolean;
    isRunning: boolean;
    testOptions: TestOptions<TestCaseT, ResultT> & ExtraOptions;
    gpuVendor?: string;
    private _testCases;
    private _currentTestCase;
    private _testCaseData;
    /**
     * props
     *   Deck props
     */
    constructor(props: DeckProps | undefined, options: ExtraOptions);
    get defaultTestCase(): TestCaseT;
    /**
     * Add testCase(s)
     */
    add(testCases: TestCaseT[]): this;
    /**
     * Returns a promise that resolves when all the test cases are done
     */
    run(options?: Partial<TestOptions<TestCaseT, ResultT> & ExtraOptions>): Promise<void>;
    initTestCase(testCase: TestCaseT): void;
    /** Execute the test case. Fails if takes longer than options.timeout */
    abstract runTestCase(testCase: TestCaseT): Promise<void>;
    /** Check the result of the test case. Calls pass() or fail() */
    abstract assert(testCase: TestCaseT): Promise<void>;
    protected pass(result: ResultT): void;
    protected fail(result: ResultT | {
        error: string;
    }): void;
    private _onDeviceInitialized;
    private _runTest;
}
export {};
//# sourceMappingURL=test-runner.d.ts.map