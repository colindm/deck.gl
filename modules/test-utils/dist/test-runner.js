// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global window, console, setTimeout */
/* eslint-disable no-console */
import { Deck, MapView } from '@deck.gl/core';
const DEFAULT_DECK_PROPS = {
    ...Deck.defaultProps,
    id: 'deckgl-render-test',
    width: 800,
    height: 450,
    style: { position: 'absolute', left: '0px', top: '0px' },
    views: [new MapView({})],
    useDevicePixels: false,
    debug: true
};
const DEFAULT_TEST_OPTIONS = {
    // test lifecycle callback
    onTestStart: testCase => console.log(`# ${testCase.name}`),
    onTestPass: testCase => console.log(`ok ${testCase.name} passed`),
    onTestFail: testCase => console.log(`not ok ${testCase.name} failed`),
    // milliseconds to wait for each test case before aborting
    timeout: 2000
};
export class TestRunner {
    /**
     * props
     *   Deck props
     */
    constructor(props = {}, options) {
        this.deck = null;
        this.isRunning = false;
        this._testCases = [];
        this._currentTestCase = null;
        this._testCaseData = null;
        this.props = { ...DEFAULT_DECK_PROPS, ...props };
        // @ts-ignore browserTestDriver_isHeadless is injected by @probe.gl/test-utils if running in headless browser
        this.isHeadless = Boolean(window.browserTestDriver_isHeadless);
        this.testOptions = { ...DEFAULT_TEST_OPTIONS, ...options };
    }
    get defaultTestCase() {
        throw new Error('Not implemented');
    }
    /**
     * Add testCase(s)
     */
    add(testCases) {
        if (!Array.isArray(testCases)) {
            testCases = [testCases];
        }
        for (const testCase of testCases) {
            this._testCases.push(testCase);
        }
        return this;
    }
    /**
     * Returns a promise that resolves when all the test cases are done
     */
    run(options = {}) {
        Object.assign(this.testOptions, options);
        return new Promise((resolve, reject) => {
            this.deck = new Deck({
                ...this.props,
                onDeviceInitialized: this._onDeviceInitialized.bind(this),
                onLoad: resolve
            });
            this.isRunning = true;
            this._currentTestCase = null;
        })
            .then(() => {
            let promise = Promise.resolve();
            // chain test case promises
            this._testCases.forEach(testCase => {
                promise = promise.then(() => this._runTest(testCase));
            });
            return promise;
        })
            .catch((error) => {
            this.fail({ error: error.message });
        })
            .finally(() => {
            this.deck.finalize();
            this.deck = null;
        });
    }
    /* Lifecycle methods for subclassing */
    initTestCase(testCase) {
        for (const key in this.defaultTestCase) {
            if (!(key in testCase)) {
                testCase[key] = this.defaultTestCase[key];
            }
        }
        this.testOptions.onTestStart(testCase);
    }
    /* Utilities */
    pass(result) {
        this.testOptions.onTestPass(this._currentTestCase, result);
    }
    fail(result) {
        this.testOptions.onTestFail(this._currentTestCase, result);
    }
    /* Private Methods */
    _onDeviceInitialized(device) {
        this.gpuVendor = device.info.vendor;
    }
    async _runTest(testCase) {
        this._currentTestCase = testCase;
        // normalize test case
        this.initTestCase(testCase);
        const timeout = testCase.timeout || this.testOptions.timeout;
        const task = this.runTestCase(testCase);
        const timeoutTask = new Promise((_, reject) => {
            setTimeout(() => {
                reject('Timeout');
            }, timeout);
        });
        try {
            await Promise.race([task, timeoutTask]);
            await this.assert(testCase);
        }
        catch (err) {
            if (err === 'Timeout') {
                this.fail({ error: 'Timeout' });
            }
        }
    }
}
//# sourceMappingURL=test-runner.js.map