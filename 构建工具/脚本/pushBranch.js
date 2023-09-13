function pusBranch() {
  try {
    execSync(`git add . && git commit -m 'release project' && git push`);
  } catch (e) {
    console.log(e);
  }
}


try {
  process.execSync(`cd static/${repoName} &&
    git init . &&
    git remote add coco ${repoUrl} &&
    git add . &&  
    git commit -m "Initial commit" &&
    git push -u coco ${branch || 'master'}:${env || 'master'} --force
  `);
} catch(e) {
  console.log(e)
  throw new Error(e);
} finally {
  // 清空对应结果目录。
  process.exec(`cd static && rm -rf ${repoName}`);
}