import {build} from 'esbuild';

const buildOptions = {
  entryPoints: ['./index.js'],
  outfile: './dist/index.js',
  bundle: true,
  minify: true,
};

build(buildOptions);