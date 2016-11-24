var fs = require('fs')
var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var externalDep = Object.keys(pkg.dependencies);
console.log('externals', externalDep);
export default [{
    entry: 'src/chirimoya.js',
    dest: pkg['main'],
    moduleName: 'chirimoya',
    format:'umd',
    sourceMap: false,//TODO change later to 'inline'
    external: externalDep
}];