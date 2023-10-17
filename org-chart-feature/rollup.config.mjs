// rollup.config.js
import { autoReload } from "rollup-plugin-auto-reload"
import typescript from "@rollup/plugin-typescript";
import scss from "rollup-plugin-scss";
import eslint from "@rollup/plugin-eslint";
import html, { makeHtmlAttributes } from '@rollup/plugin-html';
import fsPromises from 'fs/promises'
import dotenv from "rollup-plugin-dotenv"

import path from 'path';
import copy from 'rollup-plugin-copy'
import 'dotenv/config'
import nodeResolve from "@rollup/plugin-node-resolve";
import dev from 'rollup-plugin-dev'
import ALL_CONSTS, { CLASS_PREFIX } from './src/constants.mjs';


const OUTPUT_FN_DEV = `${CLASS_PREFIX}.js`;
const OUTPUT_FN_PROD = `${CLASS_PREFIX}-[hash].js`;
const OUTPUT_FN_ASSETS_DEV = `${CLASS_PREFIX}[extname]`;
const OUTPUT_FN_ASSETS_PROD = `${CLASS_PREFIX}-[hash][extname]`;

/**
 * Helper function to clear all files in a directory.
 */
async function deleteAllFilesInDir(dirPath) {
  try {
    const files = await fsPromises.readdir(dirPath);

    const deleteFilePromises = files.map(file =>
      fsPromises.unlink(path.join(dirPath, file)),
    );

    await Promise.all(deleteFilePromises);
  } catch (err) {
    console.log(err);
  }
}

// /**
//  * Generate css variables from constants.
//  * This is usefull so that we can use the constants in the scss files
//  * for namespacing.
//  * @param {Object} constantMap - Object containing all the constants.
//  * @returns {String} - Array<String> containing all the css variables.
//  */
// function generateScssVarsFromConstants(constantMap) {
//   console.log("ALL CONST", JSON.stringify(ALL_CONSTS, null, 2))
//   const entries = Object.entries(ALL_CONSTS);

//   if (entries.length) {
//     return entries.map(([key, value]) => {
//       return `$${key}: ${value};`;
//     })
//   }

//   return [];
// } 

export default async (cliArgs) => {
  /**
   * Environment of build.
   * @options dev, prod
   */
  const env = cliArgs.type || "dev";
  const isProd = env === "prod";
  // only generate source maps for development
  const sourceMap = env === 'dev';

  const dir =  isProd ? 'dist' : 'page/dist';

  const assetFileNames = isProd ? OUTPUT_FN_ASSETS_PROD : OUTPUT_FN_ASSETS_DEV;
  const entryFileNames = isProd ? OUTPUT_FN_PROD : OUTPUT_FN_DEV;
  // console.log("This are the consts", CONSTS);

  const build = {
    input: "src/index.ts",
    output: {
      dir, // .js (as well as .d.ts, .js.map, etc.) files will be emitted into this directory.,
      format: "esm",
      assetFileNames,
      entryFileNames,
      sourcemap: sourceMap,
    },
    plugins: [
      // load environment variables
      dotenv(),
      // lint source files
      eslint({
        // ignore warnings in development
        throwOnWarning: isProd,
      }),
      // resolve modules from node_modules
      nodeResolve(),
      // compile scss to css
      scss({
        /**
         * Source maps for css are currently broken.
         * This needs to be fixed in the future.
         */
        sourceMap,
        /**
         * Temporary fix for source maps so it points to the correct asset.
         */
        fileName: "cso-org-chart-feature.css",
        watch: "src/assets/*.scss",
        processor: (css, map) => {
          const entries = Object.entries(ALL_CONSTS);
          let _css = css;

          if (entries.length) {
            entries.forEach(([key, value]) => {
                _css = _css.replaceAll(`__${key}__`, value, 'g');
              });
          }

          return {
            css: _css,
            map
          }
        }
      }),
      // compile typescript to javascript
      typescript({
        // source maps only for development
        sourceMap,
        inlineSourceMap: sourceMap,
        inlineSources: sourceMap,
      }),
      ...(
        isProd ? [] : [
          // generate html file from template.html and inject js and css
          html({
            hook: 'closeBundle',
            publicPath: "dist/",
            template:
             async ({
            //  ({
              attributes,
              files,
              meta,
              publicPath,
              title
            }) => {
              const scripts = (files.js || [])
                .map(({ fileName }) => {
                  const attrs = makeHtmlAttributes(attributes.script);
                  return `<script src="${publicPath}${fileName}"${attrs}></script>`;
                })
                .join('\n');
            
              const links = (files.css || [])
                .map(({ fileName }) => {
                  const attrs = makeHtmlAttributes(attributes.link);
                  return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
                })
                .join('\n');
            
              const metas = meta
                .map((input) => {
                  const attrs = makeHtmlAttributes(input);
                  return `<meta${attrs}>`;
                })
                .join('\n');

                return fsPromises.readFile('page/template.html', 'utf8').then((template) => {
                  template = template.replace('<!-- ${rollup_scripts} -->', scripts);
                  template = template.replace('<!-- ${rollup_metas} -->', metas);
                  template = template.replace('<!-- ${rollup_links} -->', links);
                  template = template.replace('<!-- ${rollup_title} -->', title);

                  return template;
                })
            }
          }),
          // copy index.html from dist directory
          copy({
                hook: 'writeBundle',
            targets: [
              { src: './page/dist/index.html', dest: './page/',
                verbose: true,
             },
            ]
          }),
          // start a dev server to avoid CORS issues
          dev({
            dirs: ["page"],
            port: 3000,
            spa: false,
            host: "localhost",
          }),
          // auto reload the browser when files change
          autoReload({
            port: 3000
          })
        ]
      ),
    ],
  };


  /**
   * Clear all files in the dist directory before rollup executes.
   */
  return deleteAllFilesInDir('./page/dist').then(() => {
    return build;
  });
};


