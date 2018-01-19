import rollup from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const inputOptions = {
    input: 'pages/hello.html.mjs',
    plugins: [
        resolve(),
        commonjs(),
    ],
};

const outputOptions = {
    format: 'iife',
    name: 'MyBundle',
    file: './dist/bundle.js',
};

build();

async function build() {
    const bundle = await rollup.rollup(inputOptions);

    await bundle.write(outputOptions);
    /*
    const output = await bundle.generate(outputOptions);
    console.log(output.code);
    */
}
