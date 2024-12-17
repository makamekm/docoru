#!/usr/bin/env node

require('dotenv/config');

const { $ } = require('zx');
const { resolve, relative } = require('path');
const next = require('next/dist/build').default;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
    .command('build [in]', 'source in', (yargs) => {
        return yargs
            .positional('in', {
                describe: 'source directory of the docs',
            })
            .positional('out', {
                describe: 'output directory of the docs',
            });
    }, async (argv) => {
        process.env.IS_STATIC = true;
        process.env.DOCS = resolve(argv.in || process.env.DOCS || "./");

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