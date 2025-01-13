#!/usr/bin/env node

require('dotenv/config');

const { $ } = require('zx');
const { resolve, relative } = require('path');
const next = require('next/dist/build').default;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
    .command('build', 'build static html', (yargs) => {
        return yargs
            .positional('in', {
                describe: 'source directory of the docs',
            })
            .positional('out', {
                describe: 'output directory of the docs',
            })
            .positional('mode', {
                describe: 'compile mode divided by ","',
            })
            .positional('base', {
                describe: 'base path',
            });
    }, async (argv) => {
        process.env.IS_STATIC = true;
        process.env.DOCS = resolve(argv.in || process.env.DOCS || "./");
        process.env.MODE = argv.mode || process.env.MODE;
        process.env.BASE = argv.base || process.env.BASE;

        await next(
            resolve(__dirname),
            false,
            false,
            true,
            false,
            false,
            false,
            'default',
        );

        const output = resolve(argv.out || process.env.OUTPUT || './build');

        await $`rm -rf ${output}`;
        await $`mv ${resolve(__dirname, 'out')} ${output}`;
    })
    .strict()
    .help('h')
    .parse();