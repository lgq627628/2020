async function upVersion() {
  const pkg = resolveJson(rootPath);
  // master 版本号自增
  const v = pkg.version.split('.');
  v[2] = Number(v[2]) < 10 ? Number(v[2]) + 1 : 0;
  v[1] = v[2] === 0 ? Number(v[1]) + 1 : Number(v[1]);
  v[1] = v[1] < 10 ? Number(v[1]) : 0;
  v[0] = v[1] === 0 ? Number(v[0]) + 1 : v[0];
  pkg.version = v.join('.');
  await writeFileTree(rootPath, {
    'package.json': JSON.stringify(pkg, null, 2)
  });
}