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

## 2025-02-05

### add the ignore list of email folders

indeed, we see that `guillaume.raffy.work@gmail.com/[Gmail]/All Mail` probably contains `guillaume.raffy.work@gmail.com/Inbox`, looking at its size:
```
5/29168 messages from guillaume.raffy.work@gmail.com/Inbox (thunderbird name = Inbox)
0/23 messages from guillaume.raffy.work@gmail.com/Drafts (thunderbird name = Drafts)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail] (thunderbird name = [Gmail])
0/21 messages from guillaume.raffy.work@gmail.com/[Gmail]/Drafts (thunderbird name = Drafts)
0/5 messages from guillaume.raffy.work@gmail.com/[Gmail]/Spam (thunderbird name = Spam)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Bin (thunderbird name = Bin)
0/17 messages from guillaume.raffy.work@gmail.com/[Gmail]/Corbeille (thunderbird name = Corbeille)
0/10 messages from guillaume.raffy.work@gmail.com/[Gmail]/Starred (thunderbird name = Starred)
0/33 messages from guillaume.raffy.work@gmail.com/doctolib.creneau (thunderbird name = doctolib.creneau)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Bin/Apple Mail To Do (thunderbird name = Apple Mail To Do)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Bin/Farandole (thunderbird name = Farandole)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Bin/Personnel (thunderbird name = Personnel)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Bin/Sent Messages (thunderbird name = Sent Messages)
0/0 messages from guillaume.raffy.work@gmail.com/[Gmail]/Corbeille/exclus (thunderbird name = exclus)
0/1315 messages from guillaume.raffy.work@gmail.com/[Gmail]/Sent Mail (thunderbird name = Sent Mail)
0/1225 messages from guillaume.raffy.work@gmail.com/meltingnotes (thunderbird name = meltingnotes)
0/0 messages from guillaume.raffy.work@gmail.com/Professionnel (thunderbird name = Professionnel)
0/0 messages from guillaume.raffy.work@gmail.com/Reçus (thunderbird name = Reçus)
0/0 messages from guillaume.raffy.work@gmail.com/toto (thunderbird name = toto)
0/0 messages from guillaume.raffy.work@gmail.com/vern3 (thunderbird name = vern3)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_1 (thunderbird name = recherche_locataire_2017_1)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_2 (thunderbird name = recherche_locataire_2017_2)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_3 (thunderbird name = recherche_locataire_2017_3)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_1/proposition_visite (thunderbird name = proposition_visite)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_2/non_retenues (thunderbird name = non_retenues)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_2/proposition_visite (thunderbird name = proposition_visite)
0/0 messages from guillaume.raffy.work@gmail.com/vern3/recherche_locataire_2017_3/proposition_visite (thunderbird name = proposition_visite)
5/42975 messages from guillaume.raffy.work@gmail.com/[Gmail]/All Mail (thunderbird name = All Mail)	
```





So the idea is to have a better understanding of what we see in thunderbird and what we see in gmail for `guillaume.raffy.work@gmail.com`

| thunderbird folder from api MessageFolder.name         | rel_imap_url                                           | tb ui tree                                             | num msg in tb | unread in tb | tba | gmail folder (as seen from tb subscribe UI)            | gmail folder as seen from webmail                             | num msgs in gm | number in gm | gma | comment |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------: | -----------: | --- | :----------------------------------------------------- | ------------------------------------------------------------- | -------------: | -----------: | --- | ------- |
| `/Drafts`                                              | `/Drafts`                                              | `/Drafts`                                              |            23 |           14 | b   | `/Drafts`                                              | `/Labels/[Imap]/Drafts`                                       |                |           14 | b   |         |
| `/Inbox`                                               | `/INBOX`                                               | `/Inbox`                                               |         29168 |        15549 |     | `/INBOX`                                               | `/Inbox`                                                      |          29173 |        15549 | b   |         |
| `/Professionnel`                                       | `/Professionnel`                                       | `/Professionnel`                                       |             0 |              |     | `/Professionnel`                                       | `/Labels/Professionnel`                                       |                |              |     |         |
| `/[Gmail]`                                             |                                                        |                                                        |             0 |              |     | `/[Gmail]` (unsubscribable)                            |                                                               |                |              |     |         |
| `/[Gmail]/All Mail`                                    | `/%5BGmail%5D/All%20Mail`                              | `/All Mail`                                            |         42975 |        17696 |     | `/[Gmail]/All Mail`                                    | `/All Mail`                                                   |          43629 |              |     |         |
| `/[Gmail]/Bin`                                         | `/%5BGmail%5D/Bin`                                     | `/Bin`                                                 |             7 |            3 |     | `/[Gmail]/Bin`                                         | `/Bin`                                                        |              7 |              | b   |         |
| `/[Gmail]/Bin/Apple Mail To Do`                        | `/%5BGmail%5D/Bin/Apple%20Mail%20To%20Do`              | `/Bin/Apple Mail To Do`                                |             0 |              |     | `/[Gmail]/Bin/Apple Mail To Do`                        | `/Labels/[Gmail]/Bin/Apple Mail To Do`                        |                |              |     |         |
| `/[Gmail]/Bin/Farandole`                               | `/%5BGmail%5D/Bin/Farandole`                           | `/Bin/Farandole`                                       |             0 |              |     | `/[Gmail]/Bin/Farandole`                               | `/Labels/[Gmail]/Bin/Farandole`                               |                |              |     |         |
| `/[Gmail]/Bin/Personnel`                               | `/%5BGmail%5D/Bin/Personnel`                           | `/Bin/Personnel`                                       |             0 |              |     | `/[Gmail]/Bin/Personnel`                               | `/Labels/[Gmail]/Bin/Personnel`                               |                |              |     |         |
| `/[Gmail]/Bin/Sent Messages`                           | `/%5BGmail%5D/Bin/Sent%20Messages`                     | `/Bin/Sent Messages`                                   |             0 |              |     | `/[Gmail]/Bin/Sent Messages`                           | `/Labels/[Gmail]/Bin/Sent Messages`                           |                |              |     |         |
| `/[Gmail]/Corbeille`                                   | `/%5BGmail%5D/Corbeille`                               | `/Corbeille`                                           |            17 |           14 | gi  | `/[Gmail]/Corbeille` (unsubscribable)                  |                                                               |                |              |     |         |
| `/[Gmail]/Corbeille/exclus`                            | `/%5BGmail%5D/Corbeille/exclus`                        | `/Corbeille/exclus`                                    |             0 |              |     | `/[Gmail]/Corbeille/exclus`                            | `/Labels/[Gmail]/Corbeille/exclus`                            |                |              |     |         |
| `/[Gmail]/Drafts`                                      | `/%5BGmail%5D/Drafts`                                  | `/Drafts`                                              |            21 |              |     | `/[Gmail]/Drafts`                                      | `/Drafts`                                                     |                |           21 | b   |         |
| `/[Gmail]/Sent Mail`                                   | `/%5BGmail%5D/Sent%20Mail`                             | `/Sent Mail`                                           |          1315 |          148 | b   | `/[Gmail]/Sent Mail`                                   | `/Sent`                                                       |           1315 |              |     |         |
| `/[Gmail]/Spam`                                        | `/%5BGmail%5D/Spam`                                    | `/Spam`                                                |             5 |            2 |     | `/[Gmail]/Spam`                                        | `/Spam`                                                       |              5 |            2 | b   |         |
| `/[Gmail]/Starred`                                     | `/%5BGmail%5D/Starred`                                 | `/Starred`                                             |            10 |            1 | b   | `/[Gmail]/Starred`                                     | `/Starred`                                                    |                |              |     |         |
| `/doctolib.creneau`                                    | `/doctolib.creneau`                                    | `/doctolib.creneau`                                    |            33 |            6 |     | `/doctolib.creneau`                                    | `/Labels/doctolib.creneau`                                    |                |            6 | b   |         |
| `/meltingnotes`                                        | `/meltingnotes`                                        | `/meltingnotes`                                        |          1225 |          116 |     | `/meltingnotes`                                        | `/Labels/meltingnotes`                                        |                |          116 | b   |         |
| `/Reçus`                                               | `/Reçus`                                               | `/Reçus`                                               |             0 |              |     | `/Reçus`                                               | `/Labels/Reçus`                                               |                |              |     |         |
| `/toto`                                                | `/toto`                                                | `/toto`                                                |             0 |              |     | `/toto`                                                | `/Labels/toto`                                                |                |              |     |         |
| `/vern3`                                               | `/vern3`                                               | `/vern3`                                               |             0 |              |     | `/vern3`                                               | `/Labels/vern3`                                               |                |              |     |         |
| `/vern3/recherche_locataire_2017_1`                    | `/vern3/recherche_locataire_2017_1`                    | `/vern3/recherche_locataire_2017_1`                    |             0 |              |     | `/vern3/recherche_locataire_2017_1`                    | `/Labels/vern3/recherche_locataire_2017_1`                    |                |              |     |         |
| `/vern3/recherche_locataire_2017_2`                    | `/vern3/recherche_locataire_2017_2`                    | `/vern3/recherche_locataire_2017_2`                    |             0 |              |     | `/vern3/recherche_locataire_2017_2`                    | `/Labels/vern3/recherche_locataire_2017_2`                    |                |              |     |         |
| `/vern3/recherche_locataire_2017_3`                    | `/vern3/recherche_locataire_2017_3`                    | `/vern3/recherche_locataire_2017_3`                    |             0 |              |     | `/vern3/recherche_locataire_2017_3`                    | `/Labels/vern3/recherche_locataire_2017_3`                    |                |              |     |         |
| `/vern3/recherche_locataire_2017_1/proposition_visite` | `/vern3/recherche_locataire_2017_1/proposition_visite` | `/vern3/recherche_locataire_2017_1/proposition_visite` |             0 |              |     | `/vern3/recherche_locataire_2017_1/proposition_visite` | `/Labels/vern3/recherche_locataire_2017_1/proposition_visite` |                |              |     |         |
| `/vern3/recherche_locataire_2017_2/non_retenues`       | `/vern3/recherche_locataire_2017_2/non_retenues`       | `/vern3/recherche_locataire_2017_2/non_retenues`       |             0 |              |     | `/vern3/recherche_locataire_2017_2/non_retenues`       | `/Labels/vern3/recherche_locataire_2017_2/non_retenues`       |                |              |     |         |
| `/vern3/recherche_locataire_2017_2/proposition_visite` | `/vern3/recherche_locataire_2017_2/proposition_visite` | `/vern3/recherche_locataire_2017_2/proposition_visite` |             0 |              |     | `/vern3/recherche_locataire_2017_2/proposition_visite` | `/Labels/vern3/recherche_locataire_2017_2/proposition_visite` |                |              |     |         |
| `/vern3/recherche_locataire_2017_3/proposition_visite` | `/vern3/recherche_locataire_2017_3/proposition_visite` | `/vern3/recherche_locataire_2017_3/proposition_visite` |             0 |              |     | `/vern3/recherche_locataire_2017_3/proposition_visite` | `/Labels/vern3/recherche_locataire_2017_3/proposition_visite` |                |              |     |         |

rel_imap_url: imap url relative to imap://guillaume.raffy.work%40gmail.com@imap.googlemail.com (as seen in folder location from tb ui)
gma: appearance in gmail
tba: appearance in thunderbird
b: bold
i: italic
g: greyed


the following appear in gmail but not in thunderbird
`/Snoozed`
`/Important`
`/Categories`
`/Categories/Social` 6
`/Categories/Updates` 1983
`/Categories/Forums` 112
`/Categories/Promotions` 812
`/Scheduled`

#### current settings for `guillaume.raffy.work@gmail.com`

in gmail's manage labels interface I have
| System labels | Show in label list | Show in IMAP |
| ------------- | ------------------ | ------------ |
| Inbox         |                    | yes (greyed) |
| Starred       | show               | yes          |
| Snoozed       | show               | yes          |
| Important     | show               | no           |
| Sent          | show               | yes          |
| Scheduled     | show if unread     | yes          |
| Drafts        | show               | yes          |
| All Mail      | hide               | yes          |
| Spam          | hide               | yes          |
| Bin           | hide               | yes          |

| Categories | Show in label list | Show in message list |
| ---------- | ------------------ | -------------------- |
| Categories | show               |                      |
| Social     | show               | hide                 |
| Updates    | show               | hide                 |
| Forums     | show               | hide                 |
| Promotions | show               | hide                 |

| Categories                                             | Show in label list | Show in message list | Actions         | Show in IMAP |
| ------------------------------------------------------ | ------------------ | -------------------- | --------------- | ------------ |
| `/[Gmail]/Bin/Apple Mail To Do`                        | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Bin/Farandole`                               | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Bin/Personnel`                               | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Bin/Sent Messages`                           | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Corbeille/exclus`                            | show               | show                 | [remove] [edit] | yes          |
| `/[Imap]/Drafts`                                       | show               | show                 | [remove] [edit] | yes          |
| `/doctolib.creneau`                                    | show               | show                 | [remove] [edit] | yes          |
| `/meltingnotes`                                        | show               | show                 | [remove] [edit] | yes          |
| `/Professionnel`                                       | hide               | show                 | [remove] [edit] | yes          |
| `/Reçus`                                               | hide               | show                 | [remove] [edit] | yes          |
| `/toto`                                                | show               | show                 | [remove] [edit] | yes          |
| `/vern3`                                               | show               | show                 | [remove] [edit] | yes          |
| `      /recherche_locataire_2017_1`                    |                    | show                 | [remove] [edit] | yes          |
| `                                 /proposition_visite` |                    | show                 | [remove] [edit] | yes          |
| `      /recherche_locataire_2017_2`                    |                    | show                 | [remove] [edit] | yes          |
| `                                 /non_retenues`       |                    | show                 | [remove] [edit] | yes          |
| `                                 /proposition_visite` |                    | show                 | [remove] [edit] | yes          |
| `      /recherche_locataire_2017_3`                    |                    | show                 | [remove] [edit] | yes          |
| `                                 /proposition_visite` |                    | show                 | [remove] [edit] | yes          |

| missing                                                | ------------------ | -------------------- | --------------- | ------------ |
| ------------------------------------------------------ | ------------------ | -------------------- | --------------- | ------------ |
| `/Inbox`                                               | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]`                                             | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Drafts`                                      | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Spam`                                        | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Bin`                                         | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Corbeille`                                   | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Starred`                                     | show               | show                 | [remove] [edit] | yes          |
| `/[Gmail]/Sent Mail`                                   | show               | show                 | [remove] [edit] | yes          |

[https://support.mozilla.org/en-US/kb/thunderbird-and-gmail]
> Understanding Gmail labels and Thunderbird folders
> 
> Gmail uses a special implementation of IMAP. In this implementation, Gmail labels become Thunderbird folders. When you apply a label to a message in Gmail, Thunderbird creates a folder with the same name as the label and stores the message in that folder. Similarly, if you move a message to a folder in Thunderbird, Gmail will create a label with the folder name and assign it to the message.
> 
> If you copy a message to another folder, Gmail will still store only one message but apply both folder names as labels to it. Moving any copy of a message into the Trash will remove all labels from it, and it will no longer appear in any other folder. 

[https://support.mozilla.org/en-US/kb/thunderbird-and-gmail]
> There is also a set of special sub-folders for the [Gmail] folder:

> - All Mail: contains all the messages of your Gmail account, including sent and archived messages. Any messages that you see in the inbox will also appear in the [Gmail]/All Mail folder. (It is recommended to unsubscribe this folder.)
> - Drafts: contains draft messages.
> - Sent Mail: contains sent messages.
> - Spam: contains messages that were marked as spam (either by Gmail or Thunderbird).
> - Starred: contains messages that were starred (either by Gmail or Thunderbird).
> - Trash: contains deleted messages.
> - Important: contains messages that Gmail has flagged as “important”. (See Priority Inbox overview for more details about this Gmail feature.)


## 2025-02-11

### suppression des folders obsolètes

Dans thunderbird, unsubscribe:
- guillaume.raffy.work@gmail.com/vern3 and subs

Then in gmail web,
- deleted guillaume.raffy.work@gmail.com/vern3 label
  -> this implied the deletion of sub labels


same for:
- guillaume.raffy.work@gmail.com/Bin/*
- guillaume.raffy.work@gmail.com/toto
- guillaume.raffy.work@gmail.com/Corbeille/exclus

Removed duplicate Drafts in thunderbird by unsubscribing then subscribing again


## 2025-02-11

### suppression des folders obsolètes
