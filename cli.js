#!/usr/bin/env node

require('dotenv/config');

const { $ } = require('zx');
const { resolve, relative } = require('path');
const next = require('next/dist/build').default;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');

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
            })
            .positional('ssr', {
                describe: 'enable ssr mode',
            })
            .positional('presearch', {
                describe: 'preload search indexes',
            });
    }, async (argv) => {
        if (argv.ssr) {
            process.env.IS_STANDALONE = '1';
        } else {
            process.env.IS_STATIC = '1';
            process.env.DIST_FOLDER = relative(__dirname, resolve(argv.out || process.env.OUTPUT || './build'));
        }
        process.env.DOCS = resolve(argv.in || process.env.DOCS || "./");
        process.env.MODE = argv.mode || process.env.MODE;
        process.env.BASE = argv.base || process.env.BASE || '';
        process.env.PRELOAD_SEARCH_INDEXES = argv.presearch || process.env.PRELOAD_SEARCH_INDEXES;

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

        if (argv.ssr) {
            $`cp -r ${resolve(__dirname, '.next/static')} ${resolve(__dirname, '.next/standalone/.next/')}`;
        }
    })
    .command('init', 'init docs', (yargs) => {
        return yargs
            .positional('in', {
                describe: 'source directory of the docs',
            })
            .positional('type', {
                describe: 'project type',
                default: 'simple'
            });
    }, async (argv) => {
        const dir = resolve(argv.in || process.env.DOCS || "./");

        const { initProject } = require('./tmp');
        await initProject(dir, argv.type);
    })
    .command('start', 'start builded standalone', (yargs) => {
        return yargs;
    }, async (argv) => {
        require(resolve(__dirname, '.next/standalone/server.js'));
    })
    .strict()
    .help('h')
    .parse();
