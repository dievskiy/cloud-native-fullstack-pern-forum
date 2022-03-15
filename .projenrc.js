const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  license: 'MIT',
  copyrightOwner: 'Ruslan Potekhin',
  cdkVersion: '2.1.0',
  devDeps: ['prettier'],
  defaultReleaseBranch: 'master',
  name: 'pern-fullstack-cloud-native',
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  depsUpgradeAutoMerge: true,
  autoApproveOptions: {
    allowedUsernames: ['dievskiy'],
  },
  gitignore: ['.env*', '!.env.example', '!.env.test', '!frontend/.env', '.DS_Store'],
  eslint: true,
  eslintOptions: {
    prettier: true,
  },
  jest: false,
});
project.synth();
