# thunar
thunderbird add-ons that provide e-mail achiving tools


## how to use

build `emails-grouper.zip` (the thunderbird add-on) using `make`
```sh
20250112-14:39:17 graffy@graffy-ws2:~/work/thunar.git$ make
echo toto/home/graffy/work/thunar.git && cd emails-grouper && zip -r /home/graffy/work/thunar.git/emails-grouper.zip . --exclude src/\* --exclude node_modules/\*
toto/home/graffy/work/thunar.git
  adding: package-lock.json (deflated 34%)
  adding: popup.html (deflated 50%)
  adding: tsconfig.json (deflated 70%)
  adding: manifest.json (deflated 43%)
  adding: dist/ (stored 0%)
  adding: dist/background.js (deflated 74%)
  adding: dist/popup.js (deflated 64%)
last command status : [0]
```

The load `emails-grouper.zip` as an add-on from thunderbird. This should cause the button `E-mail grouper` to appear on the top right side of thunderbird window, when the main tab of thunderbird is active.

# journal

## 2025-01-12 

```sh
0250112-10:19:51 graffy@graffy-ws2:~/work/graffyworkenv.git/thunderbird/add_ons/emails-grouper$ npx tsc --init

Created a new tsconfig.json with:                                                                                       
                                                                                                                     TS 
  target: es2016
  module: commonjs
  strict: true
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true


You can learn more at https://aka.ms/tsconfig
last command status : [0]
```

```sh
20250112-10:23:52 graffy@graffy-ws2:~/work/graffyworkenv.git/thunderbird/add_ons/emails-grouper$ npm install @types/thunderbird-webext-browser
npm WARN saveError ENOENT: no such file or directory, open '/home/graffy/work/graffyworkenv.git/thunderbird/add_ons/emails-grouper/package.json'
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN enoent ENOENT: no such file or directory, open '/home/graffy/work/graffyworkenv.git/thunderbird/add_ons/emails-grouper/package.json'
npm WARN emails-grouper No description
npm WARN emails-grouper No repository field.
npm WARN emails-grouper No README data
npm WARN emails-grouper No license field.

+ @types/thunderbird-webext-browser@127.0.0
added 1 package from 1 contributor and audited 1 package in 3.407s
found 0 vulnerabilities

last command status : [0]
```
